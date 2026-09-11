import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination,
  TextField, InputAdornment, Chip, MenuItem, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Grid, CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  LocalShipping as ShipIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { adminOrderService } from '../../services/apiServices';

const PAYMENT_STATUSES = ['', 'CREATED', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED'];
const FULFILMENT_STATUSES = ['', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const getStatusColor = (status) => {
  const map = {
    CAPTURED: 'success', DELIVERED: 'success',
    SHIPPED: 'info', PROCESSING: 'info', AUTHORIZED: 'info',
    PENDING: 'warning', CREATED: 'warning',
    FAILED: 'error', CANCELLED: 'error', REFUNDED: 'default',
  };
  return map[status] || 'default';
};

const DashboardOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [paymentFilter, setPaymentFilter] = useState('');
  const [fulfilmentFilter, setFulfilmentFilter] = useState('');

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Status update dialog
  const [statusOpen, setStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  // Ship dialog
  const [shipOpen, setShipOpen] = useState(false);
  const [courierName, setCourierName] = useState('');
  const [awbNumber, setAwbNumber] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, size, sort: 'placedAt,desc' };
      if (paymentFilter) params.paymentStatus = paymentFilter;
      if (fulfilmentFilter) params.fulfilmentStatus = fulfilmentFilter;

      const res = await adminOrderService.listOrders(params);
      const data = res.data || res;
      setOrders(data.content || []);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('Failed to load orders:', err);
      const serverMsg = err.response?.data?.detail || err.response?.data?.message || err.message;
      toast.error(`Failed to load orders: ${serverMsg}`);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, size, paymentFilter, fulfilmentFilter]);

  const handleViewDetail = async (id) => {
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      const res = await adminOrderService.getOrder(id);
      setSelectedOrder(res.data || res);
    } catch (err) {
      toast.error('Failed to load order details.');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    try {
      const res = await adminOrderService.updateStatus(selectedOrder.id, newStatus, statusNote);
      setSelectedOrder(res.data || res);
      toast.success('Order status updated.');
      setStatusOpen(false);
      setNewStatus('');
      setStatusNote('');
      fetchOrders();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to update order status.');
    }
  };

  const handleShipOrder = async () => {
    if (!selectedOrder || !courierName || !awbNumber) return;
    try {
      const res = await adminOrderService.shipOrder(selectedOrder.id, courierName, awbNumber);
      setSelectedOrder(res.data || res);
      toast.success('Order marked as shipped.');
      setShipOpen(false);
      setCourierName('');
      setAwbNumber('');
      fetchOrders();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to ship order.');
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
            Orders Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View, filter, update status, and ship customer orders.
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchOrders} disabled={loading}
          sx={{ borderRadius: 2, fontWeight: 600 }}>
          Refresh
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <Box sx={{ p: 3, display: 'flex', gap: 2, flexWrap: 'wrap', borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField select label="Payment Status" size="small" value={paymentFilter}
            onChange={(e) => { setPaymentFilter(e.target.value); setPage(0); }}
            sx={{ minWidth: 180, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
            <MenuItem value="">All</MenuItem>
            {PAYMENT_STATUSES.filter(Boolean).map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>

          <TextField select label="Fulfilment Status" size="small" value={fulfilmentFilter}
            onChange={(e) => { setFulfilmentFilter(e.target.value); setPage(0); }}
            sx={{ minWidth: 180, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
            <MenuItem value="">All</MenuItem>
            {FULFILMENT_STATUSES.filter(Boolean).map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Order #</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Items</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Payment</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Fulfilment</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary', fontWeight: 500 }}>
                    No orders found matching the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{order.orderNumber || order.id}</TableCell>
                    <TableCell>{order.placedAt ? new Date(order.placedAt).toLocaleDateString() : '—'}</TableCell>
                    <TableCell>{order.itemCount ?? order.lineItemCount ?? '—'}</TableCell>
                    <TableCell>₹{order.totalAmountScaled != null ? (order.totalAmountScaled / 10000).toFixed(2) : order.totalAmount ?? '—'}</TableCell>
                    <TableCell>
                      <Chip label={order.paymentStatus || '—'} size="small" color={getStatusColor(order.paymentStatus)} sx={{ fontWeight: 600, borderRadius: 1.5 }} />
                    </TableCell>
                    <TableCell>
                      <Chip label={order.fulfilmentStatus || '—'} size="small" color={getStatusColor(order.fulfilmentStatus)} sx={{ fontWeight: 600, borderRadius: 1.5 }} />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" size="small" title="View Details" onClick={() => handleViewDetail(order.id)}>
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          rowsPerPage={size}
          onRowsPerPageChange={(e) => { setSize(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Paper>

      {/* Order Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          Order Details {selectedOrder?.orderNumber ? `— #${selectedOrder.orderNumber}` : ''}
        </DialogTitle>
        <DialogContent dividers>
          {detailLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : selectedOrder ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary">Payment</Typography>
                  <Chip label={selectedOrder.paymentStatus} size="small" color={getStatusColor(selectedOrder.paymentStatus)} sx={{ ml: 1 }} />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary">Fulfilment</Typography>
                  <Chip label={selectedOrder.fulfilmentStatus} size="small" color={getStatusColor(selectedOrder.fulfilmentStatus)} sx={{ ml: 1 }} />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary">Placed</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedOrder.placedAt ? new Date(selectedOrder.placedAt).toLocaleString() : '—'}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary">User ID</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedOrder.userId ?? '—'}</Typography>
                </Grid>
              </Grid>

              {selectedOrder.lineItems && selectedOrder.lineItems.length > 0 && (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Qty</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Unit Price</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Subtotal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.lineItems.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.productName || item.productSlug || '—'}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>₹{item.unitPriceInrScaled != null ? (item.unitPriceInrScaled / 10000).toFixed(4) : item.unitPrice ?? '—'}</TableCell>
                          <TableCell>₹{item.subtotalInrScaled != null ? (item.subtotalInrScaled / 10000).toFixed(2) : item.subtotal ?? '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setStatusOpen(true)}
            disabled={!selectedOrder} sx={{ borderRadius: 2 }}>
            Update Status
          </Button>
          <Button variant="contained" startIcon={<ShipIcon />} onClick={() => setShipOpen(true)}
            disabled={!selectedOrder} sx={{ borderRadius: 2 }}>
            Mark Shipped
          </Button>
          <Button onClick={() => setDetailOpen(false)} color="inherit" sx={{ borderRadius: 2 }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={statusOpen} onClose={() => setStatusOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Update Order Status</DialogTitle>
        <DialogContent dividers>
          <TextField select fullWidth label="New Fulfilment Status" value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)} sx={{ mb: 2 }}>
            {FULFILMENT_STATUSES.filter(Boolean).map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          <TextField fullWidth label="Note (optional)" multiline rows={2} value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setStatusOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleUpdateStatus} variant="contained" disabled={!newStatus}>Update</Button>
        </DialogActions>
      </Dialog>

      {/* Ship Order Dialog */}
      <Dialog open={shipOpen} onClose={() => setShipOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Ship Order</DialogTitle>
        <DialogContent dividers>
          <TextField fullWidth label="Courier Name" value={courierName}
            onChange={(e) => setCourierName(e.target.value)} sx={{ mb: 2 }} />
          <TextField fullWidth label="AWB / Tracking Number" value={awbNumber}
            onChange={(e) => setAwbNumber(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShipOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleShipOrder} variant="contained" disabled={!courierName || !awbNumber}>Ship</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardOrders;
