import React from 'react';
import { Box, Typography, Paper, Grid, TextField, Button } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import notification from '../../utils/notification';

const Profile = () => {
  const { user } = useAuth();

  const handleSave = (e) => {
    e.preventDefault();
    notification.success('Profile updated successfully!');
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>My Profile</Typography>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <form onSubmit={handleSave}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Full Name" defaultValue={user?.name} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email Address" type="email" defaultValue={user?.email} required disabled />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone Number" defaultValue="+1 (555) 123-4567" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Company Name" defaultValue="Acme Corp" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Tax ID / VAT Number" defaultValue="US-123456789" />
            </Grid>
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button variant="contained" color="primary" type="submit" size="large" sx={{ px: 4, borderRadius: 2 }}>
                Save Changes
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default Profile;
