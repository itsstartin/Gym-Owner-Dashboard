import random
from datetime import timedelta, date, time
from django.utils import timezone
from django.contrib.auth.models import User
from django.db.models import Sum
from members.models import Member, MembershipPlan, RecentPayment, Attendance

# =========================
# ✅ USER
# =========================
user = User.objects.get(username='salim')

# =========================
# ✅ PLANS
# =========================
basic = MembershipPlan.objects.get(name='Basic')
premium = MembershipPlan.objects.get(name='Premium')
vip = MembershipPlan.objects.get(name='VIP')

plans = [basic, premium, vip]

# =========================
# ✅ MEMBERS LIST
# =========================
names = [
    "Arjun Nair", "Rahul Das", "Vishnu Kumar", "Aditya Menon",
    "Sanjay Pillai", "Rohit Sharma", "Kiran Varma", "Ajay Krishnan",
    "Deepak Mohan", "Anil Joseph", "Nikhil Raj", "Akhil S",
    "Manoj Kumar", "Sreejith P", "Abhishek R", "Gokul Krishna",
    "Faisal K", "Shyam Lal", "Vivek Anand", "Pranav M"
]

domains = ["gmail.com", "yahoo.com", "outlook.com"]

# =========================
# 🧹 CLEAN OLD DATA
# =========================
Member.objects.filter(user=user).delete()
RecentPayment.objects.filter(user=user).delete()
Attendance.objects.filter(user=user).delete()

today = date.today()

# =========================
# 🚀 CREATE DATA
# =========================
for name in names:
    plan = random.choice(plans)
    start_date = today - timedelta(days=random.randint(0, 180))

    phone = f"+91{random.randint(6000000000, 9999999999)}"
    email = name.lower().replace(" ", "") + str(random.randint(1, 99)) + "@" + random.choice(domains)

    member = Member.objects.create(
        user=user,
        name=name,
        phone_number=phone,
        email=email,
        membership_plan=plan,
        membership_start_date=start_date,
        total_cash_paid=0.0
    )

    # =========================
    # 💰 PAYMENT LOGIC (FINAL FIX)
    # =========================
    months_active = (today - start_date).days // 30

    payment_behavior = random.choice(["perfect", "advance", "defaulter"])

    if payment_behavior == "perfect":
        months_paid = months_active + 1

    elif payment_behavior == "advance":
        months_paid = months_active + 1 + random.randint(1, 3)

    else:  # defaulter
        months_paid = random.randint(0, months_active)

    for m in range(months_paid):

        payment_date = start_date + timedelta(days=m * 30)

        # ❗ NEVER FUTURE DATE
        if payment_date > today:
            payment_date = today - timedelta(days=random.randint(0, 5))

        RecentPayment.objects.create(
            user=user,
            member=member,
            amount=plan.plan_price,
            payment_type=random.choice(['cash', 'upi', 'card']),
            created_at=timezone.make_aware(
                timezone.datetime.combine(payment_date, timezone.datetime.min.time())
            )
        )

    # =========================
    # 🏋️ ATTENDANCE LOGIC
    # =========================
    total_days = (today - start_date).days

    for d in range(total_days):
        current_day = start_date + timedelta(days=d)

        behavior = random.choice(["regular", "average", "lazy"])
        prob = 0.8 if behavior == "regular" else 0.5 if behavior == "average" else 0.2

        if random.random() < prob:

            session_type = random.choice(["morning", "evening", "random"])

            if session_type == "morning":
                hour = random.randint(5, 9)
            elif session_type == "evening":
                hour = random.randint(17, 21)
            else:
                hour = random.randint(6, 22)

            minute = random.randint(0, 59)

            attendance_time = timezone.make_aware(
                timezone.datetime.combine(current_day, time(hour, minute))
            )

            Attendance.objects.create(
                user=user,
                member=member,
                date=attendance_time
            )

# =========================
# 🔥 UPDATE TOTAL CASH PAID
# =========================
for member in Member.objects.filter(user=user):
    total = RecentPayment.objects.filter(member=member).aggregate(
        total=Sum('amount')
    )['total'] or 0

    member.total_cash_paid = total
    member.save()

print("✅ FINAL realistic data created successfully for 'salim'")