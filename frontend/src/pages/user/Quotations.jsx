import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, CircularProgress } from '@mui/material';
import { userService } from '../../services/apiServices';

const Quotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        setLoading(true);
        const res = await userService.getQuotations();
        setQuotations(res?.data || res?.quotations || res || []);
      } catch (err) {
        console.error("Failed to fetch quotations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotations();
  }, []);

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
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center"><CircularProgress size={24} /></TableCell>
              </TableRow>
            ) : quotations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">No quotations found.</TableCell>
              </TableRow>
            ) : quotations.map((quo) => (
              <TableRow key={quo.id}>
                <TableCell fontWeight={600} color="primary.main">{quo.id}</TableCell>
                <TableCell>{quo.date}</TableCell>
                <TableCell>{quo.items}</TableCell>
                <TableCell>${Number(quo.total).toFixed(2)}</TableCell>
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
