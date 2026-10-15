from django.core.mail import send_mail
from dotenv import load_dotenv
import requests
import os
import hashlib
import uuid
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
from members.models import Member

load_dotenv()

def get_active_member_from_access_token(token):
    """Return a member only when its public bearer link is still usable."""
    try:
        token = uuid.UUID(str(token))
    except (TypeError, ValueError, AttributeError):
        return None
    return Member.objects.filter(
        access_token=token, access_token_expires_at__gt=timezone.now()
    ).first()


def public_link_request_is_rate_limited(request, token):
    """Apply a lightweight per-IP, per-link limit to public endpoints.

    Django's cache backend makes this work with the current stack; deployments
    using a shared cache get the limit across workers as well.
    """
    limit = max(getattr(settings, "PUBLIC_MEMBER_ACCESS_RATE_LIMIT", 30), 1)
    window = max(getattr(settings, "PUBLIC_MEMBER_ACCESS_RATE_WINDOW", 60), 1)
    ip_address = request.META.get("REMOTE_ADDR", "unknown")
    digest = hashlib.sha256(f"{ip_address}:{token}".encode()).hexdigest()
    key = f"public-member-link:{digest}"

    if cache.add(key, 1, timeout=window):
        return False
    return cache.incr(key) > limit


def member_access_link(member):
    if not member.access_token or not member.access_token_expires_at:
        raise ValueError("Cannot create a URL for a revoked attendance link.")
    return f"{settings.PUBLIC_APP_URL}/memberaccess/{member.access_token}"


def send_member_link(member):
    link = member_access_link(member)
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
    try:
        member = Member.objects.get(id=data["id"])
        exp_date = data["membership_end_date"]
        overdue_amount=data["overdue_amount"]
        overdue_days=data["overdue_days"]
        url = "https://api.brevo.com/v3/smtp/email"
        headers = {
        "accept":"application/json",
        "api-key":os.getenv("BREVO_API_KEY"),
        "content-type":"application/json"
        }
        data_json = {
            "sender":{"email":os.getenv("EMAIL_SENDER")},
            "to":[{"email":member.email}],
            "subject":'Gym Payment Overdue Notification',
            "textContent":f"Your membership expired in {exp_date} and have pending payments of {overdue_amount} for {overdue_days} days",
        }
        response = requests.post(url, json=data_json, headers=headers)
        print("STATUS:",response.status_code)
        print("RESPONSE:",response.text)
    except Exception as e:
        print("Email failed:",e)
