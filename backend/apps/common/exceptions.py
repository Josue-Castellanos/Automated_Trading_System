from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.views import exception_handler


class PaymentError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "A payment error occurred."
    default_code = "payment_error"


class SubscriptionError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "A subscription error occurred."
    default_code = "subscription_error"


class ProfileNotFound(APIException):
    status_code = 404
    default_detail = "The requested profile does not exist"
    deafault_code = "not_found_error"


class NotYourProfile(APIException):
    status_code = 403
    default_detail = "You can't edit a profile that doesn't belong to you"
    default_code = "profile_error"


def custom_exception_handler(exc, context):
    """Custom exception handler for better error responses"""
    response = exception_handler(exc, context)

    if response is not None:
        response.data["status_code"] = response.status_code

    return response
