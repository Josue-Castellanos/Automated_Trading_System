from rest_framework import serializers
from .models import UserSubscription, timezone


class UserSubscriptionSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    plan_name = serializers.CharField(source='get_plan_type_display', read_only=True)
    status = serializers.SerializerMethodField()
    features = serializers.SerializerMethodField()

    class Meta:
        model = UserSubscription
        fields = [
            'id',
            'username',
            'email',
            'plan_type',
            'plan_name',
            'price',
            'start_date',
            'end_date',
            'is_trial',
            'status',
            'features'
        ]
        extra_kwargs = {
            'plan_type': {'write_only': True} 
        }

    def get_status(self, obj):
        """Returns 'active' or 'expired' based on end_date"""
        return obj.status

    def get_features(self, obj):
        """Returns the feature list for the plan"""
        return obj.features

    def to_representation(self, instance):
        """Custom representation to handle trial status"""
        data = super().to_representation(instance)
        if instance.is_trial:
            data['trial_days_remaining'] = (instance.end_date - timezone.now()).days
        return data