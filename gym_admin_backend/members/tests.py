from django.test import TestCase
from django.db.models import Max
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.cache import cache
from datetime import date, datetime, time, timedelta
from rest_framework import status
from rest_framework.test import APIRequestFactory, force_authenticate

from members.models import Attendance, AuditLog, GymUserProfile, Member, MembershipPlan, RecentPayment
from members.serializer import MemberSerializer
from members.permissions import get_user_role
from members.services.audit_log import record_audit_log
from members.services.payment_calc import calc_data, calc_member_overdue, calc_overdue_amount
from members.services.member_health import get_member_health
from members.services.calc_graph import calc_graph
from members.views import (
    create_member,
    create_payment,
    delete_attendance,
    get_audit_logs,
    get_attendance,
    current_user,
    get_attendance_history,
    get_member,
    get_members,
    get_payment_history,
    get_payments,
    get_plans,
    get_graph,
    get_calc,
    get_percent_stat_diff,
    update_user_email,
    mark_attendance,
    member_access,
    member_access_get_attendance,
    member_access_mark_attendance,
    regenerate_member_access_link,
    revoke_member_access_link,
    notify_overdue_member,
    send_attendance_mail_member,
    update_member,
)
from unittest.mock import patch


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

    def test_member_health_is_healthy_for_current_payments_and_recent_attendance(self):
        member = self.create_member(
            "Healthy Member",
            "+910000000010",
            "healthy@example.com",
            total_cash_paid=600,
            membership_start_date=date.today() - timedelta(days=10),
        )
        self.mark_attendance(member, date.today())

        health = get_member_health(member)
        serialized_health = MemberSerializer(member).data["health"]

        self.assertEqual(health["score"], 100)
        self.assertEqual(health["label"], "Healthy")
        self.assertFalse(health["is_at_risk"])
        self.assertIn("Payments are current", health["reasons"])
        self.assertEqual(set(serialized_health), {"score", "label", "reasons", "days_remaining", "is_at_risk"})

    def test_member_health_marks_inactive_members_as_at_risk(self):
        member = self.create_member(
            "Inactive Health Member",
            "+910000000011",
            "inactive-health@example.com",
        )

        health = get_member_health(member)

        self.assertEqual(health["score"], 25)
        self.assertEqual(health["label"], "At risk")
        self.assertTrue(health["is_at_risk"])
        self.assertIn("Membership is inactive", health["reasons"])

    def test_member_health_marks_due_members_as_at_risk(self):
        member = self.create_member(
            "Due Health Member",
            "+910000000012",
            "due-health@example.com",
            membership_start_date=date.today() - timedelta(days=28),
        )
        self.mark_attendance(member, date.today())

        health = get_member_health(member)

        self.assertEqual(health["score"], 55)
        self.assertEqual(health["label"], "At risk")
        self.assertTrue(health["is_at_risk"])
        self.assertIn("Payment is due in 2 days", health["reasons"])

    def test_member_health_marks_expired_members_as_at_risk(self):
        member = self.create_member(
            "Expired Health Member",
            "+910000000013",
            "expired-health@example.com",
        )
        membership_end_date = self.start_date + timedelta(days=30)
        self.mark_attendance(member, membership_end_date + timedelta(days=1))

        health = get_member_health(member)

        self.assertEqual(health["score"], 0)
        self.assertEqual(health["label"], "At risk")
        self.assertTrue(health["is_at_risk"])
        self.assertIn("Membership has expired", health["reasons"])

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

    def test_member_list_includes_todays_attendance_without_per_member_queries(self):
        attended_member = self.create_member(
            "Attended Today",
            "+910000000006",
            "attended-today@example.com",
            membership_start_date=date.today(),
        )
        absent_member = self.create_member(
            "Absent Today",
            "+910000000007",
            "absent-today@example.com",
            membership_start_date=date.today(),
        )
        self.mark_attendance(attended_member, date.today())
        request = self.factory.get("/members/get")
        force_authenticate(request, user=self.user)

        with self.assertNumQueries(1):
            response = get_members(request)

        members_by_id = {member["id"]: member for member in response.data}
        self.assertTrue(members_by_id[attended_member.id]["has_attendance_today"])
        self.assertFalse(members_by_id[absent_member.id]["has_attendance_today"])

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

    def test_dashboard_retention_summary_reuses_member_health_with_fixed_queries(self):
        healthy_member = self.create_member(
            "Healthy Dashboard Member",
            "+910000000020",
            "healthy-dashboard@example.com",
            total_cash_paid=600,
            membership_start_date=date.today() - timedelta(days=10),
        )
        due_member = self.create_member(
            "Due Dashboard Member",
            "+910000000021",
            "due-dashboard@example.com",
            membership_start_date=date.today() - timedelta(days=28),
        )
        self.create_member(
            "Inactive Dashboard Member",
            "+910000000022",
            "inactive-dashboard@example.com",
        )
        self.create_member(
            "Expiring Dashboard Member",
            "+910000000023",
            "expiring-dashboard@example.com",
            membership_start_date=date.today() - timedelta(days=24),
        )
        self.mark_attendance(healthy_member, date.today())
        self.mark_attendance(due_member, date.today())

        with self.assertNumQueries(3):
            data = calc_data(self.user)

        retention = data["retention"]
        self.assertEqual(retention["at_risk_count"], 2)
        self.assertEqual(retention["inactive_count"], 1)
        self.assertEqual(retention["expiring_soon_count"], 2)
        self.assertEqual(
            {action["id"]: action["count"] for action in retention["suggested_actions"]},
            {"at_risk": 2, "inactive": 1, "expiring_soon": 2},
        )
        self.assertEqual(
            {action["id"]: action["filter"] for action in retention["suggested_actions"]},
            {
                "at_risk": {"health": "at_risk"},
                "inactive": {"status": "inactive"},
                "expiring_soon": {"expiry": "expiring_soon"},
            },
        )

class MemberOwnershipTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username="owner", password="pass")
        self.other_user = User.objects.create_user(username="other", password="pass")
        self.plan = MembershipPlan.objects.create(name="Ownership Plan", plan_price=300)
        self.other_member = Member.objects.create(
            user=self.other_user,
            name="Other Member",
            phone_number="+919876543210",
            email="other-member@example.com",
            membership_plan=self.plan,
            membership_start_date=date.today(),
        )
        self.factory = APIRequestFactory()

    def request_for_owner(self, method, path, data=None):
        request = getattr(self.factory, method)(path, data or {}, format="json")
        force_authenticate(request, user=self.owner)
        return request

    def test_member_detail_denies_another_users_member(self):
        response = get_member(
            self.request_for_owner("get", f"/members/get/{self.other_member.id}"),
            self.other_member.id,
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_payment_creation_denies_another_users_member(self):
        response = create_payment(
            self.request_for_owner(
                "post",
                "/members/pay",
                {"member": self.other_member.id, "amount": 100, "payment_type": "cash"},
            )
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(RecentPayment.objects.filter(member=self.other_member).exists())

    def test_attendance_endpoints_deny_another_users_member(self):
        Attendance.objects.create(user=self.other_user, member=self.other_member)

        create_response = mark_attendance(
            self.request_for_owner(
                "post",
                "/members/markattendance",
                {"member": self.other_member.id, "date": timezone.now().isoformat()},
            )
        )
        get_response = get_attendance(
            self.request_for_owner("get", f"/members/getattendance/{self.other_member.id}"),
            self.other_member.id,
        )
        history_response = get_attendance_history(
            self.request_for_owner("get", f"/members/getattendancehistory/{self.other_member.id}"),
            self.other_member.id,
        )
        delete_response = delete_attendance(
            self.request_for_owner("delete", f"/members/deleteattendance/{self.other_member.id}"),
            self.other_member.id,
        )

        self.assertEqual(create_response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(get_response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(history_response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(delete_response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Attendance.objects.filter(member=self.other_member).exists())

    def test_payment_history_denies_another_users_member(self):
        RecentPayment.objects.create(
            user=self.other_user,
            member=self.other_member,
            amount=100,
            payment_type="cash",
        )

        response = get_payment_history(
            self.request_for_owner("get", f"/members/getpaymenthistory/{self.other_member.id}"),
            self.other_member.id,
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @patch("members.views.send_member_link")
    def test_attendance_email_denies_another_users_member(self, send_link):
        response = send_attendance_mail_member(
            self.request_for_owner(
                "post",
                "/members/attendance-mail",
                {"member_id": self.other_member.id},
            )
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        send_link.assert_not_called()

    @patch("members.views.threading.Thread")
    def test_overdue_email_denies_another_users_member(self, thread):
        response = notify_overdue_member(
            self.request_for_owner(
                "post",
                "/members/overdue/notify",
                {
                    "id": self.other_member.id,
                    "membership_end_date": str(date.today()),
                    "overdue_amount": "100.00",
                    "overdue_days": 1,
                },
            )
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        thread.assert_not_called()

class RolePermissionTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username="role-owner", password="pass")
        self.trainer = User.objects.create_user(username="role-trainer", password="pass")
        self.front_desk = User.objects.create_user(username="role-front-desk", password="pass")
        self.trainer.gym_profile.role = GymUserProfile.TRAINER
        self.trainer.gym_profile.save(update_fields=["role"])
        self.front_desk.gym_profile.role = GymUserProfile.FRONT_DESK
        self.front_desk.gym_profile.save(update_fields=["role"])
        self.plan = MembershipPlan.objects.create(name="Role Plan", plan_price=300)
        self.member = Member.objects.create(
            user=self.owner,
            name="Role Member",
            phone_number="+910000009999",
            email="role-member@example.com",
            membership_plan=self.plan,
            membership_start_date=date.today(),
        )
        self.factory = APIRequestFactory()
        self.trainer_member = Member.objects.create(
            user=self.trainer,
            name="Trainer Member",
            phone_number="+910000009998",
            email="trainer-member@example.com",
            membership_plan=self.plan,
            membership_start_date=date.today(),
        )
        self.front_desk_member = Member.objects.create(
            user=self.front_desk,
            name="Front Desk Member",
            phone_number="+910000009997",
            email="front-desk-member@example.com",
            membership_plan=self.plan,
            membership_start_date=date.today(),
        )

    def request_for(self, user, method, path, data=None):
        request = getattr(self.factory, method)(path, data or {}, format="json")
        force_authenticate(request, user=user)
        return request

    def test_new_users_receive_owner_profile_by_default(self):
        self.assertEqual(self.owner.gym_profile.role, GymUserProfile.OWNER)

    def test_user_without_profile_falls_back_to_owner_for_existing_accounts(self):
        GymUserProfile.objects.filter(user=self.owner).delete()
        self.owner._state.fields_cache.pop("gym_profile", None)

        response = get_members(self.request_for(self.owner, "get", "/members/get"))

        self.assertEqual(get_user_role(self.owner), GymUserProfile.OWNER)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_trainer_can_view_members_and_attendance_only(self):
        member_response = get_members(self.request_for(self.trainer, "get", "/members/get"))
        attendance_response = get_attendance_history(
            self.request_for(self.trainer, "get", f"/members/getattendancehistory/{self.trainer_member.id}"),
            self.trainer_member.id,
        )
        payment_response = get_payments(self.request_for(self.trainer, "get", "/members/getpayments"))
        plan_response = get_plans(self.request_for(self.trainer, "get", "/members/getplans"))
        create_response = create_payment(
            self.request_for(
                self.trainer,
                "post",
                "/members/pay",
                {"member": self.trainer_member.id, "amount": 100, "payment_type": "cash"},
            )
        )
        attendance_write_response = mark_attendance(
            self.request_for(
                self.trainer,
                "post",
                "/members/markattendance",
                {"member": self.trainer_member.id, "date": timezone.now().isoformat()},
            )
        )

        self.assertEqual(member_response.status_code, status.HTTP_200_OK)
        self.assertEqual(attendance_response.status_code, status.HTTP_200_OK)
        self.assertEqual(payment_response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(plan_response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(create_response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(attendance_write_response.status_code, status.HTTP_403_FORBIDDEN)

    def test_front_desk_can_manage_members_payments_and_attendance_but_not_owner_areas(self):
        member_response = update_member(
            self.request_for(
                self.front_desk,
                "patch",
                f"/members/update/{self.front_desk_member.id}",
                {"phone_number": "+910000008888"},
            ),
            self.front_desk_member.id,
        )
        payment_response = create_payment(
            self.request_for(
                self.front_desk,
                "post",
                "/members/pay",
                {"member": self.front_desk_member.id, "amount": 100, "payment_type": "cash"},
            )
        )
        attendance_response = mark_attendance(
            self.request_for(
                self.front_desk,
                "post",
                "/members/markattendance",
                {"member": self.front_desk_member.id, "date": timezone.now().isoformat()},
            )
        )
        graph_response = get_graph(self.request_for(self.front_desk, "get", "/members/getgraph"))
        email_response = update_user_email(
            self.request_for(self.front_desk, "post", "/members/update-user-email", {"email": "desk@example.com"})
        )

        self.assertEqual(member_response.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(payment_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(attendance_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(graph_response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(email_response.status_code, status.HTTP_403_FORBIDDEN)

    def test_owner_can_access_owner_only_areas(self):
        graph_response = get_graph(self.request_for(self.owner, "get", "/members/getgraph"))
        calculation_response = get_calc(self.request_for(self.owner, "get", "/members/getcalc"))
        user_response = current_user(self.request_for(self.owner, "get", "/members/user"))

        self.assertEqual(graph_response.status_code, status.HTTP_200_OK)
        self.assertEqual(calculation_response.status_code, status.HTTP_200_OK)
        self.assertEqual(user_response.data["role"], GymUserProfile.OWNER)

class AuditLogTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username="audit-owner", password="pass")
        self.front_desk = User.objects.create_user(username="audit-desk", password="pass")
        self.front_desk.gym_profile.role = GymUserProfile.FRONT_DESK
        self.front_desk.gym_profile.save(update_fields=["role"])
        self.plan = MembershipPlan.objects.create(name="Audit Plan", plan_price=300)
        self.member = Member.objects.create(
            user=self.owner,
            name="Audit Member",
            phone_number="+910000007777",
            email="audit-member@example.com",
            membership_plan=self.plan,
            membership_start_date=date.today(),
        )
        self.factory = APIRequestFactory()

    def request_for(self, user, method, path, data=None):
        request = getattr(self.factory, method)(path, data or {}, format="json")
        force_authenticate(request, user=user)
        return request

    def test_important_mutations_create_non_sensitive_audit_entries(self):
        create_response = create_member(
            self.request_for(self.owner, "post", "/members/create", {
                "name": "Created Member", "phone_number": "+910000007776",
                "email": "created-member@example.com", "membership_plan_id": self.plan.id,
                "membership_start_date": str(date.today()),
            })
        )
        update_response = update_member(
            self.request_for(self.owner, "patch", f"/members/update/{self.member.id}", {
                "email": "updated-audit-member@example.com",
            }), self.member.id,
        )
        payment_response = create_payment(
            self.request_for(self.owner, "post", "/members/pay", {
                "member": self.member.id, "amount": 300, "payment_type": "cash",
            })
        )
        attendance_response = mark_attendance(
            self.request_for(self.owner, "post", "/members/markattendance", {
                "member": self.member.id, "date": timezone.now().isoformat(),
            })
        )
        deletion_response = delete_attendance(
            self.request_for(self.owner, "delete", f"/members/deleteattendance/{self.member.id}"), self.member.id,
        )
        settings_response = update_user_email(
            self.request_for(self.owner, "post", "/members/update-user-email", {
                "email": "audit-owner-updated@example.com",
            })
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(update_response.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(payment_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(attendance_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(deletion_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(settings_response.status_code, status.HTTP_200_OK)
        self.assertEqual(set(AuditLog.objects.values_list("action", flat=True)), {
            AuditLog.MEMBER_CREATED, AuditLog.MEMBER_UPDATED, AuditLog.PAYMENT_RECORDED,
            AuditLog.ATTENDANCE_MARKED, AuditLog.ATTENDANCE_REMOVED, AuditLog.SETTINGS_UPDATED,
        })
        summaries = " ".join(AuditLog.objects.values_list("metadata_summary", flat=True))
        self.assertNotIn("updated-audit-member@example.com", summaries)
        self.assertNotIn("audit-owner-updated@example.com", summaries)
        self.assertNotIn("pass", summaries.lower())
        self.assertNotIn("token", summaries.lower())

    def test_audit_listing_is_owner_only_and_supports_filters_and_pagination(self):
        for index in range(26):
            AuditLog.objects.create(
                user=self.owner, actor=self.owner,
                action=AuditLog.MEMBER_CREATED if index < 25 else AuditLog.SETTINGS_UPDATED,
                target_type="member", target_id=index + 1, target_name=f"Member {index + 1}",
                metadata_summary="Created member profile",
            )

        first_page = get_audit_logs(self.request_for(self.owner, "get", "/members/audit-logs"))
        second_page = get_audit_logs(self.request_for(self.owner, "get", "/members/audit-logs?page=2"))
        action_filter = get_audit_logs(
            self.request_for(self.owner, "get", "/members/audit-logs", {"action": AuditLog.SETTINGS_UPDATED})
        )
        date_filter = get_audit_logs(
            self.request_for(self.owner, "get", "/members/audit-logs", {"date": str(date.today())})
        )
        denied = get_audit_logs(self.request_for(self.front_desk, "get", "/members/audit-logs"))

        self.assertEqual(first_page.status_code, status.HTTP_200_OK)
        self.assertEqual(len(first_page.data["results"]), 25)
        self.assertEqual(first_page.data["pagination"]["total"], 26)
        self.assertEqual(len(second_page.data["results"]), 1)
        self.assertEqual(len(action_filter.data["results"]), 1)
        self.assertEqual(date_filter.data["pagination"]["total"], 26)
        self.assertEqual(denied.status_code, status.HTTP_403_FORBIDDEN)

    def test_member_self_service_check_in_records_the_member_as_actor(self):
        request = self.factory.post(
            f"/members/member-access/{self.member.access_token}/markattendance",
            {"date": timezone.now().isoformat()},
            format="json",
        )

        response = member_access_mark_attendance(request, str(self.member.access_token))
        entry = AuditLog.objects.get(action=AuditLog.ATTENDANCE_MARKED)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(entry.actor)
        self.assertEqual(entry.actor_label, "Member: Audit Member")
        self.assertEqual(entry.target_id, self.member.id)

    def test_sensitive_metadata_is_omitted_by_the_audit_helper(self):
        entry = record_audit_log(
            user=self.owner,
            actor=self.owner,
            action=AuditLog.SETTINGS_UPDATED,
            target_type="user",
            target_id=self.owner.id,
            target_name=self.owner.username,
            metadata_summary="password=do-not-store-this JWT=do-not-store-this-either",
        )

        self.assertEqual(entry.metadata_summary, "Sensitive detail omitted")


class PublicAttendanceLinkTests(TestCase):
    def setUp(self):
        cache.clear()
        self.owner = User.objects.create_user(username="link-owner", password="pass")
        self.plan = MembershipPlan.objects.create(name="Link Plan", plan_price=300)
        self.member = Member.objects.create(
            user=self.owner,
            name="Private Link Member",
            phone_number="+910000006666",
            email="private-link@example.com",
            membership_plan=self.plan,
            membership_start_date=date.today(),
            access_token_expires_at=timezone.now() + timedelta(days=1),
        )
        self.factory = APIRequestFactory()

    def tearDown(self):
        cache.clear()

    def owner_request(self, path):
        request = self.factory.post(path, {}, format="json")
        force_authenticate(request, user=self.owner)
        return request

    def test_valid_public_link_exposes_only_required_data_and_can_check_in(self):
        token = str(self.member.access_token)

        profile_response = member_access(
            self.factory.get(f"/members/member-access/{token}"), token
        )
        state_response = member_access_get_attendance(
            self.factory.get(f"/members/member-access/{token}/getattendance"), token
        )
        check_in_response = member_access_mark_attendance(
            self.factory.post(f"/members/member-access/{token}/markattendance", {}, format="json"), token
        )

        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_response.data, {"member_name": "Private Link Member"})
        self.assertNotIn("phone_number", profile_response.data)
        self.assertNotIn("member_id", profile_response.data)
        self.assertEqual(state_response.data, {"attendance_marked": False})
        self.assertEqual(check_in_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(check_in_response.data, {"attendance_marked": True})

    def test_expired_public_link_returns_the_same_safe_error_as_an_unknown_link(self):
        self.member.access_token_expires_at = timezone.now() - timedelta(seconds=1)
        self.member.save(update_fields=["access_token_expires_at"])
        expired_token = str(self.member.access_token)

        expired_response = member_access(
            self.factory.get(f"/members/member-access/{expired_token}"), expired_token
        )
        invalid_response = member_access(
            self.factory.get("/members/member-access/not-a-token"), "not-a-token"
        )

        self.assertEqual(expired_response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(expired_response.data, invalid_response.data)
        self.assertEqual(expired_response.data, {"error": "This attendance link is invalid or has expired."})

    def test_revoked_link_cannot_be_used_and_regeneration_invalidates_the_old_link(self):
        old_token = str(self.member.access_token)
        regenerated = regenerate_member_access_link(
            self.owner_request(f"/members/member-access-links/{self.member.id}/regenerate"), self.member.id
        )
        self.member.refresh_from_db()
        new_token = str(self.member.access_token)
        old_link_response = member_access(
            self.factory.get(f"/members/member-access/{old_token}"), old_token
        )

        revoke_response = revoke_member_access_link(
            self.owner_request(f"/members/member-access-links/{self.member.id}/revoke"), self.member.id
        )
        revoked_response = member_access(
            self.factory.get(f"/members/member-access/{new_token}"), new_token
        )

        self.assertEqual(regenerated.status_code, status.HTTP_200_OK)
        self.assertNotEqual(old_token, new_token)
        self.assertIn(new_token, regenerated.data["access_url"])
        self.assertEqual(old_link_response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(revoke_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(revoked_response.status_code, status.HTTP_404_NOT_FOUND)
