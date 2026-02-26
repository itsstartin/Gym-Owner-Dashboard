from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view , permission_classes
from rest_framework.response import Response
from rest_framework import status
from . models import Member , MembershipPlan, RecentPayment
from . serializer import MemberSerializer, RecentPaymentSerializer , MembershipPlanSerializer

@api_view(['POST'])
def register(request):
    username = request.data['username']
    password = request.data['password']
    if User.objects.filter(username=username).exists():
        return Response({"error":"User already exists"})
    User.objects.create_user(username=username,password=password)
    return Response({"msg":"User created"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_members(request):
    members = Member.objects.all()
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