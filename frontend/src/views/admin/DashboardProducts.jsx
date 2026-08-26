import { useRouter } from 'next/navigation';
"use client";
import { useState } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, IconButton, 
  TextField, InputAdornment, Avatar, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import { toast } from 'react-toastify';
import { validateUploadFile } from '../../utils/uploadValidation';
import useS3Upload from '../../hooks/useS3Upload';

import { useEffect } from 'react';
import { productAdminService, categoryAdminService, configAdminService } from '../../services/apiServices';

const CDN_BASE = import.meta.env?.VITE_CDN_BASE_URL || 'https://d1sswqar085ync.cloudfront.net';

const getPrimaryImageUrl = (row) => {
  if (row.images && row.images.length > 0) {
    const primary = row.images.find(i => i.isPrimary) || row.images[0];
    return primary.url || `${CDN_BASE}/${primary.objectKey}`;
  }
  return '';
};

const getStartingPrice = (row) => {
  if (row.packagingOptions && row.packagingOptions.length > 0) {
    let lowest = Infinity;
    let curr = 'USD';
    row.packagingOptions.forEach(pkg => {
      (pkg.priceBreaks || []).forEach(pb => {
         if (pb.unitPriceMinor < lowest) {
            lowest = pb.unitPriceMinor;
            curr = pb.currency;
         }
      });
    });
    if (lowest !== Infinity) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr }).format(lowest / 100);
    }
  }
  return 'N/A';
};

const getStatusColor = (status) => {
  switch (status) {
    case 'In Stock': return 'success';
    case 'Low Stock': return 'warning';
    case 'Out of Stock': return 'error';
    default: return 'default';
  }
};

const DashboardProducts = () => {
  const router = useRouter();
  const { uploadFile, isUploading } = useS3Upload();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [packagingTypes, setPackagingTypes] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  
  const fetchData = async (categoryIdToFetch = null) => {
    setLoading(true);
    try {
      // 1. Fetch categories, packaging types, and currencies first
      const [catRes, pkgRes, currRes] = await Promise.all([
        categoryAdminService.listCategories({ page: 0, size: 50 }),
        configAdminService.getPackagingTypes(),
        configAdminService.getCurrencies()
      ]);
      const fetchedCategories = catRes.data?.content || catRes.content || [];
      setCategories(fetchedCategories);
      setPackagingTypes(pkgRes.data || pkgRes || []);
      setCurrencies(currRes.data || currRes || []);

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
        const mappedProducts = rawProducts.map(p => {
          let priceDisplay = '0.00';
          if (p.packagingOptions && p.packagingOptions.length > 0) {
            const firstPkg = p.packagingOptions[0];
            if (firstPkg.priceBreaks && firstPkg.priceBreaks.length > 0) {
              const firstBreak = firstPkg.priceBreaks[0];
              const priceDecimal = (firstBreak.unitPriceMinor / 100).toFixed(2);
              priceDisplay = `${firstBreak.currency} ${priceDecimal}`;
            }
          }
          
          return {
            ...p,
            price: priceDisplay,
            stock: p.totalStock || 0,
            image: p.images?.[0]?.url || ''
          };
        });
        
        setProducts(mappedProducts);

        // --- DEMO WORKAROUND (N+1 ANTI-PATTERN) ---
        // Since the backend's ProductSummaryResponse does not include pricing or images,
        // we'll fetch them individually in the background so the table looks complete for the demo.
        Promise.all(mappedProducts.map(async (p) => {
          try {
            const detailRes = await productAdminService.getProduct(p.id);
            const detailed = detailRes.data || detailRes;
            setProducts(prev => prev.map(oldP => {
              if (oldP.id === p.id) {
                return {
                  ...oldP,
                  packagingOptions: detailed.packagingOptions || [],
                  images: detailed.images || [],
                  updatedAt: detailed.updatedAt || oldP.updatedAt
                };
              }
              return oldP;
            }));
          } catch (err) {
            console.error(`Failed to fetch details for product ${p.id}`, err);
          }
        }));

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
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [addForm, setAddForm] = useState({ name: '', sku: '', price: '', category: 'Electronics', stock: '', packType: '', currency: '', imageFile: null });
  const [addImgError, setAddImgError] = useState('');
  const [bulkCategory, setBulkCategory] = useState('All');
  const [bulkPercentage, setBulkPercentage] = useState('');

  // Search filter
  const filteredProducts = products.filter((row) => {
    const term = searchTerm.toLowerCase();
    return row.name.toLowerCase().includes(term) || row.sku.toLowerCase().includes(term);
  });

  const handleAddProduct = async () => {
    if (!addForm.name || !addForm.sku || !addForm.category || !addForm.packType || !addForm.currency || !addForm.price) {
      toast.error('Please fill in Name, SKU, Category, Price, Pack Type, and Currency');
      return;
    }
    
    try {
      let uploadedImages = [];
      if (addForm.imageFile) {
        toast.info('Uploading product image...', { autoClose: 2000 });
        const objectKey = await uploadFile(addForm.imageFile, 'PRODUCT_IMAGE');
        uploadedImages.push({
          objectKey: objectKey,
          displayOrder: 0,
          isPrimary: true
        });
      }

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
        packagingOptions: [
          {
            packagingType: addForm.packType,
            currentQuantity: parseInt(addForm.stock) || 0,
            priceBreaks: [
              {
                currency: addForm.currency,
                minQuantity: 1,
                unitPriceMinor: Math.round(parseFloat(addForm.price) * 100)
              }
            ]
          }
        ],
        images: uploadedImages
      };
      await productAdminService.createProduct(payload);
      toast.success('Product added successfully!');
      setOpenAddModal(false);
      const catId = parseInt(addForm.category);
      setSelectedCategoryId(catId);
      setAddForm({ name: '', sku: '', price: '', category: '', stock: '', packType: '', currency: '', imageFile: null });
      fetchData(catId);
    } catch (err) {
      toast.error('Failed to add product');
    }
  };

  const handleEditClick = (product) => {
    router.push(`/admin/products/${product.id}`);
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
          <FormControl size="small" sx={{ minWidth: 200, borderRadius: 2 }}>
            <Select 
              value={selectedCategoryId || ''} 
              onChange={(e) => {
                setSelectedCategoryId(e.target.value);
                fetchData(e.target.value);
              }}
              displayEmpty
            >
              <MenuItem value="" disabled>Select Category Filter</MenuItem>
              {categories.map(cat => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>SKU</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Manufacturer</TableCell>
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
                    <Avatar variant="rounded" src={getPrimaryImageUrl(row)} alt={row.name} sx={{ width: 48, height: 48 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.name}</Typography>
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{row.mpn || row.sku}</TableCell>
                  <TableCell>{categories.find(c => c.id === row.categoryId)?.name || row.category}</TableCell>
                  <TableCell>{row.manufacturer || 'N/A'}</TableCell>
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
                label="Price" 
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
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Pack Type</InputLabel>
                <Select 
                  label="Pack Type" 
                  value={addForm.packType} 
                  onChange={(e) => setAddForm({ ...addForm, packType: e.target.value })}
                >
                  {packagingTypes.map(type => (
                    <MenuItem key={type.id || type.code} value={type.code}>{type.displayName || type.name || type.code}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select 
                  label="Currency" 
                  value={addForm.currency} 
                  onChange={(e) => setAddForm({ ...addForm, currency: e.target.value })}
                >
                  {currencies.map(curr => (
                    <MenuItem key={curr.id || curr.code} value={curr.code}>{curr.code}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Accepted formats: JPEG, PNG, WebP · Max size: 2 MB
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button variant="outlined" component="label">
                  Upload Product Image
                  <input 
                    type="file" 
                    hidden 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      const error = validateUploadFile(file, 'image');
                      if (error) {
                        setAddImgError(error);
                        e.target.value = '';
                        setAddForm({ ...addForm, imageFile: null });
                        return;
                      }

                      setAddImgError('');
                      setAddForm({ ...addForm, imageFile: file });
                    }}
                  />
                </Button>
                {addForm.imageFile && <Typography variant="body2">{addForm.imageFile.name}</Typography>}
              </Box>
              {addImgError && (
                <Typography color="error" variant="body2">
                  {addImgError}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setOpenAddModal(false)} color="inherit">Cancel</Button>
          <Button 
            onClick={handleAddProduct} 
            variant="contained"
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Save Product'}
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
