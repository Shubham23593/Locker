import Consultation from '../models/Consultation.js';
import Doctor from '../models/Doctor.js';

/**
 * Calculate priority score using emergency level and waiting time.
 * Formula: emergencyLevel * 5 * (waitingTimeMinutes + 1)
 */
export const calculatePriorityScore = (emergencyLevel, waitingTimeMinutes) => {
  return (emergencyLevel || 1) * 5 * ((waitingTimeMinutes || 0) + 1);
};

/**
 * Apply aging algorithm: add 1 to priorityScore if the consultation has been waiting > 5 min.
 */
export const applyAgingAlgorithm = async (consultationId) => {
  const consultation = await Consultation.findById(consultationId);
  if (!consultation || consultation.status !== 'waiting') return null;

  const waitingMinutes = Math.floor((Date.now() - new Date(consultation.assignedAt).getTime()) / 60000);
  if (waitingMinutes > 5) {
    consultation.priorityScore += 1;
    await consultation.save();
  }
  return consultation;
};

/**
 * Reassign waiting patients from an offline doctor to another active doctor
 * with the same specialization.
 */
export const reassignPatients = async (doctorId, specialization) => {
  const waitingConsultations = await Consultation.find({
    doctorId,
    status: 'waiting',
  });

  if (!waitingConsultations.length) {
    return { reassigned: 0, newDoctorId: null };
  }

  // Find another available online doctor with the same specialization
  const newDoctor = await Doctor.findOne({
    _id: { $ne: doctorId },
    isOnline: true,
    specialization,
  });

  if (!newDoctor) {
    return { reassigned: 0, newDoctorId: null };
  }

  const ids = waitingConsultations.map((c) => c._id);
  await Consultation.updateMany({ _id: { $in: ids } }, { doctorId: newDoctor._id });

  // Update queue lengths
  await Doctor.findByIdAndUpdate(newDoctor._id, {
    $inc: { currentQueueLength: waitingConsultations.length },
  });
  await Doctor.findByIdAndUpdate(doctorId, { currentQueueLength: 0 });

  return { reassigned: waitingConsultations.length, newDoctorId: newDoctor._id };
};

/**
 * Check if a consultation session has been stale (in-progress but no start event > 3 min).
 * Emits an admin alert via socket if stale.
 */
export const checkStaleSession = async (consultationId, emitAdminAlertFn) => {
  const consultation = await Consultation.findById(consultationId);
  if (!consultation || consultation.status !== 'in-progress') return null;

  const now = Date.now();
  const assignedAt = consultation.assignedAt
    ? new Date(consultation.assignedAt).getTime()
    : null;

  if (assignedAt && !consultation.sessionStartedAt) {
    const minutesSinceAssigned = (now - assignedAt) / 60000;
    if (minutesSinceAssigned > 3 && typeof emitAdminAlertFn === 'function') {
      emitAdminAlertFn({
        type: 'stale_session',
        message: `Consultation ${consultationId} has been in-progress for ${Math.round(minutesSinceAssigned)} minutes without starting`,
        consultationId,
      });
    }
  }
  return consultation;
};

/**
 * Sort consultations by priorityScore descending, then emergencyLevel descending.
 */
export const sortQueueByPriority = (consultations) => {
  return [...consultations].sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
    return b.emergencyLevel - a.emergencyLevel;
  });
};
