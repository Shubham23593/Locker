import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import api from '../../services/api';
import './Analytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Analytics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data } = await api.get('/queue/metrics');
        setMetrics(data);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) return <p className="an-loading">Loading analytics…</p>;
  if (!metrics) return <p className="an-loading">No metrics data available.</p>;

  const avgWait = metrics.avgWaitTime ?? metrics.averageWaitTime ?? 0;
  const maxWait = metrics.maxWaitTime ?? 0;
  const idleCount = metrics.doctorIdleCount ?? metrics.idleDoctors ?? 0;
  const totalPatients = metrics.totalPatients ?? 0;
  const completed = metrics.completedConsultations ?? metrics.completed ?? 0;

  // Bar chart – avg wait time by doctor or period
  const barLabels =
    metrics.waitTimeByDoctor?.map((d) => d.name || d.doctor || `Doctor ${d.id}`) ||
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const barValues =
    metrics.waitTimeByDoctor?.map((d) => d.avgWait ?? d.averageWait ?? 0) ||
    [avgWait * 0.8, avgWait * 1.1, avgWait, avgWait * 0.9, avgWait * 1.2];

  const barData = {
    labels: barLabels,
    datasets: [
      {
        label: 'Avg Wait Time (min)',
        data: barValues,
        backgroundColor: '#4f46e5',
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, title: { display: true, text: 'Average Wait Time' } },
    scales: { y: { beginAtZero: true, title: { display: true, text: 'Minutes' } } },
  };

  // Pie chart – status distribution
  const waiting = metrics.waiting ?? 0;
  const inProgress = metrics.inProgress ?? metrics.activeConsultations ?? 0;
  const missed = metrics.missed ?? 0;

  const pieData = {
    labels: ['Waiting', 'In-Progress', 'Completed', 'Missed'],
    datasets: [
      {
        data: [waiting, inProgress, completed, missed],
        backgroundColor: ['#f59e0b', '#3b82f6', '#22c55e', '#ef4444'],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { title: { display: true, text: 'Consultation Status Distribution' } },
  };

  // Line chart – queue length over time
  const lineLabels =
    metrics.queueOverTime?.map((p) => p.time || p.label) ||
    ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM'];
  const lineValues =
    metrics.queueOverTime?.map((p) => p.length ?? p.value) ||
    [3, 7, 12, 10, 15, 8, 6, 4];

  const lineData = {
    labels: lineLabels,
    datasets: [
      {
        label: 'Queue Length',
        data: lineValues,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139,92,246,0.15)',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { title: { display: true, text: 'Queue Length Over Time' } },
    scales: { y: { beginAtZero: true } },
  };

  const metricCards = [
    { label: 'Avg Wait Time', value: `${Math.round(avgWait)} min`, color: '#3b82f6' },
    { label: 'Max Wait Time', value: `${Math.round(maxWait)} min`, color: '#ef4444' },
    { label: 'Doctor Idle Count', value: idleCount, color: '#f59e0b' },
    { label: 'Total Patients', value: totalPatients, color: '#8b5cf6' },
    { label: 'Completed', value: completed, color: '#22c55e' },
  ];

  return (
    <div className="an-page">
      <h2 className="an-title">Analytics</h2>

      {/* Metric Cards */}
      <div className="an-metrics-row">
        {metricCards.map((mc) => (
          <div key={mc.label} className="an-metric-card" style={{ borderTopColor: mc.color }}>
            <span className="an-metric-value">{mc.value}</span>
            <span className="an-metric-label">{mc.label}</span>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="an-charts-grid">
        <div className="an-chart-container">
          <Bar data={barData} options={barOptions} />
        </div>
        <div className="an-chart-container an-chart-pie">
          <Pie data={pieData} options={pieOptions} />
        </div>
        <div className="an-chart-container an-chart-wide">
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>
    </div>
  );
}
