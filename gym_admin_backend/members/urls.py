from django.urls import path
from . views import create_payment, current_user, delete_attendance, get_attendance, get_calc, get_graph, get_member, get_members, create_member, get_overdue_members, get_payments, get_plans, mark_attendance, member_access, update_member

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
    path('getcalc',get_calc,name="get_calculation"),
    path('getgraph',get_graph,name="get_graph"),
    path('user',current_user,name="current_user"),
    path('overdue',get_overdue_members,name="get_overdue_members"),
    path('member-access/<str:token>',member_access,name="member_access"),
]