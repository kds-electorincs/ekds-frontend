import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AccessDenied from './AccessDenied';

// 1. Route Gater for Private Customer Content
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// 2. Element/Button Gater by Permission
export const PermissionGuard = ({ permission, fallback = null, children }) => {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return fallback;
  }

  return <>{children}</>;
};

// 3. UI Block Gater by AdminPage
export const PageGuard = ({ page, fallback = null, children }) => {
  const { hasPageAccess } = useAuth();

  if (!hasPageAccess(page)) {
    return fallback;
  }

  return <>{children}</>;
};

// 4. UI Block Gater strictly for Super Administrators
export const SuperAdminGuard = ({ fallback = null, children }) => {
  const { isSuperAdmin } = useAuth();

  if (!isSuperAdmin) {
    return fallback;
  }

  return <>{children}</>;
};

// 5. UI Block Gater by Role assignments
export const RoleGuard = ({ roles = [], fallback = null, children }) => {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return fallback;
  }

  return <>{children}</>;
};

export { AccessDenied };
