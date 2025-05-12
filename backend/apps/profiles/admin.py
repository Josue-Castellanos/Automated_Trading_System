from django.contrib import admin

from .models import Profile


class ProfileAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "primary_key_id",
        "user",
        "gender",
        "phone_number",
        "country",
        "city",
        "created_at",
    ]
    list_filter = ["gender", "country", "city"]
    list_display_links = ["id", "primary_key_id", "user"]
    search_fields = ("user__email", "user__username", "phone_number")


admin.site.register(Profile, ProfileAdmin)
