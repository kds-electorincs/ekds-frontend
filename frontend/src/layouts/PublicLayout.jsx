import React from 'react';
import { Box, Container } from '@mui/material';
import Navbar from '../components/Navbar';
import { Outlet } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>
      {/* Footer can be added here later */}
      <Box sx={{ py: 3, textAlign: 'center', backgroundColor: 'primary.main', color: 'white' }}>
        &copy; {new Date().getFullYear()} KDS Inventory Management. All rights reserved.
      </Box>
    </Box>
  );
};

export default PublicLayout;
