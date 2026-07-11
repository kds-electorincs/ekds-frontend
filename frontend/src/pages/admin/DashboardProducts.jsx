import { useState } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, IconButton, 
  TextField, InputAdornment, Avatar, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import { toast } from 'react-toastify';
import { convertToWebP } from '../../utils/imageUtils';

import { useEffect } from 'react';
import { productAdminService, categoryAdminService } from '../../services/apiServices';

const getStatusColor = (status) => {
  switch (status) {
    case 'In Stock': return 'success';
    case 'Low Stock': return 'warning';
    case 'Out of Stock': return 'error';
    default: return 'default';
  }
};

const DashboardProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  
  const fetchData = async (categoryIdToFetch = null) => {
    setLoading(true);
    try {
      // 1. Fetch categories first
      const catRes = await categoryAdminService.listCategories({ page: 0, size: 50 });
      const fetchedCategories = catRes.data?.content || catRes.content || [];
      setCategories(fetchedCategories);

      if (fetchedCategories.length > 0) {
        // 2. Figure out which category to load
        const targetCategoryId = categoryIdToFetch || selectedCategoryId || fetchedCategories[0].id;
        if (!selectedCategoryId) setSelectedCategoryId(targetCategoryId);

        // 3. Fetch products ONLY for that specific category
        const prodRes = await productAdminService.listProducts({ 
          page: 0, 
          size: 50, 
          categoryId: targetCategoryId 
        });
        
        const rawProducts = prodRes.data?.content || prodRes.content || [];
        
        // Map products so the table doesn't break missing fields (price, image)
        const mappedProducts = rawProducts.map(p => ({
          ...p,
          price: 'N/A', // Will be updated when price breaks are added
          stock: p.totalStock || 0,
          image: p.images?.[0]?.url || ''
        }));
        
        setProducts(mappedProducts);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('Failed to load real data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openBulkPriceModal, setOpenBulkPriceModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form States
  const [addForm, setAddForm] = useState({ name: '', sku: '', price: '', category: 'Electronics', stock: '' });
  const [editForm, setEditForm] = useState({ name: '', sku: '', price: '', category: 'Electronics', stock: '' });
  const [bulkCategory, setBulkCategory] = useState('All');
  const [bulkPercentage, setBulkPercentage] = useState('');

  // Search filter
  const filteredProducts = products.filter((row) => {
    const term = searchTerm.toLowerCase();
    return row.name.toLowerCase().includes(term) || row.sku.toLowerCase().includes(term);
  });

  const handleAddProduct = async () => {
    if (!addForm.name || !addForm.sku || !addForm.category) {
      toast.error('Please fill in Name, SKU, and Category');
      return;
    }
    
    try {
      // Send real request to backend
      const payload = {
        name: addForm.name,
        mpn: addForm.sku,
        categoryId: parseInt(addForm.category),
        manufacturer: "Default",
        description: "",
        restockLeadDays: 0,
        specs: {},
        meta: { hiddenSegments: [], hiddenAttributes: [] },
        packagingOptions: [],
        images: []
      };
      await productAdminService.createProduct(payload);
      toast.success('Product added successfully!');
      setOpenAddModal(false);
      setAddForm({ name: '', sku: '', price: '', category: '', stock: '' });
      fetchData();
    } catch (err) {
      toast.error('Failed to add product');
    }
  };

  const handleEditClick = (product) => {
    navigate(`/admin/products/${product.id}`);
  };

  const handleUpdateProduct = () => {
    if (!editForm.name || !editForm.sku || !editForm.price) {
      toast.error('Please fill in Name, SKU, and Price');
      return;
    }
    setProducts(prev => prev.map(p => {
      if (p.id === selectedProduct.id) {
        const stockVal = parseInt(editForm.stock) || 0;
        return {
          ...p,
          name: editForm.name,
          sku: editForm.sku,
          category: editForm.category,
          price: `$${parseFloat(editForm.price).toFixed(2)}`,
          stock: stockVal,
          status: stockVal > 15 ? 'In Stock' : (stockVal > 0 ? 'Low Stock' : 'Out of Stock')
        };
      }
      return p;
    }));
    setOpenEditModal(false);
    toast.success('Product updated successfully!');
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setOpenDeleteModal(true);
  };

  const handleDeleteProduct = async () => {
    try {
      await productAdminService.deleteProduct(selectedProduct.id);
      toast.success('Product deleted!');
      setOpenDeleteModal(false);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Product deletion failed.';
      toast.error(msg);
    }
  };

  const handleBulkPriceUpdate = () => {
    toast.error('Bulk Price Update endpoint is currently missing.');
    setOpenBulkPriceModal(false);
  };

  const handleCSVUpload = (e) => {
    toast.error('CSV Upload endpoint is currently missing.');
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
              accept=".csv"
              onChange={handleCSVUpload}
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
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Manufacturer</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Stock</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Created Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Updated Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((row) => (
                <TableRow key={row.id} sx={{ '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
                  <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar variant="rounded" src={row.image} alt={row.name} sx={{ width: 48, height: 48 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.name}</Typography>
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{row.mpn || row.sku}</TableCell>
                  <TableCell>{categories.find(c => c.id === row.categoryId)?.name || row.category}</TableCell>
                  <TableCell>{row.manufacturer || 'N/A'}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{row.price || 'N/A'}</TableCell>
                  <TableCell>{row.totalStock || row.stock || 0}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.active !== false ? 'Active' : 'Inactive'} 
                      color={row.active !== false ? 'success' : 'default'}
                      size="small"
                      sx={{ fontWeight: 600, borderRadius: 1.5, px: 1 }}
                    />
                  </TableCell>
                  <TableCell>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>{row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : 'N/A'}</TableCell>
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
              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" color="text.secondary">
                      No data found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Product Modal */}
      <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add New Product</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField 
              fullWidth 
              label="Product Name" 
              variant="outlined" 
              value={addForm.name} 
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} 
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                fullWidth 
                label="SKU" 
                variant="outlined" 
                value={addForm.sku} 
                onChange={(e) => setAddForm({ ...addForm, sku: e.target.value })} 
              />
              <TextField 
                fullWidth 
                label="Price ($)" 
                variant="outlined" 
                type="number" 
                value={addForm.price} 
                onChange={(e) => setAddForm({ ...addForm, price: e.target.value })} 
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select 
                  label="Category" 
                  value={addForm.category} 
                  onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                >
                  {categories.map(cat => (
                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField 
                fullWidth 
                label="Initial Stock" 
                variant="outlined" 
                type="number" 
                value={addForm.stock} 
                onChange={(e) => setAddForm({ ...addForm, stock: e.target.value })} 
              />
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
            onClick={handleAddProduct} 
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
              <Select 
                label="Target Category" 
                value={bulkCategory} 
                onChange={(e) => setBulkCategory(e.target.value)}
              >
                <MenuItem value="All">All Categories</MenuItem>
                {categories.map(cat => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField 
              fullWidth 
              label="Percentage (%)" 
              variant="outlined" 
              type="number" 
              placeholder="e.g. 5 or -10" 
              value={bulkPercentage} 
              onChange={(e) => setBulkPercentage(e.target.value)} 
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setOpenBulkPriceModal(false)} color="inherit">Cancel</Button>
          <Button 
            onClick={handleBulkPriceUpdate} 
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
              <TextField 
                fullWidth 
                label="Product Name" 
                variant="outlined" 
                value={editForm.name} 
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} 
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField 
                  fullWidth 
                  label="SKU" 
                  variant="outlined" 
                  value={editForm.sku} 
                  onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })} 
                />
                <TextField 
                  fullWidth 
                  label="Price" 
                  variant="outlined" 
                  type="number" 
                  value={editForm.price} 
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} 
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select 
                    label="Category" 
                    value={editForm.category} 
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  >
                  {categories.map(cat => (
                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                  ))}
                  </Select>
                </FormControl>
                <TextField 
                  fullWidth 
                  label="Stock" 
                  variant="outlined" 
                  type="number" 
                  value={editForm.stock} 
                  onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })} 
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setOpenEditModal(false)} color="inherit">Cancel</Button>
          <Button 
            onClick={handleUpdateProduct} 
            variant="contained"
          >
            Update Product
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>Delete Product</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this product?
            <br/><br/>
            SKU: {selectedProduct?.mpn || selectedProduct?.sku}
            <br/><br/>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setOpenDeleteModal(false)} color="inherit">Cancel</Button>
          <Button 
            onClick={handleDeleteProduct} 
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
