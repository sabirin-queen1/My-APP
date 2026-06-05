import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('hc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // bypass localtunnel warning page for API calls
  config.headers['bypass-tunnel-reminder'] = 'true';
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hc_token');
      localStorage.removeItem('hc_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  loginHousehold: (data) => API.post('/auth/login', { ...data, role: 'household' }),
  loginWorker: (data) => API.post('/auth/login', { ...data, role: 'worker' }),
  loginAdmin: (data) => API.post('/auth/login', { ...data, role: 'admin' }),
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
  getByWorker: (workerId) => API.get(`/reviews/worker/${workerId}`),
};

export const notificationsAPI = {
  getAll: (filter) => API.get('/notifications', { params: { filter } }),
  markRead: (id) => API.put(`/notifications/${id}/read`),
  markAllRead: () => API.put('/notifications/read-all'),
};

export const chatAPI = {
  getConversations: () => API.get('/chat'),
  getMessages: (otherId) => API.get(`/chat/${otherId}`),
  sendMessage: (otherId, text) => API.post(`/chat/${otherId}`, { text }),
};

export const adminAPI = {
  getDashboard: () => API.get('/admin/dashboard'),
  getVerifications: () => API.get('/admin/verifications'),
  verifyWorker: (id, action) => API.put(`/admin/workers/${id}/verify`, { action }),
  getWorkers: (params) => API.get('/admin/workers', { params }),
  getHouseholds: () => API.get('/admin/households'),
  getAllUsers: () => API.get('/admin/users'),
  getAllContracts: () => API.get('/admin/contracts'),
  getAllReviews: () => API.get('/admin/reviews'),
  deleteHousehold: (id) => API.delete(`/admin/households/${id}`),
  deleteWorker: (id) => API.delete(`/admin/workers/${id}`),
  deleteContract: (id) => API.delete(`/admin/contracts/${id}`),
  deleteReview: (id) => API.delete(`/admin/reviews/${id}`),
  toggleHousehold: (id) => API.put(`/admin/households/${id}/toggle`),
  toggleWorker: (id) => API.put(`/admin/workers/${id}/toggle`),
  seedAdmin: () => API.post('/admin/seed'),
};

export default API;
