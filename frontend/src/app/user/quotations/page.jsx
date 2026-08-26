"use client";
import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button } from '@mui/material';

const mockQuotations = [
  { id: 'QUO-101', date: '2023-11-01', items: 10, total: 4500.00, status: 'Pending' },
  { id: 'QUO-102', date: '2023-10-12', items: 50, total: 18000.00, status: 'Approved' },
];

const Quotations = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>My Quotations</Typography>
        <Button variant="contained" color="primary">Request New Quotation</Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'secondary.light' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Quotation ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Estimated Total</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockQuotations.map((quo) => (
              <TableRow key={quo.id}>
                <TableCell fontWeight={600} color="primary.main">{quo.id}</TableCell>
                <TableCell>{quo.date}</TableCell>
                <TableCell>{quo.items}</TableCell>
                <TableCell>${quo.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip label={quo.status} size="small" color={quo.status === 'Approved' ? 'success' : 'warning'} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Quotations;
