from django.db.models import Count, Sum
from members.models import Attendance, Member, RecentPayment
from datetime import date , timedelta


def calc_data(user):
    total_payments_count = calc_payment_count(user)
    total_revenue = calc_total_revenue(user)
    monthly_revenue = calc_monthly_revenue(user)
    total_due_amount=calc_overdue_amount(user)
    total_advance_amount=calc_advance_amount(user)
    month_att_avg = calc_month_att_avg(user)
    members_count = calc_members_count(user)
    today_att_count = calc_att_today(user)
    calc_data = {
        "payment_count":total_payments_count,
        "total_revenue": total_revenue,
        "month_revenue": monthly_revenue,
        "overdue_amount":total_due_amount,
        "advance_amount":total_advance_amount,
        "month_att_avg":month_att_avg,
        "members_count":members_count,
        "today_att_count":today_att_count,
    }
    return calc_data

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
    today=date.today()
    for obj in members:
        total_paid=obj.total_cash_paid
        plan_price = obj.membership_plan.plan_price
        current_validity=total_paid/plan_price
        current_validity=int(current_validity * 30)
        start_date=obj.membership_start_date
        expected_validity_diff= today - start_date
        expected_validity= expected_validity_diff.days
        if expected_validity > current_validity:
            due_validity=expected_validity-current_validity
            due_amount = ( due_validity / 30 ) * plan_price
            total_due_amount=total_due_amount + due_amount
    return f"{total_due_amount:.2f}"

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
    today=date.today()
    total_paid=member.total_cash_paid
    plan_price = member.membership_plan.plan_price
    current_validity=total_paid/plan_price
    current_validity=int(current_validity * 30)
    start_date=member.membership_start_date
    end_date=start_date + timedelta(days=current_validity)
    expected_validity_diff= today - start_date
    expected_validity= expected_validity_diff.days
    overdue_validity = 0
    overdue_amount = 0.0
    if expected_validity > current_validity:
        overdue_validity=expected_validity-current_validity
        overdue_amount = ( overdue_validity / 30 ) * plan_price
    return {
        'overdue_days':overdue_validity,
        'overdue_amount':f"{overdue_amount:.2f}",
        'membership_end_date':end_date
    }


    


