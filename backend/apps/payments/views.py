from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import PaymentMethod, Transaction, BillingAddress
from .serializers import (
    PaymentMethodSerializer,
    TransactionSerializer,
    BillingAddressSerializer
)
from backend.apps.common.permissions import IsOwner

class PaymentMethodViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentMethodSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return PaymentMethod.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        payment_method = self.get_object()
        payment_method.is_default = True
        payment_method.save()
        return Response({'status': 'default payment method set'})

class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

class BillingAddressViewSet(viewsets.ModelViewSet):
    serializer_class = BillingAddressSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_object(self):
        return get_object_or_404(BillingAddress, user=self.request.user)

    def get_queryset(self):
        return BillingAddress.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        try:
            # If billing address exists, update it
            billing_address = self.get_object()
            serializer = self.get_serializer(billing_address, data=request.data)
        except:
            # If it doesn't exist, create new one
            serializer = self.get_serializer(data=request.data)
        
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data)