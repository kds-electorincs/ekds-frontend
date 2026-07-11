import React from 'react';
import { Box, Typography, Button, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Divider } from '@mui/material';
import { Add, Remove, Delete, ShoppingCartCheckout } from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Paper elevation={0} sx={{ p: 6, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>Your cart is empty</Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>Looks like you haven't added anything to your cart yet.</Typography>
          <Button component={RouterLink} to="/products" variant="contained" size="large">
            Start Shopping
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 800, color: 'primary.main' }}>Shopping Cart</Typography>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        <Box sx={{ flex: 1 }}>
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflowX: 'auto' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cartItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {item.image && (
                          <Box component="img" src={item.image} alt={item.name} sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }} />
                        )}
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Remove fontSize="small" />
                        </IconButton>
                        <Typography sx={{ minWidth: 20, textAlign: 'center' }}>{item.quantity}</Typography>
                        <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Add fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="right">{formatPrice(item.price)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>{formatPrice(item.price * item.quantity)}</TableCell>
                    <TableCell align="center">
                      <IconButton color="error" onClick={() => removeFromCart(item.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ width: { xs: '100%', md: 350 } }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Order Summary</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography color="text.secondary">Subtotal</Typography>
              <Typography fontWeight={600}>{formatPrice(cartTotal)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography color="text.secondary">Tax (5%)</Typography>
              <Typography fontWeight={600}>{formatPrice(cartTotal * 0.05)}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={700}>Total</Typography>
              <Typography variant="h6" fontWeight={800} color="primary.main">{formatPrice(cartTotal * 1.05)}</Typography>
            </Box>
            <Button 
              fullWidth 
              variant="contained" 
              size="large" 
              startIcon={<ShoppingCartCheckout />}
              onClick={() => navigate('/checkout')}
              sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
            >
              Proceed to Checkout
            </Button>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default Cart;
