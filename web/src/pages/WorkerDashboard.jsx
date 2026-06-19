import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { contractsAPI, notificationsAPI, workersAPI } from '../services/api';
import './WorkerDashboard.css';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const jobRequestsRef = useRef(null);
  const activeJobsRef = useRef(null);

  const [contracts, setContracts] = useState([]);
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      contractsAPI.getAll(),
      workersAPI.getDashboard(),
      notificationsAPI.getAll()
    ]).then(([c, s, n]) => {
      setContracts(c.data);
      setStats(s.data);
      setNotifications(n.data.notifications.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  const pending = contracts.filter(c => c.status === 'pending');
  const active = contracts.filter(c => c.status === 'active');

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="worker-dash-page">
      <div className="container">

        {/* Header */}
        <div className="worker-dash-header">
          <Link to="/my-profile" className="worker-greeting-link" title="View my full profile">
            <div className="wd-avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
            <div>
              <h1>Welcome, {user?.name?.split(' ')[0]} 👋</h1>
              <p>Tap here to view your profile & guarantor →</p>
            </div>
          </Link>
          <Link to="/my-reviews" className="worker-rating-badge" title="View my reviews">
            ⭐ {stats?.rating || user?.rating || '0.0'}
            <span className="rating-sub">({stats?.totalReviews || 0} reviews)</span>
          </Link>
        </div>

        {/* Verification alert */}
        {!user?.isVerified && (
          <div className="verify-alert">
            ⏳ Your profile is pending admin verification. You'll be visible to families once approved.
          </div>
        )}

        {/* Stat Cards — ALL clickable */}
        <div className="worker-stats">
          {/* Job Requests → scroll down */}
          <div
            className="w-stat card clickable-stat"
            onClick={() => scrollTo(jobRequestsRef)}
            title="View job requests"
          >
            <div className="w-stat-icon">💼</div>
            <div className="w-stat-num">{pending.length}</div>
            <div className="w-stat-label">Job Requests</div>
            {pending.length > 0 && <span className="w-stat-badge">{pending.length} new</span>}
            <div className="stat-hint">tap to view ↓</div>
          </div>

          {/* Active Jobs → scroll down */}
          <div
            className="w-stat card clickable-stat"
            onClick={() => scrollTo(activeJobsRef)}
            title="View active jobs"
          >
            <div className="w-stat-icon">📋</div>
            <div className="w-stat-num">{active.length}</div>
            <div className="w-stat-label">Active Jobs</div>
            <div className="stat-hint">tap to view ↓</div>
          </div>

          {/* Rating → My Reviews page */}
          <Link to="/my-reviews" className="w-stat card clickable-stat" title="View all my reviews">
            <div className="w-stat-icon">⭐</div>
            <div className="w-stat-num">{stats?.rating || '0.0'}</div>
            <div className="w-stat-label">My Rating</div>
            <div className="stat-hint">tap to view →</div>
          </Link>

          {/* Notifications → Notifications page */}
          <Link to="/notifications" className="w-stat card clickable-stat" title="View notifications">
            <div className="w-stat-icon">🔔</div>
            <div className="w-stat-num">{stats?.unreadNotifications || 0}</div>
            <div className="w-stat-label">Notifications</div>
            {(stats?.unreadNotifications || 0) > 0 && (
              <span className="w-stat-badge">{stats.unreadNotifications} unread</span>
            )}
            <div className="stat-hint">tap to view →</div>
          </Link>
        </div>

        {/* All Contracts quick link */}
        <Link to="/my-contracts" className="all-contracts-banner">
          <span>📋 View All My Contracts</span>
          <span className="banner-count">{contracts.length} total →</span>
        </Link>

        {/* Job Requests section */}
        <div ref={jobRequestsRef} className="worker-section">
          <div className="section-header">
            <h2>📩 Job Requests</h2>
            {pending.length > 0 && <span className="badge badge-warning">{pending.length} pending</span>}
          </div>
          {pending.length === 0 ? (
            <div className="card empty-mini">
              <span>💼</span>
              <p>No pending job requests</p>
            </div>
          ) : (
            <div className="worker-contracts">
              {pending.map(c => (
                <Link to={`/contracts/${c._id}`} key={c._id} className="w-contract-card card">
                  <div className="wc-left">
                    <div className="wc-avatar">{c.household?.name?.charAt(0)?.toUpperCase()}</div>
                    <div>
                      <h4>{c.household?.name}</h4>
                      <p>{c.jobType} · <strong>${c.salary}/mo</strong></p>
                      <p className="wc-date">📅 {new Date(c.startDate).toLocaleDateString()} → {new Date(c.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="wc-right">
                    <span className="badge badge-warning">Pending</span>
                    <span className="view-hint">View & Sign →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Active Jobs section */}
        <div ref={activeJobsRef} className="worker-section">
          <div className="section-header">
            <h2>✅ Active Jobs</h2>
            {active.length > 0 && <span className="badge badge-success">{active.length} active</span>}
          </div>
          {active.length === 0 ? (
            <div className="card empty-mini">
              <span>✅</span>
              <p>No active jobs right now</p>
            </div>
          ) : (
            <div className="worker-contracts">
              {active.map(c => {
                const daysLeft = Math.ceil((new Date(c.endDate) - new Date()) / 86400000);
                return (
                  <Link to={`/contracts/${c._id}`} key={c._id} className="w-contract-card card">
                    <div className="wc-left">
                      <div className="wc-avatar">{c.household?.name?.charAt(0)?.toUpperCase()}</div>
                      <div>
                        <h4>{c.household?.name}</h4>
                        <p>{c.jobType} · <strong>${c.salary}/mo</strong></p>
                        <p className="wc-date">
                          📅 Until {new Date(c.endDate).toLocaleDateString()}
                          {daysLeft > 0 && <span className="days-pill">{daysLeft}d left</span>}
                        </p>
                      </div>
                    </div>
                    <div className="wc-right">
                      <span className="badge badge-success">Active</span>
                      <span className="view-hint">View →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        {notifications.length > 0 && (
          <div className="worker-section">
            <div className="section-header">
              <h2>🔔 Recent Notifications</h2>
              <Link to="/notifications" className="view-all">View All</Link>
            </div>
            <div className="notif-preview card">
              {notifications.map(n => (
                <Link to="/notifications" key={n._id} className={`notif-row ${!n.isRead ? 'unread' : ''}`}>
                  <span className="notif-dot" />
                  <div className="notif-body">
                    <p className="notif-title">{n.title}</p>
                    <p className="notif-msg">{n.message}</p>
                  </div>
                  <span className="notif-arrow">›</span>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
