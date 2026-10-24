import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Stepper, Step, StepLabel, Button,
  Divider, Alert, Chip, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, List, ListItem, ListItemText, RadioGroup, FormControlLabel,
  Radio, CircularProgress, Container, Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import notification from '../utils/notification';
import AddressManager from '../components/checkout/AddressManager';
import { useAuth } from '../context/AuthContext';
import { VerifiedUser as SecurityIcon, LocalShipping as ShippingIcon, Warning as WarningIcon } from '@mui/icons-material';
import { formatTotal, formatPaisaToRupee } from '../utils/priceUtils';
import { orderService, userService, cartService } from '../services/apiServices';
import { GST_STATES } from '../constants/gstStates';

const CDN_BASE = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_CDN_BASE_URL) || 'https://d3qrireo7rmkke.cloudfront.net';

const steps = ['Corporate Shipping Destination', 'Order Verification & Terms', 'Gateway Authorization'];

const Checkout = () => {
  const [activeStep, setActiveStep] = useState(0);
  const {
    cartItems, priceScale, responseCurrency,
    subtotalInrScaled, gstTotalInrScaled,
    grandTotalScaled, grandTotalInrScaled,
    deliveryEstimate, fetchCart,
    formatInr, formatUnitPrice,
  } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [customerNote, setCustomerNote] = useState('');
  const isNonInr = responseCurrency && responseCurrency !== 'INR';

  const [placing, setPlacing] = useState(false);

  // ─── Backorder acknowledgement dialog ──────────────────────────────────
  const [backorderDialog, setBackorderDialog] = useState(null);

  // ─── Multiple-GSTIN picker dialog ──────────────────────────────────────
  const [taxDialog, setTaxDialog] = useState(false);
  const [taxDetails, setTaxDetails] = useState([]);
  const [selectedTaxDetailId, setSelectedTaxDetailId] = useState(null);
  const [taxLoading, setTaxLoading] = useState(false);

  // ─── Pending-order-conflict dialog (409) ───────────────────────────────
  const [pendingConflict, setPendingConflict] = useState(null);

  // ─── Price change conflict dialog (409 expectedGrandTotal mismatch) ────
  const [priceConflict, setPriceConflict] = useState(null); // { newBreakdown, newGrandTotal }

  // ─── Delivery 503 unavailable dialog ────────────────────────────────────
  const [deliveryUnavailable, setDeliveryUnavailable] = useState(false);

  // ─── Payment gateway 502 error dialog ───────────────────────────────────
  const [gatewayError, setGatewayError] = useState(null);

  React.useEffect(() => {
    if (!user) {
      notification.info('Please sign in to your enterprise account to complete B2B authorization.');
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    if (cartItems.length === 0 && activeStep === 0) {
      navigate('/products');
    }
  }, [user, cartItems.length, activeStep, navigate]);

  // When selectedAddress changes, refresh cart with selected address's stateCode for precise delivery calculation
  useEffect(() => {
    if (selectedAddress?.stateCode) {
      fetchCart(undefined, selectedAddress.stateCode);
    }
  }, [selectedAddress, fetchCart]);

  if (!user || (cartItems.length === 0 && activeStep === 0)) return null;

  const handleNext = () => {
    if (activeStep === 0) {
      if (!selectedAddress) {
        notification.warning('Please select a warehouse shipping destination to proceed.');
        return;
      }
      setActiveStep(1);
    } else if (activeStep === 1) {
      placeOrder({});
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Calculate server's expected grand total for mandatory placement validation
  const getExpectedGrandTotal = () => {
    if (deliveryEstimate?.estimatedGrandTotal != null) {
      return typeof deliveryEstimate.estimatedGrandTotal === 'number'
        ? deliveryEstimate.estimatedGrandTotal
        : parseInt(deliveryEstimate.estimatedGrandTotal, 10);
    }
    return grandTotalInrScaled || subtotalInrScaled;
  };

  // ─── Core order placement ───────────────────────────────────────────────
  const placeOrder = async (overrides) => {
    if (!selectedAddress) return;
    if (user && user.emailVerified === false) {
      notification.warning('Email verification is required before placing an order.');
      navigate('/verify-email', { state: { redirect: '/checkout' } });
      return;
    }
    setPlacing(true);
    try {
      const payload = {
        shippingAddressId: selectedAddress.id,
        billingAddressId: null,
        taxDetailId: null,
        backorderAcknowledged: false,
        customerNote: customerNote || null,
        expectedGrandTotal: getExpectedGrandTotal(), // Mandatory field per Delivery GST Guide §6
        ...overrides,
      };
      const data = await orderService.createOrder(payload);
      window.location.href = data.paymentLinkUrl;
    } catch (err) {
      handlePlacementError(err);
    } finally {
      setPlacing(false);
    }
  };

  const handlePlacementError = (err) => {
    const status = err?.response?.status;
    const data = err?.response?.data;

    // V033: Unverified email tried to place an order (403 EMAIL_NOT_VERIFIED)
    if (status === 403 && (data?.title === 'EMAIL_NOT_VERIFIED' || data?.detail?.toLowerCase().includes('verify'))) {
      notification.warning('Please verify your email address before placing your order.');
      navigate('/verify-email', { state: { redirect: '/checkout' } });
      return;
    }

    // Delivery GST Guide §6 / §9 503 Delivery rate not configured
    if (status === 503) {
      setDeliveryUnavailable(true);
      return;
    }

    // 502 Bad Gateway: Upstream payment gateway (Razorpay) error / unconfigured
    if (status === 502) {
      setGatewayError(data?.detail || 'Payment gateway connection failed. Please ensure the payment gateway is configured.');
      return;
    }

    if (status === 400 && data) {
      const title = (data.title || '').toUpperCase();
      const detail = (data.detail || '').toLowerCase();

      if (title.includes('BACKORDER') || detail.includes('backorder')) {
        const lines = data.lines || data.backorderedItems || data.items || [];
        setBackorderDialog({ lines, raw: data });
        return;
      }

      if (title.includes('TAX') || title.includes('GSTIN') || detail.includes('gstin') || detail.includes('tax detail')) {
        loadTaxDetails();
        return;
      }
    }

    if (status === 409 && data) {
      // Check if 409 is due to expectedGrandTotal price change or pending order
      if (data.amounts || data.recomputedTotal != null || data.newGrandTotal != null) {
        const newTotal = data.amounts?.grandTotalInrScaled || data.recomputedTotal || data.newGrandTotal;
        setPriceConflict({
          newBreakdown: data.amounts || data,
          newGrandTotal: newTotal
        });
        return;
      }

      setPendingConflict({
        orderNumber: data.orderNumber,
        existingOrderId: data.existingOrderId,
        paymentLinkUrl: data.paymentLinkUrl,
        linkExpiresAt: data.linkExpiresAt,
        cartMatchesOrder: data.cartMatchesOrder,
      });
      return;
    }
  };

  const handleConfirmPriceConflict = () => {
    if (!priceConflict) return;
    const newTotal = priceConflict.newGrandTotal;
    setPriceConflict(null);
    placeOrder({ expectedGrandTotal: newTotal });
  };

  const handleAcknowledgeBackorder = () => {
    setBackorderDialog(null);
    placeOrder({ backorderAcknowledged: true });
  };

  const loadTaxDetails = async () => {
    setTaxLoading(true);
    try {
      const addressId = selectedAddress.id;
      const res = await userService.getTaxDetails(addressId);
      const list = Array.isArray(res) ? res : (res?.content || res?.data || []);
      setTaxDetails(list);
      setSelectedTaxDetailId(list[0]?.id ?? null);
      setTaxDialog(true);
    } catch {
      notification.error('Failed to load GST registrations for this address.');
    } finally {
      setTaxLoading(false);
    }
  };

  const handleConfirmTaxDetail = () => {
    if (!selectedTaxDetailId) {
      notification.warning('Please select a GST registration to continue.');
      return;
    }
    setTaxDialog(false);
    placeOrder({ taxDetailId: selectedTaxDetailId });
  };

  const isLinkExpired = (expiresAt) => expiresAt && new Date(expiresAt).getTime() < Date.now();

  const handleResumePayment = () => {
    if (pendingConflict?.paymentLinkUrl && !isLinkExpired(pendingConflict.linkExpiresAt)) {
      window.location.href = pendingConflict.paymentLinkUrl;
    } else {
      notification.warning('That payment link has expired. Please cancel and start a new order.');
    }
  };

  const isGujarat = selectedAddress?.stateCode === '24';
  const stateObj = GST_STATES.find(s => s.code === selectedAddress?.stateCode);

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3, fontWeight: 600 }}>
              Industrial deliveries require a recipient facility address with loading bay access or standard business receiving hours.
            </Alert>
            <AddressManager onSelectAddress={(addr) => setSelectedAddress(addr)} />
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" fontWeight={800} color="primary.main" gutterBottom>
              Verify Component Specifications &amp; Logistics Terms
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please review all line items for part number accuracy and RoHS compliance prior to generating financial accounting transactions.
            </Typography>

            <Paper elevation={0} sx={{ border: '1px solid #D6E4EE', borderRadius: 1.5, overflow: 'hidden', mb: 4 }}>
              <Box sx={{ p: 2, bgcolor: '#EDF4FA', borderBottom: '2px solid #243A5E', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" fontWeight={800} color="primary.main" textTransform="uppercase">
                  Manifest Items ({cartItems.reduce((a, c) => a + c.quantity, 0)} Total Units)
                </Typography>
                <Chip label={`TAX SPLIT: ${isGujarat ? 'CGST + SGST (Intra-State)' : 'IGST (Inter-State)'}`} size="small" color="primary" sx={{ fontWeight: 800, fontSize: '0.65rem' }} />
              </Box>

              <Box sx={{ p: 2.5 }}>
                {cartItems.map((item) => (
                  <Box key={item.packagingOptionId} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px dashed #D6E4EE' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {item.primaryImageUrl && (
                        <Box sx={{ width: 48, height: 38, border: '1px solid #E2ECF5', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 0.5, bgcolor: '#ffffff' }}>
                          <Box component="img" src={item.primaryImageUrl?.startsWith('http') ? item.primaryImageUrl : `${CDN_BASE}/${item.primaryImageUrl}`} alt={item.name} sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        </Box>
                      )}
                      <Box>
                        <Typography variant="body2" fontWeight={800} color="primary.main">{item.mpn || item.name}</Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Quantity: {item.quantity} Units • Unit Rate: {formatUnitPrice(item.unitPriceInrScaled, priceScale, '₹')}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body1" fontWeight={800} color="primary.dark">{formatInr(item.lineTotalInrScaled, priceScale)}</Typography>
                  </Box>
                ))}

                {/* Subtotal & Delivery breakdown per Delivery GST Guide §7 */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, pt: 1 }}>
                  <Typography variant="body2" fontWeight={700} color="text.secondary">Goods Subtotal (ex-GST)</Typography>
                  <Typography variant="body1" fontWeight={800}>{formatInr(subtotalInrScaled, priceScale)}</Typography>
                </Box>

                {deliveryEstimate && (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 0.8 }}>
                      <Typography variant="body2" fontWeight={700} color="text.secondary">Consignment Weight</Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {deliveryEstimate.totalWeightG != null 
                          ? (deliveryEstimate.totalWeightG >= 1000 
                              ? `${(deliveryEstimate.totalWeightG / 1000).toFixed(2)} kg (${deliveryEstimate.totalWeightG} g)` 
                              : `${deliveryEstimate.totalWeightG} g`)
                          : '—'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 0.8 }}>
                      <Typography variant="body2" fontWeight={700} color="text.secondary">Delivery Cost (ex-GST)</Typography>
                      <Typography variant="body1" fontWeight={700}>
                        {formatPaisaToRupee(deliveryEstimate.deliveryExGst)}
                      </Typography>
                    </Box>
                  </>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 0.8 }}>
                  <Typography variant="body2" fontWeight={700} color="text.secondary">
                    {isGujarat ? 'CGST (9%) + SGST (9%)' : 'IGST (18%)'}
                  </Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {formatInr(gstTotalInrScaled, priceScale)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, mt: 2, borderTop: '2px solid #243A5E' }}>
                  <Typography variant="h6" fontWeight={900}>Authorized Total Payable</Typography>
                  <Box sx={{ textAlign: 'right' }}>
                    {isNonInr && (
                      <Typography variant="body2" color="text.secondary" fontWeight={700}>
                        ≈ {formatTotal(grandTotalScaled, priceScale, responseCurrency)}
                      </Typography>
                    )}
                    <Typography variant="h5" fontWeight={900} color="primary.main">
                      ₹{(getExpectedGrandTotal() / 10000).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
                <Alert severity="info" icon={false} sx={{ mt: 2, py: 0.5, fontSize: '0.75rem', fontWeight: 700 }}>
                  Grand total includes goods + delivery + GST. Charged in INR.
                </Alert>
              </Box>
            </Paper>

            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Order Note (Optional)"
              placeholder="Delivery instructions, PO reference, etc."
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              sx={{ mb: 3 }}
            />

            {selectedAddress && (
              <Paper elevation={0} sx={{ p: 3, bgcolor: '#EDF4FA', border: '1px solid #D6E4EE', borderRadius: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ShippingIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight={900} color="primary.main" textTransform="uppercase">
                    Designated Corporate Shipping Facility
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.primary" fontWeight={800}>{selectedAddress.label || 'Corporate Headquarters / Receiving Bay'}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{selectedAddress.line1}{selectedAddress.line2 ? `, ${selectedAddress.line2}` : ''}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedAddress.city}, {stateObj?.name || selectedAddress.state} ({selectedAddress.stateCode || '24'}) - {selectedAddress.pincode}, India
                </Typography>
                {selectedAddress.phone && <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mt: 1, display: 'block' }}>Dispatch Contact Phone: {selectedAddress.phone}</Typography>}
              </Paper>
            )}
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, pb: 12 }}>
      <Box sx={{ mb: 4, borderBottom: '2px solid #243A5E', pb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>
          Corporate Procurement Authorization
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          Follow standard B2B purchasing protocols to confirm inventory reservation and financial clearing.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, bgcolor: '#ffffff', border: '1px solid #D6E4EE', borderRadius: 2, mb: 4 }}>
        {user && user.emailVerified === false && (
          <Alert 
            severity="warning" 
            sx={{ mb: 4, borderRadius: 2, border: '1px solid #FFEDD5' }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => navigate('/verify-email', { state: { redirect: '/checkout' } })}
                sx={{ fontWeight: 800 }}
              >
                Verify Email Now
              </Button>
            }
          >
            <strong>Email verification required:</strong> Your email address ({user.email}) must be verified before placing an order.
          </Alert>
        )}

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel slotProps={{
                stepIcon: { sx: { '&.Mui-active': { color: 'secondary.main' }, '&.Mui-completed': { color: 'primary.main' } } }
              }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>{label}</Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: 280 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            disabled={activeStep === 0 || placing}
            onClick={handleBack}
            variant="outlined"
            sx={{ fontWeight: 800, borderWidth: 2 }}
          >
            ← PREVIOUS STEP
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            size="large"
            disabled={placing}
            sx={{ px: 5, py: 1.4, fontWeight: 900, fontSize: '0.9375rem', boxShadow: '0 4px 14px rgba(36, 58, 94, 0.25)' }}
          >
            {placing ? (
              <>
                <CircularProgress size={18} color="inherit" sx={{ mr: 1.5 }} />
                Placing Order…
              </>
            ) : activeStep === steps.length - 2 ? (
              'PLACE ORDER & PAY →'
            ) : (
              'CONFIRM WAREHOUSE ADDRESS →'
            )}
          </Button>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, opacity: 0.8 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon sx={{ color: 'primary.main', fontSize: 18 }} />
          <Typography variant="caption" sx={{ fontWeight: 700 }}>PCI-DSS Level 1 Financial Security</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShippingIcon sx={{ color: 'primary.main', fontSize: 18 }} />
          <Typography variant="caption" sx={{ fontWeight: 700 }}>Direct OEM Factory Traceability</Typography>
        </Box>
      </Box>

      {/* ── 409 Expected Grand Total Price Change Conflict Dialog ── */}
      <Dialog open={!!priceConflict} onClose={() => setPriceConflict(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Order Total Updated</DialogTitle>
        <DialogContent dividers>
          <Alert severity="warning" sx={{ mb: 2 }}>
            The order total has changed due to updated delivery rates or pricing tiers. Please review the updated total before proceeding.
          </Alert>
          <Typography variant="h6" fontWeight={800} color="primary.main">
            New Grand Total: ₹{(priceConflict?.newGrandTotal / 10000).toFixed(2)}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPriceConflict(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmPriceConflict}>Confirm New Total &amp; Pay</Button>
        </DialogActions>
      </Dialog>

      {/* ── 503 Delivery Unavailable Dialog ── */}
      <Dialog open={deliveryUnavailable} onClose={() => setDeliveryUnavailable(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: 'error.main' }}>Delivery Unavailable</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            Delivery rates are not configured for this shipping zone yet. Please contact support or try again later.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="contained" onClick={() => setDeliveryUnavailable(false)}>OK</Button>
        </DialogActions>
      </Dialog>

      {/* ── 502 Payment Gateway Error Dialog ── */}
      <Dialog open={!!gatewayError} onClose={() => setGatewayError(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" /> Payment Gateway Unavailable (502)
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
            {gatewayError}
          </Typography>
          <Alert severity="warning" sx={{ mb: 1.5 }}>
            The order could not be placed because the server's payment link generator (Razorpay) failed to initiate a transaction.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            For development or testing, ensure <code>KDS_RAZORPAY_KEY_ID</code> and <code>KDS_RAZORPAY_KEY_SECRET</code> are provided in the backend's environment variables.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="contained" onClick={() => setGatewayError(null)}>OK</Button>
        </DialogActions>
      </Dialog>

      {/* ── Backorder acknowledgement dialog ── */}
      <Dialog open={!!backorderDialog} onClose={() => setBackorderDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Some Items Are Backordered</DialogTitle>
        <DialogContent dividers>
          <Alert severity="warning" sx={{ mb: 2 }}>
            The following lines exceed current available stock and will ship once restocked.
          </Alert>
          {backorderDialog?.lines?.length > 0 ? (
            <List dense>
              {backorderDialog.lines.map((line, idx) => (
                <ListItem key={line.packagingOptionId ?? idx}>
                  <ListItemText
                    primary={`Packaging option #${line.packagingOptionId}`}
                    secondary={line.restockLeadDays != null ? `Estimated restock: ${line.restockLeadDays} day(s)` : null}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">{backorderDialog?.raw?.detail}</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setBackorderDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleAcknowledgeBackorder}>Acknowledge &amp; Continue</Button>
        </DialogActions>
      </Dialog>

      {/* ── Multiple GSTIN picker dialog ── */}
      <Dialog open={taxDialog} onClose={() => setTaxDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Select GST Registration</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This billing address has multiple active GST registrations. Please select which one applies to this order.
          </Typography>
          {taxLoading ? (
            <CircularProgress size={24} />
          ) : (
            <RadioGroup value={selectedTaxDetailId ?? ''} onChange={(e) => setSelectedTaxDetailId(Number(e.target.value))}>
              {taxDetails.map((td) => (
                <FormControlLabel
                  key={td.id}
                  value={td.id}
                  control={<Radio />}
                  label={`${td.taxIdValue || td.gstin || 'GSTIN'} — ${td.legalName || td.taxLegalName || ''}`}
                />
              ))}
            </RadioGroup>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setTaxDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmTaxDetail} disabled={taxLoading}>Confirm &amp; Continue</Button>
        </DialogActions>
      </Dialog>

      {/* ── Pending order conflict dialog ── */}
      <Dialog open={!!pendingConflict} onClose={() => setPendingConflict(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>You Already Have a Pending Order</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            Order <strong>{pendingConflict?.orderNumber}</strong> is still awaiting payment.
            {pendingConflict?.cartMatchesOrder
              ? ' Your current cart matches that order exactly.'
              : ' Your cart has changed since that order was placed.'}
          </Typography>
          {pendingConflict?.paymentLinkUrl && !isLinkExpired(pendingConflict?.linkExpiresAt) ? (
            <Alert severity="info">You can resume payment on the existing order below.</Alert>
          ) : (
            <Alert severity="warning">
              This order will automatically clear once its payment link expires. Please check back later or ask an admin.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPendingConflict(null)} disabled={placing}>Close</Button>
          {pendingConflict?.paymentLinkUrl && !isLinkExpired(pendingConflict?.linkExpiresAt) && (
            <Button variant="contained" onClick={handleResumePayment} disabled={placing}>Resume Payment</Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Checkout;
