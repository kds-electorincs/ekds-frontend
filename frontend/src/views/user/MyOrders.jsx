import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';

const mockOrders = [
  { id: 'ORD-001', date: '2023-10-25', items: 3, total: 1250.00, status: 'Processing' },
  { id: 'ORD-002', date: '2023-10-20', items: 1, total: 450.00, status: 'Shipped' },
  { id: 'ORD-003', date: '2023-10-15', items: 5, total: 3200.00, status: 'Cancelled' },
];

const MyOrders = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const statuses = ['All', 'Processing', 'Shipped', 'Cancelled'];
  const currentStatus = statuses[tabValue];

  const filteredOrders = currentStatus === 'All' 
    ? mockOrders 
    : mockOrders.filter(o => o.status === currentStatus);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Processing': return 'warning';
      case 'Shipped': return 'success';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>My Orders</Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          {statuses.map(status => <Tab key={status} label={status} />)}
        </Tabs>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'secondary.light' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.length > 0 ? filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell fontWeight={600} color="primary.main">{order.id}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.items}</TableCell>
                <TableCell>${order.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip label={order.status} size="small" color={getStatusColor(order.status)} />
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                  No orders found for this status.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MyOrders;
