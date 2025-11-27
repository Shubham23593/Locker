import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('🔗 API URL:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
  withCredentials: false, // Changed to false unless you need CORS credentials
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 API Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging and error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    const errorDetails = {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      errors: error.response?.data?.errors || null,
    };
    
    console.error('❌ API Error:', errorDetails);

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - token expired or invalid
      console.warn('🔐 Unauthorized - clearing token');
      localStorage.removeItem('token');
      // Optionally redirect to login
      // window.location.href = '/auth';
    }

    if (error.response?.status === 403) {
      console.warn('🚫 Forbidden - insufficient permissions');
    }

    if (error.response?.status === 404) {
      console.warn('🔍 Not Found:', error.config?.url);
    }

    if (error.response?.status >= 500) {
      console.error('🔥 Server Error:', error.response?.status);
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart', data),
  updateCartItem: (productId, quantity) =>
    api.put(`/cart/${productId}`, { quantity }),
  removeFromCart: (productId) => api.delete(`/cart/${productId}`),
  clearCart: () => api.delete('/cart'),
};

// Order API - Enhanced with proper response handling
export const orderAPI = {
  createOrder: async (data) => {
    try {
      const response = await api.post('/orders', data);
      console.log('📦 Order created:', response.data);
      return response; // Return full response
    } catch (error) {
      console.error('❌ Create order failed:', error.response?.data);
      throw error;
    }
  },
  getOrders: async () => {
    try {
      const response = await api.get('/orders');
      return response;
    } catch (error) {
      console.error('❌ Get orders failed:', error.response?.data);
      throw error;
    }
  },
  getOrderById: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response;
    } catch (error) {
      console.error('❌ Get order by ID failed:', error.response?.data);
      throw error;
    }
  },
};

// Product API
export const productAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  getFeaturedProducts: () => api.get('/products/featured'),
  getBrands: () => api.get('/products/brands'),
  getProductsByCategory: (category) => api.get('/products', { params: { category } }),
  searchProducts: (query) => api.get('/products', { params: { search: query } }),
  
  // Admin routes
  seedProducts: (products) => api.post('/products/seed', { products }),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

// Chat API (if you added chatbot)
export const chatAPI = {
  createSession: () => api.post('/chat/session'),
  sendMessage: (sessionId, message) => api.post('/chat/message', { sessionId, message }),
  getChatHistory: () => api.get('/chat/history'),
  closeSession: (sessionId) => api.put(`/chat/close/${sessionId}`),
};

// Helper function to extract data from response
export const extractData = (response) => {
  // Handle different response structures
  if (response.data?.success && response.data?.data) {
    return response.data.data; // Backend returns { success: true, data: {...} }
  }
  if (response.data?.data) {
    return response.data.data;
  }
  return response.data; // Fallback to raw data
};

// Helper function to handle API errors
export const handleAPIError = (error, defaultMessage = 'An error occurred') => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    return error.response.data.errors.map(e => e.msg || e.message).join(', ');
  }
  if (error.message) {
    return error.message;
  }
  return defaultMessage;
};

// Health check
export const checkAPIHealth = async () => {
  try {
    const response = await api.get('/health');
    console.log('💚 API Health:', response.data);
    return true;
  } catch (error) {
    console.error('❌ API Health check failed:', error);
    return false;
  }
};

export default api;