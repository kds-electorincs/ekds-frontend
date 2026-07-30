import React, { useState } from 'react';
import { 
  Card, CardMedia, CardContent, Typography, Button, Box, Chip, 
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, 
  Divider, Grid, Stack 
} from '@mui/material';
import { 
  ArrowForward as ArrowForwardIcon, 
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Inventory as InventoryIcon,
  LocalOffer as LocalOfferIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';

const ProductCard = ({ product, sx = {} }) => {
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const name = product.name || 'Untitled Product';
  const image = product.primaryImageUrl || product.image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=500';
  const stock = product.totalStock !== undefined ? product.totalStock : (product.stock || 0);
  const categoryLabel = typeof product.category === 'object' ? product.category?.name : (product.category || product.manufacturer || 'Catalog');
  
  const priceDisplay = product.fromPriceMinor != null
    ? formatPrice(product.fromPriceMinor / 100)
    : (product.price != null ? formatPrice(product.price) : 'Request quote');

  const handleQuickViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  const handleCloseQuickView = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setQuickViewOpen(false);
  };

  const handleNavigateToDetails = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${product.slug || product.id}`);
  };

  return (
    <>
      <Card sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        borderRadius: 3.5,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        boxShadow: '0 4px 14px 0 rgba(0,0,0,0.02)',
        '&:hover': { 
          transform: 'translateY(-6px)', 
          boxShadow: '0 12px 32px 0 rgba(0,0,0,0.1)',
          borderColor: 'primary.light',
          '& .product-img': {
            transform: 'scale(1.06)'
          },
          '& .quick-view-btn': {
            opacity: 1,
            transform: 'translateY(0)'
          }
        },
        '&:focus-within': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
        ...sx
      }}>
        <Box sx={{ position: 'relative', overflow: 'hidden', height: 210, bgcolor: '#f8fafc' }}>
          <CardMedia
            component="img"
            height="210"
            image={image}
            alt={name}
            className="product-img"
            sx={{ transition: 'transform 0.5s ease-out', objectFit: 'cover' }}
          />
          <Chip 
            label={categoryLabel} 
            size="small" 
            sx={{ 
              position: 'absolute', 
              top: 12, 
              left: 12, 
              bgcolor: 'rgba(255,255,255,0.92)', 
              color: 'primary.main', 
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              backdropFilter: 'blur(4px)'
            }} 
          />

          {/* Quick View Button on hover */}
          <Box
            className="quick-view-btn"
            onClick={handleQuickViewClick}
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              opacity: 0,
              transform: 'translateY(-8px)',
              transition: 'all 0.25s ease',
              bgcolor: 'rgba(255,255,255,0.95)',
              borderRadius: '50%',
              p: 0.8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'primary.main', color: 'common.white', transform: 'scale(1.1)' }
            }}
            title="Quick View"
          >
            <VisibilityIcon sx={{ fontSize: 20 }} />
          </Box>
        </Box>

        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 2.5 }}>
          <Box>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 700, 
                fontSize: '1rem', 
                mb: 1.2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.4,
                color: 'text.primary'
              }}
            >
              {name}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, pt: 0.5 }}>
              <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800, fontSize: '1.15rem' }}>
                {priceDisplay}
              </Typography>
              <Chip
                size="small"
                variant="outlined"
                label={stock > 0 ? `${stock} available` : (product.restockLeadDays ? `${product.restockLeadDays}d lead time` : 'Stock check')}
                color={stock > 0 ? 'success' : (product.restockLeadDays != null ? 'warning' : 'default')}
                sx={{ fontWeight: 700, fontSize: '0.75rem', borderRadius: 1.5, px: 0.5 }}
              />
            </Box>
          </Box>

          <Button 
            variant="contained" 
            fullWidth 
            color="primary"
            endIcon={<ArrowForwardIcon />}
            sx={{ 
              borderRadius: 2.5, 
              fontWeight: 700, 
              textTransform: 'none', 
              py: 1.1, 
              boxShadow: '0 4px 14px rgba(25, 118, 210, 0.22)',
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: '0 6px 18px rgba(25, 118, 210, 0.35)'
              }
            }}
          >
            View Specs & Order
          </Button>
        </CardContent>
      </Card>

      {/* Quick View Dialog */}
      <Dialog 
        open={quickViewOpen} 
        onClose={handleCloseQuickView}
        onClick={(e) => e.stopPropagation()}
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden', boxShadow: '0 24px 48px rgba(0,0,0,0.18)' } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalOfferIcon color="primary" /> Product Quick View
          </Typography>
          <IconButton onClick={handleCloseQuickView} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        
        <DialogContent sx={{ p: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ borderRadius: 3, overflow: 'hidden', height: '100%', minHeight: 280, bgcolor: '#f8fafc', border: '1px solid', borderColor: 'divider' }}>
                <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: 280 }} />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Chip label={categoryLabel} color="primary" size="small" sx={{ mb: 1.5, fontWeight: 700 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: 'text.primary' }}>
                {name}
              </Typography>
              <Typography variant="h4" color="primary.main" sx={{ fontWeight: 800, mb: 2 }}>
                {priceDisplay}
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Stack spacing={1.5} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <InventoryIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Availability Status: <strong style={{ color: stock > 0 ? '#2e7d32' : '#ed6c02' }}>
                      {stock > 0 ? `${stock} Units In Ready Inventory` : (product.restockLeadDays ? `Manufacture To Order (${product.restockLeadDays} days)` : 'Check warehouse status')}
                    </strong>
                  </Typography>
                </Box>
                {product.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {product.description}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  ✓ Verified industrial standards & packaging compliance.<br/>
                  ✓ Volume discounts & B2B GST invoicing supported on checkout.
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider', gap: 2 }}>
          <Button onClick={handleCloseQuickView} color="inherit" sx={{ fontWeight: 600 }}>
            Continue Browsing
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleNavigateToDetails}
            endIcon={<ArrowForwardIcon />}
            sx={{ fontWeight: 700, px: 4, py: 1.2, borderRadius: 2.5, boxShadow: '0 4px 14px rgba(25, 118, 210, 0.28)' }}
          >
            Full Configuration & Order
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProductCard;

