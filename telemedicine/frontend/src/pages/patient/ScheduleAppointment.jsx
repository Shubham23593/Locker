import React, { useState } from 'react';
import api from '../../services/api';
import './ScheduleAppointment.css';

const EMERGENCY_LABELS = {
  1: '1 - Minor',
  2: '2 - Low',
  3: '3 - Moderate',
  4: '4 - High',
  5: '5 - Critical',
};

function buildDateOptions() {
  const options = [];
  const labels = ['Today', 'Tomorrow', 'Day After Tomorrow'];
  for (let i = 0; i < 3; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    options.push({ label: labels[i], value: d.toISOString().split('T')[0] });
  }
  return options;
}

function buildTimeSlots() {
  const slots = [];
  for (let h = 9; h < 17; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour12 = h > 12 ? h - 12 : h;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const label = `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
      const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      slots.push({ label, value });
    }
  }
  return slots;
}

const DATE_OPTIONS = buildDateOptions();
const TIME_SLOTS = buildTimeSlots();

export default function ScheduleAppointment() {
  const [form, setForm] = useState({
    visitType: 'Checkup',
    previousVisitCount: '',
    symptoms: '',
    emergencyLevel: '1',
    consultationMode: 'video',
    doctorSelection: 'auto',
    selectedDoctor: '',
    date: DATE_OPTIONS[0].value,
    timeSlot: TIME_SLOTS[0].value,
  });

  const [predictedCategory, setPredictedCategory] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const predictSpecialization = async () => {
    if (!form.symptoms.trim()) return;
    try {
      const { data } = await api.post('/predict-specialization', {
        symptoms: form.symptoms,
      });
      setPredictedCategory(data.category || data.specialization || '');
    } catch {
      /* optional */
    }
  };

  const fetchDoctors = async (specialization) => {
    try {
      const { data } = await api.get('/doctor/by-specialization', {
        params: { specialization },
      });
      setDoctors(data.doctors || data || []);
    } catch {
      setDoctors([]);
    }
  };

  const handleDoctorSelectionChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, doctorSelection: value, selectedDoctor: '' }));
    if (value === 'custom' && predictedCategory) {
      fetchDoctors(predictedCategory);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const payload = {
      visitType: form.visitType,
      symptoms: form.symptoms,
      emergencyLevel: Number(form.emergencyLevel),
      consultationMode: form.consultationMode,
      predictedCategory,
      date: form.date,
      timeSlot: form.timeSlot,
    };

    if (form.visitType === 'Follow-up') {
      payload.previousVisitCount = Number(form.previousVisitCount);
    }

    if (form.doctorSelection === 'custom' && form.selectedDoctor) {
      payload.doctorId = form.selectedDoctor;
    }

    try {
      await api.post('/queue/schedule', payload);
      setSuccess('Appointment scheduled successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule appointment.');
    } finally {
      setLoading(false);
    }
  };

  const emergencyLevel = Number(form.emergencyLevel);

  return (
    <div className="schedule-page">
      <form className="schedule-card" onSubmit={handleSubmit}>
        <h2 className="schedule-title">Schedule Appointment</h2>

        {error && <div className="schedule-error">{error}</div>}
        {success && <div className="schedule-success">{success}</div>}

        {/* Visit Type */}
        <label className="schedule-label" htmlFor="visitType">Visit Type</label>
        <select
          id="visitType"
          className="schedule-input"
          name="visitType"
          value={form.visitType}
          onChange={handleChange}
          required
        >
          <option value="Checkup">Checkup</option>
          <option value="Follow-up">Follow-up</option>
        </select>

        {form.visitType === 'Follow-up' && (
          <>
            <label className="schedule-label" htmlFor="previousVisitCount">
              Previous Visit Count
            </label>
            <input
              id="previousVisitCount"
              className="schedule-input"
              type="number"
              name="previousVisitCount"
              min="0"
              placeholder="Number of previous visits"
              value={form.previousVisitCount}
              onChange={handleChange}
              required
            />
          </>
        )}

        {/* Symptoms */}
        <label className="schedule-label" htmlFor="symptoms">
          Symptoms / Chief Complaint
        </label>
        <textarea
          id="symptoms"
          className="schedule-input schedule-textarea"
          name="symptoms"
          placeholder="Describe your symptoms…"
          value={form.symptoms}
          onChange={handleChange}
          onBlur={predictSpecialization}
          rows={4}
          required
        />

        {predictedCategory && (
          <div className="schedule-prediction">
            <span className="schedule-badge">{predictedCategory}</span>
            <span className="schedule-badge-label">Predicted Specialization</span>
          </div>
        )}

        {/* Emergency Level */}
        <label className="schedule-label" htmlFor="emergencyLevel">
          Emergency Level
        </label>
        <select
          id="emergencyLevel"
          className="schedule-input"
          name="emergencyLevel"
          value={form.emergencyLevel}
          onChange={handleChange}
          required
        >
          {Object.entries(EMERGENCY_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>

        {emergencyLevel >= 4 && (
          <div className="schedule-warning">
            ⚠️ Warning: Select High Emergency only for severe cases. Misuse may
            result in a fine or queue penalty.
          </div>
        )}

        {/* Consultation Mode */}
        <fieldset className="schedule-fieldset">
          <legend className="schedule-label">Consultation Mode</legend>
          <label className="schedule-radio">
            <input
              type="radio"
              name="consultationMode"
              value="video"
              checked={form.consultationMode === 'video'}
              onChange={handleChange}
            />
            Video Call
          </label>
          <label className="schedule-radio">
            <input
              type="radio"
              name="consultationMode"
              value="chat"
              checked={form.consultationMode === 'chat'}
              onChange={handleChange}
            />
            Chat
          </label>
        </fieldset>

        {/* Doctor Selection */}
        <fieldset className="schedule-fieldset">
          <legend className="schedule-label">Doctor Selection</legend>
          <label className="schedule-radio">
            <input
              type="radio"
              name="doctorSelection"
              value="auto"
              checked={form.doctorSelection === 'auto'}
              onChange={handleDoctorSelectionChange}
            />
            Auto-Assign (Random)
          </label>
          <label className="schedule-radio">
            <input
              type="radio"
              name="doctorSelection"
              value="custom"
              checked={form.doctorSelection === 'custom'}
              onChange={handleDoctorSelectionChange}
            />
            Custom Selection
          </label>
        </fieldset>

        {form.doctorSelection === 'custom' && (
          <>
            <label className="schedule-label" htmlFor="selectedDoctor">
              Select Doctor
            </label>
            <select
              id="selectedDoctor"
              className="schedule-input"
              name="selectedDoctor"
              value={form.selectedDoctor}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Choose a doctor</option>
              {doctors.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.name} — {doc.specialization}
                </option>
              ))}
            </select>
          </>
        )}

        {/* Date Selection */}
        <fieldset className="schedule-fieldset">
          <legend className="schedule-label">Preferred Date</legend>
          <div className="schedule-date-options">
            {DATE_OPTIONS.map((opt) => (
              <label key={opt.value} className="schedule-date-chip">
                <input
                  type="radio"
                  name="date"
                  value={opt.value}
                  checked={form.date === opt.value}
                  onChange={handleChange}
                />
                <span className="schedule-date-chip-text">
                  {opt.label}
                  <small>{opt.value}</small>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Time Slot */}
        <label className="schedule-label" htmlFor="timeSlot">Time Slot</label>
        <select
          id="timeSlot"
          className="schedule-input"
          name="timeSlot"
          value={form.timeSlot}
          onChange={handleChange}
          required
        >
          {TIME_SLOTS.map((slot) => (
            <option key={slot.value} value={slot.value}>
              {slot.label}
            </option>
          ))}
        </select>

        <button className="schedule-btn" type="submit" disabled={loading}>
          {loading ? 'Scheduling…' : 'Schedule Appointment'}
        </button>
      </form>
    </div>
  );
}
