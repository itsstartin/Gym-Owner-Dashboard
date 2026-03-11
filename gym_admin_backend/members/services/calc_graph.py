from datetime import date , timedelta
from calendar import month_abbr
from django.db.models import Sum 
from members.models import Attendance, RecentPayment, Member, MembershipPlan

def calc_graph(user):
    revenue = calc_revenue_graph(user)
    weekly_attendance = calc_weekly_attendance_graph(user)
    hourly_attendance = calc_hourly_attendance_graph(user)
    member_growth = calc_member_growth(user)
    return {
        "revenue":revenue,
        "weekly_attendance":weekly_attendance,
        "hourly_attendance": hourly_attendance,
        "member_growth": member_growth,
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

def calc_hourly_attendance_graph(user):
    today = date.today()
    # We consider the last 5 weeks (35 days) before today, excluding today itself.
    start_date = today - timedelta(days=35)
    end_date = today - timedelta(days=1)

    # Hours from 6:00 to 21:00 inclusive
    hours = list(range(6, 22))
    hour_labels = [f"{hour:02d}:00" for hour in hours]

    # Initialize counters for weekdays and weekends
    weekday_counts = {hour: 0 for hour in hours}
    weekend_counts = {hour: 0 for hour in hours}

    # Fetch all attendance records for the user in the desired date range
    attendances = Attendance.objects.filter(
        user=user,
        date__date__gte=start_date,
        date__date__lte=end_date,
    )

    for attendance in attendances:
        attendance_datetime = attendance.date
        hour = attendance_datetime.hour

        # Only count attendances within the 6:00–21:00 window
        if hour not in weekday_counts:
            continue

        # Python's weekday(): Monday=0, Sunday=6
        if attendance_datetime.weekday() >= 5:
            weekend_counts[hour] += 1
        else:
            weekday_counts[hour] += 1

    weekday_data = [weekday_counts[hour] for hour in hours]
    weekend_data = [weekend_counts[hour] for hour in hours]

    datasets = [{
        "name":'weekdays',
        "data":weekday_data
    }]
    datasets.append(
        {
            "name": 'weekends',
            "data": weekend_data,
        }
    )
    return {
        "labels": hour_labels,
        "datasets":datasets
    }

def calc_member_growth(user):
    today = date.today()
    labels = []

    # Build month labels for the current month and previous 5 months
    year = today.year
    month = today.month
    for _ in range(6):
        labels.append(f"{month_abbr[month]} {year}")
        month -= 1
        if month == 0:
            month = 12
            year -= 1
    labels.reverse()

    # Determine the exact month ranges corresponding to labels
    # Recompute year/month sequence from the earliest label
    # Start from the month/year that corresponds to labels[0]
    earliest_label = labels[0].split()
    start_month = list(month_abbr).index(earliest_label[0])
    start_year = int(earliest_label[1])

    month_ranges = []
    year = start_year
    month = start_month
    for _ in range(6):
        month_start = date(year, month, 1)
        if month == 12:
            next_month_start = date(year + 1, 1, 1)
        else:
            next_month_start = date(year, month + 1, 1)
        month_ranges.append((month_start, next_month_start))
        month += 1
        if month == 13:
            month = 1
            year += 1

    # Get up to three membership plans (e.g. Basic, VIP, Premium)
    plans = list(MembershipPlan.objects.all().order_by("id")[:3])

    datasets = []
    for plan in plans:
        counts = []
        for month_start, next_month_start in month_ranges:
            count = Member.objects.filter(
                user=user,
                membership_plan=plan,
                membership_start_date__gte=month_start,
                membership_start_date__lt=next_month_start,
            ).count()
            counts.append(count)
        datasets.append(
            {
                "name": plan.name,
                "data": counts,
            }
        )

    return {
        "labels": labels,
        "datasets": datasets,
    }
