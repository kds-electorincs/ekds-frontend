import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, CircularProgress,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { orderService } from '../../services/apiServices';
import { formatTotal } from '../../utils/priceUtils';

const PendingPayments = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPending = useCallback(async () => {
    try {
      setLoading(true);
      // No dedicated "pending payments" endpoint exists — derive it from the
      // order list, since only one order can be PENDING at a time anyway
      // (guide §3).
      const res = await orderService.getUserOrders({ page: 0, size: 50 });
      const content = res?.content ?? (Array.isArray(res) ? res : []);
      setOrders(content.filter((o) => o.paymentStatus === 'PENDING'));
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={1}>Pending Payments</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Orders awaiting payment confirmation. Only one order can be pending at a time — to resume paying
        for one, revisit your cart and go through checkout again; you'll be offered the option to resume
        or cancel the existing order.
      </Typography>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'secondary.light' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Order Number</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Placed</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Amount Due</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 5 }}><CircularProgress size={24} /></TableCell>
              </TableRow>
            ) : orders.length > 0 ? orders.map((order) => (
              <TableRow key={order.orderId ?? order.orderNumber}>
                <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{order.orderNumber}</TableCell>
                <TableCell>{order.placedAt ? new Date(order.placedAt).toLocaleString() : '—'}</TableCell>
                <TableCell>{order.itemCount}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{formatTotal(order.grandTotalScaled, order.priceScale, order.displayCurrency)}</TableCell>
                <TableCell>
                  <Button component={RouterLink} to="/cart" variant="contained" size="small" color="primary">
                    Resume via Checkout
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                  You have no pending payments.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PendingPayments;
