import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token into Authorization header
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

// Interceptor to handle unauthenticated responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authApi = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getProfile: () => api.get('/api/auth/profile'),
};

// Customer Services
export const customerApi = {
  getAll: (skip = 0, limit = 100) => api.get(`/api/customers?skip=${skip}&limit=${limit}`),
  getById: (id) => api.get(`/api/customers/${id}`),
  create: (data) => api.post('/api/customers', data),
  update: (id, data) => api.put(`/api/customers/${id}`, data),
  delete: (id) => api.delete(`/api/customers/${id}`),
};

// Account Services
export const accountApi = {
  getAll: (skip = 0, limit = 100) => api.get(`/api/accounts?skip=${skip}&limit=${limit}`),
  getByNumber: (accNum) => api.get(`/api/accounts/${accNum}`),
  create: (data) => api.post('/api/accounts', data),
};

// Transaction Services
export const transactionApi = {
  getAll: (skip = 0, limit = 100) => api.get(`/api/transactions?skip=${skip}&limit=${limit}`),
  deposit: (data) => api.post('/api/transactions/deposit', data),
  withdrawal: (data) => api.post('/api/transactions/withdrawal', data),
  transfer: (data) => api.post('/api/transactions/transfer', data),
};

// Dashboard Services
export const dashboardApi = {
  getStats: () => api.get('/api/dashboard/stats'),
};

// Machine Learning Services
export const mlApi = {
  predict: (data) => api.post('/api/ml/predict', data),
  getModelInfo: () => api.get('/api/ml/model-info'),
  getFeatures: () => api.get('/api/ml/features'),
  getHistory: (skip = 0, limit = 50) => api.get(`/api/ml/history?skip=${skip}&limit=${limit}`),
};

export default api;
