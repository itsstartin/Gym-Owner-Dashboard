from django.conf import settings
from django.core.mail import send_mail
from dotenv import load_dotenv
import requests
import os
from members.models import Member

load_dotenv()

def send_member_link(member):
    link_header=os.getenv("CORS_ALLOWED_ORIGINS")
    link = f"{link_header}/member-access/{member.access_token}"
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept":"application/json",
        "api-key":os.getenv("BREVO_API_KEY"),
        "content-type":"application/json"
    }
    data = {
        "sender":{"email":os.getenv("EMAIL_SENDER")},
        "to":[{"email":member.email}],
        "subject":'Your Gym Access Link',
        "textContent":f"Use this link to mark attendance and for Payments: {link}",
    }
    response = requests.post(url, json=data, headers=headers)
    print("STATUS:",response.status_code)
    print("RESPONSE:",response.text)


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
