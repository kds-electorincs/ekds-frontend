import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Paper, Tabs, Tab, IconButton, Breadcrumbs, Link,
  TextField, FormControl, InputLabel, Select, MenuItem, Grid, Switch, FormControlLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Avatar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon, Save as SaveIcon, Add as AddIcon,
  Edit as EditIcon, Delete as DeleteIcon, Upload as UploadIcon,
  Star as StarIcon, StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { configAdminService } from '../../services/apiServices';

// Real product data will be loaded from the backend

const DashboardProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState(0);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('USD');
  const [currencies, setCurrencies] = useState([{ code: 'USD', displayName: '$ US Dollar' }]);
  const [packagingTypes, setPackagingTypes] = useState([{ code: 'CUT_TAPE', displayName: 'Cut Tape' }]);
  
  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await productAdminService.getProduct(id);
      setProduct(res.data || res);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load product details');
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    const fetchConfig = async () => {
      try {
        const [currRes, pkgRes] = await Promise.all([
          configAdminService.getCurrencies(),
          configAdminService.getPackagingTypes()
        ]);
        setCurrencies(currRes.data || currRes);
        setPackagingTypes(pkgRes.data || pkgRes);
      } catch (err) {
        console.error('Failed to load catalog config', err);
      }
    };
    fetchConfig();
  }, [id]);

  const exchangeRate = 83.5; // Example USD to INR

  // Modals state
  const [openPkgModal, setOpenPkgModal] = useState(false);
  const [openPriceModal, setOpenPriceModal] = useState(false);
  const [openDocModal, setOpenDocModal] = useState(false);
  const [selectedPkgId, setSelectedPkgId] = useState(null);

  // Forms
  const [pkgForm, setPkgForm] = useState({ type: 'CUT_TAPE', moq: 1, inventory: 0, leadTime: '', status: 'Active' });
  const [priceForm, setPriceForm] = useState({ qtyFrom: 1, qtyTo: '', price: 0 });
  const [docForm, setDocForm] = useState({ name: '', type: 'PDF', version: '1.0', file: null });

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

  // --- Handlers ---
  const handleSaveOverview = async () => {
    try {
      await productAdminService.updateProduct(id, product);
      toast.success('Product updated successfully!');
      fetchProduct();
    } catch (err) {
      toast.error('Failed to update product');
    }
  };

  const handleSavePkg = async () => {
    try {
      await productAdminService.addPackaging(id, pkgForm);
      setOpenPkgModal(false);
      toast.success('Packaging option added!');
      fetchProduct();
    } catch (err) {
      toast.error('Failed to add packaging');
    }
  };

  const handleDeletePkg = async (pkgId) => {
    if (!window.confirm("Are you sure you want to delete this packaging option?")) return;
    try {
      await productAdminService.deletePackaging(id, pkgId);
      toast.success('Packaging option deleted!');
      fetchProduct();
    } catch (err) {
      toast.error('Failed to delete packaging');
    }
  };

  const handleSavePrice = async () => {
    try {
      const payload = {
        currency: currency,
        qtyFrom: parseInt(priceForm.qtyFrom),
        qtyTo: priceForm.qtyTo ? parseInt(priceForm.qtyTo) : null,
        price: Math.round(parseFloat(priceForm.price) * 100) // minor units
      };
      await productAdminService.addPriceBreak(id, selectedPkgId, payload);
      setOpenPriceModal(false);
      toast.success('Price break added!');
      fetchProduct();
    } catch (err) {
      toast.error('Failed to add price break');
    }
  };

  const handleDeletePrice = async (pkgId, priceId) => {
    try {
      await productAdminService.deletePriceBreak(id, pkgId, priceId);
      toast.success('Price break deleted!');
      fetchProduct();
    } catch (err) {
      toast.error('Failed to delete price break');
    }
  };

  const handleSaveDoc = async () => {
    try {
      await productAdminService.addDocument(id, docForm);
      setOpenDocModal(false);
      toast.success('Document uploaded!');
      fetchProduct();
    } catch (err) {
      toast.error('Failed to upload document');
    }
  };

  const handleDeleteDoc = async (docId) => {
    try {
      await productAdminService.deleteDocument(id, docId);
      toast.success('Document deleted!');
      fetchProduct();
    } catch (err) {
      toast.error('Failed to delete document');
    }
  };

  const setPrimaryImage = async (imageId) => {
    try {
      await productAdminService.updateImage(id, imageId, { isPrimary: true });
      toast.success('Primary image updated');
      fetchProduct();
    } catch (err) {
      toast.error('Failed to update primary image');
    }
  };

  const deleteImage = async (imageId) => {
    try {
      await productAdminService.deleteImage(id, imageId);
      toast.success('Image deleted');
      fetchProduct();
    } catch (err) {
      toast.error('Failed to delete image');
    }
  };

  const convertPrice = (priceMinor, priceCurrency) => {
    const amount = priceMinor / 100;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: priceCurrency || currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading || !product) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>Loading...</Box>;
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link underline="hover" color="inherit" onClick={() => navigate('/admin/products')} sx={{ cursor: 'pointer' }}>
            Products
          </Link>
          <Typography color="text.primary">{product.name}</Typography>
        </Breadcrumbs>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/admin/products')} color="primary">
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {product.name}
            </Typography>
            <Chip 
              label={product.active ? "Active" : "Draft"} 
              color={product.active ? "success" : "default"}
              size="small" variant="contained"
            />
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="Overview" />
          <Tab label="Attributes" />
          <Tab label="Packaging" />
          <Tab label="Pricing" />
          <Tab label="Images" />
          <Tab label="Documents" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      {activeTab === 0 && (
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>General Information</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Product Name" value={product.name} onChange={(e) => setProduct({...product, name: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="SKU / MPN" value={product.sku} onChange={(e) => setProduct({...product, sku: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={product.category} label="Category" onChange={(e) => setProduct({...product, category: e.target.value})}>
                  <MenuItem value="Electronics">Electronics</MenuItem>
                  <MenuItem value="Hardware">Hardware</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Stock" type="number" value={product.stock} onChange={(e) => setProduct({...product, stock: e.target.value})} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={4} value={product.description} onChange={(e) => setProduct({...product, description: e.target.value})} />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel control={<Switch checked={product.active} onChange={(e) => setProduct({...product, active: e.target.checked})} />} label="Active Status" />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveOverview}>Save Changes</Button>
          </Box>
        </Paper>
      )}

      {/* Attributes Tab Placeholder */}
      {activeTab === 1 && (
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="h6" mb={2}>Product Attributes</Typography>
          <Typography color="text.secondary">Inherited from the selected category. Editable values go here.</Typography>
        </Paper>
      )}

      {/* Packaging Tab */}
      {activeTab === 2 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Packaging Options</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenPkgModal(true)}>Add Packaging</Button>
          </Box>
          <TableContainer component={Paper} sx={{ borderRadius: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>MOQ</TableCell>
                  <TableCell>Inventory</TableCell>
                  <TableCell>Lead Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(product.packaging || product.packagingOptions || []).map(pkg => (
                  <TableRow key={pkg.id}>
                    <TableCell fontWeight={600}>{pkg.type}</TableCell>
                    <TableCell>{pkg.moq}</TableCell>
                    <TableCell>{pkg.inventory}</TableCell>
                    <TableCell>{pkg.leadTime}</TableCell>
                    <TableCell><Chip label={pkg.status} size="small" color="primary" variant="outlined" /></TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="secondary"><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeletePkg(pkg.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Pricing Tab */}
      {activeTab === 3 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
            <Typography variant="h6">Price Breaks</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl size="small">
                <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  {currencies.map(c => (
                    <MenuItem key={c.code} value={c.code}>{c.displayName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {(product.packaging || product.packagingOptions || []).map(pkg => (
            <Paper key={pkg.id} sx={{ p: 2, mb: 3, borderRadius: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>Packaging: {pkg.type}</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={() => { setSelectedPkgId(pkg.id); setOpenPriceModal(true); }}>Add Price Break</Button>
              </Box>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Qty From</TableCell>
                    <TableCell>Qty To</TableCell>
                    <TableCell>Unit Price ({currency})</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(product.prices || []).filter(p => p.pkgId === pkg.id).map(price => (
                    <TableRow key={price.id}>
                      <TableCell>{price.qtyFrom}</TableCell>
                      <TableCell>{price.qtyTo || '∞'}</TableCell>
                      <TableCell fontWeight={600} color="primary.main">{convertPrice(price.price, price.currency)}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="error" onClick={() => handleDeletePrice(pkg.id, price.id)}><DeleteIcon fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(product.prices || []).filter(p => p.pkgId === pkg.id).length === 0 && (
                    <TableRow><TableCell colSpan={4} align="center">No price breaks defined.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>
          ))}
        </Box>
      )}

      {/* Images Tab */}
      {activeTab === 4 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Product Images</Typography>
            <Button variant="contained" component="label" startIcon={<UploadIcon />}>
              Upload Image
              <input type="file" hidden accept="image/*" />
            </Button>
          </Box>
          <Grid container spacing={3}>
            {(product.images || []).map(img => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={img.id}>
                <Paper sx={{ p: 1, borderRadius: 3, position: 'relative' }}>
                  <img src={img.url} alt={img.name} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8 }} />
                  {img.isPrimary && (
                    <Chip label="Primary" color="primary" size="small" sx={{ position: 'absolute', top: 16, left: 16 }} />
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, alignItems: 'center' }}>
                    <Typography variant="caption" noWrap sx={{ maxWidth: 120 }}>{img.name}</Typography>
                    <Box>
                      <Tooltip title={img.isPrimary ? "Primary Image" : "Set as Primary"}>
                        <IconButton size="small" onClick={() => setPrimaryImage(img.id)} color={img.isPrimary ? 'primary' : 'default'}>
                          {img.isPrimary ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <IconButton size="small" color="error" onClick={() => deleteImage(img.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Documents Tab */}
      {activeTab === 5 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Documents & Datasheets</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDocModal(true)}>Upload Document</Button>
          </Box>
          <TableContainer component={Paper} sx={{ borderRadius: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Date Uploaded</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(product.documents || []).map(doc => (
                  <TableRow key={doc.id}>
                    <TableCell fontWeight={600}>{doc.name}</TableCell>
                    <TableCell><Chip label={doc.type} size="small" /></TableCell>
                    <TableCell>{doc.version}</TableCell>
                    <TableCell>{doc.size}</TableCell>
                    <TableCell>{doc.date}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="secondary"><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteDoc(doc.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Modals */}
      {/* Packaging Modal */}
      <Dialog open={openPkgModal} onClose={() => setOpenPkgModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Packaging</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select value={pkgForm.type} onChange={(e) => setPkgForm({...pkgForm, type: e.target.value})} label="Type">
              {packagingTypes.map(pt => (
                <MenuItem key={pt.code} value={pt.code}>{pt.displayName}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Minimum Order Qty (MOQ)" type="number" fullWidth value={pkgForm.moq} onChange={(e) => setPkgForm({...pkgForm, moq: e.target.value})} />
          <TextField label="Inventory" type="number" fullWidth value={pkgForm.inventory} onChange={(e) => setPkgForm({...pkgForm, inventory: e.target.value})} />
          <TextField label="Lead Time" fullWidth value={pkgForm.leadTime} onChange={(e) => setPkgForm({...pkgForm, leadTime: e.target.value})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPkgModal(false)}>Cancel</Button>
          <Button onClick={handleSavePkg} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Price Break Modal */}
      <Dialog open={openPriceModal} onClose={() => setOpenPriceModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Price Break (Base: USD)</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Quantity From" type="number" fullWidth value={priceForm.qtyFrom} onChange={(e) => setPriceForm({...priceForm, qtyFrom: e.target.value})} />
          <TextField label="Quantity To (Leave empty for max)" type="number" fullWidth value={priceForm.qtyTo} onChange={(e) => setPriceForm({...priceForm, qtyTo: e.target.value})} />
          <TextField label={`Unit Price (${currency})`} type="number" fullWidth value={priceForm.price} onChange={(e) => setPriceForm({...priceForm, price: e.target.value})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPriceModal(false)}>Cancel</Button>
          <Button onClick={handleSavePrice} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Document Modal */}
      <Dialog open={openDocModal} onClose={() => setOpenDocModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Document Name" fullWidth value={docForm.name} onChange={(e) => setDocForm({...docForm, name: e.target.value})} />
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select value={docForm.type} onChange={(e) => setDocForm({...docForm, type: e.target.value})} label="Type">
              <MenuItem value="PDF">PDF</MenuItem>
              <MenuItem value="DOCX">DOCX</MenuItem>
              <MenuItem value="ZIP">ZIP</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Version" fullWidth value={docForm.version} onChange={(e) => setDocForm({...docForm, version: e.target.value})} />
          <Button variant="outlined" component="label" startIcon={<UploadIcon />}>
            Select File
            <input type="file" hidden />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDocModal(false)}>Cancel</Button>
          <Button onClick={handleSaveDoc} variant="contained">Upload</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default DashboardProductDetails;
