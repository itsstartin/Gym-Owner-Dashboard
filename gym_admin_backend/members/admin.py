from atexit import register
from django.contrib import admin
from . models import Attendance, AuditLog, GymUserProfile, Member, MembershipPlan, RecentPayment, Notification

# Register your models here
admin.site.register(Member)
admin.site.register(RecentPayment)
admin.site.register(MembershipPlan)
admin.site.register(Attendance)
admin.site.register(Notification)
admin.site.register(GymUserProfile)
admin.site.register(AuditLog)

