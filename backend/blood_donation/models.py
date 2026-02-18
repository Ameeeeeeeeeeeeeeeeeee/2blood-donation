from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class User(AbstractUser):
    """Custom user model with role field"""
    ROLE_CHOICES = [
        ('donor', 'Donor'),
        ('admin', 'Admin'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='donor')
    
    def __str__(self):
        return self.username


class Donor(models.Model):
    """Donor profile model"""
    BLOOD_TYPE_CHOICES = [
        ('A+', 'A+'),
        ('A-', 'A-'),
        ('B+', 'B+'),
        ('B-', 'B-'),
        ('AB+', 'AB+'),
        ('AB-', 'AB-'),
        ('O+', 'O+'),
        ('O-', 'O-'),
        ('None', 'None'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='donor_profile')
    age = models.IntegerField(validators=[MinValueValidator(18), MaxValueValidator(100)], null=True, blank=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Weight in kilograms")
    phone = models.CharField(max_length=20, blank=True, default='')
    location = models.CharField(max_length=255, blank=True, default='')
    blood_type = models.CharField(max_length=4, choices=BLOOD_TYPE_CHOICES, blank=True, null=True)
    health_info = models.TextField(blank=True, null=True)
    profile_image = models.ImageField(upload_to='donor_profiles/', blank=True, null=True)
    total_donations = models.IntegerField(default=0)
    lives_saved = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - Donor"
    
    class Meta:
        verbose_name = "Donor"
        verbose_name_plural = "Donors"


class Hospital(models.Model):
    """Hospital model"""
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    total_blood_received = models.IntegerField(default=0)
    total_lives_saved = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Hospital"
        verbose_name_plural = "Hospitals"


class DonationSchedule(models.Model):
    """Donation schedule model"""
    DONATION_TYPE_CHOICES = [
        ('station', 'Come to Station'),
        ('home', 'Come to Me'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('done', 'Done'),
        ('canceled', 'Canceled'),
    ]
    
    donor = models.ForeignKey(Donor, on_delete=models.CASCADE, related_name='schedules')
    preferred_hospital = models.ForeignKey(Hospital, on_delete=models.SET_NULL, null=True, blank=True, related_name='scheduled_donations')
    scheduled_date = models.DateTimeField()
    donation_type = models.CharField(max_length=10, choices=DONATION_TYPE_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.donor.user.username} - {self.scheduled_date.strftime('%Y-%m-%d %H:%M')}"
    
    class Meta:
        verbose_name = "Donation Schedule"
        verbose_name_plural = "Donation Schedules"
        ordering = ['-scheduled_date']


class DonationRecord(models.Model):
    """Donation record model for completed donations"""
    schedule = models.OneToOneField(DonationSchedule, on_delete=models.CASCADE, related_name='record')
    hospital = models.ForeignKey(Hospital, on_delete=models.SET_NULL, null=True, blank=True, related_name='donations')
    donation_date = models.DateTimeField(auto_now_add=True)
    blood_amount = models.DecimalField(max_digits=5, decimal_places=2, default=1.0)  # in units (typically 1 unit = 450ml)
    
    def __str__(self):
        return f"{self.schedule.donor.user.username} - {self.donation_date.strftime('%Y-%m-%d')}"
    
    class Meta:
        verbose_name = "Donation Record"
        verbose_name_plural = "Donation Records"
        ordering = ['-donation_date']


class BloodRequest(models.Model):
    """Emergency blood requests board"""
    URGENCY_CHOICES = [
        ('normal', 'Normal'),
        ('urgent', 'Urgent'),
        ('emergency', 'Immediate Emergency'),
    ]
    
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blood_requests')
    patient_name = models.CharField(max_length=255)
    blood_type = models.CharField(max_length=4, choices=Donor.BLOOD_TYPE_CHOICES)
    hospital_name = models.CharField(max_length=255)
    hospital_location = models.CharField(max_length=255)
    contact_phone = models.CharField(max_length=20)
    urgency = models.CharField(max_length=10, choices=URGENCY_CHOICES, default='normal')
    reason = models.TextField(blank=True)
    is_fulfilled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.blood_type} - {self.patient_name}"
    
    class Meta:
        ordering = ['-created_at']

