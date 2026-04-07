from django.urls import path
from . views import add_notification, create_payment, current_user, delete_attendance, get_attendance, get_calc, get_graph, get_member, get_members, create_member, get_notifications, get_overdue_members, get_payments, get_percent_stat_diff, get_plans, mark_attendance, mark_notification_read, member_access, member_access_get_attendance, member_access_mark_attendance, notify_overdue_member, send_attendance_mail_member, update_member, update_user_email

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
    path('member-access/<str:token>/getattendance',member_access_get_attendance,name="member_access_get_attendance"),
    path('member-access/<str:token>/markattendance',member_access_mark_attendance,name="member_access_mark_attendance"),
    path('overdue/notify',notify_overdue_member,name="notify_overdue_members"),
    path('attendance-mail',send_attendance_mail_member,name="send_attendance_mail_member"),
    path('addnotification',add_notification,name="add_notification"),
    path('getnotifications',get_notifications,name="get_notifications"),
    path('readnotification/<int:pk>',mark_notification_read,name="mark_notication_as_read"),
    path('update-user-email',update_user_email,name="update_user_email"),
    path('getpercentstatdiff',get_percent_stat_diff,name="get_percent_stat_diff"),
]