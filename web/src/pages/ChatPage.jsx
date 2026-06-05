import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../services/api';
import io from 'socket.io-client';
import './ChatPage.css';

const SOCKET_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : window.location.origin;

export default function ChatPage() {
  const { otherId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const messagesEnd = useRef(null);
  const socketRef = useRef(null);
  const typingTimer = useRef(null);

  // Load conversations list
  useEffect(() => {
    chatAPI.getConversations()
      .then(r => setConversations(r.data))
      .finally(() => setLoadingConvos(false));
  }, [otherId]);

  // Socket connection
  useEffect(() => {
    if (!user) return;
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;
    socket.emit('join', user.id || user._id);

    socket.on('new_message', (msg) => {
      setMessages(prev => [...prev, msg]);
      scrollToBottom();
      // Update conversations list
      setConversations(prev => {
        const existing = prev.find(c => c.chatId === msg.chatId);
        if (existing) {
          return prev.map(c => c.chatId === msg.chatId
            ? { ...c, lastMessage: msg.text, lastTime: msg.createdAt, unreadCount: c.unreadCount + 1 }
            : c
          ).sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime));
        }
        return prev;
      });
    });

    socket.on('user_typing', ({ from, name }) => {
      if (from === otherId) setTyping(true);
    });
    socket.on('user_stop_typing', ({ from }) => {
      if (from === otherId) setTyping(false);
    });

    return () => socket.disconnect();
  }, [user, otherId]);

  // Load messages when selecting a conversation
  useEffect(() => {
    if (!otherId) return;
    setLoadingMsgs(true);
    chatAPI.getMessages(otherId)
      .then(r => {
        setMessages(r.data.messages);
        setOtherUser(r.data.otherUser);
        scrollToBottom();
      })
      .finally(() => setLoadingMsgs(false));
  }, [otherId]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const res = await chatAPI.sendMessage(otherId, text.trim());
      setMessages(prev => [...prev, res.data]);
      setText('');
      scrollToBottom();
      // Notify via socket
      socketRef.current?.emit('send_message', {
        to: otherId,
        message: res.data,
      });
      socketRef.current?.emit('stop_typing', { to: otherId, from: user.id || user._id });
    } catch (err) {
      alert('Failed to send message');
    }
    setSending(false);
  };

  const handleTyping = (val) => {
    setText(val);
    const userId = user.id || user._id;
    socketRef.current?.emit('typing', { to: otherId, from: userId, name: user.name });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit('stop_typing', { to: otherId, from: userId });
    }, 1500);
  };

  const timeStr = (d) => {
    const date = new Date(d);
    const now = new Date();
    const sameDay = date.toDateString() === now.toDateString();
    if (sameDay) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const userId = user?.id || user?._id;

  return (
    <div className="chat-page">
      {/* Sidebar — conversations */}
      <aside className="chat-sidebar">
        <div className="sidebar-header">
          <h2>💬 Messages</h2>
        </div>
        {loadingConvos ? (
          <div className="sidebar-loading">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="sidebar-empty">
            <p>No conversations yet</p>
            <p className="sidebar-hint">Start a chat from a worker's profile</p>
          </div>
        ) : (
          <div className="convo-list">
            {conversations.map(c => (
              <Link
                key={c.chatId}
                to={`/chat/${c.otherUser._id}`}
                className={`convo-item ${otherId === c.otherUser._id ? 'active' : ''}`}
              >
                <div className="convo-avatar">{c.otherUser.name?.charAt(0)?.toUpperCase()}</div>
                <div className="convo-info">
                  <div className="convo-name">
                    {c.otherUser.name}
                    <span className="convo-role">{c.otherUser.role}</span>
                  </div>
                  <p className="convo-last">{c.lastMessage?.slice(0, 40)}{c.lastMessage?.length > 40 ? '...' : ''}</p>
                </div>
                <div className="convo-meta">
                  <span className="convo-time">{timeStr(c.lastTime)}</span>
                  {c.unreadCount > 0 && <span className="convo-unread">{c.unreadCount}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </aside>

      {/* Chat area */}
      <main className="chat-main">
        {!otherId ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">💬</div>
            <h3>Select a conversation</h3>
            <p>Choose from your messages on the left, or start a chat from a worker's profile</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="chat-header">
              <button className="chat-back" onClick={() => navigate('/chat')}>←</button>
              <div className="chat-header-avatar">{otherUser?.name?.charAt(0)?.toUpperCase()}</div>
              <div className="chat-header-info">
                <h3>{otherUser?.name || 'Loading...'}</h3>
                {typing ? (
                  <p className="typing-indicator">typing...</p>
                ) : (
                  <p className="chat-header-role">{otherUser?.role || 'User'}</p>
                )}
              </div>
              <Link to={otherUser?.role === 'worker' || !otherUser?.role ? `/workers/${otherId}` : '#'} className="chat-profile-btn">
                View Profile
              </Link>
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {loadingMsgs ? (
                <div className="chat-loading">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="chat-start">
                  <div className="chat-start-icon">👋</div>
                  <p>Start the conversation! Say hello to {otherUser?.name}</p>
                </div>
              ) : (
                messages.map((m, i) => {
                  const isMine = m.sender === userId || m.sender?._id === userId;
                  const showDate = i === 0 || new Date(m.createdAt).toDateString() !== new Date(messages[i-1].createdAt).toDateString();
                  return (
                    <React.Fragment key={m._id || i}>
                      {showDate && (
                        <div className="chat-date-sep">
                          <span>{new Date(m.createdAt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        </div>
                      )}
                      <div className={`msg-row ${isMine ? 'mine' : 'theirs'}`}>
                        {!isMine && <div className="msg-avatar">{otherUser?.name?.charAt(0)?.toUpperCase()}</div>}
                        <div className={`msg-bubble ${isMine ? 'mine' : 'theirs'}`}>
                          <p className="msg-text">{m.text}</p>
                          <span className="msg-time">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isMine && <span className="msg-check">{m.isRead ? ' ✓✓' : ' ✓'}</span>}
                          </span>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
              {typing && (
                <div className="msg-row theirs">
                  <div className="msg-avatar">{otherUser?.name?.charAt(0)?.toUpperCase()}</div>
                  <div className="typing-bubble"><span /><span /><span /></div>
                </div>
              )}
              <div ref={messagesEnd} />
            </div>

            {/* Input */}
            <form className="chat-input" onSubmit={handleSend}>
              <input
                type="text"
                placeholder="Type a message..."
                value={text}
                onChange={e => handleTyping(e.target.value)}
                autoFocus
                maxLength={1000}
              />
              <button type="submit" disabled={!text.trim() || sending} className="send-btn">
                {sending ? '...' : '➤'}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
