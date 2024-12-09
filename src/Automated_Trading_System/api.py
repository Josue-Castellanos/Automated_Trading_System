from ninja import Schema
from ninja_jwt.controller import NinjaJWTDefaultController
from ninja_jwt.authentication import JWTAuth
from ninja_extra import NinjaExtraAPI
from .services import app_service

# ****************** API Endpoints (Optional for Internal Use) ******************
    # Use Case: APIs are useful for external consumers, such as:
        # A mobile app.
        # Another website or system running on a different server.
    ## I plan to integrate my backend with external applications in the future, so it's good to keep the API endpoints.
    ## Internally (on the same EC2 instance), calling my own APIs via requests.get() creates unnecessary overhead int the network and increases latency
# *******************************************************************************

api = NinjaExtraAPI()
api.register_controllers(NinjaJWTDefaultController)


class UserSchema(Schema):
    username: str
    is_authenticated: bool
    # is not request.user.is_authenticated
    email: str = None

@api.get("/hello")
def hello(request):
    print(request)
    return "Hello API"


@api.get("/me", response=UserSchema, auth=JWTAuth())
def me(request):
    return request.user


@api.get("/account_info")
def account_info(request):
    return app_service.get_account_data()


@api.get("/performance_sheet")
def performance_sheet(request):
    return app_service.get_performance_sheet()

