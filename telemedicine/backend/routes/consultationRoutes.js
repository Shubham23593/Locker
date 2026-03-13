import express from 'express';
import {
  joinQueue,
  bookAppointment,
  getPatientQueue,
  getPatientHistory,
  getDoctorQueue,
  startSession,
  endSession,
  adminGetAllQueues,
  updatePriorityScores,
} from '../controllers/consultationController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/join', authenticate, authorize('patient'), joinQueue);
router.post('/book', authenticate, authorize('patient'), bookAppointment);
router.get('/patient-queue', authenticate, authorize('patient'), getPatientQueue);
router.get('/patient-history', authenticate, authorize('patient'), getPatientHistory);
router.get('/doctor-queue', authenticate, authorize('doctor'), getDoctorQueue);
router.put('/start/:id', authenticate, authorize('doctor'), startSession);
router.put('/end/:id', authenticate, authorize('doctor'), endSession);
router.get('/admin/all', authenticate, authorize('admin'), adminGetAllQueues);
router.post('/admin/update-scores', authenticate, authorize('admin'), updatePriorityScores);

export default router;
