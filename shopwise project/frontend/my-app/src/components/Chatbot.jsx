import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaUser } from 'react-icons/fa';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages]);

  // Create session
  useEffect(() => {
    if (isOpen && !sessionId) initSession();
  }, [isOpen]);

  const initSession = async () => {
    const { data } = await axios.post(`${API_URL}/chat/session`);
    setSessionId(data.data.sessionId);

    setMessages([
      {
        role: "assistant",
        content:
          "👋 Hi! I'm ShopWise AI Assistant. How can I help you today?\n\nI can help you with:\n• Finding products\n• Order tracking\n• Shipping information\n• Returns & refunds\n• Account assistance",
        timestamp: new Date(),
      },
    ]);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const msg = inputMessage.trim();
    setInputMessage("");

    // Push user message
    setMessages((prev) => [...prev, { role: "user", content: msg, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const { data } = await axios.post(`${API_URL}/chat/message`, {
        sessionId,
        message: msg,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.data.response,
          timestamp: data.data.timestamp,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ I'm having trouble connecting. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#3B2F2F',
            color: 'white',
            padding: '16px',
            borderRadius: '50%',
            boxShadow: '0 8px 25px rgba(59, 47, 47, 0.3)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            transform: 'scale(1)',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.boxShadow = '0 12px 35px rgba(59, 47, 47, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 8px 25px rgba(59, 47, 47, 0.3)';
          }}
        >
          <FaRobot style={{ fontSize: '24px' }} />
        </button>
      )}

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '384px',
            height: '600px',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            transform: 'translateY(0)',
            opacity: 1,
            transition: 'all 0.25s ease-out',
          }}
        >
          {/* HEADER */}
          <div
            style={{
              backgroundColor: '#3B2F2F',
              padding: '16px',
              color: 'white',
              borderRadius: '16px 16px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FaRobot style={{ fontSize: '18px' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>ShopWise AI</h3>
                <p style={{ fontSize: '12px', margin: '2px 0 0 0', opacity: 0.8 }}>Powered by AI</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <FaTimes />
            </button>
          </div>

          {/* MESSAGES */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              backgroundColor: '#f8f7f6',
              gap: '12px',
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                {msg.role === "assistant" && (
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#3B2F2F',
                      color: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '8px',
                      flexShrink: 0,
                    }}
                  >
                    <FaRobot style={{ fontSize: '14px' }} />
                  </div>
                )}

                <div
                  style={{
                    padding: '12px 16px',
                    maxWidth: '75%',
                    borderRadius: '12px',
                    boxShadow: msg.role === "user" ? '0 4px 12px rgba(59,47,47,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                    position: 'relative',
                    backgroundColor: msg.role === "user" ? '#3B2F2F' : 'white',
                    color: msg.role === "user" ? 'white' : '#3B2F2F',
                    lineHeight: '1.5',
                  }}
                >
                  <div>{msg.content}</div>
                  <div
                    style={{
                      fontSize: '11px',
                      opacity: 0.7,
                      marginTop: '4px',
                    }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      width: 0,
                      height: 0,
                      border: msg.role === "user" 
                        ? '8px solid transparent' 
                        : '8px solid transparent',
                      ...(msg.role === "user" 
                        ? { 
                            borderLeftColor: '#3B2F2F', 
                            right: '-8px', 
                            top: '50%', 
                            transform: 'translateY(-50%)' 
                          }
                        : { 
                            borderRightColor: 'white', 
                            left: '-8px', 
                            top: '50%', 
                            transform: 'translateY(-50%)' 
                          }),
                    }}
                  />
                </div>

                {msg.role === "user" && (
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#e5e5e5',
                      color: '#666',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: '8px',
                      flexShrink: 0,
                    }}
                  >
                    <FaUser style={{ fontSize: '14px' }} />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#3B2F2F',
                    color: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FaRobot style={{ fontSize: '14px' }} />
                </div>
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#ccc',
                        borderRadius: '50%',
                        animation: 'bounce 1.4s infinite ease-in-out',
                      }}
                    />
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#ccc',
                        borderRadius: '50%',
                        animation: 'bounce 1.4s infinite ease-in-out 0.2s',
                      }}
                    />
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#ccc',
                        borderRadius: '50%',
                        animation: 'bounce 1.4s infinite ease-in-out 0.4s',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div
            style={{
              padding: '16px',
              borderTop: '1px solid #f0eeec',
              backgroundColor: 'white',
              borderRadius: '0 0 16px 16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  border: 'none',
                  borderRadius: '9999px',
                  backgroundColor: '#f8f7f6',
                  color: '#3B2F2F',
                  fontSize: '14px',
                  outline: 'none',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                }}
                placeholder="Type your message..."
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                style={{
                  backgroundColor: '#3B2F2F',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '50%',
                  border: 'none',
                  cursor: isLoading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
                  opacity: isLoading || !inputMessage.trim() ? 0.5 : 1,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && inputMessage.trim()) {
                    e.target.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
              >
                <FaPaperPlane style={{ fontSize: '16px' }} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </>
  );
};

export default Chatbot;
