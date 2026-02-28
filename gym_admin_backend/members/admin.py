from atexit import register
from django.contrib import admin
from . models import Attendance, Member, MembershipPlan, RecentPayment

# Register your models here
admin.site.register(Member)
admin.site.register(RecentPayment)
admin.site.register(MembershipPlan)
admin.site.register(Attendance)

