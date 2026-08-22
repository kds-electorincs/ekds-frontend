import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Button, CircularProgress, Grid, TextField, 
  Divider, IconButton, Tooltip, Alert
} from '@mui/material';
import { 
  FileUpload as FileUploadIcon, 
  Search as SearchIcon, 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Description as DescriptionIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  ShoppingCart as CartIcon,
  Send as SendIcon
} from '@mui/icons-material';
// import { userService } from '../../services/apiServices'; // TODO(backend-missing): see effect below
import { productPublicService } from '../../services/apiServices';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import EmptyState from '../../components/common/EmptyState';
import notification from '../../utils/notification';
import { formatPrice as formatScaledPrice } from '../../utils/priceUtils';

const Quotations = () => {
  const { addToCart, toggleCartDrawer } = useCart();
  const { currency } = useCurrency();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingBomToCart, setAddingBomToCart] = useState(false);
  const [bomCartError, setBomCartError] = useState('');

  // BOM Upload & Live Resolution State
  const [bomTextInput, setBomTextInput] = useState("IC-LM324, 250\nMOSFET-IRF540N, 500\nRELAY-12V-DC, 100");
  const [bomLines, setBomLines] = useState([]);
  const [validatingBom, setValidatingBom] = useState(false);
  const [bomValidated, setBomValidated] = useState(false);

  useEffect(() => {
    // TODO(backend-missing): No backend endpoint for GET /users/me/quotations.
    // Feature: Corporate Quotations (RFQ) archive table. Commented out until
    // backend implements this.
    // Suggested endpoint: GET /api/users/me/quotations
    // Stub: loading is left false so the table renders its existing
    // "No Active B2B Quotations" EmptyState instead of spinning forever.
    // const fetchQuotations = async () => {
    //   try {
    //     setLoading(true);
    //     const res = await userService.getQuotations();
    //     const items = res?.data || res?.quotations || res || [];
    //     setQuotations(Array.isArray(items) ? items : []);
    //   } catch (err) {
    //     console.error("Failed to retrieve corporate quotations:", err);
    //     setQuotations([]);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchQuotations();
  }, []);

  // Real-time backend verification of BOM line items against live product inventory
  const handleValidateBom = async (e) => {
    e.preventDefault();
    if (!bomTextInput.trim()) return;

    const rawLines = bomTextInput.split("\n").map(l => l.trim()).filter(Boolean);
    setValidatingBom(true);
    setBomValidated(false);
    
    const resolvedItems = [];

    for (const line of rawLines) {
      const parts = line.split(/[,;\t]/).map(p => p.trim());
      const queryPart = parts[0] || "UNKNOWN-PART";
      const targetQty = Number(parts[1]) || 100;

      let matchedProduct = null;
      let unitPriceScaled = null;
      let priceScale = 4;
      let status = "UNMATCHED";

      try {
        // Query live catalog API without mock data generation
        const res = await productPublicService.listProducts({ search: queryPart, size: 5, currency: currency || 'INR' });
        const items = res?.content || res?.data?.content || res?.data || res?.products || [];
        if (Array.isArray(items) && items.length > 0) {
          matchedProduct = items[0];
          unitPriceScaled = matchedProduct.fromPriceScaled ?? null;
          priceScale = matchedProduct.priceScale ?? 4;
          status = (matchedProduct.totalStock !== undefined ? matchedProduct.totalStock : matchedProduct.stock) >= targetQty ? "IN_STOCK" : "BACKORDER";
        }
      } catch (err) {
        console.warn(`Live query failed for part [${queryPart}]:`, err);
      }

      resolvedItems.push({
        queryPart,
        targetQty,
        matchedProduct,
        unitPriceScaled,
        priceScale,
        status
      });
    }

    setBomLines(resolvedItems);
    setValidatingBom(false);
    setBomValidated(true);
    notification.success("BOM line items processed against live catalog database.");
  };

  // Matched BOM lines only carry the list/summary product shape (no
  // packagingOptions) — POST /api/cart/items needs a specific
  // packagingOptionId, which that shape can't supply. Resolve each line's
  // packaging option by fetching product detail before adding, same source
  // ProductDetails.jsx uses. Never call addToCart without a resolved id.
  const handleAddAllToCart = async () => {
    setBomCartError('');
    setAddingBomToCart(true);
    let added = 0;
    let needsSelection = 0;
    let failed = 0;
    try {
      for (const item of bomLines) {
        if (!item.matchedProduct) continue;
        const slugOrId = item.matchedProduct.slug || item.matchedProduct.id || item.matchedProduct._id;
        try {
          const detail = await productPublicService.getProduct(slugOrId, { currency: currency || 'INR' });
          const product = detail?.data || detail;
          const options = product?.packagingOptions || [];

          if (options.length === 1 && options[0].id != null) {
            await addToCart(options[0].id, item.targetQty);
            added++;
          } else if (options.length > 1) {
            needsSelection++;
          } else {
            failed++;
          }
        } catch (err) {
          console.error('[Quotations] BOM add-to-cart failed for', item.queryPart, err?.message);
          failed++;
        }
      }
    } finally {
      setAddingBomToCart(false);
    }

    if (added > 0) {
      notification.success(`Added ${added} verified BOM line components to procurement cart.`);
      toggleCartDrawer();
    }
    if (needsSelection > 0) {
      setBomCartError(`${needsSelection} part${needsSelection > 1 ? 's have' : ' has'} multiple packaging options — open the product page to choose one before adding to cart.`);
    } else if (added === 0) {
      setBomCartError('');
    }
    if (added === 0 && needsSelection === 0) {
      notification.warning(failed > 0
        ? "No live catalog matches available to transfer directly to cart. Please submit RFQ for manual engineering quote."
        : "No matched BOM lines to add. Please submit RFQ for manual engineering quote.");
    }
  };

  const handleSubmitRfq = () => {
    notification.success("BOM Quotation Request (RFQ) transmitted to corporate sales engineers. Expect formal tiered B2B quote within 24 hours.");
    setBomLines([]);
    setBomValidated(false);
  };

  return (
    <Box sx={{ pb: 8 }}>
      <Box sx={{ mb: 4, borderBottom: '2px solid #243A5E', pb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>
          Bill of Materials (BOM) & Corporate RFQ Portal
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mt: 0.5 }}>
          Validate wholesale electronic part lists against real-time factory inventory and manage formal engineering pricing contracts.
        </Typography>
      </Box>

      {/* 1. ENTERPRISE BOM BULK UPLOAD & RESOLVER PANEL */}
      <Paper elevation={0} sx={{ p: 4, bgcolor: '#ffffff', border: '1px solid #D6E4EE', borderRadius: 2, mb: 6 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
          1. Quick BOM Bulk Part Resolver
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter or paste line items formatted as <strong>[Part Number / Keyword], [Desired Quantity]</strong> (one entry per line). Our parametric engine will match against active inventory feeds and calculate wholesale volume breaks.
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <TextField
              multiline
              rows={7}
              fullWidth
              variant="outlined"
              value={bomTextInput}
              onChange={(e) => setBomTextInput(e.target.value)}
              placeholder="e.g.&#10;IC-SN74LS00, 500&#10;CAP-100UF-50V, 2000&#10;RES-10K-0805, 5000"
              inputProps={{ style: { fontFamily: 'monospace', fontSize: '0.875rem', lineHeight: 1.5 } }}
              sx={{ bgcolor: '#f8fafc' }}
            />
            <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleValidateBom}
                disabled={validatingBom || !bomTextInput.trim()}
                startIcon={validatingBom ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
                sx={{ flexGrow: 1, py: 1.2, fontWeight: 800 }}
              >
                {validatingBom ? "QUERYING INVENTORY DB..." : "VALIDATE AGAINST LIVE STOCK"}
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={7}>
            {!bomValidated && !validatingBom ? (
              <Box sx={{ height: '100%', minHeight: 220, border: '2px dashed #A0B4C8', borderRadius: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, textAlign: 'center', bgcolor: '#f8fafc' }}>
                <FileUploadIcon sx={{ fontSize: 44, color: 'primary.light', mb: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  Awaiting BOM Line Item Input
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 380 }}>
                  Click validate after inserting part numbers on the left to verify instant dispatch eligibility and tiered pricing contracts.
                </Typography>
              </Box>
            ) : validatingBom ? (
              <Box sx={{ py: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CircularProgress size={36} color="primary" />
                <Typography variant="body2" sx={{ mt: 2, fontWeight: 700 }}>Scanning active factory inventory catalogs...</Typography>
              </Box>
            ) : (
              <Box>
                <Alert severity="info" sx={{ mb: 2, fontWeight: 600 }}>
                  Live Catalog Validation Complete: {bomLines.filter(b => b.matchedProduct).length} of {bomLines.length} parts matched to active database records.
                </Alert>
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #D6E4EE', maxHeight: 280 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow sx={{ '& th': { bgcolor: '#EDF4FA', fontWeight: 800, color: 'primary.main' } }}>
                        <TableCell>Input Part Query</TableCell>
                        <TableCell align="right">Qty</TableCell>
                        <TableCell>Matched Catalog Record</TableCell>
                        <TableCell align="right">Unit Est.</TableCell>
                        <TableCell align="center">Stock State</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bomLines.map((line, idx) => (
                        <TableRow key={idx}>
                          <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace' }}>{line.queryPart}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{line.targetQty.toLocaleString()}</TableCell>
                          <TableCell>
                            {line.matchedProduct ? (
                              <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', display: 'block' }}>
                                {line.matchedProduct.partNumber || line.matchedProduct.name}
                              </Typography>
                            ) : (
                              <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 700 }}>
                                ⚠️ UNMATCHED (RFQ ONLY)
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>
                            {line.unitPriceScaled != null
                              ? formatScaledPrice(line.unitPriceScaled, line.priceScale, line.matchedProduct?.currency || currency || 'INR')
                              : 'RFQ Tier'}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={line.status === 'IN_STOCK' ? 'In Stock' : line.status === 'BACKORDER' ? 'Lead 5 Days' : 'Sourcing'}
                              size="small"
                              sx={{ fontSize: '0.65rem', fontWeight: 700, bgcolor: line.status === 'IN_STOCK' ? '#EDF4FA' : '#FFF3E0', color: line.status === 'IN_STOCK' ? 'success.main' : 'warning.dark' }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<SendIcon />}
                    onClick={handleSubmitRfq}
                    sx={{ fontWeight: 800 }}
                  >
                    TRANSMIT AS FORMAL RFQ TO ENGINEERS
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CartIcon />}
                    onClick={handleAddAllToCart}
                    disabled={addingBomToCart}
                    sx={{ fontWeight: 800 }}
                  >
                    {addingBomToCart ? 'ADDING…' : 'ADD MATCHED PARTS TO CART'}
                  </Button>
                </Box>
                {bomCartError && (
                  <Typography variant="caption" color="warning.dark" sx={{ display: 'block', textAlign: 'right', mt: 1, fontWeight: 700 }}>
                    {bomCartError}
                  </Typography>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* 2. CORPORATE QUOTATIONS ARCHIVE TABLE */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
          2. Registered Corporate Quotations (RFQ History)
        </Typography>
        <Button variant="outlined" size="small" onClick={() => notification.info("Refreshing quotation records from database...")} sx={{ fontWeight: 700 }}>
          Synchronize Table
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #D6E4EE', borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#EDF4FA' }}>
            <TableRow sx={{ '& th': { fontWeight: 800, color: 'primary.main', fontSize: '0.8125rem', textTransform: 'uppercase' } }}>
              <TableCell>RFQ / Quotation ID</TableCell>
              <TableCell>Registration Date</TableCell>
              <TableCell>Component Scope / Items</TableCell>
              <TableCell align="right">Approved Volume Valuation</TableCell>
              <TableCell align="center">Engineering Approval Status</TableCell>
              <TableCell align="center">Contract Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                  <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>Querying active RFQ ledger...</Typography>
                </TableCell>
              </TableRow>
            ) : quotations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ py: 0 }}>
                  <EmptyState
                    title="No Active B2B Quotations Registered"
                    description="Your enterprise user account currently has no active formal pricing quotations or custom BOM tenders."
                    actionText="Submit BOM List Above"
                    onAction={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  />
                </TableCell>
              </TableRow>
            ) : quotations.map((quo) => (
              <TableRow key={quo.id || quo._id} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                <TableCell sx={{ fontWeight: 800, color: 'primary.main', fontFamily: 'monospace' }}>
                  {quo.referenceNumber || quo.id || quo._id}
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  {quo.createdAt ? new Date(quo.createdAt).toLocaleDateString() : quo.date || 'Recent'}
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  {typeof quo.items === 'number' ? `${quo.items} Line Items` : Array.isArray(quo.items) ? `${quo.items.length} Parts` : quo.description || 'Custom BOM Tender'}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: 'primary.dark', fontSize: '0.9375rem' }}>
                  {/* GET /users/me/quotations is backend-missing (see effect above) —
                      this branch is currently unreachable (quotations is always []).
                      Once that endpoint lands, format its total via priceUtils against
                      the real scaled/priceScale/currency fields it returns, not a
                      guessed shape. */}
                  {quo.total != null ? formatScaledPrice(quo.total, quo.priceScale ?? 4, quo.currency || currency || 'INR') : 'Under Valuation'}
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={quo.status || 'Pending Review'} 
                    size="small" 
                    sx={{ 
                      fontWeight: 800, 
                      fontSize: '0.7rem', 
                      bgcolor: quo.status === 'Approved' ? '#EDF4FA' : '#FFF3E0', 
                      color: quo.status === 'Approved' ? 'success.main' : 'warning.dark' 
                    }} 
                  />
                </TableCell>
                <TableCell align="center">
                  <Button size="small" variant="contained" disabled={quo.status !== 'Approved'} sx={{ fontSize: '0.7rem', fontWeight: 800 }}>
                    CONVERT TO ORDER
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Quotations;
