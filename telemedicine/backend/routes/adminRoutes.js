import express from 'express';
import {
  getDashboard,
  getAnalytics,
  simulateQueue,
  getActiveQueues,
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', authenticate, authorize('admin'), getDashboard);
router.get('/analytics', authenticate, authorize('admin'), getAnalytics);
router.post('/simulate', authenticate, authorize('admin'), simulateQueue);
router.get('/queues', authenticate, authorize('admin'), getActiveQueues);

export default router;
