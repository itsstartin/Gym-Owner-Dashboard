from django.db.models import Count, Sum
from members.models import Attendance, Member, RecentPayment
from datetime import date


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

def calc_overdue_amount(user):
    members = Member.objects.filter(user=user)
    total_due_amount=0
    for obj in members:
        total_paid=obj.total_cash_paid
        plan_price = obj.membership_plan.plan_price
        current_validity=total_paid/plan_price
        today=date.today()
        start_date=obj.membership_start_date
        expected_validity=(today.year - start_date.year) * 12 + (today.month - start_date.month)
        if today.day < start_date.day:
            expected_validity=expected_validity-1
        if expected_validity > current_validity:
            due_validity=expected_validity-current_validity
            due_amount = due_validity * plan_price
            total_due_amount=total_due_amount + due_amount
    return total_due_amount

def calc_advance_amount(user):
    members = Member.objects.filter(user=user)
    total_advance_amount=0
    for obj in members:
        total_paid=obj.total_cash_paid
        plan_price = obj.membership_plan.plan_price
        current_validity=total_paid/plan_price
        today=date.today()
        start_date=obj.membership_start_date
        expected_validity=(today.year - start_date.year) * 12 + (today.month - start_date.month)
        if today.day < start_date.day:
            expected_validity=expected_validity-1
        if expected_validity < current_validity:
            advance_validity = current_validity - expected_validity
            advance_amount = advance_validity * plan_price
            total_advance_amount = total_advance_amount + advance_amount
    return total_advance_amount

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
    


