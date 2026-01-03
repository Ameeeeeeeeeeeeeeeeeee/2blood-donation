from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Donor, Hospital, DonationSchedule, DonationRecord


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'role', 'is_staff', 'date_joined']
    list_filter = ['role', 'is_staff', 'is_superuser']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Role', {'fields': ('role',)}),
    )


@admin.register(Donor)
class DonorAdmin(admin.ModelAdmin):
    list_display = ['user', 'age', 'phone', 'location', 'total_donations', 'lives_saved']
    list_filter = ['created_at']
    search_fields = ['user__username', 'user__email', 'phone', 'location']


@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    list_display = ['name', 'location', 'total_blood_received', 'total_lives_saved']
    search_fields = ['name', 'location']


@admin.register(DonationSchedule)
class DonationScheduleAdmin(admin.ModelAdmin):
    list_display = ['donor', 'scheduled_date', 'donation_type', 'status', 'created_at']
    list_filter = ['status', 'donation_type', 'scheduled_date']
    search_fields = ['donor__user__username']
    date_hierarchy = 'scheduled_date'


@admin.register(DonationRecord)
class DonationRecordAdmin(admin.ModelAdmin):
    list_display = ['schedule', 'hospital', 'donation_date', 'blood_amount']
    list_filter = ['donation_date', 'hospital']
    search_fields = ['schedule__donor__user__username', 'hospital__name']

