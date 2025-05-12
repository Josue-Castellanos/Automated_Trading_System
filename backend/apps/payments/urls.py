from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (BillingAddressViewSet, PaymentMethodViewSet,
                    TransactionViewSet)

router = DefaultRouter()
router.register(
    r"payment-methods",
    PaymentMethodViewSet,
    basename="payment-method"
)
router.register(
    r"transactions",
    TransactionViewSet,
    basename="transaction"
)
router.register(
    r"billing-address",
    BillingAddressViewSet,
    basename="billing-address"
)

urlpatterns = [
    path("", include(router.urls)),
]
