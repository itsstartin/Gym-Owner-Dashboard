from datetime import date , timedelta
from calendar import month_abbr
from django.db.models import Sum 
from members.models import Attendance, RecentPayment

def calc_graph(user):
    revenue = calc_revenue_graph(user)
    weekly_attendance = calc_weekly_attendance_graph(user)
    return {
        "revenue":revenue,
        "weekly_attendance":weekly_attendance
    }

def calc_revenue_graph(user):
    today = date.today()
    labels = []  
    totals = []   
    year = today.year
    month = today.month
    for _ in range(6):
        labels.append(f"{month_abbr[month]} {year}")
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
    labels.reverse()
    totals.reverse()
    return {
        "labels":labels,
        "data":totals
    }

def calc_weekly_attendance_graph(user):
    today = date.today()
    day_labels = []  
    day_counts = []  
    for offset in range(6, -1, -1):
        day = today - timedelta(days=offset)
        label = day.strftime('%a')
        day_labels.append(label)
        count = Attendance.objects.filter(user=user, date__date=day).count()
        day_counts.append(count)
    return {
        "labels":day_labels,
        "data":day_counts
    }
