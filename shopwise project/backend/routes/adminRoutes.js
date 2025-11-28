import express from 'express';
import {
  adminLogin,
  getAdminProfile,
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  getUserDetails,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAnalytics,
} from '../controllers/adminController.js';  // ← Make sure no extra space before . js
import { adminProtect, checkPermission } from '../middleware/adminAuth.js';

const router = express.Router();

// Public routes
router.post('/login', adminLogin);

// Protected admin routes
router.get('/profile', adminProtect, getAdminProfile);
router.get('/stats', adminProtect, getDashboardStats);

// Orders management
router.get('/orders', adminProtect, checkPermission('orders'), getAllOrders);
router. put('/orders/:id/status', adminProtect, checkPermission('orders'), updateOrderStatus);

// Users management
router.get('/users', adminProtect, checkPermission('users'), getAllUsers);
router. get('/users/:id', adminProtect, checkPermission('users'), getUserDetails);

// Products management
router.get('/products', adminProtect, checkPermission('products'), getAllProducts);
router.post('/products', adminProtect, checkPermission('products'), createProduct);
router.put('/products/:id', adminProtect, checkPermission('products'), updateProduct);
router.delete('/products/:id', adminProtect, checkPermission('products'), deleteProduct);

// Analytics
router.get('/analytics', adminProtect, checkPermission('analytics'), getAnalytics);

export default router;