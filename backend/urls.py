from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from backend.views import (api_market_phase, api_price_history)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("djoser.urls")),
    path("api/v1/auth/", include("djoser.urls.jwt")),
    path("api/v1/profile/", include("backend.apps.profiles.urls")),
    path("api/price_history/", api_price_history, name="api_price_history"),
    path("api/market_phase/", api_market_phase, name="api_market_phase"),
]

admin.site.site_header = "AlgoChart Admin"
admin.site.site_title = "AlgoChart Admin Portal"
admin.site.index_title = "Welcome to the AlgoChart Portal"
