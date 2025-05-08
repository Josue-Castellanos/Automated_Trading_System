from django.apps import AppConfig


class ProfilesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "backend.apps.profiles"

    def ready(self):
        from backend.apps.profiles import signals