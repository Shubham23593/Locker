import Consultation from '../models/Consultation.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import { sortQueueByPriority } from '../services/queueService.js';

// GET /api/admin/dashboard
export const getDashboard = async (req, res) => {
  try {
    const [totalPatients, activeDoctors, activeConsultations, completedConsultations] =
      await Promise.all([
        User.countDocuments({ role: 'patient' }),
        Doctor.countDocuments({ isOnline: true }),
        Consultation.countDocuments({ status: { $in: ['waiting', 'in-progress'] } }),
        Consultation.find({ status: 'completed' }),
      ]);

    const totalWaitTime = completedConsultations.reduce((sum, c) => {
      if (c.assignedAt && c.sessionStartedAt) {
        return sum + (c.sessionStartedAt - c.assignedAt) / 60000;
      }
      return sum;
    }, 0);

    const avgWaitTime = completedConsultations.length
      ? Math.round(totalWaitTime / completedConsultations.length)
      : 0;

    const totalDoctors = await Doctor.countDocuments();

    res.json({
      totalPatients,
      activeDoctors,
      totalDoctors,
      activeConsultations,
      totalConsultations: completedConsultations.length,
      avgWaitTime,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get dashboard', error: err.message });
  }
};

// GET /api/admin/analytics
export const getAnalytics = async (req, res) => {
  try {
    const completed = await Consultation.find({ status: 'completed' });

    // FIFO simulation: sort by createdAt
    const fifoSorted = [...completed].sort((a, b) => a.createdAt - b.createdAt);
    const fifoWaitTimes = fifoSorted.map((c) =>
      c.assignedAt && c.sessionStartedAt
        ? (c.sessionStartedAt - c.assignedAt) / 60000
        : null
    );
    const validFifo = fifoWaitTimes.filter((t) => t !== null);
    const avgFifoWait = validFifo.length
      ? Math.round(validFifo.reduce((s, t) => s + t, 0) / validFifo.length)
      : 0;

    // Optimized simulation: sort by priorityScore desc
    const optimizedSorted = sortQueueByPriority(completed);
    const optimizedWaitTimes = optimizedSorted.map((c) =>
      c.assignedAt && c.sessionStartedAt
        ? (c.sessionStartedAt - c.assignedAt) / 60000
        : null
    );
    const validOptimized = optimizedWaitTimes.filter((t) => t !== null);
    const avgOptimizedWait = validOptimized.length
      ? Math.round(validOptimized.reduce((s, t) => s + t, 0) / validOptimized.length)
      : 0;

    const improvement =
      avgFifoWait > 0
        ? Math.round(((avgFifoWait - avgOptimizedWait) / avgFifoWait) * 100)
        : 0;

    const emergencyBreakdown = await Consultation.aggregate([
      { $group: { _id: '$emergencyLevel', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const categoryBreakdown = await Consultation.aggregate([
      { $group: { _id: '$predictedCategory', count: { $sum: 1 } } },
    ]);

    res.json({
      fifo: { avgWaitTime: avgFifoWait, total: completed.length },
      optimized: { avgWaitTime: avgOptimizedWait, total: completed.length },
      improvementPercent: improvement,
      emergencyBreakdown,
      categoryBreakdown,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get analytics', error: err.message });
  }
};

// POST /api/admin/simulate
export const simulateQueue = async (req, res) => {
  try {
    const { patients = 20, emergencyDistribution, consultationMode } = req.body;

    const distribution = emergencyDistribution || { 1: 40, 2: 30, 3: 15, 4: 10, 5: 5 };

    const simulatedPatients = [];
    let id = 1;
    for (const [level, percent] of Object.entries(distribution)) {
      const count = Math.round((percent / 100) * patients);
      for (let i = 0; i < count; i++) {
        simulatedPatients.push({
          id: id++,
          emergencyLevel: parseInt(level),
          waitingTimeMinutes: Math.floor(Math.random() * 30),
          consultationMode: consultationMode || 'video',
        });
      }
    }

    // FIFO order
    const fifoOrder = [...simulatedPatients];

    // Optimized order: by emergencyLevel desc, then priorityScore desc
    const optimizedOrder = [...simulatedPatients].sort((a, b) => {
      const scoreA = a.emergencyLevel * 5 * (a.waitingTimeMinutes + 1);
      const scoreB = b.emergencyLevel * 5 * (b.waitingTimeMinutes + 1);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return b.emergencyLevel - a.emergencyLevel;
    });

    const avgWait = (arr) => {
      let total = 0;
      // Each patient's effective wait = their own wait time + time spent behind i prior patients
      arr.forEach((p, i) => (total += p.waitingTimeMinutes + i));
      return Math.round(total / arr.length);
    };

    res.json({
      totalPatients: simulatedPatients.length,
      fifo: { avgWaitTime: avgWait(fifoOrder), order: fifoOrder.map((p) => p.id) },
      optimized: {
        avgWaitTime: avgWait(optimizedOrder),
        order: optimizedOrder.map((p) => p.id),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Simulation failed', error: err.message });
  }
};

// GET /api/admin/queues
export const getActiveQueues = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isOnline: true }).populate('userId', 'name email');

    const queues = await Promise.all(
      doctors.map(async (doctor) => {
        const waiting = await Consultation.find({
          doctorId: doctor._id,
          status: 'waiting',
        }).sort({ priorityScore: -1 });

        const inProgress = await Consultation.findOne({
          doctorId: doctor._id,
          status: 'in-progress',
        });

        return {
          doctor: { id: doctor._id, name: doctor.userId?.name, specialization: doctor.specialization },
          queueLength: waiting.length,
          currentPatient: inProgress,
          waitingPatients: waiting,
        };
      })
    );

    res.json({ queues, totalActive: queues.reduce((s, q) => s + q.queueLength, 0) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get active queues', error: err.message });
  }
};
