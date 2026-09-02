from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import date, datetime, time, timedelta

from members.models import Attendance, Member, MembershipPlan
from members.serializer import MemberSerializer
from members.services.payment_calc import calc_member_overdue, calc_overdue_amount


class MemberStatusTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="owner", password="pass")
        self.plan = MembershipPlan.objects.create(name="Basic", plan_price=300)
        self.start_date = date.today() - timedelta(days=40)

    def create_member(self, name, phone_number, email):
        return Member.objects.create(
            user=self.user,
            name=name,
            phone_number=phone_number,
            email=email,
            membership_plan=self.plan,
            total_cash_paid=300,
            membership_start_date=self.start_date
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
