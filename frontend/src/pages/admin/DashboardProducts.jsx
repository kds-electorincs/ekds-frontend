import { useState } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, IconButton, 
  TextField, InputAdornment, Avatar, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { 
  Add as AddIcon, Search as SearchIcon, 
  Edit as EditIcon, Delete as DeleteIcon, 
  FilterList as FilterListIcon,
  FileUpload as FileUploadIcon,
  PriceChange as PriceChangeIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { convertToWebP } from '../../utils/imageUtils';

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
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openBulkPriceModal, setOpenBulkPriceModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setOpenEditModal(true);
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setOpenDeleteModal(true);
  };

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
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            color="secondary" 
            startIcon={<PriceChangeIcon />}
            sx={{ borderRadius: 2, textTransform: 'none', px: 3, py: 1 }}
            onClick={() => setOpenBulkPriceModal(true)}
          >
            Bulk Price Update
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            component="label"
            startIcon={<FileUploadIcon />}
            sx={{ borderRadius: 2, textTransform: 'none', px: 3, py: 1 }}
          >
            Upload CSV
            <input
              type="file"
              hidden
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  toast.success(`Selected file: ${e.target.files[0].name}`);
                }
              }}
            />
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            sx={{ borderRadius: 2, textTransform: 'none', px: 3, py: 1 }}
            onClick={() => setOpenAddModal(true)}
          >
            Add Product
          </Button>
        </Box>
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
                      <IconButton size="small" color="primary" sx={{ mr: 1 }} onClick={() => handleEditClick(row)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Product">
                      <IconButton size="small" color="error" onClick={() => handleDeleteClick(row)}>
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

      {/* Add Product Modal */}
      <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add New Product</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField fullWidth label="Product Name" variant="outlined" />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField fullWidth label="SKU" variant="outlined" />
              <TextField fullWidth label="Price ($)" variant="outlined" type="number" />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select label="Category" defaultValue="Electronics">
                  <MenuItem value="Electronics">Electronics</MenuItem>
                  <MenuItem value="Furniture">Furniture</MenuItem>
                  <MenuItem value="Accessories">Accessories</MenuItem>
                </Select>
              </FormControl>
              <TextField fullWidth label="Initial Stock" variant="outlined" type="number" />
            </Box>
            <Button variant="outlined" component="label">
              Upload Product Image
              <input 
                type="file" 
                hidden 
                accept="image/*" 
                onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    toast.info('Converting to WebP...', { autoClose: 1000 });
                    try {
                      const webpFile = await convertToWebP(e.target.files[0]);
                      toast.success(`Image converted to WebP: ${webpFile.name}`);
                    } catch (err) {
                      toast.error('Failed to convert image');
                    }
                  }
                }}
              />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setOpenAddModal(false)} color="inherit">Cancel</Button>
          <Button 
            onClick={() => {
              toast.success('Product added successfully!');
              setOpenAddModal(false);
            }} 
            variant="contained"
          >
            Save Product
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Price Update Modal */}
      <Dialog open={openBulkPriceModal} onClose={() => setOpenBulkPriceModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Bulk Price Update</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Increase or decrease prices for all products in a specific category by a percentage.
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Target Category</InputLabel>
              <Select label="Target Category" defaultValue="All">
                <MenuItem value="All">All Categories</MenuItem>
                <MenuItem value="Electronics">Electronics</MenuItem>
                <MenuItem value="Furniture">Furniture</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth label="Percentage (%)" variant="outlined" type="number" placeholder="e.g. 5 or -10" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setOpenBulkPriceModal(false)} color="inherit">Cancel</Button>
          <Button 
            onClick={() => {
              toast.success('Prices updated successfully!');
              setOpenBulkPriceModal(false);
            }} 
            variant="contained"
          >
            Apply Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Product</DialogTitle>
        <DialogContent dividers>
          {selectedProduct && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
              <TextField fullWidth label="Product Name" variant="outlined" defaultValue={selectedProduct.name} />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField fullWidth label="SKU" variant="outlined" defaultValue={selectedProduct.sku} />
                <TextField fullWidth label="Price" variant="outlined" defaultValue={selectedProduct.price.replace('$', '')} type="number" />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select label="Category" defaultValue={selectedProduct.category}>
                    <MenuItem value="Electronics">Electronics</MenuItem>
                    <MenuItem value="Furniture">Furniture</MenuItem>
                    <MenuItem value="Accessories">Accessories</MenuItem>
                  </Select>
                </FormControl>
                <TextField fullWidth label="Stock" variant="outlined" type="number" defaultValue={selectedProduct.stock} />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setOpenEditModal(false)} color="inherit">Cancel</Button>
          <Button 
            onClick={() => {
              toast.success('Product updated successfully!');
              setOpenEditModal(false);
            }} 
            variant="contained"
          >
            Update Product
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedProduct?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setOpenDeleteModal(false)} color="inherit">Cancel</Button>
          <Button 
            onClick={() => {
              toast.error('Product deleted!');
              setOpenDeleteModal(false);
            }} 
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardProducts;
