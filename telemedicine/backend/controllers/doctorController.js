const Doctor = require('../models/Doctor');
const User = require('../models/User');
const queueService = require('../services/queueService');

const toggleStatus = async (req, res) => {
  try {
    const io = req.app.get('io');

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    doctor.isOnline = !doctor.isOnline;
    await doctor.save();

    if (!doctor.isOnline) {
      await queueService.reassignPatients(req.user.id, io);
    }

    if (io) {
      io.emit('doctor-status-changed', {
        doctorId: req.user.id,
        isOnline: doctor.isOnline,
      });
    }

    res.json({ isOnline: doctor.isOnline });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getDoctorsBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.query;

    const doctors = await Doctor.find({
      specialization,
      isOnline: true,
    }).populate('userId', 'name email');

    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id }).populate(
      'userId',
      'name email role'
    );

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { toggleStatus, getDoctorsBySpecialization, getProfile };
