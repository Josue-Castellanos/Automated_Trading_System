from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import SubscriptionPlan, UserSubscription
from .serializers import (
    SubscribeSerializer,
    SubscriptionActionSerializer,
    UserSubscriptionSerializer
)

class SubscriptionView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SubscribeSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            plan = SubscriptionPlan.objects.get(id=serializer.validated_data['plan_id'])
        except SubscriptionPlan.DoesNotExist:
            return Response({"error": "Plan not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Create or update subscription
        subscription, created = UserSubscription.objects.update_or_create(
            user=request.user,
            defaults={
                'plan': plan,
                'is_trial': serializer.validated_data['is_trial']
            }
        )
        
        return Response(
            UserSubscriptionSerializer(subscription).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )

class SubscriptionActionView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SubscriptionActionSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        action = serializer.validated_data['action']
        subscription = request.user.subscription
        
        if action == 'cancel':
            subscription.is_active = False
            subscription.save()
        elif action == 'reactivate':
            subscription.is_active = True
            subscription.save()
        elif action == 'upgrade':
            new_plan_id = serializer.validated_data.get('new_plan_id')
            if not new_plan_id:
                return Response(
                    {"error": "new_plan_id required for upgrade"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            try:
                new_plan = SubscriptionPlan.objects.get(id=new_plan_id)
            except SubscriptionPlan.DoesNotExist:
                return Response({"error": "Plan not found"}, status=status.HTTP_404_NOT_FOUND)
            
            subscription.plan = new_plan
            subscription.save()
        
        return Response(
            UserSubscriptionSerializer(subscription).data,
            status=status.HTTP_200_OK
        )

