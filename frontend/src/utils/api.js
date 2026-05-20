import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const auth = {
  signup: (email, password, name) => api.post('/auth/signup', { email, password, name }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const experiences = {
  list: (params) => api.get('/experiences', { params }),
  mine: () => api.get('/experiences/mine'),
  detail: (id) => api.get(`/experiences/${id}`),
  create: (data) => api.post('/experiences', data),
  update: (id, data) => api.put(`/experiences/${id}`, data),
  delete: (id) => api.delete(`/experiences/${id}`),
  tags: () => api.get('/experiences/tags'),
};

export const admin = {
  pending: () => api.get('/admin/pending'),
  approve: (id) => api.post(`/admin/experiences/${id}/approve`),
  reject: (id, reason) => api.post(`/admin/experiences/${id}/reject`, { reason }),
};

export const chat = {
  send: (messages) => api.post('/chat', { messages }),
};

export const upload = {
  file: (formData) => api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const directMessages = {
  list: () => api.get('/direct-messages'),
  messages: (conversationId) => api.get(`/direct-messages/${conversationId}/messages`),
  send: (receiverId, text) => api.post('/direct-messages/message', { receiverId, text }),
};

export default api;
