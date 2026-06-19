import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { contractsAPI, workersAPI, notificationsAPI } from '../services/api';
import './Dashboard.css';

export default function HouseholdDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      contractsAPI.getAll(),
      workersAPI.search({ limit: 6 }),
      notificationsAPI.getAll()
    ]).then(([c, w, n]) => {
      setContracts(c.data);
      setRecommended(w.data.workers);
      setUnread(n.data.unreadCount);
    }).finally(() => setLoading(false));
  }, []);

  const activeContracts = contracts.filter(c => c.status === 'active');
  const completedContracts = contracts.filter(c => c.status === 'completed');

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard-page">
      <div className="container">

        {/* Header */}
        <div className="dashboard-header">
          <Link to="/family-profile" className="household-greeting-link" title="View my profile">
            <h1>Hello, {user?.name?.split(' ')[0]} Family 👋</h1>
            <p>Tap here to view your profile →</p>
          </Link>
          <Link to="/notifications" className="notif-btn" title="Notifications">
            🔔
            {unread > 0 && <span className="notif-badge">{unread}</span>}
          </Link>
        </div>

        {/* Quick Action Cards — ALL clickable */}
        <div className="quick-actions">
          <Link to="/search" className="quick-action primary">
            <div className="qa-icon">🔍</div>
            <div>
              <h3>Find a Worker</h3>
              <p>Search and hire verified domestic workers</p>
            </div>
            <span className="qa-arrow">→</span>
          </Link>

          <Link to="/my-contracts?tab=active" className="quick-action clickable">
            <div className="qa-icon">📋</div>
            <div>
              <h3>Active Contracts</h3>
              <p className="qa-count">{activeContracts.length}</p>
            </div>
            <span className="qa-arrow">→</span>
          </Link>

          <Link to="/my-contracts?tab=completed" className="quick-action clickable">
            <div className="qa-icon">⭐</div>
            <div>
              <h3>Reviews</h3>
              <p className="qa-count">{completedContracts.length}</p>
            </div>
            <span className="qa-arrow">→</span>
          </Link>
        </div>

        {/* My Contracts */}
        {contracts.length > 0 && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>My Contracts</h2>
              <Link to="/my-contracts" className="view-all">View All ({contracts.length})</Link>
            </div>
            <div className="contracts-list">
              {contracts.slice(0, 3).map(contract => (
                <Link to={`/contracts/${contract._id}`} key={contract._id} className="contract-item card">
                  <div className="contract-worker">
                    <div className="worker-avatar-sm">{contract.worker?.name?.charAt(0)?.toUpperCase()}</div>
                    <div>
                      <h4>{contract.worker?.name}</h4>
                      <p>{contract.jobType} · ${contract.salary}/mo</p>
                      <p className="contract-dates">
                        {new Date(contract.startDate).toLocaleDateString()} → {new Date(contract.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="contract-info">
                    <div className="contract-salary">${contract.salary}<span>/mo</span></div>
                    <span className={`badge badge-${contract.status === 'active' ? 'success' : contract.status === 'pending' ? 'warning' : 'danger'}`}>
                      {contract.status}
                    </span>
                    {contract.status === 'active' && !contract.familySigned && (
                      <span className="sign-tag">✍️ Sign</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Workers */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recommended Workers</h2>
            <Link to="/search" className="view-all">View All</Link>
          </div>

          {recommended.length === 0 ? (
            <div className="empty-state">
              <h3>No verified workers yet</h3>
              <p>Workers will appear once admin verifies them</p>
            </div>
          ) : (
            <div className="workers-grid">
              {recommended.map(worker => (
                <Link to={`/workers/${worker._id}`} key={worker._id} className="worker-card card">
                  <div className="worker-avatar">{worker.name.charAt(0)}</div>
                  <h4>{worker.name}</h4>
                  <p className="worker-title">{worker.jobTypes?.[0]}</p>
                  <p className="worker-exp">{worker.experience} Years Experience</p>
                  <div className="worker-skills-mini">
                    {worker.skills?.slice(0, 2).map(s => <span key={s} className="ws-chip">{s}</span>)}
                  </div>
                  <div className="worker-rating">
                    <span>⭐ {worker.rating || '0.0'}</span>
                    <span className="worker-salary">${worker.salary?.min}/mo</span>
                  </div>
                  <div className="hire-hint">Tap to view profile →</div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
