from __future__ import absolute_import
import os
from celery import Celery
from backend.settings import base

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings.development")

app = Celery("backend")

app.config_from_object("backend.settings.development", namespace="CELERY"),

app.autodiscover_tasks(lambda: base.INSTALLED_APPS)

