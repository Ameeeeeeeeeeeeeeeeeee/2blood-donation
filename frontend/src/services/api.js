import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '') + '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
};

// Donor API
export const donorAPI = {
  getProfile: () => api.get('/donor/profile/'),
  updateProfile: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        if (key === 'profile_image' && data[key] instanceof File) {
          formData.append(key, data[key]);
        } else if (key !== 'profile_image') {
          formData.append(key, data[key]);
        }
      }
    });
    return api.patch('/donor/profile/update/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getDashboard: () => api.get('/donor/dashboard/'),
  getLeaderboard: (limit = 10) => api.get(`/donors/leaderboard/?limit=${limit}`),
};

// Donation API
export const donationAPI = {
  schedule: (data) => api.post('/donations/schedule/', data),
  getSchedules: () => api.get('/donations/schedules/'),
  getCertificate: (recordId) => api.get(`/donations/certificate/${recordId}/`),
};

// Emergency Requests API
export const emergencyRequestAPI = {
  getAll: () => api.get('/emergency-requests/'),
  create: (data) => api.post('/emergency-requests/', data),
  fulfill: (id) => api.patch(`/emergency-requests/${id}/fulfill/`),
};

// Hospital API
export const hospitalAPI = {
  getAll: () => api.get('/hospitals/'),
  getById: (id) => api.get(`/hospitals/${id}/`),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats/'),
  getDonors: () => api.get('/admin/donors/'),
  markScheduleDone: (id, data) => api.patch(`/admin/schedules/${id}/done/`, data),
  markScheduleCanceled: (id) => api.patch(`/admin/schedules/${id}/cancel/`),
  updateLivesSaved: (id, data) => api.patch(`/admin/records/${id}/update-lives/`, data),
  addHospital: (data) => api.post('/admin/hospitals/add/', data),
  deleteHospital: (id) => api.delete(`/admin/hospitals/${id}/`),
  updateHospital: (id, data) => api.patch(`/admin/hospitals/${id}/`, data),
  getBloodRequests: () => api.get('/admin/emergency-requests/'),
  deleteBloodRequest: (id) => api.delete(`/emergency-requests/${id}/delete/`),
};

export default api;

