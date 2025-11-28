import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('🔗 API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
  withCredentials: false,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 API Request:', config.method. toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise. reject(error);
  }
);

// Add response interceptor
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

    if (error.response?.status === 401) {
      console.warn('🔐 Unauthorized - clearing token');
      localStorage.removeItem('token');
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api. put('/auth/profile', data),
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

// Order API
export const orderAPI = {
  createOrder: async (data) => {
    try {
      const response = await api.post('/orders', data);
      console.log('📦 Order created:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Create order failed:', error. response?.data);
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
      console. error('❌ Get order by ID failed:', error.response?.data);
      throw error;
    }
  },
};

// Product API
export const productAPI = {
  // Get all products
  getAllProducts: async () => {
    try {
      console.log('📡 Fetching all products...');
      const response = await api. get('/products');
      console.log('✅ Products fetched:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      throw error;
    }
  },

  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  getFeaturedProducts: () => api. get('/products/featured'),
  getBrands: () => api. get('/products/brands'),
  getProductsByCategory: (category) => api.get('/products', { params: { category } }),
  searchProducts: (query) => api. get('/products', { params: { search: query } }),
  
  // Seed products
  seedProducts: async (products, replaceAll = false) => {
    try {
      console. log('📤 Seeding products... ', { count: products.length, replaceAll });
      const response = await api.post('/products/seed', { products, replaceAll });
      console.log('✅ Seed complete:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Seed failed:', error);
      throw error;
    }
  },

  // ✅ NEW: Bulk create products
  bulkCreateProducts: async (products) => {
    try {
      console.log('📤 Bulk creating products... ', products.length);
      const response = await api.post('/products/bulk', { products });
      console. log('✅ Bulk create complete:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Bulk create failed:', error);
      throw error;
    }
  },

  // Admin routes
  createProduct: (data) => api. post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api. delete(`/products/${id}`),
};

// Chat API
export const chatAPI = {
  createSession: () => api.post('/chat/session'),
  sendMessage: (sessionId, message) => api.post('/chat/message', { sessionId, message }),
  getChatHistory: () => api.get('/chat/history'),
  closeSession: (sessionId) => api.put(`/chat/close/${sessionId}`),
};

export default api;