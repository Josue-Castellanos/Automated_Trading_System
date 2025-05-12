from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (CancelSubscriptionView, ReactivateSubscriptionView,
                    SubscriptionViewSet, UpgradeSubscriptionView)

router = DefaultRouter()
router.register(r"subscriptions", SubscriptionViewSet, basename="subscription")

urlpatterns = [
    path("upgrade/", UpgradeSubscriptionView.as_view(), name="subscription-upgrade"),
    path("cancel/", CancelSubscriptionView.as_view(), name="subscription-cancel"),
    path(
        "reactivate/",
        ReactivateSubscriptionView.as_view(),
        name="subscription-reactivate",
    ),
] + router.urls
