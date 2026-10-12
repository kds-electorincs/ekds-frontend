import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Container, Typography, Paper, Grid, Divider, Button, Chip,
  CircularProgress, Alert, List, ListItem, ListItemText, Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import {
  CheckCircle, HourglassTop, ErrorOutlineOutlined as ErrorOutline, ReceiptLong, Home,
  LocalShipping,
} from '@mui/icons-material';
import { useParams, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { orderService } from '../services/apiServices';
import { useCart } from '../context/CartContext';
import { formatTotal } from '../utils/priceUtils';

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 20000;

const PAYMENT_STATUS_UI = {
  PENDING: { label: 'Payment Pending', color: 'warning' },
  PAID: { label: 'Paid', color: 'success' },
  FAILED: { label: 'Payment Failed', color: 'error' },
  REFUNDED: { label: 'Refunded', color: 'default' },
};

const OrderStatus = () => {
  const { orderNumber } = useParams();
  const [searchParams] = useSearchParams();
  const paymentHint = searchParams.get('payment');
  const { fetchCart } = useCart();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [pollTimedOut, setPollTimedOut] = useState(false);
  const cartRefreshed = useRef(false);
  const pollStartedAt = useRef(null);
  const pollTimer = useRef(null);

  const loadOrder = useCallback(async () => {
    try {
      const data = await orderService.getOrderById(orderNumber);
      setOrder(data);
      return data;
    } catch {
      setOrder(null);
      return null;
    }
  }, [orderNumber]);

  useEffect(() => {
    if (!orderNumber) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      const data = await loadOrder();
      if (mounted) setLoading(false);
      if (data?.paymentStatus === 'PAID' && !cartRefreshed.current) {
        cartRefreshed.current = true;
        fetchCart();
      }
    })();
    return () => { mounted = false; };
  }, [orderNumber, loadOrder, fetchCart]);

  useEffect(() => {
    if (!order) return;
    const shouldPoll = order.paymentStatus === 'PENDING' && (paymentHint === 'success' || paymentHint === 'pending');
    if (!shouldPoll) return;

    if (!pollStartedAt.current) pollStartedAt.current = Date.now();
    setPolling(true);

    pollTimer.current = setTimeout(async () => {
      if (Date.now() - pollStartedAt.current >= POLL_TIMEOUT_MS) {
        setPolling(false);
        setPollTimedOut(true);
        return;
      }
      const data = await loadOrder();
      if (data?.paymentStatus === 'PAID') {
        setPolling(false);
        if (!cartRefreshed.current) {
          cartRefreshed.current = true;
          fetchCart();
        }
      }
    }, POLL_INTERVAL_MS);

    return () => clearTimeout(pollTimer.current);
  }, [order, paymentHint, loadOrder, fetchCart]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
        <CircularProgress size={40} />
        <Typography sx={{ mt: 2 }} color="text.secondary">Loading order…</Typography>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
        <Paper elevation={0} sx={{ p: 6, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
          <ErrorOutline sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" fontWeight={700} gutterBottom>Order Not Found</Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            We couldn't find this order, or it doesn't belong to your account.
          </Typography>
          <Button component={RouterLink} to="/user/orders" variant="contained" size="large">View My Orders</Button>
        </Paper>
      </Container>
    );
  }

  const paymentUi = PAYMENT_STATUS_UI[order.paymentStatus] || { label: order.paymentStatus, color: 'default' };
  const showConfirming = polling && order.paymentStatus === 'PENDING';
  const isPaid = order.paymentStatus === 'PAID';

  const amounts = order.amounts || {};
  const isGujarat = order.shippingStateCode === '24' || amounts.cgstInrScaled > 0;

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          {isPaid ? (
            <CheckCircle sx={{ fontSize: 72, color: 'success.main', mb: 1 }} />
          ) : showConfirming ? (
            <CircularProgress size={56} sx={{ mb: 1 }} />
          ) : order.paymentStatus === 'FAILED' ? (
            <ErrorOutline sx={{ fontSize: 72, color: 'error.main', mb: 1 }} />
          ) : (
            <HourglassTop sx={{ fontSize: 72, color: 'warning.main', mb: 1 }} />
          )}

          <Typography variant="h4" fontWeight={800} gutterBottom>
            {isPaid ? 'Payment Successful!' : showConfirming ? 'Confirming Your Payment…' : order.paymentStatus === 'FAILED' ? 'Payment Failed' : 'Payment Pending'}
          </Typography>

          {showConfirming && (
            <Typography color="text.secondary">
              Razorpay confirmed your checkout, but our system is still finalizing the payment. This usually takes a few seconds.
            </Typography>
          )}

          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 2, bgcolor: 'grey.50', px: 3, py: 1.5, borderRadius: 3, my: 2, flexWrap: 'wrap', justifyContent: 'center', border: '1px solid', borderColor: 'divider' }}>
            <Box>Order: <strong>{order.orderNumber}</strong></Box>
            <Chip size="small" label={paymentUi.label} color={paymentUi.color} sx={{ fontWeight: 700 }} />
            <Chip size="small" label={order.fulfilmentStatus?.replace(/_/g, ' ')} variant="outlined" sx={{ fontWeight: 700 }} />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>SHIPPING ADDRESS</Typography>
            {order.addresses?.filter(a => a.addressType === 'SHIPPING').map((addr, i) => (
              <Box key={i}>
                <Typography variant="body2" fontWeight={700}>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</Typography>
                <Typography variant="body2">{addr.city}, {addr.state} ({addr.stateCode}) - {addr.pincode}</Typography>
              </Box>
            ))}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>ORDER &amp; GST TAX BREAKDOWN</Typography>
            <Typography variant="body2">Placed: {order.placedAt ? new Date(order.placedAt).toLocaleString() : '—'}</Typography>
            <Typography variant="body2">Total Weight: {amounts.totalWeightG ? `${amounts.totalWeightG} g` : '—'}</Typography>
            <Typography variant="body2">Delivery Zone: {amounts.deliveryZone || '—'}</Typography>
            
            <Box sx={{ mt: 1, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">Goods (ex-GST):</Typography>
                <Typography variant="caption" fontWeight={700}>₹{((amounts.goodsSubtotalInrScaled || 0) / 10000).toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">Delivery (ex-GST):</Typography>
                <Typography variant="caption" fontWeight={700}>₹{((amounts.deliveryExGstInrScaled || 0) / 10000).toFixed(2)}</Typography>
              </Box>
              {isGujarat ? (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">CGST:</Typography>
                    <Typography variant="caption" fontWeight={700}>₹{((amounts.cgstInrScaled || 0) / 10000).toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">SGST:</Typography>
                    <Typography variant="caption" fontWeight={700}>₹{((amounts.sgstInrScaled || 0) / 10000).toFixed(2)}</Typography>
                  </Box>
                </>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">IGST:</Typography>
                  <Typography variant="caption" fontWeight={700}>₹{((amounts.igstInrScaled || 0) / 10000).toFixed(2)}</Typography>
                </Box>
              )}
              <Divider sx={{ my: 0.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" fontWeight={800}>Grand Total:</Typography>
                <Typography variant="body2" fontWeight={800} color="primary.main">
                  {formatTotal(order.grandTotalScaled || amounts.grandTotalInrScaled, order.priceScale || 4, 'INR')}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {order.items?.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>ITEMIZED LINE TAX BREAKDOWN</Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#EDF4FA' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Part / MPN</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Qty</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Ex-GST (INR)</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Tax Type</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Incl-GST (INR)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell sx={{ fontWeight: 600 }}>{item.mpn || item.productName}</TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                      <TableCell align="right">₹{((item.lineExGstInrScaled || 0) / 10000).toFixed(2)}</TableCell>
                      <TableCell align="center">
                        <Chip label={item.taxSplitType || (isGujarat ? 'CGST_SGST' : 'IGST')} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>₹{((item.lineInclGstInrScaled || 0) / 10000).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="contained" color="primary" size="large" startIcon={<ReceiptLong />} component={RouterLink} to="/user/orders">
            View My Orders
          </Button>
          <Button variant="text" color="inherit" size="large" startIcon={<Home />} component={RouterLink} to="/products">
            Continue Shopping
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderStatus;
