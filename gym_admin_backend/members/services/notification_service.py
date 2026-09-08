from datetime import timedelta

from django.db.models import Max
from django.utils import timezone

from members.models import Member, Notification
from members.services.payment_calc import get_member_payment_status


def check_inactive_members(user, members=None):
    today = timezone.now().date()
    members = _members_with_last_attendance(user, members)
    recent_inactive_member_ids = set(
        Notification.objects.filter(
            user=user,
            type="inactive",
            created_at__gte=timezone.now() - timedelta(days=5),
        ).values_list("member_id", flat=True)
    )
    notifications = []
    for member in members:
        last_attendance = member.last_attendance_date
        if not last_attendance:
            continue
        days_absent = (today - last_attendance.date()).days
        if days_absent < 5 or member.id in recent_inactive_member_ids:
            continue
        notifications.append(
            Notification(
                user=user,
                member=member,
                type="inactive",
                message=f"{member.name} has not attended for {days_absent} days",
            )
        )
    Notification.objects.bulk_create(notifications)


def check_expired_members(user, members=None):
    today = timezone.now().date()
    members = _members_with_last_attendance(user, members)
    expired_notification_member_ids = set(
        Notification.objects.filter(user=user, type="expired").values_list("member_id", flat=True)
    )
    notifications = []
    for member in members:
        status_data = get_member_payment_status(member, today=today)
        if (
            status_data["status"] != "expired"
            or member.id in expired_notification_member_ids
        ):
            continue
        notifications.append(
            Notification(
                user=user,
                member=member,
                type="expired",
                message=f"{member.name}'s membership expired {status_data['overdue_days']} days ago",
            )
        )
    Notification.objects.bulk_create(notifications)


def _members_with_last_attendance(user, members):
    if members is not None:
        return members
    return list(
        Member.objects.filter(user=user)
        .select_related("membership_plan")
        .annotate(last_attendance_date=Max("attendance__date"))
    )
