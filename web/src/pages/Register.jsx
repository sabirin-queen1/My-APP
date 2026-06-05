import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const SKILLS = ['Cleaning', 'Cooking', 'Child Care', 'Laundry', 'Ironing', 'Elder Care', 'Gardening', 'Security'];
const JOB_TYPES = ['House Cleaning', 'Cooking', 'Babysitter', 'Nanny', 'Driver', 'Gardener', 'Security Guard', 'Elder Care'];

export default function Register() {
  const [params] = useSearchParams();
  const [type, setType] = useState(params.get('type') === 'worker' ? 'worker' : 'household');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', location: 'Mogadishu, Somalia',
    skills: [], jobTypes: [], experience: 0, bio: '', nationality: 'Somalia', languages: ['Somali']
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  const toggleSkill = (s) => setForm(f => ({ ...f, skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s] }));
  const toggleJob = (j) => setForm(f => ({ ...f, jobTypes: f.jobTypes.includes(j) ? f.jobTypes.filter(x => x !== j) : [...f.jobTypes, j] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = type === 'worker'
        ? await authAPI.registerWorker(form)
        : await authAPI.registerHousehold(form);
      login(res.data.token, res.data.user, res.data.user.role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-brand-icon">🏠</div>
          <h2>HomeCare</h2>
          <p>Join Somalia's trusted platform</p>
        </div>
        <div className="auth-features">
          <div className="auth-feature"><span>🔒</span> Secure & Verified</div>
          <div className="auth-feature"><span>📱</span> Available on Mobile</div>
          <div className="auth-feature"><span>💰</span> Fair Pay, Safe Work</div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
          <h1>Create Account</h1>
          <p className="auth-subtitle">Join HomeCare today</p>

          <div className="role-tabs">
            <button className={`role-tab ${type === 'household' ? 'active' : ''}`} onClick={() => setType('household')}>👨‍👩‍👧 Family</button>
            <button className={`role-tab ${type === 'worker' ? 'active' : ''}`} onClick={() => setType('worker')}>👷 Worker</button>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="Ahmed Mohamed" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="your@email.com" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Min 6 characters" required minLength={6} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" placeholder="+252 61 1234567" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input type="text" placeholder="Mogadishu, Somalia" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            </div>

            {type === 'worker' && (
              <>
                <div className="form-group">
                  <label>Experience (years)</label>
                  <input type="number" min="0" max="50" value={form.experience} onChange={e => setForm({ ...form, experience: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Skills</label>
                  <div className="register-skills">
                    {SKILLS.map(s => (
                      <button type="button" key={s} className={`skill-chip ${form.skills.includes(s) ? 'selected' : ''}`} onClick={() => toggleSkill(s)}>{s}</button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Job Types</label>
                  <div className="register-skills">
                    {JOB_TYPES.map(j => (
                      <button type="button" key={j} className={`skill-chip ${form.jobTypes.includes(j) ? 'selected' : ''}`} onClick={() => toggleJob(j)}>{j}</button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>About You</label>
                  <textarea rows={3} placeholder="Tell families about your experience..." value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
}
