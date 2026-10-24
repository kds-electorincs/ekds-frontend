import React, { useState, useEffect } from 'react';
import { 
  Box, Paper, Typography, TextField, Button, Alert, 
  CircularProgress, Stack, Chip, Divider, Link 
} from '@mui/material';
import { 
  Verified as VerifiedIcon, 
  Email as MailIcon, 
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as SuccessIcon,
  WarningAmber as WarningIcon
} from '@mui/icons-material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/apiServices';
import notification from '../utils/notification';
import BrandLogo from '../components/common/BrandLogo';

const VerifyEmail = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  // Parse redirect query parameter
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = location.state?.redirect || searchParams.get('redirect') || '/user/dashboard';

  // Cooldown countdown effect
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleOtpChange = (e) => {
    // Only allow numbers and max 8 digits
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 8);
    setOtp(cleaned);
    if (errorMessage) setErrorMessage('');
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (otp.length !== 8) {
      setErrorMessage('Please enter the complete 8-digit verification code.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    try {
      await userService.verifyEmail(otp);
      notification.success('Email successfully verified!');
      // Update global user state
      await refreshProfile();
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error('Email verification error:', err);
      const res = err?.response?.data;
      const msg = res?.detail || res?.title || (res?.errors ? Object.values(res.errors).join(', ') : 'Invalid or expired OTP.');
      setErrorMessage(msg);
      setFailedAttempts((prev) => prev + 1);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setErrorMessage('');
    try {
      await userService.requestEmailVerification();
      notification.success('A new 8-digit verification code has been sent to your email.');
      setCooldown(60);
      setOtp('');
      setFailedAttempts(0);
    } catch (err) {
      console.error('Resend verification error:', err);
      const res = err?.response?.data;
      const msg = res?.detail || res?.title || 'Unable to send verification code. Please try again later.';
      setErrorMessage(msg);
    } finally {
      setResending(false);
    }
  };

  // If user is not logged in, prompt to log in
  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, px: 2, minHeight: '60vh' }}>
        <Paper elevation={0} sx={{ p: 4, width: '100%', maxWidth: 480, borderRadius: 3, border: '1px solid #E2ECF5', textAlign: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
          <BrandLogo sx={{ mb: 2 }} />
          <MailIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1.5 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
            Sign In Required
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please log in to your account to verify your email address.
          </Typography>
          <Button
            component={RouterLink}
            to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
            variant="contained"
            fullWidth
            size="large"
            sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
          >
            Go to Login
          </Button>
        </Paper>
      </Box>
    );
  }

  // If already verified
  if (user?.emailVerified) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, px: 2, minHeight: '60vh' }}>
        <Paper elevation={0} sx={{ p: 4, width: '100%', maxWidth: 480, borderRadius: 3, border: '1px solid #E2ECF5', textAlign: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
          <BrandLogo sx={{ mb: 2 }} />
          <Box sx={{ display: 'inline-flex', p: 2, borderRadius: '50%', bgcolor: '#E8F5E9', color: 'success.main', mb: 2 }}>
            <SuccessIcon sx={{ fontSize: 48 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
            Email Already Verified!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Your account email ({user.email}) is verified and ready for checkout and enterprise features.
          </Typography>
          <Button
            onClick={() => navigate(redirectPath, { replace: true })}
            variant="contained"
            fullWidth
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
          >
            Continue
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6, px: 2, minHeight: '60vh' }}>
      <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, width: '100%', maxWidth: 480, borderRadius: 3, border: '1px solid #E2ECF5', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <BrandLogo sx={{ mb: 2 }} />
          <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: 2, bgcolor: '#EDF4FA', color: 'primary.main', mb: 1.5 }}>
            <MailIcon sx={{ fontSize: 36 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', mb: 0.5 }}>
            Verify Your Email
          </Typography>
          <Typography variant="body2" color="text.secondary">
            We've sent an 8-digit verification code to
          </Typography>
          <Chip 
            label={user.email} 
            size="small" 
            sx={{ mt: 1, fontWeight: 700, bgcolor: '#F1F5F9', color: '#1E293B', fontSize: '0.8125rem' }} 
          />
          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
            The code expires in 15 minutes.
          </Typography>
        </Box>

        {errorMessage && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              (failedAttempts >= 3 || errorMessage.toLowerCase().includes('expired') || errorMessage.toLowerCase().includes('invalid')) ? (
                <Button color="inherit" size="small" onClick={handleResend} disabled={resending || cooldown > 0} sx={{ fontWeight: 700 }}>
                  Send New Code
                </Button>
              ) : null
            }
          >
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={handleVerify}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="8-Digit Verification Code"
              placeholder="12345678"
              value={otp}
              onChange={handleOtpChange}
              autoFocus
              slotProps={{
                htmlInput: {
                  maxLength: 8,
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  style: {
                    textAlign: 'center',
                    letterSpacing: '0.35em',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    fontFamily: 'monospace'
                  }
                }
              }}
              helperText="Enter the 8 digits emailed to you"
            />
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={submitting || otp.length !== 8}
            sx={{ py: 1.5, borderRadius: 2, fontWeight: 800, fontSize: '0.95rem' }}
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Verify Email'}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Didn't receive the email? Check your spam folder or
            </Typography>
            <Button
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              variant="text"
              startIcon={<RefreshIcon />}
              sx={{ fontWeight: 700, textTransform: 'none' }}
            >
              {cooldown > 0 
                ? `Resend available in ${cooldown}s` 
                : (resending ? 'Sending...' : 'Resend Verification Code')}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link 
              component={RouterLink} 
              to={redirectPath} 
              color="text.secondary" 
              variant="caption" 
              sx={{ fontWeight: 600, textDecoration: 'none' }}
            >
              Skip for now
            </Link>
            <Link 
              component={RouterLink} 
              to="/user/profile" 
              color="primary" 
              variant="caption" 
              sx={{ fontWeight: 700, textDecoration: 'none' }}
            >
              Change Email in Profile
            </Link>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default VerifyEmail;
