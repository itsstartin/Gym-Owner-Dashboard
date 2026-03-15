from django.conf import settings
from django.core.mail import send_mail


def send_member_link(member):
    link = f"http://localhost:5173/memberaccess/{member.access_token}"
    send_mail(
        subject='Your Gym Access Link',
        message=f"Use this link to mark attendance and for Payments: {link}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[member.email],
    )
