import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { getSocket } from '../../services/socket'
import DoctorQueue from './DoctorQueue'
import NotificationBar from '../../components/NotificationBar'

export default function DoctorDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isActive, setIsActive] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [queue, setQueue] = useState([])
  const [currentPatient, setCurrentPatient] = useState(null)
  const [stats, setStats] = useState({ totalToday: 0, completed: 0, waiting: 0 })
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('queue')

  useEffect(() => {
    fetchDashboard()

    const socket = getSocket()
    if (socket) {
      socket.on('new_patient_joined', () => fetchDashboard())
      socket.on('queue_updated', () => fetchDashboard())
    }

    const interval = setInterval(fetchDashboard, 20000)
    return () => {
      clearInterval(interval)
      if (socket) {
        socket.off('new_patient_joined')
        socket.off('queue_updated')
      }
    }
  }, [])

  async function fetchDashboard() {
    try {
      const [statusRes, queueRes] = await Promise.allSettled([
        api.get('/doctor/status'),
        api.get('/doctor/queue')
      ])
      if (statusRes.status === 'fulfilled') {
        const data = statusRes.value.data?.data || statusRes.value.data
        setIsActive(data?.isActive ?? false)
        setCurrentPatient(data?.currentPatient || null)
        setStats(data?.stats || { totalToday: 0, completed: 0, waiting: 0 })
      }
      if (queueRes.status === 'fulfilled') {
        const data = queueRes.value.data?.data || queueRes.value.data || []
        setQueue(Array.isArray(data) ? data : [])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  async function toggleActive() {
    setToggling(true)
    try {
      const res = await api.patch('/doctor/toggle-status', { isActive: !isActive })
      setIsActive(res.data?.data?.isActive ?? !isActive)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status')
    } finally {
      setToggling(false)
    }
  }

  async function startSession(patientId) {
    try {
      const res = await api.post('/consultation/start', { patientId })
      setCurrentPatient(res.data?.data || res.data)
      fetchDashboard()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start session')
    }
  }

  async function endSession() {
    if (!currentPatient) return
    if (!window.confirm('End current consultation?')) return
    try {
      await api.post(`/consultation/${currentPatient.consultationId || currentPatient._id}/end`)
      setCurrentPatient(null)
      fetchDashboard()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to end session')
    }
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationBar />

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👨‍⚕️</span>
            <div>
              <h1 className="text-lg font-bold text-gray-800 leading-tight">Doctor Portal</h1>
              <p className="text-xs text-gray-500">Dr. {user?.name}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-secondary text-sm">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Active Toggle */}
        <div className="card">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Availability Status</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {isActive
                  ? 'You are currently accepting patients'
                  : 'You are currently offline'}
              </p>
            </div>
            <button
              onClick={toggleActive}
              disabled={toggling}
              className={`relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-lg font-bold transition-all shadow-md ${
                isActive
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              } ${toggling ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <span className={`w-4 h-4 rounded-full bg-white ${isActive ? 'opacity-100' : 'opacity-50'} animate-pulse`} />
              {toggling ? 'Updating...' : isActive ? '🟢 Active' : '🔴 Inactive'}
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Today Total', value: stats.totalToday, bgClass: 'bg-blue-50', textClass: 'text-blue-600', subClass: 'text-blue-500' },
            { label: 'Completed', value: stats.completed, bgClass: 'bg-green-50', textClass: 'text-green-600', subClass: 'text-green-500' },
            { label: 'Waiting', value: stats.waiting || queue.length, bgClass: 'bg-yellow-50', textClass: 'text-yellow-600', subClass: 'text-yellow-500' }
          ].map((s) => (
            <div key={s.label} className={`card text-center ${s.bgClass}`}>
              <div className={`text-3xl font-bold ${s.textClass}`}>{s.value ?? 0}</div>
              <div className={`text-xs font-medium ${s.subClass} mt-1`}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Current Patient */}
        {currentPatient && (
          <div className="card border-2 border-green-400 bg-green-50">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                    Current Session
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  {currentPatient.patientName || currentPatient.name}
                </h3>
                <p className="text-sm text-gray-600 mt-0.5">
                  {currentPatient.symptoms || currentPatient.chiefComplaint}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Mode: {currentPatient.consultationMode} |
                  Emergency: Level {currentPatient.emergencyLevel}
                </p>
              </div>
              <button onClick={endSession} className="btn-danger">
                End Session
              </button>
            </div>
          </div>
        )}

        {/* Tab Selector */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {[
              { key: 'queue', label: '📋 Patient Queue' },
              { key: 'info', label: '👤 My Profile' }
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  tab === t.key
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-4">
            {tab === 'queue' && (
              <DoctorQueue
                queue={queue}
                loading={loading}
                currentPatient={currentPatient}
                isActive={isActive}
                onStartSession={startSession}
                onRefresh={fetchDashboard}
              />
            )}
            {tab === 'info' && (
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex gap-2">
                  <span className="font-medium text-gray-700 w-28">Name:</span>
                  <span>Dr. {user?.name}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium text-gray-700 w-28">Email:</span>
                  <span>{user?.email}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium text-gray-700 w-28">Specialization:</span>
                  <span>{user?.specialization || 'N/A'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium text-gray-700 w-28">Experience:</span>
                  <span>{user?.experience ? `${user.experience} years` : 'N/A'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
