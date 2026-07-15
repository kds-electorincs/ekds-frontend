import React, { useState } from 'react';
import { Box, Container, Typography, Paper, Stepper, Step, StepLabel, Button, TextField, Grid, Divider, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import notification from '../utils/notification';
import AddressManager from '../components/checkout/AddressManager';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

const steps = ['Shipping Address', 'Payment Details', 'Review Order'];

const Checkout = () => {
  const [activeStep, setActiveStep] = useState(0);
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const { formatPrice } = useCurrency();

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Place Order
      notification.success('Order placed successfully!');
      clearCart();
      navigate('/products');
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  React.useEffect(() => {
    if (!user) {
      notification.info('Please log in or register to complete your order.');
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    if (cartItems.length === 0 && activeStep === 0) {
      navigate('/products');
    }
  }, [user, cartItems.length, activeStep, navigate]);

  if (!user || (cartItems.length === 0 && activeStep === 0)) {
    return null;
  }

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <AddressManager onSelectAddress={(addr) => setSelectedAddress(addr)} />
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Payment Method</Typography>
            <RadioGroup defaultValue="card">
              <FormControlLabel value="card" control={<Radio />} label="Credit / Debit Card (Prepaid Mock)" />
            </RadioGroup>
            <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
              <Typography variant="body2" color="info.contrastText">
                We only accept prepaid orders. For development, we are bypassing real payment integration. Select Credit / Debit Card to proceed.
              </Typography>
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Order summary</Typography>
            <Box sx={{ my: 2 }}>
              {cartItems.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                  <Typography>
                    {item.name} x {item.quantity}
                  </Typography>
                  <Typography variant="body2">{formatPrice(item.price * item.quantity)}</Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1" fontWeight={700}>Total (Incl. Tax)</Typography>
                <Typography variant="subtitle1" fontWeight={700}>
                  {formatPrice(cartTotal * 1.05)}
                </Typography>
              </Box>
              {selectedAddress && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    Shipping Address:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedAddress.name} ({selectedAddress.type})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedAddress.address}, {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip}, {selectedAddress.country}
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        );
      default:
        throw new Error('Unknown step');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <Typography component="h1" variant="h4" align="center" sx={{ mb: 4, fontWeight: 800, color: 'primary.main' }}>
          Checkout
        </Typography>
        <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <React.Fragment>
          {getStepContent(activeStep)}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 5 }}>
            {activeStep !== 0 && (
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{ borderRadius: 2, px: 4 }}
            >
              {activeStep === steps.length - 1 ? 'Place order' : 'Next'}
            </Button>
          </Box>
        </React.Fragment>
      </Paper>
    </Container>
  );
};

export default Checkout;
