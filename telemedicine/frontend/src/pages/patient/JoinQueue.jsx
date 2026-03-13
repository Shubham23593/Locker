import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './JoinQueue.css';

const EMERGENCY_LABELS = {
  1: '1 - Minor',
  2: '2 - Low',
  3: '3 - Moderate',
  4: '4 - High',
  5: '5 - Critical',
};

export default function JoinQueue() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    visitType: 'Checkup',
    previousVisitCount: '',
    symptoms: '',
    emergencyLevel: '1',
    consultationMode: 'video',
    doctorSelection: 'auto',
    selectedDoctor: '',
  });

  const [predictedCategory, setPredictedCategory] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const predictSpecialization = async () => {
    if (!form.symptoms.trim()) return;
    try {
      const { data } = await api.post('/queue/predict-specialization', {
        symptoms: form.symptoms,
      });
      setPredictedCategory(data.category || data.specialization || '');
    } catch {
      /* prediction is optional */
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
    setLoading(true);

    const payload = {
      visitType: form.visitType,
      symptoms: form.symptoms,
      emergencyLevel: Number(form.emergencyLevel),
      consultationMode: form.consultationMode,
      predictedCategory,
    };

    if (form.visitType === 'Follow-up') {
      payload.previousVisits = Number(form.previousVisitCount);
    }

    if (form.doctorSelection === 'custom' && form.selectedDoctor) {
      payload.doctorId = form.selectedDoctor;
    }

    try {
      await api.post('/queue/join', payload);
      navigate('/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join queue.');
    } finally {
      setLoading(false);
    }
  };

  const emergencyLevel = Number(form.emergencyLevel);

  return (
    <div className="joinqueue-page">
      <form className="joinqueue-card" onSubmit={handleSubmit}>
        <h2 className="joinqueue-title">Join Queue</h2>

        {error && <div className="joinqueue-error">{error}</div>}

        {/* Visit Type */}
        <label className="joinqueue-label" htmlFor="visitType">Visit Type</label>
        <select
          id="visitType"
          className="joinqueue-input"
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
            <label className="joinqueue-label" htmlFor="previousVisitCount">
              Previous Visit Count
            </label>
            <input
              id="previousVisitCount"
              className="joinqueue-input"
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
        <label className="joinqueue-label" htmlFor="symptoms">
          Symptoms / Chief Complaint
        </label>
        <textarea
          id="symptoms"
          className="joinqueue-input joinqueue-textarea"
          name="symptoms"
          placeholder="Describe your symptoms…"
          value={form.symptoms}
          onChange={handleChange}
          onBlur={predictSpecialization}
          rows={4}
          required
        />

        {predictedCategory && (
          <div className="joinqueue-prediction">
            <span className="joinqueue-badge">{predictedCategory}</span>
            <span className="joinqueue-badge-label">Predicted Specialization</span>
          </div>
        )}

        {/* Emergency Level */}
        <label className="joinqueue-label" htmlFor="emergencyLevel">
          Emergency Level
        </label>
        <select
          id="emergencyLevel"
          className="joinqueue-input"
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
          <div className="joinqueue-warning">
            ⚠️ Warning: Select High Emergency only for severe cases. Misuse may
            result in a fine or queue penalty.
          </div>
        )}

        {/* Consultation Mode */}
        <fieldset className="joinqueue-fieldset">
          <legend className="joinqueue-label">Consultation Mode</legend>
          <label className="joinqueue-radio">
            <input
              type="radio"
              name="consultationMode"
              value="video"
              checked={form.consultationMode === 'video'}
              onChange={handleChange}
            />
            Video Call
          </label>
          <label className="joinqueue-radio">
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
        <fieldset className="joinqueue-fieldset">
          <legend className="joinqueue-label">Doctor Selection</legend>
          <label className="joinqueue-radio">
            <input
              type="radio"
              name="doctorSelection"
              value="auto"
              checked={form.doctorSelection === 'auto'}
              onChange={handleDoctorSelectionChange}
            />
            Auto-Assign (Random)
          </label>
          <label className="joinqueue-radio">
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
            <label className="joinqueue-label" htmlFor="selectedDoctor">
              Select Doctor
            </label>
            <select
              id="selectedDoctor"
              className="joinqueue-input"
              name="selectedDoctor"
              value={form.selectedDoctor}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Choose a doctor</option>
              {doctors.map((doc) => (
                <option key={doc._id} value={doc.userId?._id || doc._id}>
                  {doc.userId?.name || doc.name} — {doc.specialization}
                </option>
              ))}
            </select>
          </>
        )}

        <button className="joinqueue-btn" type="submit" disabled={loading}>
          {loading ? 'Joining…' : 'Join Queue'}
        </button>
      </form>
    </div>
  );
}
