import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar, Line, Pie } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const CHART_DEFAULTS = {
  responsive: true,
  plugins: {
    legend: { position: 'top' }
  }
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState('week')

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  async function fetchAnalytics() {
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/admin/analytics?period=${period}`)
      setData(res.data?.data || res.data)
    } catch {
      setError('Failed to load analytics data.')
    } finally {
      setLoading(false)
    }
  }

  // Build chart data from API response or use mock data
  const barData = {
    labels: ['FIFO', 'Optimized'],
    datasets: [
      {
        label: 'Average Wait Time (minutes)',
        data: [
          data?.comparison?.fifoAvgWait ?? 28,
          data?.comparison?.optimizedAvgWait ?? 14
        ],
        backgroundColor: ['rgba(239,68,68,0.7)', 'rgba(34,197,94,0.7)'],
        borderColor: ['rgb(239,68,68)', 'rgb(34,197,94)'],
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  }

  const lineLabels = data?.waitTimeTrend?.map((d) => d.label) ||
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const lineData = {
    labels: lineLabels,
    datasets: [
      {
        label: 'FIFO Wait Time',
        data: data?.waitTimeTrend?.map((d) => d.fifo) || [30, 28, 32, 27, 35, 22, 25],
        borderColor: 'rgb(239,68,68)',
        backgroundColor: 'rgba(239,68,68,0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Optimized Wait Time',
        data: data?.waitTimeTrend?.map((d) => d.optimized) || [18, 15, 20, 13, 17, 11, 12],
        borderColor: 'rgb(34,197,94)',
        backgroundColor: 'rgba(34,197,94,0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  const modeLabels = data?.consultationModes
    ? Object.keys(data.consultationModes)
    : ['Video', 'Chat']
  const modeValues = data?.consultationModes
    ? Object.values(data.consultationModes)
    : [68, 32]

  const pieData = {
    labels: modeLabels,
    datasets: [
      {
        label: 'Consultations',
        data: modeValues,
        backgroundColor: [
          'rgba(59,130,246,0.8)',
          'rgba(16,185,129,0.8)',
          'rgba(245,158,11,0.8)'
        ],
        borderColor: ['rgb(59,130,246)', 'rgb(16,185,129)', 'rgb(245,158,11)'],
        borderWidth: 1
      }
    ]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Analytics Dashboard</h2>
          <p className="text-sm text-gray-500">Queue performance & consultation insights</p>
        </div>
        <div className="flex items-center gap-2">
          {['day', 'week', 'month'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-sm flex items-center gap-2">
          <span>⚠️</span>
          <span>{error} Showing sample data.</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-48 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          {data?.summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Consultations', value: data.summary.totalConsultations || 0, icon: '🩺' },
                { label: 'Avg Wait (Optimized)', value: `${data.summary.avgWaitOptimized || 14} min`, icon: '⚡' },
                { label: 'Time Saved', value: `${data.summary.timeSaved || '50%'}`, icon: '⏱' },
                { label: 'Patient Satisfaction', value: `${data.summary.satisfaction || '4.2'}/5`, icon: '⭐' }
              ].map((s) => (
                <div key={s.label} className="card text-center">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-2xl font-bold text-blue-600">{s.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bar: FIFO vs Optimized */}
            <div className="card">
              <h3 className="font-semibold text-gray-700 mb-4">
                📊 FIFO vs Optimized — Avg Wait Time
              </h3>
              <Bar
                data={barData}
                options={{
                  ...CHART_DEFAULTS,
                  plugins: {
                    ...CHART_DEFAULTS.plugins,
                    title: { display: false }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: { display: true, text: 'Minutes' }
                    }
                  }
                }}
              />
              <div className="mt-3 p-3 bg-green-50 rounded-lg text-sm text-green-700">
                ✅ Optimization reduces wait time by{' '}
                <strong>
                  {Math.round(
                    ((barData.datasets[0].data[0] - barData.datasets[0].data[1]) /
                      barData.datasets[0].data[0]) *
                      100
                  )}%
                </strong>
              </div>
            </div>

            {/* Pie: Consultation Modes */}
            <div className="card">
              <h3 className="font-semibold text-gray-700 mb-4">
                🥧 Consultation Modes Distribution
              </h3>
              <div className="flex justify-center">
                <div style={{ maxWidth: 280 }}>
                  <Pie
                    data={pieData}
                    options={{
                      ...CHART_DEFAULTS,
                      plugins: {
                        ...CHART_DEFAULTS.plugins,
                        legend: { position: 'bottom' }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Line: Wait Time Trend */}
          <div className="card">
            <h3 className="font-semibold text-gray-700 mb-4">
              📈 Wait Time Trend — FIFO vs Optimized
            </h3>
            <Line
              data={lineData}
              options={{
                ...CHART_DEFAULTS,
                plugins: {
                  ...CHART_DEFAULTS.plugins,
                  title: { display: false }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Wait Time (minutes)' }
                  }
                }
              }}
            />
          </div>
        </>
      )}

      <button
        onClick={fetchAnalytics}
        className="btn-secondary text-sm"
      >
        🔄 Refresh Analytics
      </button>
    </div>
  )
}
