const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  specialization: { type: String, required: true },
  experience: { type: Number, default: 0 },
  isOnline: { type: Boolean, default: false },
  currentQueueLength: { type: Number, default: 0 },
});

module.exports = mongoose.model('Doctor', doctorSchema);
