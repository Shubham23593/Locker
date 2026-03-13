import React, { useState, useEffect, useCallback } from 'react';
import socket from '../services/socket';
import './NotificationBar.css';

const MAX_NOTIFICATIONS = 5;
const AUTO_DISMISS_MS = 10000;

export default function NotificationBar({ room }) {
  const [notifications, setNotifications] = useState([]);

  const dismiss = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    if (room) {
      socket.emit('join-room', { room });
    }

    const handleNotification = (data) => {
      const notification = {
        id: Date.now(),
        message: data.message || data,
        type: data.type || 'info',
        timestamp: new Date(),
      };

      setNotifications((prev) => [notification, ...prev].slice(0, MAX_NOTIFICATIONS));
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
      if (room) {
        socket.emit('leave-room', { room });
      }
    };
  }, [room]);

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    if (notifications.length === 0) return;

    const timers = notifications.map((n) =>
      setTimeout(() => dismiss(n.id), AUTO_DISMISS_MS)
    );

    return () => timers.forEach(clearTimeout);
  }, [notifications, dismiss]);

  if (notifications.length === 0) return null;

  return (
    <div className="notification-bar">
      {notifications.map((n) => (
        <div key={n.id} className={`notification-item notification-${n.type}`}>
          <div className="notification-content">
            <p className="notification-message">{n.message}</p>
            <span className="notification-time">
              {n.timestamp.toLocaleTimeString()}
            </span>
          </div>
          <button
            className="notification-dismiss"
            onClick={() => dismiss(n.id)}
            aria-label="Dismiss notification"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
