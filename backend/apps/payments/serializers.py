from rest_framework import serializers
from .models import PaymentMethod, Transaction, BillingAddress
from backend.apps.profiles.serializers import ProfileSerializer
from backend.apps.subscriptions.serializers import SubscriptionSerializer

class PaymentMethodSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    
    class Meta:
        model = PaymentMethod
        fields = [
            'id', 'type', 'brand', 'last4', 'expiry_month',
            'expiry_year', 'is_default', 'created_at', 'profile'
        ]
        read_only_fields = ['id', 'created_at', 'profile']

    def create(self, validated_data):
        user = self.context['request'].user
        profile = user.profile
        validated_data['user'] = user
        validated_data['profile'] = profile
        return super().create(validated_data)

class TransactionSerializer(serializers.ModelSerializer):
    payment_method_details = serializers.SerializerMethodField()
    profile = ProfileSerializer(read_only=True)
    subscription = SubscriptionSerializer(read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'amount', 'currency', 'status', 'description',
            'created_at', 'payment_method_details', 'receipt_url',
            'profile', 'subscription'
        ]
        read_only_fields = ['id', 'created_at', 'profile', 'subscription']

    def get_payment_method_details(self, obj):
        if obj.payment_method:
            return {
                'brand': obj.payment_method.brand,
                'last4': obj.payment_method.last4,
                'expiry_month': obj.payment_method.expiry_month,
                'expiry_year': obj.payment_method.expiry_year,
            }
        return None

class BillingAddressSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    
    class Meta:
        model = BillingAddress
        fields = [
            'id', 'name', 'line1', 'line2', 'city',
            'state', 'postal_code', 'country', 'profile'
        ]
        read_only_fields = ['id', 'profile']

    def create(self, validated_data):
        user = self.context['request'].user
        profile = user.profile
        validated_data['user'] = user
        validated_data['profile'] = profile
        return super().create(validated_data)