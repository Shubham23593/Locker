import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import socket from '../../services/socket';
import NotificationBar from '../../components/NotificationBar';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    activeConsultations: 0,
    onlineDoctors: 0,
  });
  const [globalQueue, setGlobalQueue] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/dashboard');
      setStats({
        totalPatients: data.totalPatients ?? 0,
        totalDoctors: data.totalDoctors ?? 0,
        activeConsultations: data.activeConsultations ?? 0,
        onlineDoctors: data.onlineDoctors ?? 0,
      });
      if (data.doctors) setDoctors(data.doctors);
      if (data.alerts) setAlerts(data.alerts);
    } catch {
      /* ignore */
    }
  }, []);

  const fetchGlobalQueue = useCallback(async () => {
    try {
      const { data } = await api.get('/queue/global');
      setGlobalQueue(data.queues || data || []);
    } catch {
      /* ignore */
    }
  }, []);

  const fetchAll = useCallback(async () => {
    await Promise.all([fetchDashboard(), fetchGlobalQueue()]);
    setLoading(false);
  }, [fetchDashboard, fetchGlobalQueue]);

  useEffect(() => {
    fetchAll();

    if (!socket.connected) socket.connect();

    socket.on('queue-updated', fetchAll);
    socket.on('doctor-status-changed', fetchAll);
    socket.on('doctor-inaction', (data) => {
      setAlerts((prev) => [
        { id: Date.now(), message: data.message || 'Doctor inaction detected', type: 'warning' },
        ...prev,
      ]);
      fetchAll();
    });
    socket.on('notification', (data) => {
      setAlerts((prev) => [
        { id: Date.now(), message: data.message || data, type: data.type || 'info' },
        ...prev,
      ]);
    });

    return () => {
      socket.off('queue-updated', fetchAll);
      socket.off('doctor-status-changed', fetchAll);
      socket.off('doctor-inaction');
      socket.off('notification');
    };
  }, [fetchAll]);

  const dismissAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const statCards = [
    { label: 'Total Patients', value: stats.totalPatients, icon: '👤', color: '#3b82f6' },
    { label: 'Total Doctors', value: stats.totalDoctors, icon: '🩺', color: '#8b5cf6' },
    { label: 'Active Consultations', value: stats.activeConsultations, icon: '💬', color: '#f59e0b' },
    { label: 'Online Doctors', value: stats.onlineDoctors, icon: '🟢', color: '#22c55e' },
  ];

  if (loading) return <p className="ad-loading">Loading…</p>;

  return (
    <div className="ad-page">
      <NotificationBar room="admin" />

      <div className="ad-header">
        <h2 className="ad-title">Admin Dashboard</h2>
        <nav className="ad-nav-links">
          <Link to="/admin/analytics" className="ad-nav-link">Analytics</Link>
          <Link to="/admin/simulation" className="ad-nav-link">Simulation</Link>
        </nav>
      </div>

      {/* Stats Cards */}
      <div className="ad-stats-row">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="ad-stat-card"
            style={{ borderTopColor: card.color }}
          >
            <span className="ad-stat-icon">{card.icon}</span>
            <span className="ad-stat-value">{card.value}</span>
            <span className="ad-stat-label">{card.label}</span>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <section className="ad-alerts-section">
          <h3 className="ad-section-title">Alerts</h3>
          <div className="ad-alerts-list">
            {alerts.slice(0, 10).map((alert) => (
              <div key={alert.id} className={`ad-alert ad-alert-${alert.type || 'info'}`}>
                <span>{alert.message}</span>
                <button className="ad-alert-dismiss" onClick={() => dismissAlert(alert.id)}>
                  &times;
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Queue Monitor */}
      <section className="ad-section">
        <h3 className="ad-section-title">Queue Monitor</h3>
        {globalQueue.length === 0 ? (
          <p className="ad-empty">No active queues.</p>
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialization</th>
                  <th>Status</th>
                  <th>Queue Length</th>
                  <th>Current Patient</th>
                </tr>
              </thead>
              <tbody>
                {globalQueue.map((q, idx) => (
                  <tr key={q._id || q.doctorId || idx}>
                    <td>{q.doctorName || q.doctor?.name || '—'}</td>
                    <td>{q.specialization || q.doctor?.specialization || '—'}</td>
                    <td>
                      <span
                        className={`ad-status-indicator ${
                          q.isActive || q.status === 'active'
                            ? 'ad-status-active'
                            : 'ad-status-inactive'
                        }`}
                      >
                        {q.isActive || q.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{q.queueLength ?? q.queue?.length ?? 0}</td>
                    <td>{q.currentPatient || q.currentPatientName || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Doctor Status */}
      <section className="ad-section">
        <h3 className="ad-section-title">Doctor Status</h3>
        {doctors.length === 0 ? (
          <p className="ad-empty">No doctors found.</p>
        ) : (
          <div className="ad-doctor-list">
            {doctors.map((doc, idx) => (
              <div key={doc._id || idx} className="ad-doctor-item">
                <span
                  className={`ad-dot ${
                    doc.isActive || doc.isOnline ? 'ad-dot-online' : 'ad-dot-offline'
                  }`}
                />
                <span className="ad-doctor-name">{doc.name || doc.user?.name || '—'}</span>
                <span className="ad-doctor-spec">{doc.specialization || '—'}</span>
                <span
                  className={`ad-doctor-badge ${
                    doc.isActive || doc.isOnline ? 'ad-badge-online' : 'ad-badge-offline'
                  }`}
                >
                  {doc.isActive || doc.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
