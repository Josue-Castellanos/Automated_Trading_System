from django.urls import path
from .views import SubscriptionView, SubscriptionActionView

urlpatterns = [
    path('subscribe/', SubscriptionView.as_view(), name='subscribe'),
    path('subscription/action/', SubscriptionActionView.as_view(), name='subscription-action'),
]