import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Grid, Typography, Box, Button, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, CircularProgress } from '@mui/material';
import { Add, Remove, Description, Gavel, FavoriteBorder, ShoppingCart, FlashOn, Download } from '@mui/icons-material';
import StatusChip from '../components/StatusChip';
import notification from '../utils/notification';
import { productPublicService, categoryPublicService } from '../services/apiServices';
import { useCart } from '../context/CartContext';

const CDN_BASE = import.meta.env.VITE_CDN_BASE_URL || 'https://d1sswqar085ync.cloudfront.net';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [recentProducts, setRecentProducts] = useState([]);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(false);
      try {
        const prod = await productPublicService.getProduct(id, { currency: 'INR' });
        setProduct(prod);
        if (prod.packagingOptions && prod.packagingOptions.length > 0) {
          setQuantity(prod.packagingOptions[0].minOrderQuantity || 1);
        }
        if (prod && prod.category && (prod.category.slug || prod.category.id || prod.categoryId)) {
          try {
            const cat = await categoryPublicService.getCategory(prod.category.slug || prod.category.id || prod.categoryId);
            setCategory(cat);
          } catch (e) {
            console.warn("Category fetch info:", e);
            setCategory(typeof prod.category === 'object' ? prod.category : { name: prod.category || "Catalog" });
          }
        } else if (typeof prod.category === 'object') {
          setCategory(prod.category);
        }

        // Save to recently viewed
        const recentlyViewed = JSON.parse(sessionStorage.getItem('recentlyViewed') || '[]');
        const updated = [prod.id, ...recentlyViewed.filter(pId => pId !== prod.id)].slice(0, 5);
        sessionStorage.setItem('recentlyViewed', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => setShowStickyBar(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  if (error || !product) return <Typography color="error" align="center" sx={{ py: 10 }}>Failed to load product</Typography>;

  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  const imageUrl = primaryImage ? (primaryImage.url || `${CDN_BASE}/${primaryImage.objectKey}`) : (product.primaryImageUrl || product.image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=500');

  const formatPrice = (unitPriceMinor, currencyCode = 'INR') => {
    if (unitPriceMinor == null || isNaN(unitPriceMinor)) return 'Contact for Price';
    const amount = unitPriceMinor / 100;
    const validCurrency = (currencyCode && typeof currencyCode === 'string' && currencyCode.trim().length === 3) ? currencyCode.trim().toUpperCase() : 'INR';
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: validCurrency,
        minimumFractionDigits: 2
      }).format(amount);
    } catch (e) {
      return `₹${amount.toFixed(2)}`;
    }
  };

  const renderStockInfo = () => {
    if (product.totalStock > 0) {
      return `${product.totalStock} in stock`;
    } else if (product.restockLeadDays != null) {
      return product.restockLeadDays === 0 ? 'Ships same day' : `Ships in ${product.restockLeadDays} days`;
    }
    return 'Contact for availability';
  };

  const renderSpecs = () => {
    if (!category || !category.segments) return null;
    const hiddenSegments = new Set(product.meta?.hidden_segments || []);
    const hiddenAttributes = new Set(product.meta?.hidden_attributes || []);

    return category.segments.map(segment => {
      if (!segment.active || hiddenSegments.has(segment.id)) return null;

      const visibleAttrs = segment.attributes.filter(attr => attr.active && !hiddenAttributes.has(attr.id));
      if (visibleAttrs.length === 0) return null;

      return (
        <Box key={segment.id} sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>{segment.name}</Typography>
          <Grid container spacing={2}>
            {visibleAttrs.map(attribute => {
              let displayValue = '—';
              let isFile = false;
              let fileUrl = '';

              if (attribute.datatype === 'FILE') {
                isFile = true;
                const doc = product.documents?.find(d => String(d.attributeId) === String(attribute.id) || String(d.id) === String(attribute.document?.id));
                if (doc || attribute.document) {
                  const targetDoc = doc || attribute.document;
                  displayValue = targetDoc.displayName;
                  fileUrl = targetDoc.url || `${CDN_BASE}/${targetDoc.objectKey}`;
                }
              } else {
                const value = product.specs?.[attribute.attrKey];
                displayValue = value != null ? `${value}${attribute.unit ? ' ' + attribute.unit : ''}` : '—';
              }

              return (
                <Grid item xs={12} sm={6} md={4} key={attribute.id}>
                  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'background.default', height: '100%' }}>
                    <Description color="primary" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">{attribute.attrKey}</Typography>
                      {isFile && fileUrl ? (
                        <Box sx={{ mt: 0.5 }}>
                           <a href={fileUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', color: '#1976d2', fontWeight: 600 }}>
                             {displayValue} <Download fontSize="small" />
                           </a>
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{displayValue}</Typography>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      );
    });
  };

  // MOQ, Multiple, and Price Break resolution (Sections 2 & 3)
  const defaultPackage = product.packagingOptions?.[0];
  const moq = defaultPackage?.minOrderQuantity || 1;
  const orderMultiple = defaultPackage?.orderMultiple || 1;

  const resolveUnitPriceMinor = (priceBreaks, qty) => {
    if (!priceBreaks || !priceBreaks.length) return null;
    const applicable = priceBreaks
      .filter(pb => pb.minQuantity <= qty)
      .sort((a, b) => b.minQuantity - a.minQuantity)[0];
    return applicable ? applicable.unitPriceMinor : null;
  };

  const activeUnitPriceMinor = resolveUnitPriceMinor(defaultPackage?.priceBreaks, quantity) ?? product.fromPriceMinor;

  const getProductItemForCart = () => {
    let majorPrice = 0;
    if (activeUnitPriceMinor != null) {
      majorPrice = activeUnitPriceMinor / 100;
    } else if (product.price != null) {
      majorPrice = product.price;
    }
    
    let imageUrl = '';
    if (product.media?.images?.[0]) {
      const imgPath = product.media.images[0].filePath || product.media.images[0].url || product.media.images[0];
      imageUrl = imgPath.startsWith('http') ? imgPath : `${CDN_BASE}/${imgPath.replace(/^\//, '')}`;
    } else if (product.image) {
      imageUrl = product.image;
    }

    return {
      id: product.id || product.slug || 'p-item',
      name: product.name || 'Component',
      price: majorPrice,
      currency: product.currency || 'INR',
      image: imageUrl,
      stock: product.totalStock !== undefined ? product.totalStock : (product.stock || 1000)
    };
  };

  const handleAddToCart = () => {
    const item = getProductItemForCart();
    addToCart(item, quantity, true);
  };

  const handleBuyNow = () => {
    const item = getProductItemForCart();
    addToCart(item, quantity, false);
    navigate('/checkout');
  };

  return (
    <Box sx={{ pb: 10 }}>
      <Grid container spacing={6}>
        {/* Product Image */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
            <img src={imageUrl} alt={product.name} style={{ width: '100%', height: 'auto', display: 'block' }} />
          </Paper>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Box>
            <Chip label={category?.name || "Product"} color="primary" variant="outlined" size="small" sx={{ mb: 2 }} />
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: 'primary.main' }}>
              {product.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
              MPN: {product.mpn} | MFR: {product.manufacturer}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {activeUnitPriceMinor != null ? formatPrice(activeUnitPriceMinor, product.currency || 'INR') : (product.price ? formatPrice(product.price * 100, 'INR') : 'Contact for Price')}
              </Typography>
              <StatusChip status={product.totalStock > 0 ? 'shipped' : 'error'} />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                ({renderStockInfo()})
              </Typography>
            </Box>

            <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: '1.1rem' }}>
              {product.description}
            </Typography>

            <Divider sx={{ my: 4 }} />

            {/* Bulk Pricing */}
            {defaultPackage && defaultPackage.priceBreaks && defaultPackage.priceBreaks.length > 0 && (
              <>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Bulk Pricing ({defaultPackage.displayName})</Typography>
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 4, overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'secondary.light' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Quantity</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Price per Unit</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {defaultPackage.priceBreaks.map((tier) => (
                        <TableRow key={tier.id}>
                          <TableCell>{tier.minQuantity}+ units</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{formatPrice(tier.unitPriceMinor, tier.currency)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
                <IconButton onClick={() => setQuantity(Math.max(moq, quantity - orderMultiple))}><Remove /></IconButton>
                <Typography sx={{ px: 2, fontWeight: 700 }}>{quantity}</Typography>
                <IconButton onClick={() => setQuantity(quantity + orderMultiple)}><Add /></IconButton>
              </Box>
              <Button 
                variant="contained" 
                size="large" 
                fullWidth 
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                sx={{ py: 1.5, borderRadius: 2, fontWeight: 800, textTransform: 'none', bgcolor: 'primary.main', boxShadow: '0 4px 14px rgba(25, 118, 210, 0.25)' }}
              >
                Add to Cart
              </Button>
              <IconButton variant="outlined" sx={{ border: '1px solid', borderColor: 'divider', p: 1.5, borderRadius: 2 }}>
                <FavoriteBorder />
              </IconButton>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Button 
                variant="contained" 
                fullWidth 
                size="large"
                startIcon={<FlashOn />}
                onClick={handleBuyNow}
                sx={{ 
                  py: 1.5, 
                  borderRadius: 2, 
                  fontWeight: 850,
                  fontSize: '1.05rem',
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #FF6B00 0%, #FFA800 100%)',
                  color: '#ffffff',
                  boxShadow: '0 6px 20px rgba(255, 107, 0, 0.35)',
                  '&:hover': { background: 'linear-gradient(135deg, #E56000 0%, #E69700 100%)', boxShadow: '0 8px 24px rgba(255, 107, 0, 0.45)' }
                }}
              >
                Buy Now (Proceed to Checkout)
              </Button>
            </Box>
          </Box>
        </Grid>

        {/* Specifications */}
        <Grid item xs={12}>
          <Divider sx={{ mb: 6 }} />
          <Typography variant="h5" sx={{ mb: 4, fontWeight: 700 }}>Specifications</Typography>
          {renderSpecs()}

          {product.documents && product.documents.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Documents & Downloads</Typography>
              <Grid container spacing={2}>
                {product.documents.map(doc => (
                  <Grid item xs={12} sm={6} md={4} key={doc.id}>
                    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                      <Description color="primary" />
                      <Box>
                        <a href={`${CDN_BASE}/${doc.objectKey}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', color: '#1976d2', fontWeight: 600 }}>
                          {doc.displayName || doc.objectKey} <Download fontSize="small" />
                        </a>
                        <Typography variant="caption" color="text.secondary">{doc.contentType}</Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Grid>

        {/* Recently Viewed Products */}
        {recentProducts.length > 0 && (
          <Grid item xs={12} sx={{ mt: 4 }}>
            <Divider sx={{ mb: 6 }} />
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>Recently Viewed Products</Typography>
            <Grid container spacing={3}>
              {recentProducts.map((p) => (
                <Grid item xs={12} sm={6} md={3} key={p.id}>
                  <Paper 
                    component={RouterLink}
                    to={`/product/${p.id}`}
                    elevation={0}
                    sx={{ 
                      p: 2.5, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 1.5, 
                      border: '1px solid', 
                      borderColor: 'divider',
                      borderRadius: 2.5,
                      textDecoration: 'none',
                      color: 'inherit',
                      '&:hover': { borderColor: 'primary.main', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }
                    }}
                  >
                    <Box sx={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                      <img src={p.image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=500'} alt={p.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, height: 40, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.3 }}>
                      {p.name}
                    </Typography>
                    <Typography variant="body2" fontWeight={750} color="primary.main">
                      {p.fromPriceMinor != null ? formatPrice(p.fromPriceMinor, p.currency) : (p.price != null ? formatPrice(p.price * 100, p.currency) : 'Contact for Price')}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}
      </Grid>

      {/* Sticky Product Actions Bar */}
      {showStickyBar && (
        <Paper 
          elevation={6} 
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            zIndex: 1000, 
            p: 2, 
            bgcolor: 'background.paper', 
            borderTop: '1px solid', 
            borderColor: 'divider',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            animation: 'slideUp 0.3s ease-out',
            '@keyframes slideUp': {
              from: { transform: 'translateY(100%)' },
              to: { transform: 'translateY(0)' }
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img src={product.image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=500'} alt={product.name} style={{ width: 40, height: 40, objectFit: 'contain' }} />
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ maxWidth: { xs: 150, sm: 300 }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {product.name}
              </Typography>
              <Typography variant="body2" color="primary.main" fontWeight={800}>
                {activeUnitPriceMinor != null ? formatPrice(activeUnitPriceMinor, product.currency) : (product.price != null ? formatPrice(product.price * 100, product.currency) : 'Contact for Price')}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <IconButton size="small" onClick={() => setQuantity(Math.max(moq, quantity - orderMultiple))}><Remove /></IconButton>
              <Typography sx={{ px: 1.5, fontWeight: 700, fontSize: '0.9rem' }}>{quantity}</Typography>
              <IconButton size="small" onClick={() => setQuantity(quantity + orderMultiple)}><Add /></IconButton>
            </Box>
            <Button 
              variant="contained" 
              startIcon={<ShoppingCart />} 
              onClick={handleAddToCart}
              size="small"
              sx={{ fontWeight: 700, textTransform: 'none', px: 2.5, py: 1, borderRadius: 2 }}
            >
              Add to Cart
            </Button>
            <Button 
              variant="contained" 
              startIcon={<FlashOn />} 
              onClick={handleBuyNow}
              size="small"
              sx={{ fontWeight: 800, textTransform: 'none', background: 'linear-gradient(135deg, #FF6B00 0%, #FFA800 100%)', px: 3, py: 1, borderRadius: 2 }}
            >
              Buy Now
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ProductDetails;
