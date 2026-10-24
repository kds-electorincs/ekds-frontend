import React from 'react';
import { Box, Paper, Typography, Button, Chip } from '@mui/material';
import { Lock as LockIcon, ArrowBack as ArrowBackIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AccessDenied = ({ requiredPermission = null, requiredPage = null }) => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', p: 3 }}>
      <Paper
        elevation={0}
        sx={{
          maxWidth: 540,
          width: '100%',
          p: 4,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          textAlign: 'center',
          boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: '#fee2e2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2.5,
          }}
        >
          <LockIcon sx={{ fontSize: 32 }} />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
          Access Restricted by RBAC Policy
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
          Your administrative account does not currently hold the required page permissions to access this section.
        </Typography>

        {(requiredPermission || requiredPage) && (
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0', textAlign: 'left' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
              Required RBAC Gate:
            </Typography>
            <Chip
              label={requiredPage || requiredPermission}
              size="small"
              color="error"
              sx={{ fontWeight: 700, fontSize: '0.75rem' }}
            />
          </Box>
        )}

        <Box sx={{ mb: 4, p: 2, bgcolor: '#f1f5f9', borderRadius: 2, textAlign: 'left' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
            Your Current Role & Access:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
            {user?.role?.replace('_', ' ') || 'Staff'} {user?.isSuperAdmin ? '(Super Administrator)' : ''}
          </Typography>

          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontWeight: 600 }}>
            Granted Pages:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
            {user?.isSuperAdmin ? (
              <Chip label="ALL PAGES (Super Admin)" size="small" color="primary" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
            ) : (user?.grantedPages && user.grantedPages.length > 0) ? (
              user.grantedPages.map((p) => (
                <Chip key={p} label={p} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
              ))
            ) : (
              <Typography variant="caption" color="text.disabled">No specific pages granted. Contact Super Admin.</Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/dashboard')}
            sx={{ fontWeight: 600, borderRadius: 2, px: 2.5 }}
          >
            Dashboard
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => {
              refreshProfile();
            }}
            sx={{ fontWeight: 700, borderRadius: 2, px: 2.5 }}
          >
            Refresh Access
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AccessDenied;
