from datetime import date, datetime, time, timedelta

from django.db.models import Count, Max, Q, Sum
from django.utils import timezone

from members.models import Attendance, Member, RecentPayment


def get_member_payment_status(member, today=None):
    if today is None:
        today = date.today()

    total_paid = member.total_cash_paid
    plan_price = member.membership_plan.plan_price
    current_validity = int((total_paid / plan_price) * 30)
    start_date = member.membership_start_date
    end_date = start_date + timedelta(days=current_validity)
    expected_validity = (today - start_date).days
    overdue_validity = 0
    overdue_amount = 0.0
    status = "active"

    if 0 < (current_validity - expected_validity) < 4:
        status = "due"
    elif expected_validity > current_validity:
        if hasattr(member, "last_attendance_date"):
            last_attendance_date = member.last_attendance_date
            attended_after_membership_end = (
                last_attendance_date is not None
                and last_attendance_date.date() > end_date
            )
        else:
            attended_after_membership_end = Attendance.objects.filter(
                member=member,
                date__date__gt=end_date
            ).exists()
        status = "expired" if attended_after_membership_end else "inactive"

        if status == "expired":
            overdue_validity = expected_validity - current_validity
            overdue_amount = (overdue_validity / 30) * plan_price

    return {
        "status": status,
        "overdue_days": overdue_validity,
        "overdue_amount": f"{overdue_amount:.2f}",
        "membership_end_date": end_date
    }


def calc_data(user):
    """Return dashboard statistics with three database queries, regardless of member count."""
    today = date.today()
    month_start_day = date(today.year, today.month, 1)
    next_month_start_day = _next_month_start(month_start_day)
    month_start = _day_start(month_start_day)
    next_month_start = _day_start(next_month_start_day)
    today_start = _day_start(today)
    tomorrow_start = _day_start(today + timedelta(days=1))

    payment_totals = RecentPayment.objects.filter(user=user).aggregate(
        payment_count=Count("id"),
        total_revenue=Sum("amount"),
        month_revenue=Sum(
            "amount",
            filter=Q(created_at__gte=month_start, created_at__lt=next_month_start),
        ),
    )
    attendance_totals = Attendance.objects.filter(user=user).aggregate(
        month_count=Count(
            "id",
            filter=Q(date__gte=month_start, date__lt=next_month_start),
        ),
        today_count=Count(
            "id",
            filter=Q(date__gte=today_start, date__lt=tomorrow_start),
        ),
    )
    members = list(
        Member.objects.filter(user=user)
        .select_related("membership_plan")
        .annotate(last_attendance_date=Max("attendance__date"))
    )
    overdue_amount, advance_amount, retention = _calc_member_dashboard_summaries(members, today)

    return {
        "payment_count": payment_totals["payment_count"],
        "total_revenue": payment_totals["total_revenue"],
        "month_revenue": payment_totals["month_revenue"],
        "overdue_amount": overdue_amount,
        "advance_amount": advance_amount,
        "month_att_avg": f"{attendance_totals['month_count'] / today.day:.2f}",
        "members_count": len(members),
        "today_att_count": attendance_totals["today_count"],
        "retention": retention,
    }


def _day_start(day):
    return timezone.make_aware(datetime.combine(day, time.min))


def _next_month_start(month_start):
    if month_start.month == 12:
        return date(month_start.year + 1, 1, 1)
    return date(month_start.year, month_start.month + 1, 1)


def _calc_member_dashboard_summaries(members, today):
    # Imported here to avoid a circular import: Member Health uses payment status.
    from members.services.member_health import get_member_health

    total_due_amount = 0.0
    total_advance_amount = 0.0
    at_risk_count = 0
    inactive_count = 0
    expiring_soon_count = 0

    for member in members:
        status_data = get_member_payment_status(member, today=today)
        if status_data["status"] == "expired":
            total_due_amount += float(status_data["overdue_amount"])

        health = get_member_health(member, payment_status=status_data, today=today)
        if health["is_at_risk"]:
            at_risk_count += 1
        if status_data["status"] == "inactive":
            inactive_count += 1
        if 0 <= health["days_remaining"] <= 7:
            expiring_soon_count += 1

        current_validity = int((member.total_cash_paid / member.membership_plan.plan_price) * 30)
        expected_validity = (today - member.membership_start_date).days
        if expected_validity < current_validity:
            total_advance_amount += (
                (current_validity - expected_validity) / 30
            ) * member.membership_plan.plan_price

    retention = {
        "at_risk_count": at_risk_count,
        "inactive_count": inactive_count,
        "expiring_soon_count": expiring_soon_count,
        "suggested_actions": [
            {
                "id": "at_risk",
                "title": "Review at-risk members",
                "description": "Prioritize a check-in or payment follow-up.",
                "count": at_risk_count,
                "filter": {"health": "at_risk"},
            },
            {
                "id": "inactive",
                "title": "Reconnect inactive members",
                "description": "Invite members who have stopped attending back.",
                "count": inactive_count,
                "filter": {"status": "inactive"},
            },
            {
                "id": "expiring_soon",
                "title": "Reach out before expiry",
                "description": "Help members renew within the next seven days.",
                "count": expiring_soon_count,
                "filter": {"expiry": "expiring_soon"},
            },
        ],
    }

    return f"{total_due_amount:.2f}", f"{total_advance_amount:.2f}", retention

def calc_total_revenue(user):
    payments = RecentPayment.objects.filter(user=user)
    total_revenue = payments.aggregate(Sum('amount'))['amount__sum']
    return total_revenue

def calc_payment_count(user):
    payments = RecentPayment.objects.filter(user=user)
    total_payments_count = payments.aggregate(Count('id'))['id__count']
    return total_payments_count

def calc_monthly_revenue(user):
    today = date.today()
    payments_current_month = RecentPayment.objects.filter(
        user=user,
        created_at__month=today.month,
        created_at__year=today.year,
    )
    monthly_revenue = payments_current_month.aggregate(Sum('amount'))['amount__sum']
    return monthly_revenue

def calc_month_att_avg(user):
    today = date.today()
    attendances = Attendance.objects.filter(user=user,date__month=today.month,date__year=today.year)
    month_att_count = attendances.aggregate(Count('id'))['id__count']
    month_att_avg = month_att_count / today.day
    return f"{month_att_avg:.2f}"

def calc_members_count(user):
    members = Member.objects.filter(user=user)
    total_members_count = members.aggregate(Count('id'))['id__count']
    return total_members_count

def calc_att_today(user):
    today = date.today()
    attendances = Attendance.objects.filter(user=user,date__date=today)
    today_att_count = attendances.aggregate(Count('id'))['id__count']
    return today_att_count

def calc_overdue_amount(user):
    members = Member.objects.filter(user=user)
    total_due_amount=0
    for obj in members:
        data = get_member_payment_status(obj)
        if data["status"] == "expired":
            total_due_amount=total_due_amount + float(data["overdue_amount"])
    return f"{total_due_amount:.2f}"

def calc_member_period_payment_total(user, member):
    total_cash_paid = RecentPayment.objects.filter(
        user=user,
        member=member,
        created_at__gte=_day_start(member.membership_start_date),
    ).aggregate(total=Sum('amount'))['total'] or 0.0
    return total_cash_paid

def calc_member_plan_transfer_amount(member, today=None):
    if today is None:
        today = date.today()

    data = get_member_payment_status(member, today=today)
    remaining_days = (data["membership_end_date"] - today).days
    if remaining_days < 0:
        remaining_days = 0

    remaining_amount = (remaining_days / 30) * member.membership_plan.plan_price
    return remaining_amount

def calc_advance_amount(user):
    members = Member.objects.filter(user=user)
    total_advance_amount=0
    today=date.today()
    for obj in members:
        total_paid=obj.total_cash_paid
        plan_price = obj.membership_plan.plan_price
        current_validity=total_paid/plan_price
        current_validity=int(current_validity * 30)
        start_date=obj.membership_start_date
        expected_validity_diff= today - start_date
        expected_validity= expected_validity_diff.days
        if expected_validity < current_validity:
            advance_validity = current_validity - expected_validity
            advance_amount = (advance_validity / 30 ) * plan_price
            total_advance_amount = total_advance_amount + advance_amount
    return f"{total_advance_amount:.2f}"

def calc_member_overdue(member):
    return get_member_payment_status(member)


    
