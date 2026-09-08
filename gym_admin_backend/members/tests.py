from django.test import TestCase
from django.db.models import Max
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import date, datetime, time, timedelta
from rest_framework import status
from rest_framework.test import APIRequestFactory, force_authenticate

from members.models import Attendance, Member, MembershipPlan, RecentPayment
from members.serializer import MemberSerializer
from members.services.payment_calc import calc_data, calc_member_overdue, calc_overdue_amount
from members.services.calc_graph import calc_graph
from members.views import create_payment, get_payments, update_member


class MemberStatusTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="owner", password="pass")
        self.plan = MembershipPlan.objects.create(name="Basic", plan_price=300)
        self.premium_plan = MembershipPlan.objects.create(name="Premium", plan_price=600)
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

    def test_plan_change_carries_remaining_value_to_new_plan_from_today(self):
        active_start_date = date.today() - timedelta(days=10)
        member = self.create_member(
            "Plan Change Member",
            "+917777777777",
            "plan-change@example.com",
            total_cash_paid=300,
            membership_start_date=active_start_date
        )
        request = self.factory.patch(
            f"/members/update/{member.id}",
            {"membership_plan_id": self.premium_plan.id},
            format="json"
        )
        force_authenticate(request, user=self.user)

        response = update_member(request, member.id)
        member.refresh_from_db()
        serialized_member = MemberSerializer(member).data
        overdue = calc_member_overdue(member)

        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(member.membership_plan, self.premium_plan)
        self.assertEqual(member.membership_start_date, date.today())
        self.assertAlmostEqual(member.total_cash_paid, 200)
        self.assertEqual(overdue["membership_end_date"], date.today() + timedelta(days=10))
        self.assertEqual(serialized_member["status"], "active")

    def test_expired_member_cannot_change_plan(self):
        member = self.create_member("Expired Locked Member", "+918888888888", "expired-locked@example.com")
        membership_end_date = self.start_date + timedelta(days=30)
        self.mark_attendance(member, membership_end_date + timedelta(days=1))
        request = self.factory.patch(
            f"/members/update/{member.id}",
            {"membership_plan_id": self.premium_plan.id},
            format="json"
        )
        force_authenticate(request, user=self.user)

        response = update_member(request, member.id)
        member.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(member.membership_plan, self.plan)

    def test_expired_member_can_update_contact_details(self):
        member = self.create_member("Expired Contact Member", "+919999999999", "expired-contact@example.com")
        membership_end_date = self.start_date + timedelta(days=30)
        self.mark_attendance(member, membership_end_date + timedelta(days=1))
        request = self.factory.patch(
            f"/members/update/{member.id}",
            {"email": "expired-contact-new@example.com", "phone_number": "+910000000000"},
            format="json"
        )
        force_authenticate(request, user=self.user)

        response = update_member(request, member.id)
        member.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(member.email, "expired-contact-new@example.com")
        self.assertEqual(member.phone_number, "+910000000000")
        self.assertEqual(member.membership_plan, self.plan)

    def test_member_serialization_uses_one_query_for_annotated_member_list(self):
        active_start_date = date.today() - timedelta(days=10)
        self.create_member(
            "Efficient Member One",
            "+910000000001",
            "efficient-one@example.com",
            membership_start_date=active_start_date,
        )
        self.create_member(
            "Efficient Member Two",
            "+910000000002",
            "efficient-two@example.com",
            membership_start_date=active_start_date,
        )

        members = (
            Member.objects.filter(user=self.user)
            .select_related("membership_plan")
            .annotate(last_attendance_date=Max("attendance__date"))
        )
        with self.assertNumQueries(1):
            data = MemberSerializer(members, many=True).data

        self.assertEqual(len(data), 2)
        self.assertEqual({member["status"] for member in data}, {"active"})

    def test_graph_uses_grouped_queries_and_preserves_expected_datasets(self):
        member = self.create_member(
            "Graph Member",
            "+910000000003",
            "graph@example.com",
            membership_start_date=date.today(),
        )
        RecentPayment.objects.create(
            user=self.user,
            member=member,
            amount=500,
            payment_type="upi",
        )
        self.mark_attendance(member, date.today())

        with self.assertNumQueries(5):
            graph = calc_graph(self.user)

        self.assertEqual(len(graph["revenue"]["labels"]), 6)
        self.assertEqual(len(graph["weekly_attendance"]["data"]), 7)
        self.assertEqual(len(graph["hourly_attendance"]["datasets"]), 2)
        self.assertEqual(graph["member_growth"]["datasets"][0]["name"], "Basic")

    def test_payment_list_includes_member_summary_without_per_payment_queries(self):
        member = self.create_member(
            "Payment Summary Member",
            "+910000000004",
            "payment-summary@example.com",
        )
        RecentPayment.objects.create(
            user=self.user,
            member=member,
            amount=300,
            payment_type="cash",
        )
        request = self.factory.get("/members/getpayments")
        force_authenticate(request, user=self.user)

        with self.assertNumQueries(1):
            response = get_payments(request)

        self.assertEqual(response.data[0]["member_name"], member.name)
        self.assertEqual(response.data[0]["membership_plan_name"], self.plan.name)

    def test_dashboard_calculation_uses_fixed_query_count(self):
        member = self.create_member(
            "Dashboard Member",
            "+910000000005",
            "dashboard@example.com",
            membership_start_date=date.today(),
        )
        RecentPayment.objects.create(
            user=self.user,
            member=member,
            amount=300,
            payment_type="cash",
        )
        self.mark_attendance(member, date.today())

        with self.assertNumQueries(3):
            data = calc_data(self.user)

        self.assertEqual(data["members_count"], 1)
        self.assertEqual(data["payment_count"], 1)
        self.assertEqual(data["today_att_count"], 1)
