from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from backend.apps.common.models import TimeStampedUUIDModel
from decimal import Decimal

User = get_user_model()

class Plan(models.TextChoices):
    BASIC = "Basic", _("Basic")
    PRO = "Pro", _("Pro")
    ELITE = "Elite", _("Elite")


PLAN_PRICES = {
    Plan.BASIC: Decimal("0.00"),
    Plan.PRO: Decimal("49.99"),
    Plan.ELITE: Decimal("149.99"),
}

class Subscription(TimeStampedUUIDModel):
    user = models.OneToOneField(User, related_name="subscription", on_delete=models.CASCADE)
    plan = models.CharField(verbose_name=_("Plan"), max_length=10, choices=Plan.choices, default=Plan.PRO)
    price = models.DecimalField(verbose_name=_("Price"), max_digits=6, decimal_places=2, editable=False)
    start_date = models.DateTimeField(verbose_name=_("Start Date"), auto_now_add=True)
    end_date = models.DateTimeField(verbose_name=_("End Date"), null=True, blank=True)
    is_trial = models.BooleanField(default=False)
    active = models.BooleanField(default=True)
    
    def save(self, *args, **kwargs):
        self.price = PLAN_PRICES[self.plan]
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.email} - {self.get_plan_display()} ({self.status})"

    @property
    def status(self):
        if not self.active:
            return "Inactive"
        if self.is_trial:
            return "Trial"
        return "Active"

    @property
    def features(self):
        base_features = ["Basic Access", "Community Support"]
        pro_features = ["Advanced Features", "Priority Support", "API Access"]
        elite_features = ["Custom Solutions", "Dedicated Support", "White Label"]
        
        if self.plan == Plan.BASIC:
            return base_features
        elif self.plan == Plan.PRO:
            return base_features + pro_features
        else:
            return base_features + pro_features + elite_features