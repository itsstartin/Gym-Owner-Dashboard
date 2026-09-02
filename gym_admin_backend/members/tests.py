from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import date, datetime, time, timedelta
from rest_framework import status
from rest_framework.test import APIRequestFactory, force_authenticate

from members.models import Attendance, Member, MembershipPlan, RecentPayment
from members.serializer import MemberSerializer
from members.services.payment_calc import calc_member_overdue, calc_overdue_amount
from members.views import create_payment


class MemberStatusTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="owner", password="pass")
        self.plan = MembershipPlan.objects.create(name="Basic", plan_price=300)
        self.start_date = date.today() - timedelta(days=40)
        self.factory = APIRequestFactory()

    def create_member(self, name, phone_number, email, total_cash_paid=300, membership_start_date=None):
        return Member.objects.create(
            user=self.user,
            name=name,
            phone_number=phone_number,
            email=email,
            membership_plan=self.plan,
            total_cash_paid=total_cash_paid,
            membership_start_date=membership_start_date or self.start_date
        )

    def mark_attendance(self, member, attendance_date):
        attendance_time = timezone.make_aware(
            datetime.combine(attendance_date, time(hour=8))
        )
        return Attendance.objects.create(
            user=self.user,
            member=member,
            date=attendance_time
        )

    def test_member_is_inactive_when_membership_ended_without_later_attendance(self):
        member = self.create_member("Inactive Member", "+911111111111", "inactive@example.com")

        serializer = MemberSerializer(member)
        overdue = calc_member_overdue(member)

        self.assertEqual(serializer.data["status"], "inactive")
        self.assertEqual(overdue["overdue_days"], 0)
        self.assertEqual(overdue["overdue_amount"], "0.00")

    def test_member_is_expired_when_attendance_exists_after_membership_end(self):
        member = self.create_member("Expired Member", "+912222222222", "expired@example.com")
        membership_end_date = self.start_date + timedelta(days=30)
        self.mark_attendance(member, membership_end_date + timedelta(days=1))

        serializer = MemberSerializer(member)
        overdue = calc_member_overdue(member)

        self.assertEqual(serializer.data["status"], "expired")
        self.assertEqual(overdue["overdue_days"], 10)
        self.assertEqual(overdue["overdue_amount"], "100.00")

    def test_total_overdue_amount_excludes_inactive_members(self):
        self.create_member("Inactive Member", "+913333333333", "inactive-total@example.com")
        expired_member = self.create_member("Expired Member", "+914444444444", "expired-total@example.com")
        membership_end_date = self.start_date + timedelta(days=30)
        self.mark_attendance(expired_member, membership_end_date + timedelta(days=1))

        self.assertEqual(calc_overdue_amount(self.user), "100.00")

    def test_inactive_member_payment_renews_membership_from_payment_date(self):
        member = self.create_member("Renewed Member", "+915555555555", "renewed@example.com")
        request = self.factory.post(
            "/members/pay",
            {"member": member.id, "amount": 300, "payment_type": "cash"},
            format="json"
        )
        force_authenticate(request, user=self.user)

        response = create_payment(request)
        member.refresh_from_db()
        payment = RecentPayment.objects.get(member=member)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(member.membership_start_date, timezone.localtime(payment.created_at).date())
        self.assertEqual(member.total_cash_paid, 300)
        self.assertEqual(MemberSerializer(member).data["status"], "active")

    def test_active_member_payment_keeps_membership_start_date_and_adds_current_period_payments(self):
        active_start_date = date.today() - timedelta(days=10)
        member = self.create_member(
            "Active Member",
            "+916666666666",
            "active@example.com",
            total_cash_paid=300,
            membership_start_date=active_start_date
        )
        RecentPayment.objects.create(
            user=self.user,
            member=member,
            amount=300,
            payment_type="cash"
        )
        request = self.factory.post(
            "/members/pay",
            {"member": member.id, "amount": 150, "payment_type": "upi"},
            format="json"
        )
        force_authenticate(request, user=self.user)

        response = create_payment(request)
        member.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(member.membership_start_date, active_start_date)
        self.assertEqual(member.total_cash_paid, 450)
