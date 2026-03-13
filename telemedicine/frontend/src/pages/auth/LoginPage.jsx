import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import './LoginPage.css'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      const { token, user } = res.data
      login(token, user)
      if (user.role === 'patient') navigate('/patient')
      else if (user.role === 'doctor') navigate('/doctor')
      else if (user.role === 'admin') navigate('/admin')
      else navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <span className="logo-icon">🏥</span>
          <h1>Telemedicine Queue</h1>
          <p>Optimization System</p>
        </div>
        <div className="login-card">
          <h2>Sign In</h2>
          {error && <div className="login-error">{error}</div>}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="••••••••" className="form-input" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="login-footer">
            Don't have an account?{' '}
            <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
