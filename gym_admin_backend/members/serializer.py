from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from . models import Attendance, Member, RecentPayment, MembershipPlan
from datetime import date

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
    status=serializers.SerializerMethodField()
    class Meta:
        model = Member
        fields = '__all__'
        extra_kwargs = {
            'user': {'read_only': True}
        }
    def get_status(self, obj):
        today=date.today()
        total_paid=obj.total_cash_paid
        plan_price=obj.membership_plan.plan_price
        current_validity=total_paid/plan_price
        current_validity=current_validity * 30
        start_date=obj.membership_start_date
        expected_validity_diff= today - start_date
        expected_validity= expected_validity_diff.days
        if 0 < (current_validity - expected_validity) < 4 :
            return "due"
        elif expected_validity < current_validity:
            return "active"
        elif expected_validity > current_validity:
            return "expired"
        return "active"

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