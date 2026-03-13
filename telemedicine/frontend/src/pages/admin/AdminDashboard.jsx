import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import QueueMonitor from './QueueMonitor'
import AnalyticsDashboard from './AnalyticsDashboard'
import SimulationEngine from './SimulationEngine'
import NotificationBar from '../../components/NotificationBar'

const TABS = [
  { key: 'monitor', label: '📡 Queue Monitor' },
  { key: 'analytics', label: '📊 Analytics' },
  { key: 'simulation', label: '🔬 Simulation' }
]

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('monitor')

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationBar />

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔧</span>
            <div>
              <h1 className="text-lg font-bold text-gray-800 leading-tight">Admin Dashboard</h1>
              <p className="text-xs text-gray-500">Telemedicine Queue Optimization</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">
              👤 {user?.name}
            </span>
            <button onClick={handleLogout} className="btn-secondary text-sm">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`tab-btn py-3 ${
                  activeTab === tab.key ? 'tab-active' : 'tab-inactive'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'monitor' && <QueueMonitor />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'simulation' && <SimulationEngine />}
      </main>
    </div>
  )
}
