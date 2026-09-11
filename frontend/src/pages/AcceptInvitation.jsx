import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, CircularProgress, Alert, Grid } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/apiServices';
import notification from '../utils/notification';

const AcceptInvitation = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const res = await authService.previewInvitation(token);
        setInvitation(res.data || res);
      } catch (err) {
        console.error('Failed to preview invitation:', err);
        setError(err.response?.data?.detail || 'Invitation is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchInvitation();
    } else {
      setError('Invalid invitation link');
      setLoading(false);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      notification.error('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await authService.acceptInvitation(token, {
        fullName: formData.fullName,
        password: formData.password,
        phone: formData.phone
      });
      notification.success('Account setup complete! Please login.');
      navigate('/login');
    } catch (err) {
      console.error('Failed to accept invitation:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
        <Paper elevation={0} sx={{ p: 4, width: '100%', maxWidth: 480, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          <Button variant="contained" fullWidth onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
      <Paper elevation={0} sx={{ p: 4, width: '100%', maxWidth: 520, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
            Accept Admin Invitation
          </Typography>
          <Typography color="text.secondary">
            Set up your staff account for <strong>{invitation?.email}</strong>
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Full Name"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="password"
                label="Password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="password"
                label="Confirm Password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={submitting}
            sx={{ mt: 4, py: 1.5, borderRadius: 2, fontWeight: 700 }}
          >
            {submitting ? 'Setting up Account...' : 'Complete Account Setup'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default AcceptInvitation;
