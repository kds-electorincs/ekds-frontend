import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Link } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link as RouterLink } from 'react-router-dom';
import notification from '../utils/notification';
import { authService } from '../services/apiServices';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
}).required();

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setSubmitted(true);
      notification.info('If your email is registered, you will receive a reset link.');
    } catch (error) {
      console.error('Forgot password request failed:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
      <Paper elevation={0} sx={{ p: 4, width: '100%', maxWidth: 450, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
            Forgot Password?
          </Typography>
          <Typography color="text.secondary">
            Enter your email and we'll send you a link to reset your password
          </Typography>
        </Box>

        {submitted ? (
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ mb: 3 }}>
              If an account exists for <strong>email@example.com</strong>, you will receive a password reset link shortly.
            </Typography>
            <Button variant="outlined" component={RouterLink} to="/login" fullWidth>
              Back to Login
            </Button>
          </Box>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Email Address"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Link component={RouterLink} to="/login" sx={{ fontWeight: 600, textDecoration: 'none' }}>
                Back to Login
              </Link>
            </Box>
          </form>
        )}
      </Paper>
    </Box>
  );
};

export default ForgotPassword;
