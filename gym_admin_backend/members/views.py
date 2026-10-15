from django.contrib.auth.models import User
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.core.paginator import EmptyPage, Paginator
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view , permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Exists, Max, OuterRef
from members.services.calc_graph import calc_graph
from members.services.percent_stat_diff import calc_percent_diff_data
from members.services.member_access import (
    get_active_member_from_access_token,
    member_access_link,
    public_link_request_is_rate_limited,
    send_mail_overdue_member,
    send_member_link,
)
from members.services.notification_service import check_expired_members, check_inactive_members
from members.services.audit_log import record_audit_log
from members.permissions import MemberViewer, OwnerOnly, OwnerOrFrontDesk, get_user_role
from members.services.payment_calc import calc_data, calc_member_overdue, calc_member_period_payment_total, calc_member_plan_transfer_amount, get_member_payment_status
from . models import Attendance, AuditLog, Member, MembershipPlan, Notification, RecentPayment
from . serializer import AuditLogSerializer, AttendanceSerializer, NotificationSerializer, UserSerializer, MemberSerializer, RecentPaymentSerializer, MembershipPlanSerializer
from datetime import date
import threading

@api_view(['POST'])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"msg":"User Created"},status=status.HTTP_201_CREATED)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated, MemberViewer])
def current_user(request):
    user = request.user
    data = {
        "username":user.username,
        "email":user.email
        ,"role": get_user_role(user)
    }
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, MemberViewer])
def get_members(request):
    members = (
        Member.objects.filter(user=request.user)
        .select_related("membership_plan")
        .annotate(
            last_attendance_date=Max("attendance__date"),
            has_attendance_today=Exists(
                Attendance.objects.filter(
                    user=request.user,
                    member_id=OuterRef("pk"),
                    date__date=date.today(),
                )
            ),
        )
    )
    serializer = MemberSerializer(members, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, MemberViewer])
def get_member(request , id):
    member = get_object_or_404(
        Member.objects.select_related("membership_plan").annotate(
            last_attendance_date=Max("attendance__date")
        ),
        id=id,
        user=request.user,
    )
    serializer = MemberSerializer(member)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, OwnerOrFrontDesk])
def get_plans(request):
    plans = MembershipPlan.objects.all()
    serializer = MembershipPlanSerializer(plans, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, OwnerOrFrontDesk])
def get_payments(request):
    payments = (
        RecentPayment.objects.filter(user=request.user)
        .select_related("member__membership_plan")
        .order_by('-created_at')
    )
    serializer = RecentPaymentSerializer(payments, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, OwnerOrFrontDesk])
def get_overdue_members(request):
    members = (
        Member.objects.filter(user=request.user)
        .select_related("membership_plan")
        .annotate(last_attendance_date=Max("attendance__date"))
    )
    overdue_list = []
    for member in members:
        data = calc_member_overdue(member)
        if data["status"] == "expired":
            overdue_list.append({
                "id": member.id,
                "name": member.name,
                "membership_plan": member.membership_plan.name,
                "overdue_days": data["overdue_days"],
                "overdue_amount": data["overdue_amount"],
                "membership_end_date":data["membership_end_date"]
            })
    overdue_list.sort(key=lambda x: x["overdue_days"], reverse=True)
    return Response(overdue_list)

@api_view(['GET'])
@permission_classes([IsAuthenticated, OwnerOrFrontDesk])
def get_calc(request):
    data = calc_data(request.user)
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, OwnerOnly])
def get_graph(request):
    data = calc_graph(request.user)
    return Response(data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, OwnerOrFrontDesk])
def update_member(request,id):
    member = get_object_or_404(Member, id=id, user=request.user)
    serializer = MemberSerializer(member, data =request.data ,partial=True)
    if serializer.is_valid():
        changed_field_labels = {
            field: label for field, label in {
                "name": "name",
                "email": "email",
                "phone_number": "phone number",
                "membership_plan": "membership plan",
                "membership_start_date": "membership start date",
            }.items()
            if field in serializer.validated_data
        }
        new_plan = serializer.validated_data.get("membership_plan")
        plan_changed = new_plan is not None and new_plan.id != member.membership_plan_id

        if plan_changed:
            member_status = get_member_payment_status(member)["status"]
            if member_status == "expired":
                return Response(
                    {"membership_plan_id": "Expired members cannot change plans because they have overdue amount."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            total_cash_paid = calc_member_plan_transfer_amount(member)
            serializer.save(
                membership_start_date=date.today(),
                total_cash_paid=total_cash_paid
            )
        else:
            serializer.save()
        record_audit_log(
            user=request.user,
            actor=request.user,
            action=AuditLog.MEMBER_UPDATED,
            target_type="member",
            target_id=member.id,
            target_name=member.name,
            metadata_summary=(
                "Updated: " + ", ".join(changed_field_labels.values())
                if changed_field_labels else "Updated member details"
            ),
        )
        return Response(serializer.data,status=status.HTTP_202_ACCEPTED)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated, OwnerOrFrontDesk])
def create_member(request):
    serializer = MemberSerializer(data=request.data)
    if serializer.is_valid():
        member = serializer.save(user=request.user)
        record_audit_log(
            user=request.user,
            actor=request.user,
            action=AuditLog.MEMBER_CREATED,
            target_type="member",
            target_id=member.id,
            target_name=member.name,
            metadata_summary="Member profile created",
        )
        return Response(serializer.data,status=status.HTTP_201_CREATED)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated, OwnerOrFrontDesk])
def create_payment(request):
    serializer = RecentPaymentSerializer(data=request.data)
    if serializer.is_valid():
        member = get_object_or_404(
            Member,
            id=serializer.validated_data['member'].id,
            user=request.user,
        )
        member_status = get_member_payment_status(member)["status"]
        payment = serializer.save(user=request.user, member=member)

        update_fields = ["total_cash_paid"]
        if member_status == "inactive":
            member.membership_start_date = timezone.localtime(payment.created_at).date()
            update_fields.append("membership_start_date")

        total_cash_paid = calc_member_period_payment_total(request.user, member)
        member.total_cash_paid = total_cash_paid
        member.save(update_fields=update_fields)
        record_audit_log(
            user=request.user,
            actor=request.user,
            action=AuditLog.PAYMENT_RECORDED,
            target_type="member",
            target_id=member.id,
            target_name=member.name,
            metadata_summary=f"Payment recorded via {payment.get_payment_type_display()}",
        )
        return Response(serializer.data,status=status.HTTP_201_CREATED)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated, OwnerOrFrontDesk])
def mark_attendance(request):
    serializer = AttendanceSerializer(data=request.data)
    if serializer.is_valid():
        member = get_object_or_404(
            Member,
            id=serializer.validated_data['member'].id,
            user=request.user,
        )
        if Attendance.objects.filter(user=request.user,member=member,date__date=date.today()).exists():
            return Response({"msg":"Attendance already marked"},status=status.HTTP_400_BAD_REQUEST)
        attendance = serializer.save(user=request.user, member=member)
        record_audit_log(
            user=request.user,
            actor=request.user,
            action=AuditLog.ATTENDANCE_MARKED,
            target_type="member",
            target_id=member.id,
            target_name=member.name,
            metadata_summary=f"Attendance marked for {attendance.date.date().isoformat()}",
        )
        return Response(serializer.data,status=status.HTTP_201_CREATED)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated, OwnerOrFrontDesk])
def delete_attendance(request,id):
    member = get_object_or_404(Member, id=id, user=request.user)
    attendance = Attendance.objects.filter(
        user=request.user,
        member=id,
        date__date=date.today()
    )
    deleted_count, _ = attendance.delete()
    if deleted_count:
        record_audit_log(
            user=request.user,
            actor=request.user,
            action=AuditLog.ATTENDANCE_REMOVED,
            target_type="member",
            target_id=member.id,
            target_name=member.name,
            metadata_summary=f"Attendance removed for {date.today().isoformat()}",
        )
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([IsAuthenticated, MemberViewer])
def get_attendance(request,id):
    get_object_or_404(Member, id=id, user=request.user)
    attendance = Attendance.objects.filter(
        user=request.user,
        member=id,
        date__date=date.today()
    )
    serializer = AttendanceSerializer(attendance, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, MemberViewer])
def get_attendance_history(request, id):
    get_object_or_404(Member, id=id, user=request.user)
    attendance = Attendance.objects.filter(
        user=request.user,
        member_id=id
    ).order_by('-date')
    serializer = AttendanceSerializer(attendance, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, OwnerOrFrontDesk])
def get_payment_history(request, id):
    get_object_or_404(Member, id=id, user=request.user)
    payments = RecentPayment.objects.filter(
        user=request.user,
        member_id=id
    ).order_by('-created_at')
    serializer = RecentPaymentSerializer(payments, many=True)
    return Response(serializer.data)

PUBLIC_MEMBER_ACCESS_ERROR = "This attendance link is invalid or has expired."


def _public_member_access_member(request, token):
    if public_link_request_is_rate_limited(request, token):
        return None, Response(
            {"error": "Too many requests. Please try again later."},
            status=status.HTTP_429_TOO_MANY_REQUESTS,
        )

    member = get_active_member_from_access_token(token)
    if member is None:
        # Expiry, revocation, malformed tokens, and unknown tokens deliberately
        # receive the same response so this endpoint cannot be used to enumerate links.
        return None, Response(
            {"error": PUBLIC_MEMBER_ACCESS_ERROR}, status=status.HTTP_404_NOT_FOUND
        )
    return member, None


def _member_access_link_payload(member):
    return {
        "member_id": member.id,
        "access_url": member_access_link(member),
        "expires_at": member.access_token_expires_at,
    }


def _regenerate_member_access_link(member, actor):
    member.regenerate_access_link()
    record_audit_log(
        user=member.user,
        actor=actor,
        action=AuditLog.SETTINGS_UPDATED,
        target_type="member",
        target_id=member.id,
        target_name=member.name,
        metadata_summary="Attendance link refreshed",
    )
    return member


@api_view(["POST"])
@permission_classes([IsAuthenticated, OwnerOnly])
def regenerate_member_access_link(request, id):
    member = get_object_or_404(Member, id=id, user=request.user)
    member = _regenerate_member_access_link(member, request.user)
    return Response(_member_access_link_payload(member), status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated, OwnerOnly])
def resend_member_access_link(request, id):
    member = get_object_or_404(Member, id=id, user=request.user)
    member = _regenerate_member_access_link(member, request.user)
    send_member_link(member)
    return Response(
        {"msg": "A new attendance link was emailed.", **_member_access_link_payload(member)},
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated, OwnerOnly])
def revoke_member_access_link(request, id):
    member = get_object_or_404(Member, id=id, user=request.user)
    member.revoke_access_link()
    record_audit_log(
        user=member.user,
        actor=request.user,
        action=AuditLog.SETTINGS_UPDATED,
        target_type="member",
        target_id=member.id,
        target_name=member.name,
        metadata_summary="Attendance link disabled",
    )
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
def member_access(request, token):
    member, error = _public_member_access_member(request, token)
    if error is not None:
        return error
    # Only a display name is needed by the public check-in screen.
    return Response({"member_name": member.name})


@api_view(["GET"])
def member_access_get_attendance(request, token):
    member, error = _public_member_access_member(request, token)
    if error is not None:
        return error
    return Response({
        "attendance_marked": Attendance.objects.filter(
            member=member, date__date=date.today()
        ).exists()
    })


@api_view(["POST"])
def member_access_mark_attendance(request, token):
    member, error = _public_member_access_member(request, token)
    if error is not None:
        return error
    if Attendance.objects.filter(user=member.user, member=member, date__date=date.today()).exists():
        return Response({"msg": "Attendance already marked"}, status=status.HTTP_400_BAD_REQUEST)

    # Do not accept a client-supplied timestamp for a public check-in.
    attendance = Attendance.objects.create(user=member.user, member=member)
    record_audit_log(
        user=member.user,
        actor=None,
        actor_label=f"Member: {member.name}",
        action=AuditLog.ATTENDANCE_MARKED,
        target_type="member",
        target_id=member.id,
        target_name=member.name,
        metadata_summary=f"Self-service attendance marked for {attendance.date.date().isoformat()}",
    )
    return Response({"attendance_marked": True}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAuthenticated, OwnerOrFrontDesk])
def notify_overdue_member(request):
    data=request.data
    get_object_or_404(Member, id=data["id"], user=request.user)
    thread = threading.Thread(
        target = send_mail_overdue_member,
        args=(data,)
    )
    thread.start()
    return Response({"msg":"Notified the Overdue Member"},status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([IsAuthenticated, OwnerOnly])
def send_attendance_mail_member(request):
    member_id = request.data.get("member_id")
    if not member_id:
        return Response({"error": "member_id is required"}, status=status.HTTP_400_BAD_REQUEST)

    if member_id == "all":
        members = Member.objects.filter(user=request.user)
        for member in members:
            _regenerate_member_access_link(member, request.user)
            send_member_link(member)
        return Response({"msg": "New attendance links were emailed to all members."})

    member = get_object_or_404(Member, id=member_id, user=request.user)
    _regenerate_member_access_link(member, request.user)
    send_member_link(member)
    return Response({"msg": f"A new attendance link was emailed to {member.name}."})


@api_view(["GET"])
@permission_classes([IsAuthenticated, OwnerOnly])
def add_notification(request):
    members = list(
        Member.objects.filter(user=request.user)
        .select_related("membership_plan")
        .annotate(last_attendance_date=Max("attendance__date"))
    )
    check_inactive_members(request.user, members=members)
    check_expired_members(request.user, members=members)
    return Response({"msg":"notification processed"})

@api_view(['GET'])
@permission_classes([IsAuthenticated, OwnerOnly])
def get_notifications(request):
    notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
    serializer=NotificationSerializer(notifications,many=True)
    return Response(serializer.data,status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated, OwnerOnly])
def mark_notification_read(request,pk):
    try:
        notification = Notification.objects.get(user=request.user,id=pk)
        notification.is_read=True
        notification.save()
        return Response({"msg":"Notification marked as read"},status=status.HTTP_200_OK)
    except Notification.DoesNotExist:
        return Response({"error":"Notificatin not found"},status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated, OwnerOnly])
def update_user_email(request):
    new_email = request.data.get("email")
    if not new_email:
        return Response({"error":"Email is required"},status=400)
    new_email = new_email.strip()
    try:
        validate_email(new_email)
    except ValidationError:
        return Response({"error":"Invalid email format"},status=400)
    if User.objects.filter(email=new_email).exists():
        return Response({"error":"Email already in use"},status=400)
    user=request.user
    user.email=new_email
    user.save()
    record_audit_log(
        user=user,
        actor=user,
        action=AuditLog.SETTINGS_UPDATED,
        target_type="user",
        target_id=user.id,
        target_name=user.username,
        metadata_summary="Email setting updated",
    )
    return Response({
        "msg":"Email updated successfully",
        "email":user.email
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated, OwnerOrFrontDesk])
def get_percent_stat_diff(request):
    data = calc_percent_diff_data(request.user)
    return Response(data,status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated, OwnerOnly])
def get_audit_logs(request):
    action = request.query_params.get("action", "").strip()
    selected_date = request.query_params.get("date", "").strip()
    logs = AuditLog.objects.filter(user=request.user).select_related("actor")

    if action:
        valid_actions = {value for value, _ in AuditLog.ACTION_CHOICES}
        if action not in valid_actions:
            return Response({"action": "Unknown audit action."}, status=status.HTTP_400_BAD_REQUEST)
        logs = logs.filter(action=action)

    if selected_date:
        try:
            filter_date = date.fromisoformat(selected_date)
        except ValueError:
            return Response({"date": "Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
        logs = logs.filter(created_at__date=filter_date)

    try:
        page_number = max(int(request.query_params.get("page", 1)), 1)
    except (TypeError, ValueError):
        return Response({"page": "Page must be a positive integer."}, status=status.HTTP_400_BAD_REQUEST)

    paginator = Paginator(logs, 25)
    try:
        page = paginator.page(page_number)
    except EmptyPage:
        page = paginator.page(paginator.num_pages) if paginator.num_pages else None

    entries = page.object_list if page else []
    return Response({
        "results": AuditLogSerializer(entries, many=True).data,
        "pagination": {
            "page": page.number if page else 1,
            "page_size": 25,
            "total": paginator.count,
            "total_pages": paginator.num_pages,
        },
    })
