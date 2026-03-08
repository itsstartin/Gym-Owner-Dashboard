from django.db.models import Count, Sum
from members.models import Attendance, Member, RecentPayment
from datetime import date


def calc_data(user):
    payments = RecentPayment.objects.filter(user=user)
    total_payments_count = payments.aggregate(Count('id'))['id__count']
    total_revenue = payments.aggregate(Sum('amount'))['amount__sum']
    today = date.today()
    payments_current_month = RecentPayment.objects.filter(
        user=user,
        created_at__month=today.month,
        created_at__year=today.year,
    )
    monthly_revenue = payments_current_month.aggregate(Sum('amount'))['amount__sum']
    members = Member.objects.filter(user=user)
    total_due_amount=0
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
        if expected_validity > current_validity:
            due_validity=expected_validity-current_validity
            due_amount = due_validity * plan_price
            total_due_amount=total_due_amount + due_amount
        elif expected_validity < current_validity:
            advance_validity = current_validity - expected_validity
            advance_amount = advance_validity * plan_price
            total_advance_amount = total_advance_amount + advance_amount
    attendances = Attendance.objects.filter(user=user,date__month=today.month,date__year=today.year)
    month_att_count = attendances.aggregate(Count('id'))['id__count']
    month_att_avg = month_att_count / today.day
    calc_data = {
        "payment_count":total_payments_count,
        "total_revenue": total_revenue,
        "month_revenue": monthly_revenue,
        "overdue_amount":total_due_amount,
        "advance_amount":total_advance_amount,
        "month_att_avg":month_att_avg
    }
    return calc_data




