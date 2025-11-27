import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

// Attach token automatically if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Generic error handler (optional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can centralize logging or toast here
    // console.error('API error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Example helper: create order
export const createOrder = (payload) => api.post('/orders', payload);

// Other helpers you may want:
export const fetchProducts = (params) => api.get('/products', { params });
export const fetchProductById = (id) => api.get(`/products/${id}`);
export const login = (credentials) => api.post('/auth/login', credentials);
export const signup = (data) => api.post('/auth/register', data);
export const getProfile = () => api.get('/auth/profile');

export default api;