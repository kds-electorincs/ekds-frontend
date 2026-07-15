import React from 'react';
import { Box, Typography } from '@mui/material';
import AddressManager from '../../components/checkout/AddressManager';

const SavedAddresses = () => {
  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Saved Addresses</Typography>
      <Box sx={{ maxWidth: 800 }}>
        {/* Reusing the AddressManager component we built for Checkout */}
        <AddressManager />
      </Box>
    </Box>
  );
};

export default SavedAddresses;
