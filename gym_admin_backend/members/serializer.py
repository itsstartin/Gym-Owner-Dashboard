from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from . models import Attendance, Member, RecentPayment, MembershipPlan

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username','email','password']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    def validate_password(self,value):
        validate_password(value)
        return value
    def create(self,validated_data):
        return User.objects.create_user(**validated_data)

class MembershipPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipPlan
        fields = ['id', 'name', 'plan_price']
        

class MemberSerializer(serializers.ModelSerializer):
    membership_plan = MembershipPlanSerializer(read_only=True)
    membership_plan_id = serializers.PrimaryKeyRelatedField(
        queryset=MembershipPlan.objects.all(),
        source='membership_plan',
        write_only=True,
        required=False
    )
    class Meta:
        model = Member
        fields = '__all__'
        extra_kwargs = {
            'user': {'read_only': True}
        }

class RecentPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecentPayment
        fields = '__all__'
        extra_kwargs = {
            'user': {'read_only': True}
        }

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = ['member','date']
        extra_kwargs = {
            'user': {'read_only': True}
        }