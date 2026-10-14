from datetime import date

from members.models import Attendance
from members.services.payment_calc import get_member_payment_status


def get_member_health(member, payment_status=None, today=None):
    """Return a concise, explainable health assessment for a member."""
    if today is None:
        today = date.today()

    payment_status = payment_status or get_member_payment_status(member, today=today)
    days_remaining = (payment_status["membership_end_date"] - today).days
    last_attendance_date = _get_last_attendance_date(member)
    score = 100
    reasons = []

    payment_penalties = {
        "active": 0,
        "due": 30,
        "inactive": 45,
        "expired": 60,
    }
    status = payment_status["status"]
    score -= payment_penalties.get(status, 30)

    if status == "active":
        reasons.append("Payments are current")
    elif status == "due":
        reasons.append(f"Payment is due in {max(days_remaining, 0)} days")
    elif status == "inactive":
        reasons.append("Membership is inactive")
    else:
        reasons.append("Membership has expired")

    if last_attendance_date is None:
        score -= 15
        reasons.append("No attendance recorded")
    else:
        days_since_attendance = max((today - last_attendance_date).days, 0)
        if days_since_attendance <= 3:
            if days_since_attendance == 0:
                reasons.append("Attended today")
            elif days_since_attendance == 1:
                reasons.append("Last attended yesterday")
            else:
                reasons.append(f"Last attended {days_since_attendance} days ago")
        elif days_since_attendance <= 7:
            score -= 10
            reasons.append(f"No attendance in {days_since_attendance} days")
        else:
            score -= 25
            reasons.append(f"No attendance in {days_since_attendance} days")

    if days_remaining <= 0:
        score -= 15
        reasons.append(
            "Membership ends today"
            if days_remaining == 0
            else f"Membership ended {abs(days_remaining)} days ago"
        )
    elif days_remaining <= 3:
        score -= 15
        reasons.append(f"Membership ends in {days_remaining} days")
    elif days_remaining <= 7:
        score -= 5
        reasons.append(f"Membership ends in {days_remaining} days")
    else:
        reasons.append(f"{days_remaining} membership days remaining")

    score = max(0, min(100, score))
    if score >= 80:
        label = "Healthy"
    elif score >= 60:
        label = "Needs attention"
    else:
        label = "At risk"

    return {
        "score": score,
        "label": label,
        "reasons": reasons,
        "days_remaining": days_remaining,
        "is_at_risk": score < 60,
    }


def _get_last_attendance_date(member):
    last_attendance = getattr(member, "last_attendance_date", None)
    if not hasattr(member, "last_attendance_date"):
        last_attendance = (
            Attendance.objects.filter(member=member)
            .order_by("-date")
            .values_list("date", flat=True)
            .first()
        )

    return last_attendance.date() if last_attendance else None
