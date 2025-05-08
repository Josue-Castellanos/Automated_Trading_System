from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .exceptions import NotYourProfile, ProfileNotFound
from backend.apps.subscriptions.models import UserSubscription
from .models import Profile
from .renders import ProfileJSONRenderer
from .serializers import ProfileSerializer, UpdateProfileSerializer
from backend.apps.subscriptions.serializers import UserSubscriptionSerializer

# Get all Pro members (now based on active Pro subscriptions)
class ProMemberListAPIView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProfileSerializer
    
    def get_queryset(self):
        return Profile.objects.filter(
            user__subscription__plan__name="Pro",
            user__subscription__is_active=True,
            user__subscription__end_date__gt=timezone.now()
        ).select_related("user")
    
    

# Get all Basic members (now based on active Basic subscriptions)
class BasicMemberListAPIView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProfileSerializer
    
    def get_queryset(self):
        # Get profiles with active Basic subscriptions
        basic_user_ids = UserSubscription.objects.filter(
            plan__name="Basic",
            is_active=True,
            end_date__gt=timezone.now()
        ).values_list('user_id', flat=True)
        return Profile.objects.filter(user_id__in=basic_user_ids)


class GetProfileAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    renderer_classes = [ProfileJSONRenderer]

    def get(self, request):
        try:
            user_profile = Profile.objects.get(user=request.user)
            serializer = ProfileSerializer(user_profile, context={"request": request, "plans": UserSubscription.objects.all() })
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Profile.DoesNotExist:
            raise ProfileNotFound
        

class UpdateProfileAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    renderer_classes = [ProfileJSONRenderer]
    serializer_class = UpdateProfileSerializer

    def patch(self, request, username):
        try:
            profile = Profile.objects.get(user__username=username)
        except Profile.DoesNotExist:
            raise ProfileNotFound
        
        if request.user.username != username:
            raise NotYourProfile
        
        serializer = UpdateProfileSerializer(
            instance=profile,  # Fixed typo from "isinstance" to "instance"
            data=request.data,
            partial=True,
            context={"request": request}
        )
        
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserSubscriptionAPIView(APIView):
    def get(self, request):
        subscription = UserSubscription.objects.filter(user=request.user).first()
        if not subscription:
            return Response({"subscription": None}, status=status.HTTP_200_OK)
        serializer = UserSubscriptionSerializer(subscription)
        return Response(serializer.data, status=status.HTTP_200_OK)