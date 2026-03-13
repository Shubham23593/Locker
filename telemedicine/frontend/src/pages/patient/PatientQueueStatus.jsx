import React, { useState, useEffect } from 'react'
import { getSocket } from '../../services/socket'
import api from '../../services/api'
import ConsultationPage from './ConsultationPage'

const STATUS_CONFIG = {
  waiting: { color: 'bg-yellow-100 text-yellow-700', label: '⏳ Waiting', icon: '⏳' },
  'in-progress': { color: 'bg-green-100 text-green-700', label: '🟢 In Progress', icon: '🟢' },
  completed: { color: 'bg-gray-100 text-gray-600', label: '✅ Completed', icon: '✅' },
  cancelled: { color: 'bg-red-100 text-red-600', label: '❌ Cancelled', icon: '❌' }
}

export default function PatientQueueStatus() {
  const [queueData, setQueueData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStatus()

    const socket = getSocket()
    if (socket) {
      socket.on('queue_position_update', (data) => {
        setQueueData((prev) => prev ? { ...prev, ...data } : data)
      })
      socket.on('consultation_started', (data) => {
        setQueueData((prev) => prev ? { ...prev, status: 'in-progress', ...data } : data)
      })
      socket.on('consultation_ended', () => {
        setQueueData((prev) => prev ? { ...prev, status: 'completed' } : prev)
      })
    }

    const interval = setInterval(fetchStatus, 30000)

    return () => {
      clearInterval(interval)
      if (socket) {
        socket.off('queue_position_update')
        socket.off('consultation_started')
        socket.off('consultation_ended')
      }
    }
  }, [])

  async function fetchStatus() {
    try {
      const res = await api.get('/consultation/my-status')
      setQueueData(res.data?.data || res.data)
      setError('')
    } catch (err) {
      if (err.response?.status === 404) {
        setQueueData(null)
      } else {
        setError('Could not fetch queue status.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p>Checking queue status...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto">
        <div className="card text-center py-8">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-red-600">{error}</p>
          <button onClick={fetchStatus} className="btn-secondary mt-4">Retry</button>
        </div>
      </div>
    )
  }

  if (!queueData) {
    return (
      <div className="max-w-md mx-auto">
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-lg font-semibold text-gray-700">Not in Queue</h3>
          <p className="text-gray-500 text-sm mt-2">
            You're not currently in any queue. Use the "Join Queue" tab to get started.
          </p>
        </div>
      </div>
    )
  }

  const statusCfg = STATUS_CONFIG[queueData.status] || STATUS_CONFIG.waiting

  if (queueData.status === 'in-progress') {
    return (
      <ConsultationPage
        consultationData={queueData}
        onEnd={fetchStatus}
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Status Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Your Queue Status</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusCfg.color}`}>
            {statusCfg.label}
          </span>
        </div>

        {queueData.status === 'waiting' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">
                #{queueData.queuePosition || queueData.position || '—'}
              </div>
              <div className="text-xs text-blue-500 mt-1 font-medium">Queue Position</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {queueData.patientsAhead ?? '—'}
              </div>
              <div className="text-xs text-yellow-500 mt-1 font-medium">Patients Ahead</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center col-span-2 sm:col-span-1">
              <div className="text-3xl font-bold text-green-600">
                {queueData.estimatedWait ?? '—'}
              </div>
              <div className="text-xs text-green-500 mt-1 font-medium">Est. Wait (min)</div>
            </div>
          </div>
        )}

        {/* Doctor Info */}
        {queueData.doctorName && (
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">
              👨‍⚕️
            </div>
            <div>
              <p className="font-semibold text-gray-800">Dr. {queueData.doctorName}</p>
              <p className="text-sm text-gray-500">{queueData.doctorSpecialization || ''}</p>
            </div>
          </div>
        )}

        {/* Mode badge */}
        {queueData.consultationMode && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <span>{queueData.consultationMode === 'video' ? '📹' : '💬'}</span>
            <span className="capitalize">{queueData.consultationMode} consultation</span>
          </div>
        )}

        <button
          onClick={fetchStatus}
          className="btn-secondary mt-6 text-sm"
        >
          🔄 Refresh Status
        </button>
      </div>

      {/* Live update indicator */}
      <div className="flex items-center gap-2 text-xs text-gray-400 justify-center">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        Live updates enabled
      </div>
    </div>
  )
}
