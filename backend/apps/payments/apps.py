from django.apps import AppConfig


class PaymentsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "backend.apps.payments"
    verbose_name = 'Payments'

    def ready(self):
        from backend.apps.payments import signals
