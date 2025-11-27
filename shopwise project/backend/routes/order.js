import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Routes - validation happens in controller
router.route('/').post(protect, createOrder).get(protect, getOrders);
router.route('/:id').get(protect, getOrderById);

export default router;