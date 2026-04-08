from django.contrib.auth.models import User
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.db.models.aggregates import Sum
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view , permission_classes
from rest_framework.response import Response
from rest_framework import status
from members.services.calc_graph import calc_graph
from members.services.percent_stat_diff import calc_percent_diff_data
from members.services.member_access import send_mail_overdue_member, send_member_link
from members.services.notification_service import check_expired_members, check_inactive_members
from members.services.payment_calc import calc_data, calc_member_overdue
from . models import Attendance, Member , MembershipPlan, Notification, RecentPayment
from . serializer import AttendanceSerializer, NotificationSerializer, UserSerializer ,MemberSerializer, RecentPaymentSerializer , MembershipPlanSerializer
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
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    data = {
        "username":user.username,
        "email":user.email
    }
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_members(request):
    members = Member.objects.filter(user=request.user)
    serializer = MemberSerializer(members, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_member(request , id):
    member = Member.objects.get(id=id)
    serializer = MemberSerializer(member)
    return Response(serializer.data)

@api_view(['GET'])
def get_plans(request):
    plans = MembershipPlan.objects.all()
    serializer = MembershipPlanSerializer(plans, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_payments(request):
    payments = RecentPayment.objects.filter(user=request.user).order_by('-created_at')
    serializer = RecentPaymentSerializer(payments, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_overdue_members(request):
    members = Member.objects.filter(user=request.user)
    overdue_list = []
    for member in members:
        data = calc_member_overdue(member)
        if data["overdue_days"] > 0:
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
@permission_classes([IsAuthenticated])
def get_calc(request):
    data = calc_data(request.user)
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_graph(request):
    data = calc_graph(request.user)
    return Response(data)


@api_view(['PATCH'])
def update_member(request,id):
    member = Member.objects.get(id=id)
    serializer = MemberSerializer(member, data =request.data ,partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data,status=status.HTTP_202_ACCEPTED)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_member(request):
    serializer = MemberSerializer(data=request.data)
    if serializer.is_valid():
        member = serializer.save(user=request.user)
        return Response(serializer.data,status=status.HTTP_201_CREATED)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment(request):
    serializer = RecentPaymentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        total_cash_paid = RecentPayment.objects.filter(user=request.user,member=serializer.validated_data['member']).aggregate(total=Sum('amount'))['total'] or 0.0
        member = serializer.validated_data['member']
        member.total_cash_paid = total_cash_paid
        member.save(update_fields=["total_cash_paid"])
        return Response(serializer.data,status=status.HTTP_201_CREATED)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_attendance(request):
    serializer = AttendanceSerializer(data=request.data)
    if serializer.is_valid():
        member = serializer.validated_data['member']
        if Attendance.objects.filter(user=request.user,member=member,date__date=date.today()).exists():
            return Response({"msg":"Attendance already marked"},status=status.HTTP_400_BAD_REQUEST)
        serializer.save(user=request.user)
        return Response(serializer.data,status=status.HTTP_201_CREATED)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_attendance(request,id):
    attendance = Attendance.objects.filter(
        user=request.user,
        member=id,
        date__date=date.today()
    )
    attendance.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_attendance(request,id):
    attendance = Attendance.objects.filter(
        user=request.user,
        member=id,
        date__date=date.today()
    )
    serializer = AttendanceSerializer(attendance, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def member_access(request, token):
    try:
        member = Member.objects.get(access_token=token)
    except Member.DoesNotExist:
        return Response({"error": "Invalid link"}, status=404)
    data = {
        "member_name": member.name,
        "member_id": member.id,
        "member_phno":member.phone_number
    }
    return Response(data)

@api_view(['GET'])
def member_access_get_attendance(request,token):
    member = Member.objects.get(access_token=token)
    attendance = Attendance.objects.filter(
        member=member.id,
        date__date=date.today()
    )
    serializer = AttendanceSerializer(attendance, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def member_access_mark_attendance(request,token):
    member = Member.objects.get(access_token=token)
    serializer = AttendanceSerializer(data={
        "member":member.id,
        "date":request.data["date"]
    })
    if serializer.is_valid():
        member = serializer.validated_data['member']
        if Attendance.objects.filter(user=member.user,member=member,date__date=date.today()).exists():
            return Response({"msg":"Attendance already marked"},status=status.HTTP_400_BAD_REQUEST)
        serializer.save(user=member.user)
        return Response(serializer.data,status=status.HTTP_201_CREATED)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notify_overdue_member(request):
    data=request.data
    thread = threading.Thread(
        target = send_mail_overdue_member,
        args=(data,)
    )
    thread.start()
    return Response({"msg":"Notified the Overdue Member"},status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_attendance_mail_member(request):
    data=request.data
    if data["member_id"]=='all':
        members=Member.objects.filter(user=request.user)
        for member in members:
            send_member_link(member)
        return Response({"msg":"Attendance Link Successfully Sented for All Members"},status=status.HTTP_200_OK)
    member=Member.objects.get(id=data["member_id"])
    send_member_link(member)
    return Response({"msg":f"Attendance Link Successfully Sented for {member.name}"},status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def add_notification(request):
    check_inactive_members(request.user)
    check_expired_members(request.user)
    return Response({"msg":"notification processed"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
    serializer=NotificationSerializer(notifications,many=True)
    return Response(serializer.data,status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request,pk):
    try:
        notification = Notification.objects.get(user=request.user,id=pk)
        notification.is_read=True
        notification.save()
        return Response({"msg":"Notification marked as read"},status=status.HTTP_200_OK)
    except Notification.DoesNotExist:
        return Response({"error":"Notificatin not found"},status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
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
    return Response({
        "msg":"Email updated successfully",
        "email":user.email
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_percent_stat_diff(request):
    data = calc_percent_diff_data(request.user)
    return Response(data,status=status.HTTP_200_OK)