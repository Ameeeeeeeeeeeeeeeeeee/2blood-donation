from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from .models import Donor, Hospital, DonationSchedule, DonationRecord
from .serializers import (
    UserRegistrationSerializer, UserSerializer, DonorProfileSerializer,
    DonorCreateUpdateSerializer, HospitalSerializer, DonationScheduleSerializer,
    DonationScheduleCreateSerializer, DonationRecordSerializer, LoginSerializer
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """User registration endpoint"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Create donor profile if role is donor
        # Donor profile will be created with default values, user can update later
        if user.role == 'donor':
            Donor.objects.get_or_create(user=user)
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """User login endpoint"""
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data['user']
    
    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'user': UserSerializer(user).data,
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    }, status=status.HTTP_200_OK)


class DonorProfileView(generics.RetrieveAPIView):
    """Get donor profile"""
    serializer_class = DonorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        if user.role != 'donor':
            return Response({'error': 'User is not a donor'}, 
                          status=status.HTTP_403_FORBIDDEN)
        donor, created = Donor.objects.get_or_create(user=user)
        serializer = self.get_serializer(donor, context={'request': request})
        return Response(serializer.data)


class UpdateDonorProfileView(generics.UpdateAPIView):
    """Update donor profile"""
    serializer_class = DonorCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        user = self.request.user
        if user.role != 'donor':
            raise permissions.PermissionDenied('User is not a donor')
        donor, created = Donor.objects.get_or_create(user=user)
        return donor
    
    def update(self, request, *args, **kwargs):
        user = request.user
        if user.role != 'donor':
            return Response({'error': 'User is not a donor'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Return full profile
        full_serializer = DonorProfileSerializer(instance, context={'request': request})
        return Response(full_serializer.data)


class DashboardStatsView(generics.RetrieveAPIView):
    """Get donor dashboard stats"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        if user.role != 'donor':
            return Response({'error': 'User is not a donor'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        donor, created = Donor.objects.get_or_create(user=user)
        donor_serializer = DonorProfileSerializer(donor, context={'request': request})
        
        # Get pending schedules count
        pending_schedules = DonationSchedule.objects.filter(
            donor=donor, status='pending'
        ).count()
        
        return Response({
            'donor': donor_serializer.data,
            'pending_schedules': pending_schedules,
        })


class ScheduleDonationView(generics.CreateAPIView):
    """Schedule a donation"""
    serializer_class = DonationScheduleCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        user = request.user
        if user.role != 'donor':
            return Response({'error': 'User is not a donor'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        donor, created = Donor.objects.get_or_create(user=user)
        
        # Check if donor has any pending schedules
        pending_schedule = DonationSchedule.objects.filter(
            donor=donor,
            status='pending'
        ).exists()
        
        if pending_schedule:
            return Response({
                'error': 'You already have a pending donation schedule. Please complete or cancel it before scheduling a new one.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if donor has donated in the last 3 months
        three_months_ago = timezone.now() - timedelta(days=90)
        recent_donation = DonationRecord.objects.filter(
            schedule__donor=donor,
            donation_date__gte=three_months_ago
        ).exists()
        
        if recent_donation:
            # Get the most recent donation date for better error message
            last_donation = DonationRecord.objects.filter(
                schedule__donor=donor
            ).order_by('-donation_date').first()
            
            if last_donation:
                last_donation_date = last_donation.donation_date.strftime('%Y-%m-%d')
                next_eligible_date = (last_donation.donation_date + timedelta(days=90)).strftime('%Y-%m-%d')
                return Response({
                    'error': f'You can only donate once every 3 months. Your last donation was on {last_donation_date}. You can schedule your next donation after {next_eligible_date}.'
                }, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({
                    'error': 'You can only donate once every 3 months. Please wait before scheduling another donation.'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        schedule = serializer.save(donor=donor)
        response_serializer = DonationScheduleSerializer(schedule)
        
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class ListSchedulesView(generics.ListAPIView):
    """List donor's schedules"""
    serializer_class = DonationScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return DonationSchedule.objects.all()
        elif user.role == 'donor':
            donor, created = Donor.objects.get_or_create(user=user)
            return DonationSchedule.objects.filter(donor=donor)
        return DonationSchedule.objects.none()


class ListHospitalsView(generics.ListAPIView):
    """List all hospitals"""
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    permission_classes = [permissions.IsAuthenticated]


class HospitalDetailView(generics.RetrieveAPIView):
    """Get hospital details"""
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    permission_classes = [permissions.IsAuthenticated]


# Admin Views
class AdminStatsView(generics.RetrieveAPIView):
    """Admin: Get overall statistics"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Only admins can access this'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        from django.db.models import Sum
        
        # Count statistics
        total_donors = Donor.objects.count()
        total_hospitals = Hospital.objects.count()
        total_donations = DonationSchedule.objects.filter(status='done').count()
        pending_schedules = DonationSchedule.objects.filter(status='pending').count()
        canceled_schedules = DonationSchedule.objects.filter(status='canceled').count()
        
        # Total lives saved
        total_lives_saved = Donor.objects.aggregate(total=Sum('lives_saved'))['total'] or 0
        
        # Total blood units
        total_blood_units = DonationRecord.objects.aggregate(total=Sum('blood_amount'))['total'] or 0
        
        return Response({
            'total_donors': total_donors,
            'total_hospitals': total_hospitals,
            'total_donations': total_donations,
            'pending_schedules': pending_schedules,
            'canceled_schedules': canceled_schedules,
            'total_lives_saved': total_lives_saved,
            'total_blood_units': float(total_blood_units),
        })


class AdminDonorsListView(generics.ListAPIView):
    """Admin: List all donors"""
    serializer_class = DonorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'admin':
            return Donor.objects.none()
        return Donor.objects.all().select_related('user')


class MarkScheduleDoneView(generics.UpdateAPIView):
    """Admin: Mark schedule as done"""
    queryset = DonationSchedule.objects.all()
    serializer_class = DonationScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response({'error': 'Only admins can perform this action'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        schedule = self.get_object()
        
        if schedule.status == 'done':
            return Response({'error': 'Schedule already marked as done'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        hospital_id = request.data.get('hospital_id')
        blood_amount = request.data.get('blood_amount', 1.0)
        
        with transaction.atomic():
            schedule.status = 'done'
            schedule.save()
            
            # Create donation record
            hospital = None
            if hospital_id:
                hospital = get_object_or_404(Hospital, id=hospital_id)
            
            record = DonationRecord.objects.create(
                schedule=schedule,
                hospital=hospital,
                blood_amount=blood_amount
            )
            
            # Update donor stats
            donor = schedule.donor
            donor.total_donations += 1
            donor.save()
            
            # Update hospital stats if hospital is provided
            if hospital:
                hospital.total_blood_received += 1
                hospital.save()
        
        response_serializer = DonationScheduleSerializer(schedule)
        return Response(response_serializer.data)


class MarkScheduleCanceledView(generics.UpdateAPIView):
    """Admin: Mark schedule as canceled"""
    queryset = DonationSchedule.objects.all()
    serializer_class = DonationScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response({'error': 'Only admins can perform this action'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        schedule = self.get_object()
        
        if schedule.status == 'done':
            return Response({'error': 'Cannot cancel a completed donation'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        schedule.status = 'canceled'
        schedule.save()
        
        response_serializer = DonationScheduleSerializer(schedule)
        return Response(response_serializer.data)


class UpdateLivesSavedView(generics.UpdateAPIView):
    """Admin: Update lives saved for a donation record"""
    queryset = DonationRecord.objects.all()
    serializer_class = DonationRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response({'error': 'Only admins can perform this action'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        record = self.get_object()
        lives_saved = request.data.get('lives_saved', 0)
        
        if lives_saved <= 0:
            return Response({'error': 'Lives saved must be greater than 0'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            # Update donor's lives saved
            donor = record.schedule.donor
            donor.lives_saved += lives_saved
            donor.save()
            
            # Update hospital's lives saved if hospital exists
            if record.hospital:
                record.hospital.total_lives_saved += lives_saved
                record.hospital.save()
        
        response_serializer = DonationRecordSerializer(record)
        return Response(response_serializer.data)


class AddHospitalView(generics.CreateAPIView):
    """Admin: Add a new hospital"""
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response({'error': 'Only admins can perform this action'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        return super().create(request, *args, **kwargs)


# ============================================
# Leaderboard View (NEW - Additive Feature)
# ============================================
class TopDonorsLeaderboardView(generics.ListAPIView):
    """
    Get top donors ranked by total donations.
    Returns donors sorted in descending order by total_donations.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Get limit from query params, default to 10
        limit = request.query_params.get('limit', 10)
        try:
            limit = int(limit)
            limit = min(limit, 50)  # Cap at 50 to prevent abuse
        except ValueError:
            limit = 10
        
        # Get top donors sorted by total_donations descending
        top_donors = Donor.objects.filter(
            total_donations__gt=0  # Only donors who have donated
        ).select_related('user').order_by('-total_donations')[:limit]
        
        # Build response data
        leaderboard = []
        for rank, donor in enumerate(top_donors, start=1):
            leaderboard.append({
                'rank': rank,
                'id': donor.id,
                'name': f"{donor.user.first_name} {donor.user.last_name}".strip() or donor.user.username,
                'blood_type': donor.blood_type or 'N/A',
                'total_donations': donor.total_donations,
                'lives_saved': donor.lives_saved,
            })
        
        return Response({
            'leaderboard': leaderboard,
            'total_count': len(leaderboard),
        })

