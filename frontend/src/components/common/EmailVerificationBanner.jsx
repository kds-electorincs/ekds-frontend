import React, { useState } from 'react';
import { Box, Typography, Button, IconButton, Collapse } from '@mui/material';
import { 
  WarningAmber as UnverifiedMailIcon,
  Close as CloseIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/apiServices';
import notification from '../../utils/notification';

const EmailVerificationBanner = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [dismissed, setDismissed] = useState(false);
  const [resending, setResending] = useState(false);

  // Do not show banner if user is not logged in, if email is verified, or if already on verify-email screen
  if (!user || user.emailVerified || location.pathname === '/verify-email') {
    return null;
  }

  const handleQuickResend = async () => {
    setResending(true);
    try {
      await userService.requestEmailVerification();
      notification.success('Verification code resent! Please check your inbox.');
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.title || 'Unable to resend verification code.';
      notification.error(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <Collapse in={!dismissed}>
      <Box 
        sx={{ 
          bgcolor: '#FFF7ED', 
          borderBottom: '1px solid #FFEDD5', 
          py: 1, 
          px: { xs: 2, sm: 3, md: 6 },
          color: '#9A3412',
          position: 'relative',
          zIndex: 1100
        }}
      >
        <Box 
          sx={{ 
            maxWidth: 1440, 
            mx: 'auto', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5 
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 260 }}>
            <UnverifiedMailIcon sx={{ color: '#EA580C', fontSize: 20, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              <span>Your email address ({user.email}) is not verified. </span>
              <span style={{ fontWeight: 400, opacity: 0.9 }}>
                Verify your email to enable express order checkout and receive shipment tracking.
              </span>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            <Button
              size="small"
              onClick={handleQuickResend}
              disabled={resending}
              sx={{ 
                color: '#9A3412', 
                textTransform: 'none', 
                fontWeight: 700, 
                fontSize: '0.75rem',
                p: 0.5,
                '&:hover': { bgcolor: 'rgba(234, 88, 12, 0.08)' }
              }}
            >
              {resending ? 'Sending...' : 'Resend Code'}
            </Button>
            <Button
              component={RouterLink}
              to="/verify-email"
              state={{ redirect: location.pathname }}
              size="small"
              variant="contained"
              endIcon={<ArrowForwardIcon sx={{ fontSize: '14px !important' }} />}
              sx={{ 
                bgcolor: '#EA580C', 
                color: '#ffffff', 
                fontWeight: 800, 
                fontSize: '0.75rem',
                px: 1.5,
                py: 0.4,
                borderRadius: 1.5,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#C2410C' }
              }}
            >
              Verify Now
            </Button>
            <IconButton 
              size="small" 
              onClick={() => setDismissed(true)} 
              aria-label="dismiss banner"
              sx={{ color: '#9A3412', ml: 0.5 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Collapse>
  );
};

export default EmailVerificationBanner;
