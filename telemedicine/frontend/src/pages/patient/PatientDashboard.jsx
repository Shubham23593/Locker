import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import socket from '../../services/socket';
import NotificationBar from '../../components/NotificationBar';
import './PatientDashboard.css';

export default function PatientDashboard() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await api.get('/queue/status');
      setConsultations(data.consultations || data || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    if (!socket.connected) socket.connect();

    socket.on('queue-updated', fetchStatus);
    socket.on('notification', fetchStatus);

    return () => {
      socket.off('queue-updated', fetchStatus);
      socket.off('notification', fetchStatus);
    };
  }, [fetchStatus]);

  const active = consultations.filter(
    (c) => c.status === 'waiting' || c.status === 'in-progress'
  );
  const history = consultations.filter((c) => c.status === 'completed');

  const statusClass = (s) => {
    if (s === 'waiting') return 'badge-waiting';
    if (s === 'in-progress') return 'badge-inprogress';
    return 'badge-completed';
  };

  return (
    <div className="pd-page">
      <NotificationBar room={`patient-${user._id || user.id}`} />

      <div className="pd-header">
        <h2 className="pd-title">Patient Dashboard</h2>
        <div className="pd-actions">
          <Link to="/patient/join-queue" className="pd-action-btn">
            Join Queue
          </Link>
          <Link to="/patient/schedule" className="pd-action-btn pd-action-secondary">
            Book Appointment
          </Link>
        </div>
      </div>

      {loading && <p className="pd-loading">Loading…</p>}

      {/* Live Queue Status */}
      {active.length > 0 && (
        <section className="pd-section">
          <h3 className="pd-section-title">Live Queue Status</h3>
          <div className="pd-queue-grid">
            {active.map((c, idx) => (
              <div key={c._id || idx} className="pd-queue-card">
                <div className="pd-queue-stat">
                  <span className="pd-queue-number">{idx + 1}</span>
                  <span className="pd-queue-label">Queue Position</span>
                </div>
                <div className="pd-queue-stat">
                  <span className="pd-queue-number">{idx}</span>
                  <span className="pd-queue-label">Patients Ahead</span>
                </div>
                <div className="pd-queue-stat">
                  <span className="pd-queue-number">
                    {(c.predictedDuration || 10) * (idx + 1)} min
                  </span>
                  <span className="pd-queue-label">Est. Wait</span>
                </div>
                <div className="pd-queue-info">
                  <p>
                    <strong>Doctor:</strong>{' '}
                    {c.doctor?.name || c.doctorName || 'Assigning…'}
                  </p>
                  <span className={`pd-badge ${statusClass(c.status)}`}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Consultation History */}
      <section className="pd-section">
        <h3 className="pd-section-title">Consultation History</h3>

        {history.length === 0 ? (
          <p className="pd-empty">No past consultations yet.</p>
        ) : (
          <div className="pd-table-wrap">
            <table className="pd-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Doctor</th>
                  <th>Symptoms</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((c, idx) => (
                  <tr key={c._id || idx}>
                    <td>
                      {c.createdAt
                        ? new Date(c.createdAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td>{c.doctor?.name || c.doctorName || '—'}</td>
                    <td className="pd-symptoms">{c.symptoms || '—'}</td>
                    <td>{c.duration ? `${c.duration} min` : '—'}</td>
                    <td>
                      <span className={`pd-badge ${statusClass(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
