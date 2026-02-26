from rest_framework import serializers
from . models import Member, RecentPayment, MembershipPlan

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