import React, { useState } from 'react'
import api from '../../services/api'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function SimulationEngine() {
  const [config, setConfig] = useState({
    patientCount: 100,
    emergencyRate: 20,
    doctorCount: 5,
    avgServiceTime: 15
  })
  const [result, setResult] = useState(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)

  function handleChange(e) {
    const { name, value } = e.target
    setConfig((prev) => ({ ...prev, [name]: Number(value) }))
  }

  async function runSimulation() {
    setError('')
    setResult(null)
    setRunning(true)
    setProgress(0)

    // Simulate progress animation
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 15, 90))
    }, 300)

    try {
      const res = await api.post('/admin/simulate', config)
      setProgress(100)
      setResult(res.data?.data || res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Simulation failed. Please try again.')
    } finally {
      clearInterval(progressInterval)
      setRunning(false)
    }
  }

  const chartData = result
    ? {
        labels: ['Avg Wait Time (min)', 'Max Wait Time (min)', 'Throughput (patients/hr)'],
        datasets: [
          {
            label: 'FIFO',
            data: [
              result.fifo?.avgWaitTime ?? 0,
              result.fifo?.maxWaitTime ?? 0,
              result.fifo?.throughput ?? 0
            ],
            backgroundColor: 'rgba(239,68,68,0.7)',
            borderColor: 'rgb(239,68,68)',
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: 'Optimized',
            data: [
              result.optimized?.avgWaitTime ?? 0,
              result.optimized?.maxWaitTime ?? 0,
              result.optimized?.throughput ?? 0
            ],
            backgroundColor: 'rgba(34,197,94,0.7)',
            borderColor: 'rgb(34,197,94)',
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      }
    : null

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-gray-800">🔬 Simulation Engine</h2>
        <p className="text-sm text-gray-500 mt-1">
          Compare FIFO vs Optimized queue algorithms with simulated patient data
        </p>
      </div>

      {/* Configuration */}
      <div className="card">
        <h3 className="font-semibold text-gray-700 mb-5">Simulation Parameters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Patient Count */}
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-600 mb-2">
              <span>Patient Count</span>
              <span className="text-blue-600 font-bold text-base">{config.patientCount}</span>
            </label>
            <input
              type="range"
              name="patientCount"
              value={config.patientCount}
              onChange={handleChange}
              min="10"
              max="500"
              step="10"
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>10</span>
              <span>500</span>
            </div>
          </div>

          {/* Emergency Rate */}
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-600 mb-2">
              <span>Emergency Rate (%)</span>
              <span className="text-red-600 font-bold text-base">{config.emergencyRate}%</span>
            </label>
            <input
              type="range"
              name="emergencyRate"
              value={config.emergencyRate}
              onChange={handleChange}
              min="0"
              max="100"
              step="5"
              className="w-full accent-red-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Doctor Count */}
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-600 mb-2">
              <span>Number of Doctors</span>
              <span className="text-green-600 font-bold text-base">{config.doctorCount}</span>
            </label>
            <input
              type="range"
              name="doctorCount"
              value={config.doctorCount}
              onChange={handleChange}
              min="1"
              max="20"
              step="1"
              className="w-full accent-green-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1</span>
              <span>20</span>
            </div>
          </div>

          {/* Avg Service Time */}
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-600 mb-2">
              <span>Avg Service Time (min)</span>
              <span className="text-yellow-600 font-bold text-base">{config.avgServiceTime}</span>
            </label>
            <input
              type="range"
              name="avgServiceTime"
              value={config.avgServiceTime}
              onChange={handleChange}
              min="5"
              max="60"
              step="5"
              className="w-full accent-yellow-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5 min</span>
              <span>60 min</span>
            </div>
          </div>
        </div>

        {/* Config summary */}
        <div className="mt-5 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div><span className="font-medium">Patients:</span> {config.patientCount}</div>
          <div><span className="font-medium">Emergency:</span> {config.emergencyRate}%</div>
          <div><span className="font-medium">Doctors:</span> {config.doctorCount}</div>
          <div><span className="font-medium">Avg Service:</span> {config.avgServiceTime} min</div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          onClick={runSimulation}
          disabled={running}
          className="btn-primary mt-5 w-full sm:w-auto"
        >
          {running ? '⏳ Running Simulation...' : '▶ Run Simulation'}
        </button>

        {/* Progress bar */}
        {running && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Simulating {config.patientCount} patients...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* FIFO */}
            <div className="card border-2 border-red-200 bg-red-50">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🔴</span>
                <h3 className="font-bold text-red-700">FIFO Algorithm</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Avg Wait Time', value: `${result.fifo?.avgWaitTime ?? 0} min` },
                  { label: 'Max Wait Time', value: `${result.fifo?.maxWaitTime ?? 0} min` },
                  { label: 'Throughput', value: `${result.fifo?.throughput ?? 0} p/hr` },
                  { label: 'Emergency Response', value: `${result.fifo?.emergencyResponseTime ?? 0} min` }
                ].map((item) => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-red-600">{item.label}</span>
                    <span className="font-bold text-red-700">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Optimized */}
            <div className="card border-2 border-green-200 bg-green-50">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🟢</span>
                <h3 className="font-bold text-green-700">Optimized Algorithm</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Avg Wait Time', value: `${result.optimized?.avgWaitTime ?? 0} min` },
                  { label: 'Max Wait Time', value: `${result.optimized?.maxWaitTime ?? 0} min` },
                  { label: 'Throughput', value: `${result.optimized?.throughput ?? 0} p/hr` },
                  { label: 'Emergency Response', value: `${result.optimized?.emergencyResponseTime ?? 0} min` }
                ].map((item) => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-green-600">{item.label}</span>
                    <span className="font-bold text-green-700">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Improvement highlight */}
          {result.improvement && (
            <div className="card bg-blue-50 border border-blue-200 text-center">
              <h3 className="text-lg font-bold text-blue-700 mb-1">
                ⚡ Optimization Improvement
              </h3>
              <div className="grid grid-cols-3 gap-4 mt-3">
                {[
                  { label: 'Wait Time Reduction', value: result.improvement.waitTimeReduction || '—' },
                  { label: 'Throughput Increase', value: result.improvement.throughputIncrease || '—' },
                  { label: 'Emergency Priority', value: result.improvement.emergencyImprovement || '—' }
                ].map((item) => (
                  <div key={item.label}>
                    <div className="text-2xl font-bold text-blue-600">{item.value}</div>
                    <div className="text-xs text-blue-500 mt-0.5">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chart */}
          {chartData && (
            <div className="card">
              <h3 className="font-semibold text-gray-700 mb-4">
                📊 FIFO vs Optimized — Comparison Chart
              </h3>
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: false }
                  },
                  scales: {
                    y: { beginAtZero: true }
                  }
                }}
              />
            </div>
          )}

          {/* Raw data */}
          {result.simulationDetails && (
            <div className="card">
              <h3 className="font-semibold text-gray-700 mb-3">📋 Simulation Details</h3>
              <pre className="text-xs text-gray-600 bg-gray-50 p-4 rounded-lg overflow-auto max-h-40">
                {JSON.stringify(result.simulationDetails, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
