import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { workersAPI, reviewsAPI, contractsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './WorkerProfile.css';

export default function WorkerProfile() {
  const { id } = useParams();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showHire, setShowHire] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hiring, setHiring] = useState(false);
  const [hireForm, setHireForm] = useState({
    jobType: '', duties: '', salary: '', startDate: '', endDate: '', contractPeriod: '1 Year'
  });

  useEffect(() => {
    Promise.all([workersAPI.getById(id), reviewsAPI.getByWorker(id)])
      .then(([w, r]) => { setWorker(w.data); setReviews(r.data); })
      .finally(() => setLoading(false));
  }, [id]);

  const openHire = () => {
    // pre-fill salary with the worker's expected minimum (household can still change it)
    setHireForm(f => ({
      ...f,
      jobType: worker?.jobTypes?.[0] || '',
      salary: worker?.salary?.min || '',
    }));
    setShowHire(true);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const handleHire = async () => {
    if (!hireForm.jobType || !hireForm.salary || !hireForm.startDate || !hireForm.endDate) {
      alert('Please fill all fields'); return;
    }
    if (hireForm.startDate < todayStr) {
      alert('Start date cannot be in the past. Please pick today or a future date.'); return;
    }
    if (hireForm.endDate < hireForm.startDate) {
      alert('End date must be after the start date.'); return;
    }
    setHiring(true);
    try {
      const res = await contractsAPI.create({ worker: id, ...hireForm, salary: Number(hireForm.salary) });
      navigate(`/contracts/${res.data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create contract');
    } finally { setHiring(false); }
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (!worker) return <div className="empty-state"><h3>Worker not found</h3></div>;

  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(worker.rating) ? '⭐' : '☆');

  return (
    <div className="worker-profile-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

        <div className="profile-layout">
          <div className="profile-main card">
            <div className="profile-top">
              <div className="profile-avatar">{worker.name.charAt(0)}</div>
              <div className="profile-head-info">
                <div className="profile-name-row">
                  <h1>{worker.name}</h1>
                  {worker.isVerified && <span className="verified-badge">✅ Verified</span>}
                </div>
                <div className="profile-stars">
                  {stars.map((s, i) => <span key={i}>{s}</span>)}
                  <span className="reviews-count">({worker.totalReviews} Reviews)</span>
                </div>
              </div>
              <button className="like-btn">❤️</button>
            </div>

            <div className="profile-details">
              <div className="detail-row">
                <span className="detail-label">Skills</span>
                <div className="skills-list">
                  {worker.skills?.map(s => <span key={s} className="skill-tag-green">✅ {s}</span>)}
                </div>
              </div>
              <div className="detail-row">
                <span className="detail-label">Experience</span>
                <span className="detail-value">{worker.experience} Years</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Nationality</span>
                <span className="detail-value">{worker.nationality}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Languages</span>
                <span className="detail-value">{worker.languages?.join(', ')}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Salary Range</span>
                <span className="detail-value">${worker.salary?.min} - ${worker.salary?.max}/Month</span>
              </div>
              {worker.bio && (
                <div className="detail-row">
                  <span className="detail-label">About</span>
                  <span className="detail-value">{worker.bio}</span>
                </div>
              )}
            </div>

            {worker.activeContract && (
              <div className="contract-banner">
                <span className="cb-icon">🔒</span>
                <div>
                  <strong>Currently under contract</strong>
                  <p>
                    This worker is {worker.activeContract.status === 'pending' ? 'reserved (pending contract)' : 'employed'} until{' '}
                    {new Date(worker.activeContract.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    {' '}(year {new Date(worker.activeContract.endDate).getFullYear()}). Not available for hire.
                  </p>
                </div>
              </div>
            )}

            {role === 'household' && (
              <div className="profile-actions">
                {worker.activeContract ? (
                  <button className="btn btn-primary" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                    Unavailable — Under Contract
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={openHire}>Hire Now</button>
                )}
                <Link to={`/chat/${id}`} className="btn btn-outline">💬 Chat</Link>
              </div>
            )}
          </div>

          <div className="profile-side">
            {reviews.length > 0 && (
              <div className="card">
                <h3>Reviews</h3>
                <div className="reviews-list">
                  {reviews.map(r => (
                    <div key={r._id} className="review-item">
                      <div className="review-header">
                        <div className="reviewer-avatar">{r.household?.name?.charAt(0)}</div>
                        <div>
                          <h4>{r.household?.name}</h4>
                          <div className="review-stars">{Array.from({length:5},(_,i)=> i < r.rating ? '⭐' : '☆').join('')}</div>
                        </div>
                      </div>
                      <p className="review-text">{r.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {showHire && (
          <div className="modal-overlay" onClick={() => setShowHire(false)}>
            <div className="modal card" onClick={e => e.stopPropagation()}>
              <h2>Create Contract</h2>
              <p className="modal-sub">with {worker.name}</p>
              <div className="form-group">
                <label>Job Type</label>
                <select value={hireForm.jobType} onChange={e => setHireForm({...hireForm, jobType: e.target.value})}>
                  <option value="">Select Job Type</option>
                  {worker.jobTypes?.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>📝 Job Duties / Work Description</label>
                <textarea rows={3} placeholder="Describe the work to be done (e.g. cleaning 3 rooms, cooking lunch & dinner, caring for 2 children...)" value={hireForm.duties} onChange={e => setHireForm({...hireForm, duties: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Monthly Salary (USD)</label>
                <input type="number" placeholder="e.g. 250" value={hireForm.salary} onChange={e => setHireForm({...hireForm, salary: e.target.value})} />
                <span className="email-preview">Worker's expected range: <strong>${worker.salary?.min} – ${worker.salary?.max}</strong></span>
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" min={todayStr} value={hireForm.startDate} onChange={e => setHireForm({...hireForm, startDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="date" min={hireForm.startDate || todayStr} value={hireForm.endDate} onChange={e => setHireForm({...hireForm, endDate: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button className="btn btn-outline" onClick={() => setShowHire(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleHire} disabled={hiring}>
                  {hiring ? 'Creating...' : 'Confirm Contract'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
