import { Drawer, Box, Typography, IconButton, Button, Paper, useTheme, CircularProgress, Chip } from '@mui/material';
import { Close, Delete, ShoppingCart, ArrowForward, Warning as WarningIcon } from '@mui/icons-material';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CDN_BASE = import.meta.env.VITE_CDN_BASE_URL || 'https://d1sswqar085ync.cloudfront.net';

const CartDrawer = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    removeCartItem,
    cartLoading,
    priceScale,
    subtotalInrScaled,
    unavailableLineCount,
    formatInr,
  } = useCart();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleViewCart = () => {
    setIsCartOpen(false);
    navigate('/cart');
  };

  const handleContinueShopping = () => {
    setIsCartOpen(false);
    navigate('/products');
  };

  return (
    <Drawer
      anchor="right"
      open={isCartOpen}
      onClose={() => setIsCartOpen(false)}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 420 },
          display: 'flex',
          flexDirection: 'column',
          borderTopLeftRadius: { xs: 0, sm: 24 },
          borderBottomLeftRadius: { xs: 0, sm: 24 },
          overflow: 'hidden'
        }
      }}
    >
      {/* Header */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 3,
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        color: 'white'
      }}>
        <Typography variant="h6" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, letterSpacing: 0.5 }}>
          <ShoppingCart />
          MY CART
          <Box component="span" sx={{ bgcolor: 'rgba(255,255,255,0.2)', px: 1.5, py: 0.5, borderRadius: 5, fontSize: '0.875rem' }}>
            {cartItems.length}
          </Box>
          {cartLoading && <CircularProgress size={18} sx={{ color: 'rgba(255,255,255,0.8)', ml: 1 }} />}
        </Typography>
        <IconButton onClick={() => setIsCartOpen(false)} sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
          <Close />
        </IconButton>
      </Box>

      {/* Unavailable warning banner */}
      {unavailableLineCount > 0 && (
        <Box sx={{ bgcolor: 'error.light', px: 2.5, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon sx={{ fontSize: 18, color: 'error.dark' }} />
          <Typography variant="caption" fontWeight={700} color="error.dark">
            {unavailableLineCount} line{unavailableLineCount > 1 ? 's' : ''} unavailable — view cart to fix
          </Typography>
        </Box>
      )}

      {cartItems.length === 0 ? (
        /* Empty State */
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', p: 4, textAlign: 'center' }}>
          <Box sx={{ width: 120, height: 120, borderRadius: '50%', bgcolor: 'primary.50', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <ShoppingCart sx={{ fontSize: 60, color: 'primary.main', opacity: 0.8 }} />
          </Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 1, color: 'text.primary' }}>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 250 }}>
            Looks like you haven't added anything to your cart yet.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleContinueShopping}
            sx={{ borderRadius: 8, px: 4, py: 1.5, fontWeight: 700, textTransform: 'none' }}
          >
            Start Shopping
          </Button>
        </Box>
      ) : (
        <>
          {/* Cart Items List */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 3, bgcolor: '#fafafa' }}>
            {cartItems.map((item) => {
              const isUnavailable = !item.available;
              const imageUrl = item.primaryImageUrl ? `${CDN_BASE}/${item.primaryImageUrl}` : null;

              return (
                <Paper
                  key={item.packagingOptionId}
                  elevation={0}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    mb: 2,
                    p: 2,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: isUnavailable ? 'error.light' : 'divider',
                    bgcolor: isUnavailable ? '#FFF8F8' : '#ffffff',
                    opacity: isUnavailable ? 0.75 : 1,
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: isUnavailable ? 'error.main' : 'primary.main',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }
                  }}
                >
                  {/* Product image */}
                  {imageUrl ? (
                    <Box component="img" src={imageUrl} alt={item.name} sx={{ width: 70, height: 70, objectFit: 'contain', borderRadius: 2, border: '1px solid #E2ECF5', bgcolor: '#f8fafc', p: 0.5 }} />
                  ) : (
                    <Box sx={{ width: 70, height: 70, bgcolor: 'grey.100', borderRadius: 2, flexShrink: 0 }} />
                  )}

                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1.2, mb: 0.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.mpn || item.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Qty: {item.quantity}
                      {item.packagingType && ` · ${item.packagingType.replace(/_/g, ' ')}`}
                    </Typography>

                    {/* Backorder badge */}
                    {item.backorder && item.available && (
                      <Chip label="Backorder" size="small" color="warning" sx={{ width: 'fit-content', fontSize: '0.6rem', fontWeight: 700, mb: 0.5 }} />
                    )}

                    {/* Unavailable badge */}
                    {isUnavailable && (
                      <Chip icon={<WarningIcon />} label={item.reason?.replace(/_/g, ' ') || 'Unavailable'} size="small" color="error" sx={{ width: 'fit-content', fontSize: '0.6rem', fontWeight: 700, mb: 0.5 }} />
                    )}

                    {/* Line total */}
                    <Typography variant="subtitle2" fontWeight={800} color={isUnavailable ? 'text.disabled' : 'primary.main'}>
                      {isUnavailable ? '—' : formatInr(item.lineTotalInrScaled, priceScale)}
                    </Typography>
                  </Box>

                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => removeCartItem(item.packagingOptionId)}
                    disabled={cartLoading}
                    sx={{ alignSelf: 'flex-start', bgcolor: 'error.50', '&:hover': { bgcolor: 'error.100' } }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Paper>
              );
            })}
          </Box>

          {/* Footer actions */}
          <Paper elevation={12} sx={{ p: 3, borderRadius: 0, borderTop: '1px solid', borderColor: 'divider', zIndex: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" fontWeight={600} color="text.secondary">Cart Total (INR)</Typography>
              <Typography variant="h5" fontWeight={800} color="text.primary">
                {formatInr(subtotalInrScaled, priceScale)}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2.5, fontStyle: 'italic' }}>
              Available lines only · Final charges in INR via Razorpay
            </Typography>

            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              endIcon={<ArrowForward />}
              sx={{ mb: 1.5, borderRadius: 2, py: 1.5, fontWeight: 700, fontSize: '1.05rem', textTransform: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
              onClick={handleCheckout}
              disabled={unavailableLineCount > 0}
            >
              {unavailableLineCount > 0 ? 'Fix items first' : 'Secure Checkout'}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              size="large"
              sx={{ borderRadius: 2, py: 1.2, fontWeight: 700, textTransform: 'none', borderWidth: 2, '&:hover': { borderWidth: 2 } }}
              onClick={handleViewCart}
            >
              View Full Cart
            </Button>
          </Paper>
        </>
      )}
    </Drawer>
  );
};

export default CartDrawer;
