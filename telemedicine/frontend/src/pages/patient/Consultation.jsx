import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import socket from '../../services/socket';
import './Consultation.css';

function formatTime(totalSeconds) {
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function Consultation() {
  const { id } = useParams();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [ended, setEnded] = useState(false);
  const timerRef = useRef(null);
  const chatEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        const { data } = await api.get(`/queue/consultation/${id}`);
        setConsultation(data);
        if (data.status === 'completed') setEnded(true);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };

    fetchConsultation();
  }, [id]);

  // Socket events
  useEffect(() => {
    if (!socket.connected) socket.connect();

    const handleStarted = (data) => {
      if (data.consultationId === id) {
        setConsultation((prev) => (prev ? { ...prev, status: 'in-progress' } : prev));
      }
    };

    const handleEnded = (data) => {
      if (data.consultationId === id) {
        setConsultation((prev) =>
          prev ? { ...prev, status: 'completed', summary: data.summary } : prev
        );
        setEnded(true);
      }
    };

    socket.on('session-started', handleStarted);
    socket.on('session-ended', handleEnded);

    return () => {
      socket.off('session-started', handleStarted);
      socket.off('session-ended', handleEnded);
    };
  }, [id]);

  // Timer
  useEffect(() => {
    if (consultation?.status === 'in-progress' && !ended) {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [consultation?.status, ended]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!msgInput.trim()) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text: msgInput, sender: 'patient', name: user.name || 'You' },
    ]);
    setMsgInput('');
  };

  if (loading) return <p className="consult-loading">Loading consultation…</p>;
  if (!consultation) return <p className="consult-loading">Consultation not found.</p>;

  const isChat = consultation.consultationMode === 'chat';

  return (
    <div className="consult-page">
      <div className="consult-card">
        <div className="consult-header">
          <h2 className="consult-title">
            {isChat ? 'Chat Consultation' : 'Video Consultation'}
          </h2>
          <span className="consult-timer">{formatTime(elapsed)}</span>
        </div>

        <div className="consult-meta">
          <p>
            <strong>Doctor:</strong>{' '}
            {consultation.doctor?.name || consultation.doctorName || 'Assigning…'}
          </p>
          <p>
            <strong>Status:</strong>{' '}
            <span className={`consult-status consult-status-${consultation.status}`}>
              {consultation.status}
            </span>
          </p>
          <p>
            <strong>Symptoms:</strong> {consultation.symptoms || '—'}
          </p>
        </div>

        {ended && (
          <div className="consult-summary">
            <h3>Session Summary</h3>
            <p>{consultation.summary || 'Consultation completed.'}</p>
          </div>
        )}

        {!ended && !isChat && (
          <div className="consult-video">
            <div className="consult-video-placeholder">
              <span className="consult-video-icon">📹</span>
              <p>Video Call in Progress</p>
              <p className="consult-video-timer">{formatTime(elapsed)}</p>
            </div>
          </div>
        )}

        {!ended && isChat && (
          <div className="consult-chat">
            <div className="consult-chat-messages">
              {messages.length === 0 && (
                <p className="consult-chat-empty">
                  No messages yet. Start the conversation.
                </p>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`consult-bubble ${
                    msg.sender === 'patient' ? 'bubble-self' : 'bubble-other'
                  }`}
                >
                  <span className="bubble-name">{msg.name}</span>
                  <p className="bubble-text">{msg.text}</p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form className="consult-chat-input" onSubmit={sendMessage}>
              <input
                type="text"
                placeholder="Type a message…"
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                className="consult-msg-input"
              />
              <button type="submit" className="consult-send-btn">
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
