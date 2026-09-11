import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Link, Alert } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import notification from '../utils/notification';
import { authService } from '../services/apiServices';

const requestSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
}).required();

const verifySchema = yup.object({
  otp: yup.string().matches(/^\d{6}$/, 'OTP must be 6 digits').required('OTP is required'),
  newPassword: yup.string().min(6, 'Password must be at least 6 characters').required('New password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('newPassword'), null], 'Passwords must match'),
}).required();

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // Step 1: Request OTP, Step 2: Verify OTP
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register: registerStep1, handleSubmit: handleSubmitStep1, formState: { errors: errorsStep1 } } = useForm({
    resolver: yupResolver(requestSchema)
  });

  const { register: registerStep2, handleSubmit: handleSubmitStep2, formState: { errors: errorsStep2 } } = useForm({
    resolver: yupResolver(verifySchema)
  });

  const onRequestOtp = async (data) => {
    setLoading(true);
    try {
      await authService.requestPasswordReset(data.email);
      setUserEmail(data.email);
      setStep(2);
      notification.success('OTP sent! Please check your email inbox.');
    } catch (error) {
      console.error('OTP request failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async (data) => {
    setLoading(true);
    try {
      await authService.verifyPasswordReset({
        email: userEmail,
        otp: data.otp,
        newPassword: data.newPassword
      });
      notification.success('Password reset successfully! Please log in with your new password.');
      navigate('/login');
    } catch (error) {
      console.error('OTP verification failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
      <Paper elevation={0} sx={{ p: 4, width: '100%', maxWidth: 450, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
            {step === 1 ? 'Forgot Password?' : 'Enter Verification OTP'}
          </Typography>
          <Typography color="text.secondary">
            {step === 1
              ? "Enter your email address and we'll send a 6-digit OTP code to reset your password."
              : `We sent a 6-digit OTP code to ${userEmail}. Enter it below along with your new password.`}
          </Typography>
        </Box>

        {step === 1 ? (
          <form onSubmit={handleSubmitStep1(onRequestOtp)}>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Email Address"
                {...registerStep1('email')}
                error={!!errorsStep1.email}
                helperText={errorsStep1.email?.message}
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
              {loading ? 'Sending OTP...' : 'Send OTP Code'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Link component={RouterLink} to="/login" sx={{ fontWeight: 600, textDecoration: 'none' }}>
                Back to Login
              </Link>
            </Box>
          </form>
        ) : (
          <form onSubmit={handleSubmitStep2(onVerifyOtp)}>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="6-Digit OTP Code"
                inputProps={{ maxLength: 6 }}
                placeholder="123456"
                {...registerStep2('otp')}
                error={!!errorsStep2.otp}
                helperText={errorsStep2.otp?.message}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                type="password"
                label="New Password"
                {...registerStep2('newPassword')}
                error={!!errorsStep2.newPassword}
                helperText={errorsStep2.newPassword?.message}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                type="password"
                label="Confirm New Password"
                {...registerStep2('confirmPassword')}
                error={!!errorsStep2.confirmPassword}
                helperText={errorsStep2.confirmPassword?.message}
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
              {loading ? 'Resetting Password...' : 'Verify OTP & Reset Password'}
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button size="small" onClick={() => setStep(1)} sx={{ fontWeight: 600 }}>
                Resend OTP / Change Email
              </Button>
              <Link component={RouterLink} to="/login" sx={{ fontWeight: 600, textDecoration: 'none', alignSelf: 'center' }}>
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
