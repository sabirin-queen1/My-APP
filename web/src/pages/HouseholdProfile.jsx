import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, contractsAPI } from '../services/api';
import './WorkerMyProfile.css';

const STATUS_BADGE = {
  active: 'badge-success', pending: 'badge-warning',
  completed: 'badge-primary', cancelled: 'badge-danger', expired: 'badge-danger'
};

export default function HouseholdProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([authAPI.getMe(), contractsAPI.getAll()])
      .then(([me, c]) => { setUser(me.data.user); setContracts(c.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading profile...</div>;
  if (!user) return <div className="empty-state"><h3>Profile not found</h3></div>;

  return (
    <div className="my-profile-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

        {/* Header */}
        <div className="card mp-header">
          <div className="mp-avatar">{user.name?.charAt(0)?.toUpperCase()}</div>
          <div className="mp-head-info">
            <h1>{user.name} Family</h1>
            <p className="mp-email">{user.email}</p>
            <div className="mp-badges">
              <span className="badge badge-primary">🏠 Household</span>
              <span className="badge badge-success">{contracts.filter(c => c.status === 'active').length} active contracts</span>
            </div>
          </div>
        </div>

        {/* Family Information */}
        <div className="card mp-section">
          <h2>👨‍👩‍👧 Family Information</h2>
          <div className="mp-grid">
            <Detail label="Family Name" value={user.name} />
            <Detail label="Email" value={user.email} />
            <Detail label="Phone" value={user.phone || '—'} />
            <Detail label="Location" value={user.location} />
            <Detail label="Member Since" value={new Date(user.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })} />
            <Detail label="Total Contracts" value={String(contracts.length)} />
          </div>
        </div>

        {/* My Contracts (documents) */}
        <div className="card mp-section">
          <h2>📋 My Contract Documents</h2>
          {contracts.length === 0 ? (
            <div className="mp-empty">
              <p>You have no contracts yet.</p>
              <Link to="/search" className="btn btn-primary" style={{ marginTop: 12 }}>Find a Worker</Link>
            </div>
          ) : (
            <div className="hp-contracts">
              {contracts.map(c => (
                <Link to={`/contracts/${c._id}`} key={c._id} className="hp-contract-row">
                  <div className="hp-c-left">
                    <div className="hp-c-icon">📄</div>
                    <div>
                      <h4>{c.worker?.name}</h4>
                      <p>{c.jobType} · ${c.salary}/mo</p>
                      <p className="hp-c-dates">
                        {new Date(c.startDate).toLocaleDateString()} → {new Date(c.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="hp-c-right">
                    <span className={`badge ${STATUS_BADGE[c.status] || 'badge-primary'}`}>{c.status}</span>
                    <span className="hp-view">View document →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="mp-detail">
      <span className="mp-detail-label">{label}</span>
      <span className="mp-detail-value">{value}</span>
    </div>
  );
}
