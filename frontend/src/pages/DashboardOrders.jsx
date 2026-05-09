import { useState } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, IconButton, 
  TextField, InputAdornment, Tooltip 
} from '@mui/material';
import { 
  Search as SearchIcon, Visibility as VisibilityIcon, 
  FilterList as FilterListIcon 
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const initialOrders = [
  { id: 'ORD-1024', customer: 'Alice Smith', email: 'alice@example.com', date: '2026-05-06', items: 3, total: '$450.00', status: 'Processing' },
  { id: 'ORD-1023', customer: 'Bob Johnson', email: 'bob@example.com', date: '2026-05-05', items: 1, total: '$120.00', status: 'Shipped' },
  { id: 'ORD-1022', customer: 'Charlie Brown', email: 'charlie@example.com', date: '2026-05-04', items: 5, total: '$980.50', status: 'Delivered' },
  { id: 'ORD-1021', customer: 'Diana Prince', email: 'diana@example.com', date: '2026-05-04', items: 2, total: '$340.00', status: 'Cancelled' },
  { id: 'ORD-1020', customer: 'Evan Wright', email: 'evan@example.com', date: '2026-05-03', items: 1, total: '$50.00', status: 'Delivered' },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'Delivered': return 'success';
    case 'Shipped': return 'info';
    case 'Processing': return 'warning';
    case 'Cancelled': return 'error';
    default: return 'default';
  }
};

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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button 
            variant="outlined" 
            startIcon={<FilterListIcon />}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Filter By Status
          </Button>
        </Box>
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Items</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {initialOrders.map((row) => (
                <TableRow key={row.id} sx={{ '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
                  <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>{row.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.customer}</Typography>
                    <Typography variant="caption" color="text.secondary">{row.email}</Typography>
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{row.date}</TableCell>
                  <TableCell>{row.items}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{row.total}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.status} 
                      color={getStatusColor(row.status)}
                      size="small"
                      sx={{ fontWeight: 600, borderRadius: 1.5, px: 1 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Order Details">
                      <IconButton size="small" color="primary" onClick={() => toast.info(`Viewing details for order: ${row.id}`)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default DashboardOrders;
