const Consultation = require('../models/Consultation');
const Doctor = require('../models/Doctor');

const AGING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const INACTION_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

const calculatePriorityScore = (emergencyLevel, waitingTimeMinutes) => {
  return emergencyLevel * 5 + waitingTimeMinutes;
};

const applyAging = (consultations) => {
  const now = Date.now();
  const updated = consultations.map((c) => {
    const doc = c.toObject ? c.toObject() : { ...c };
    const elapsed = now - new Date(doc.createdAt).getTime();
    const intervals = Math.floor(elapsed / AGING_INTERVAL_MS);
    doc.priorityScore = (doc.priorityScore || 0) + intervals;
    return doc;
  });
  return updated.sort((a, b) => b.priorityScore - a.priorityScore);
};

const getOptimizedQueue = async (doctorId) => {
  const consultations = await Consultation.find({
    doctorId,
    status: 'waiting',
  });
  return applyAging(consultations);
};

const reassignPatients = async (doctorId, io) => {
  const waitingConsultations = await Consultation.find({
    doctorId,
    status: 'waiting',
  });

  for (const consultation of waitingConsultations) {
    const doctor = await Doctor.findOne({ userId: doctorId });
    const specialization = doctor ? doctor.specialization : null;

    const newDoctor = await Doctor.findOne({
      specialization,
      isOnline: true,
      userId: { $ne: doctorId },
    }).sort({ currentQueueLength: 1 });

    if (newDoctor) {
      consultation.doctorId = newDoctor.userId;
      await consultation.save();

      await Doctor.findOneAndUpdate(
        { userId: doctorId },
        { $inc: { currentQueueLength: -1 } }
      );
      await Doctor.findOneAndUpdate(
        { userId: newDoctor.userId },
        { $inc: { currentQueueLength: 1 } }
      );

      if (io) {
        io.to(`doctor-${newDoctor.userId}`).emit('queue-updated');
      }
    } else {
      if (io) {
        io.to(`patient-${consultation.patientId}`).emit('notification', {
          message: 'No available doctor found. Please wait for reassignment.',
        });
        io.to('admin').emit('notification', {
          message: `No available doctor for consultation ${consultation._id}. Patient is waiting.`,
        });
      }
    }
  }
};

const checkDoctorInaction = (consultationId, io) => {
  setTimeout(async () => {
    try {
      const consultation = await Consultation.findById(consultationId);
      if (consultation && consultation.status === 'waiting') {
        if (io) {
          io.to('admin').emit('doctor-inaction', {
            consultationId,
            doctorId: consultation.doctorId,
            message: 'Doctor has not responded to consultation within 3 minutes.',
          });
          io.to(`doctor-${consultation.doctorId}`).emit('notification', {
            message: 'You have an unattended patient waiting. Please respond.',
          });
        }
      }
    } catch (err) {
      console.error('checkDoctorInaction error:', err.message);
    }
  }, INACTION_TIMEOUT_MS);
};

module.exports = {
  calculatePriorityScore,
  applyAging,
  getOptimizedQueue,
  reassignPatients,
  checkDoctorInaction,
};
