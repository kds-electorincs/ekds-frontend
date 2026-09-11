import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert,
  CircularProgress, TablePagination, Stack, Tooltip
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { adminPaymentService } from '../../services/apiServices';

const DashboardDiscrepancies = () => {
  const [mismatches, setMismatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  // Resolution Dialog State
  const [selectedMismatch, setSelectedMismatch] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [resolving, setResolving] = useState(false);
  const [dialogError, setDialogError] = useState('');

  const fetchMismatches = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminPaymentService.getMismatches(page, rowsPerPage);
      const data = response.data;
      if (data?.content) {
        setMismatches(data.content);
        setTotalElements(data.totalElements || data.content.length);
      } else if (Array.isArray(data)) {
        setMismatches(data);
        setTotalElements(data.length);
      } else {
        setMismatches([]);
        setTotalElements(0);
      }
    } catch (err) {
      console.error('Failed to fetch payment mismatches:', err);
      setError(err.response?.data?.message || 'Failed to load payment discrepancies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMismatches();
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenResolveDialog = (mismatch) => {
    setSelectedMismatch(mismatch);
    setResolutionNote('');
    setDialogError('');
  };

  const handleCloseResolveDialog = () => {
    setSelectedMismatch(null);
    setResolutionNote('');
    setDialogError('');
  };

  const handleResolveSubmit = async () => {
    if (!resolutionNote.trim()) {
      setDialogError('Please provide a resolution note.');
      return;
    }

    setResolving(true);
    setDialogError('');
    try {
      await adminPaymentService.resolveMismatch(selectedMismatch.id, resolutionNote);
      handleCloseResolveDialog();
      fetchMismatches();
    } catch (err) {
      console.error('Failed to resolve mismatch:', err);
      setDialogError(err.response?.data?.message || 'Failed to resolve payment discrepancy.');
    } finally {
      setResolving(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount == null) return 'N/A';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" fontSize="large" /> Payment Discrepancies
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchMismatches}
          disabled={loading}
        >
          Refresh
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Order Ref</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Payment Gateway</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Expected Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Received Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Difference</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Created At</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : mismatches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                      <Typography variant="body1" color="text.secondary">
                        No payment discrepancies found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  mismatches.map((item) => {
                    const diff = (item.receivedAmount || 0) - (item.expectedAmount || 0);
                    const isResolved = item.resolved || item.status === 'RESOLVED';

                    return (
                      <TableRow key={item.id} hover>
                        <TableCell>#{item.id}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{item.orderNumber || item.orderId || 'N/A'}</TableCell>
                        <TableCell>{item.gateway || item.paymentMethod || 'Razorpay'}</TableCell>
                        <TableCell>{formatCurrency(item.expectedAmount)}</TableCell>
                        <TableCell>{formatCurrency(item.receivedAmount)}</TableCell>
                        <TableCell sx={{ color: diff < 0 ? 'error.main' : 'warning.main', fontWeight: 700 }}>
                          {formatCurrency(diff)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={isResolved ? 'Resolved' : 'Pending'}
                            color={isResolved ? 'success' : 'error'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{formatDate(item.createdAt)}</TableCell>
                        <TableCell align="center">
                          {!isResolved ? (
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleOpenResolveDialog(item)}
                            >
                              Resolve
                            </Button>
                          ) : (
                            <Tooltip title={item.resolutionNote || 'Already resolved'}>
                              <Chip label="Resolved" size="small" color="default" />
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalElements}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>

      {/* Resolve Dialog */}
      <Dialog open={Boolean(selectedMismatch)} onClose={handleCloseResolveDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Resolve Payment Discrepancy #{selectedMismatch?.id}
        </DialogTitle>
        <DialogContent dividers>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dialogError}
            </Alert>
          )}

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Order: <strong>{selectedMismatch?.orderNumber || selectedMismatch?.orderId}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Expected Amount: <strong>{formatCurrency(selectedMismatch?.expectedAmount)}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Received Amount: <strong>{formatCurrency(selectedMismatch?.receivedAmount)}</strong>
            </Typography>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Resolution Note / Justification"
            placeholder="Explain how this discrepancy was verified or resolved (e.g. manual refund issued, gateway audit confirmed)..."
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
            disabled={resolving}
            required
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseResolveDialog} disabled={resolving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleResolveSubmit}
            disabled={resolving}
            startIcon={resolving ? <CircularProgress size={20} /> : <CheckCircleIcon />}
          >
            {resolving ? 'Resolving...' : 'Confirm Resolution'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardDiscrepancies;
