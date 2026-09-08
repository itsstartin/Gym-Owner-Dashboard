from datetime import date, datetime, time, timedelta

from django.db.models import Count, Sum
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone

from members.models import Attendance, RecentPayment


def calc_percent_diff_data(user):
    return {
        "month_revenue_percent_diff": calc_month_revenue_percent_diff(user),
        "today_att_percent_diff": calc_today_att_percent_diff(user),
    }


def calc_month_revenue_percent_diff(user):
    today = date.today()
    current_month = date(today.year, today.month, 1)
    previous_month = _previous_month_start(current_month)
    next_month = _next_month_start(current_month)
    totals = {
        row["month"].date(): row["total"]
        for row in (
            RecentPayment.objects.filter(
                user=user,
                created_at__gte=_day_start(previous_month),
                created_at__lt=_day_start(next_month),
            )
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(total=Sum("amount"))
        )
    }
    previous_total = totals.get(previous_month, 0)
    current_total = totals.get(current_month, 0)
    if previous_total == 0:
        return 0
    return f"{((current_total - previous_total) / previous_total) * 100:.2f}"


def calc_today_att_percent_diff(user):
    today = date.today()
    yesterday = today - timedelta(days=1)
    counts = {
        row["day"]: row["total"]
        for row in (
            Attendance.objects.filter(
                user=user,
                date__gte=_day_start(yesterday),
                date__lt=_day_start(today + timedelta(days=1)),
            )
            .annotate(day=TruncDate("date"))
            .values("day")
            .annotate(total=Count("id"))
        )
    }
    yesterday_count = counts.get(yesterday, 0)
    today_count = counts.get(today, 0)
    if yesterday_count == 0:
        return 0
    return f"{((today_count - yesterday_count) / yesterday_count) * 100:.2f}"


def _previous_month_start(month_start):
    if month_start.month == 1:
        return date(month_start.year - 1, 12, 1)
    return date(month_start.year, month_start.month - 1, 1)


def _next_month_start(month_start):
    if month_start.month == 12:
        return date(month_start.year + 1, 1, 1)
    return date(month_start.year, month_start.month + 1, 1)


def _day_start(day):
    return timezone.make_aware(datetime.combine(day, time.min))
