from django.urls import path
from . views import create_payment, delete_attendance, get_attendance, get_member, get_members, create_member, get_payments, get_plans, mark_attendance, update_member

urlpatterns = [
    path('get', get_members , name='get_member'),
    path('get/<int:id>',get_member , name = 'get_member'),
    path('getpayments',get_payments, name='get_payments'),
    path('create',create_member , name ='create_member'),
    path('pay',create_payment , name='create_payment'),
    path('getplans',get_plans , name = 'get_plans'),
    path('update/<int:id>',update_member, name = 'update_member'),
    path('markattendance',mark_attendance,name='mark_attendance'),
    path('getattendance/<int:id>',get_attendance,name='get_attendance'),
    path('deleteattendance/<int:id>',delete_attendance,name='delete_attendance'),
]