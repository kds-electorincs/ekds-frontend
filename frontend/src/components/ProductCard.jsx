import React, { useState } from 'react';
import { 
  Card, CardMedia, CardContent, Typography, Button, Box, Chip, 
  IconButton, Dialog, DialogTitle, DialogContent, 
  Grid, Rating, Paper, Skeleton
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  ShoppingCart as ShoppingCartIcon,
  Favorite as FavoriteFilledIcon,
  FavoriteBorder as FavoriteIcon,
  ArrowForward as ArrowForwardIcon,
  Memory as MemoryIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { formatPrice as formatScaledPrice } from '../utils/priceUtils';
import { productPublicService } from '../services/apiServices';
import notification from '../utils/notification';

const CDN_BASE = import.meta.env.VITE_CDN_BASE_URL || 'https://d1sswqar085ync.cloudfront.net';

const resolveS3ImageUrl = (product) => {
  if (!product) return null;
  const raw = product.primaryImageUrl || product.imageUrl || product.image || 
    (product.primaryImage && (product.primaryImage.objectKey || product.primaryImage.url)) ||
    (Array.isArray(product.images) && product.images.length > 0 && (product.images.find(i => i.isPrimary)?.objectKey || product.images[0]?.objectKey || product.images[0]?.url));
  
  if (!raw || typeof raw !== 'string') return null;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  return `${CDN_BASE}/${raw.replace(/^\//, '')}`;
};

const ProductCard = ({ product, viewMode = 'grid', sx = {} }) => {
  const { currency } = useCurrency();
  const { addToCart, toggleCartDrawer } = useCart();
  const navigate = useNavigate();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addToCartError, setAddToCartError] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imgLoadError, setImgLoadError] = useState(false);

  // Robust field mapping & S3 AWS Image resolution
  const name = product.name || product.title || 'Component Specification Pending';
  const partNumber = product.partNumber || product.sku || `PART-${product.id || product._id || 'N/A'}`;
  const manufacturer = product.brand || product.manufacturer || (typeof product.category === 'object' ? product.category?.name : 'Verified Brand');
  
  const s3Image = resolveS3ImageUrl(product);

  const stock = product.totalStock !== undefined ? product.totalStock : (product.stock || product.quantity || 0);
  const categoryLabel = typeof product.category === 'object' ? product.category?.name : (product.category || 'Industrial Part');
  const description = product.description || product.shortDescription || 'Certified precision electronic component engineered for enterprise applications.';
  const rating = product.rating || 4.8;
  const reviewsCount = product.reviewsCount || 12;

  // Pricing resolution
  const priceScale = product.priceScale ?? 4;
  const displayCurrency = product.currency || currency || 'INR';

  const priceDisplay = formatScaledPrice(product.fromPriceScaled, priceScale, displayCurrency);
  const priceBreaks = Array.isArray(product.priceBreaks) ? product.priceBreaks : [];

  const handleQuickViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  const handleCloseQuickView = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setQuickViewOpen(false);
  };

  const handleNavigate = () => {
    navigate(`/product/${product.slug || product.id || product._id}`);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    notification.success(isWishlisted ? 'Removed from Wishlist' : 'Added to Wishlist');
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAddToCartError('');
    setAddingToCart(true);
    try {
      const slugOrId = product.slug || product.id || product._id;
      const detail = await productPublicService.getProduct(slugOrId, { currency: displayCurrency });
      const item = detail?.data || detail;
      const options = item?.packagingOptions || [];

      if (options.length === 0) {
        setAddToCartError('No purchasable option for this product.');
        return;
      }
      if (options.length > 1) {
        notification.info('Select packaging option on details page.');
        handleNavigate();
        return;
      }

      const packagingOptionId = options[0].id;
      if (packagingOptionId == null) {
        setAddToCartError('Select packaging option.');
        return;
      }

      await addToCart(packagingOptionId, 1);
      toggleCartDrawer();
    } catch (err) {
      console.error('[ProductCard] handleAddToCart failed:', err?.message);
      setAddToCartError('Could not add to cart.');
    } finally {
      setAddingToCart(false);
    }
  };

  // 1. DENSE LIST / TABLE VIEW
  if (viewMode === 'list' || viewMode === 'table') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -3 }}
      >
        <Paper
          elevation={0}
          onClick={handleNavigate}
          sx={{
            p: 2.5,
            mb: 2,
            bgcolor: '#ffffff',
            border: '1px solid #E2ECF5',
            borderRadius: 3,
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
            '&:hover': {
              borderColor: '#243A5E',
              boxShadow: '0 12px 28px rgba(36, 58, 94, 0.1)',
              '& .product-img': { transform: 'scale(1.06)' }
            },
            ...sx
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, alignItems: 'center' }}>
            {/* Product Image */}
            <Box 
              sx={{ 
                width: 110, 
                height: 110, 
                minWidth: 110, 
                bgcolor: '#F8FAFC', 
                borderRadius: 2.5, 
                border: '1px solid #E2ECF5', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                p: 1,
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {s3Image && !imgLoadError ? (
                <Box 
                  component="img" 
                  src={s3Image} 
                  alt={name} 
                  className="product-img"
                  onError={() => setImgLoadError(true)}
                  sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', transition: 'transform 0.3s ease' }} 
                />
              ) : (
                <Box sx={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: 2, bgcolor: '#EEF2F6' }} />
                  <MemoryIcon sx={{ position: 'absolute', color: '#94A3B8', fontSize: 36, opacity: 0.7 }} />
                </Box>
              )}
            </Box>

            {/* Product Main Specs & Info */}
            <Box sx={{ flexGrow: 1, minWidth: 0, width: '100%' }}>
              {/* Top metadata tags */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.8 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#5F86A6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  MFR: {typeof manufacturer === 'string' ? manufacturer : 'Verified Partner'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#CBD5E1' }}>•</Typography>
                <Chip label={categoryLabel} size="small" sx={{ height: 20, fontSize: '0.675rem', fontWeight: 700, bgcolor: '#EDF4FA', color: '#243A5E' }} />
                {stock > 0 ? (
                  <Chip label="In Stock" size="small" color="success" sx={{ height: 20, fontSize: '0.675rem', fontWeight: 800 }} />
                ) : (
                  <Chip label="Lead 5 Days" size="small" color="warning" sx={{ height: 20, fontSize: '0.675rem', fontWeight: 800 }} />
                )}
              </Box>

              {/* Part Number */}
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', lineHeight: 1.2, mb: 0.5, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {partNumber}
              </Typography>

              {/* Product Title / Short Spec */}
              <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600, lineHeight: 1.5, mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {name}
              </Typography>

              {/* Rating & Reviews */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Rating value={rating} precision={0.1} readOnly size="small" sx={{ fontSize: '0.85rem' }} />
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>({reviewsCount} customer reviews)</Typography>
              </Box>
            </Box>

            {/* Right Column: Pricing & Action Box */}
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: { xs: 'flex-start', sm: 'flex-end' }, 
                justifyContent: 'center',
                minWidth: { sm: 190 },
                width: { xs: '100%', sm: 'auto' },
                pl: { sm: 3 },
                borderLeft: { sm: '1px dashed #E2ECF5' },
                pt: { xs: 2, sm: 0 },
                borderTop: { xs: '1px dashed #E2ECF5', sm: 'none' }
              }}
              onClick={e => e.stopPropagation()}
            >
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.675rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                UNIT PRICE
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', mb: 1.5, lineHeight: 1 }}>
                {priceDisplay}
              </Typography>

              <motion.div whileTap={{ scale: 0.96 }} style={{ width: '100%' }}>
                <Button
                  variant="contained"
                  size="medium"
                  startIcon={<ShoppingCartIcon sx={{ fontSize: 16 }} />}
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  sx={{ 
                    width: '100%', 
                    fontSize: '0.8rem', 
                    py: 1, 
                    px: 2.5,
                    fontWeight: 800, 
                    borderRadius: 2.5,
                    background: 'linear-gradient(135deg, #243A5E 0%, #16243C 100%)',
                    boxShadow: '0 4px 14px rgba(36, 58, 94, 0.25)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {addingToCart ? 'ADDING…' : 'ADD TO CART'}
                </Button>
              </motion.div>

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                <IconButton size="small" onClick={handleWishlistToggle} color={isWishlisted ? "error" : "default"} sx={{ bgcolor: '#F8FAFC', '&:hover': { bgcolor: '#EDF4FA' } }}>
                  {isWishlisted ? <FavoriteFilledIcon fontSize="small" /> : <FavoriteIcon fontSize="small" />}
                </IconButton>
                <Button size="small" onClick={handleQuickViewClick} sx={{ fontSize: '0.725rem', fontWeight: 800, color: '#243A5E', textTransform: 'none' }}>
                  Quick View
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>

        {renderQuickViewDialog()}
      </motion.div>
    );
  }

  // 2. STANDARD PREMIUM GRID VIEW
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -6 }}
      style={{ height: '100%' }}
    >
      <Card
        onClick={handleNavigate}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#ffffff',
          border: '1px solid #E2ECF5',
          borderRadius: 3,
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
          transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            borderColor: '#243A5E',
            boxShadow: '0 16px 36px rgba(36, 58, 94, 0.14)',
            '& .img-hover': { transform: 'scale(1.08)' }
          },
          ...sx
        }}
      >
        {/* Wishlist Button */}
        <IconButton
          size="small"
          onClick={handleWishlistToggle}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 2,
            bgcolor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            color: isWishlisted ? 'error.main' : 'action.active',
            '&:hover': { bgcolor: '#ffffff', transform: 'scale(1.1)' }
          }}
        >
          {isWishlisted ? <FavoriteFilledIcon fontSize="small" /> : <FavoriteIcon fontSize="small" />}
        </IconButton>

        {/* Media Container */}
        <Box sx={{ position: 'relative', height: 190, bgcolor: '#f8fafc', borderBottom: '1px solid #E2ECF5', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, overflow: 'hidden' }}>
          {s3Image && !imgLoadError ? (
            <CardMedia
              component="img"
              image={s3Image}
              alt={name}
              className="img-hover"
              onError={() => setImgLoadError(true)}
              sx={{ maxHeight: 150, maxWidth: '100%', objectFit: 'contain', transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
          ) : (
            <Box sx={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: 2, bgcolor: '#EEF2F6' }} />
              <MemoryIcon sx={{ position: 'absolute', color: '#94A3B8', fontSize: 48, opacity: 0.7 }} />
            </Box>
          )}
          <Chip
            label={stock > 0 ? 'In Stock' : 'Lead 5 Days'}
            size="small"
            color={stock > 0 ? "success" : "warning"}
            sx={{
              position: 'absolute',
              bottom: 10,
              left: 10,
              fontWeight: 800,
              fontSize: '0.675rem',
              height: 20
            }}
          />
          <Button
            size="small"
            startIcon={<VisibilityIcon fontSize="small" />}
            onClick={handleQuickViewClick}
            sx={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              bgcolor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(4px)',
              color: 'primary.main',
              fontWeight: 800,
              fontSize: '0.675rem',
              py: 0.3,
              px: 1,
              borderRadius: 1.5,
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              '&:hover': { bgcolor: 'primary.main', color: 'white' }
            }}
          >
            Quick View
          </Button>
        </Box>

        {/* Product Details */}
        <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#5F86A6', textTransform: 'uppercase' }}>
                {typeof manufacturer === 'string' ? manufacturer : 'Brand'}
              </Typography>
              <Chip label={categoryLabel} size="small" sx={{ height: 18, fontSize: '0.625rem', bgcolor: '#EDF4FA', fontWeight: 700 }} />
            </Box>

            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'primary.main', mb: 0.5 }}>
              {partNumber}
            </Typography>

            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600, lineClamp: 2, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: 40, fontSize: '0.875rem' }}>
              {name}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
              <Rating value={rating} precision={0.1} readOnly size="small" sx={{ fontSize: '0.85rem' }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>({reviewsCount})</Typography>
            </Box>
          </Box>

          {/* Pricing & CTA */}
          <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed #E2ECF5' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.675rem' }}>UNIT PRICE</Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main', lineHeight: 1 }}>
                  {priceDisplay}
                </Typography>
              </Box>
            </Box>

            <motion.div whileTap={{ scale: 0.96 }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="small"
                startIcon={<ShoppingCartIcon sx={{ fontSize: 16 }} />}
                onClick={handleAddToCart}
                disabled={addingToCart}
                sx={{ 
                  fontWeight: 800, 
                  fontSize: '0.8rem', 
                  py: 1, 
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #243A5E 0%, #16243C 100%)',
                  boxShadow: '0 4px 14px rgba(36, 58, 94, 0.2)'
                }}
              >
                {addingToCart ? 'ADDING…' : 'ADD TO CART'}
              </Button>
            </motion.div>
            {addToCartError && (
              <Typography variant="caption" color="error.main" sx={{ fontWeight: 700, display: 'block', mt: 0.5 }}>
                {addToCartError}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {renderQuickViewDialog()}
    </motion.div>
  );

  function renderQuickViewDialog() {
    return (
      <Dialog open={quickViewOpen} onClose={handleCloseQuickView} maxWidth="md" fullWidth onClick={e => e.stopPropagation()} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Product Quick View: {partNumber}</Typography>
          <IconButton onClick={handleCloseQuickView} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 4 }}>
          <Grid container spacing={4} sx={{ mt: 0 }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ width: '100%', height: 260, bgcolor: '#f8fafc', border: '1px solid #E2ECF5', borderRadius: 2, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {s3Image && !imgLoadError ? (
                  <Box component="img" src={s3Image} alt={name} onError={() => setImgLoadError(true)} sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <Box sx={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: 2, bgcolor: '#EEF2F6' }} />
                    <MemoryIcon sx={{ position: 'absolute', color: '#94A3B8', fontSize: 64, opacity: 0.7 }} />
                  </Box>
                )}
              </Box>
              <Chip label={stock > 0 ? '🟢 In Stock - Immediate Dispatch' : '🟠 Backordered'} sx={{ width: '100%', fontWeight: 700, bgcolor: '#EDF4FA', mt: 2 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#5F86A6', textTransform: 'uppercase' }}>
                Brand: {typeof manufacturer === 'string' ? manufacturer : 'Partner'} | Category: {categoryLabel}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', mb: 1 }}>
                {name}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Rating value={rating} precision={0.1} readOnly />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>({reviewsCount} customer reviews)</Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                {description}
              </Typography>

              <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', mb: 3 }}>
                {priceDisplay}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<ShoppingCartIcon />}
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  sx={{ flexGrow: 1, py: 1.2, fontWeight: 900, borderRadius: 2, background: 'linear-gradient(135deg, #243A5E 0%, #16243C 100%)' }}
                >
                  {addingToCart ? 'ADDING…' : 'ADD TO CART'}
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => { handleCloseQuickView(); handleNavigate(); }}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ fontWeight: 700, borderRadius: 2 }}
                >
                  FULL DETAILS
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    );
  }
};

export default ProductCard;
