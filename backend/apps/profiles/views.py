from rest_framework import permissions, status, viewsets
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from backend.apps.common.permissions import IsOwner

from .models import Profile
from .serializers import ProfileSerializer, UpdateProfileSerializer


class ProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Profile.objects.filter(user=self.request.user)


class UpdateProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        profile = request.user.profile
        serializer = UpdateProfileSerializer(
            profile,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class ProfilePhotoUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile = request.user.profile

        if "profile_photo" not in request.FILES:
            return Response(
                {"error": "No photo provided"},
                status=status.HTTP_400_BAD_REQUEST
            )

        profile.profile_photo = request.FILES["profile_photo"]
        profile.save()

        serializer = ProfileSerializer(profile)
        return Response(serializer.data)
