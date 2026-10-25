import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';
import { getChatHistory, sendChatMessage } from '../../api/chatApi';
import './ChatWidget.css';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      if (!hasLoadedHistory) {
        loadHistory();
      }
    }
  }, [messages, isOpen]);

  const loadHistory = async () => {
    try {
      const history = await getChatHistory();
      // Format messages if needed (backend returns {role, content})
      const formatted = history.map(msg => ({
        type: msg.role === 'user' ? 'user' : 'bot',
        text: msg.content
      }));
      setMessages(formatted);
      setHasLoadedHistory(true);
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  };

    const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(userMessage);
      const isRateLimit = response.content?.startsWith('⚠️');
      setMessages(prev => [...prev, { 
        type: isRateLimit ? 'warning' : 'bot', 
        text: response.content 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { type: 'warning', text: "⚠️ Không kết nối được server. Vui lòng thử lại!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-widget-container">
      {/* Floating Bubble */}
      {!isOpen && (
        <button className="chat-bubble" onClick={() => setIsOpen(true)}>
          <MessageCircle size={30} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="bot-avatar">
                <Bot size={20} />
              </div>
              <div>
                <h3>GoJapan AI</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-color)', opacity: 0.8 }}>Online</span>
              </div>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="chat-messages">
            {messages.length === 0 && !isLoading && (
              <div className="message bot">
                Chào bạn! Mình là trợ lý GoJapan. Bạn có thắc mắc gì về tiếng Nhật không? Cứ hỏi mình nhé!
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.type}`}>
                {msg.text}
              </div>
            ))}
            
            {isLoading && (
              <div className="message bot">
                <div className="typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form className="chat-input-area" onSubmit={handleSend}>
            <div className="chat-input-container">
              <input 
                type="text" 
                placeholder="Hỏi về Kanji, ngữ pháp..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <button className="send-btn" type="submit" disabled={!input.trim() || isLoading}>
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
