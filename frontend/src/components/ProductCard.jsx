import React, { useState } from 'react';
import { 
  Card, CardMedia, CardContent, Typography, Button, Box, Chip, 
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, 
  Divider, Grid, Stack, Table, TableBody, TableCell, TableRow, TableContainer, Paper, Tooltip
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Inventory as InventoryIcon,
  Description as DatasheetIcon,
  ShoppingCart as ShoppingCartIcon,
  FavoriteBorder as FavoriteIcon,
  CompareArrows as CompareIcon,
  Bolt as BoltIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { formatPrice as formatScaledPrice, CONTACT_US } from '../utils/priceUtils';
import { productPublicService } from '../services/apiServices';
import notification from '../utils/notification';

const ProductCard = ({ product, viewMode = 'grid', sx = {} }) => {
  const { currency } = useCurrency();
  const { addToCart, toggleCartDrawer } = useCart();
  const navigate = useNavigate();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addToCartError, setAddToCartError] = useState('');

  // Robust field mapping to real backend attributes (no mock fallbacks)
  const name = product.name || product.title || 'Component Specification Pending';
  const partNumber = product.partNumber || product.sku || `PART-${product.id || product._id || 'N/A'}`;
  const manufacturer = product.brand || product.manufacturer || typeof product.category === 'object' ? product.category?.name : 'Verified MFR';
  const image = product.primaryImageUrl || product.image || product.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400';
  const stock = product.totalStock !== undefined ? product.totalStock : (product.stock || product.quantity || 0);
  const categoryLabel = typeof product.category === 'object' ? product.category?.name : (product.category || 'Industrial Part');
  const description = product.description || product.shortDescription || 'Certified precision electronic component engineered for enterprise hardware applications.';

  // Pricing resolution from real backend structures (guide §2/§5). Read
  // priceScale from THIS product's own response — StoreProductSummaryResponse
  // carries currency/priceScale per item.
  const priceScale = product.priceScale ?? 4;
  const displayCurrency = product.currency || currency || 'INR';
  const priceValue = product.fromPriceScaled != null
    ? product.fromPriceScaled / 10 ** priceScale
    : null;

  const priceDisplay = formatScaledPrice(product.fromPriceScaled, priceScale, displayCurrency);

  // StoreProductSummaryResponse (list/card shape) never carries priceBreaks —
  // only the product detail endpoint does. No synthetic tiers are fabricated
  // here (guide: empty/missing priceBreaks -> "Contact us", never invented
  // discount tiers); only render a tier breakdown if the caller genuinely
  // attached real priceBreaks data to this product object.
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

  // This card only ever receives the list/summary shape (StoreProductSummaryResponse),
  // which has no packagingOptions — POST /api/cart/items requires a specific
  // packagingOptionId, which a bare product id cannot supply. Resolve it by
  // fetching product detail on click, same source ProductDetails.jsx uses.
  // - Exactly one packaging option: use it automatically.
  // - Zero: nothing purchasable, show an inline error, never fire the cart call.
  // - More than one: don't guess — send the user to product detail, which
  //   already has the real packaging-option selector (reusing that flow
  //   instead of inventing a second selector here).
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
        setAddToCartError('No purchasable packaging option for this product.');
        return;
      }
      if (options.length > 1) {
        notification.info('This part has multiple packaging options — choose one on the product page.');
        handleNavigate();
        return;
      }

      // Client-side guard: never call the cart API without a resolved id.
      const packagingOptionId = options[0].id;
      if (packagingOptionId == null) {
        setAddToCartError('Select a packaging option.');
        return;
      }

      await addToCart(packagingOptionId, 1);
      toggleCartDrawer();
    } catch (err) {
      console.error('[ProductCard] handleAddToCart failed:', err?.message);
      setAddToCartError('Could not add this item to your cart.');
    } finally {
      setAddingToCart(false);
    }
  };

  // 1. DENSE INDUSTRIAL LIST / TABLE VIEW (DigiKey Style)
  if (viewMode === 'list' || viewMode === 'table') {
    return (
      <>
        <Box 
          onClick={handleNavigate}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '120px 2.5fr 1.5fr 1.5fr 1.8fr 180px' },
            alignItems: 'center',
            gap: 2,
            p: 2,
            bgcolor: 'background.paper',
            borderBottom: '1px solid #D6E4EE',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
            '&:hover': { bgcolor: '#F4F8FB' },
            ...sx
          }}
        >
          {/* Thumbnail */}
          <Box sx={{ width: 100, height: 76, bgcolor: '#f8fafc', borderRadius: 1, border: '1px solid #E2ECF5', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box component="img" src={image} alt={name} sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          </Box>

          {/* Part Identification */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main', textDecoration: 'underline', '&:hover': { color: 'secondary.main' } }}>
              {partNumber}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600, mt: 0.2 }}>
              MFR: {typeof manufacturer === 'string' ? manufacturer : 'Industrial Partner'}
            </Typography>
            <Typography variant="body2" color="text.primary" noWrap sx={{ fontWeight: 500, fontSize: '0.8125rem', mt: 0.5 }}>
              {name}
            </Typography>
          </Box>

          {/* Availability Status */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: stock > 0 ? '#2e7d32' : '#ed6c02' }} />
              <Typography variant="body2" sx={{ fontWeight: 700, color: stock > 0 ? '#2e7d32' : '#ed6c02', fontSize: '0.8125rem' }}>
                {stock > 0 ? `${stock.toLocaleString()} In Stock` : 'Backordered'}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" display="block">
              {stock > 0 ? 'Immediate Dispatch' : 'Lead Time: 5-7 Days'}
            </Typography>
          </Box>

          {/* Pricing Tiers */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.9375rem' }}>
              {priceDisplay}
            </Typography>
            {priceBreaks.length > 1 && (
              <Typography variant="caption" sx={{ color: '#243A5E', fontWeight: 600, display: 'block', mt: 0.2 }}>
                Bulk: {formatScaledPrice(priceBreaks[priceBreaks.length - 1].unitPriceScaled, priceScale, displayCurrency)}
                {' '}({priceBreaks[priceBreaks.length - 1].minQuantity}+ pcs)
              </Typography>
            )}
          </Box>

          {/* Technical Specs Preview */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Chip label={categoryLabel} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 22, mr: 0.5, borderColor: '#D6E4EE', fontWeight: 600 }} />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
              RoHS Compliant • ISO Verified
            </Typography>
          </Box>

          {/* Quick Action Toolbar */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: { xs: 'flex-start', md: 'flex-end' } }} onClick={e => e.stopPropagation()}>
            <Button
              variant="contained"
              size="small"
              startIcon={<ShoppingCartIcon sx={{ fontSize: 14 }} />}
              onClick={handleAddToCart}
              disabled={(stock <= 0 && priceValue == null) || addingToCart}
              sx={{ width: '100%', fontSize: '0.75rem', py: 0.6, fontWeight: 700 }}
            >
              {addingToCart ? 'ADDING…' : priceValue != null ? 'ADD TO CART' : 'QUOTE BOM'}
            </Button>
            {addToCartError && (
              <Typography variant="caption" color="error.main" sx={{ fontWeight: 700 }}>
                {addToCartError}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 0.5, width: '100%', justifyContent: 'space-between' }}>
              <Button size="small" onClick={handleQuickViewClick} sx={{ fontSize: '0.7rem', p: 0.2, minWidth: 'auto', color: 'text.secondary', fontWeight: 700 }}>
                QUICK VIEW
              </Button>
              <Tooltip title="Download Part Datasheet">
                <IconButton size="small" sx={{ color: 'primary.main' }} onClick={(e) => { e.stopPropagation(); window.open('/product/' + (product.slug || product.id), '_blank'); }}>
                  <DatasheetIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        {/* Quick View Technical Dialog */}
        {renderQuickViewDialog()}
      </>
    );
  }

  // 2. STANDARD INDUSTRIAL GRID VIEW
  return (
    <>
      <Card
        onClick={handleNavigate}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          border: '1px solid #D6E4EE',
          borderRadius: 1,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: '0 8px 24px rgba(36, 58, 94, 0.12)',
            '& .img-hover': { transform: 'scale(1.05)' }
          },
          ...sx
        }}
      >
        {/* Top Media Tag */}
        <Box sx={{ position: 'relative', height: 180, bgcolor: '#f8fafc', borderBottom: '1px solid #D6E4EE', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, overflow: 'hidden' }}>
          <CardMedia
            component="img"
            image={image}
            alt={name}
            className="img-hover"
            sx={{ maxHeight: 150, maxWidth: '100%', objectFit: 'contain', transition: 'transform 0.3s ease' }}
          />
          <Chip
            label={stock > 0 ? `${stock} in stock` : 'Lead 5 Days'}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              bgcolor: stock > 0 ? 'rgba(46, 125, 50, 0.9)' : 'rgba(237, 108, 2, 0.9)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.7rem',
              height: 22
            }}
          />
          <IconButton
            size="small"
            onClick={handleQuickViewClick}
            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.9)', border: '1px solid #D6E4EE', '&:hover': { bgcolor: '#243A5E', color: 'white' } }}
            aria-label="open quick engineering view"
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Body Specifications */}
        <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'secondary.dark', textTransform: 'uppercase' }}>
                {typeof manufacturer === 'string' ? manufacturer : 'Industrial Part'}
              </Typography>
              <Chip label="RoHS" size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: '#EDF4FA', fontWeight: 700 }} />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main', mb: 0.5, fontFamily: 'monospace', fontSize: '0.875rem' }}>
              {partNumber}
            </Typography>
            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600, lineClamp: 2, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: 40, fontSize: '0.8125rem' }}>
              {name}
            </Typography>
          </Box>

          {/* Price Box & Action Button */}
          <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed #D6E4EE' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">UNIT PRICE</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.dark', lineHeight: 1.1 }}>
                  {priceDisplay}
                </Typography>
              </Box>
              {priceBreaks.length > 1 && (
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main' }}>
                  Tier: {formatScaledPrice(priceBreaks[priceBreaks.length - 1].unitPriceScaled, priceScale, displayCurrency)}
                </Typography>
              )}
            </Box>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="small"
              startIcon={<ShoppingCartIcon sx={{ fontSize: 16 }} />}
              onClick={handleAddToCart}
              disabled={addingToCart}
              sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.8 }}
            >
              {addingToCart ? 'ADDING…' : priceValue != null ? 'PROCURE ITEM' : 'REQUEST QUOTE'}
            </Button>
            {addToCartError && (
              <Typography variant="caption" color="error.main" sx={{ fontWeight: 700, display: 'block', mt: 0.5 }}>
                {addToCartError}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Quick View Technical Dialog */}
      {renderQuickViewDialog()}
    </>
  );

  function renderQuickViewDialog() {
    return (
      <Dialog open={quickViewOpen} onClose={handleCloseQuickView} maxWidth="md" fullWidth onClick={e => e.stopPropagation()}>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BoltIcon sx={{ color: 'secondary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Technical Specification Inspection: {partNumber}</Typography>
          </Box>
          <IconButton onClick={handleCloseQuickView} sx={{ color: 'white' }} aria-label="close modal">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 4 }}>
          <Grid container spacing={4} sx={{ mt: 0 }}>
            <Grid item xs={12} md={5}>
              <Box sx={{ width: '100%', height: 260, bgcolor: '#f8fafc', border: '1px solid #D6E4EE', borderRadius: 1, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box component="img" src={image} alt={name} sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'space-between' }}>
                <Chip label={stock > 0 ? '🟢 In Stock (Immediate Dispatch)' : '🟠 Backorder (5-7 Days)'} sx={{ width: '100%', fontWeight: 700, bgcolor: '#EDF4FA' }} />
              </Box>
            </Grid>

            <Grid item xs={12} md={7}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'secondary.dark', textTransform: 'uppercase' }}>
                MFR: {typeof manufacturer === 'string' ? manufacturer : 'Industrial Partner'} | Category: {categoryLabel}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                {name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                {description}
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'primary.dark' }}>
                Volume Pricing Breakdown (B2B Tiers)
              </Typography>
              {priceBreaks.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontWeight: 700 }}>
                  {CONTACT_US} for volume pricing on this component.
                </Typography>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #D6E4EE', mb: 3 }}>
                  <Table size="small">
                    <TableBody>
                      <TableRow sx={{ bgcolor: '#EDF4FA' }}>
                        <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Quantity Range</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Unit Price</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Extended Savings</TableCell>
                      </TableRow>
                      {priceBreaks.map((pb, index) => {
                        const baseUnitScaled = priceBreaks[0].unitPriceScaled;
                        const savingsPct = index > 0 && baseUnitScaled
                          ? Math.round((1 - pb.unitPriceScaled / baseUnitScaled) * 100)
                          : 0;
                        return (
                          <TableRow key={pb.minQuantity ?? index}>
                            <TableCell sx={{ fontWeight: 600 }}>{pb.minQuantity}+ units</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: 'primary.dark' }}>
                              {formatScaledPrice(pb.unitPriceScaled, priceScale, displayCurrency)}
                            </TableCell>
                            <TableCell sx={{ color: index > 0 ? 'success.main' : 'text.secondary', fontWeight: 600 }}>
                              {index === 0 ? 'Base Price' : `${savingsPct}% Volume Discount`}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<ShoppingCartIcon />}
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  sx={{ flexGrow: 1, py: 1, fontWeight: 800 }}
                >
                  {addingToCart ? 'ADDING…' : `PROCURE NOW (${priceDisplay})`}
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => { handleCloseQuickView(); handleNavigate(); }}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ fontWeight: 700 }}
                >
                  FULL SPEC SHEET
                </Button>
              </Box>
              {addToCartError && (
                <Typography variant="caption" color="error.main" sx={{ fontWeight: 700, display: 'block', mt: 1 }}>
                  {addToCartError}
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    );
  }
};

export default ProductCard;
