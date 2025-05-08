from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from backend.apps.common.models import TimeStampedUUIDModel

User = get_user_model()

class UserSubscription(TimeStampedUUIDModel):
    BASIC = 'basic'
    PRO = 'pro'
    
    PLAN_CHOICES = [
        (BASIC, 'Basic ($49.99)'),
        (PRO, 'Pro ($99.99)'),
    ]
    
    PRICES = {
        BASIC: 49.99,
        PRO: 99.99
    }

    user = models.OneToOneField(User, related_name="subscription", on_delete=models.CASCADE)
    plan_type = models.CharField(max_length=20, choices=PLAN_CHOICES, default=BASIC)
    price = models.DecimalField(max_digits=6, decimal_places=2, default=PRICES.get("BASIC"), editable=False)
    end_date = models.DateTimeField()
    is_trial = models.BooleanField(default=True)


    def save(self, *args, **kwargs):
        # Auto-set price
        if not self.price:
            self.price = self.PRICES.get(self.plan_type, 0.00)
        
        # Auto-set trial end date
        if self.is_trial and not self.end_date:
            self.end_date = self.created_at + timezone.timedelta(days=7)
            
        super().save(*args, **kwargs)

    @property
    def status(self):
        return "Active" if self.end_date > timezone.now() else "Expired"

    @property
    def features(self):
        return {
            self.BASIC: ["Basic Feature 1", "Basic Feature 2"],
            self.PRO: ["All Features", "Priority Support"]
        }.get(self.plan_type, [])

    @property
    def days_remaining(self):
        return (self.end_date - timezone.now()).days if self.end_date else 0
    
    def __str__(self):
        return f"{self.user.email} - {self.get_plan_type_display()} ({self.status})"