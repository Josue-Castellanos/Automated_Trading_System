import logging

from django.contrib.auth import get_user_model
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

# from backend.apps.subscriptions.models import Subscription

from .models import BillingAddress, PaymentMethod, Transaction

logger = logging.getLogger(__name__)
User = get_user_model()


@receiver(post_save, sender=Transaction)
def update_subscription_status(sender, instance, created, **kwargs):
    """
    Updates subscription status based on successful payment
    """
    if created and instance.status == "successful" and instance.subscription:
        subscription = instance.subscription
        if subscription.status == "inactive":
            subscription.active = True
            subscription.save()
            logger.info(
                f"Subscription reactivated for user {instance.user.email}"
            )


@receiver(post_save, sender=PaymentMethod)
def ensure_default_payment_method(sender, instance, created, **kwargs):
    """
    Ensures user always has a default payment method
    """
    if (
        created
        and not PaymentMethod.objects.filter(
            user=instance.user, is_default=True
        ).exists()
    ):
        instance.is_default = True
        instance.save()
        logger.info(
            f"Default payment method set for user {instance.user.email}"
        )


@receiver(pre_save, sender=BillingAddress)
def sync_billing_address(sender, instance, **kwargs):
    """
    Syncs billing address with profile
    """
    if instance.profile:
        instance.profile.city = instance.city
        instance.profile.country = instance.country
        instance.profile.save()
        logger.info(f"Profile address synced for user {instance.user.email}")


@receiver(post_save, sender=Transaction)
def update_profile_payment_status(sender, instance, created, **kwargs):
    """
    Updates profile payment status on successful transaction
    """
    if created and instance.status == "successful":
        profile = instance.profile
        profile.last_payment_date = instance.created_at
        profile.save()
        logger.info(
            f"Profile payment status updated for user {instance.user.email}"
        )
