import React, { useState, useEffect } from 'react'
import { getSocket } from '../services/socket'

const TYPE_STYLES = {
  emergency: 'bg-red-600 text-white',
  warning: 'bg-yellow-400 text-yellow-900',
  info: 'bg-blue-500 text-white'
}

const TYPE_ICONS = {
  emergency: '🚨',
  warning: '⚠️',
  info: 'ℹ️'
}

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

      // Auto-dismiss non-emergency after 8s
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
    <div className="fixed top-0 left-0 right-0 z-50 space-y-1">
      {notifications.map((note) => (
        <div
          key={note.id}
          className={`flex items-center justify-between px-4 py-2 shadow-md ${TYPE_STYLES[note.type] || TYPE_STYLES.info}`}
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <span>{TYPE_ICONS[note.type] || TYPE_ICONS.info}</span>
            <span>{note.message}</span>
            <span className="opacity-70 text-xs ml-2">{note.timestamp}</span>
          </span>
          <button
            onClick={() => dismiss(note.id)}
            className="ml-4 opacity-80 hover:opacity-100 text-lg leading-none font-bold"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
