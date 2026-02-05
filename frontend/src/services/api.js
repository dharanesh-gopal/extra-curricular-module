import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const AI_URL = import.meta.env.VITE_AI_URL || 'http://localhost:5001';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  verifyToken: () => api.get('/auth/verify'),
};

// Activities API
export const activitiesAPI = {
  getAll: (params) => api.get('/activities', { params }),
  getById: (id) => api.get(`/activities/${id}`),
  create: (data) => api.post('/activities', data),
  update: (id, data) => api.put(`/activities/${id}`, data),
  delete: (id) => api.delete(`/activities/${id}`),
  approve: (id, status) => api.put(`/activities/${id}/approve`, { status }),
  getStatistics: (id) => api.get(`/activities/${id}/statistics`),
};

// Enrollments API
export const enrollmentsAPI = {
  getAll: (params) => api.get('/enrollments', { params }),
  getById: (id) => api.get(`/enrollments/${id}`),
  create: (data) => api.post('/enrollments', data),
  updateStatus: (id, data) => api.put(`/enrollments/${id}/status`, data),
  cancel: (id) => api.delete(`/enrollments/${id}`),
  getSummary: (studentId) => api.get(`/enrollments/student/${studentId}/summary`),
};

// Payments API
export const paymentsAPI = {
  getAll: (params) => api.get('/payments', { params }),
  create: (data) => api.post('/payments', data),
  getByStudent: (studentId) => api.get(`/payments/student/${studentId}`),
};

// Attendance API
export const attendanceAPI = {
  getAll: (params) => api.get('/attendance', { params }),
  mark: (data) => api.post('/attendance', data),
  getByActivity: (activityId, params) => api.get(`/attendance/activity/${activityId}`, { params }),
  getSummary: (enrollmentId) => api.get(`/attendance/enrollment/${enrollmentId}/summary`),
};

// Performance API
export const performanceAPI = {
  getAll: (params) => api.get('/performance', { params }),
  add: (data) => api.post('/performance', data),
  update: (id, data) => api.put(`/performance/${id}`, data),
  getByStudent: (studentId) => api.get(`/performance/student/${studentId}`),
  getSummary: (enrollmentId) => api.get(`/performance/enrollment/${enrollmentId}/summary`),
};

// AI API
export const aiAPI = {
  predictDropout: (data) => api.post('/ai/predict/dropout', data),
  recommendActivities: (data) => api.post('/ai/recommend/activities', data),
  predictPerformance: (data) => api.post('/ai/predict/performance', data),
  clusterStudents: (data) => api.post('/ai/cluster/students', data),
  getPredictionHistory: (params) => api.get('/ai/predictions/history', { params }),
};

export default api;