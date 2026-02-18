from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Donor endpoints
    path('donor/profile/', views.DonorProfileView.as_view(), name='donor-profile'),
    path('donor/profile/update/', views.UpdateDonorProfileView.as_view(), name='donor-profile-update'),
    path('donor/dashboard/', views.DashboardStatsView.as_view(), name='donor-dashboard'),
    
    # Donation scheduling
    path('donations/schedule/', views.ScheduleDonationView.as_view(), name='schedule-donation'),
    path('donations/schedules/', views.ListSchedulesView.as_view(), name='list-schedules'),
    
    # Hospitals
    path('hospitals/', views.ListHospitalsView.as_view(), name='list-hospitals'),
    path('hospitals/<int:pk>/', views.HospitalDetailView.as_view(), name='hospital-detail'),
    
    # Leaderboard (NEW - Additive Feature)
    path('donors/leaderboard/', views.TopDonorsLeaderboardView.as_view(), name='donors-leaderboard'),
    
    # Admin endpoints
    path('admin/stats/', views.AdminStatsView.as_view(), name='admin-stats'),
    path('admin/donors/', views.AdminDonorsListView.as_view(), name='admin-donors'),
    path('admin/schedules/<int:pk>/done/', views.MarkScheduleDoneView.as_view(), name='mark-schedule-done'),
    path('admin/schedules/<int:pk>/cancel/', views.MarkScheduleCanceledView.as_view(), name='mark-schedule-cancel'),
    path('admin/records/<int:pk>/update-lives/', views.UpdateLivesSavedView.as_view(), name='update-lives-saved'),
    path('admin/hospitals/add/', views.AddHospitalView.as_view(), name='add-hospital'),
    path('donations/certificate/<int:record_id>/', views.CertificateDataView.as_view(), name='certificate-data'),
    path('emergency-requests/', views.BloodRequestListCreateView.as_view(), name='blood-request-list'),
    path('emergency-requests/<int:pk>/fulfill/', views.MarkBloodRequestFulfilledView.as_view(), name='blood-request-fulfill'),
    path('emergency-requests/<int:pk>/delete/', views.BloodRequestDeleteView.as_view(), name='blood-request-delete'),
    path('admin/emergency-requests/', views.AdminBloodRequestsView.as_view(), name='admin-blood-requests'),
    path('admin/hospitals/<int:pk>/', views.HospitalUpdateDeleteView.as_view(), name='admin-hospital-detail'),
]

