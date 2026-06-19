import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

// if username already contains @, keep it; otherwise append @gmail.com
const buildEmail = (username) => {
  const u = username.trim();
  if (!u) return '';
  return u.includes('@') ? u.toLowerCase() : `${u.toLowerCase()}@gmail.com`;
};

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', role: 'household' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const email = buildEmail(form.email);
      // backend auto-detects the role (household / worker / admin) from the account
      const res = await authAPI.login({ email, password: form.password });
      login(res.data.token, res.data.user, res.data.user.role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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
          <p>Trusted Help, Happy Home</p>
        </div>
        <div className="auth-features">
          <div className="auth-feature"><span>✅</span> Verified Workers</div>
          <div className="auth-feature"><span>📋</span> Digital Contracts</div>
          <div className="auth-feature"><span>⭐</span> Ratings &amp; Reviews</div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h1>Welcome Back</h1>
          <p className="auth-subtitle">Login to your account</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username or Email</label>
              <input
                type="text"
                required
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              />
              {form.email && !form.email.includes('@') && (
                <span className="email-preview">Login as: <strong>{buildEmail(form.email)}</strong></span>
              )}
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password" required
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="auth-forgot"><Link to="#">Forgot Password?</Link></div>
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
