from django.urls import path

from .views import UpdateProfileAPIView, GetProfileAPIView


urlpatterns = [
    path(
        "me/", 
        GetProfileAPIView.as_view(), 
        name="get_profile"),
    path(
        "update/<str:username>/",
        UpdateProfileAPIView.as_view(),
        name="update_profile"),
    # path(
    #     "photo/<str:username>/",
    #     ProfilePhotoUploadView.as_view(),
    #     name="profile-photo-upload"
    # ),
]
