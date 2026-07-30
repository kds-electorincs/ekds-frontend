import { useRouter, useParams } from 'next/navigation';
"use client";
import React, { useState, useEffect } from 'react';

import {
  Box, Typography, Button, Paper, Tabs, Tab, IconButton, Breadcrumbs, Link,
  TextField, FormControl, InputLabel, Select, MenuItem, Grid, Switch, FormControlLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Avatar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon, Save as SaveIcon, Add as AddIcon,
  Edit as EditIcon, Delete as DeleteIcon, Upload as UploadIcon,
  Star as StarIcon, StarBorder as StarBorderIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { configAdminService, productAdminService, categoryAdminService, attributeAdminService, segmentAdminService } from '../../services/apiServices';
import useS3Upload from '../../hooks/useS3Upload';
import { validateUploadFile } from '../../utils/uploadValidation';

const CDN_BASE = import.meta.env?.VITE_CDN_BASE_URL || 'https://d1sswqar085ync.cloudfront.net';

const DashboardProductDetails = () => {
  const { id } = useParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState(0);
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [fileAttributes, setFileAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { uploadFile, isUploading } = useS3Upload();
  const [currency, setCurrency] = useState('USD');
  const [currencies, setCurrencies] = useState([{ code: 'USD', displayName: '$ US Dollar' }]);
  const [packagingTypes, setPackagingTypes] = useState([{ code: 'CUT_TAPE', displayName: 'Cut Tape' }]);
  const [exchangeRates, setExchangeRates] = useState(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        setExchangeRates(data.rates);
      } catch (err) {
        console.error("Failed to fetch exchange rates", err);
      }
    };
    fetchRates();
  }, []);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await productAdminService.getProduct(id);
      setProduct(res.data || res);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load product details');
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    const fetchConfig = async () => {
      try {
        const [currRes, pkgRes, catRes] = await Promise.all([
          configAdminService.getCurrencies(),
          configAdminService.getPackagingTypes(),
          categoryAdminService.listCategories({ page: 0, size: 100 })
        ]);
        setCurrencies(currRes.data || currRes);
        setPackagingTypes(pkgRes.data || pkgRes);
        setCategories(catRes.data?.content || catRes.content || []);
      } catch (err) {
        console.error('Failed to load catalog config', err);
      }
    };
    fetchConfig();
  }, [id]);

  useEffect(() => {
    if (product?.categoryId) {
      categoryAdminService.getCategory(product.categoryId).then(res => {
        const cat = res.data || res;
        const fileAttrs = [];
        const textAttrs = [];
        (cat.segments || []).forEach(seg => {
          (seg.attributes || []).forEach(attr => {
            if (attr.datatype === 'FILE') fileAttrs.push(attr);
            else textAttrs.push(attr);
          });
        });
        setFileAttributes(fileAttrs);

        setProduct(prev => {
          if (!prev) return prev;
          const newSpecs = { ...(prev.specs || {}) };
          let changed = false;
          textAttrs.forEach(attr => {
            if (newSpecs[attr.attrKey] === undefined) {
              newSpecs[attr.attrKey] = '';
              changed = true;
            }
          });
          if (changed) {
            return { ...prev, specs: newSpecs };
          }
          return prev;
        });
      }).catch(err => console.error(err));
    }
  }, [product?.categoryId]);



  // Modals state
  const [openPkgModal, setOpenPkgModal] = useState(false);
  const [openEditPkgModal, setOpenEditPkgModal] = useState(false);
  const [openPriceModal, setOpenPriceModal] = useState(false);
  const [openEditPriceModal, setOpenEditPriceModal] = useState(false);
  const [openDocModal, setOpenDocModal] = useState(false);
  const [openAttrModal, setOpenAttrModal] = useState(false);
  const [selectedPkgId, setSelectedPkgId] = useState(null);
  const [selectedPriceId, setSelectedPriceId] = useState(null);

  const [pkgForm, setPkgForm] = useState({ type: 'CUT_TAPE', moq: 1, inventory: 0, leadTime: '', status: 'Active' });
  const [priceForm, setPriceForm] = useState({ qtyLimit: 1, price: 0, currency: 'USD' });
  const [docForm, setDocForm] = useState({ name: '', attributeId: '', file: null });
  const [newAttrName, setNewAttrName] = useState('');

  const [imgUploadError, setImgUploadError] = useState('');
  const [docUploadError, setDocUploadError] = useState('');

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

  // --- Handlers ---
  const handleSaveOverview = async () => {
    try {
      const payload = {
        name: product.name,
        mpn: product.mpn,
        manufacturer: product.manufacturer || "Default",
        description: product.description || "",
        categoryId: parseInt(product.categoryId),
        restockLeadDays: product.restockLeadDays || 0,
        active: product.active,
        specs: product.specs || {}
      };

      if (product.categoryId && product.specs) {
        try {
          const catRes = await categoryAdminService.getCategory(product.categoryId);
          const category = catRes.data || catRes;
          
          const existingAttrKeys = (category.segments || []).flatMap(s => s.attributes || []).map(a => a.attrKey);
          const specKeys = Object.keys(product.specs);
          const missingKeys = specKeys.filter(k => !existingAttrKeys.includes(k));
          
          if (missingKeys.length > 0) {
            let targetSegmentId = null;
            if (category.segments && category.segments.length > 0) {
              targetSegmentId = category.segments[0].id;
            } else {
              const segRes = await segmentAdminService.createSegment(product.categoryId, {
                name: 'General',
                description: 'General attributes',
                displayOrder: 0
              });
              const newSeg = segRes.data || segRes;
              targetSegmentId = newSeg.id;
            }
            
            for (const key of missingKeys) {
              await attributeAdminService.createAttribute(product.categoryId, targetSegmentId, {
                attrKey: key,
                datatype: 'TEXT',
                filterable: false,
                searchable: false,
                required: false,
                displayOrder: 0
              });
            }
          }
        } catch (err) {
          console.error("Failed to sync missing attributes to category", err);
        }
      }

      await productAdminService.updateProduct(id, payload);
      toast.success('Product updated successfully!');
      fetchProduct();
    } catch (err) {
      toast.error('Failed to update product');
    }
  };

  const handleSavePkg = async () => {
    try {
      const payload = {
        packagingType: pkgForm.type,
        currentQuantity: parseInt(pkgForm.inventory) || 0,
        priceBreaks: [] // You can add price break form logic later
      };
      await productAdminService.addPackaging(id, payload);
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

  const handleUpdatePkg = async () => {
    try {
      const payload = {
        currentQuantity: parseInt(pkgForm.inventory) || 0,
        active: pkgForm.status === 'Active'
      };
      await productAdminService.updatePackaging(id, selectedPkgId, payload);
      setOpenEditPkgModal(false);
      toast.success('Packaging option updated!');
      fetchProduct();
    } catch (err) {
      toast.error('Failed to update packaging');
    }
  };

  const handleSavePrice = async () => {
    try {
      const payload = {
        currency: priceForm.currency,
        minQuantity: parseInt(priceForm.qtyLimit),
        unitPriceMinor: Math.round(parseFloat(priceForm.price) * 100)
      };
      await productAdminService.addPriceBreak(id, selectedPkgId, payload);
      setOpenPriceModal(false);
      toast.success('Price break added!');
      fetchProduct();
    } catch (err) {
      toast.error('Failed to add price break');
    }
  };

  const handleUpdatePrice = async () => {
    try {
      const payload = {
        currency: priceForm.currency,
        minQuantity: parseInt(priceForm.qtyLimit),
        unitPriceMinor: Math.round(parseFloat(priceForm.price) * 100)
      };
      await productAdminService.updatePriceBreak(id, selectedPkgId, selectedPriceId, payload);
      setOpenEditPriceModal(false);
      toast.success('Price break updated!');
      fetchProduct();
    } catch (err) {
      toast.error('Failed to update price break');
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
    if (!docForm.file || !docForm.attributeId) {
      setDocUploadError('Please select a file and a document type.');
      return;
    }

    const error = validateUploadFile(docForm.file, 'document');
    if (error) {
      setDocUploadError(error);
      setDocForm({ ...docForm, file: null });
      return;
    }
    setDocUploadError('');

    try {
      toast.info('Uploading document...', { autoClose: 2000 });
      const objectKey = await uploadFile(docForm.file, 'PRODUCT_DOCUMENT');

      const payload = {
        attributeId: docForm.attributeId,
        objectKey: objectKey,
        displayName: docForm.name || docForm.file.name,
        contentType: docForm.file.type || 'application/octet-stream',
        fileSize: docForm.file.size,
        file_size: docForm.file.size
      };

      await productAdminService.addDocument(id, payload);
      setOpenDocModal(false);
      setDocForm({ name: '', attributeId: '', file: null });
      toast.success('Document uploaded!');
      fetchProduct();
    } catch (err) {
      toast.error('Failed to upload document');
    }
  };

  const handleUploadImage = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    for (let file of files) {
      const error = validateUploadFile(file, 'image');
      if (error) {
        setImgUploadError(`Error in file ${file.name}: ${error}`);
        e.target.value = '';
        return;
      }
    }
    setImgUploadError('');

    try {
      toast.info(`Uploading ${files.length} image(s)...`, { autoClose: 2000 });

      let currentImageCount = (product.images || []).length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const objectKey = await uploadFile(file, 'PRODUCT_IMAGE');

        const payload = {
          objectKey: objectKey,
          displayOrder: currentImageCount + i,
          isPrimary: currentImageCount === 0 && i === 0
        };
        await productAdminService.addImage(id, payload);
      }

      toast.success('Images uploaded successfully!');
      fetchProduct();
    } catch (err) {
      toast.error('Failed to upload one or more images');
    } finally {
      e.target.value = '';
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
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

  const convertPrice = (priceMinor, baseCurrency) => {
    const amount = priceMinor / 100;
    const targetCurrency = currency;

    // Fallback if rates aren't loaded or it's the exact same currency
    if (!exchangeRates || baseCurrency === targetCurrency) {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: baseCurrency || 'USD',
        minimumFractionDigits: 2
      }).format(amount);
    }

    const rateBase = exchangeRates[baseCurrency] || 1;
    const rateTarget = exchangeRates[targetCurrency] || 1;

    // 1. Convert to target currency
    let convertedAmount = amount * (rateTarget / rateBase);

    // 2. Add FX buffer (2%)
    const FX_BUFFER = 1.02;
    let bufferedAmount = convertedAmount * FX_BUFFER;

    // 3. Round to nearest .99 to protect margins (e.g. 117.65 -> 119.99)
    let finalAmount = Math.ceil(bufferedAmount) - 0.01;
    if (finalAmount < 0) finalAmount = 0;

    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: targetCurrency,
      minimumFractionDigits: 2
    }).format(finalAmount);
  };

  if (loading || !product) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>Loading...</Box>;
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link underline="hover" color="inherit" onClick={() => router.push('/admin/products')} sx={{ cursor: 'pointer' }}>
            Products
          </Link>
          <Typography color="text.primary">{product.name}</Typography>
        </Breadcrumbs>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => router.push('/admin/products')} color="primary">
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
              <TextField fullWidth label="Product Name" value={product.name || ''} onChange={(e) => setProduct({ ...product, name: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="SKU / MPN" value={product.mpn || ''} onChange={(e) => setProduct({ ...product, mpn: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={product.categoryId || ''} label="Category" onChange={(e) => setProduct({ ...product, categoryId: e.target.value })}>
                  {categories.map(cat => (
                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Stock" type="number" disabled value={product.totalStock || 0} helperText="Stock is calculated from active packaging options" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={4} value={product.description || ''} onChange={(e) => setProduct({ ...product, description: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel control={<Switch checked={product.active !== false} onChange={(e) => setProduct({ ...product, active: e.target.checked })} />} label="Active Status" />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveOverview}>Save Changes</Button>
          </Box>
        </Paper>
      )}

      {/* Attributes Tab */}
      {activeTab === 1 && (
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Product Attributes</Typography>
            <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => setOpenAttrModal(true)}>Add Attribute</Button>
          </Box>
          <Grid container spacing={3}>
            {Object.entries(product.specs || {}).map(([key, val]) => (
              <Grid item xs={12} md={6} key={key}>
                <TextField
                  fullWidth
                  label={key}
                  value={val || ''}
                  onChange={(e) => setProduct({
                    ...product,
                    specs: { ...(product.specs || {}), [key]: e.target.value }
                  })}
                />
              </Grid>
            ))}
            {Object.keys(product.specs || {}).length === 0 && (
              <Grid item xs={12}>
                <Typography color="text.secondary">No attributes defined yet.</Typography>
              </Grid>
            )}
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveOverview}>Save Attributes</Button>
          </Box>
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
                    <TableCell fontWeight={600}>{pkg.displayName || pkg.packagingType}</TableCell>
                    <TableCell>{pkg.priceBreaks && pkg.priceBreaks.length > 0 ? pkg.priceBreaks[0].minQuantity : 'N/A'}</TableCell>
                    <TableCell>{pkg.currentQuantity}</TableCell>
                    <TableCell>{product.restockLeadDays || 0} Days</TableCell>
                    <TableCell>
                      <Chip label={pkg.active !== false ? 'Active' : 'Inactive'} size="small" color={pkg.active !== false ? "success" : "default"} variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="secondary" onClick={() => {
                        setSelectedPkgId(pkg.id);
                        setPkgForm({ type: pkg.packagingType, inventory: pkg.currentQuantity, status: pkg.active !== false ? 'Active' : 'Inactive' });
                        setOpenEditPkgModal(true);
                      }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
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

          {!(product.packaging || product.packagingOptions || []).length && (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4, mt: 2 }}>
              <Typography variant="body1" color="text.secondary">
                No packaging options found. Please add a packaging option in the "Packaging" tab first to configure price breaks.
              </Typography>
            </Paper>
          )}

          {(product.packaging || product.packagingOptions || []).map(pkg => (
            <Paper key={pkg.id} sx={{ p: 2, mb: 3, borderRadius: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>Packaging: {pkg.displayName || pkg.packagingType}</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={() => {
                  setSelectedPkgId(pkg.id);
                  setPriceForm({ qtyLimit: 1, price: 0, currency: 'USD' });
                  setOpenPriceModal(true);
                }}>Add Price Break</Button>
              </Box>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Upper Limit</TableCell>
                    <TableCell>Unit Price ({currency})</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(pkg.priceBreaks || []).map(price => (
                    <TableRow key={price.id}>
                      <TableCell>{price.minQuantity}</TableCell>
                      <TableCell fontWeight={600} color="primary.main">{convertPrice(price.unitPriceMinor, price.currency)}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="secondary" onClick={() => {
                          setSelectedPkgId(pkg.id);
                          setSelectedPriceId(price.id);
                          setPriceForm({ qtyLimit: price.minQuantity, price: (price.unitPriceMinor / 100).toFixed(2), currency: price.currency || 'USD' });
                          setOpenEditPriceModal(true);
                        }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeletePrice(pkg.id, price.id)}><DeleteIcon fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(pkg.priceBreaks || []).length === 0 && (
                    <TableRow><TableCell colSpan={3} align="center">No price breaks defined.</TableCell></TableRow>
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
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, textAlign: 'right' }}>
                Accepted formats: JPEG, PNG, WebP · Max size: 2 MB
              </Typography>
              <Button variant="contained" component="label" startIcon={<UploadIcon />} disabled={isUploading} sx={{ float: 'right' }}>
                {isUploading ? 'Uploading...' : 'Upload Image'}
                <input type="file" hidden multiple accept="image/*" onChange={handleUploadImage} />
              </Button>
              {imgUploadError && (
                <Typography color="error" variant="body2" sx={{ display: 'block', clear: 'both', pt: 1, textAlign: 'right' }}>
                  {imgUploadError}
                </Typography>
              )}
            </Box>
          </Box>
          <Grid container spacing={3}>
            {(product.images || []).map(img => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={img.id}>
                <Paper sx={{ p: 1, borderRadius: 3, position: 'relative' }}>
                  <img src={img.url || `${CDN_BASE}/${img.objectKey}`} alt={img.name || 'Product Image'} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8 }} />
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
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(product.documents || []).map(doc => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <Link href={`${CDN_BASE}/${doc.objectKey}`} target="_blank" rel="noreferrer" underline="hover" sx={{ display: 'flex', alignItems: 'center', color: 'inherit' }}>
                        <DescriptionIcon color="action" sx={{ mr: 1 }} />
                        {doc.displayName || doc.objectKey}
                      </Link>
                    </TableCell>
                    <TableCell>{doc.contentType}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="error" onClick={() => handleDeleteDoc(doc.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {/* <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 2, overflow: 'auto' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Debug: Product Object</Typography>
            <pre style={{ margin: 0, fontSize: '12px' }}>{JSON.stringify(product, null, 2)}</pre>
          </Box> */}
        </Box>
      )}

      {/* Modals */}
      {/* Packaging Modal */}
      <Dialog open={openPkgModal} onClose={() => setOpenPkgModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Packaging</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select value={pkgForm.type} onChange={(e) => setPkgForm({ ...pkgForm, type: e.target.value })} label="Type">
              {packagingTypes.map(pt => (
                <MenuItem key={pt.code} value={pt.code}>{pt.displayName}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Minimum Order Qty (MOQ)" type="number" fullWidth value={pkgForm.moq} onChange={(e) => setPkgForm({ ...pkgForm, moq: e.target.value })} />
          <TextField label="Inventory" type="number" fullWidth value={pkgForm.inventory} onChange={(e) => setPkgForm({ ...pkgForm, inventory: e.target.value })} />
          <TextField label="Lead Time" fullWidth value={pkgForm.leadTime} onChange={(e) => setPkgForm({ ...pkgForm, leadTime: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPkgModal(false)}>Cancel</Button>
          <Button onClick={handleSavePkg} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Packaging Modal */}
      <Dialog open={openEditPkgModal} onClose={() => setOpenEditPkgModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Packaging Option</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Inventory"
              fullWidth
              type="number"
              value={pkgForm.inventory}
              onChange={(e) => setPkgForm({ ...pkgForm, inventory: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={pkgForm.status}
                onChange={(e) => setPkgForm({ ...pkgForm, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditPkgModal(false)}>Cancel</Button>
          <Button onClick={handleUpdatePkg} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

      {/* Price Break Modal */}
      <Dialog open={openPriceModal} onClose={() => setOpenPriceModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Price Break</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Currency</InputLabel>
            <Select
              label="Currency"
              value={priceForm.currency}
              onChange={(e) => setPriceForm({ ...priceForm, currency: e.target.value })}
            >
              {currencies.map(c => (
                <MenuItem key={c.id || c.code} value={c.code}>{c.code}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Upper Limit (Max Qty)" type="number" fullWidth value={priceForm.qtyLimit} onChange={(e) => setPriceForm({ ...priceForm, qtyLimit: e.target.value })} />
          <TextField label={`Unit Price (${priceForm.currency})`} type="number" fullWidth value={priceForm.price} onChange={(e) => setPriceForm({ ...priceForm, price: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPriceModal(false)}>Cancel</Button>
          <Button onClick={handleSavePrice} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Price Break Modal */}
      <Dialog open={openEditPriceModal} onClose={() => setOpenEditPriceModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Price Break</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select
                label="Currency"
                value={priceForm.currency}
                onChange={(e) => setPriceForm({ ...priceForm, currency: e.target.value })}
              >
                {currencies.map(c => (
                  <MenuItem key={c.id || c.code} value={c.code}>{c.code}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Upper Limit (Max Qty)"
              fullWidth
              type="number"
              value={priceForm.qtyLimit}
              onChange={(e) => setPriceForm({ ...priceForm, qtyLimit: e.target.value })}
            />
            <TextField
              label={`Unit Price (${priceForm.currency})`}
              fullWidth
              type="number"
              value={priceForm.price}
              onChange={(e) => setPriceForm({ ...priceForm, price: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditPriceModal(false)}>Cancel</Button>
          <Button onClick={handleUpdatePrice} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

      {/* Document Modal */}
      <Dialog open={openDocModal} onClose={() => setOpenDocModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Document Name" fullWidth value={docForm.name} onChange={(e) => setDocForm({ ...docForm, name: e.target.value })} placeholder="Optional: defaults to file name" />
          <FormControl fullWidth>
            <InputLabel>Document Type</InputLabel>
            <Select value={docForm.attributeId} onChange={(e) => setDocForm({ ...docForm, attributeId: e.target.value })} label="Document Type">
              {fileAttributes.length === 0 && <MenuItem disabled value="">No file attributes found in category</MenuItem>}
              {fileAttributes.map(attr => (
                <MenuItem key={attr.id} value={attr.id}>{attr.attrKey}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Accepted formats: PDF · Max size: 10 MB
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button variant="outlined" component="label" startIcon={<UploadIcon />}>
                Select File
                <input type="file" hidden onChange={(e) => {
                  setDocUploadError('');
                  setDocForm({ ...docForm, file: e.target.files[0] });
                }} />
              </Button>
              {docForm.file && <Typography variant="body2">{docForm.file.name}</Typography>}
            </Box>
            {docUploadError && (
              <Typography color="error" variant="body2">
                {docUploadError}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDocModal(false)}>Cancel</Button>
          <Button onClick={handleSaveDoc} variant="contained">Upload</Button>
        </DialogActions>
      </Dialog>

      {/* Attribute Modal */}
      <Dialog open={openAttrModal} onClose={() => setOpenAttrModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add New Attribute</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Attribute Name"
            fullWidth
            value={newAttrName}
            onChange={(e) => setNewAttrName(e.target.value)}
            placeholder="e.g. Color, Weight, Material"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAttrModal(false)}>Cancel</Button>
          <Button
            onClick={async () => {
              if (newAttrName.trim()) {
                const attrName = newAttrName.trim();
                setProduct({ ...product, specs: { ...(product.specs || {}), [attrName]: "" } });
                setNewAttrName('');
                setOpenAttrModal(false);

                if (product.categoryId) {
                  try {
                    const catRes = await categoryAdminService.getCategory(product.categoryId);
                    const category = catRes.data || catRes;

                    let targetSegmentId = null;
                    if (category.segments && category.segments.length > 0) {
                      targetSegmentId = category.segments[0].id;
                    } else {
                      const segRes = await segmentAdminService.createSegment(product.categoryId, {
                        name: 'General',
                        description: 'General attributes',
                        displayOrder: 0
                      });
                      const newSeg = segRes.data || segRes;
                      targetSegmentId = newSeg.id;
                    }

                    const existingAttr = (category.segments || []).flatMap(s => s.attributes || []).find(a => a.attrKey === attrName);

                    if (!existingAttr && targetSegmentId) {
                      await attributeAdminService.createAttribute(product.categoryId, targetSegmentId, {
                        attrKey: attrName,
                        datatype: 'TEXT',
                        filterable: false,
                        searchable: false,
                        required: false,
                        displayOrder: 0
                      });
                      toast.success(`Attribute '${attrName}' synced to category.`);
                    }
                  } catch (err) {
                    console.error("Failed to add attribute to category", err);
                    toast.error("Attribute added locally, but failed to sync to category.");
                  }
                }
              }
            }}
            variant="contained"
            disabled={!newAttrName.trim()}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardProductDetails;
