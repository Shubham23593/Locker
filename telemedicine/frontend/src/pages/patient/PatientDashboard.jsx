import React, { useState, useEffect } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import JoinQueueForm from './JoinQueueForm'
import BookAppointmentForm from './BookAppointmentForm'
import PatientQueueStatus from './PatientQueueStatus'
import NotificationBar from '../../components/NotificationBar'
import './PatientDashboard.css'

const NAV_ITEMS = [
  { path: '', label: '🏥 Join Queue', end: true },
  { path: 'book', label: '📅 Book Appointment' },
  { path: 'status', label: '📊 My Queue' },
  { path: 'history', label: '📋 History' }
]

function HistoryPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/consultation/history')
      .then((res) => setRecords(res.data?.data || res.data || []))
      .catch(() => setError('Failed to load history'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="history-loading">Loading history...</div>
  if (error) return <div className="history-error">{error}</div>

  if (records.length === 0) {
    return (
      <div className="history-empty">
        <div className="empty-icon">📋</div>
        <h3>No consultation history yet</h3>
        <p>Your past consultations will appear here</p>
      </div>
    )
  }

  return (
    <div className="history-list">
      {records.map((rec, i) => (
        <div key={rec._id || i} className="history-card">
          <div className="history-card-inner">
            <div>
              <p className="history-card-doctor">Dr. {rec.doctor?.name || 'N/A'} — {rec.doctor?.specialization || ''}</p>
              <p className="history-card-symptoms">{rec.symptoms || rec.chiefComplaint || 'No symptoms recorded'}</p>
              <p className="history-card-meta">Mode: {rec.consultationMode} | Duration: {rec.duration || 'N/A'} min</p>
            </div>
            <div>
              <span className={rec.status === 'completed' ? 'history-status-completed' : 'history-status-other'}>
                {rec.status || 'completed'}
              </span>
              <p className="history-date">{rec.createdAt ? new Date(rec.createdAt).toLocaleDateString() : ''}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function PatientDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="patient-dash">
      <NotificationBar />
      <header className="patient-header">
        <div className="patient-header-inner">
          <div className="patient-brand">
            <span className="brand-icon">🏥</span>
            <div>
              <h1>Telemedicine</h1>
              <p>Patient Portal</p>
            </div>
          </div>
          <div className="patient-header-actions">
            <span className="patient-user">👤 {user?.name || 'Patient'}</span>
            <button onClick={handleLogout} className="pdash-btn-secondary">Logout</button>
          </div>
        </div>
      </header>
      <div className="patient-nav-bar">
        <div className="patient-nav-inner">
          <nav className="patient-nav">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={`/patient/${item.path}`}
                end={item.end}
                className={({ isActive }) => isActive ? 'patient-nav-link active' : 'patient-nav-link'}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
      <main className="patient-content">
        <Routes>
          <Route index element={<JoinQueueForm />} />
          <Route path="book" element={<BookAppointmentForm />} />
          <Route path="status" element={<PatientQueueStatus />} />
          <Route path="history" element={<HistoryPage />} />
        </Routes>
      </main>
    </div>
  )
}
