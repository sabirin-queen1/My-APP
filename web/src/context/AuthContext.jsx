import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('hc_token');
    const savedUser = localStorage.getItem('hc_user');
    if (token && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed.user);
        setRole(parsed.role);
      } catch {}
    }
    setLoading(false);
  }, []);

  const login = (token, userData, userRole) => {
    localStorage.setItem('hc_token', token);
    localStorage.setItem('hc_user', JSON.stringify({ user: userData, role: userRole }));
    setUser(userData);
    setRole(userRole);
  };

  const logout = () => {
    localStorage.removeItem('hc_token');
    localStorage.removeItem('hc_user');
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
