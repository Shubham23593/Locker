import React, { createContext, useState, useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { authAPI } from '../services/api';
import { fetchCart, clearCart } from '../redux/cartSlice';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Checking auth, token:', token ?  'exists' : 'none');
      
      if (token) {
        const { data } = await authAPI.getProfile();
        console.log('✅ Profile fetched:', data);
        const userData = data.data || data. user;
        setUser(userData);
        
        // ✅ Fetch cart after authentication
        console.log('🛒 Fetching cart on mount.. .');
        await dispatch(fetchCart()). unwrap();
        console.log('✅ Cart loaded successfully');
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login:', email);
      const { data } = await authAPI.login({ email, password });
      console. log('📦 Login response:', data);
      
      // Store token
      if (data.token) {
        localStorage.setItem('token', data.token);
        console.log('✅ Token stored:', data.token);
      }
      
      // Set user
      const userData = data.data || data. user;
      setUser(userData);
      console.log('✅ User set:', userData);
      
      // ✅ Fetch cart immediately after login
      console.log('🛒 Fetching cart after login...');
      await dispatch(fetchCart()).unwrap();
      console.log('✅ Cart loaded after login');
      
      return data;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      console.log('📝 Attempting register:', email);
      const { data } = await authAPI.register({ name, email, password });
      console. log('📦 Register response:', data);
      
      // Store token
      if (data.token) {
        localStorage. setItem('token', data.token);
        console.log('✅ Token stored:', data.token);
      }
      
      // Set user
      const userData = data.data || data.user;
      setUser(userData);
      console.log('✅ User set:', userData);
      
      // ✅ Fetch cart after registration
      console.log('🛒 Fetching cart after registration...');
      await dispatch(fetchCart()).unwrap();
      console.log('✅ Cart loaded after registration');
      
      return data;
    } catch (error) {
      console.error('❌ Register error:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('👋 Logging out.. .');
    
    // Clear cart from Redux
    dispatch(clearCart());
    
    // Clear all localStorage data
    localStorage.clear();
    
    // Clear all sessionStorage data
    sessionStorage.clear();
    
    // Clear user state
    setUser(null);
    
    // Force full page reload to fresh state
    window.location.href = '/';
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user
  };

  console.log('🔐 Auth Context State:', { 
    user: user?.name || 'none', 
    loading, 
    isAuthenticated: !!user 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;