import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, Link, Grid, ToggleButton, ToggleButtonGroup, Divider, FormControlLabel, Checkbox, FormHelperText } from '@mui/material';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import notification from '../utils/notification';
import { authService, privacyService } from '../services/apiServices';
import BrandLogo from '../components/common/BrandLogo';
import { useAuth } from '../context/AuthContext';

const schema = yup.object({
  fullName: yup.string().required('Full Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string(),
  password: yup.string().required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match'),
  companyName: yup.string().when('regType', {
    is: 'company',
    then: (schema) => schema.required('Company Name is required'),
  }),
  taxId: yup.string().when('regType', {
    is: 'company',
    then: (schema) => schema.required('Tax/VAT ID is required'),
  }),
  ageConfirmed: yup.boolean().oneOf([true], 'You must confirm that you are 18 years or older'),
  noticeAccepted: yup.boolean().oneOf([true], 'You must read and accept the Privacy Notice'),
  marketingConsent: yup.boolean(),
}).required();

const Register = () => {
  const [regType, setRegType] = useState('individual');
  const [loading, setLoading] = useState(false);
  const [noticeVersion, setNoticeVersion] = useState('draft-0');
  const { register: registerContext } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchNotice = async () => {
    try {
      const res = await privacyService.getNotice();
      const ver = res?.version || res?.data?.version || 'draft-0';
      setNoticeVersion(ver);
      return ver;
    } catch (err) {
      console.warn('Could not fetch privacy notice version:', err?.message);
      return 'draft-0';
    }
  };

  useEffect(() => {
    fetchNotice();
  }, []);

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      regType: 'individual',
      ageConfirmed: false,
      noticeAccepted: false,
      marketingConsent: false
    }
  });

  const handleRegTypeChange = (event, newType) => {
    if (newType !== null) {
      setRegType(newType);
      setValue('regType', newType);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    let currentVersion = noticeVersion;
    try {
      // Re-fetch latest notice version to avoid stale version rejection
      currentVersion = await fetchNotice();

      const payload = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || '',
        password: data.password,
        ageConfirmed: true,
        noticeVersion: currentVersion,
      };

      // Register user and set up active session
      if (registerContext) {
        await registerContext(payload);
      } else {
        await authService.register(payload);
      }

      // If user selected optional marketing consent, trigger separate privacy consent endpoint
      if (data.marketingConsent) {
        try {
          await privacyService.changeConsent('MARKETING', 'GRANT');
        } catch (mErr) {
          console.warn('Marketing consent recording deferred:', mErr?.message);
        }
      }
      
      notification.success('Account created! An 8-digit verification code has been emailed to you.');
      const from = location.state?.from || new URLSearchParams(location.search).get('redirect') || '/';
      navigate(`/verify-email?redirect=${encodeURIComponent(from)}`, { state: { redirect: from } });
    } catch (error) {
      console.error('Registration failed:', error);
      const resData = error?.response?.data;
      if (error?.response?.status === 409 && resData?.title === 'Privacy notice out of date') {
        const freshVer = resData.currentVersion || (await fetchNotice());
        setNoticeVersion(freshVer);
        notification.warning('Privacy notice has been updated. Please re-confirm your acceptance and click Register again.');
      } else {
        const msg = resData?.errors ? Object.values(resData.errors).join(', ') : (resData?.title || error?.message || 'Registration failed');
        notification.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
      <Paper elevation={0} sx={{ p: 4, width: '100%', maxWidth: 600, borderRadius: 3, border: '1px solid #E2ECF5', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <BrandLogo sx={{ mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', mb: 0.5 }}>
            Create Your Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Join KDS Electronics to unlock B2B pricing &amp; express ordering
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Full Name"
                {...register('fullName')}
                error={!!errors.fullName}
                helperText={errors.fullName?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Phone Number"
                {...register('phone')}
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
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
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    {...register('companyName')}
                    error={!!errors.companyName}
                    helperText={errors.companyName?.message}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
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

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                {...register('confirmPassword')}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
              />
            </Grid>

            {/* DPDP Section 22 Mandatory Checkbox 1: Age confirmation */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name="ageConfirmed"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={!!field.value} color="primary" />}
                    label={
                      <Typography variant="body2" color="text.secondary">
                        I confirm that I am 18 years or older.
                      </Typography>
                    }
                  />
                )}
              />
              {errors.ageConfirmed && (
                <FormHelperText error sx={{ ml: 1 }}>
                  {errors.ageConfirmed.message}
                </FormHelperText>
              )}
            </Grid>

            {/* DPDP Section 2.2 Mandatory Checkbox 2: Privacy notice acceptance */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name="noticeAccepted"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={!!field.value} color="primary" />}
                    label={
                      <Typography variant="body2" color="text.secondary">
                        I have read and accept the{' '}
                        <Link component={RouterLink} to="/privacy-notice" target="_blank" underline="always" color="primary">
                          Privacy Notice ({noticeVersion})
                        </Link>.
                      </Typography>
                    }
                  />
                )}
              />
              {errors.noticeAccepted && (
                <FormHelperText error sx={{ ml: 1 }}>
                  {errors.noticeAccepted.message}
                </FormHelperText>
              )}
            </Grid>

            {/* DPDP Section 2.2 Optional Checkbox 3: Separate unbundled marketing emails */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name="marketingConsent"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={!!field.value} color="primary" />}
                    label={
                      <Typography variant="body2" color="text.secondary">
                        (Optional) Send me marketing emails, BOM market insights, and bulk pricing promotions.
                      </Typography>
                    }
                  />
                )}
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

        <Box sx={{ my: 3, display: 'flex', alignItems: 'center' }}>
          <Divider sx={{ flex: 1 }} />
          <Typography variant="caption" color="text.secondary" sx={{ px: 2, fontWeight: 600 }}>
            OR
          </Typography>
          <Divider sx={{ flex: 1 }} />
        </Box>

        <GoogleLoginButton text="signup_with" noticeVersion={noticeVersion} />

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link 
              component={RouterLink} 
              to={(() => {
                const from = location.state?.from || new URLSearchParams(location.search).get('redirect');
                return from ? `/login?redirect=${encodeURIComponent(from)}` : '/login';
              })()} 
              state={{ from: location.state?.from || new URLSearchParams(location.search).get('redirect') }}
              sx={{ fontWeight: 700, textDecoration: 'none' }}
            >
              Login Now
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;
