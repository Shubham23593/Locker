import React, { useState, useEffect } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import JoinQueueForm from './JoinQueueForm'
import BookAppointmentForm from './BookAppointmentForm'
import PatientQueueStatus from './PatientQueueStatus'
import NotificationBar from '../../components/NotificationBar'

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

  if (loading) return <div className="text-center py-12 text-gray-500">Loading history...</div>
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>

  if (records.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <div className="text-5xl mb-3">📋</div>
        <p className="text-lg font-medium">No consultation history yet</p>
        <p className="text-sm mt-1">Your past consultations will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {records.map((rec, i) => (
        <div key={rec._id || i} className="card">
          <div className="flex justify-between items-start flex-wrap gap-2">
            <div>
              <p className="font-semibold text-gray-800">
                Dr. {rec.doctor?.name || 'N/A'} — {rec.doctor?.specialization || ''}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {rec.symptoms || rec.chiefComplaint || 'No symptoms recorded'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Mode: {rec.consultationMode} | Duration: {rec.duration || 'N/A'} min
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                rec.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {rec.status || 'completed'}
              </span>
              <p className="text-xs text-gray-400 mt-1">
                {rec.createdAt ? new Date(rec.createdAt).toLocaleDateString() : ''}
              </p>
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
    <div className="min-h-screen bg-gray-50">
      <NotificationBar />

      {/* Top Nav */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏥</span>
            <div>
              <h1 className="text-lg font-bold text-gray-800 leading-tight">Telemedicine</h1>
              <p className="text-xs text-gray-500">Patient Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">
              👤 {user?.name || 'Patient'}
            </span>
            <button onClick={handleLogout} className="btn-secondary text-sm px-3 py-1.5">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={`/patient/${item.path}`}
                end={item.end}
                className={({ isActive }) =>
                  `tab-btn whitespace-nowrap py-3 ${isActive ? 'tab-active' : 'tab-inactive'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
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
