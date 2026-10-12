import React, { useEffect, useRef, useState } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControlLabel, Checkbox, Typography, FormHelperText, Link } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { ROLES } from '../../constants/roles';
import { privacyService } from '../../services/apiServices';
import notification from '../../utils/notification';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '895892165403-end7d42vrpmecr4ob5oohdnqh1750s0u.apps.googleusercontent.com';

const GoogleLoginButton = ({ text = 'signin_with', noticeVersion: initialNoticeVersion }) => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const buttonRef = useRef(null);

  const [pendingCredential, setPendingCredential] = useState(null);
  const [consentModalOpen, setConsentModalOpen] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [noticeAccepted, setNoticeAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [noticeVersion, setNoticeVersion] = useState(initialNoticeVersion || 'draft-0');
  const [consentError, setConsentError] = useState('');
  const [submittingConsent, setSubmittingConsent] = useState(false);

  useEffect(() => {
    if (initialNoticeVersion) {
      setNoticeVersion(initialNoticeVersion);
    }
  }, [initialNoticeVersion]);

  const handleCredentialResponse = async (response) => {
    try {
      const user = await loginWithGoogle({ idToken: response.credential });
      navigateAfterSuccess(user);
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;

      // Handle Section 2.3 DPDP Google first-time user consent 400
      if (status === 400 && data?.title === 'Consent required') {
        setPendingCredential(response.credential);
        setConsentModalOpen(true);
        if (!noticeVersion || noticeVersion === 'draft-0') {
          try {
            const res = await privacyService.getNotice();
            if (res?.version) setNoticeVersion(res.version);
          } catch {}
        }
        return;
      }

      console.error('Google Auth Failed', err);
    }
  };

  const navigateAfterSuccess = (user) => {
    const isAdminRole = Object.values(ROLES).includes(user?.role) || 
                        (user?.role && (user.role.includes('ADMIN') || user.role.includes('MANAGER') || user.role.includes('STAFF')));

    if (isAdminRole) {
      navigate('/admin/dashboard');
    } else {
      const from = location.state?.from || new URLSearchParams(location.search).get('redirect') || '/user/dashboard';
      navigate(from, { replace: true });
    }
  };

  const handleConfirmGoogleConsent = async () => {
    if (!ageConfirmed || !noticeAccepted) {
      setConsentError('You must confirm your age and accept the Privacy Notice to complete Google Sign-In.');
      return;
    }
    setConsentError('');
    setSubmittingConsent(true);
    try {
      let activeNoticeVer = noticeVersion;
      try {
        const res = await privacyService.getNotice();
        if (res?.version) activeNoticeVer = res.version;
      } catch {}

      const user = await loginWithGoogle({
        idToken: pendingCredential,
        ageConfirmed: true,
        noticeVersion: activeNoticeVer,
      });

      if (marketingConsent) {
        try {
          await privacyService.changeConsent('MARKETING', 'GRANT');
        } catch {}
      }

      setConsentModalOpen(false);
      navigateAfterSuccess(user);
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      if (status === 409 && data?.title === 'Privacy notice out of date') {
        const freshVer = data.currentVersion || 'draft-0';
        setNoticeVersion(freshVer);
        setConsentError(`The privacy notice was updated (version ${freshVer}). Please re-confirm your acceptance.`);
      } else {
        const msg = data?.title || err?.message || 'Failed to complete registration';
        setConsentError(msg);
      }
    } finally {
      setSubmittingConsent(false);
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

      {/* DPDP Section 2.3 First-time Google user consent modal */}
      <Dialog open={consentModalOpen} onClose={() => setConsentModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Complete Your Registration</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Welcome to KDS Electronics! Please confirm your data privacy consent to set up your account.
          </Typography>

          <FormControlLabel
            control={<Checkbox checked={ageConfirmed} onChange={(e) => setAgeConfirmed(e.target.checked)} color="primary" />}
            label={
              <Typography variant="body2">
                I confirm that I am 18 years or older.
              </Typography>
            }
          />
          <FormControlLabel
            control={<Checkbox checked={noticeAccepted} onChange={(e) => setNoticeAccepted(e.target.checked)} color="primary" />}
            label={
              <Typography variant="body2">
                I accept the{' '}
                <Link component={RouterLink} to="/privacy-notice" target="_blank" underline="always">
                  Privacy Notice ({noticeVersion})
                </Link>.
              </Typography>
            }
          />
          <FormControlLabel
            control={<Checkbox checked={marketingConsent} onChange={(e) => setMarketingConsent(e.target.checked)} color="primary" />}
            label={
              <Typography variant="body2">
                (Optional) Receive marketing &amp; BOM market updates.
              </Typography>
            }
          />

          {consentError && (
            <FormHelperText error sx={{ mt: 1.5, fontWeight: 700 }}>
              {consentError}
            </FormHelperText>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConsentModalOpen(false)} disabled={submittingConsent}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmGoogleConsent} disabled={submittingConsent}>
            {submittingConsent ? 'Confirming...' : 'Complete Account Setup'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GoogleLoginButton;
