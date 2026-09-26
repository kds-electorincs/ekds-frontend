import React from 'react';
import { Box } from '@mui/material';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import FloatingWhatsAppButton from '../components/common/FloatingWhatsAppButton';
import { Outlet } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
      <Footer />
      <FloatingWhatsAppButton />
    </Box>
  );
};

export default PublicLayout;

