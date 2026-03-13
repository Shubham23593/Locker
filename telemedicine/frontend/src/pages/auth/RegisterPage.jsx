import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'

const SPECIALIZATIONS = [
  'Cardiologist',
  'Neurologist',
  'Dermatologist',
  'Orthopedist',
  'General Physician',
  'Pulmonologist',
  'Gastroenterologist'
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    // Doctor fields
    specialization: '',
    experience: '',
    // Patient fields
    age: '',
    gender: ''
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

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role
    }

    if (form.role === 'doctor') {
      payload.specialization = form.specialization
      payload.experience = Number(form.experience)
    } else if (form.role === 'patient') {
      payload.age = Number(form.age)
      payload.gender = form.gender
    }

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏥</div>
          <h1 className="text-2xl font-bold text-gray-800">Telemedicine Queue</h1>
          <p className="text-gray-500 text-sm mt-1">Create your account</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">Register</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Common Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Min 6 characters"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Re-enter password"
                className="input-field"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Role</label>
              <div className="grid grid-cols-3 gap-2">
                {['patient', 'doctor', 'admin'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, role: r }))}
                    className={`py-2 px-3 rounded-lg border text-sm font-medium capitalize transition-colors ${
                      form.role === r
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {r === 'patient' ? '🧑‍⚕️ ' : r === 'doctor' ? '👨‍⚕️ ' : '🔧 '}
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Doctor-specific Fields */}
            {form.role === 'doctor' && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="text-sm font-semibold text-blue-700">Doctor Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Specialization</label>
                  <select
                    name="specialization"
                    value={form.specialization}
                    onChange={handleChange}
                    required={form.role === 'doctor'}
                    className="input-field"
                  >
                    <option value="">Select specialization</option>
                    {SPECIALIZATIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    required={form.role === 'doctor'}
                    min="0"
                    max="60"
                    placeholder="e.g. 5"
                    className="input-field"
                  />
                </div>
              </div>
            )}

            {/* Patient-specific Fields */}
            {form.role === 'patient' && (
              <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-100">
                <h3 className="text-sm font-semibold text-green-700">Patient Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={form.age}
                    onChange={handleChange}
                    required={form.role === 'patient'}
                    min="1"
                    max="120"
                    placeholder="e.g. 30"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    required={form.role === 'patient'}
                    className="input-field"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
