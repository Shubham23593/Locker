import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import { getSocket } from '../../services/socket'

export default function QueueMonitor() {
  const [doctors, setDoctors] = useState([])
  const [alerts, setAlerts] = useState([])
  const [globalStats, setGlobalStats] = useState({
    totalWaiting: 0,
    activeDoctors: 0,
    avgWait: 0,
    totalToday: 0
  })
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    fetchData()

    const socket = getSocket()
    if (socket) {
      socket.on('queue_updated', () => fetchData())
      socket.on('doctor_status_changed', () => fetchData())
      socket.on('notification', (data) => {
        const note = {
          id: Date.now(),
          message: data.message || data,
          type: data.type || 'info',
          time: new Date().toLocaleTimeString()
        }
        setAlerts((prev) => [note, ...prev].slice(0, 10))
      })
    }

    const interval = setInterval(fetchData, 15000)
    return () => {
      clearInterval(interval)
      if (socket) {
        socket.off('queue_updated')
        socket.off('doctor_status_changed')
        socket.off('notification')
      }
    }
  }, [])

  async function fetchData() {
    try {
      const res = await api.get('/admin/queue-monitor')
      const data = res.data?.data || res.data || {}
      setDoctors(data.doctors || [])
      setGlobalStats({
        totalWaiting: data.totalWaiting ?? 0,
        activeDoctors: data.activeDoctors ?? 0,
        avgWait: data.avgWait ?? 0,
        totalToday: data.totalToday ?? 0
      })
      setLastUpdated(new Date().toLocaleTimeString())
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const ALERT_STYLES = {
    emergency: 'bg-red-50 border-red-300 text-red-700',
    warning: 'bg-yellow-50 border-yellow-300 text-yellow-700',
    info: 'bg-blue-50 border-blue-300 text-blue-700'
  }

  return (
    <div className="space-y-6">
      {/* Global Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Waiting', value: globalStats.totalWaiting, icon: '⏳', textClass: 'text-yellow-600' },
          { label: 'Active Doctors', value: globalStats.activeDoctors, icon: '👨‍⚕️', textClass: 'text-green-600' },
          { label: 'Avg Wait (min)', value: globalStats.avgWait, icon: '⏱', textClass: 'text-blue-600' },
          { label: 'Today Total', value: globalStats.totalToday, icon: '📊', textClass: 'text-purple-600' }
        ].map((stat) => (
          <div key={stat.label} className="card text-center">
            <div className="text-3xl mb-1">{stat.icon}</div>
            <div className={`text-3xl font-bold ${stat.textClass}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doctor Status */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-lg">👨‍⚕️ Doctor Status</h3>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                {lastUpdated ? `Updated ${lastUpdated}` : 'Live'}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-10 text-gray-400">
                <div className="animate-spin text-2xl mb-2">⏳</div>
                Loading...
              </div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <div className="text-4xl mb-2">👥</div>
                <p>No doctors registered yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {doctors.map((doc, idx) => (
                  <div key={doc._id || idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        doc.isActive ? 'bg-green-100' : 'bg-gray-200'
                      }`}>
                        👨‍⚕️
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          Dr. {doc.name}
                        </p>
                        <p className="text-xs text-gray-500">{doc.specialization}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center hidden sm:block">
                        <div className="font-bold text-blue-600">{doc.queueLength || 0}</div>
                        <div className="text-xs text-gray-400">Waiting</div>
                      </div>
                      <div className="text-center hidden sm:block">
                        <div className="font-bold text-green-600">{doc.completedToday || 0}</div>
                        <div className="text-xs text-gray-400">Done Today</div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        doc.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {doc.isActive ? '🟢 Active' : '🔴 Offline'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Alerts */}
        <div>
          <div className="card h-full">
            <h3 className="font-bold text-gray-800 text-lg mb-4">🔔 Recent Alerts</h3>
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-3xl mb-2">🔕</div>
                <p className="text-sm">No alerts</p>
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border text-xs ${ALERT_STYLES[alert.type] || ALERT_STYLES.info}`}
                  >
                    <p className="font-medium">{alert.message}</p>
                    <p className="mt-0.5 opacity-70">{alert.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
