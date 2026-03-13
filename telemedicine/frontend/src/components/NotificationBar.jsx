import React, { useState, useEffect } from 'react'
import { getSocket } from '../services/socket'
import './NotificationBar.css'

export default function NotificationBar() {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    function handleNotification(data) {
      const note = {
        id: Date.now() + Math.random(),
        message: data.message || data,
        type: data.type || 'info',
        timestamp: new Date().toLocaleTimeString()
      }
      setNotifications((prev) => [note, ...prev].slice(0, 5))
      if (note.type !== 'emergency') {
        setTimeout(() => dismiss(note.id), 8000)
      }
    }

    socket.on('notification', handleNotification)
    socket.on('queue_update', (data) => {
      handleNotification({ message: data.message || 'Queue updated', type: 'info' })
    })

    return () => {
      socket.off('notification', handleNotification)
      socket.off('queue_update')
    }
  }, [])

  function dismiss(id) {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  if (notifications.length === 0) return null

  return (
    <div className="notif-bar">
      {notifications.map((note) => (
        <div key={note.id} className={`notif-item notif-item--${note.type}`}>
          <span className="notif-content">
            <span>{note.type === 'emergency' ? '🚨' : note.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
            <span>{note.message}</span>
            <span className="notif-time">{note.timestamp}</span>
          </span>
          <button onClick={() => dismiss(note.id)} className="notif-dismiss" aria-label="Dismiss">×</button>
        </div>
      ))}
    </div>
  )
}
