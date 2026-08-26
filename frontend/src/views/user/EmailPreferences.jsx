import React from 'react';
import { Box, Typography, Paper, FormGroup, FormControlLabel, Switch, Divider, Button } from '@mui/material';
import notification from '../../utils/notification';

const EmailPreferences = () => {
  const handleSave = () => {
    notification.success('Email preferences updated');
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Email Preferences</Typography>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', maxWidth: 600 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>Order Notifications</Typography>
        <FormGroup>
          <FormControlLabel control={<Switch defaultChecked />} label="Order Confirmations" />
          <FormControlLabel control={<Switch defaultChecked />} label="Shipping Updates & Tracking" />
          <FormControlLabel control={<Switch defaultChecked />} label="Delivery Confirmations" />
        </FormGroup>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" fontWeight={600} mb={2}>Promotions & Offers</Typography>
        <FormGroup>
          <FormControlLabel control={<Switch />} label="Weekly Newsletters" />
          <FormControlLabel control={<Switch defaultChecked />} label="Exclusive Discounts & Sales" />
          <FormControlLabel control={<Switch />} label="New Product Announcements" />
        </FormGroup>

        <Box sx={{ mt: 4 }}>
          <Button variant="contained" color="primary" onClick={handleSave} sx={{ px: 4, borderRadius: 2 }}>
            Save Preferences
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default EmailPreferences;
