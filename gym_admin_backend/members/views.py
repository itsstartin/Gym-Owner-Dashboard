from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view , permission_classes
from rest_framework.response import Response
from rest_framework import status
from members.services.calc_graph import calc_graph
from members.services.payment_calc import calc_data
from . models import Attendance, Member , MembershipPlan, RecentPayment
from . serializer import AttendanceSerializer, UserSerializer ,MemberSerializer, RecentPaymentSerializer , MembershipPlanSerializer
from datetime import date

@api_view(['POST'])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"msg":"User Created"},status=status.HTTP_201_CREATED)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

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
    payments = RecentPayment.objects.all()
    serializer = RecentPaymentSerializer(payments, many=True)
    return Response(serializer.data)

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
        serializer.save(user=request.user)
        return Response(serializer.data,status=status.HTTP_201_CREATED)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment(request):
    serializer = RecentPaymentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data,status=status.HTTP_201_CREATED)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_attendance(request):
    serializer = AttendanceSerializer(data=request.data)
    if serializer.is_valid():
        member = serializer.validated_data['member']
        if Attendance.objects.filter(user=request.user,member=member,date=date.today()).exists():
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