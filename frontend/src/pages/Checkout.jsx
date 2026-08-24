import React, { useState } from 'react';
import {
  Box, Typography, Paper, Stepper, Step, StepLabel, Button,
  Divider, Alert, Chip, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, List, ListItem, ListItemText, RadioGroup, FormControlLabel,
  Radio, CircularProgress
} from '@mui/material';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import notification from '../utils/notification';
import AddressManager from '../components/checkout/AddressManager';
import { useAuth } from '../context/AuthContext';
import { VerifiedUser as SecurityIcon, LocalShipping as ShippingIcon } from '@mui/icons-material';
import { formatTotal } from '../utils/priceUtils';
import { orderService, userService } from '../services/apiServices';

const steps = ['Corporate Shipping Destination', 'Order Verification & Terms', 'Gateway Authorization'];

const Checkout = () => {
  const [activeStep, setActiveStep] = useState(0);
  const {
    cartItems, priceScale, responseCurrency,
    subtotalInrScaled, gstTotalInrScaled,
    grandTotalScaled, grandTotalInrScaled,
    formatInr, formatUnitPrice,
  } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [customerNote, setCustomerNote] = useState('');
  const isNonInr = responseCurrency && responseCurrency !== 'INR';

  const [placing, setPlacing] = useState(false);

  // ─── Backorder acknowledgement dialog ──────────────────────────────────
  const [backorderDialog, setBackorderDialog] = useState(null); // { lines: [{packagingOptionId, restockLeadDays}] }

  // ─── Multiple-GSTIN picker dialog ──────────────────────────────────────
  const [taxDialog, setTaxDialog] = useState(false);
  const [taxDetails, setTaxDetails] = useState([]);
  const [selectedTaxDetailId, setSelectedTaxDetailId] = useState(null);
  const [taxLoading, setTaxLoading] = useState(false);

  // ─── Pending-order-conflict dialog (409) ───────────────────────────────
  const [pendingConflict, setPendingConflict] = useState(null); // { orderNumber, paymentLinkUrl, linkExpiresAt, cartMatchesOrder }

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

  if (!user || (cartItems.length === 0 && activeStep === 0)) return null;

  const handleNext = () => {
    if (activeStep === 0) {
      if (!selectedAddress || user.profileComplete === false) {
        notification.warning('Please select an approved corporate warehouse shipping destination to proceed.');
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

  // ─── Core order placement ───────────────────────────────────────────────
  const placeOrder = async (overrides) => {
    if (!selectedAddress) return;
    setPlacing(true);
    try {
      const payload = {
        shippingAddressId: selectedAddress.id,
        billingAddressId: null,
        taxDetailId: null,
        backorderAcknowledged: false,
        customerNote: customerNote || null,
        ...overrides,
      };
      const data = await orderService.createOrder(payload);
      // Success — redirect the browser to Razorpay's hosted payment link.
      // Do NOT clear the cart here: the order's real payment_status is set
      // asynchronously by the webhook, and clearCart() would desync local
      // state if the customer bounces back before paying (guide §1).
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

    if (status === 400 && data) {
      const title = (data.title || '').toUpperCase();
      const detail = (data.detail || '').toLowerCase();

      if (title.includes('BACKORDER') || detail.includes('backorder')) {
        // Expected shape: affected packagingOptionIds + restockLeadDays,
        // exact field name isn't pinned down by the guide, so read
        // defensively from a few likely keys.
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
      setPendingConflict({
        orderNumber: data.orderNumber,
        existingOrderId: data.existingOrderId,
        paymentLinkUrl: data.paymentLinkUrl,
        linkExpiresAt: data.linkExpiresAt,
        cartMatchesOrder: data.cartMatchesOrder,
      });
      return;
    }
    // Other errors are already toasted by axiosClient's interceptor.
  };

  // ─── Backorder ack flow ─────────────────────────────────────────────────
  const handleAcknowledgeBackorder = () => {
    setBackorderDialog(null);
    placeOrder({ backorderAcknowledged: true });
  };

  // ─── Multi-GSTIN flow ────────────────────────────────────────────────────
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

  // ─── Pending-order-conflict flow ────────────────────────────────────────
  const isLinkExpired = (expiresAt) => expiresAt && new Date(expiresAt).getTime() < Date.now();

  const handleResumePayment = () => {
    if (pendingConflict?.paymentLinkUrl && !isLinkExpired(pendingConflict.linkExpiresAt)) {
      window.location.href = pendingConflict.paymentLinkUrl;
    } else {
      notification.warning('That payment link has expired. Please cancel and start a new order.');
    }
  };

  // TODO(backend-missing): No backend endpoint for
  // POST /orders/{orderNumber}/cancel (OrderController has no cancel
  // method) — see orderService.cancelOrder in apiServices.js (commented
  // out there too). Until that exists, a stuck PENDING order can only
  // clear itself via AbandonmentSweepJob, which needs the payment link to
  // be dead for kds.payment.link-ttl (2h) before it's swept, checked every
  // kds.payment.sweep-interval (30m) — so this dialog can only tell the
  // customer to wait, not actually cancel anything.
  // const handleCancelAndRestart = async () => {
  //   try {
  //     setPlacing(true);
  //     await orderService.cancelOrder(pendingConflict.orderNumber);
  //     setPendingConflict(null);
  //     notification.success('Previous pending order cancelled. Placing a new order…');
  //     await placeOrder({});
  //   } catch {
  //     notification.error('Failed to cancel the previous order.');
  //   } finally {
  //     setPlacing(false);
  //   }
  // };

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
              Verify Component Specifications & Logistics Terms
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please review all line items for part number accuracy and RoHS compliance prior to generating financial accounting transactions.
            </Typography>

            <Paper elevation={0} sx={{ border: '1px solid #D6E4EE', borderRadius: 1.5, overflow: 'hidden', mb: 4 }}>
              <Box sx={{ p: 2, bgcolor: '#EDF4FA', borderBottom: '2px solid #243A5E', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" fontWeight={800} color="primary.main" textTransform="uppercase">
                  Manifest Items ({cartItems.reduce((a, c) => a + c.quantity, 0)} Total Units)
                </Typography>
                <Chip label="ISO CERTIFIED SUPPLY CHAIN" size="small" sx={{ bgcolor: '#ffffff', fontWeight: 800, fontSize: '0.65rem' }} />
              </Box>

              <Box sx={{ p: 2.5 }}>
                {cartItems.map((item) => (
                  <Box key={item.packagingOptionId} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px dashed #D6E4EE' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {item.primaryImageUrl && (
                        <Box sx={{ width: 48, height: 38, border: '1px solid #E2ECF5', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 0.5, bgcolor: '#ffffff' }}>
                          <Box component="img" src={`https://d1sswqar085ync.cloudfront.net/${item.primaryImageUrl}`} alt={item.name} sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
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

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, pt: 1 }}>
                  <Typography variant="body2" fontWeight={700} color="text.secondary">Net Subtotal</Typography>
                  <Typography variant="body1" fontWeight={800}>{formatInr(subtotalInrScaled, priceScale)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 0.8 }}>
                  <Typography variant="body2" fontWeight={700} color="text.secondary">GST</Typography>
                  <Typography variant="body1" fontWeight={700}>{formatInr(gstTotalInrScaled, priceScale)}</Typography>
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
                      {formatInr(grandTotalInrScaled, priceScale)}
                    </Typography>
                  </Box>
                </Box>
                <Alert severity="info" icon={false} sx={{ mt: 2, py: 0.5, fontSize: '0.75rem', fontWeight: 700 }}>
                  You will be charged {formatInr(grandTotalInrScaled, priceScale)} in INR — the {isNonInr ? `${responseCurrency} figure` : 'total'} above is indicative.
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
                <Typography variant="body2" color="text.secondary">{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}, {selectedAddress.country || 'India'}</Typography>
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
    <Box sx={{ py: 4, pb: 12, maxWidth: 960, mx: 'auto' }}>
      <Box sx={{ mb: 4, borderBottom: '2px solid #243A5E', pb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>
          Corporate Procurement Authorization
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          Follow standard B2B purchasing protocols to confirm inventory reservation and financial clearing.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, bgcolor: '#ffffff', border: '1px solid #D6E4EE', borderRadius: 2, mb: 4 }}>
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
          <Button variant="contained" onClick={handleAcknowledgeBackorder}>Acknowledge & Continue</Button>
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
          <Button variant="contained" onClick={handleConfirmTaxDetail} disabled={taxLoading}>Confirm & Continue</Button>
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
            // TODO(backend-missing): no cancel endpoint exists yet (see
            // handleCancelAndRestart above), so this can't offer a "cancel
            // and start over" action — only explain that the order will
            // clear itself once its payment link's TTL passes and the
            // backend's abandonment sweep picks it up.
            <Alert severity="warning">
              This order has no way to be cancelled from here yet — it will automatically clear once its
              payment link expires (the backend sweeps stale pending orders on its own schedule). Please
              check back later, or ask an admin to resolve it directly.
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
    </Box>
  );
};

export default Checkout;
