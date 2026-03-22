from datetime import timedelta
from django.utils import timezone

from members.models import Attendance, Member, Notification

def check_inactive_members(user):
    members=Member.objects.filter(user=user)
    today = timezone.now().date()
    for member in members:
        last_attendance = Attendance.objects.filter(member=member).order_by('-date').first()
        if not last_attendance:
            continue
        days_absent = (today - last_attendance.date.date()).days
        if days_absent < 5:
            continue
        recent_notification_exists = Notification.objects.filter(
            user=user,
            member=member,
            type="inactive",
            created_at__gte=timezone.now() - timedelta(days=5)
        ).exists()
        if not recent_notification_exists:
            Notification.objects.create(
                user=user,
                member=member,
                type="inactive",
                message=f"{member.name} has not attended for {days_absent} days"
            )
        
def check_expired_members(user):
    today=timezone.now().date()
    members=Member.objects.filter(user=user)
    for member in members:
        total_paid=member.total_cash_paid
        plan_price = member.membership_plan.plan_price
        current_validity=total_paid/plan_price
        current_validity=int(current_validity * 30)
        start_date=member.membership_start_date
        expected_validity_diff= today - start_date
        expected_validity= expected_validity_diff.days
        overdue_validity = 0
        if not expected_validity > current_validity:
            continue
        overdue_validity=expected_validity-current_validity
        exists = Notification.objects.filter(
            user=user,
            member=member,
            type="expired"
        ).exists()
        if exists:
            continue
        Notification.objects.create(
            user=user,
            member=member,
            type="expired",
            message=f"{member.name}'s membership expired {overdue_validity} days ago"
        )

