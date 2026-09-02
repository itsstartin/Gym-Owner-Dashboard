from datetime import timedelta
from django.utils import timezone

from members.models import Attendance, Member, Notification
from members.services.payment_calc import get_member_payment_status

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
    members=Member.objects.filter(user=user)
    for member in members:
        data = get_member_payment_status(member, today=timezone.now().date())
        if data["status"] != "expired":
            continue
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
            message=f"{member.name}'s membership expired {data['overdue_days']} days ago"
        )
