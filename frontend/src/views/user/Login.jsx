import { useRouter, usePathname } from 'next/navigation';
"use client";
import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Link, InputAdornment, IconButton, Alert, MenuItem } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Link from 'next/link';
import { as RouterLink } from 'react-router-dom';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import notification from '../utils/notification';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/roles';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
  role: yup.string(),
}).required();

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const location = useLocation();
  const { login } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      role: ROLES.SUPER_ADMIN
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await login({
        email: data.email,
        password: data.password
      });

      // Redirect based on role (AuthContext now normalizes this to a single string like 'SUPER_ADMIN')
      const isAdminRole = Object.values(ROLES).includes(user.role) || 
                          (user.role && (user.role.includes('ADMIN') || user.role.includes('MANAGER') || user.role.includes('STAFF')));

      if (isAdminRole) {
        router.push('/admin/dashboard');
      } else {
        const from = location.state?.from || new URLSearchParams(location.search).get('redirect') || '/user/dashboard';
        router.push(from, { replace: true });
      }
    } catch (error) {
      console.error('Login failed:', error);
      // Error handling is managed by axios interceptor/notification
    } finally {
      setLoading(false);
    }
  };


  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
      <Paper elevation={0} sx={{ p: 4, width: '100%', maxWidth: 450, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
            Welcome Back
          </Typography>
          <Typography color="text.secondary">
            Login to manage your inventory and orders
          </Typography>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Email Address"
              autoComplete="username"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              }}
            />
          </Box>


          <Box sx={{ textAlign: 'right', mb: 3 }}>
            <Link component={RouterLink} to="/forgot-password" variant="body2" sx={{ fontWeight: 600, textDecoration: 'none' }}>
              Forgot Password?
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={<LoginIcon />}
            sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link 
              component={RouterLink} 
              to={(() => {
                const from = location.state?.from || new URLSearchParams(location.search).get('redirect') || '/user/dashboard';
                return from !== '/user/dashboard' ? `/register?redirect=${encodeURIComponent(from)}` : '/register';
              })()} 
              state={{ from: location.state?.from || new URLSearchParams(location.search).get('redirect') }}
              sx={{ fontWeight: 700, textDecoration: 'none' }}
            >
              Create Account
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
