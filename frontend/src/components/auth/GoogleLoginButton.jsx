import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROLES } from '../../constants/roles';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '895892165403-end7d42vrpmecr4ob5oohdnqh1750s0u.apps.googleusercontent.com';

const GoogleLoginButton = ({ text = 'signin_with' }) => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const buttonRef = useRef(null);

  const handleCredentialResponse = async (response) => {
    try {
      const user = await loginWithGoogle(response.credential);
      const isAdminRole = Object.values(ROLES).includes(user.role) || 
                          (user.role && (user.role.includes('ADMIN') || user.role.includes('MANAGER') || user.role.includes('STAFF')));

      if (isAdminRole) {
        navigate('/admin/dashboard');
      } else {
        const from = location.state?.from || new URLSearchParams(location.search).get('redirect') || '/user/dashboard';
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Google Auth Failed', err);
    }
  };

  useEffect(() => {
    const initializeGoogle = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: text,
            shape: 'rectangular',
          });
        }
      }
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <Box sx={{ width: '100%', my: 2, display: 'flex', justifyContent: 'center' }}>
      <div ref={buttonRef} style={{ width: '100%' }}></div>
    </Box>
  );
};

export default GoogleLoginButton;
