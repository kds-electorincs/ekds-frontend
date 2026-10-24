import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosClient, { injectTokenAccessors } from '../api/axiosClient';
import { ADMIN_PAGES, PERMISSIONS, getPageForPermission } from '../constants/permissions';
import { ROLES } from '../constants/roles';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync Axios Client memory accessor functions
  injectTokenAccessors(
    () => accessToken,
    (token) => setAccessToken(token)
  );

  /**
   * Normalizes backend UserProfileResponse to a comprehensive Frontend User & RBAC Context
   */
  const normalizeUserData = useCallback((rawUser) => {
    if (!rawUser) return null;
    const userData = { ...rawUser };

    // Extract roles array from strings or objects
    const rolesArray = Array.isArray(userData.roles)
      ? userData.roles.map(r => (typeof r === 'object' && r?.name ? r.name : String(r)))
      : [];

    const isSuperAdmin = rolesArray.includes('ROLE_SUPER_ADMIN') || 
                         rolesArray.includes('SUPER_ADMIN') || 
                         userData.superAdmin === true ||
                         userData.role === ROLES.SUPER_ADMIN;

    const isAdmin = isSuperAdmin || 
                    rolesArray.includes('ROLE_ADMIN') || 
                    rolesArray.includes('ADMIN') || 
                    userData.role === ROLES.ADMIN;

    userData.isSuperAdmin = isSuperAdmin;
    userData.isAdmin = isAdmin;

    if (isSuperAdmin) {
      userData.role = ROLES.SUPER_ADMIN;
      // Super Admin implicitly holds EVERY backend AdminPage
      userData.grantedPages = Object.values(ADMIN_PAGES);
    } else if (isAdmin) {
      userData.role = ROLES.ADMIN;
      userData.grantedPages = Array.isArray(userData.grantedPages)
        ? userData.grantedPages
        : (Array.isArray(userData.pages) ? userData.pages : []);
    } else {
      userData.role = ROLES.CUSTOMER;
      userData.grantedPages = [];
    }

    return userData;
  }, []);

  const silentRefresh = async () => {
    try {
      const storedRefreshToken = sessionStorage.getItem('refreshToken');
      if (!storedRefreshToken) throw new Error("No refresh token");
      const response = await axiosClient.post('/auth/refresh', { refreshToken: storedRefreshToken });
      setAccessToken(response.accessToken);
      if (response.refreshToken) {
        sessionStorage.setItem('refreshToken', response.refreshToken);
      }
      let userData = response.user;
      if (!userData) {
        const profileResponse = await axiosClient.get('/users/me', {
          headers: { Authorization: `Bearer ${response.accessToken}` }
        });
        userData = profileResponse.data || profileResponse;
      }

      const normalized = normalizeUserData(userData);
      setUser(normalized);
      sessionStorage.setItem('token', response.accessToken);
      sessionStorage.setItem('user', JSON.stringify(normalized));
    } catch (err) {
      console.warn('Silent refresh failed:', err.message);
      setAccessToken(null);
      setUser(null);
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Attempt silent refresh on startup
    silentRefresh();

    // Catch session expiration / revocation events from Axios interceptor
    const handleAuthExpired = () => {
      setAccessToken(null);
      setUser(null);
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');
      toast.error('Session expired or account disabled. Please log in again.');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  const login = async (credentialsOrEmail, passwordParam) => {
    let email, password;
    if (typeof credentialsOrEmail === 'object' && credentialsOrEmail !== null) {
      email = credentialsOrEmail.email;
      password = credentialsOrEmail.password;
    } else {
      email = credentialsOrEmail;
      password = passwordParam;
    }

    try {
      const response = await axiosClient.post('/auth/login', { email, password });
      setAccessToken(response.accessToken);
      let userData = response.user;
      if (!userData) {
        const profileResponse = await axiosClient.get('/users/me', {
          headers: { Authorization: `Bearer ${response.accessToken}` }
        });
        userData = profileResponse.data || profileResponse;
      }

      const normalized = normalizeUserData(userData);
      setUser(normalized);
      sessionStorage.setItem('token', response.accessToken);
      if (response.refreshToken) {
        sessionStorage.setItem('refreshToken', response.refreshToken);
      }
      sessionStorage.setItem('user', JSON.stringify(normalized));
      toast.success(`Welcome back, ${normalized?.fullName || normalized?.name || 'User'}`);
      return normalized;
    } catch (error) {
      console.error('API login failed:', error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const storedRefreshToken = sessionStorage.getItem('refreshToken');
      await axiosClient.post('/auth/logout', { refreshToken: storedRefreshToken });
    } catch (e) {
      console.warn('Backend logout invalidation failed');
    } finally {
      setAccessToken(null);
      setUser(null);
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');
      toast.info('Logged out successfully.');
    }
  };

  const refreshProfile = async () => {
    if (!accessToken && !sessionStorage.getItem('token')) return null;
    try {
      const profileResponse = await axiosClient.get('/users/me');
      const updatedProfile = profileResponse.data || profileResponse;
      if (updatedProfile) {
        const merged = { ...user, ...updatedProfile };
        const normalized = normalizeUserData(merged);
        setUser(normalized);
        sessionStorage.setItem('user', JSON.stringify(normalized));
        return normalized;
      }
      return null;
    } catch (err) {
      console.error('Failed to refresh user profile:', err.message);
      return null;
    }
  };

  /**
   * Checks if current user holds permission to access a section or action
   * @param {string} permission Permission key or AdminPage enum value
   * @returns {boolean}
   */
  const hasPermission = (permission) => {
    if (!user) return false;

    // Super Admin has access to EVERY action, endpoint, and admin page
    if (user.isSuperAdmin) return true;

    // Super admin-only gates (like /api/admin/admin-management/**)
    if (permission === 'SUPER_ADMIN' || permission === PERMISSIONS.MANAGE_STAFF) {
      return Boolean(user.isSuperAdmin);
    }

    // Dashboard root home view is accessible to any admin
    if (permission === 'VIEW_DASHBOARD' || permission === PERMISSIONS.VIEW_DASHBOARD) {
      return Boolean(user.isAdmin);
    }

    // Check if permission corresponds to an AdminPage
    const targetPage = getPageForPermission(permission);
    if (targetPage && Object.values(ADMIN_PAGES).includes(targetPage)) {
      if (!user.isAdmin) return false;
      // If user has specific granted pages tracked, enforce strictly
      if (Array.isArray(user.grantedPages) && user.grantedPages.length > 0) {
        return user.grantedPages.includes(targetPage);
      }
      // If admin has not had pages pre-populated, allow access (backend @PreAuthorize will enforce)
      return true;
    }

    // Default for any admin role
    return Boolean(user.isAdmin);
  };

  /**
   * Convenience check for an AdminPage value
   */
  const hasPageAccess = (page) => {
    if (!user || !user.isAdmin) return false;
    if (user.isSuperAdmin) return true;
    if (Array.isArray(user.grantedPages) && user.grantedPages.length > 0) {
      return user.grantedPages.includes(page);
    }
    return true;
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  /**
   * Allows updating granted pages in active session (e.g. after assigning roles or refreshing admin details)
   */
  const setAdminGrantedPages = (pages) => {
    if (!user) return;
    const updated = {
      ...user,
      grantedPages: pages
    };
    setUser(updated);
    sessionStorage.setItem('user', JSON.stringify(updated));
  };

  const loginWithGoogle = async (googlePayload) => {
    try {
      const payload = typeof googlePayload === 'string' ? { idToken: googlePayload } : googlePayload;
      const response = await axiosClient.post('/auth/google', payload);
      setAccessToken(response.accessToken);
      let userData = response.user;
      if (!userData) {
        const profileResponse = await axiosClient.get('/users/me', {
          headers: { Authorization: `Bearer ${response.accessToken}` }
        });
        userData = profileResponse.data || profileResponse;
      }

      const normalized = normalizeUserData(userData);
      setUser(normalized);
      sessionStorage.setItem('token', response.accessToken);
      if (response.refreshToken) {
        sessionStorage.setItem('refreshToken', response.refreshToken);
      }
      sessionStorage.setItem('user', JSON.stringify(normalized));
      toast.success(`Welcome, ${normalized?.fullName || normalized?.name || 'User'}`);
      return normalized;
    } catch (error) {
      console.error('Google login failed:', error.message);
      throw error;
    }
  };

  const registerUser = async (registrationPayload) => {
    try {
      const response = await axiosClient.post('/auth/register', registrationPayload);
      if (response?.accessToken) {
        setAccessToken(response.accessToken);
        sessionStorage.setItem('token', response.accessToken);
        if (response.refreshToken) {
          sessionStorage.setItem('refreshToken', response.refreshToken);
        }
        let userData = response.user;
        if (!userData) {
          try {
            const profileResponse = await axiosClient.get('/users/me', {
              headers: { Authorization: `Bearer ${response.accessToken}` }
            });
            userData = profileResponse.data || profileResponse;
          } catch (pErr) {
            console.warn('Could not fetch user profile after register:', pErr);
          }
        }
        const normalized = normalizeUserData(userData);
        setUser(normalized);
        if (normalized) {
          sessionStorage.setItem('user', JSON.stringify(normalized));
        }
        return { ...response, user: normalized };
      }
      return response;
    } catch (error) {
      console.error('Registration API failed:', error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register: registerUser,
      loginWithGoogle, 
      logout, 
      refreshProfile, 
      hasPermission, 
      hasPageAccess, 
      hasRole, 
      setAdminGrantedPages,
      accessToken,
      isSuperAdmin: Boolean(user?.isSuperAdmin),
      isAdmin: Boolean(user?.isAdmin),
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
