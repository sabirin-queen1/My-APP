import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// const API_URL = 'http://192.168.1.100:5000/api'; // Change to your local IP
const API_URL = 'https://jfz26bnv-5000.uks1.devtunnels.ms/api';

const API = axios.create({ baseURL: API_URL, timeout: 10000 });

API.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('hc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  loginHousehold: (data) => API.post('/auth/login', { ...data, role: 'household' }),
  loginWorker: (data) => API.post('/auth/login', { ...data, role: 'worker' }),
  registerHousehold: (data) => API.post('/auth/register/household', data),
  registerWorker: (data) => API.post('/auth/register/worker', data),
  getMe: () => API.get('/auth/me'),
};

export const workersAPI = {
  search: (params) => API.get('/workers', { params }),
  getById: (id) => API.get(`/workers/${id}`),
  updateProfile: (data) => API.put('/workers/profile', data),
  getDashboard: () => API.get('/workers/dashboard/stats'),
};

export const contractsAPI = {
  create: (data) => API.post('/contracts', data),
  getAll: () => API.get('/contracts'),
  getById: (id) => API.get(`/contracts/${id}`),
  sign: (id, data) => API.put(`/contracts/${id}/sign`, data),
  cancel: (id) => API.put(`/contracts/${id}/cancel`),
};

export const reviewsAPI = {
  create: (data) => API.post('/reviews', data),
  getByWorker: (id) => API.get(`/reviews/worker/${id}`),
};

export const notificationsAPI = {
  getAll: (filter) => API.get('/notifications', { params: { filter } }),
  markRead: (id) => API.put(`/notifications/${id}/read`),
  markAllRead: () => API.put('/notifications/read-all'),
};

export default API;
