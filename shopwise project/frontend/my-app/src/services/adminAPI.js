import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const adminAPI = axios.create({
  baseURL: `${API_URL}/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add admin token to requests
adminAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
adminAPI.interceptors. response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const adminAPIService = {
  // Auth
  login: (credentials) => adminAPI. post('/login', credentials),
  getProfile: () => adminAPI.get('/profile'),
  
  // Dashboard
  getStats: () => adminAPI.get('/stats'),
  
  // Orders
  getAllOrders: (params) => adminAPI.get('/orders', { params }),
  updateOrderStatus: (orderId, data) => adminAPI.put(`/orders/${orderId}/status`, data),
  
  // Users
  getAllUsers: (params) => adminAPI.get('/users', { params }),
  getUserDetails: (userId) => adminAPI.get(`/users/${userId}`),
  
  // Products
  getAllProducts: (params) => adminAPI. get('/products', { params }),
  createProduct: (data) => adminAPI.post('/products', data),
  updateProduct: (productId, data) => adminAPI. put(`/products/${productId}`, data),
  deleteProduct: (productId) => adminAPI. delete(`/products/${productId}`),
  
  // Analytics
  getAnalytics: (params) => adminAPI.get('/analytics', { params }),
};

export default adminAPI;