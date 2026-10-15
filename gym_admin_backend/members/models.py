import uuid
from django.db import models
from django.core.validators import RegexValidator
from django.contrib.auth.models import User
from django.utils import timezone
phone_regex = RegexValidator(
    regex=r'^\+?\d{7,15}$',
    message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
)
# MEMBERSHIP_TYPE_CHOICES=[('basic','Basic'),('vip','VIP'),('premium','Premium')]
PAYMENT_TYPE_CHOICES=[('card','Card'),('cash','Cash'),('upi','UPI')]
# MEMBER_STATUS_CHOICES=[('active','Active'),('due','Due'),('expired','Expired')]
# Create your models here.
class GymUserProfile(models.Model):
    OWNER = 'owner'
    TRAINER = 'trainer'
    FRONT_DESK = 'front_desk'
    ROLE_CHOICES = [
        (OWNER, 'Owner'),
        (TRAINER, 'Trainer'),
        (FRONT_DESK, 'Front Desk'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='gym_profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=OWNER)

    def __str__(self):
        return f'{self.user.username} ({self.get_role_display()})'


class AuditLog(models.Model):
    MEMBER_CREATED = 'member_created'
    MEMBER_UPDATED = 'member_updated'
    PAYMENT_RECORDED = 'payment_recorded'
    ATTENDANCE_MARKED = 'attendance_marked'
    ATTENDANCE_REMOVED = 'attendance_removed'
    SETTINGS_UPDATED = 'settings_updated'
    ACTION_CHOICES = [
        (MEMBER_CREATED, 'Member created'),
        (MEMBER_UPDATED, 'Member updated'),
        (PAYMENT_RECORDED, 'Payment recorded'),
        (ATTENDANCE_MARKED, 'Attendance marked'),
        (ATTENDANCE_REMOVED, 'Attendance removed'),
        (SETTINGS_UPDATED, 'Settings updated'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='audit_logs')
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='actions_performed')
    # Used for actions performed outside an authenticated staff session.
    actor_label = models.CharField(max_length=255, blank=True)
    action = models.CharField(max_length=32, choices=ACTION_CHOICES)
    target_type = models.CharField(max_length=32)
    target_id = models.PositiveBigIntegerField(null=True, blank=True)
    target_name = models.CharField(max_length=255)
    metadata_summary = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at'], name='audit_user_created_idx'),
            models.Index(fields=['user', 'action', 'created_at'], name='audit_user_action_idx'),
        ]


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
    access_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)


    def __str__(self) :
        return self.name

    class Meta:
        indexes = [
            models.Index(fields=['user', 'membership_start_date'], name='member_user_start_idx'),
        ]
    

class RecentPayment(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    member=models.ForeignKey('Member',on_delete=models.CASCADE,related_name='recentPayment')
    amount=models.FloatField()
    payment_type=models.CharField(
        max_length=20,
        choices=PAYMENT_TYPE_CHOICES,
        default='cash',
        )
    created_at=models.DateTimeField(default=timezone.now,null=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'created_at'], name='payment_user_created_idx'),
            models.Index(fields=['user', 'member', 'created_at'], name='payment_user_member_idx'),
        ]

class Notification(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    member=models.ForeignKey('Member',on_delete=models.CASCADE, null=True, blank=True)
    type=models.CharField(max_length=50)
    message = models.TextField()
    is_read=models.BooleanField(default=False)
    created_at=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.message

    class Meta:
        indexes = [
            models.Index(fields=['user', 'type', 'created_at'], name='notify_user_type_created_idx'),
            models.Index(fields=['user', 'member', 'type'], name='notify_user_member_type_idx'),
        ]


class MembershipPlan(models.Model):
    name=models.CharField(max_length=20,unique=True)  # e.g., 'Basic', 'VIP', 'Premium'
    plan_price=models.FloatField()
    
    def __str__(self):
        return f"{self.name} - ₹{self.plan_price}"

class Attendance(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    member=models.ForeignKey('Member',on_delete=models.CASCADE,related_name='attendance')
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.member.name} - {self.date}"

    class Meta:
        indexes = [
            models.Index(fields=['user', 'date'], name='attendance_user_date_idx'),
            models.Index(fields=['member', 'date'], name='attendance_member_date_idx'),
        ]
