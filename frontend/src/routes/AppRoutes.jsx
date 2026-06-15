import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layout
import DashboardLayout from '../components/layout/DashboardLayout';

// Auth Pages
import Login from '../features/auth/Login';
import Register from '../features/auth/Register';

// Dashboard Pages
import Dashboard from '../features/dashboard/Dashboard';
import AnalyticsDashboard from '../features/analytics/AnalyticsDashboard';
import LawsList from '../features/laws/LawsList';
import LawDetailPage from '../features/laws/LawDetailPage';
import AdminUsers from '../features/admin/AdminUsers';
import AdminSystemPage from '../features/admin/AdminSystemPage';
import ProfilePage from '../features/auth/ProfilePage';

// Route Guards
const ProtectedRoute = ({ children, requireAdmin }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          } 
        />

        {/* Protected Dashboard Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="laws" element={<LawsList />} />
          <Route path="laws/:id" element={<LawDetailPage />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<div className="p-6">Settings Page Coming Soon</div>} />
          
          {/* Admin Only Routes */}
          <Route 
            path="admin/users" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminUsers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="admin/system" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminSystemPage />
              </ProtectedRoute>
            } 
          />
        </Route>
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
