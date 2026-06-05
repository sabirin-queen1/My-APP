import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { contractsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './MyContractsPage.css';

const TABS = [
  { key: 'all', label: '📋 All' },
  { key: 'active', label: '✅ Active' },
  { key: 'pending', label: '⏳ Pending' },
  { key: 'completed', label: '🏁 Completed' },
  { key: 'cancelled', label: '❌ Cancelled' },
];

const STATUS_BADGE = {
  active: 'badge-success', pending: 'badge-warning',
  completed: 'badge-primary', cancelled: 'badge-danger', expired: 'badge-danger'
};

export default function MyContractsPage() {
  const { role } = useAuth();
  const [params] = useSearchParams();
  const [tab, setTab] = useState(params.get('tab') || 'all');
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contractsAPI.getAll()
      .then(r => setContracts(r.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tab === 'all' ? contracts : contracts.filter(c => c.status === tab);
  const counts = TABS.reduce((acc, t) => {
    acc[t.key] = t.key === 'all' ? contracts.length : contracts.filter(c => c.status === t.key).length;
    return acc;
  }, {});

  const otherParty = (c) => role === 'worker' ? c.household : c.worker;

  return (
    <div className="my-contracts-page">
      <div className="container">
        <div className="page-header">
          <h1>My Contracts</h1>
          <p>Track all your employment agreements</p>
        </div>

        <div className="contracts-tabs">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`contract-tab ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {counts[t.key] > 0 && <span className="tab-count">{counts[t.key]}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">Loading contracts...</div>
        ) : filtered.length === 0 ? (
          <div className="card empty-state">
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <h3>No {tab === 'all' ? '' : tab} contracts</h3>
            <p>{tab === 'all' ? 'Your contracts will appear here' : `No ${tab} contracts found`}</p>
            {role === 'household' && <Link to="/search" className="btn btn-primary" style={{ marginTop: 16 }}>Find a Worker</Link>}
          </div>
        ) : (
          <div className="contracts-full-list">
            {filtered.map(c => {
              const party = otherParty(c);
              const daysLeft = Math.ceil((new Date(c.endDate) - new Date()) / 86400000);
              return (
                <Link to={`/contracts/${c._id}`} key={c._id} className="contract-full-card card">
                  <div className="cfc-left">
                    <div className="cfc-avatar">{party?.name?.charAt(0)?.toUpperCase()}</div>
                    <div className="cfc-info">
                      <h3>{party?.name || '—'}</h3>
                      <p className="cfc-job">{c.jobType}</p>
                      <div className="cfc-meta">
                        <span>📅 {new Date(c.startDate).toLocaleDateString()} → {new Date(c.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="cfc-right">
                    <div className="cfc-salary">${c.salary}<span>/mo</span></div>
                    <span className={`badge ${STATUS_BADGE[c.status] || 'badge-primary'}`}>{c.status}</span>
                    {c.status === 'active' && daysLeft > 0 && (
                      <span className="days-left">{daysLeft}d left</span>
                    )}
                    {c.status === 'active' && !c.familySigned && role === 'household' && (
                      <span className="sign-needed">✍️ Sign needed</span>
                    )}
                    {c.status === 'active' && !c.workerSigned && role === 'worker' && (
                      <span className="sign-needed">✍️ Sign needed</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
