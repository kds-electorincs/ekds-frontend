import { useState } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, IconButton, 
  TextField, InputAdornment, Avatar, Tooltip 
} from '@mui/material';
import { 
  Add as AddIcon, Search as SearchIcon, 
  Edit as EditIcon, Delete as DeleteIcon, 
  FilterList as FilterListIcon 
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const initialProducts = [
  { id: 1, name: 'Wireless Noise-Cancelling Headphones', sku: 'AUDIO-001', category: 'Electronics', price: '$299.99', stock: 45, status: 'In Stock', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80' },
  { id: 2, name: 'Minimalist Leather Watch', sku: 'ACC-042', category: 'Accessories', price: '$129.50', stock: 12, status: 'Low Stock', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80' },
  { id: 3, name: 'Smart Home Security Camera', sku: 'SMART-105', category: 'Electronics', price: '$149.00', stock: 0, status: 'Out of Stock', image: 'https://images.unsplash.com/photo-1557825835-b453e9df2c21?w=100&q=80' },
  { id: 4, name: 'Ergonomic Office Chair', sku: 'FURN-018', category: 'Furniture', price: '$349.00', stock: 24, status: 'In Stock', image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=100&q=80' },
  { id: 5, name: 'Mechanical Gaming Keyboard', sku: 'GAM-007', category: 'Electronics', price: '$159.99', stock: 8, status: 'Low Stock', image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=100&q=80' },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'In Stock': return 'success';
    case 'Low Stock': return 'warning';
    case 'Out of Stock': return 'error';
    default: return 'default';
  }
};

const DashboardProducts = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
            Products
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your inventory, prices, and stock levels.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          sx={{ borderRadius: 2, textTransform: 'none', px: 3, py: 1 }}
        >
          Add Product
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', gap: 2 }}>
          <TextField
            placeholder="Search products by name or SKU..."
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
            Filters
          </Button>
        </Box>
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>SKU</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Stock</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {initialProducts.map((row) => (
                <TableRow key={row.id} sx={{ '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
                  <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar variant="rounded" src={row.image} alt={row.name} sx={{ width: 48, height: 48 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.name}</Typography>
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{row.sku}</TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{row.price}</TableCell>
                  <TableCell>{row.stock}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.status} 
                      color={getStatusColor(row.status)}
                      size="small"
                      sx={{ fontWeight: 600, borderRadius: 1.5, px: 1 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Product">
                      <IconButton size="small" color="primary" sx={{ mr: 1 }} onClick={() => toast.info(`Editing product: ${row.name}`)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Product">
                      <IconButton size="small" color="error" onClick={() => toast.error(`Deleted product: ${row.name}`)}>
                        <DeleteIcon fontSize="small" />
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

export default DashboardProducts;
