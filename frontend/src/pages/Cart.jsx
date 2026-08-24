import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Divider, Grid,
  Chip, Alert, CircularProgress, Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCartCheckout as CheckoutIcon,
  Description as QuoteIcon,
  LocalShipping as ShippingIcon,
  VerifiedUser as SecurityIcon,
  Build as FixIcon,
  Warning as WarningIcon,
  LocalShipping as BackorderIcon,
  DeleteSweep as ClearIcon,
} from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState';
import notification from '../utils/notification';
import { useAuth } from '../context/AuthContext';
import { formatTotal } from '../utils/priceUtils';

const CDN_BASE = import.meta.env.VITE_CDN_BASE_URL || 'https://d1sswqar085ync.cloudfront.net';

// ─── Reason badge renderer ────────────────────────────────────────────────────
const REASON_UI = {
  PACKAGING_INACTIVE: { label: 'No longer available', color: 'error' },
  PRODUCT_INACTIVE:   { label: 'Product discontinued', color: 'error' },
  NO_PRICE:           { label: 'Price on request', color: 'warning' },
  BELOW_MOQ:          { label: 'Below minimum order', color: 'warning' },
  INVALID_MULTIPLE:   { label: 'Invalid quantity multiple', color: 'warning' },
  EXCEEDS_QTY_CAP:    { label: 'Exceeds maximum quantity', color: 'error' },
};

const Cart = () => {
  const {
    cartItems, availableItems, unavailableItems,
    cartLoading, unavailableLineCount, availableLineCount,
    priceScale, subtotalInrScaled, subtotalScaled, responseCurrency,
    removeCartItem, updateCartItem, fixCartItemQuantity, clearCart,
    formatInr, formatUnitPrice,
  } = useCart();

  const { user } = useAuth();
  const navigate = useNavigate();

  // ─── Not logged in ────────────────────────────────────────────────────────
  if (!user) {
    return (
      <Box sx={{ py: 8 }}>
        <EmptyState
          title="Please Log In"
          description="You need to be logged in to view your cart. Your cart is saved server-side."
          actionText="Log In"
          onAction={() => navigate('/login')}
        />
      </Box>
    );
  }

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (cartLoading && cartItems.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 16 }}>
        <CircularProgress size={44} color="primary" />
        <Typography variant="body1" sx={{ mt: 2, fontWeight: 700 }}>Loading your cart...</Typography>
      </Box>
    );
  }

  // ─── Empty ────────────────────────────────────────────────────────────────
  if (!cartLoading && cartItems.length === 0) {
    return (
      <Box sx={{ py: 8 }}>
        <EmptyState
          title="Procurement Cart is Currently Empty"
          description="You have not added any industrial components or BOM specifications to your purchasing manifest."
          actionText="Explore Component Master Catalog"
          onAction={() => navigate('/products')}
        />
      </Box>
    );
  }

  // ─── Quantity stepper helpers ─────────────────────────────────────────────
  const stepDown = (item) => {
    const moq  = item.minOrderQuantity ?? 1;
    const step = item.orderMultiple ?? 1;
    const next = item.quantity - step;
    if (next < moq) return; // floor is MOQ
    updateCartItem(item.packagingOptionId, next);
  };

  const stepUp = (item) => {
    const step = item.orderMultiple ?? 1;
    updateCartItem(item.packagingOptionId, item.quantity + step);
  };

  // ─── Totals ───────────────────────────────────────────────────────────────
  const isNonInr = responseCurrency && responseCurrency !== 'INR';

  // ─── Checkout guard ───────────────────────────────────────────────────────
  const checkoutBlocked = unavailableLineCount > 0;

  const handleConvertToQuote = () => {
    notification.success('Transferred current procurement manifest to B2B Quotations RFQ queue.');
    navigate('/user/quotations');
  };

  // ─── Row renderer ─────────────────────────────────────────────────────────
  const renderRow = (item, isUnavailable = false) => {
    const imageUrl = item.primaryImageUrl ? `${CDN_BASE}/${item.primaryImageUrl}` : null;
    const reasonInfo = REASON_UI[item.reason] ?? null;
    const moq   = item.minOrderQuantity ?? 1;
    const step  = item.orderMultiple ?? 1;
    const canFixQty = item.reason === 'BELOW_MOQ' || item.reason === 'INVALID_MULTIPLE';

    return (
      <TableRow
        key={item.packagingOptionId}
        sx={{
          '&:hover': { bgcolor: '#f8fafc' },
          opacity: isUnavailable ? 0.6 : 1,
          bgcolor: isUnavailable ? '#FFF8F8' : 'inherit',
        }}
      >
        {/* Component Identification */}
        <TableCell sx={{ py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {imageUrl ? (
              <Box sx={{ width: 64, height: 48, border: '1px solid #E2ECF5', borderRadius: 1, p: 0.5, bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Box component="img" src={imageUrl} alt={item.name} sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </Box>
            ) : (
              <Box sx={{ width: 64, height: 48, border: '1px solid #E2ECF5', borderRadius: 1, bgcolor: '#EDF4FA', flexShrink: 0 }} />
            )}
            <Box>
              <Typography
                variant="body2"
                component={RouterLink}
                to={`/product/${item.slug || item.productId}`}
                sx={{ fontWeight: 800, color: 'primary.main', textDecoration: 'underline', '&:hover': { color: 'secondary.main' } }}
              >
                {item.mpn || item.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>
                {item.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {item.manufacturer && `MFR: ${item.manufacturer}`}
                {item.packagingType && ` · ${item.packagingType.replace(/_/g, ' ')}`}
              </Typography>
              {/* Unavailability reason badge */}
              {isUnavailable && reasonInfo && (
                <Chip
                  icon={<WarningIcon />}
                  label={reasonInfo.label}
                  size="small"
                  color={reasonInfo.color}
                  sx={{ mt: 0.5, fontWeight: 700, fontSize: '0.65rem' }}
                />
              )}
            </Box>
          </Box>
        </TableCell>

        {/* Stock / Backorder status */}
        <TableCell align="center">
          {isUnavailable ? (
            <Chip label="⛔ Unavailable" size="small" color="error" variant="outlined" sx={{ fontSize: '0.65rem', fontWeight: 700 }} />
          ) : item.backorder ? (
            <Chip
              icon={<BackorderIcon sx={{ fontSize: '0.8rem !important' }} />}
              label={item.currentStock > 0 ? `${item.currentStock} in stock, rest backorder` : 'Ships when restocked'}
              size="small"
              color="warning"
              sx={{ fontSize: '0.65rem', fontWeight: 700 }}
            />
          ) : (
            <Chip label="🟢 In Stock" size="small" sx={{ fontSize: '0.65rem', fontWeight: 700, bgcolor: '#EDF4FA' }} />
          )}
        </TableCell>

        {/* Quantity stepper */}
        <TableCell align="center">
          {!isUnavailable ? (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #D6E4EE', borderRadius: 1, width: 'fit-content', mx: 'auto', bgcolor: '#fff' }}>
                <Tooltip title={`Min: ${moq}`}>
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => stepDown(item)}
                      disabled={item.quantity <= moq}
                      sx={{ p: 0.4 }}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Typography sx={{ minWidth: 40, textAlign: 'center', fontWeight: 800, fontSize: '0.875rem', px: 0.5 }}>
                  {item.quantity}
                </Typography>
                <Tooltip title={`Step: ${step}`}>
                  <IconButton size="small" onClick={() => stepUp(item)} sx={{ p: 0.4 }}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'center', mt: 0.3 }}>
                MOQ: {moq} · Step: {step}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.disabled' }}>
              {item.quantity}
            </Typography>
          )}
        </TableCell>

        {/* Unit price — 4 decimal places per spec §2 */}
        <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>
          {item.unitPriceInrScaled != null
            ? formatUnitPrice(item.unitPriceInrScaled, priceScale, '₹')
            : <Chip label="No price" size="small" color="warning" />}
        </TableCell>

        {/* Line total */}
        <TableCell align="right" sx={{ fontWeight: 800, color: isUnavailable ? 'text.disabled' : 'primary.dark', fontSize: '0.9375rem' }}>
          {isUnavailable
            ? '—'
            : formatInr(item.lineTotalInrScaled, priceScale)}
        </TableCell>

        {/* Actions */}
        <TableCell align="center">
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            {canFixQty && (
              <Tooltip title="Fix quantity to nearest valid value">
                <IconButton
                  size="small"
                  color="warning"
                  onClick={() => fixCartItemQuantity(item)}
                  aria-label="fix quantity"
                >
                  <FixIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <IconButton
              color="error"
              size="small"
              onClick={() => removeCartItem(item.packagingOptionId)}
              aria-label="remove item from cart"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Box sx={{ py: 4, pb: 10 }}>
      {/* ── Header ── */}
      <Box sx={{ mb: 4, borderBottom: '2px solid #243A5E', pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', textTransform: 'uppercase' }}>
            Procurement Cart &amp; Order Manifest
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            Verify part quantities, wholesale pricing tiers, and warehouse dispatch eligibility prior to corporate authorization.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={`${cartItems.length} COMPONENT LINES`} sx={{ bgcolor: '#EDF4FA', color: 'primary.main', fontWeight: 800 }} />
          {unavailableLineCount > 0 && (
            <Chip
              icon={<WarningIcon />}
              label={`${unavailableLineCount} UNAVAILABLE`}
              color="error"
              sx={{ fontWeight: 800 }}
            />
          )}
        </Box>
      </Box>

      {/* ── Checkout blocked warning ── */}
      {checkoutBlocked && (
        <Alert severity="error" sx={{ mb: 3, fontWeight: 700 }}>
          ⛔ Checkout is blocked: {unavailableLineCount} line{unavailableLineCount > 1 ? 's' : ''} in your cart {unavailableLineCount > 1 ? 'are' : 'is'} unavailable.
          Remove or fix the flagged items to proceed.
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* ── Left: Items table ── */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 1.5, border: '1px solid #D6E4EE', overflowX: 'auto' }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#EDF4FA' }}>
                <TableRow sx={{ '& th': { fontWeight: 800, color: 'primary.main', py: 1.5, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' } }}>
                  <TableCell>Component Identification</TableCell>
                  <TableCell align="center">Stock Status</TableCell>
                  <TableCell align="center">Order Qty</TableCell>
                  <TableCell align="right">Unit Price (INR)</TableCell>
                  <TableCell align="right">Line Total (INR)</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Available lines */}
                {availableItems.map((item) => renderRow(item, false))}

                {/* Separator when both groups present */}
                {unavailableItems.length > 0 && availableItems.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ py: 1, bgcolor: '#FFF8F8', fontWeight: 800, color: 'error.main', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      ⚠️ Unavailable Lines — remove these to enable checkout
                    </TableCell>
                  </TableRow>
                )}

                {/* Unavailable lines */}
                {unavailableItems.map((item) => renderRow(item, true))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Clear cart */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              size="small"
              color="error"
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearCart}
              disabled={cartLoading}
              sx={{ fontWeight: 700 }}
            >
              Clear Cart
            </Button>
          </Box>

          <Alert severity="info" sx={{ mt: 2, fontWeight: 600 }}>
            ⚡ Enterprise Advantage: Ordering over ₹10,000 in bulk? Our automated engine applies custom tiered packaging discounts at checkout!
          </Alert>
        </Grid>

        {/* ── Right: Totals & checkout ── */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: 2, border: '2px solid #243A5E', bgcolor: '#ffffff' }}>
            <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 900, color: 'primary.main', textTransform: 'uppercase' }}>
              Procurement Valuation
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
                Available lines ({availableLineCount}):
              </Typography>
              <Typography fontWeight={800} color="primary.main">
                {formatInr(subtotalInrScaled, priceScale)}
              </Typography>
            </Box>

            {/* Show display-currency equivalent when not INR */}
            {isNonInr && subtotalScaled != null && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
                  ≈ in {responseCurrency}:
                </Typography>
                <Typography fontWeight={700} color="text.secondary">
                  {formatTotal(subtotalScaled, priceScale, responseCurrency)}
                </Typography>
              </Box>
            )}

            {unavailableLineCount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography color="error" sx={{ fontWeight: 600 }}>
                  Unavailable lines excluded:
                </Typography>
                <Typography fontWeight={700} color="error">
                  {unavailableLineCount}
                </Typography>
              </Box>
            )}

            {/* INR charge notice (spec §1 — required at checkout entry) */}
            <Alert severity="info" icon={false} sx={{ mb: 2, py: 0.5, fontSize: '0.75rem', fontWeight: 700 }}>
              You will be charged in INR: {formatInr(subtotalInrScaled, priceScale)}
            </Alert>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
              <Typography variant="h6" fontWeight={900}>Net Order Total:</Typography>
              <Typography variant="h5" fontWeight={900} color="primary.main">
                {formatInr(subtotalInrScaled, priceScale)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Tooltip title={checkoutBlocked ? 'Remove unavailable items to proceed' : ''} placement="top">
                <span style={{ width: '100%' }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<CheckoutIcon />}
                    onClick={() => navigate('/checkout')}
                    disabled={checkoutBlocked || cartLoading}
                    sx={{ py: 1.6, borderRadius: 1, fontWeight: 900, fontSize: '1rem', boxShadow: '0 4px 12px rgba(36, 58, 94, 0.25)' }}
                  >
                    AUTHORIZE CHECKOUT
                  </Button>
                </span>
              </Tooltip>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                startIcon={<QuoteIcon />}
                onClick={handleConvertToQuote}
                sx={{ py: 1.2, fontWeight: 800, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
              >
                GENERATE CORPORATE QUOTE (RFQ)
              </Button>
            </Box>

            <Box sx={{ mt: 3, pt: 2, borderTop: '1px dashed #D6E4EE', display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SecurityIcon sx={{ fontSize: 18, color: 'success.main' }} />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>256-Bit SSL Encrypted Corporate Gateway</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShippingIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Full Lot Traceability &amp; ISO Certificate Inclusion</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {cartLoading && (
        <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
          <Paper elevation={6} sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: 2 }}>
            <CircularProgress size={18} />
            <Typography variant="body2" fontWeight={700}>Updating cart…</Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default Cart;
