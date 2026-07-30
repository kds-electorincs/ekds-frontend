import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Grid, Typography, Box, Button, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, CircularProgress } from '@mui/material';
import { Add, Remove, ShoppingCart, Description, Gavel, FavoriteBorder, WhatsApp, Download } from '@mui/icons-material';
import StatusChip from '../components/StatusChip';
import notification from '../utils/notification';
import { useCart } from '../context/CartContext';
import { productPublicService, categoryPublicService } from '../services/apiServices';

const CDN_BASE = import.meta.env.VITE_CDN_BASE_URL || 'https://d1sswqar085ync.cloudfront.net';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [recentProducts, setRecentProducts] = useState([]);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const { addToCart, setIsCartOpen } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(false);
      try {
        const prod = await productPublicService.getProduct(id);
        const cat = await categoryPublicService.getCategory(prod.categoryId);
        setProduct(prod);
        setCategory(cat);

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
  const imageUrl = primaryImage ? `${CDN_BASE}/${primaryImage.objectKey}` : 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=500';

  const formatPrice = (unitPriceMinor, currencyCode) => {
    const amount = unitPriceMinor / 100;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2
    }).format(amount);
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
                const doc = product.documents?.find(d => String(d.attributeId) === String(attribute.id));
                if (doc) {
                  displayValue = doc.displayName;
                  fileUrl = `${CDN_BASE}/${doc.objectKey}`;
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

  // Base price extraction (assumes first package and first price break)
  const defaultPackage = product.packagingOptions?.[0];
  const defaultPrice = defaultPackage?.priceBreaks?.[0];

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsCartOpen(true);
  };

  const handleWhatsAppRFQ = () => {
    const message = `Hello KDS Archana, I would like to request a wholesale quotation for:
Product: ${product.name}
Part ID: ${product.id}
Quantity: ${quantity} units
Link: ${window.location.href}`;
    window.open(`https://wa.me/918022150210?text=${encodeURIComponent(message)}`, '_blank');
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
                {defaultPrice ? formatPrice(defaultPrice.unitPriceMinor, defaultPrice.currency) : 'Contact for Price'}
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
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <IconButton onClick={() => setQuantity(Math.max(1, quantity - 1))}><Remove /></IconButton>
                <Typography sx={{ px: 2, fontWeight: 700 }}>{quantity}</Typography>
                <IconButton onClick={() => setQuantity(quantity + 1)}><Add /></IconButton>
              </Box>
              <Button 
                variant="contained" 
                size="large" 
                fullWidth 
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                disabled={product.totalStock === 0 && !product.restockLeadDays}
                sx={{ py: 1.5, borderRadius: 2 }}
              >
                Add to Cart
              </Button>
              <IconButton variant="outlined" sx={{ border: '1px solid', borderColor: 'divider', p: 1.5 }}>
                <FavoriteBorder />
              </IconButton>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  startIcon={<Gavel />}
                  onClick={() => { notification.success(`Quotation request submitted for ${product.name}!`); navigate('/user/quotations'); }}
                  sx={{ py: 1.5, borderRadius: 2, mb: 2 }}
                >
                  Request Quotation
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button 
                  variant="outlined" 
                  color="success"
                  fullWidth 
                  startIcon={<WhatsApp />}
                  onClick={handleWhatsAppRFQ}
                  sx={{ 
                    py: 1.5, 
                    borderRadius: 2, 
                    mb: 2, 
                    color: '#25D366', 
                    borderColor: '#25D366', 
                    '&:hover': { bgcolor: 'rgba(37, 211, 102, 0.04)', borderColor: '#25D366' } 
                  }}
                >
                  WhatsApp RFQ
                </Button>
              </Grid>
            </Grid>
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
                      {formatPrice(p.price)}
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
              <Typography variant="body2" color="primary.main" fontWeight={800}>{formatPrice(product.price)}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <IconButton size="small" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Remove /></IconButton>
              <Typography sx={{ px: 1.5, fontWeight: 700, fontSize: '0.9rem' }}>{quantity}</Typography>
              <IconButton size="small" onClick={() => setQuantity(quantity + 1)}><Add /></IconButton>
            </Box>
            <Button 
              variant="contained" 
              startIcon={<ShoppingCart />} 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              size="small"
            >
              Add to Cart
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ProductDetails;
