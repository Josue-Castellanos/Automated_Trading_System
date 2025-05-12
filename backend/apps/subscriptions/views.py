from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Plan, Subscription
from .serializers import SubscriptionSerializer

# from backend.apps.common.permissions import IsOwner


class SubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]  # , IsOwner]

    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user)


class UpgradeSubscriptionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        plan = request.data.get("plan")
        if not plan or plan not in Plan.values:
            return Response(
                {"error": "Invalid plan selected"},
                status=status.HTTP_400_BAD_REQUEST
            )

        subscription = request.user.subscription
        subscription.plan = plan
        subscription.is_trial = False
        subscription.active = True
        subscription.save()

        serializer = SubscriptionSerializer(subscription)
        return Response(serializer.data)


class CancelSubscriptionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        subscription = request.user.subscription
        subscription.active = False
        subscription.end_date = timezone.now()
        subscription.save()

        serializer = SubscriptionSerializer(subscription)
        return Response(serializer.data)


class ReactivateSubscriptionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        subscription = request.user.subscription
        subscription.active = True
        subscription.end_date = None
        subscription.save()

        serializer = SubscriptionSerializer(subscription)
        return Response(serializer.data)
