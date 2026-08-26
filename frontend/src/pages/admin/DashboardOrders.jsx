import { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
  TextField, InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

// TODO(backend-missing): No AdminOrderController exists anywhere in the
// backend (verified against ekds-backend/kds-web/.../controller/*.java —
// only the customer-facing OrderController exists, with just
// place/list/get). This whole page is blocked on that controller being
// built: list, detail, fulfilment-status update, and ship-order all need
// endpoints that don't exist yet.
//
// Previously wired here (removed, not deleted from history) via
// adminOrderService in apiServices.js — see that file's own commented-out
// block for the exact intended contract:
//   GET  /api/admin/orders?paymentStatus=&fulfilmentStatus=&from=&to=&userId=&page=&size=
//   GET  /api/admin/orders/{id}
//   POST /api/admin/orders/{id}/status   body { status, note }
//   POST /api/admin/orders/{id}/ship     body { courierName, awbNumber }
//
// Once that controller exists, restore: adminOrderService import, the
// filters' onChange handlers driving a real fetchOrders() call, row click
// opening a detail dialog via adminOrderService.getOrder, and the
// Update-Status / Mark-Shipped actions.

const DashboardOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
            Orders
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage customer orders.
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', gap: 2 }}>
          <TextField
            placeholder="Search orders by ID or customer..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, maxWidth: 400, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            disabled
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }
            }}
          />
        </Box>
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Order Number</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Items</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary', fontWeight: 500 }}>
                  Admin order management isn't backed by the API yet — see the TODO(backend-missing)
                  block at the top of this file.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default DashboardOrders;
