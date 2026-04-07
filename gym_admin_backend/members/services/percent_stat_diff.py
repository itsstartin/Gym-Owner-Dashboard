from datetime import date, timedelta
from django.db.models import Sum
from members.models import Attendance, RecentPayment

def calc_percent_diff_data(user):
    month_revenue_percent_diff = calc_month_revenue_percent_diff(user)
    today_att_percent_diff = calc_today_att_percent_diff(user)
    return {
        "month_revenue_percent_diff":month_revenue_percent_diff,
        "today_att_percent_diff":today_att_percent_diff
    }

def calc_month_revenue_percent_diff(user):
    today = date.today()  
    totals = []   
    year = today.year
    month = today.month
    for _ in range(2):
        month_start = date(year, month, 1)
        if month == 12:
            next_month_start = date(year + 1, 1, 1)
        else:
            next_month_start = date(year, month + 1, 1)
        total = (
            RecentPayment.objects
            .filter(
                user=user,
                created_at__gte=month_start,
                created_at__lt=next_month_start,
            )
            .aggregate(total=Sum('amount'))['total']
            or 0
        )
        totals.append(total)
        month -= 1
        if month == 0:
            month = 12
            year -= 1
    totals.reverse()
    if totals[0] == 0:
        return 0
    month_revenue_percent_diff = ((totals[1] - totals[0]) / totals[0]) * 100
    return month_revenue_percent_diff

def calc_today_att_percent_diff(user):
    today = date.today()
    attendances = Attendance.objects.filter(user=user,date__date=today)
    today_att_count = attendances.count()
    yesterday = today - timedelta(days=1)
    attendances_yesterday = Attendance.objects.filter(user=user,date__date=yesterday)
    yesterday_att_count = attendances_yesterday.count()
    if yesterday_att_count == 0:
        return 0
    today_att_percent_diff = ((today_att_count - yesterday_att_count) / yesterday_att_count) * 100
    return today_att_percent_diff