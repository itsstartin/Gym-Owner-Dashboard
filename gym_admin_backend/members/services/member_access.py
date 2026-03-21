from django.conf import settings
from django.core.mail import send_mail
from dotenv import load_dotenv
import os

from members.models import Member


def send_member_link(member):
    link_header=os.getenv("CORS_ALLOWED_ORIGINS")
    link = f"{link_header}/{member.access_token}"
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
    try:
        send_mail(
            subject='Gym Payment Overdue Notification',
            message=f"Your membership expired in {exp_date} and have pending payments of {overdue_amount} for {overdue_days} days",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[member.email],
        )
    except Exception as e:
        print("Email failed:",e)
