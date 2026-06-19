import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import HouseholdDashboard from './pages/HouseholdDashboard';
import SearchWorker from './pages/SearchWorker';
import WorkerProfile from './pages/WorkerProfile';
import ContractView from './pages/ContractView';
import ReviewPage from './pages/ReviewPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminDashboard from './pages/AdminDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import MyContractsPage from './pages/MyContractsPage';
import MyReviewsPage from './pages/MyReviewsPage';
import WorkerMyProfile from './pages/WorkerMyProfile';
import HouseholdProfile from './pages/HouseholdProfile';
import WalletPage from './pages/WalletPage';
import ChatPage from './pages/ChatPage';
import Navbar from './components/Navbar';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" />;
  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, role } = useAuth();
  return (
    <BrowserRouter>
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route path="/" element={isAuthenticated ? (
          role === 'admin' ? <Navigate to="/admin" /> :
          role === 'worker' ? <Navigate to="/worker-dashboard" /> :
          <Navigate to="/dashboard" />
        ) : <Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute allowedRoles={['household']}><HouseholdDashboard /></PrivateRoute>} />
        <Route path="/search" element={<PrivateRoute allowedRoles={['household']}><SearchWorker /></PrivateRoute>} />
        <Route path="/workers/:id" element={<PrivateRoute><WorkerProfile /></PrivateRoute>} />
        <Route path="/contracts/:id" element={<PrivateRoute><ContractView /></PrivateRoute>} />
        <Route path="/reviews/:workerId" element={<PrivateRoute allowedRoles={['household']}><ReviewPage /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
        <Route path="/my-contracts" element={<PrivateRoute><MyContractsPage /></PrivateRoute>} />
        <Route path="/my-reviews" element={<PrivateRoute allowedRoles={['worker']}><MyReviewsPage /></PrivateRoute>} />
        <Route path="/my-profile" element={<PrivateRoute allowedRoles={['worker']}><WorkerMyProfile /></PrivateRoute>} />
        <Route path="/family-profile" element={<PrivateRoute allowedRoles={['household']}><HouseholdProfile /></PrivateRoute>} />
        <Route path="/wallet" element={<PrivateRoute allowedRoles={['household','worker']}><WalletPage /></PrivateRoute>} />
        <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
        <Route path="/chat/:otherId" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute allowedRoles={['admin']}><AdminDashboard /></PrivateRoute>} />
        <Route path="/worker-dashboard" element={<PrivateRoute allowedRoles={['worker']}><WorkerDashboard /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}
