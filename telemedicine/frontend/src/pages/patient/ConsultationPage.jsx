import React, { useState, useEffect, useRef } from 'react'
import api from '../../services/api'
import { getSocket } from '../../services/socket'

export default function ConsultationPage({ consultationData, onEnd }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [ending, setEnding] = useState(false)
  const messagesEndRef = useRef(null)
  const timerRef = useRef(null)

  const mode = consultationData?.consultationMode || 'video'
  const consultationId = consultationData?.consultationId || consultationData?._id

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000)

    const socket = getSocket()
    if (socket) {
      socket.on('chat_message', (msg) => {
        setMessages((prev) => [...prev, msg])
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      })
    }

    return () => {
      clearInterval(timerRef.current)
      if (socket) socket.off('chat_message')
    }
  }, [])

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!newMessage.trim()) return
    setSending(true)

    const msg = {
      id: Date.now(),
      text: newMessage,
      sender: 'patient',
      timestamp: new Date().toLocaleTimeString()
    }
    setMessages((prev) => [...prev, msg])
    setNewMessage('')

    const socket = getSocket()
    if (socket && consultationId) {
      socket.emit('chat_message', { consultationId, message: newMessage, sender: 'patient' })
    }

    setSending(false)
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  async function endConsultation() {
    if (!window.confirm('Are you sure you want to end this consultation?')) return
    setEnding(true)
    try {
      if (consultationId) {
        await api.post(`/consultation/${consultationId}/end`)
      }
      onEnd?.()
    } catch {
      setEnding(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="font-semibold text-gray-800">
              {mode === 'video' ? '📹 Video Consultation' : '💬 Chat Consultation'} — Live
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="font-mono text-lg font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
              ⏱ {formatTime(elapsed)}
            </div>
            <button
              onClick={endConsultation}
              disabled={ending}
              className="btn-danger text-sm"
            >
              {ending ? 'Ending...' : 'End Session'}
            </button>
          </div>
        </div>
        {consultationData?.doctorName && (
          <p className="text-sm text-gray-500 mt-2">
            Consulting with Dr. {consultationData.doctorName}
          </p>
        )}
      </div>

      {/* Video Mode */}
      {mode === 'video' && (
        <div className="card">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Doctor video placeholder */}
            <div className="relative bg-gray-800 rounded-xl aspect-video flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-5xl mb-2">👨‍⚕️</div>
                <p className="text-sm opacity-70">
                  Dr. {consultationData?.doctorName || 'Doctor'}
                </p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-green-400">Camera On</span>
                </div>
              </div>
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                Doctor
              </div>
            </div>

            {/* Patient video placeholder */}
            <div className="relative bg-gray-700 rounded-xl aspect-video flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-5xl mb-2">🧑‍⚕️</div>
                <p className="text-sm opacity-70">You</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-green-400">Camera On</span>
                </div>
              </div>
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                You
              </div>
            </div>
          </div>

          {/* Video controls */}
          <div className="flex items-center justify-center gap-4 mt-4">
            {[
              { icon: '🎤', label: 'Mute' },
              { icon: '📷', label: 'Camera' },
              { icon: '🖥️', label: 'Share Screen' },
              { icon: '💬', label: 'Chat' }
            ].map((ctrl) => (
              <button
                key={ctrl.label}
                title={ctrl.label}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-xs text-gray-600"
              >
                <span className="text-xl">{ctrl.icon}</span>
                {ctrl.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Interface */}
      <div className="card flex flex-col" style={{ height: '400px' }}>
        <h3 className="font-semibold text-gray-700 mb-3 text-sm">
          {mode === 'chat' ? '💬 Chat' : '💬 In-Call Chat'}
        </h3>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-8">
              <p>No messages yet.</p>
              {mode === 'chat' && <p className="mt-1">Start your consultation by sending a message.</p>}
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id || msg._id}
              className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
                  msg.sender === 'patient'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}
              >
                <p>{msg.text || msg.message}</p>
                <p className={`text-xs mt-1 ${msg.sender === 'patient' ? 'text-blue-200' : 'text-gray-400'}`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="input-field flex-1"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="btn-primary px-5"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
