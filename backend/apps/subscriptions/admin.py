from django.contrib import admin
from .models import UserSubscription



class UserSubscriptionAdmin(admin.ModelAdmin):
    list_display = ("id", 'primary_key_id', 'user', 'plan_type', 'price', 'end_date', 'is_trial')
    list_filter = ('end_date', 'is_trial', 'plan_type')
    list_display_links = ('id', 'primary_key_id', 'user') 

admin.site.register(UserSubscription, UserSubscriptionAdmin)
