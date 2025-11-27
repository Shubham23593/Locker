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
          className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-xl hover:scale-110 transition"
        >
          <FaRobot className="text-2xl" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-xl flex flex-col animate-fade">
          
          {/* HEADER */}
          <div className="bg-indigo-600 p-4 text-white rounded-t-2xl flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <FaRobot className="text-2xl" />
              <div>
                <h3 className="font-bold">ShopWise AI</h3>
                <p className="text-xs text-indigo-200">Powered by Hugging Face AI</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)}>
              <FaTimes />
            </button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 bg-indigo-500 text-white flex items-center justify-center rounded-full mr-2">
                    <FaRobot />
                  </div>
                )}

                <div
                  className={`p-3 max-w-[75%] rounded-xl ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 shadow rounded-bl-none"
                  }`}
                >
                  {msg.content}
                  <div className="text-xs opacity-50 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 bg-gray-300 text-gray-700 flex items-center justify-center rounded-full ml-2">
                    <FaUser />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-start">
                <div className="w-8 h-8 bg-indigo-500 text-white flex items-center justify-center rounded-full">
                  <FaRobot />
                </div>
                <div className="bg-white p-3 rounded-xl shadow">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div className="p-4 border-t bg-white rounded-b-2xl">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 p-2 border rounded-full outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Type your message..."
              />
              <button
                onClick={sendMessage}
                disabled={isLoading}
                className="bg-indigo-600 text-white p-3 rounded-full hover:scale-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .animate-fade { animation: fadeIn .25s ease-out; }
        @keyframes fadeIn {
          from { opacity:0; transform: translateY(20px); }
          to { opacity:1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default Chatbot;