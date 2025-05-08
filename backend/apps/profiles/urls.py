from django.urls import path

from .views import (ProMemberListAPIView, BasicMemberListAPIView, GetProfileAPIView, UpdateProfileAPIView)

urlpatterns = [
    path("me/", GetProfileAPIView.as_view(), name="get_profile"),
    path("update/<str:username>/", UpdateProfileAPIView.as_view(), name="update_profile"),
    path("members/pro/all", ProMemberListAPIView.as_view(), name="all_pro_members"),
    path("members/basic/all", BasicMemberListAPIView.as_view(), name="all_basic_members"),
]