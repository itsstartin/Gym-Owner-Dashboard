from calendar import month_abbr
from datetime import date, datetime, time, timedelta

from django.db.models import Count, Sum
from django.db.models.functions import ExtractHour, ExtractWeekDay, TruncDate, TruncMonth
from django.utils import timezone

from members.models import Attendance, Member, MembershipPlan, RecentPayment


def calc_graph(user):
    return {
        "revenue": calc_revenue_graph(user),
        "weekly_attendance": calc_weekly_attendance_graph(user),
        "hourly_attendance": calc_hourly_attendance_graph(user),
        "member_growth": calc_member_growth(user),
    }


def calc_revenue_graph(user):
    month_starts = _month_starts(6)
    totals_by_month = {
        row["month"].date(): row["total"]
        for row in (
            RecentPayment.objects.filter(
                user=user,
                created_at__gte=_day_start(month_starts[0]),
                created_at__lt=_day_start(_next_month_start(month_starts[-1])),
            )
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(total=Sum("amount"))
        )
    }
    return {
        "labels": [f"{month_abbr[month.month]} {month.year}" for month in month_starts],
        "data": [totals_by_month.get(month, 0) for month in month_starts],
    }


def calc_weekly_attendance_graph(user):
    today = date.today()
    days = [today - timedelta(days=offset) for offset in range(6, -1, -1)]
    counts_by_day = {
        row["day"]: row["total"]
        for row in (
            Attendance.objects.filter(
                user=user,
                date__gte=_day_start(days[0]),
                date__lt=_day_start(today + timedelta(days=1)),
            )
            .annotate(day=TruncDate("date"))
            .values("day")
            .annotate(total=Count("id"))
        )
    }
    return {
        "labels": [day.strftime("%a") for day in days],
        "data": [counts_by_day.get(day, 0) for day in days],
    }


def calc_hourly_attendance_graph(user):
    today = date.today()
    start_date = today - timedelta(days=35)
    hours = list(range(6, 22))
    counts = {
        (row["hour"], row["weekday"]): row["total"]
        for row in (
            Attendance.objects.filter(
                user=user,
                date__gte=_day_start(start_date),
                date__lt=_day_start(today),
            )
            .annotate(hour=ExtractHour("date"), weekday=ExtractWeekDay("date"))
            .filter(hour__gte=6, hour__lte=21)
            .values("hour", "weekday")
            .annotate(total=Count("id"))
        )
    }

    return {
        "labels": [f"{hour:02d}:00" for hour in hours],
        "datasets": [
            {
                "name": "weekdays",
                "data": [sum(counts.get((hour, weekday), 0) for weekday in range(2, 7)) for hour in hours],
            },
            {
                "name": "weekends",
                "data": [counts.get((hour, 1), 0) + counts.get((hour, 7), 0) for hour in hours],
            },
        ],
    }


def calc_member_growth(user):
    month_starts = _month_starts(6)
    plans = list(MembershipPlan.objects.order_by("id")[:3])
    counts = {
        (row["membership_plan_id"], row["month"]): row["total"]
        for row in (
            Member.objects.filter(
                user=user,
                membership_plan__in=plans,
                membership_start_date__gte=month_starts[0],
                membership_start_date__lt=_next_month_start(month_starts[-1]),
            )
            .annotate(month=TruncMonth("membership_start_date"))
            .values("membership_plan_id", "month")
            .annotate(total=Count("id"))
        )
    }
    return {
        "labels": [f"{month_abbr[month.month]} {month.year}" for month in month_starts],
        "datasets": [
            {
                "name": plan.name,
                "data": [counts.get((plan.id, month), 0) for month in month_starts],
            }
            for plan in plans
        ],
    }


def _month_starts(count):
    today = date.today()
    year, month = today.year, today.month
    months = []
    for _ in range(count):
        months.append(date(year, month, 1))
        month -= 1
        if month == 0:
            year -= 1
            month = 12
    return list(reversed(months))


def _next_month_start(month_start):
    if month_start.month == 12:
        return date(month_start.year + 1, 1, 1)
    return date(month_start.year, month_start.month + 1, 1)


def _day_start(day):
    return timezone.make_aware(datetime.combine(day, time.min))
