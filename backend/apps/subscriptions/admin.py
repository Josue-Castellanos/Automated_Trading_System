from django.contrib import admin
from .models import Subscription



class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'price', 'start_date', 'end_date', 'is_trial', 'active', 'status')
    list_filter = ('plan', 'is_trial', 'active', 'start_date')
    search_fields = ('user__email', 'user__username', 'id', 'primary_key_id')
admin.site.register(Subscription, SubscriptionAdmin)
