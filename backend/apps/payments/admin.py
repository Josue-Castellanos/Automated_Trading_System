from django.contrib import admin

from .models import BillingAddress, PaymentMethod, Transaction


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ("user", "brand", "last4", "is_default", "created_at")
    list_filter = ("brand", "is_default", "created_at")
    search_fields = ("user__email", "last4")
    ordering = ("-created_at",)


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ("user", "amount", "currency", "status", "created_at")
    list_filter = ("status", "currency", "created_at")
    search_fields = ("user__email", "stripe_payment_intent_id")
    ordering = ("-created_at",)


@admin.register(BillingAddress)
class BillingAddressAdmin(admin.ModelAdmin):
    list_display = ("user", "name", "city", "state", "country")
    search_fields = ("user__email", "name", "city", "state")
    ordering = ("user__email",)
