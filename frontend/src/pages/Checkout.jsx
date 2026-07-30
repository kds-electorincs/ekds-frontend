import React, { useState } from 'react';
import { Box, Container, Typography, Paper, Stepper, Step, StepLabel, Button, TextField, Grid, Divider, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import notification from '../utils/notification';
import AddressManager from '../components/checkout/AddressManager';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

const steps = ['Shipping Address', 'Review Order', 'Payment Gateway'];

const Checkout = () => {
  const [activeStep, setActiveStep] = useState(0);
  const { cartItems, cartTotal } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const { formatPrice } = useCurrency();

  const handleNext = () => {
    if (activeStep === 0) {
      if (!selectedAddress || user.profileComplete === false) {
        notification.warning('Your profile is incomplete or no shipping address is selected. Please add an address to proceed.');
        return;
      }
      setActiveStep(1);
    } else if (activeStep === 1) {
      navigate('/payment', { state: { selectedAddress } });
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
            <Typography variant="h6" fontWeight={800} gutterBottom>Review Your Order & Delivery Details</Typography>
            <Box sx={{ my: 3 }}>
              {cartItems.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {item.image && (
                      <img src={item.image} alt={item.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }} />
                    )}
                    <Box>
                      <Typography fontWeight={700}>{item.name}</Typography>
                      <Typography variant="body2" color="text.secondary">Qty: {item.quantity}</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1" fontWeight={700}>{formatPrice(item.price * item.quantity)}</Typography>
                </Box>
              ))}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, pt: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} color="text.secondary">Subtotal</Typography>
                <Typography variant="subtitle1" fontWeight={700}>{formatPrice(cartTotal)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1 }}>
                <Typography variant="subtitle1" fontWeight={700} color="text.secondary">GST (5%)</Typography>
                <Typography variant="subtitle1" fontWeight={700}>{formatPrice(cartTotal * 0.05)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, mt: 1, borderTop: '2px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={850}>Total Payable Amount</Typography>
                <Typography variant="h5" fontWeight={850} color="primary.main">
                  {formatPrice(cartTotal * 1.05)}
                </Typography>
              </Box>
              {selectedAddress && (
                <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" fontWeight={800} color="primary.main" gutterBottom>
                    SHIPPING ADDRESS:
                  </Typography>
                  <Typography variant="body1" color="text.primary" fontWeight={700}>
                    {selectedAddress.label || 'Home / Office'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {selectedAddress.line1}{selectedAddress.line2 ? `, ${selectedAddress.line2}` : ''}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}, {selectedAddress.country || 'India'}
                  </Typography>
                  {selectedAddress.phone && (
                    <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mt: 1 }}>
                      Contact Phone: {selectedAddress.phone}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <Typography component="h1" variant="h4" align="center" sx={{ mb: 4, fontWeight: 800, color: 'primary.main' }}>
          Checkout & Verification
        </Typography>
        <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel sx={{ '& .MuiStepLabel-label': { fontWeight: 600 } }}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <React.Fragment>
          {getStepContent(activeStep)}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 5 }}>
            {activeStep !== 0 && (
              <Button onClick={handleBack} sx={{ mr: 2, fontWeight: 700 }}>
                Back
              </Button>
            )}
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleNext}
              disabled={activeStep === 0 && (!selectedAddress || user?.profileComplete === false)}
              sx={{ borderRadius: 2, px: 5, py: 1.5, fontWeight: 800 }}
            >
              {activeStep === 1 ? 'Proceed to Secure Payment' : 'Review Order & Proceed'}
            </Button>
          </Box>
        </React.Fragment>
      </Paper>
    </Container>
  );
};

export default Checkout;
