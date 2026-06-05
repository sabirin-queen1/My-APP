import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync('hc_token');
        const userStr = await SecureStore.getItemAsync('hc_user');
        if (token && userStr) {
          const { user: u, role: r } = JSON.parse(userStr);
          setUser(u);
          setRole(r);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const login = async (token, userData, userRole) => {
    await SecureStore.setItemAsync('hc_token', token);
    await SecureStore.setItemAsync('hc_user', JSON.stringify({ user: userData, role: userRole }));
    setUser(userData);
    setRole(userRole);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('hc_token');
    await SecureStore.deleteItemAsync('hc_user');
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
