from django_countries.serializer_fields import CountryField
from rest_framework import serializers
from .models import Profile
from backend.apps.subscriptions.serializers import UserSubscriptionSerializer

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username")
    first_name = serializers.CharField(source="user.first_name")
    last_name = serializers.CharField(source="user.last_name")
    email = serializers.EmailField(source="user.email")
    full_name = serializers.SerializerMethodField(read_only=True)
    country = CountryField(name_only=True)
    plan_name = serializers.CharField(source='get_plan_type_display', read_only=True)

    class Meta:
        model = Profile
        fields = [
            "plan_name", "username", "first_name", "last_name", "full_name", 
            "email", "id", "phone_number", "profile_photo", 
            "about_me", "gender", "country", "city", "subscription"
        ]
    
    def get_full_name(self, obj):
        first_name = obj.user.first_name.title()
        last_name = obj.user.last_name.title()
        return f"{first_name} {last_name}"
    
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.top_agent:
            representation["top_agent"] = True
        return representation
        

class UpdateProfileSerializer(serializers.ModelSerializer):
    country = CountryField(name_only=True)
    
    class Meta:
        model = Profile
        fields = [
            "profile_photo", "about_me", "gender", 
            "phone_number", "country", "city", "subscription"
        ]
    
    # def to_representation(self, instance):
    #     representation = super().to_representation(instance)
    #     if instance.pro_member:
    #         representation["top_agent"] = True
    #     return representation
    
