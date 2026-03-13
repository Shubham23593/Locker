import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Register.css';

const ROLE_DASHBOARDS = {
  patient: '/patient/dashboard',
  doctor: '/doctor/dashboard',
  admin: '/admin/dashboard',
};

const SPECIALIZATIONS = [
  'General',
  'Cardiologist',
  'Neurologist',
  'Dermatologist',
  'Orthopedic',
  'Gastroenterologist',
  'Ophthalmologist',
  'ENT',
  'Pulmonologist',
  'Psychiatrist',
  'Dentist',
  'Gynecologist',
  'Pediatrician',
  'Endocrinologist',
  'Nephrologist',
  'Urologist',
];

const INITIAL_FORM = {
  name: '',
  email: '',
  password: '',
  role: 'patient',
  age: '',
  gender: '',
  specialization: '',
  experience: '',
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = { name: form.name, email: form.email, password: form.password, role: form.role };

    if (form.role === 'patient') {
      payload.age = Number(form.age);
      payload.gender = form.gender;
    } else if (form.role === 'doctor') {
      payload.specialization = form.specialization;
      payload.experience = Number(form.experience);
    }

    try {
      const { data } = await api.post('/auth/register', payload);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate(ROLE_DASHBOARDS[data.user.role] || '/');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <form className="register-card" onSubmit={handleSubmit}>
        <h2 className="register-title">Create Account</h2>
        <p className="register-subtitle">Join the telemedicine platform</p>

        {error && <div className="register-error">{error}</div>}

        <label className="register-label" htmlFor="name">Name</label>
        <input
          id="name"
          className="register-input"
          type="text"
          name="name"
          placeholder="Full name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <label className="register-label" htmlFor="email">Email</label>
        <input
          id="email"
          className="register-input"
          type="email"
          name="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label className="register-label" htmlFor="password">Password</label>
        <input
          id="password"
          className="register-input"
          type="password"
          name="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          required
        />

        <label className="register-label" htmlFor="role">Role</label>
        <select
          id="role"
          className="register-input"
          name="role"
          value={form.role}
          onChange={handleChange}
          required
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="admin">Admin</option>
        </select>

        {form.role === 'patient' && (
          <>
            <label className="register-label" htmlFor="age">Age</label>
            <input
              id="age"
              className="register-input"
              type="number"
              name="age"
              placeholder="Age"
              min="1"
              max="150"
              value={form.age}
              onChange={handleChange}
              required
            />

            <label className="register-label" htmlFor="gender">Gender</label>
            <select
              id="gender"
              className="register-input"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </>
        )}

        {form.role === 'doctor' && (
          <>
            <label className="register-label" htmlFor="specialization">
              Specialization
            </label>
            <select
              id="specialization"
              className="register-input"
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select specialization</option>
              {SPECIALIZATIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <label className="register-label" htmlFor="experience">
              Experience (years)
            </label>
            <input
              id="experience"
              className="register-input"
              type="number"
              name="experience"
              placeholder="Years of experience"
              min="0"
              value={form.experience}
              onChange={handleChange}
              required
            />
          </>
        )}

        <button className="register-btn" type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Register'}
        </button>

        <p className="register-footer">
          Already have an account?{' '}
          <Link to="/login" className="register-link">Sign In</Link>
        </p>
      </form>
    </div>
  );
}
