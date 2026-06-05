import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../services/api';
import './AdminDashboard.css';

const TABS = [
  { key: 'overview', label: '📊 Overview' },
  { key: 'users', label: '👥 Users' },
  { key: 'workers', label: '👷 Workers' },
  { key: 'households', label: '🏠 Households' },
  { key: 'contracts', label: '📋 Contracts' },
  { key: 'reviews', label: '⭐ Reviews' },
  { key: 'verifications', label: '✅ Verifications' },
];

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-icon">⚠️</div>
        <h3>Are you sure?</h3>
        <p>{message}</p>
        <div className="modal-btns">
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function Stars({ rating }) {
  return (
    <span className="stars-row">
      {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= Math.round(rating) ? '#f59e0b' : '#d1d5db' }}>★</span>)}
      <span className="rating-val"> {rating || '0.0'}</span>
    </span>
  );
}

function Avatar({ name, size = 36 }) {
  return (
    <div className="tbl-avatar" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {name?.charAt(0)?.toUpperCase()}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    active: 'success', verified: 'success', pending: 'warning',
    cancelled: 'danger', rejected: 'danger', completed: 'primary', expired: 'danger'
  };
  return <span className={`badge badge-${map[status] || 'primary'}`}>{status}</span>;
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [data, setData] = useState({ users: [], workers: [], households: [], contracts: [], reviews: [], verifications: [] });
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null); // { message, onConfirm }
  const [search, setSearch] = useState('');
  const [verifyLoading, setVerifyLoading] = useState({});

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, users, workers, households, contracts, reviews, verifications] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getAllUsers(),
        adminAPI.getWorkers(),
        adminAPI.getHouseholds(),
        adminAPI.getAllContracts(),
        adminAPI.getAllReviews(),
        adminAPI.getVerifications(),
      ]);
      setStats(s.data);
      setData({
        users: users.data,
        workers: workers.data.workers,
        households: households.data,
        contracts: contracts.data,
        reviews: reviews.data,
        verifications: verifications.data,
      });
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const del = (message, action) => setConfirm({ message, action });

  const doDelete = async () => {
    await confirm.action();
    setConfirm(null);
    loadAll();
  };

  const handleVerify = async (id, action) => {
    setVerifyLoading(v => ({ ...v, [id]: true }));
    await adminAPI.verifyWorker(id, action);
    setVerifyLoading(v => ({ ...v, [id]: false }));
    loadAll();
  };

  const timeAgo = (d) => {
    if (!d) return '-';
    const s = (Date.now() - new Date(d)) / 1000;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  const filterBySearch = (arr, keys) =>
    arr.filter(item => keys.some(k => String(item[k] || '').toLowerCase().includes(search.toLowerCase())));

  if (loading && !stats) return <div className="loading">Loading admin dashboard...</div>;

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Full platform management</p>
          </div>
          <button className="btn btn-outline refresh-btn" onClick={loadAll}>🔄 Refresh</button>
        </div>

        {/* Stats row - always visible */}
        <div className="stats-row">
          {[
            { key: 'users', icon: '👥', num: stats?.totalUsers, label: 'Total Users', color: '#ede9fd' },
            { key: 'workers', icon: '👷', num: stats?.totalWorkers, label: 'Workers', color: '#dcfce7' },
            { key: 'households', icon: '🏠', num: stats?.totalHouseholds, label: 'Households', color: '#fef3c7' },
            { key: 'verifications', icon: '⏳', num: stats?.pendingVerifications, label: 'Pending', color: '#fee2e2' },
            { key: 'contracts', icon: '📋', num: stats?.totalContracts, label: 'Contracts', color: '#dbeafe' },
            { key: 'reviews', icon: '⭐', num: stats?.totalReviews, label: 'Reviews', color: '#fce7f3' },
          ].map(s => (
            <div key={s.key} className={`stat-pill ${tab === s.key ? 'active' : ''}`} onClick={() => setTab(s.key)}>
              <div className="stat-pill-icon" style={{ background: s.color }}>{s.icon}</div>
              <div>
                <div className="stat-pill-num">{s.num ?? '—'}</div>
                <div className="stat-pill-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab navigation */}
        <div className="admin-tabs">
          {TABS.map(t => (
            <button key={t.key} className={`admin-tab ${tab === t.key ? 'active' : ''}`} onClick={() => { setTab(t.key); setSearch(''); }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Search bar (for list tabs) */}
        {tab !== 'overview' && (
          <div className="admin-search">
            <span>🔍</span>
            <input placeholder={`Search ${tab}...`} value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')}>✕</button>}
          </div>
        )}

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div className="overview-grid">
            <div className="card ov-card">
              <h3>📈 Platform Summary</h3>
              <div className="ov-rows">
                <div className="ov-row"><span>Total Users</span><strong>{stats?.totalUsers}</strong></div>
                <div className="ov-row"><span>Verified Workers</span><strong>{data.workers.filter(w => w.isVerified).length}</strong></div>
                <div className="ov-row"><span>Active Contracts</span><strong>{data.contracts.filter(c => c.status === 'active').length}</strong></div>
                <div className="ov-row"><span>Pending Verification</span><strong style={{ color: 'var(--warning)' }}>{stats?.pendingVerifications}</strong></div>
                <div className="ov-row"><span>Total Reviews</span><strong>{stats?.totalReviews}</strong></div>
                <div className="ov-row"><span>Cancelled Contracts</span><strong>{data.contracts.filter(c => c.status === 'cancelled').length}</strong></div>
              </div>
            </div>
            <div className="card ov-card">
              <h3>🕐 Recent Activity</h3>
              <div className="activity-list">
                {[...data.contracts.slice(0,3).map(c => ({ icon:'📋', text:`Contract: ${c.worker?.name} ↔ ${c.household?.name}`, time: timeAgo(c.createdAt) })),
                  ...data.reviews.slice(0,2).map(r => ({ icon:'⭐', text:`Review by ${r.household?.name}`, time: timeAgo(r.createdAt) })),
                  ...data.verifications.slice(0,2).map(v => ({ icon:'⏳', text:`Verification: ${v.name}`, time: timeAgo(v.createdAt) }))
                ].sort(() => 0).slice(0,6).map((a, i) => (
                  <div key={i} className="activity-item">
                    <span className="act-icon">{a.icon}</span>
                    <span className="act-text">{a.text}</span>
                    <span className="act-time">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ALL USERS ── */}
        {tab === 'users' && (
          <div className="card tbl-card">
            <div className="tbl-header"><h3>All Users ({data.users.length})</h3></div>
            <table className="admin-table">
              <thead><tr><th>User</th><th>Email</th><th>Type</th><th>Location</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filterBySearch(data.users, ['name','email','location']).map(u => (
                  <tr key={u._id}>
                    <td><div className="tbl-user"><Avatar name={u.name} /><span>{u.name}</span></div></td>
                    <td className="tbl-light">{u.email}</td>
                    <td><span className={`type-chip ${u.userType}`}>{u.userType === 'worker' ? '👷 Worker' : '🏠 Family'}</span></td>
                    <td className="tbl-light">{u.location || 'Mogadishu'}</td>
                    <td className="tbl-light">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td><span className={`badge ${u.isActive !== false ? 'badge-success' : 'badge-danger'}`}>{u.isActive !== false ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div className="tbl-actions">
                        <button className="act-btn toggle" title="Toggle status"
                          onClick={() => u.userType === 'worker' ? adminAPI.toggleWorker(u._id).then(loadAll) : adminAPI.toggleHousehold(u._id).then(loadAll)}>
                          {u.isActive !== false ? '🔒' : '🔓'}
                        </button>
                        <button className="act-btn delete" title="Delete user"
                          onClick={() => del(`Delete "${u.name}"? This cannot be undone.`,
                            () => u.userType === 'worker' ? adminAPI.deleteWorker(u._id) : adminAPI.deleteHousehold(u._id))}>
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filterBySearch(data.users, ['name','email']).length === 0 && <div className="tbl-empty">No users found</div>}
          </div>
        )}

        {/* ── WORKERS ── */}
        {tab === 'workers' && (
          <div className="card tbl-card">
            <div className="tbl-header"><h3>Workers ({data.workers.length})</h3></div>
            <table className="admin-table">
              <thead><tr><th>Worker</th><th>Skills</th><th>Experience</th><th>Rating</th><th>Salary</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filterBySearch(data.workers, ['name','email','location']).map(w => {
                  const activeContract = data.contracts.find(c => c.worker?._id === w._id && c.status === 'active');
                  return (
                    <tr key={w._id}>
                      <td>
                        <div className="tbl-user">
                          <Avatar name={w.name} />
                          <div>
                            <div>{w.name}</div>
                            <div className="tbl-light">{w.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><div className="skills-mini">{w.skills?.slice(0,3).map(s => <span key={s} className="skill-mini">{s}</span>)}</div></td>
                      <td className="tbl-light">{w.experience} yrs</td>
                      <td><Stars rating={w.rating} /></td>
                      <td className="tbl-light">${w.salary?.min}–${w.salary?.max}/mo</td>
                      <td>
                        <StatusBadge status={w.verificationStatus} />
                        {activeContract && <span className="badge badge-primary ml-4">Employed</span>}
                      </td>
                      <td>
                        <div className="tbl-actions">
                          {w.verificationStatus === 'pending' && (
                            <>
                              <button className="act-btn approve" onClick={() => handleVerify(w._id, 'approve')} disabled={verifyLoading[w._id]}>✅</button>
                              <button className="act-btn reject" onClick={() => handleVerify(w._id, 'reject')} disabled={verifyLoading[w._id]}>❌</button>
                            </>
                          )}
                          <button className="act-btn toggle" onClick={() => del(`Toggle status for "${w.name}"?`, () => adminAPI.toggleWorker(w._id))}>
                            {w.isActive !== false ? '🔒' : '🔓'}
                          </button>
                          <button className="act-btn delete" onClick={() => del(`Delete worker "${w.name}"? All their contracts and reviews will also be removed.`, () => adminAPI.deleteWorker(w._id))}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filterBySearch(data.workers, ['name','email']).length === 0 && <div className="tbl-empty">No workers found</div>}
          </div>
        )}

        {/* ── HOUSEHOLDS ── */}
        {tab === 'households' && (
          <div className="card tbl-card">
            <div className="tbl-header"><h3>Households ({data.households.length})</h3></div>
            <table className="admin-table">
              <thead><tr><th>Family</th><th>Email</th><th>Phone</th><th>Location</th><th>Contracts</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {filterBySearch(data.households, ['name','email','location']).map(u => {
                  const userContracts = data.contracts.filter(c => c.household?._id === u._id || c.household === u._id);
                  return (
                    <tr key={u._id}>
                      <td><div className="tbl-user"><Avatar name={u.name} /><span>{u.name}</span></div></td>
                      <td className="tbl-light">{u.email}</td>
                      <td className="tbl-light">{u.phone || '—'}</td>
                      <td className="tbl-light">{u.location || 'Mogadishu'}</td>
                      <td><span className="badge badge-primary">{userContracts.length}</span></td>
                      <td className="tbl-light">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="tbl-actions">
                          <button className="act-btn toggle" onClick={() => adminAPI.toggleHousehold(u._id).then(loadAll)} title="Toggle active">
                            {u.isActive !== false ? '🔒' : '🔓'}
                          </button>
                          <button className="act-btn delete" onClick={() => del(`Delete family "${u.name}"? Their contracts will be cancelled.`, () => adminAPI.deleteHousehold(u._id))}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filterBySearch(data.households, ['name','email']).length === 0 && <div className="tbl-empty">No households found</div>}
          </div>
        )}

        {/* ── CONTRACTS ── */}
        {tab === 'contracts' && (
          <div className="card tbl-card">
            <div className="tbl-header"><h3>All Contracts ({data.contracts.length})</h3></div>
            <table className="admin-table">
              <thead><tr><th>Worker</th><th>Family</th><th>Job Type</th><th>Salary</th><th>Start Date</th><th>End Date</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filterBySearch(data.contracts, []).map(c => (
                  <tr key={c._id}>
                    <td><div className="tbl-user"><Avatar name={c.worker?.name} /><span>{c.worker?.name || '—'}</span></div></td>
                    <td><div className="tbl-user"><Avatar name={c.household?.name} /><span>{c.household?.name || '—'}</span></div></td>
                    <td className="tbl-light">{c.jobType}</td>
                    <td className="tbl-light">${c.salary}/mo</td>
                    <td className="tbl-light">{new Date(c.startDate).toLocaleDateString()}</td>
                    <td className="tbl-light">{new Date(c.endDate).toLocaleDateString()}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>
                      <button className="act-btn delete" onClick={() => del(`Delete this contract between "${c.worker?.name}" and "${c.household?.name}"?`, () => adminAPI.deleteContract(c._id))}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.contracts.length === 0 && <div className="tbl-empty">No contracts yet</div>}
          </div>
        )}

        {/* ── REVIEWS ── */}
        {tab === 'reviews' && (
          <div className="card tbl-card">
            <div className="tbl-header"><h3>All Reviews ({data.reviews.length})</h3></div>
            <table className="admin-table">
              <thead><tr><th>Family</th><th>Worker</th><th>Rating</th><th>Comment</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {filterBySearch(data.reviews, []).map(r => (
                  <tr key={r._id}>
                    <td><div className="tbl-user"><Avatar name={r.household?.name} /><span>{r.household?.name || '—'}</span></div></td>
                    <td><div className="tbl-user"><Avatar name={r.worker?.name} /><span>{r.worker?.name || '—'}</span></div></td>
                    <td><Stars rating={r.rating} /></td>
                    <td className="tbl-comment">{r.comment}</td>
                    <td className="tbl-light">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="act-btn delete" onClick={() => del(`Delete this review by "${r.household?.name}"?`, () => adminAPI.deleteReview(r._id))}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.reviews.length === 0 && <div className="tbl-empty">No reviews yet</div>}
          </div>
        )}

        {/* ── VERIFICATIONS ── */}
        {tab === 'verifications' && (
          <div className="verif-section">
            <div className="tbl-header"><h3>Pending Verifications ({data.verifications.length})</h3></div>
            {data.verifications.length === 0 ? (
              <div className="card empty-state"><h3>✅ All workers verified</h3><p>No pending verification requests</p></div>
            ) : (
              <div className="verif-grid">
                {filterBySearch(data.verifications, ['name','email','location']).map(w => (
                  <div key={w._id} className="verif-card card">
                    <div className="verif-top">
                      <Avatar name={w.name} size={52} />
                      <div className="verif-info">
                        <h4>{w.name}</h4>
                        <p className="tbl-light">{w.email}</p>
                        <p className="tbl-light">📍 {w.location}</p>
                      </div>
                    </div>
                    <div className="verif-skills">
                      {w.skills?.map(s => <span key={s} className="skill-mini">{s}</span>)}
                    </div>
                    <div className="verif-meta">
                      <span>⏱ {w.experience} yrs exp</span>
                      <span>💰 ${w.salary?.min}/mo</span>
                      <span>📅 {new Date(w.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="verif-btns">
                      <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => del(`Reject "${w.name}"'s verification?`, () => adminAPI.verifyWorker(w._id, 'reject'))} disabled={verifyLoading[w._id]}>❌ Reject</button>
                      <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleVerify(w._id, 'approve')} disabled={verifyLoading[w._id]}>
                        {verifyLoading[w._id] ? '...' : '✅ Approve'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {confirm && <ConfirmModal message={confirm.message} onConfirm={doDelete} onCancel={() => setConfirm(null)} />}
    </div>
  );
}
