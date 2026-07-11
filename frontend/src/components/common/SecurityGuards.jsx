import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// 1. Route Gater for Private Content
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // Or rendering spinner/loading screen

  if (!user) {
    // Save target path for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// 2. Element/Button Gater by Permission Claims
export const PermissionGuard = ({ permission, fallback = null, children }) => {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return fallback;
  }

  return <>{children}</>;
};

// 3. UI Block Gater by Role assignments
export const RoleGuard = ({ roles = [], fallback = null, children }) => {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return fallback;
  }

  return <>{children}</>;
};
