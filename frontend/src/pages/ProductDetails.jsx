import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Grid, Typography, Box, Button, Divider, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, IconButton,
  CircularProgress, Breadcrumbs, Tab, Tabs, TextField, Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as ShoppingCartIcon,
  Download as DownloadIcon,
  VerifiedUser as VerifiedIcon,
  NavigateNext as NavigateNextIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import notification from '../utils/notification';
import { productPublicService, categoryPublicService } from '../services/apiServices';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import ProductCard from '../components/ProductCard';
import { formatPrice, getTierForQty, CONTACT_US } from '../utils/priceUtils';

const CDN_BASE = import.meta.env.VITE_CDN_BASE_URL || 'https://d1sswqar085ync.cloudfront.net';

const ProductDetails = () => {
  const { id } = useParams();
  useNavigate(); // kept for potential future use
  const { addToCart } = useCart();
  const { currency } = useCurrency();
  
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedPkgIdx, setSelectedPkgIdx] = useState(0); // selected packaging option index
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchComponentSpecification = async () => {
      setLoading(true);
      setError(false);
      try {
        const requestedCurrency = currency || 'INR';
        let prod;
        try {
          prod = await productPublicService.getProduct(id, { currency: requestedCurrency });
        } catch (priceErr) {
          // Currency guide §8: 503 = no live FX rate for this currency yet
          // (transient). Fall back to INR rather than failing the whole page.
          if (priceErr?.response?.status === 503 && requestedCurrency !== 'INR') {
            prod = await productPublicService.getProduct(id, { currency: 'INR' });
          } else {
            throw priceErr;
          }
        }
        const item = prod?.data || prod;
        setProduct(item);

        if (item?.categoryId) {
          try {
            const catRes = await categoryPublicService.getCategory(item.categoryId);
            setCategory(catRes?.data || catRes);
          } catch (cErr) {
            console.warn("Could not synchronize category schema:", cErr);
          }
        }

        if (item.packagingOptions && item.packagingOptions.length > 0) {
          const firstPkg = item.packagingOptions[0];
          setQuantity(firstPkg.minOrderQuantity ?? 1);
          setSelectedPkgIdx(0);
        }

        // Fetch related series inventory
        try {
          const relatedRes = await productPublicService.listProducts({ limit: 4, size: 4 });
          const relatedItems = relatedRes?.content || relatedRes?.data?.content || relatedRes?.data || [];
          setRelatedProducts(Array.isArray(relatedItems) ? relatedItems.filter(p => String(p.id || p._id) !== String(item.id || item._id)) : []);
        } catch (rErr) {
          console.error("Failed to load related series inventory:", rErr);
        }
      } catch (err) {
        console.error("Failed to synchronize component specifications:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchComponentSpecification();
  }, [id, currency]);

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 16 }}>
      <CircularProgress size={44} color="primary" />
      <Typography variant="body1" sx={{ mt: 2, fontWeight: 700 }}>Retrieving Certified Component Specification Datasheet...</Typography>
    </Box>
  );
  
  if (error || !product) return (
    <Box sx={{ py: 12, textAlign: 'center' }}>
      <Typography variant="h5" color="error" sx={{ fontWeight: 800 }}>Component Record Unavailable</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>The requested part number could not be retrieved from the enterprise server.</Typography>
      <Button component={RouterLink} to="/products" variant="contained">Return to Master Catalog</Button>
    </Box>
  );

  // Field mapping to real backend attributes
  const name = product.name || product.title || 'Component Specification Pending';
  const partNumber = product.partNumber || product.mpn || product.sku || `PART-${product.id || product._id || id}`;
  const manufacturer = product.brand || product.manufacturer || (typeof product.category === 'object' ? product.category?.name : 'Verified MFR');
  const stock = product.totalStock !== undefined ? product.totalStock : (product.stock || product.quantity || 0);
  const description = product.description || product.shortDescription || 'Certified precision electronic component engineered for industrial hardware applications.';

  // Section 8.5 Stock Display Logic
  const renderStockInfo = (prod) => {
    if ((prod?.totalStock !== undefined ? prod.totalStock : (prod?.stock || 0)) > 0) {
      return `${prod.totalStock ?? prod.stock} Units immediately available`;
    } else if (prod?.restockLeadDays != null) {
      return prod.restockLeadDays === 0 ? 'Ships same day' : `Ships in ${prod.restockLeadDays} days`;
    }
    return 'Contact for availability';
  };
  const stockText = renderStockInfo(product);

  const imageArray = Array.isArray(product.images) && product.images.length > 0
    ? product.images.map(img => img.url || `${CDN_BASE}/${img.objectKey}`)
    : [product.primaryImageUrl || product.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600'];

  // Resolve selected packaging option (may have multiple: CUT_TAPE, FULL_REEL, etc.)
  const packagingOptions = product.packagingOptions || [];
  const selectedPkg = packagingOptions[selectedPkgIdx] || packagingOptions[0] || null;

  // priceScale sits at the response level (guide §2) — read it, never hardcode 10000.
  const priceScale = product.priceScale ?? 4;
  const displayCurrency = product.currency || currency || 'INR';

  const moq  = selectedPkg?.minOrderQuantity ?? product.minOrderQuantity ?? 1;
  const step = selectedPkg?.orderMultiple   ?? product.orderMultiple   ?? 1;

  // Real field is packagingOptions[].priceBreaks (guide §5) — not "prices".
  // Empty priceBreaks means the product isn't directly purchasable yet;
  // "Contact us" is handled by priceUtils' formatters returning that
  // sentinel for a null/undefined scaled value, so no synthetic tiers are
  // fabricated here.
  const rawPriceBreaks = selectedPkg?.priceBreaks || [];
  const priceBreaks = rawPriceBreaks.map((pb) => ({
    qty: `${pb.minQuantity}+`,
    unitPriceScaled: pb.unitPriceScaled,
    minQuantity: pb.minQuantity,
  }));

  // Tier applicable to the currently selected order quantity (guide §5:
  // highest minQuantity <= qty).
  const currentTier = getTierForQty(rawPriceBreaks, Number(quantity) || moq);

  const handleAddToCart = async () => {
    // Must have a packaging option to add (packagingOptionId is the cart URL key)
    if (!selectedPkg?.id) {
      notification.warning('No packaging option available for this product.');
      return;
    }
    try {
      setAddingToCart(true);
      // POST /api/cart/items — increments if line already exists
      await addToCart(selectedPkg.id, Number(quantity) || moq);
      // toggleCartDrawer is called inside addToCart on success
    } catch (err) {
      // Error toast is handled inside CartContext
      console.error('[ProductDetails] handleAddToCart failed:', err?.message);
    } finally {
      setAddingToCart(false);
    }
  };

  // Stepper helpers — respects MOQ floor and orderMultiple step
  const handleQtyDown = () => {
    const next = Number(quantity) - step;
    if (next < moq) return;
    setQuantity(next);
  };

  const handleQtyUp = () => {
    setQuantity(Number(quantity) + step);
  };

  const handleQtyInput = (e) => {
    const raw = Number(e.target.value);
    if (!Number.isInteger(raw) || raw < 1) return;
    setQuantity(raw);
  };

  const handleCopyPartNumber = () => {
    navigator.clipboard.writeText(partNumber);
    notification.info(`Part Number ${partNumber} copied to clipboard!`);
  };

  return (
    <Box sx={{ pb: 10 }}>
      {/* 1. Breadcrumbs Header */}
      <Box sx={{ py: 2, borderBottom: '1px solid #D6E4EE', mb: 3 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          <RouterLink to="/" style={{ color: '#5F86A6', textDecoration: 'none', fontWeight: 600, fontSize: '0.8125rem' }}>
            Procurement Portal
          </RouterLink>
          <RouterLink to="/products" style={{ color: '#5F86A6', textDecoration: 'none', fontWeight: 600, fontSize: '0.8125rem' }}>
            Component Catalog
          </RouterLink>
          <Typography color="primary" sx={{ fontWeight: 800, fontSize: '0.8125rem', fontFamily: 'monospace' }}>
            {partNumber}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* 2. Primary Product Procurement Command Area */}
      <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, bgcolor: '#ffffff', border: '1px solid #D6E4EE', borderRadius: 2, mb: 4 }}>
        <Grid container spacing={5}>
          
          {/* Left Column: Image Inspection Gallery */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ width: '100%', height: 380, bgcolor: '#f8fafc', border: '1px solid #D6E4EE', borderRadius: 1.5, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, position: 'relative' }}>
              <Box component="img" src={imageArray[activeImageIndex]} alt={name} sx={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
              <Chip label={stock > 0 ? "🟢 READY TO DISPATCH" : (product.restockLeadDays != null ? `🟠 SHIPS IN ${product.restockLeadDays} DAYS` : "🟠 CONTACT FOR AVAILABILITY")} sx={{ position: 'absolute', bottom: 12, left: 12, fontWeight: 800, fontSize: '0.75rem', bgcolor: '#ffffff', border: '1px solid #D6E4EE' }} />
            </Box>

            {/* Thumbnails Strip */}
            {imageArray.length > 1 && (
              <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1 }}>
                {imageArray.map((imgUrl, i) => (
                  <Box
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    sx={{
                      width: 72,
                      height: 58,
                      borderRadius: 1,
                      border: activeImageIndex === i ? '2px solid #243A5E' : '1px solid #D6E4EE',
                      p: 0.5,
                      bgcolor: '#f8fafc',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: activeImageIndex === i ? 1 : 0.6,
                      '&:hover': { opacity: 1 }
                    }}
                  >
                    <Box component="img" src={imgUrl} alt="thumbnail" sx={{ maxHeight: '100%', maxWidth: '100%' }} />
                  </Box>
                ))}
              </Box>
            )}

            {/* Technical Document Action Downloads */}
            <Box sx={{ mt: 3, p: 2, bgcolor: '#EDF4FA', borderRadius: 1, border: '1px solid #D6E4EE', display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', textTransform: 'uppercase' }}>
                Engineering Datasheets & CAD Footprints
              </Typography>
              {(product.documents && product.documents.length > 0) ? (
                product.documents.map((doc, idx) => (
                  <Button 
                    key={doc.id || idx}
                    component="a"
                    href={`https://d1sswqar085ync.cloudfront.net/${doc.objectKey}`}
                    target="_blank"
                    rel="noreferrer"
                    variant="outlined" 
                    size="small" 
                    startIcon={<DownloadIcon />} 
                    sx={{ bgcolor: '#ffffff', fontWeight: 700, justifyContent: 'flex-start', textAlign: 'left', textTransform: 'none' }}
                  >
                    Download {doc.displayName || doc.attrKey || 'Official Datasheet'} (PDF)
                  </Button>
                ))
              ) : (
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<DownloadIcon />} 
                  onClick={() => notification.info('Generating PDF datasheet export...')}
                  sx={{ bgcolor: '#ffffff', fontWeight: 700, justifyContent: 'flex-start', textAlign: 'left' }}
                >
                  Download Official OEM Datasheet (PDF)
                </Button>
              )}
            </Box>
          </Grid>

          {/* Center Column: Technical Identifiers & Volume Pricing */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 1.5 }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'secondary.dark', textTransform: 'uppercase', fontSize: '0.8125rem' }}>
                  MFR: {typeof manufacturer === 'string' ? manufacturer : 'Industrial Partner'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
                    {partNumber}
                  </Typography>
                  <IconButton size="small" onClick={handleCopyPartNumber} sx={{ color: 'text.secondary', border: '1px solid #D6E4EE' }} aria-label="copy product part number to clipboard">
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="h6" color="text.primary" sx={{ fontWeight: 700, mt: 1 }}>
                  {name}
                </Typography>
              </Box>
              <Chip label="ISO 9001:2015 COMPLIANT" sx={{ bgcolor: 'primary.dark', color: 'secondary.light', fontWeight: 800, fontSize: '0.7rem' }} />
            </Box>

            <Divider sx={{ my: 2.5 }} />

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6, fontSize: '0.9375rem' }}>
              {description}
            </Typography>

            {/* B2B Volume Price Breakdown Table */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', textTransform: 'uppercase', mb: 1 }}>
              B2B Volume Price Breaks ({displayCurrency})
            </Typography>
            {priceBreaks.length === 0 ? (
              <Paper elevation={0} sx={{ border: '1px solid #D6E4EE', mb: 4, borderRadius: 1, p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                  {CONTACT_US} for pricing on this component.
                </Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #D6E4EE', mb: 4, borderRadius: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#EDF4FA' }}>
                      <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>Quantity Bracket</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>Unit Price</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>Extended Savings</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {priceBreaks.map((breakItem, idx) => {
                      const baseUnitScaled = priceBreaks[0].unitPriceScaled;
                      const savingsPct = idx > 0 && baseUnitScaled
                        ? Math.round((1 - breakItem.unitPriceScaled / baseUnitScaled) * 100)
                        : 0;
                      return (
                        <TableRow key={breakItem.minQuantity} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>{breakItem.qty} Units</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: 'primary.dark', fontSize: '0.9375rem' }}>
                            {formatPrice(breakItem.unitPriceScaled, priceScale, displayCurrency)}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, color: idx > 0 ? 'success.main' : 'text.secondary' }}>
                            {idx > 0 && savingsPct > 0 ? `${savingsPct}% Volume Saving` : 'Base Rate'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Procurement Cart Dispatch Box */}
            <Paper elevation={0} sx={{ p: 3, bgcolor: '#EDF4FA', border: '2px solid #243A5E', borderRadius: 1.5 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid size={{ xs: 12, sm: 5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', textTransform: 'uppercase' }}>
                    DESIRED ORDER QUANTITY
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Tooltip title={`Min: ${moq}`}>
                      <span>
                        <IconButton
                          size="small"
                          onClick={handleQtyDown}
                          disabled={Number(quantity) <= moq}
                          sx={{ bgcolor: '#ffffff', border: '1px solid #D6E4EE' }}
                        >
                          <RemoveIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <TextField
                      value={quantity}
                      onChange={handleQtyInput}
                      size="small"
                      sx={{ width: 80, mx: 1, bgcolor: '#ffffff' }}
                      slotProps={{
                        htmlInput: { min: moq, style: { textAlign: 'center', fontWeight: 'bold', fontSize: '1rem' } }
                      }}
                    />
                    <Tooltip title={`Step: ${step}`}>
                      <IconButton
                        size="small"
                        onClick={handleQtyUp}
                        sx={{ bgcolor: '#ffffff', border: '1px solid #D6E4EE' }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                    MOQ: {moq} · Step: {step} units
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.dark', mt: 1 }}>
                    {currentTier
                      ? `${formatPrice(currentTier.unitPriceScaled, priceScale, displayCurrency)} / unit`
                      : CONTACT_US}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 7 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={addingToCart ? <CircularProgress size={18} color="inherit" /> : <ShoppingCartIcon />}
                      onClick={handleAddToCart}
                      disabled={addingToCart || !selectedPkg?.id}
                      sx={{ py: 1.5, fontSize: '0.9375rem', fontWeight: 800, width: '100%', boxShadow: '0 4px 12px rgba(36, 58, 94, 0.2)' }}
                    >
                      {addingToCart ? 'ADDING…' : 'ADD TO PROCUREMENT CART'}
                    </Button>
                    <Button
                      component={RouterLink}
                      to="/user/quotations"
                      variant="outlined"
                      color="primary"
                      size="small"
                      sx={{ fontWeight: 800, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                    >
                      REQUEST CUSTOM OEM BOM QUOTATION
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* 3. Detailed Engineering Specification Tabs */}
      <Paper elevation={0} sx={{ bgcolor: '#ffffff', border: '1px solid #D6E4EE', borderRadius: 2, mb: 6, overflow: 'hidden' }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ bgcolor: '#EDF4FA', borderBottom: '1px solid #D6E4EE', px: 3 }}>
          <Tab label="Technical Specifications Table" sx={{ fontWeight: 800, fontSize: '0.875rem' }} />
          <Tab label="Environmental & Regulatory Compliance" sx={{ fontWeight: 800, fontSize: '0.875rem' }} />
          <Tab label="Packaging & Shipping Data" sx={{ fontWeight: 800, fontSize: '0.875rem' }} />
        </Tabs>

        <Box sx={{ p: { xs: 3, md: 4 } }}>
          {activeTab === 0 && (
            <TableContainer>
              <Table size="small">
                <TableBody>
                  <TableRow><TableCell sx={{ fontWeight: 800, width: '30%', bgcolor: '#EDF4FA' }}>Manufacturer Part Number (MPN)</TableCell><TableCell sx={{ fontWeight: 700, fontFamily: 'monospace' }}>{partNumber}</TableCell></TableRow>
                  <TableRow><TableCell sx={{ fontWeight: 800, bgcolor: '#EDF4FA' }}>Primary Manufacturer / Brand</TableCell><TableCell sx={{ fontWeight: 600 }}>{typeof manufacturer === 'string' ? manufacturer : 'Industrial Partner'}</TableCell></TableRow>
                  <TableRow><TableCell sx={{ fontWeight: 800, bgcolor: '#EDF4FA' }}>Component Classification</TableCell><TableCell sx={{ fontWeight: 600 }}>{typeof product.category === 'object' ? product.category?.name : (category?.name || product.category || 'Standard Series')}</TableCell></TableRow>
                  <TableRow><TableCell sx={{ fontWeight: 800, bgcolor: '#EDF4FA' }}>Stock Status & Lead Time</TableCell><TableCell sx={{ fontWeight: 700, color: stock > 0 ? 'success.main' : 'warning.main' }}>{stockText}</TableCell></TableRow>

                  {/* Section 8.3 Dynamic Specification Rendering Algorithm */}
                  {category?.segments ? (
                    category.segments.map((segment) => {
                      const hiddenSegments = new Set(product.meta?.hidden_segments ?? []);
                      const hiddenAttributes = new Set(product.meta?.hidden_attributes ?? []);
                      if (!segment.active || hiddenSegments.has(segment.id)) return null;

                      return (
                        <React.Fragment key={segment.id}>
                          <TableRow>
                            <TableCell colSpan={2} sx={{ bgcolor: '#d8e8f5', fontWeight: 900, textTransform: 'uppercase', py: 1, color: 'primary.dark' }}>
                              {segment.name}
                            </TableCell>
                          </TableRow>
                          {segment.attributes && segment.attributes.map((attribute) => {
                            if (!attribute.active || hiddenAttributes.has(attribute.id)) return null;

                            if (attribute.datatype === 'FILE') {
                              const doc = product.documents?.find(d => d.attributeId === attribute.id);
                              return (
                                <TableRow key={attribute.id}>
                                  <TableCell sx={{ fontWeight: 800, bgcolor: '#EDF4FA' }}>{attribute.attrKey}</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>
                                    {doc ? (
                                      <Box component="a" href={`https://d1sswqar085ync.cloudfront.net/${doc.objectKey}`} target="_blank" rel="noreferrer" sx={{ color: 'primary.main', textDecoration: 'underline', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                                        <DownloadIcon fontSize="small" /> {doc.displayName || 'Download File'}
                                      </Box>
                                    ) : '—'}
                                  </TableCell>
                                </TableRow>
                              );
                            } else {
                              const value = (product.specs || product.specifications || {})[attribute.attrKey];
                              const displayValue = value != null ? `${value}${attribute.unit ? ' ' + attribute.unit : ''}` : '—';
                              return (
                                <TableRow key={attribute.id}>
                                  <TableCell sx={{ fontWeight: 800, bgcolor: '#EDF4FA' }}>{attribute.attrKey}</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>{displayValue}</TableCell>
                                </TableRow>
                              );
                            }
                          })}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    Object.entries(product.specs || product.specifications || {}).map(([key, value], idx) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ fontWeight: 800, bgcolor: '#EDF4FA', textTransform: 'capitalize' }}>{key}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{String(value)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {activeTab === 1 && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main', mb: 2 }}>RoHS & REACH Industrial Accreditation</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#f8fafc', border: '1px solid #D6E4EE', borderRadius: 1 }}>
                  <VerifiedIcon sx={{ color: 'success.main', fontSize: 28 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>RoHS Compliant Status: Directive 2015/863/EU</Typography>
                    <Typography variant="caption" color="text.secondary">This electronic hardware adheres strictly to European limits for hazardous substances.</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
          {activeTab === 2 && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main', mb: 2 }}>Logistical Packaging & Carton Dimensions</Typography>
              <Typography variant="body2" color="text.secondary">Standard factory cut-tape, tray, or bulk tube anti-static ESD packaging suitable for pick-and-place industrial fabrication lines.</Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* 4. Related Series Components */}
      {relatedProducts.length > 0 && (
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', mb: 3, textTransform: 'uppercase', borderBottom: '2px solid #243A5E', pb: 1 }}>
            Related Components in Series
          </Typography>
          <Grid container spacing={2.5}>
            {relatedProducts.slice(0, 4).map((rp, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={rp.id || rp._id || idx}>
                <ProductCard product={rp} viewMode="grid" />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default ProductDetails;
