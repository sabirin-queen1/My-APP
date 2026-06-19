import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path;

  const householdLinks = [
    { to: '/dashboard', label: 'Home' },
    { to: '/search', label: 'Search Worker' },
    { to: '/family-profile', label: 'My Profile' },
    { to: '/wallet', label: 'Wallet' },
    { to: '/chat', label: 'Messages' },
    { to: '/notifications', label: 'Notifications' },
  ];
  const workerLinks = [
    { to: '/worker-dashboard', label: 'Dashboard' },
    { to: '/my-profile', label: 'My Profile' },
    { to: '/wallet', label: 'Wallet' },
    { to: '/chat', label: 'Messages' },
    { to: '/notifications', label: 'Notifications' },
  ];
  const adminLinks = [
    { to: '/admin', label: 'Dashboard' },
  ];

  const links = role === 'admin' ? adminLinks : role === 'worker' ? workerLinks : householdLinks;

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">🏠</div>
          <span>HomeCare</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {links.map(l => (
            <Link key={l.to} to={l.to} className={`nav-link ${isActive(l.to) ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="navbar-right">
          <button className="theme-toggle" onClick={toggleTheme} title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            {isDark ? '☀️' : '🌙'}
          </button>
          <div className="nav-user" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{role}</span>
            </div>
          </div>
          <button className="btn btn-outline logout-btn" onClick={handleLogout}>Logout</button>
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
