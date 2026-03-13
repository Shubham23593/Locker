import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import api from '../../services/api';
import './SimulationEngine.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function SimulationEngine() {
  const [patientCount, setPatientCount] = useState(20);
  const [emergencyRate, setEmergencyRate] = useState(30);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runSimulation = async () => {
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const { data } = await api.get('/admin/simulation', {
        params: { patientCount, emergencyRate },
      });
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Simulation failed.');
    } finally {
      setLoading(false);
    }
  };

  const fifo = results?.fifo || results?.baseline || {};
  const optimized = results?.optimized || results?.priority || {};

  const pctImprovement = (base, opt) => {
    if (!base || base === 0) return null;
    return (((base - opt) / base) * 100).toFixed(1);
  };

  const avgWaitImprove = pctImprovement(fifo.avgWaitTime, optimized.avgWaitTime);
  const maxWaitImprove = pctImprovement(fifo.maxWaitTime, optimized.maxWaitTime);
  const throughputImprove = pctImprovement(
    optimized.throughput,
    fifo.throughput
  ); // reversed: higher is better

  const chartData = results
    ? {
        labels: ['Avg Wait Time', 'Max Wait Time', 'Throughput'],
        datasets: [
          {
            label: 'FIFO (Baseline)',
            data: [
              fifo.avgWaitTime || 0,
              fifo.maxWaitTime || 0,
              fifo.throughput || 0,
            ],
            backgroundColor: '#94a3b8',
            borderRadius: 6,
          },
          {
            label: 'Optimized (Priority)',
            data: [
              optimized.avgWaitTime || 0,
              optimized.maxWaitTime || 0,
              optimized.throughput || 0,
            ],
            backgroundColor: '#4f46e5',
            borderRadius: 6,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: { display: true, text: 'FIFO vs Optimized Comparison' },
      legend: { position: 'bottom' },
    },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <div className="se-page">
      <h2 className="se-title">Simulation Engine</h2>

      {/* Input Form */}
      <div className="se-form-card">
        <div className="se-field">
          <label className="se-label" htmlFor="patientCount">
            Patient Count
          </label>
          <input
            id="patientCount"
            className="se-input"
            type="number"
            min="1"
            max="500"
            value={patientCount}
            onChange={(e) => setPatientCount(Number(e.target.value))}
          />
        </div>

        <div className="se-field">
          <label className="se-label" htmlFor="emergencyRate">
            Emergency Rate: <strong>{emergencyRate}%</strong>
          </label>
          <input
            id="emergencyRate"
            className="se-slider"
            type="range"
            min="0"
            max="100"
            value={emergencyRate}
            onChange={(e) => setEmergencyRate(Number(e.target.value))}
          />
          <div className="se-slider-labels">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        <button
          className="se-run-btn"
          onClick={runSimulation}
          disabled={loading}
        >
          {loading ? 'Running…' : 'Run Simulation'}
        </button>

        {error && <p className="se-error">{error}</p>}
      </div>

      {/* Results */}
      {results && (
        <>
          <div className="se-comparison">
            {/* FIFO Card */}
            <div className="se-result-card se-card-fifo">
              <h3 className="se-card-title">FIFO (Baseline)</h3>
              <div className="se-metric">
                <span className="se-metric-label">Avg Wait Time</span>
                <span className="se-metric-value">
                  {(fifo.avgWaitTime ?? 0).toFixed(1)} min
                </span>
              </div>
              <div className="se-metric">
                <span className="se-metric-label">Max Wait Time</span>
                <span className="se-metric-value">
                  {(fifo.maxWaitTime ?? 0).toFixed(1)} min
                </span>
              </div>
              <div className="se-metric">
                <span className="se-metric-label">Throughput</span>
                <span className="se-metric-value">
                  {fifo.throughput ?? 0}
                </span>
              </div>
            </div>

            {/* Optimized Card */}
            <div className="se-result-card se-card-optimized">
              <h3 className="se-card-title">Optimized (Priority)</h3>
              <div className="se-metric">
                <span className="se-metric-label">Avg Wait Time</span>
                <span className="se-metric-value">
                  {(optimized.avgWaitTime ?? 0).toFixed(1)} min
                </span>
                {avgWaitImprove > 0 && (
                  <span className="se-improve">↓ {avgWaitImprove}%</span>
                )}
              </div>
              <div className="se-metric">
                <span className="se-metric-label">Max Wait Time</span>
                <span className="se-metric-value">
                  {(optimized.maxWaitTime ?? 0).toFixed(1)} min
                </span>
                {maxWaitImprove > 0 && (
                  <span className="se-improve">↓ {maxWaitImprove}%</span>
                )}
              </div>
              <div className="se-metric">
                <span className="se-metric-label">Throughput</span>
                <span className="se-metric-value">
                  {optimized.throughput ?? 0}
                </span>
                {throughputImprove !== null &&
                  Number(throughputImprove) < 0 && (
                    <span className="se-improve">
                      ↑ {Math.abs(Number(throughputImprove))}%
                    </span>
                  )}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="se-chart-container">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </>
      )}
    </div>
  );
}
