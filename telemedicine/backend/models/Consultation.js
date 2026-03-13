const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    symptoms: { type: String, required: true },
    visitType: {
      type: String,
      enum: ['Checkup', 'Follow-up'],
      required: true,
    },
    previousVisits: { type: Number, default: 0 },
    emergencyLevel: { type: Number, min: 1, max: 5, required: true },
    predictedCategory: { type: String },
    consultationMode: {
      type: String,
      enum: ['video', 'chat'],
      required: true,
    },
    predictedDuration: { type: Number },
    actualDuration: { type: Number },
    priorityScore: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['waiting', 'in-progress', 'completed', 'missed'],
      default: 'waiting',
    },
    type: {
      type: String,
      enum: ['live', 'scheduled'],
      default: 'live',
    },
    scheduledDate: { type: Date },
    startTime: { type: Date },
    endTime: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Consultation', consultationSchema);
