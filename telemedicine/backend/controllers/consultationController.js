import axios from 'axios';
import Consultation from '../models/Consultation.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import { calculatePriorityScore, sortQueueByPriority } from '../services/queueService.js';
import { emitQueueUpdate, emitNotification } from '../services/socketService.js';

// POST /api/consultation/join
export const joinQueue = async (req, res) => {
  try {
    const {
      doctorId,
      symptoms,
      visitType,
      previousVisits,
      emergencyLevel,
      consultationMode,
    } = req.body;

    const patientId = req.user._id;
    const emergencyWarning = emergencyLevel >= 4;

    const patient = await Patient.findOne({ userId: patientId });
    const waitingTimeMinutes = 0;
    const priorityScore = calculatePriorityScore(emergencyLevel || 1, waitingTimeMinutes);

    // Call ML service for predictions
    let predictedDuration = null;
    let predictedCategory = null;
    try {
    // Normalize ML_SERVICE_URL to avoid double slashes
    const mlBase = (process.env.ML_SERVICE_URL || 'http://localhost:5001').replace(/\/$/, '');
    const mlRes = await axios.post(
      `${mlBase}/predict`,
      { symptoms, visitType, emergencyLevel, previousVisits, consultationMode },
      { timeout: parseInt(process.env.ML_SERVICE_TIMEOUT || '3000', 10) }
    );
      predictedDuration = mlRes.data.predictedDuration;
      predictedCategory = mlRes.data.predictedCategory;
    } catch {
      // ML service unavailable — graceful fallback
      predictedDuration = 15;
      predictedCategory = 'general';
    }

    const consultation = await Consultation.create({
      patientId,
      doctorId: doctorId || null,
      symptoms,
      visitType: visitType || 'checkup',
      previousVisits: previousVisits || 0,
      emergencyLevel: emergencyLevel || 1,
      predictedCategory,
      consultationMode: consultationMode || 'video',
      predictedDuration,
      priorityScore,
      status: 'waiting',
      type: 'live',
      patientName: req.user.name,
      patientAge: patient?.age || null,
      assignedAt: new Date(),
    });

    // Update doctor queue length
    if (doctorId) {
      await Doctor.findByIdAndUpdate(doctorId, { $inc: { currentQueueLength: 1 } });
      emitQueueUpdate(String(doctorId));
    }

    res.status(201).json({ consultation, emergencyWarning });
  } catch (err) {
    res.status(500).json({ message: 'Failed to join queue', error: err.message });
  }
};

// POST /api/consultation/book
export const bookAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      symptoms,
      visitType,
      previousVisits,
      emergencyLevel,
      consultationMode,
      scheduledDate,
    } = req.body;

    const patientId = req.user._id;
    const patient = await Patient.findOne({ userId: patientId });

    const consultation = await Consultation.create({
      patientId,
      doctorId: doctorId || null,
      symptoms,
      visitType: visitType || 'checkup',
      previousVisits: previousVisits || 0,
      emergencyLevel: emergencyLevel || 1,
      consultationMode: consultationMode || 'video',
      status: 'waiting',
      type: 'scheduled',
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      patientName: req.user.name,
      patientAge: patient?.age || null,
      assignedAt: new Date(),
    });

    res.status(201).json({ consultation });
  } catch (err) {
    res.status(500).json({ message: 'Failed to book appointment', error: err.message });
  }
};

// GET /api/consultation/patient-queue
export const getPatientQueue = async (req, res) => {
  try {
    const consultations = await Consultation.find({
      patientId: req.user._id,
      status: { $in: ['waiting', 'in-progress'] },
    })
      .populate('doctorId', 'specialization experience')
      .sort({ createdAt: -1 });

    res.json({ consultations });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get queue', error: err.message });
  }
};

// GET /api/consultation/patient-history
export const getPatientHistory = async (req, res) => {
  try {
    const consultations = await Consultation.find({
      patientId: req.user._id,
      status: 'completed',
    })
      .populate('doctorId', 'specialization experience userId')
      .sort({ createdAt: -1 });

    res.json({ consultations });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get history', error: err.message });
  }
};

// GET /api/consultation/doctor-queue
export const getDoctorQueue = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

    const consultations = await Consultation.find({
      doctorId: doctor._id,
      status: 'waiting',
    });

    const sorted = sortQueueByPriority(consultations);
    res.json({ queue: sorted });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get doctor queue', error: err.message });
  }
};

// PUT /api/consultation/start/:id
export const startSession = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) return res.status(404).json({ message: 'Consultation not found' });

    consultation.status = 'in-progress';
    consultation.sessionStartedAt = new Date();
    await consultation.save();

    emitQueueUpdate(String(consultation.doctorId));
    emitNotification(String(consultation.patientId), {
      type: 'session_started',
      message: 'Your consultation has started',
      consultationId: consultation._id,
    });

    res.json({ consultation });
  } catch (err) {
    res.status(500).json({ message: 'Failed to start session', error: err.message });
  }
};

// PUT /api/consultation/end/:id
export const endSession = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) return res.status(404).json({ message: 'Consultation not found' });

    const endedAt = new Date();
    consultation.status = 'completed';
    consultation.sessionEndedAt = endedAt;

    if (consultation.sessionStartedAt) {
      consultation.actualDuration = Math.round(
        (endedAt - consultation.sessionStartedAt) / 60000
      );
    }
    await consultation.save();

    // Decrement doctor queue length
    if (consultation.doctorId) {
      await Doctor.findByIdAndUpdate(consultation.doctorId, {
        $inc: { currentQueueLength: -1 },
      });
      emitQueueUpdate(String(consultation.doctorId));
    }

    emitNotification(String(consultation.patientId), {
      type: 'session_ended',
      message: 'Your consultation has ended',
      consultationId: consultation._id,
    });

    res.json({ consultation });
  } catch (err) {
    res.status(500).json({ message: 'Failed to end session', error: err.message });
  }
};

// GET /api/consultation/admin/all
export const adminGetAllQueues = async (req, res) => {
  try {
    const consultations = await Consultation.find({
      status: { $in: ['waiting', 'in-progress'] },
    })
      .populate('patientId', 'name email')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name email' } })
      .sort({ priorityScore: -1, createdAt: 1 });

    res.json({ consultations, total: consultations.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get all queues', error: err.message });
  }
};

// POST /api/consultation/admin/update-scores
export const updatePriorityScores = async (req, res) => {
  try {
    const now = new Date();
    const fiveMinutesAgo = new Date(now - 5 * 60 * 1000);

    const waiting = await Consultation.find({
      status: 'waiting',
      assignedAt: { $lte: fiveMinutesAgo },
    });

    // Recalculate scores and build a bulk write for efficiency
    const bulkOps = waiting.map((c) => {
      const waitingMinutes = Math.floor((now - new Date(c.assignedAt).getTime()) / 60000);
      const newScore = calculatePriorityScore(c.emergencyLevel, waitingMinutes);
      return {
        updateOne: {
          filter: { _id: c._id },
          update: { $set: { priorityScore: newScore } },
        },
      };
    });

    if (bulkOps.length > 0) {
      await Consultation.bulkWrite(bulkOps);
    }
    const updated = bulkOps.length;

    // Notify affected doctors
    const doctorIds = [...new Set(waiting.map((c) => String(c.doctorId)).filter(Boolean))];
    doctorIds.forEach((id) => emitQueueUpdate(id));

    res.json({ message: 'Priority scores updated', updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update scores', error: err.message });
  }
};
