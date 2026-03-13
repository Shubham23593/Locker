const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Consultation = require('../models/Consultation');

const getDashboard = async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const activeConsultations = await Consultation.countDocuments({
      status: { $in: ['waiting', 'in-progress'] },
    });
    const onlineDoctors = await Doctor.find({ isOnline: true }).populate(
      'userId',
      'name email'
    );

    res.json({
      totalPatients,
      totalDoctors,
      activeConsultations,
      onlineDoctors,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getSimulation = async (req, res) => {
  try {
    const patientCount = parseInt(req.query.patientCount, 10) || 20;
    const emergencyRateRaw = parseFloat(req.query.emergencyRate);
    const emergencyRate = emergencyRateRaw > 1 ? emergencyRateRaw / 100 : (emergencyRateRaw || 0.3);

    const patients = [];
    for (let i = 0; i < patientCount; i++) {
      const isEmergency = Math.random() < emergencyRate;
      const emergencyLevel = isEmergency
        ? Math.floor(Math.random() * 2) + 4 // 4-5
        : Math.floor(Math.random() * 3) + 1; // 1-3
      const duration = Math.floor(Math.random() * 20) + 5; // 5-24 min
      patients.push({
        id: i + 1,
        emergencyLevel,
        duration,
        arrivalOrder: i + 1,
      });
    }

    // FIFO simulation
    let fifoCurrentTime = 0;
    let fifoTotalWait = 0;
    let fifoMaxWait = 0;
    const fifoResults = patients.map((p) => {
      const waitTime = fifoCurrentTime;
      fifoTotalWait += waitTime;
      if (waitTime > fifoMaxWait) fifoMaxWait = waitTime;
      fifoCurrentTime += p.duration;
      return { ...p, waitTime };
    });

    // Optimized (priority-based) simulation
    const sorted = [...patients].sort(
      (a, b) => b.emergencyLevel - a.emergencyLevel
    );
    let optCurrentTime = 0;
    let optTotalWait = 0;
    let optMaxWait = 0;
    const optimizedResults = sorted.map((p) => {
      const waitTime = optCurrentTime;
      optTotalWait += waitTime;
      if (waitTime > optMaxWait) optMaxWait = waitTime;
      optCurrentTime += p.duration;
      return { ...p, waitTime };
    });

    res.json({
      patientCount,
      emergencyRate,
      fifo: {
        avgWaitTime: Math.round(fifoTotalWait / patientCount),
        maxWaitTime: fifoMaxWait,
        throughput: patientCount,
        results: fifoResults,
      },
      optimized: {
        avgWaitTime: Math.round(optTotalWait / patientCount),
        maxWaitTime: optMaxWait,
        throughput: patientCount,
        results: optimizedResults,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getDashboard, getAllUsers, getSimulation };
