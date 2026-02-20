from django.urls import path
from . views import create_payment, get_member, create_member, get_plans

urlpatterns = [
    path('get', get_member , name='get_member'),
    path('create',create_member , name ='create_member'),
    path('pay',create_payment , name='create_payment'),
    path('getplans',get_plans , name = 'get_plans')
]