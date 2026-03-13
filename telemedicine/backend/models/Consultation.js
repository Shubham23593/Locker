import mongoose from 'mongoose';

const consultationSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  symptoms: { type: String },
  visitType: { type: String, enum: ['checkup', 'followup'], default: 'checkup' },
  previousVisits: { type: Number, default: 0 },
  emergencyLevel: { type: Number, min: 1, max: 5, default: 1 },
  predictedCategory: { type: String },
  consultationMode: { type: String, enum: ['video', 'chat'], default: 'video' },
  predictedDuration: { type: Number },
  actualDuration: { type: Number },
  priorityScore: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['waiting', 'in-progress', 'completed', 'missed'],
    default: 'waiting',
  },
  type: { type: String, enum: ['live', 'scheduled'], default: 'live' },
  scheduledDate: { type: Date },
  patientName: { type: String },
  patientAge: { type: Number },
  assignedAt: { type: Date },
  sessionStartedAt: { type: Date },
  sessionEndedAt: { type: Date },
}, { timestamps: true });

const Consultation = mongoose.model('Consultation', consultationSchema);
export default Consultation;
