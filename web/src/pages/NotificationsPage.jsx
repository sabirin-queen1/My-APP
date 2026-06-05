import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '../services/api';
import './NotificationsPage.css';

const NOTIF_ICONS = {
  contract_expiry: '📅', new_job_request: '💼', worker_verified: '✅',
  new_review: '⭐', contract_confirmed: '📋', job_request: '💼', contract_cancelled: '❌'
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationsAPI.getAll(filter === 'all' ? undefined : filter);
      setNotifications(res.data.notifications);
    } finally { setLoading(false); }
  };

  const markRead = async (id) => {
    await notificationsAPI.markRead(id);
    setNotifications(n => n.map(x => x._id === id ? { ...x, isRead: true } : x));
  };

  const markAllRead = async () => {
    await notificationsAPI.markAllRead();
    setNotifications(n => n.map(x => ({ ...x, isRead: true })));
  };

  const timeAgo = (date) => {
    const d = (Date.now() - new Date(date)) / 1000;
    if (d < 60) return 'just now';
    if (d < 3600) return `${Math.floor(d / 60)}m ago`;
    if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
    return `${Math.floor(d / 86400)}d ago`;
  };

  return (
    <div className="notif-page">
      <div className="container">
        <div className="notif-header">
          <div className="page-header">
            <h1>Notifications</h1>
            <p>Stay updated on your activity</p>
          </div>
          <button className="btn btn-outline" onClick={markAllRead}>Mark All Read</button>
        </div>

        <div className="notif-filters">
          {['all', 'unread', 'important'].map(f => (
            <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 48 }}>🔔</div>
            <h3>No notifications</h3>
            <p>You're all caught up!</p>
          </div>
        ) : (
          <div className="notif-list card">
            {notifications.map(n => (
              <div key={n._id} className={`notif-item ${!n.isRead ? 'unread' : ''}`} onClick={() => !n.isRead && markRead(n._id)}>
                <div className="notif-icon">{NOTIF_ICONS[n.type] || '🔔'}</div>
                <div className="notif-content">
                  <h4>{n.title}</h4>
                  <p>{n.message}</p>
                </div>
                <div className="notif-meta">
                  <span className="notif-time">{timeAgo(n.createdAt)}</span>
                  {!n.isRead && <span className="unread-dot" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
