import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient, { injectTokenAccessors } from '../api/axiosClient';
import { ROLE_PERMISSIONS } from '../constants/permissions';
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

      // Normalize backend roles array to frontend role string
      if (userData && Array.isArray(userData.roles) && userData.roles.length > 0) {
        let primaryRole = userData.roles[0];
        if (typeof primaryRole === 'object' && primaryRole.name) {
          primaryRole = primaryRole.name;
        }
        if (typeof primaryRole === 'string' && primaryRole.startsWith('ROLE_')) {
          primaryRole = primaryRole.substring(5); // Strip 'ROLE_'
        }
        userData.role = primaryRole || 'CUSTOMER';
      } else if (userData && !userData.role) {
        userData.role = 'CUSTOMER';
      }

      setUser(userData);
      sessionStorage.setItem('token', response.accessToken);
      sessionStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      console.error('Silent refresh failed:', err.message);
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

    // Catch session expiration events from Axios interceptor
    const handleAuthExpired = () => {
      setAccessToken(null);
      setUser(null);
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');
      toast.error('Session expired. Please log in again.');
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

      // Normalize backend roles array to frontend role string
      if (userData && Array.isArray(userData.roles) && userData.roles.length > 0) {
        // Get the highest privilege role (or just the first one for now)
        let primaryRole = userData.roles[0];
        if (typeof primaryRole === 'object' && primaryRole.name) {
          primaryRole = primaryRole.name;
        }
        if (typeof primaryRole === 'string' && primaryRole.startsWith('ROLE_')) {
          primaryRole = primaryRole.substring(5); // Strip 'ROLE_'
        }
        userData.role = primaryRole || 'CUSTOMER';
      } else if (userData && !userData.role) {
        userData.role = 'CUSTOMER';
      }

      setUser(userData);
      sessionStorage.setItem('token', response.accessToken);
      if (response.refreshToken) {
        sessionStorage.setItem('refreshToken', response.refreshToken);
      }
      sessionStorage.setItem('user', JSON.stringify(userData));
      toast.success(`Welcome back, ${userData?.name || userData?.fullName || 'User'}`);
      return userData;
    } catch (error) {
      console.error('API login failed:', error.message);
      throw error; // Let the UI handle the error (e.g. show toast)
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

  const hasPermission = (permission) => {
    if (!user) return false;
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    return permissions.includes(permission);
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission, hasRole, accessToken }}>
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
