import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const ThemeContext = createContext(null);

export const LIGHT = {
  primary: '#6C4EF2',
  primaryDark: '#5438d1',
  primaryLight: '#ede9fd',
  secondary: '#FF8C42',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  bg: '#f8f7fe',
  bgCard: '#ffffff',
  bgInput: '#ffffff',
  textDark: '#1a1a2e',
  textMedium: '#4b5563',
  textLight: '#9ca3af',
  border: '#e5e7eb',
};

export const DARK = {
  primary: '#8B6EF5',
  primaryDark: '#7459e0',
  primaryLight: '#2d2456',
  secondary: '#FF8C42',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  bg: '#0f0e1a',
  bgCard: '#1c1b2e',
  bgInput: '#252438',
  textDark: '#f1f0ff',
  textMedium: '#a9a8c0',
  textLight: '#6b6a85',
  border: '#2e2d45',
};

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState('light');

  useEffect(() => {
    SecureStore.getItemAsync('hc_theme').then(saved => {
      setMode(saved || systemScheme || 'light');
    });
  }, []);

  const toggleTheme = async () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    await SecureStore.setItemAsync('hc_theme', next);
  };

  const colors = mode === 'dark' ? DARK : LIGHT;

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, isDark: mode === 'dark', colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
