import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../services/api';
import socket from '../../services/socket';
import NotificationBar from '../../components/NotificationBar';
import './DoctorDashboard.css';

const EMERGENCY_COLORS = {
  1: '#22c55e',
  2: '#eab308',
  3: '#f97316',
  4: '#ef4444',
  5: '#991b1b',
};

function formatWait(minutes) {
  if (!minutes && minutes !== 0) return '—';
  if (minutes < 1) return '<1 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h ${m}m`;
}

function formatTimer(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState(null);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchData = useCallback(async () => {
    try {
      const [profileRes, queueRes] = await Promise.all([
        api.get('/doctor/profile'),
        api.get('/queue/doctor'),
      ]);
      setDoctor(profileRes.data.doctor || profileRes.data);
      const items = queueRes.data.queue || queueRes.data || [];
      const sorted = [...items].sort((a, b) => {
        if ((b.emergencyLevel || 0) !== (a.emergencyLevel || 0))
          return (b.emergencyLevel || 0) - (a.emergencyLevel || 0);
        return (b.priorityScore || 0) - (a.priorityScore || 0);
      });
      setQueue(sorted);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  // Session timer
  const inProgress = queue.find((c) => c.status === 'in-progress');

  useEffect(() => {
    if (inProgress) {
      const startTime = inProgress.startTime
        ? new Date(inProgress.startTime).getTime()
        : Date.now();
      const tick = () => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      };
      tick();
      timerRef.current = setInterval(tick, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(timerRef.current);
  }, [inProgress]);

  useEffect(() => {
    fetchData();

    if (!socket.connected) socket.connect();

    socket.on('queue-updated', fetchData);
    socket.on('doctor-inaction', fetchData);
    socket.on('notification', fetchData);

    return () => {
      socket.off('queue-updated', fetchData);
      socket.off('doctor-inaction', fetchData);
      socket.off('notification', fetchData);
    };
  }, [fetchData]);

  const toggleStatus = async () => {
    setActionLoading('toggle');
    try {
      const { data } = await api.put('/doctor/toggle-status');
      setDoctor((prev) => ({
        ...prev,
        isActive: data.isActive ?? !prev?.isActive,
      }));
    } catch {
      /* ignore */
    } finally {
      setActionLoading('');
    }
  };

  const startSession = async (id) => {
    setActionLoading('start');
    try {
      await api.put(`/queue/start/${id}`);
      fetchData();
    } catch {
      /* ignore */
    } finally {
      setActionLoading('');
    }
  };

  const endSession = async (id) => {
    setActionLoading('end');
    try {
      await api.put(`/queue/end/${id}`);
      fetchData();
    } catch {
      /* ignore */
    } finally {
      setActionLoading('');
    }
  };

  const isActive = doctor?.isActive ?? false;
  const currentPatient = inProgress || queue.find((c) => c.status === 'waiting');
  const nextPatient = queue.find(
    (c) => c !== currentPatient && c.status === 'waiting'
  );
  const predictedMinutes = inProgress?.predictedDuration || 0;
  const predictedSeconds = predictedMinutes * 60;
  const exceededPredicted = inProgress && elapsed > predictedSeconds;

  if (loading) return <p className="dd-loading">Loading…</p>;

  return (
    <div className="dd-page">
      <NotificationBar room={user._id || user.id} />

      <div className="dd-header">
        <h2 className="dd-title">Doctor Dashboard</h2>
        {doctor && (
          <span className="dd-welcome">
            Welcome, Dr. {doctor.name || doctor.user?.name || ''}
          </span>
        )}
      </div>

      {/* Status Toggle */}
      <div className="dd-status-section">
        <span className="dd-status-label">Status</span>
        <button
          className={`dd-toggle ${isActive ? 'dd-toggle-active' : 'dd-toggle-inactive'}`}
          onClick={toggleStatus}
          disabled={actionLoading === 'toggle'}
          aria-label="Toggle availability"
        >
          <span className="dd-toggle-knob" />
        </button>
        <span className={`dd-status-text ${isActive ? 'dd-text-active' : 'dd-text-inactive'}`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
        <span
          className={`dd-status-dot ${isActive ? 'dd-dot-active' : 'dd-dot-inactive'}`}
        />
      </div>

      {/* Session Area */}
      {inProgress && (
        <section className="dd-session">
          <h3 className="dd-section-title">Current Session</h3>
          <div className="dd-session-card">
            <div className="dd-session-patient">
              <strong>{inProgress.patient?.name || inProgress.patientName || 'Patient'}</strong>
              <span className="dd-session-symptoms">{inProgress.symptoms || ''}</span>
            </div>
            <div className={`dd-timer ${exceededPredicted ? 'dd-timer-exceeded' : ''}`}>
              {formatTimer(elapsed)}
            </div>
            {predictedMinutes > 0 && (
              <div className="dd-predicted">
                Predicted: {predictedMinutes} min
              </div>
            )}
            <button
              className="dd-btn dd-btn-end"
              onClick={() => endSession(inProgress._id || inProgress.id)}
              disabled={actionLoading === 'end'}
            >
              {actionLoading === 'end' ? 'Ending…' : 'End Session'}
            </button>
          </div>
        </section>
      )}

      {/* Start Session / Next Patient */}
      {!inProgress && currentPatient && (
        <section className="dd-session">
          <h3 className="dd-section-title">Next Up</h3>
          <div className="dd-session-card">
            <div className="dd-session-patient">
              <strong>
                {currentPatient.patient?.name || currentPatient.patientName || 'Patient'}
              </strong>
              <span className="dd-session-symptoms">{currentPatient.symptoms || ''}</span>
              <span
                className="dd-emergency-badge"
                style={{ backgroundColor: EMERGENCY_COLORS[currentPatient.emergencyLevel] || '#6b7280' }}
              >
                Emergency: {currentPatient.emergencyLevel || '—'}
              </span>
            </div>
            <button
              className="dd-btn dd-btn-start"
              onClick={() => startSession(currentPatient._id || currentPatient.id)}
              disabled={actionLoading === 'start'}
            >
              {actionLoading === 'start' ? 'Starting…' : 'Start Session'}
            </button>
          </div>
        </section>
      )}

      {/* Queue Overview */}
      <section className="dd-queue-section">
        <h3 className="dd-section-title">
          Queue <span className="dd-queue-count">({queue.length})</span>
        </h3>

        {queue.length === 0 ? (
          <p className="dd-empty">No patients in queue.</p>
        ) : (
          <div className="dd-queue-list">
            {queue.map((item, idx) => {
              const isCurrent =
                item === currentPatient || item.status === 'in-progress';
              return (
                <div
                  key={item._id || item.id || idx}
                  className={`dd-queue-card ${isCurrent ? 'dd-queue-current' : ''}`}
                >
                  <div className="dd-queue-rank">{idx + 1}</div>
                  <div className="dd-queue-info">
                    <span className="dd-queue-name">
                      {item.patient?.name || item.patientName || 'Patient'}
                    </span>
                    <span className="dd-queue-symptoms">{item.symptoms || '—'}</span>
                  </div>
                  <span
                    className="dd-emergency-badge"
                    style={{
                      backgroundColor:
                        EMERGENCY_COLORS[item.emergencyLevel] || '#6b7280',
                    }}
                  >
                    Lvl {item.emergencyLevel || '—'}
                  </span>
                  <div className="dd-queue-meta">
                    <span className="dd-meta-item" title="Priority Score">
                      ⚡ {item.priorityScore ?? '—'}
                    </span>
                    <span className="dd-meta-item" title="Wait Time">
                      ⏱ {formatWait(item.waitTime)}
                    </span>
                    <span className="dd-meta-item" title="Mode">
                      {item.consultationMode === 'chat' ? '💬' : '📹'}
                    </span>
                  </div>
                  <span
                    className={`dd-status-badge dd-badge-${item.status || 'waiting'}`}
                  >
                    {item.status || 'waiting'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Next patient hint */}
      {inProgress && nextPatient && (
        <div className="dd-next-hint">
          <strong>Next Patient:</strong>{' '}
          {nextPatient.patient?.name || nextPatient.patientName || 'Patient'} —
          Emergency Lvl {nextPatient.emergencyLevel || '—'}, Priority{' '}
          {nextPatient.priorityScore ?? '—'}
        </div>
      )}
    </div>
  );
}
