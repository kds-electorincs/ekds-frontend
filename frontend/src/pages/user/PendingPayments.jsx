import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';

const mockPayments = [
  { id: 'INV-201', orderId: 'ORD-001', dueDate: '2023-11-15', amount: 1250.00 },
];

const PendingPayments = () => {
  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Pending Payments</Typography>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'secondary.light' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Invoice ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockPayments.length > 0 ? mockPayments.map((pay) => (
              <TableRow key={pay.id}>
                <TableCell fontWeight={600}>{pay.id}</TableCell>
                <TableCell color="primary.main">{pay.orderId}</TableCell>
                <TableCell sx={{ color: 'error.main', fontWeight: 600 }}>{pay.dueDate}</TableCell>
                <TableCell fontWeight={700}>${pay.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Button variant="contained" size="small" color="primary">Pay Now</Button>
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
