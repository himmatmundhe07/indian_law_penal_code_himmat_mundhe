import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SkeletonLoader from '../components/common/SkeletonLoader';

// Layout
import DashboardLayout from '../components/layout/DashboardLayout';

// Auth Pages (Lazy)
const Login = lazy(() => import('../features/auth/Login'));
const Register = lazy(() => import('../features/auth/Register'));
const ProfilePage = lazy(() => import('../features/auth/ProfilePage'));

// Dashboard Pages (Lazy)
const Dashboard = lazy(() => import('../features/dashboard/Dashboard'));
const AnalyticsDashboard = lazy(() => import('../features/analytics/AnalyticsDashboard'));
const LawsList = lazy(() => import('../features/laws/LawsList'));
const LawDetailPage = lazy(() => import('../features/laws/LawDetailPage'));

// Admin Pages (Lazy)
const AdminUsers = lazy(() => import('../features/admin/AdminUsers'));
const AdminSystemPage = lazy(() => import('../features/admin/AdminSystemPage'));

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

// Fallback Loader for Suspense
const SuspenseFallback = () => (
  <div className="flex h-screen items-center justify-center bg-[#F2E8D5] p-6">
    <div className="w-full max-w-4xl">
      <SkeletonLoader type="card" count={3} />
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<SuspenseFallback />}>
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
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
