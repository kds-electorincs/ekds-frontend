import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Link, Grid, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import notification from '../utils/notification';
import { authService } from '../services/apiServices';

const schema = yup.object({
  fullName: yup.string().required('Full Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match'),
  companyName: yup.string().when('regType', {
    is: 'company',
    then: (schema) => schema.required('Company Name is required'),
  }),
  taxId: yup.string().when('regType', {
    is: 'company',
    then: (schema) => schema.required('Tax/VAT ID is required'),
  }),
}).required();

const Register = () => {
  const [regType, setRegType] = useState('individual');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { regType: 'individual' }
  });

  const handleRegTypeChange = (event, newType) => {
    if (newType !== null) {
      setRegType(newType);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = { ...data, type: regType };
      await authService.register(payload);
      
      notification.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
      // Note: The global error handler in axiosInstance will automatically show toast errors
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
      <Paper elevation={0} sx={{ p: 4, width: '100%', maxWidth: 600, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
            Create Account
          </Typography>
          <Typography color="text.secondary">
            Join Archana to streamline your business operations
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <ToggleButtonGroup
            value={regType}
            exclusive
            onChange={handleRegTypeChange}
            color="primary"
            sx={{ width: '100%' }}
          >
            <ToggleButton value="individual" sx={{ flex: 1, py: 1.5 }}>Individual</ToggleButton>
            <ToggleButton value="company" sx={{ flex: 1, py: 1.5 }}>Company / B2B</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                {...register('fullName')}
                error={!!errors.fullName}
                helperText={errors.fullName?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </Grid>
            
            {regType === 'company' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    {...register('companyName')}
                    error={!!errors.companyName}
                    helperText={errors.companyName?.message}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tax / VAT ID"
                    {...register('taxId')}
                    error={!!errors.taxId}
                    helperText={errors.taxId?.message}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                {...register('confirmPassword')}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 4, py: 1.5, borderRadius: 2, fontWeight: 700 }}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </Button>
        </form>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" sx={{ fontWeight: 700, textDecoration: 'none' }}>
              Login Now
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;
