import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'
import './RegisterPage.css'

const SPECIALIZATIONS = [
  'Cardiologist','Neurologist','Dermatologist','Orthopedist',
  'General Physician','Pulmonologist','Gastroenterologist'
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'patient', specialization: '', experience: '', age: '', gender: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }

    const payload = { name: form.name, email: form.email, password: form.password, role: form.role }
    if (form.role === 'doctor') { payload.specialization = form.specialization; payload.experience = Number(form.experience) }
    else if (form.role === 'patient') { payload.age = Number(form.age); payload.gender = form.gender }

    setLoading(true)
    try {
      await api.post('/auth/register', payload)
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <span className="logo-icon">🏥</span>
          <h1>Telemedicine Queue</h1>
          <p>Create your account</p>
        </div>
        <div className="register-card">
          <h2>Register</h2>
          {error && <div className="register-error">{error}</div>}
          <form onSubmit={handleSubmit} className="register-form">
            <div className="rform-group">
              <label className="rform-label">Full Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="John Doe" className="rform-input" />
            </div>
            <div className="rform-group">
              <label className="rform-label">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" className="rform-input" />
            </div>
            <div className="rform-group">
              <label className="rform-label">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="Min 6 characters" className="rform-input" />
            </div>
            <div className="rform-group">
              <label className="rform-label">Confirm Password</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required placeholder="Re-enter password" className="rform-input" />
            </div>
            <div>
              <p className="role-label">Role</p>
              <div className="role-grid">
                {['patient','doctor','admin'].map((r) => (
                  <button key={r} type="button" onClick={() => setForm((p) => ({...p, role: r}))}
                    className={`role-btn${form.role === r ? ' role-btn--active' : ''}`}>
                    {r === 'patient' ? '🧑‍⚕️ ' : r === 'doctor' ? '👨‍⚕️ ' : '🔧 '}
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {form.role === 'doctor' && (
              <div className="role-section--doctor">
                <h3>Doctor Information</h3>
                <div className="rform-group">
                  <label className="rform-label">Specialization</label>
                  <select name="specialization" value={form.specialization} onChange={handleChange} required className="rform-input">
                    <option value="">Select specialization</option>
                    {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="rform-group">
                  <label className="rform-label">Years of Experience</label>
                  <input type="number" name="experience" value={form.experience} onChange={handleChange} required min="0" max="60" placeholder="e.g. 5" className="rform-input" />
                </div>
              </div>
            )}
            {form.role === 'patient' && (
              <div className="role-section--patient">
                <h3>Patient Information</h3>
                <div className="rform-group">
                  <label className="rform-label">Age</label>
                  <input type="number" name="age" value={form.age} onChange={handleChange} required min="1" max="120" placeholder="e.g. 30" className="rform-input" />
                </div>
                <div className="rform-group">
                  <label className="rform-label">Gender</label>
                  <select name="gender" value={form.gender} onChange={handleChange} required className="rform-input">
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            )}
            <button type="submit" disabled={loading} className="rbtn-primary">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="register-footer">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
