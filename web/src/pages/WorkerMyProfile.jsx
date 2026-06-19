import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './WorkerMyProfile.css';

export default function WorkerMyProfile() {
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showId, setShowId] = useState(false);

  useEffect(() => {
    authAPI.getMe()
      .then(res => setWorker(res.data.user))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading profile...</div>;
  if (!worker) return <div className="empty-state"><h3>Profile not found</h3></div>;

  const g = worker.guarantor || {};
  const statusColor = { verified: 'success', pending: 'warning', rejected: 'danger' };

  return (
    <div className="my-profile-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

        {/* Header */}
        <div className="card mp-header">
          <div className="mp-avatar">{worker.name?.charAt(0)?.toUpperCase()}</div>
          <div className="mp-head-info">
            <h1>{worker.name}</h1>
            <p className="mp-email">{worker.email}</p>
            <div className="mp-badges">
              <span className={`badge badge-${statusColor[worker.verificationStatus] || 'warning'}`}>
                {worker.verificationStatus === 'verified' ? '✅ Verified' :
                 worker.verificationStatus === 'rejected' ? '❌ Rejected' : '⏳ Pending Verification'}
              </span>
              <span className="badge badge-primary">⭐ {worker.rating || '0.0'} ({worker.totalReviews} reviews)</span>
            </div>
          </div>
        </div>

        {/* My Information */}
        <div className="card mp-section">
          <h2>👤 My Information</h2>
          <div className="mp-grid">
            <Detail label="Full Name" value={worker.name} />
            <Detail label="Email" value={worker.email} />
            <Detail label="Phone" value={worker.phone || '—'} />
            <Detail label="Location" value={worker.location} />
            <Detail label="Nationality" value={worker.nationality} />
            <Detail label="Languages" value={worker.languages?.join(', ') || '—'} />
            <Detail label="Experience" value={`${worker.experience} years`} />
            <Detail label="My National ID" value={worker.idNumber || '—'} />
            <Detail label="Expected Salary" value={`$${worker.salary?.min} – $${worker.salary?.max} / month`} />
            <Detail label="Availability" value={worker.isAvailable ? 'Available' : 'Not available'} />
          </div>
          <div className="mp-row">
            <span className="mp-label">Skills</span>
            <div className="mp-chips">{worker.skills?.map(s => <span key={s} className="mp-chip">{s}</span>)}</div>
          </div>
          <div className="mp-row">
            <span className="mp-label">Job Types</span>
            <div className="mp-chips">{worker.jobTypes?.map(j => <span key={j} className="mp-chip">{j}</span>)}</div>
          </div>
          {worker.specialties?.length > 0 && (
            <div className="mp-row">
              <span className="mp-label">Specialties / Tasks</span>
              <div className="mp-chips">{worker.specialties.map(s => <span key={s} className="mp-chip">{s}</span>)}</div>
            </div>
          )}
          {worker.bio && (
            <div className="mp-row">
              <span className="mp-label">About</span>
              <span className="mp-value">{worker.bio}</span>
            </div>
          )}
        </div>

        {/* Guarantor */}
        <div className="card mp-section">
          <h2>🛡️ My Guarantor (Damiin)</h2>
          {!g.name ? (
            <p className="mp-empty">No guarantor information on file.</p>
          ) : (
            <>
              <div className="mp-grid">
                <Detail label="Guarantor Name" value={g.name} />
                <Detail label="Name on ID" value={g.idName} />
                <Detail label="ID Number" value={g.idNumber} />
                <Detail label="Phone" value={g.phone || '—'} />
                <Detail label="Relationship" value={g.relationship || '—'} />
                <Detail
                  label="Name Verification"
                  value={g.name?.trim().toLowerCase() === g.idName?.trim().toLowerCase() ? '✅ Matches ID' : '❌ Mismatch'}
                />
              </div>
              {g.idImage && (
                <div className="mp-id-block">
                  <span className="mp-label">Guarantor ID Document</span>
                  <button className="mp-id-toggle" onClick={() => setShowId(s => !s)}>
                    {showId ? 'Hide ID image' : '🖼️ View ID image'}
                  </button>
                  {showId && (
                    <div className="mp-id-img">
                      <img src={g.idImage} alt="Guarantor ID" />
                    </div>
                  )}
                </div>
              )}
            </>
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
