import express from 'express';
import { toggleStatus, getDoctors, getDoctorStats } from '../controllers/doctorController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.put('/status', authenticate, authorize('doctor'), toggleStatus);
router.get('/list', authenticate, getDoctors);
router.get('/stats', authenticate, authorize('doctor'), getDoctorStats);

export default router;
