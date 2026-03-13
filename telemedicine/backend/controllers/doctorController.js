import Doctor from '../models/Doctor.js';
import Consultation from '../models/Consultation.js';
import User from '../models/User.js';
import { reassignPatients } from '../services/queueService.js';
import { emitQueueUpdate } from '../services/socketService.js';

// PUT /api/doctor/status
export const toggleStatus = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

    const goingOffline = doctor.isOnline;
    doctor.isOnline = !doctor.isOnline;
    await doctor.save();

    let reassignResult = null;
    if (goingOffline) {
      reassignResult = await reassignPatients(doctor._id, doctor.specialization);
      if (reassignResult.newDoctorId) {
        emitQueueUpdate(String(reassignResult.newDoctorId));
      }
    }

    emitQueueUpdate(String(doctor._id));
    res.json({ doctor, reassignResult });
  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle status', error: err.message });
  }
};

// GET /api/doctor/list
export const getDoctors = async (req, res) => {
  try {
    const { specialization } = req.query;
    const filter = { isOnline: true };
    if (specialization) filter.specialization = new RegExp(specialization, 'i');

    const doctors = await Doctor.find(filter).populate('userId', 'name email');
    res.json({ doctors });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get doctors', error: err.message });
  }
};

// GET /api/doctor/stats
export const getDoctorStats = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

    const consultations = await Consultation.find({ doctorId: doctor._id });

    const completed = consultations.filter((c) => c.status === 'completed');
    const totalDuration = completed.reduce((sum, c) => sum + (c.actualDuration || 0), 0);
    const avgDuration = completed.length ? Math.round(totalDuration / completed.length) : 0;

    const waiting = consultations.filter((c) => c.status === 'waiting').length;
    const inProgress = consultations.filter((c) => c.status === 'in-progress').length;
    const missed = consultations.filter((c) => c.status === 'missed').length;

    res.json({
      totalConsultations: consultations.length,
      completed: completed.length,
      waiting,
      inProgress,
      missed,
      avgDuration,
      currentQueueLength: doctor.currentQueueLength,
      isOnline: doctor.isOnline,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get stats', error: err.message });
  }
};
