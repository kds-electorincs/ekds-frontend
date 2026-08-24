import { useRouter } from 'next/navigation';
"use client";
import React from 'react';
import { Drawer, Box, Typography, IconButton, Divider, Button, Paper, useTheme } from '@mui/material';
import { Close, Delete, ShoppingCart, ArrowForward } from '@mui/icons-material';
import { useCart } from '../../context/CartContext';

import { useCurrency } from '../../context/CurrencyContext';

const CartDrawer = () => {
  const { isCartOpen, setIsCartOpen, cartItems, removeFromCart, cartTotal } = useCart();
  const { formatPrice } = useCurrency();
  const router = useRouter();
  const theme = useTheme();

  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push('/checkout');
  };

  const handleViewCart = () => {
    setIsCartOpen(false);
    router.push('/cart');
  };

  const handleContinueShopping = () => {
    setIsCartOpen(false);
    router.push('/products');
  };

  return (
    <Drawer
      anchor="right"
      open={isCartOpen}
      onClose={() => setIsCartOpen(false)}
      slotProps={{
        paper: {
          sx: { 
            width: { xs: '100%', sm: 420 }, 
            display: 'flex', 
            flexDirection: 'column',
            borderTopLeftRadius: { xs: 0, sm: 24 },
            borderBottomLeftRadius: { xs: 0, sm: 24 },
            overflow: 'hidden'
          }
        }
      }}
    >
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: 3,
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        color: 'white'
      }}>
        <Typography variant="h6" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, letterSpacing: 0.5 }}>
          <ShoppingCart /> 
          MY CART
          <Box component="span" sx={{ 
            bgcolor: 'rgba(255,255,255,0.2)', 
            px: 1.5, 
            py: 0.5, 
            borderRadius: 5, 
            fontSize: '0.875rem' 
          }}>
            {cartItems.length}
          </Box>
        </Typography>
        <IconButton onClick={() => setIsCartOpen(false)} sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
          <Close />
        </IconButton>
      </Box>

      {cartItems.length === 0 ? (
        /* Empty State */
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', p: 4, textAlign: 'center' }}>
          <Box sx={{ 
            width: 120, 
            height: 120, 
            borderRadius: '50%', 
            bgcolor: 'primary.50', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mb: 3
          }}>
            <ShoppingCart sx={{ fontSize: 60, color: 'primary.main', opacity: 0.8 }} />
          </Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 1, color: 'text.primary' }}>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 250 }}>
            Looks like you haven't added anything to your cart yet.
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            onClick={handleContinueShopping}
            sx={{ borderRadius: 8, px: 4, py: 1.5, fontWeight: 700, textTransform: 'none' }}
          >
            Start Shopping
          </Button>
        </Box>
      ) : (
        <>
          {/* Cart Items List */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 3, bgcolor: '#fafafa' }}>
            {cartItems.map((item) => (
              <Paper 
                key={item.id} 
                elevation={0}
                sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  mb: 2, 
                  p: 2, 
                  borderRadius: 3, 
                  border: '1px solid', 
                  borderColor: 'divider',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }
                }}
              >
                {item.image ? (
                  <Box component="img" src={item.image} alt={item.name} sx={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 2 }} />
                ) : (
                  <Box sx={{ width: 70, height: 70, bgcolor: 'grey.200', borderRadius: 2 }} />
                )}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2, mb: 0.5 }}>{item.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Qty: {item.quantity}</Typography>
                  <Typography variant="subtitle2" fontWeight={800} color="primary.main">
                    {formatPrice(item.price * item.quantity)}
                  </Typography>
                </Box>
                <IconButton 
                  color="error" 
                  size="small" 
                  onClick={() => removeFromCart(item.id)}
                  sx={{ alignSelf: 'flex-start', bgcolor: 'error.50', '&:hover': { bgcolor: 'error.100' } }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Paper>
            ))}
          </Box>

          {/* Footer actions */}
          <Paper elevation={12} sx={{ p: 3, borderRadius: 0, borderTop: '1px solid', borderColor: 'divider', zIndex: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} color="text.secondary">Estimated Total</Typography>
              <Typography variant="h5" fontWeight={800} color="text.primary">
                {formatPrice(cartTotal)}
              </Typography>
            </Box>
            <Button 
              fullWidth 
              variant="contained" 
              color="primary" 
              size="large"
              endIcon={<ArrowForward />}
              sx={{ mb: 1.5, borderRadius: 2, py: 1.5, fontWeight: 700, fontSize: '1.05rem', textTransform: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }} 
              onClick={handleCheckout}
            >
              Secure Checkout
            </Button>
            <Button 
              fullWidth 
              variant="outlined" 
              color="primary" 
              size="large"
              sx={{ borderRadius: 2, py: 1.2, fontWeight: 700, textTransform: 'none', borderWidth: 2, '&:hover': { borderWidth: 2 } }} 
              onClick={handleViewCart}
            >
              View Full Cart
            </Button>
          </Paper>
        </>
      )}
    </Drawer>
  );
};

export default CartDrawer;
