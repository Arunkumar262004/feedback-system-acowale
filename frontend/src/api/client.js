import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const client = axios.create({ baseURL: API_URL, timeout: 10000 });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('acowale_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('acowale_token');
    }
    return Promise.reject(err);
  }
);

export const api = {
  login: (email, password) => client.post('/auth/login', { email, password }),
  submitFeedback: (payload) => client.post('/feedback', payload),
  getFeedback: (params) => client.get('/feedback', { params }),
  getAnalyticsSummary: () => client.get('/analytics/summary'),
};

export default client;
