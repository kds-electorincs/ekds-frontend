'use client';
import React from 'react';
import { Box } from '@mui/material';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import FloatingWhatsAppButton from '../components/common/FloatingWhatsAppButton';

export default function StorefrontLayout({ children }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      <Footer />
      <FloatingWhatsAppButton />
    </Box>
  );
}
