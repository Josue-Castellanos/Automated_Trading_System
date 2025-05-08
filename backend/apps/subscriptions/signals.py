from django.utils import timezone
import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from backend.settings.base import AUTH_USER_MODEL
from .models import UserSubscription


logger = logging.getLogger(__name__)

@receiver(post_save, sender=AUTH_USER_MODEL)
def create_initial_subscription(sender, instance, created, **kwargs):
    """
    Creates subscription based on user's signup plan selection
    """
    if not created or instance.signup_plan == instance.NO_PLAN:
        return
        
    try:
        # Determine trial duration based on plan
        trial_days = {
            instance.BASIC_TRIAL: 7,
            instance.PRO_TRIAL: 7
        }.get(instance.signup_plan, 0)
        
        # Get the corresponding plan type
        plan_type = {
            instance.BASIC_TRIAL: UserSubscription.BASIC,
            instance.PRO_TRIAL: UserSubscription.PRO
        }.get(instance.signup_plan)
        
        UserSubscription.objects.create(
            user=instance,
            plan_type=plan_type,
            is_trial=True,
            end_date=timezone.now() + timezone.timedelta(days=trial_days)
        )
        
    except Exception as e:
        # Log error if needed
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Subscription creation failed for {instance.email}: {str(e)}")


@receiver(post_save, sender=AUTH_USER_MODEL)
def save_user_subscription(sender, instance, **kwargs):
    instance.subscription.save()
    logger.info(f"{instance}'s trial created")