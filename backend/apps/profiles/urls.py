from django.urls import path
from .views import (
    ProfileViewSet,
    UpdateProfileView,
    ProfilePhotoUploadView
)
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'profiles', ProfileViewSet, basename='profile')

urlpatterns = [
    path('profile/update/', UpdateProfileView.as_view(), name='profile-update'),
    path('profile/photo/', ProfilePhotoUploadView.as_view(), name='profile-photo-upload'),
] + router.urls