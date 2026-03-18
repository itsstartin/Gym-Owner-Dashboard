from django.conf import settings
from django.core.mail import send_mail

from members.models import Member


def send_member_link(member):
    link = f"http://localhost:5173/memberaccess/{member.access_token}"
    send_mail(
        subject='Your Gym Access Link',
        message=f"Use this link to mark attendance and for Payments: {link}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[member.email],
    )

def send_mail_overdue_member(data):
    member = Member.objects.get(id=data["id"])
    exp_date = data["membership_end_date"]
    overdue_amount=data["overdue_amount"]
    overdue_days=data["overdue_days"]
    send_mail(
        subject='Gym Payment Overdue Notification',
        message=f"Your membership expired in {exp_date} and have pending payments of {overdue_amount} for {overdue_days} days",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[member.email],
    )
