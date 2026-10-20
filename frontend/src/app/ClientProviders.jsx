'use client';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme';
import ThemeRegistry from './ThemeRegistry';
import { AuthProvider } from '../context/AuthContext';
import { CurrencyProvider } from '../context/CurrencyContext';
import { CartProvider } from '../context/CartContext';
import ErrorBoundary from '../components/common/ErrorBoundary';

export default function ClientProviders({ children }) {
  return (
    <ThemeRegistry options={{ key: 'mui' }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <CurrencyProvider>
            <CartProvider>
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </CartProvider>
          </CurrencyProvider>
        </AuthProvider>
      </ThemeProvider>
    </ThemeRegistry>
  );
}
