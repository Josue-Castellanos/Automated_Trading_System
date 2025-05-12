import logging

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from backend.settings.base import AUTH_USER_MODEL

from .models import Plan, Subscription

logger = logging.getLogger(__name__)


@receiver(post_save, sender=AUTH_USER_MODEL)
def create_initial_subscription(sender, instance, created, **kwargs):
    """
    Creates subscription based on user's signup plan selection
    """
    if not created:
        return

    try:
        if instance.is_superuser:
            plan = Plan.ELITE
            is_trial = False
            end_date = None
        else:
            plan = Plan.PRO
            is_trial = True
            end_date = timezone.now() + timezone.timedelta(days=7)

        Subscription.objects.create(
            user=instance,
            is_trial=is_trial,
            plan=plan,
            end_date=end_date,
            active=True
        )
        logger.info(f"Subscription created for {instance.email}")

    except Exception as e:
        logger.error(
            f"Subscription creation failed for {instance.email}: {str(e)}"
        )


@receiver(post_save, sender=Subscription)
def update_profile_subscription(sender, instance, created, **kwargs):
    """
    Updates the profile's subscription
    reference when subscription is created/updated
    """
    if hasattr(instance.user, "profile"):
        instance.user.profile.subscription = instance
        instance.user.profile.save()
        logger.info(f"Profile subscription updated for {instance.user.email}")
