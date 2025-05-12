from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from backend.apps.common.models import TimeStampedUUIDModel
from backend.apps.subscriptions.models import Subscription
from backend.apps.profiles.models import Profile

User = get_user_model()

class PaymentMethod(TimeStampedUUIDModel):
    CARD_TYPES = (
        ('credit', 'Credit Card'),
        ('debit', 'Debit Card'),
    )

    CARD_BRANDS = (
        ('visa', 'Visa'),
        ('mastercard', 'Mastercard'),
        ('amex', 'American Express'),
        ('discover', 'Discover'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_methods')
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='payment_methods')
    type = models.CharField(max_length=20, choices=CARD_TYPES)
    brand = models.CharField(max_length=20, choices=CARD_BRANDS)
    last4 = models.CharField(max_length=4)
    expiry_month = models.IntegerField()
    expiry_year = models.IntegerField()
    is_default = models.BooleanField(default=False)
    stripe_payment_method_id = models.CharField(max_length=255, unique=True)

    class Meta:
        ordering = ['-is_default', '-created_at']
        unique_together = ['user', 'stripe_payment_method_id']

    def __str__(self):
        return f"{self.brand} **** {self.last4} - {self.user.email}"

    def save(self, *args, **kwargs):
        if self.is_default:
            PaymentMethod.objects.filter(user=self.user).update(is_default=False)
        elif not PaymentMethod.objects.filter(user=self.user).exists():
            self.is_default = True
        super().save(*args, **kwargs)

class Transaction(TimeStampedUUIDModel):
    STATUS_CHOICES = (
        ('successful', 'Successful'),
        ('pending', 'Pending'),
        ('failed', 'Failed'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='transactions')
    subscription = models.ForeignKey(Subscription, on_delete=models.SET_NULL, null=True, related_name='transactions')
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.SET_NULL, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    description = models.CharField(max_length=255)
    stripe_payment_intent_id = models.CharField(max_length=255, unique=True)
    receipt_url = models.URLField(null=True, blank=True)
    billing_address = models.ForeignKey('BillingAddress', on_delete=models.SET_NULL, null=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['status', '-created_at']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.amount} {self.currency} - {self.status}"

class BillingAddress(TimeStampedUUIDModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='billing_address')
    profile = models.OneToOneField(Profile, on_delete=models.CASCADE, related_name='billing_address')
    name = models.CharField(max_length=255)
    line1 = models.CharField(max_length=255)
    line2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=255)
    state = models.CharField(max_length=255)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=2, default='US')

    class Meta:
        verbose_name_plural = 'Billing addresses'
        indexes = [
            models.Index(fields=['user', 'country']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.city}, {self.state}"