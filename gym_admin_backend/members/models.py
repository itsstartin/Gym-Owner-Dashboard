from django.db import models
from django.core.validators import RegexValidator
from django.contrib.auth.models import User

phone_regex = RegexValidator(
    regex=r'^\+?\d{7,15}$',
    message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
)
# MEMBERSHIP_TYPE_CHOICES=[('basic','Basic'),('vip','VIP'),('premium','Premium')]
PAYMENT_TYPE_CHOICES=[('card','Card'),('cash','Cash'),('upi','UPI')]
# MEMBER_STATUS_CHOICES=[('active','Active'),('due','Due'),('expired','Expired')]
# Create your models here.
class Member(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    phone_number = models.CharField(
        validators=[phone_regex],
        max_length=16,
        unique=True
        )
    email =models.EmailField(null=True,unique=True)
    membership_plan=models.ForeignKey(
        'MembershipPlan',
        on_delete=models.SET_NULL,
        null=True,
        related_name='members'
        )
    total_cash_paid=models.FloatField(default=0.0,blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    membership_start_date=models.DateField()
    # status = models.CharField(
    #     max_length=20,
    #     choices=MEMBER_STATUS_CHOICES,
    #     default='active'
    #     )

    def __str__(self) :
        return self.name
    

class RecentPayment(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    member=models.ForeignKey('Member',on_delete=models.CASCADE,related_name='recentPayment')
    amount=models.FloatField()
    payment_type=models.CharField(
        max_length=20,
        choices=PAYMENT_TYPE_CHOICES,
        default='cash',
        )
    created_at=models.DateTimeField(auto_now_add=True,null=True)
    

class MembershipPlan(models.Model):
    name=models.CharField(max_length=20,unique=True)  # e.g., 'Basic', 'VIP', 'Premium'
    plan_price=models.FloatField()
    
    def __str__(self):
        return f"{self.name} - ₹{self.plan_price}"

class Attendance(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    member=models.ForeignKey('Member',on_delete=models.CASCADE,related_name='attendance')
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.member.name} - {self.date}"
