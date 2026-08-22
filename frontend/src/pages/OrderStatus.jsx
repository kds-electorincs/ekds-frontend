import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Container, Typography, Paper, Grid, Divider, Button, Chip,
  CircularProgress, Alert, List, ListItem, ListItemText,
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
  const paymentHint = searchParams.get('payment'); // success | pending | error
  const { fetchCart } = useCart();

  const [order, setOrder] = useState(null);
  // TODO(backend-missing): No backend endpoint for
  // GET /orders/{orderNumber}/tracking (OrderController only has
  // place/list/get). Status-history timeline is stubbed out below until
  // that endpoint exists — see orderService.getOrderTracking in
  // apiServices.js (commented out there too).
  // const [tracking, setTracking] = useState([]);
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

  // TODO(backend-missing): see tracking state note above.
  // const loadTracking = useCallback(async () => {
  //   try {
  //     const data = await orderService.getOrderTracking(orderNumber);
  //     setTracking(Array.isArray(data) ? data : (data?.content || []));
  //   } catch {
  //     // tracking is supplementary — fail silently
  //   }
  // }, [orderNumber]);

  // ─── Initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!orderNumber) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      const data = await loadOrder();
      if (mounted) setLoading(false);
      // Cart is authoritative server-side and was left untouched at
      // placement time (guide §1 — no proof of payment until webhook), so
      // once we can see PAID here, refresh the local cart context.
      if (data?.paymentStatus === 'PAID' && !cartRefreshed.current) {
        cartRefreshed.current = true;
        fetchCart();
      }
    })();
    return () => { mounted = false; };
  }, [orderNumber, loadOrder, fetchCart]);

  // ─── Poll while PENDING and we just came back from Razorpay ───────────────
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

  // TODO(backend-missing): No backend endpoint for
  // POST /orders/{orderNumber}/cancel (OrderController has no cancel
  // method). "Cancel Order" button below is commented out until that
  // endpoint exists — see orderService.cancelOrder in apiServices.js
  // (commented out there too).
  // const [cancelling, setCancelling] = useState(false);
  // const handleCancel = async () => {
  //   setCancelling(true);
  //   try {
  //     const data = await orderService.cancelOrder(orderNumber);
  //     setOrder(data);
  //     notification.success('Order cancelled.');
  //   } catch {
  //     // toasted by axiosClient
  //   } finally {
  //     setCancelling(false);
  //   }
  // };

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
          {pollTimedOut && !isPaid && (
            <Alert severity="info" sx={{ mt: 2, textAlign: 'left' }}>
              We're still confirming this payment — it can occasionally take a little longer.
              Check your <RouterLink to="/user/orders">orders page</RouterLink> shortly; you don't need to keep this tab open.
            </Alert>
          )}
          {paymentHint === 'error' && !isPaid && (
            <Alert severity="error" sx={{ mt: 2, textAlign: 'left' }}>
              The payment gateway reported an error. If money was deducted, it will reconcile automatically — otherwise, please retry from your cart.
            </Alert>
          )}

          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 2, bgcolor: 'grey.50', px: 3, py: 1.5, borderRadius: 3, my: 2, flexWrap: 'wrap', justifyContent: 'center', border: '1px solid', borderColor: 'divider' }}>
            <Box>Order: <strong>{order.orderNumber}</strong></Box>
            <Chip size="small" label={paymentUi.label} color={paymentUi.color} sx={{ fontWeight: 700 }} />
            <Chip size="small" label={order.fulfilmentStatus?.replace(/_/g, ' ')} variant="outlined" sx={{ fontWeight: 700 }} />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>SHIPPING ADDRESS</Typography>
            {order.addresses?.filter(a => a.addressType === 'SHIPPING').map((addr, i) => (
              <Box key={i}>
                <Typography variant="body2">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</Typography>
                <Typography variant="body2">{addr.city}, {addr.state} - {addr.pincode}</Typography>
              </Box>
            ))}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>ORDER SUMMARY</Typography>
            <Typography variant="body2">Placed: {order.placedAt ? new Date(order.placedAt).toLocaleString() : '—'}</Typography>
            <Typography variant="body2">Items: {order.itemCount}</Typography>
            <Typography variant="h6" fontWeight={800} color="primary.main" sx={{ mt: 1 }}>
              Total: {formatTotal(order.grandTotalScaled, order.priceScale, order.displayCurrency)}
            </Typography>
            {order.courierName && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                <LocalShipping sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                {order.courierName} — AWB {order.awbNumber}
              </Typography>
            )}
          </Grid>
        </Grid>

        {order.items?.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>ITEMS</Typography>
            <List dense>
              {order.items.map((item, i) => (
                <ListItem key={i} disableGutters sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <ListItemText
                    primary={`${item.mpn} — ${item.manufacturer || ''}`}
                    secondary={`Qty ${item.quantity}${item.wasBackordered ? ' · Backordered' : ''}`}
                  />
                  <Typography fontWeight={700}>
                    {formatTotal(item.lineInclGstInrScaled, order.priceScale, 'INR')}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* TODO(backend-missing): status-history timeline — see tracking
            state/loadTracking TODO near the top of this file. */}

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="contained" color="primary" size="large" startIcon={<ReceiptLong />} component={RouterLink} to="/user/orders">
            View My Orders
          </Button>
          <Button variant="text" color="inherit" size="large" startIcon={<Home />} component={RouterLink} to="/products">
            Continue Shopping
          </Button>
          {/* TODO(backend-missing): "Cancel Order" button — see handleCancel
              TODO above (no POST /orders/{orderNumber}/cancel endpoint yet). */}
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderStatus;
