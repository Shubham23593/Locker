const Consultation = require('../models/Consultation');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const mlService = require('../services/mlService');
const queueService = require('../services/queueService');

const MAX_SCHEDULE_WINDOW_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

const joinQueue = async (req, res) => {
  try {
    const {
      symptoms,
      visitType,
      previousVisits,
      emergencyLevel,
      consultationMode,
      doctorId,
      autoAssign,
    } = req.body;

    const io = req.app.get('io');

    const predictedCategory = await mlService.predictSpecialization(symptoms);

    const patient = await Patient.findOne({ userId: req.user.id });
    const age = patient ? patient.age : null;

    const predictedDuration = await mlService.predictDuration({
      age,
      symptoms,
      emergencyLevel,
      previousVisits,
    });

    let assignedDoctorId = doctorId;

    if (autoAssign || !doctorId) {
      const doctor = await Doctor.findOne({
        specialization: predictedCategory,
        isOnline: true,
      }).sort({ currentQueueLength: 1 });

      if (!doctor) {
        return res.status(404).json({ message: 'No available doctor found' });
      }
      assignedDoctorId = doctor.userId;
    } else {
      const doctor = await Doctor.findOne({ userId: doctorId });
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
      if (!doctor.isOnline) {
        return res.status(400).json({ message: 'Doctor is not online' });
      }
    }

    const priorityScore = queueService.calculatePriorityScore(
      emergencyLevel,
      0
    );

    const consultation = await Consultation.create({
      patientId: req.user.id,
      doctorId: assignedDoctorId,
      symptoms,
      visitType,
      previousVisits: previousVisits || 0,
      emergencyLevel,
      predictedCategory,
      consultationMode,
      predictedDuration,
      priorityScore,
      type: 'live',
    });

    await Doctor.findOneAndUpdate(
      { userId: assignedDoctorId },
      { $inc: { currentQueueLength: 1 } }
    );

    if (io) {
      io.to(`doctor-${assignedDoctorId}`).emit('queue-updated');
    }

    queueService.checkDoctorInaction(consultation._id, io);

    res.status(201).json(consultation);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const scheduleAppointment = async (req, res) => {
  try {
    const {
      symptoms,
      visitType,
      previousVisits,
      emergencyLevel,
      consultationMode,
      doctorId,
      autoAssign,
      scheduledDate,
    } = req.body;

    const io = req.app.get('io');

    if (!scheduledDate) {
      return res.status(400).json({ message: 'Scheduled date is required' });
    }

    const scheduled = new Date(scheduledDate);
    const now = new Date();
    const maxDate = new Date(now.getTime() + MAX_SCHEDULE_WINDOW_MS);

    if (scheduled < now) {
      return res.status(400).json({ message: 'Scheduled date must be in the future' });
    }
    if (scheduled > maxDate) {
      return res.status(400).json({ message: 'Scheduled date must be within 3 days' });
    }

    const predictedCategory = await mlService.predictSpecialization(symptoms);

    const patient = await Patient.findOne({ userId: req.user.id });
    const age = patient ? patient.age : null;

    const predictedDuration = await mlService.predictDuration({
      age,
      symptoms,
      emergencyLevel,
      previousVisits,
    });

    let assignedDoctorId = doctorId;

    if (autoAssign || !doctorId) {
      const doctor = await Doctor.findOne({
        specialization: predictedCategory,
        isOnline: true,
      }).sort({ currentQueueLength: 1 });

      if (!doctor) {
        return res.status(404).json({ message: 'No available doctor found' });
      }
      assignedDoctorId = doctor.userId;
    } else {
      const doctor = await Doctor.findOne({ userId: doctorId });
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
      if (!doctor.isOnline) {
        return res.status(400).json({ message: 'Doctor is not online' });
      }
    }

    const priorityScore = queueService.calculatePriorityScore(
      emergencyLevel,
      0
    );

    const consultation = await Consultation.create({
      patientId: req.user.id,
      doctorId: assignedDoctorId,
      symptoms,
      visitType,
      previousVisits: previousVisits || 0,
      emergencyLevel,
      predictedCategory,
      consultationMode,
      predictedDuration,
      priorityScore,
      type: 'scheduled',
      scheduledDate: scheduled,
    });

    await Doctor.findOneAndUpdate(
      { userId: assignedDoctorId },
      { $inc: { currentQueueLength: 1 } }
    );

    if (io) {
      io.to(`doctor-${assignedDoctorId}`).emit('queue-updated');
    }

    res.status(201).json(consultation);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getQueueStatus = async (req, res) => {
  try {
    const consultations = await Consultation.find({
      patientId: req.user.id,
      status: { $in: ['waiting', 'in-progress'] },
    }).populate('doctorId', 'name email');

    res.json(consultations);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const startSession = async (req, res) => {
  try {
    const { id } = req.params;
    const io = req.app.get('io');

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    consultation.status = 'in-progress';
    consultation.startTime = new Date();
    await consultation.save();

    if (io) {
      io.to(`patient-${consultation.patientId}`).emit('session-started', {
        consultationId: consultation._id,
      });
      io.to(`doctor-${consultation.doctorId}`).emit('session-started', {
        consultationId: consultation._id,
      });
    }

    res.json(consultation);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const endSession = async (req, res) => {
  try {
    const { id } = req.params;
    const io = req.app.get('io');

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    consultation.status = 'completed';
    consultation.endTime = new Date();

    if (consultation.startTime) {
      consultation.actualDuration = Math.round(
        (consultation.endTime - consultation.startTime) / (1000 * 60)
      );
    }
    await consultation.save();

    await Doctor.findOneAndUpdate(
      { userId: consultation.doctorId },
      { $inc: { currentQueueLength: -1 } }
    );

    if (
      consultation.actualDuration &&
      consultation.predictedDuration &&
      consultation.actualDuration > consultation.predictedDuration
    ) {
      const nextConsultation = await Consultation.findOne({
        doctorId: consultation.doctorId,
        status: 'waiting',
      }).sort({ priorityScore: -1 });

      if (nextConsultation && io) {
        io.to(`doctor-${consultation.doctorId}`).emit('queue-updated');
        io.to(`patient-${nextConsultation.patientId}`).emit('notification', {
          message:
            'The doctor is currently engaged. Please wait, your estimated time has been updated.',
        });
      }
    }

    if (io) {
      io.to(`patient-${consultation.patientId}`).emit('session-ended', {
        consultationId: consultation._id,
      });
      io.to(`doctor-${consultation.doctorId}`).emit('session-ended', {
        consultationId: consultation._id,
      });
    }

    res.json(consultation);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getQueue = async (req, res) => {
  try {
    const queue = await queueService.getOptimizedQueue(req.user.id);
    res.json(queue);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getGlobalQueue = async (req, res) => {
  try {
    const consultations = await Consultation.find({
      status: { $in: ['waiting', 'in-progress'] },
    }).populate('doctorId', 'name email').populate('patientId', 'name email');

    const grouped = {};
    for (const c of consultations) {
      const key = c.doctorId ? c.doctorId._id.toString() : 'unassigned';
      if (!grouped[key]) {
        grouped[key] = {
          doctor: c.doctorId,
          consultations: [],
        };
      }
      grouped[key].consultations.push(c);
    }

    res.json(Object.values(grouped));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getMetrics = async (req, res) => {
  try {
    const completedConsultations = await Consultation.find({
      status: 'completed',
      startTime: { $exists: true },
    });

    let totalWaitTime = 0;
    let maxWaitTime = 0;

    for (const c of completedConsultations) {
      const waitTime = (new Date(c.startTime) - new Date(c.createdAt)) / (1000 * 60);
      totalWaitTime += waitTime;
      if (waitTime > maxWaitTime) {
        maxWaitTime = waitTime;
      }
    }

    const avgWaitTime =
      completedConsultations.length > 0
        ? Math.round(totalWaitTime / completedConsultations.length)
        : 0;

    const doctorIdleCount = await Doctor.countDocuments({
      isOnline: true,
      currentQueueLength: 0,
    });

    const totalPatients = await Consultation.distinct('patientId');
    const totalCompleted = completedConsultations.length;

    res.json({
      avgWaitTime,
      maxWaitTime: Math.round(maxWaitTime),
      doctorIdleCount,
      totalPatients: totalPatients.length,
      totalCompleted,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const predictSpecializationProxy = async (req, res) => {
  try {
    const { symptoms } = req.body;
    const specialization = await mlService.predictSpecialization(symptoms);
    res.json({ specialization });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  joinQueue,
  scheduleAppointment,
  getQueueStatus,
  startSession,
  endSession,
  getQueue,
  getGlobalQueue,
  getMetrics,
  predictSpecializationProxy,
};
