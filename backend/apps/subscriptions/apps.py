# flake8: noqa: F401
from django.apps import AppConfig


class SubscriptionsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "backend.apps.subscriptions"

    def ready(self):
        # Import signals to connect them
        from backend.apps.subscriptions import signals
