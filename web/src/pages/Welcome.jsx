import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Welcome.css';

export default function Welcome() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <div className="welcome-page">
      <nav className="welcome-nav container">
        <div className="welcome-brand">
          <div className="brand-icon-lg">🏠</div>
          <div>
            <div className="brand-name">HomeCare</div>
            <div className="brand-tagline">Trusted Help, Happy Home</div>
          </div>
        </div>
        <div className="welcome-nav-links">
          <button className="welcome-theme-btn" onClick={toggleTheme} title="Toggle theme">
            {isDark ? '☀️' : '🌙'}
          </button>
          <Link to="/login" className="btn btn-outline">Login</Link>
          <Link to="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </nav>

      <main className="welcome-hero container">
        <div className="hero-content">
          <div className="hero-badge">🇸🇴 Somalia's #1 Domestic Platform</div>
          <h1 className="hero-title">
            Find Trusted<br />
            <span className="gradient-text">Domestic Workers</span>
          </h1>
          <p className="hero-sub">Safe. Reliable. Verified. Connect with professional domestic helpers across Somalia with digital contracts and verified profiles.</p>
          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary btn-lg">Find a Worker</Link>
            <Link to="/register?type=worker" className="btn btn-outline btn-lg">Register as Worker</Link>
          </div>
          <div className="hero-stats">
            <div className="stat"><span className="stat-num">856+</span><span className="stat-label">Verified Workers</span></div>
            <div className="stat"><span className="stat-num">389+</span><span className="stat-label">Happy Families</span></div>
            <div className="stat"><span className="stat-num">312+</span><span className="stat-label">Active Contracts</span></div>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-illustration">
            <div className="illustration-circle">
              <span className="illustration-icon">👩‍🍳</span>
            </div>
            <div className="floating-card card-1">
              <span>✅</span> Verified Workers
            </div>
            <div className="floating-card card-2">
              <span>📋</span> Digital Contracts
            </div>
            <div className="floating-card card-3">
              <span>⭐</span> 4.8 Average Rating
            </div>
          </div>
        </div>
      </main>

      <section className="features-section container">
        <h2 className="section-title">How It Works</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon" style={{background:'#ede9fd'}}>👨‍👩‍👧</div>
            <h3>For Households</h3>
            <p>Search, hire, manage contracts, rate & review workers. Find the perfect match for your family.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{background:'#dcfce7'}}>👷</div>
            <h3>For Workers</h3>
            <p>Find job opportunities, manage contracts, track ratings, and grow your career.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{background:'#fef3c7'}}>⚙️</div>
            <h3>For Admin</h3>
            <p>Verify users, manage platform, monitor activity & reports to ensure quality service.</p>
          </div>
        </div>
      </section>

      <section className="flow-section container">
        <h2 className="section-title">System Flow</h2>
        <div className="flow-steps">
          {['Worker Registration','Verification by Admin','Worker Database','Family Searches Worker','Worker Selected','Digital Contract','Work Period','Rating & Feedback','History & Monitoring'].map((step, i) => (
            <div key={i} className="flow-step">
              <div className="step-num">{i + 1}</div>
              <div className="step-label">{step}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="welcome-footer">
        <div className="container">
          <p>© 2024 HomeCare Somalia. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
