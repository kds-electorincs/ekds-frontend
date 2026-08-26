import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Tabs, Tab, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, CircularProgress, TablePagination,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { orderService } from '../../services/apiServices';
import { formatTotal } from '../../utils/priceUtils';

const PAYMENT_STATUS_UI = {
  PENDING: { label: 'Payment Pending', color: 'warning' },
  PAID: { label: 'Paid', color: 'success' },
  FAILED: { label: 'Payment Failed', color: 'error' },
  REFUNDED: { label: 'Refunded', color: 'default' },
};

const FULFILMENT_UI = {
  NOT_STARTED: 'default',
  AWAITING_STOCK: 'warning',
  PROCESSING: 'info',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'error',
  ABANDONED: 'error',
};

const TABS = [
  { label: 'All', filter: null },
  { label: 'Pending Payment', filter: (o) => o.paymentStatus === 'PENDING' },
  { label: 'Processing', filter: (o) => ['PROCESSING', 'AWAITING_STOCK', 'NOT_STARTED'].includes(o.fulfilmentStatus) },
  { label: 'Shipped', filter: (o) => o.fulfilmentStatus === 'SHIPPED' },
  { label: 'Delivered', filter: (o) => o.fulfilmentStatus === 'DELIVERED' },
  { label: 'Cancelled', filter: (o) => ['CANCELLED', 'ABANDONED'].includes(o.fulfilmentStatus) },
];

const MyOrders = () => {
  const [tabValue, setTabValue] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await orderService.getUserOrders({ page, size: rowsPerPage });
      const content = res?.content ?? (Array.isArray(res) ? res : []);
      setOrders(content);
      setTotalElements(res?.totalElements ?? content.length);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const activeFilter = TABS[tabValue].filter;
  const filteredOrders = activeFilter ? orders.filter(activeFilter) : orders;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>My Orders</Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          {TABS.map((t) => <Tab key={t.label} label={t.label} />)}
        </Tabs>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'secondary.light' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Order Number</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Payment</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Fulfilment</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 5 }}><CircularProgress size={24} /></TableCell>
              </TableRow>
            ) : filteredOrders.length > 0 ? filteredOrders.map((order) => {
              const paymentUi = PAYMENT_STATUS_UI[order.paymentStatus] || { label: order.paymentStatus, color: 'default' };
              return (
                <TableRow
                  key={order.orderId ?? order.orderNumber}
                  component={RouterLink}
                  to={`/orders/${order.orderNumber}`}
                  hover
                  sx={{ textDecoration: 'none', cursor: 'pointer', '& td': { color: 'inherit' } }}
                >
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{order.orderNumber}</TableCell>
                  <TableCell>{order.placedAt ? new Date(order.placedAt).toLocaleDateString() : '—'}</TableCell>
                  <TableCell>{order.itemCount}</TableCell>
                  <TableCell>{formatTotal(order.grandTotalScaled, order.priceScale, order.displayCurrency)}</TableCell>
                  <TableCell>
                    <Chip label={paymentUi.label} size="small" color={paymentUi.color} sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.fulfilmentStatus?.replace(/_/g, ' ')}
                      size="small"
                      color={FULFILMENT_UI[order.fulfilmentStatus] || 'default'}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                </TableRow>
              );
            }) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                  No orders found for this status.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </TableContainer>
    </Box>
  );
};

export default MyOrders;
