import logging

from django.conf import settings
# Create your tests here.
from django.core.mail import send_mail
# from django.test import TestCase

logger = logging.getLogger(__name__)


def send_notification_email(subject, message, recipient_list):
    """
    Utility function to send notification emails
    """
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            fail_silently=False,
        )
        logger.info(f"Email sent successfully to {recipient_list}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return False


def format_currency(amount, currency="USD"):
    """
    Utility function to format currency amounts
    """
    try:
        return "{:.2f} {}".format(float(amount), currency)
    except (ValueError, TypeError):
        return "0.00 {}".format(currency)


def get_client_ip(request):
    """
    Utility function to get client IP address
    """
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0]
    else:
        ip = request.META.get("REMOTE_ADDR")
    return ip
