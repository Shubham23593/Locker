const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  age: { type: Number },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
});

module.exports = mongoose.model('Patient', patientSchema);
