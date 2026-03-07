from django.db.models import Sum
from members.models import RecentPayment
from datetime import date


def calc_revenue(user):
    payments = RecentPayment.objects.filter(user=user)
    total_revenue = payments.aggregate(Sum('amount'))['amount__sum']
    today = date.today()
    payments_current_month = RecentPayment.objects.filter(
        user=user,
        created_at__month=today.month,
        created_at__year=today.year,
    )
    monthly_revenue = payments_current_month.aggregate(Sum('amount'))['amount__sum']
    calc_data = {
        "total_revenue": total_revenue,
        "month_revenue": monthly_revenue,
    }
    return calc_data


