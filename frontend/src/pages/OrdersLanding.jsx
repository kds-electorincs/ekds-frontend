import { Box, Container, Typography, Paper, Button, Alert } from '@mui/material';
import { ErrorOutlineOutlined as ErrorOutline } from '@mui/icons-material';
import { Navigate, useSearchParams, Link as RouterLink } from 'react-router-dom';

// Landing target for the Razorpay callback redirect on outright gateway
// failure: {frontend}/orders?payment=error (guide §1). Any other visit to
// this bare route just forwards to the real order-history page.
const OrdersLanding = () => {
  const [searchParams] = useSearchParams();
  const paymentHint = searchParams.get('payment');

  if (paymentHint !== 'error') {
    return <Navigate to="/user/orders" replace />;
  }

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Paper elevation={3} sx={{ p: 5, borderRadius: 4, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
        <ErrorOutline sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        <Typography variant="h5" fontWeight={800} gutterBottom>Payment Could Not Be Started</Typography>
        <Alert severity="error" sx={{ my: 2, textAlign: 'left' }}>
          The payment gateway reported an error before checkout could begin. No charge was made. Please try again from your cart.
        </Alert>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
          <Button component={RouterLink} to="/cart" variant="contained" size="large">Back to Cart</Button>
          <Button component={RouterLink} to="/user/orders" variant="outlined" size="large">View My Orders</Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrdersLanding;
