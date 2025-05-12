from django.urls import path
from .views import (
    SubscriptionViewSet,
    UpgradeSubscriptionView,
    CancelSubscriptionView,
    ReactivateSubscriptionView
)
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')

urlpatterns = [
    path('upgrade/', UpgradeSubscriptionView.as_view(), name='subscription-upgrade'),
    path('cancel/', CancelSubscriptionView.as_view(), name='subscription-cancel'),
    path('reactivate/', ReactivateSubscriptionView.as_view(), name='subscription-reactivate'),
] + router.urls