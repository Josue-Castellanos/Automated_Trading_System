from rest_framework import serializers
from .models import Subscription
from django.utils import timezone


class SubscriptionSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    plan_name = serializers.CharField(source='get_plan_display', read_only=True)
    features = serializers.SerializerMethodField()
    status = serializers.CharField(read_only=True)

    class Meta:
        model = Subscription
        fields = [
            'id',
            'username',
            'email',
            'plan',
            'plan_name',
            'price',
            'start_date',
            'end_date',
            'is_trial',
            'active',
            'status',
            'features'
        ]
        read_only_fields = ['price', 'start_date', 'status']


    def get_features(self, obj):
        """Returns the feature list for the plan"""
        return obj.features

    def to_representation(self, instance):
        """Custom representation to handle trial status"""
        data = super().to_representation(instance)
        if instance.is_trial and instance.end_date:
            trial_days = (instance.end_date - timezone.now()).days
            data['trial_days_remaining'] = max(0, trial_days)
        return data