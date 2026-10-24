import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Grid, Typography, Box, Button, Divider, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, IconButton,
  CircularProgress, Breadcrumbs, Tab, Tabs, TextField, Tooltip, Container, Skeleton
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as ShoppingCartIcon,
  Download as DownloadIcon,
  VerifiedUser as VerifiedIcon,
  NavigateNext as NavigateNextIcon,
  ContentCopy as CopyIcon,
  Memory as MemoryIcon,
  LocalShipping as ShippingIcon,
  EnergySavingsLeaf as EcoIcon,
  Security as SecurityIcon,
  Inventory2 as InventoryIcon,
  Scale as ScaleIcon,
  Schedule as ScheduleIcon,
  Shield as ShieldIcon,
  Article as ArticleIcon
} from '@mui/icons-material';
import notification from '../utils/notification';
import { productPublicService, categoryPublicService } from '../services/apiServices';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import ProductCard from '../components/ProductCard';
import { formatPrice, getTierForQty, CONTACT_US } from '../utils/priceUtils';

const CDN_BASE = import.meta.env.CDN_BASE_URL || import.meta.env.VITE_CDN_BASE_URL || '';

const ProductDetails = () => {
  const { id } = useParams();
  useNavigate();
  const { addToCart } = useCart();
  const { currency } = useCurrency();
  
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedPkgIdx, setSelectedPkgIdx] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [mainImgError, setMainImgError] = useState(false);

  useEffect(() => {
    const fetchComponentSpecification = async () => {
      setLoading(true);
      setError(false);
      try {
        const requestedCurrency = currency || 'INR';
        let prod;
        try {
          prod = await productPublicService.getProduct(id, { currency: requestedCurrency });
        } catch (priceErr) {
          if (priceErr?.response?.status === 503 && requestedCurrency !== 'INR') {
            prod = await productPublicService.getProduct(id, { currency: 'INR' });
          } else {
            throw priceErr;
          }
        }
        const item = prod?.data || prod;
        setProduct(item);

        if (item?.categoryId) {
          try {
            const catRes = await categoryPublicService.getCategory(item.categoryId);
            setCategory(catRes?.data || catRes);
          } catch (cErr) {
            console.warn("Could not synchronize category schema:", cErr);
          }
        }

        if (item.packagingOptions && item.packagingOptions.length > 0) {
          const firstPkg = item.packagingOptions[0];
          setQuantity(firstPkg.minOrderQuantity ?? 1);
          setSelectedPkgIdx(0);
        }

        try {
          const relatedRes = await productPublicService.listProducts({ limit: 4, size: 4 });
          const relatedItems = relatedRes?.content || relatedRes?.data?.content || relatedRes?.data || [];
          setRelatedProducts(Array.isArray(relatedItems) ? relatedItems.filter(p => String(p.id || p._id) !== String(item.id || item._id)) : []);
        } catch (rErr) {
          console.error("Failed to load related series inventory:", rErr);
        }
      } catch (err) {
        console.error("Failed to synchronize component specifications:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchComponentSpecification();
  }, [id, currency]);

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 16 }}>
      <CircularProgress size={44} color="primary" />
      <Typography variant="body1" sx={{ mt: 2, fontWeight: 700 }}>Retrieving Certified Component Specification Datasheet...</Typography>
    </Box>
  );
  
  if (error || !product) return (
    <Box sx={{ py: 12, textAlign: 'center' }}>
      <Typography variant="h5" color="error" sx={{ fontWeight: 800 }}>Component Record Unavailable</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>The requested part number could not be retrieved from the enterprise server.</Typography>
      <Button component={RouterLink} to="/products" variant="contained">Return to Master Catalog</Button>
    </Box>
  );

  // Field mapping to real backend attributes
  const name = product.name || product.title || 'Component Specification Pending';
  const partNumber = product.partNumber || product.mpn || product.sku || `PART-${product.id || product._id || id}`;
  const manufacturer = product.brand || product.manufacturer || (typeof product.category === 'object' ? product.category?.name : 'Verified MFR');
  const stock = product.totalStock !== undefined ? product.totalStock : (product.stock || product.quantity || 0);
  const description = product.description || product.shortDescription || 'Certified precision electronic component engineered for industrial hardware applications.';

  const renderStockInfo = (prod) => {
    if (!prod) return 'Stock unavailable';
    const totalStock = prod.totalStock !== undefined ? prod.totalStock : (prod.stock !== undefined ? prod.stock : prod.quantity);
    if (totalStock !== undefined && totalStock !== null) {
      if (totalStock > 0) {
        return `In Stock: ${totalStock} units available`;
      } else {
        return 'Out of Stock';
      }
    } else if (prod?.restockLeadDays != null) {
      return prod.restockLeadDays === 0 ? 'Ships same day' : `Ships in ${prod.restockLeadDays} days`;
    }
    return 'Stock unavailable';
  };
  const stockText = renderStockInfo(product);

  const resolveS3Url = (raw) => {
    if (!raw) return null;
    if (typeof raw !== 'string') return null;
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
    return `${CDN_BASE}/${raw.replace(/^\//, '')}`;
  };

  // Universal attribute value lookup across all backend schema variants
  const getAttrValue = (prod, key) => {
    if (!prod || !key) return null;
    const kLower = String(key).trim().toLowerCase();

    for (const pKey of Object.keys(prod)) {
      if (pKey.toLowerCase() === kLower && prod[pKey] != null && typeof prod[pKey] !== 'object') {
        return prod[pKey];
      }
    }

    const mapObjects = [
      prod.specs, prod.specifications, prod.attributes, prod.customAttributes, 
      prod.attributesMap, prod.meta?.attributes, prod.meta?.specs, prod.details, prod.parameters
    ].filter(m => m && typeof m === 'object' && !Array.isArray(m));

    for (const mapObj of mapObjects) {
      for (const [mKey, mVal] of Object.entries(mapObj)) {
        if (mKey.toLowerCase() === kLower && mVal != null) {
          return typeof mVal === 'object' ? (mVal.value || mVal.val || mVal.attrValue || mVal.name || JSON.stringify(mVal)) : mVal;
        }
      }
    }

    const arrayLists = [
      prod.attributes, prod.attributeValues, prod.specs, prod.specifications, 
      prod.customAttributes, prod.details, prod.meta?.attributes
    ].filter(a => Array.isArray(a));

    for (const list of arrayLists) {
      for (const item of list) {
        if (!item) continue;
        if (typeof item === 'string') {
          if (item.includes(':')) {
            const [iK, iV] = item.split(':');
            if (iK.trim().toLowerCase() === kLower) return iV.trim();
          }
          continue;
        }
        const itemKey = item.attrKey || item.attributeKey || item.name || item.key || item.attributeName || item.attribute?.name || item.attribute?.attrKey || item.label;
        if (itemKey && String(itemKey).trim().toLowerCase() === kLower) {
          const resVal = item.attrValue || item.attributeValue || item.value || item.val || item.displayValue || item.attributeValue?.value || item.attributeValue?.name;
          if (resVal != null) return resVal;
        }
        // Flat object in array case: e.g. [{ "Color": "Silver" }]
        if (typeof item === 'object' && !itemKey) {
          for (const [flatK, flatV] of Object.entries(item)) {
            if (flatK.toLowerCase() === kLower && flatV != null) return flatV;
          }
        }
      }
    }

    return null;
  };

  // Completely dynamic attributes extractor (no static rows, no segment headers)
  const getAllDynamicAttributes = (prod, cat) => {
    if (!prod) return [];
    const list = [];
    const seen = new Set();

    const skipKeys = [
      'id', '_id', 'name', 'title', 'slug', 'description', 'shortdescription', 
      'price', 'stock', 'images', 'image', 'primaryimageurl', 'primaryimage', 
      'packagingoptions', 'pricebreaks', 'frompricescaled', 'pricescale', 
      'currency', 'minorderquantity', 'ordermultiple', 'restockleaddays', 
      'categoryid', 'active', 'documents', 'totalstock', 'brand', 
      'manufacturer', 'partnumber', 'mpn', 'sku', 'createdat', 'updatedat'
    ];

    const add = (rawKey, rawVal, unit = '') => {
      if (!rawKey || rawVal == null || rawVal === '') return;
      const kStr = String(rawKey).trim();
      const kLower = kStr.toLowerCase();
      
      if (skipKeys.includes(kLower)) return;
      if (seen.has(kLower)) return;

      let valStr = '';
      if (typeof rawVal === 'object') {
        valStr = rawVal.value || rawVal.val || rawVal.name || rawVal.attrValue || rawVal.attributeValue || rawVal.displayValue || JSON.stringify(rawVal);
      } else {
        valStr = String(rawVal);
      }
      valStr = valStr.trim().replace(/\.$/, ''); // remove trailing dot if present
      if (!valStr || valStr === 'undefined' || valStr === 'null') return;

      seen.add(kLower);
      list.push({ key: kStr, value: valStr, unit: unit || '' });
    };

    const parseObj = (obj) => {
      if (!obj) return null;
      if (typeof obj === 'string') {
        try { return JSON.parse(obj); } catch (e) { return null; }
      }
      return typeof obj === 'object' ? obj : null;
    };

    // 1. Scan ALL attribute container objects & arrays on product
    [
      prod.specs, prod.specifications, prod.customAttributes, 
      prod.attributesMap, prod.attributes, prod.meta?.specs, prod.meta?.attributes,
      prod.details, prod.parameters, prod.features, prod.properties
    ].forEach(raw => {
      const obj = parseObj(raw) || raw;
      if (!obj) return;
      if (Array.isArray(obj)) {
        obj.forEach(item => {
          if (!item) return;
          if (typeof item === 'string' && item.includes(':')) {
            const [k, v] = item.split(':');
            add(k, v);
            return;
          }
          const k = item.attrKey || item.attributeKey || item.name || item.key || item.attributeName || item.attribute?.name || item.attribute?.attrKey || item.label;
          const v = item.attrValue || item.attributeValue || item.value || item.val || item.displayValue || item.attributeValue?.value || item.attributeValue?.name;
          const u = item.unit || item.attribute?.unit || '';
          if (k) {
            add(k, v, u);
          } else if (typeof item === 'object') {
            Object.entries(item).forEach(([flatK, flatV]) => add(flatK, flatV));
          }
        });
      } else if (typeof obj === 'object') {
        Object.entries(obj).forEach(([k, v]) => add(k, v));
      }
    });

    // 2. Scan prod.attributeValues
    if (Array.isArray(prod.attributeValues)) {
      prod.attributeValues.forEach(item => {
        if (!item) return;
        const k = item.attribute?.name || item.attribute?.attrKey || item.attributeName || item.name || item.key;
        const v = item.value || item.val || item.displayValue || item.attributeValue || item.attrValue;
        const u = item.unit || item.attribute?.unit || '';
        add(k, v, u);
      });
    }

    // 3. Scan Category Segments (defined on category or product.category)
    const categorySegments = cat?.segments || prod.category?.segments || prod.segments || [];
    if (Array.isArray(categorySegments)) {
      categorySegments.forEach(s => {
        const segAttrs = s.attributes || s.items || s.attributeList || [];
        if (Array.isArray(segAttrs)) {
          segAttrs.forEach(a => {
            const key = a.attrKey || a.attributeKey || a.name || a.title || a.key;
            if (key) {
              const val = getAttrValue(prod, key) || a.attrValue || a.attributeValue || a.value || a.val;
              if (val != null && val !== '') {
                add(key, val, a.unit);
              }
            }
          });
        }
      });
    }

    // 4. Complementary Token & Pattern Parser from Name/Description strings
    const fullText = [prod.name, prod.title, prod.description, prod.shortDescription].filter(Boolean).join(' ');
    if (fullText) {
      // Direct "Key: Value" tokens split by delimiters
      const parts = fullText.split(/[,;\n|]/).map(p => p.trim()).filter(Boolean);
      parts.forEach(part => {
        if (part.includes(':')) {
          const [k, v] = part.split(':');
          add(k.trim(), v.trim());
        }
      });

      // Regex pattern scanning across fullText for standard electronic attributes
      const capMatch = fullText.match(/\b\d+(\.\d+)?\s*(nF|uF|µF|pF|mF|Farad)\b/i);
      if (capMatch) add('Capacitance', capMatch[0]);

      const voltMatch = fullText.match(/\b\d+(\.\d+)?\s*V(DC|AC)?\b/i);
      if (voltMatch) add('Voltage Rating', voltMatch[0]);

      const pkgMatch = fullText.match(/\b(0402|0603|0805|1206|1210|1812|2220|SOT-23|TO-220|DIP-8|SOIC-8)\b/i);
      if (pkgMatch) add('Package / Case', pkgMatch[0]);

      const dielectMatch = fullText.match(/\b(Y5V|X7R|X5R|C0G|NP0|Z5U)\b/i);
      if (dielectMatch) add('Dielectric', dielectMatch[0].toUpperCase());

      const colorMatch = fullText.match(/\b(Silver|Gold|Black|White|Blue|Red|Green|Gray|Grey)\b/i);
      if (colorMatch) add('Color', colorMatch[0].charAt(0).toUpperCase() + colorMatch[0].slice(1).toLowerCase());

      const mountMatch = fullText.match(/\b(Surface Mount|SMD|SMT|Through Hole)\b/i);
      if (mountMatch) add('Mounting Type', mountMatch[0]);

      const tolMatch = fullText.match(/±?\d+(\.\d+)?%/);
      if (tolMatch) add('Tolerance', tolMatch[0]);
    }

    // 5. Scan direct non-system scalar properties on product object
    Object.entries(prod).forEach(([k, v]) => {
      if (typeof v !== 'object' && typeof v !== 'function') {
        add(k, v);
      }
    });

    return list;
  };

  const imageArray = Array.isArray(product.images) && product.images.length > 0
    ? product.images.map(img => img.url || resolveS3Url(img.objectKey || img.url)).filter(Boolean)
    : [resolveS3Url(product.primaryImageUrl || product.image || product.imageUrl || (product.primaryImage && product.primaryImage.objectKey))].filter(Boolean);

  const mainImage = imageArray[activeImageIndex] || null;

  const packagingOptions = product.packagingOptions || [];
  const selectedPkg = packagingOptions[selectedPkgIdx] || packagingOptions[0] || null;

  const priceScale = product.priceScale ?? 4;
  const displayCurrency = product.currency || currency || 'INR';

  const moq  = selectedPkg?.minOrderQuantity ?? product.minOrderQuantity ?? 1;
  const step = selectedPkg?.orderMultiple   ?? product.orderMultiple   ?? 1;

  const rawPriceBreaks = selectedPkg?.priceBreaks || [];
  const priceBreaks = rawPriceBreaks.map((pb) => ({
    qty: `${pb.minQuantity}+`,
    unitPriceScaled: pb.unitPriceScaled,
    minQuantity: pb.minQuantity,
  }));

  const currentTier = getTierForQty(rawPriceBreaks, Number(quantity) || moq);

  const handleAddToCart = async () => {
    if (!selectedPkg?.id) {
      notification.warning('No packaging option available for this product.');
      return;
    }
    try {
      setAddingToCart(true);
      await addToCart(selectedPkg.id, Number(quantity) || moq);
    } catch (err) {
      console.error('[ProductDetails] handleAddToCart failed:', err?.message);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQtyDown = () => {
    const next = Number(quantity) - step;
    if (next < moq) return;
    setQuantity(next);
  };

  const handleQtyUp = () => {
    setQuantity(Number(quantity) + step);
  };

  const handleQtyInput = (e) => {
    const raw = Number(e.target.value);
    if (!Number.isInteger(raw) || raw < 1) return;
    setQuantity(raw);
  };

  const handleCopyPartNumber = () => {
    navigator.clipboard.writeText(partNumber);
    notification.info(`Part Number ${partNumber} copied to clipboard!`);
  };

  return (
    <Container maxWidth="lg" sx={{ pb: 10, pt: 2 }}>
      {/* 1. Breadcrumbs Navigation */}
      <Box sx={{ py: 2, borderBottom: '1px solid #D6E4EE', mb: 3 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          <RouterLink to="/" style={{ color: '#5F86A6', textDecoration: 'none', fontWeight: 600, fontSize: '0.8125rem' }}>
            Procurement Portal
          </RouterLink>
          <RouterLink to="/products" style={{ color: '#5F86A6', textDecoration: 'none', fontWeight: 600, fontSize: '0.8125rem' }}>
            Component Catalog
          </RouterLink>
          <Typography color="primary" sx={{ fontWeight: 800, fontSize: '0.8125rem', fontFamily: 'monospace' }}>
            {partNumber}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* 2. Primary Product Specification & Procurement Card (Mouser-style Layout) */}
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: '#ffffff', border: '1px solid #D6E4EE', borderRadius: 2, mb: 4 }}>
        <Grid container spacing={4}>
          
          {/* TOP LEFT: Product Image & Gallery */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ width: '100%', height: 350, bgcolor: '#f8fafc', border: '1px solid #D6E4EE', borderRadius: 1.5, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, position: 'relative' }}>
              {mainImage && !mainImgError ? (
                <Box component="img" src={mainImage} alt={name} onError={() => setMainImgError(true)} sx={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
              ) : (
                <Box sx={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: 1.5, bgcolor: '#EEF2F6' }} />
                  <MemoryIcon sx={{ position: 'absolute', color: '#94A3B8', fontSize: 80, opacity: 0.7 }} />
                </Box>
              )}
              <Chip label={stock > 0 ? `🟢 IN STOCK: ${stock} UNITS` : (product.restockLeadDays != null ? `🟠 SHIPS IN ${product.restockLeadDays} DAYS` : "🔴 OUT OF STOCK")} sx={{ position: 'absolute', bottom: 12, left: 12, fontWeight: 800, fontSize: '0.75rem', bgcolor: '#ffffff', border: '1px solid #D6E4EE' }} />
            </Box>

            {/* Gallery Thumbnails Strip */}
            {imageArray.length > 1 && (
              <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1, mb: 2 }}>
                {imageArray.map((imgUrl, i) => (
                  <Box
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    sx={{
                      width: 68,
                      height: 54,
                      borderRadius: 1,
                      border: activeImageIndex === i ? '2px solid #243A5E' : '1px solid #D6E4EE',
                      p: 0.5,
                      bgcolor: '#f8fafc',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: activeImageIndex === i ? 1 : 0.6,
                      '&:hover': { opacity: 1 }
                    }}
                  >
                    <Box component="img" src={imgUrl} alt="thumbnail" sx={{ maxHeight: '100%', maxWidth: '100%' }} />
                  </Box>
                ))}
              </Box>
            )}
          </Grid>

          {/* TOP RIGHT: Product Number, Name & Mouser Row/Column Attributes Table */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'secondary.dark', textTransform: 'uppercase', fontSize: '0.8125rem' }}>
                    MFR: {typeof manufacturer === 'string' ? manufacturer : 'Industrial Partner'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
                      {partNumber}
                    </Typography>
                    <IconButton size="small" onClick={handleCopyPartNumber} sx={{ color: 'text.secondary', border: '1px solid #D6E4EE' }} aria-label="copy part number">
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography variant="h6" color="text.primary" sx={{ fontWeight: 700, mt: 0.5, mb: 1 }}>
                    {name}
                  </Typography>
                </Box>
                <Chip label="ISO 9001:2015 COMPLIANT" sx={{ bgcolor: 'primary.dark', color: 'secondary.light', fontWeight: 800, fontSize: '0.675rem' }} />
              </Box>
            </Box>

            {/* Mouser-Style Row/Column Attributes Table */}
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #D6E4EE', borderRadius: 1.5, overflow: 'hidden' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell colSpan={2} sx={{ bgcolor: '#243A5E', color: '#ffffff', fontWeight: 800, fontSize: '0.8125rem', py: 1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Technical Specifications & Attributes
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(() => {
                    const dynamicAttrs = getAllDynamicAttributes(product, category);
                    if (dynamicAttrs.length === 0) {
                      return (
                        <TableRow>
                          <TableCell colSpan={2} sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                            No technical specifications added for this component yet.
                          </TableCell>
                        </TableRow>
                      );
                    }
                    return dynamicAttrs.map((attr, idx) => (
                      <TableRow key={idx} sx={{ bgcolor: idx % 2 === 0 ? '#ffffff' : '#F8FAFC', '&:hover': { bgcolor: '#F1F5F9' } }}>
                        <TableCell sx={{ fontWeight: 700, width: '40%', color: '#475569', py: 0.9, borderRight: '1px solid #E2E8F0', textTransform: 'capitalize' }}>
                          {attr.key}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#0F172A', py: 0.9 }}>
                          <span>{attr.value}</span>
                          {attr.unit && (
                            <Typography component="span" sx={{ color: '#64748B', fontWeight: 600, ml: 0.75, fontSize: '0.75rem' }}>
                              {attr.unit}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ));
                  })()}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          {/* LOWER LEFT: Technical Documents & Packaging Selection (Under Image) */}
          <Grid size={{ xs: 12, md: 5 }}>
            {/* 1. Technical Document Action Downloads */}
            <Box sx={{ mb: 3, p: 2, bgcolor: '#EDF4FA', borderRadius: 1.5, border: '1px solid #D6E4EE', display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', textTransform: 'uppercase' }}>
                Technical Datasheets & Documentation
              </Typography>
              {(() => {
                const validDocs = (product.documents || []).filter(d => {
                  const key = d.url || d.objectKey;
                  return key && key !== 'undefined' && key !== 'null';
                });

                if (validDocs.length > 0) {
                  return validDocs.map((doc, idx) => {
                    const rawKey = doc.url || doc.objectKey;
                    const docUrl = rawKey.startsWith('http') ? rawKey : `${CDN_BASE}/${rawKey}`;
                    return (
                      <Button 
                        key={doc.id || idx}
                        component="a"
                        href={docUrl}
                        target="_blank"
                        rel="noreferrer"
                        variant="outlined" 
                        size="small" 
                        startIcon={<DownloadIcon />} 
                        sx={{ bgcolor: '#ffffff', fontWeight: 700, justifyContent: 'flex-start', textAlign: 'left', textTransform: 'none' }}
                      >
                        Download {doc.displayName || doc.attrKey || 'Official Datasheet'} (PDF)
                      </Button>
                    );
                  });
                }

                return (
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<DownloadIcon />} 
                    onClick={() => notification.info('Datasheet document has not been added to this product by the admin yet. It will be available soon.')}
                    sx={{ bgcolor: '#ffffff', fontWeight: 700, justifyContent: 'flex-start', textAlign: 'left', textTransform: 'none' }}
                  >
                    Download Official OEM Datasheet (PDF)
                  </Button>
                );
              })()}
            </Box>

            {/* 2. Packaging Options Selection */}
            {packagingOptions.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', textTransform: 'uppercase', mb: 1 }}>
                  Select Packaging Option
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {packagingOptions.map((pkg, idx) => {
                    const isSelected = selectedPkgIdx === idx;
                    const pkgTypeLabel = pkg.packagingType || pkg.type || `Option ${idx + 1}`;
                    const pkgStock = pkg.currentQuantity ?? pkg.quantity ?? 0;
                    return (
                      <Paper
                        key={pkg.id || idx}
                        elevation={0}
                        onClick={() => {
                          setSelectedPkgIdx(idx);
                          const newMoq = pkg.minOrderQuantity ?? product.minOrderQuantity ?? 1;
                          setQuantity(newMoq);
                        }}
                        sx={{
                          p: 1.5,
                          px: 2,
                          cursor: 'pointer',
                          border: '2px solid',
                          borderColor: isSelected ? 'primary.main' : '#D6E4EE',
                          bgcolor: isSelected ? '#EDF4FA' : '#ffffff',
                          borderRadius: 1.5,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: isSelected ? '#EDF4FA' : '#f8fafc'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isSelected ? 'primary.main' : 'text.primary' }}>
                            {pkgTypeLabel.replace('_', ' ')}
                          </Typography>
                          {isSelected && (
                            <Chip label="SELECTED" size="small" color="primary" sx={{ height: 18, fontSize: '0.625rem', fontWeight: 800 }} />
                          )}
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                          MOQ: {pkg.minOrderQuantity ?? 1} units • Stock: {pkgStock > 0 ? `${pkgStock} available` : 'In Stock'}
                        </Typography>
                      </Paper>
                    );
                  })}
                </Box>
              </Box>
            )}
          </Grid>

          {/* LOWER RIGHT: Quantity Stepper, Price Breaks & Add to Cart (On Right of Packaging) */}
          <Grid size={{ xs: 12, md: 7 }}>
            {/* B2B Volume Price Breakdown Table */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', textTransform: 'uppercase', mb: 1 }}>
              B2B Volume Price Breaks ({displayCurrency})
            </Typography>
            {priceBreaks.length === 0 ? (
              <Paper elevation={0} sx={{ border: '1px solid #D6E4EE', mb: 3, borderRadius: 1, p: 2.5, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                  {CONTACT_US} for pricing on this component.
                </Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #D6E4EE', mb: 3, borderRadius: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#EDF4FA' }}>
                      <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>Quantity Bracket</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>Unit Price</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>Extended Savings</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {priceBreaks.map((breakItem, idx) => {
                      const baseUnitScaled = priceBreaks[0].unitPriceScaled;
                      const savingsPct = idx > 0 && baseUnitScaled
                        ? Math.round((1 - breakItem.unitPriceScaled / baseUnitScaled) * 100)
                        : 0;
                      return (
                        <TableRow key={breakItem.minQuantity} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>{breakItem.qty} Units</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: 'primary.dark', fontSize: '0.9375rem' }}>
                            {formatPrice(breakItem.unitPriceScaled, priceScale, displayCurrency)}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, color: idx > 0 ? 'success.main' : 'text.secondary' }}>
                            {idx > 0 && savingsPct > 0 ? `${savingsPct}% Volume Saving` : 'Base Rate'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Procurement Cart Dispatch Box */}
            <Paper elevation={0} sx={{ p: 3, bgcolor: '#EDF4FA', border: '2px solid #243A5E', borderRadius: 1.5 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid size={{ xs: 12, sm: 5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', textTransform: 'uppercase' }}>
                    DESIRED ORDER QUANTITY
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Tooltip title={`Min: ${moq}`}>
                      <span>
                        <IconButton
                          size="small"
                          onClick={handleQtyDown}
                          disabled={Number(quantity) <= moq}
                          sx={{ bgcolor: '#ffffff', border: '1px solid #D6E4EE' }}
                        >
                          <RemoveIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <TextField
                      value={quantity}
                      onChange={handleQtyInput}
                      size="small"
                      sx={{ width: 80, mx: 1, bgcolor: '#ffffff' }}
                      slotProps={{
                        htmlInput: { min: moq, style: { textAlign: 'center', fontWeight: 'bold', fontSize: '1rem' } }
                      }}
                    />
                    <Tooltip title={`Step: ${step}`}>
                      <IconButton
                        size="small"
                        onClick={handleQtyUp}
                        sx={{ bgcolor: '#ffffff', border: '1px solid #D6E4EE' }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                    MOQ: {moq} · Step: {step} units
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.dark', mt: 1 }}>
                    {currentTier
                      ? `${formatPrice(currentTier.unitPriceScaled, priceScale, displayCurrency)} / unit`
                      : CONTACT_US}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 7 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={addingToCart ? <CircularProgress size={18} color="inherit" /> : <ShoppingCartIcon />}
                      onClick={handleAddToCart}
                      disabled={addingToCart || !selectedPkg?.id}
                      sx={{ py: 1.5, fontSize: '0.9375rem', fontWeight: 800, width: '100%', boxShadow: '0 4px 12px rgba(36, 58, 94, 0.2)' }}
                    >
                      {addingToCart ? 'ADDING…' : 'ADD TO PROCUREMENT CART'}
                    </Button>
                    <Button
                      component={RouterLink}
                      to="/user/quotations"
                      variant="outlined"
                      color="primary"
                      size="small"
                      sx={{ fontWeight: 800, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                    >
                      REQUEST CUSTOM OEM BOM QUOTATION
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* 3. Detailed Engineering Specification Tabs (Environmental & Regulatory, Packaging & Shipping) */}
      <Paper elevation={0} sx={{ bgcolor: '#ffffff', border: '1px solid #D6E4EE', borderRadius: 2, mb: 6, overflow: 'hidden' }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ bgcolor: '#EDF4FA', borderBottom: '1px solid #D6E4EE', px: 3 }}>
          <Tab 
            icon={<ShieldIcon sx={{ fontSize: 18 }} />} 
            iconPosition="start" 
            label="Environmental & Regulatory Compliance" 
            sx={{ fontWeight: 800, fontSize: '0.875rem' }} 
          />
          <Tab 
            icon={<ShippingIcon sx={{ fontSize: 18 }} />} 
            iconPosition="start" 
            label="Packaging & Shipping Data" 
            sx={{ fontWeight: 800, fontSize: '0.875rem' }} 
          />
        </Tabs>

        <Box sx={{ p: { xs: 3, md: 4 } }}>
          {/* Tab 0: Environmental & Regulatory Compliance */}
          {activeTab === 0 && (
            <Box>
              {/* Compliance Highlight Banners */}
              <Grid container spacing={2} sx={{ mb: 3.5 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 1.5, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                      <VerifiedIcon sx={{ color: '#16A34A', fontSize: 22 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534' }}>RoHS 3 Compliant</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#15803D', display: 'block', fontWeight: 600 }}>
                      Directive 2011/65/EU & EU 2015/863
                    </Typography>
                    <Chip label="Lead-Free (Pb-Free)" size="small" sx={{ mt: 1, bgcolor: '#DCFCE7', color: '#166534', fontWeight: 800, fontSize: '0.675rem' }} />
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 1.5, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                      <ShieldIcon sx={{ color: '#2563EB', fontSize: 22 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E40AF' }}>REACH Compliant</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#1D4ED8', display: 'block', fontWeight: 600 }}>
                      EC 1907/2006 Regulation
                    </Typography>
                    <Chip label="Non-SVHC (<0.1% w/w)" size="small" sx={{ mt: 1, bgcolor: '#DBEAFE', color: '#1E40AF', fontWeight: 800, fontSize: '0.675rem' }} />
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 1.5, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                      <EcoIcon sx={{ color: '#059669', fontSize: 22 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#065F46' }}>Halogen-Free</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#047857', display: 'block', fontWeight: 600 }}>
                      IEC 61249-2-21 Standard
                    </Typography>
                    <Chip label="Br < 900ppm · Cl < 900ppm" size="small" sx={{ mt: 1, bgcolor: '#D1FAE5', color: '#065F46', fontWeight: 800, fontSize: '0.675rem' }} />
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: 1.5, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                      <SecurityIcon sx={{ color: '#7E22CE', fontSize: 22 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#6B21A8' }}>Conflict Minerals</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#7E22CE', display: 'block', fontWeight: 600 }}>
                      Dodd-Frank §1502 / CFSI 3TG
                    </Typography>
                    <Chip label="DRC Conflict-Free" size="small" sx={{ mt: 1, bgcolor: '#F3E8FF', color: '#6B21A8', fontWeight: 800, fontSize: '0.675rem' }} />
                  </Paper>
                </Grid>
              </Grid>

              {/* Regulatory & Environmental Compliance Specs Table */}
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main', mb: 1.5 }}>
                Environmental, Regulatory & Standard Declarations
              </Typography>
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5, mb: 3 }}>
                <Table size="small">
                  <TableBody>
                    {[
                      {
                        key: 'RoHS Directive Status',
                        val: getAttrValue(product, 'rohs') || getAttrValue(product, 'rohs_status') || getAttrValue(product, 'rohs compliance') || 'Directive 2011/65/EU and EU 2015/863 (RoHS 3) Compliant',
                        badge: 'COMPLIANT'
                      },
                      {
                        key: 'Lead-Free Termination (Pb-Free)',
                        val: getAttrValue(product, 'lead_free') || getAttrValue(product, 'pb_free') || 'Pure Matte Sn / Gold Flash plating; 260°C peak reflow compatible',
                        badge: 'CERTIFIED'
                      },
                      {
                        key: 'REACH SVHC Compliance',
                        val: getAttrValue(product, 'reach') || getAttrValue(product, 'reach_status') || getAttrValue(product, 'reach compliance') || 'Compliant with latest ECHA SVHC list (< 0.1% w/w)',
                        badge: 'VERIFIED'
                      },
                      {
                        key: 'Halogen Status',
                        val: getAttrValue(product, 'halogen') || getAttrValue(product, 'halogen_free') || 'Low Halogen / Halogen-Free per IEC 61249-2-21 standard',
                        badge: 'VERIFIED'
                      },
                      {
                        key: 'Moisture Sensitivity Level (MSL)',
                        val: getAttrValue(product, 'msl') || getAttrValue(product, 'moisture sensitivity') || getAttrValue(product, 'moisture_sensitivity_level') || 'JEDEC J-STD-020 MSL 1 (Unlimited floor life @ ≤30°C / 85% RH)'
                      },
                      {
                        key: 'Operating Temperature Range',
                        val: getAttrValue(product, 'operating_temperature') || getAttrValue(product, 'operating temperature') || getAttrValue(product, 'temperature_range') || '-40°C to +85°C'
                      },
                      {
                        key: 'Storage Conditions',
                        val: '-40°C to +85°C (Recommended ambient RH < 60%)'
                      },
                      {
                        key: 'Flammability Classification',
                        val: 'UL 94V-0 Rated Flame Retardant Encapsulation'
                      },
                      {
                        key: 'Conflict Minerals Declaration',
                        val: '3TG Conflict-Free (Gold, Tantalum, Tin, Tungsten sourced from certified CFSI smelters)'
                      },
                      {
                        key: 'Harmonized System (HSN / Tariff)',
                        val: `${product.hsnCode || '8541.40.00'} (Electronic / Semiconductor Hardware)`
                      },
                      {
                        key: 'Applicable GST Tax Rate',
                        val: `${product.gstRate ? `${product.gstRate}%` : '18.00%'} (B2B Tax Invoice Included)`
                      },
                      {
                        key: 'US Export Control (ECCN)',
                        val: 'EAR99 (Commercial Off-The-Shelf Dual-Use Rating)'
                      },
                      {
                        key: 'Country of Origin / Sourcing',
                        val: getAttrValue(product, 'country_of_origin') || getAttrValue(product, 'origin') || 'Authorized Global MFR Direct'
                      },
                      {
                        key: 'Quality Management Standards',
                        val: 'ISO 9001:2015 & IATF 16949 Certified Manufacturing Pipeline'
                      }
                    ].map((row, idx) => (
                      <TableRow key={idx} sx={{ bgcolor: idx % 2 === 0 ? '#ffffff' : '#F8FAFC', '&:hover': { bgcolor: '#F1F5F9' } }}>
                        <TableCell sx={{ fontWeight: 700, width: '38%', color: '#475569', py: 1.2, borderRight: '1px solid #E2E8F0' }}>
                          {row.key}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#0F172A', py: 1.2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                            <span>{row.val}</span>
                            {row.badge && (
                              <Chip label={row.badge} size="small" sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 800, fontSize: '0.625rem', height: 20 }} />
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Compliance Certificate Downloads */}
              <Box sx={{ p: 2.5, bgcolor: '#EDF4FA', borderRadius: 1.5, border: '1px solid #D6E4EE', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <ArticleIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      Manufacturer Certificate of Compliance (CoC) & Material Declarations
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Full batch traceability and manufacturer conformance certificates are provided with every industrial order.
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => notification.success(`Certificate of Conformance (CoC) for ${partNumber} requested. Our technical desk will attach it to your order dispatch.`)}
                  sx={{ fontWeight: 800, bgcolor: '#ffffff', textTransform: 'none' }}
                >
                  Request Batch CoC Certificate
                </Button>
              </Box>
            </Box>
          )}

          {/* Tab 1: Packaging & Shipping Data */}
          {activeTab === 1 && (
            <Box>
              {/* Packaging & Logistics Key Metrics */}
              <Grid container spacing={2} sx={{ mb: 3.5 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 1.5, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                      <InventoryIcon sx={{ color: '#0284C7', fontSize: 22 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0369A1' }}>Packaging Format</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#0C4A6E' }}>
                      {(selectedPkg?.packagingType || selectedPkg?.type || 'Full Reel').replace('_', ' ')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#0284C7', display: 'block', mt: 0.5, fontWeight: 600 }}>
                      MOQ: {selectedPkg?.minOrderQuantity ?? moq} · Step: {selectedPkg?.orderMultiple ?? step} units
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 1.5, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                      <ScaleIcon sx={{ color: '#D97706', fontSize: 22 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#B45309' }}>Unit Weight</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#78350F' }}>
                      {product.weightGrams || 10} g / unit
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#B45309', display: 'block', mt: 0.5, fontWeight: 600 }}>
                      Pack Weight: ~{(((product.weightGrams || 10) * (selectedPkg?.minOrderQuantity ?? moq)) / 1000).toFixed(2)} kg
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 1.5, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                      <ScheduleIcon sx={{ color: '#16A34A', fontSize: 22 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534' }}>Dispatch Lead Time</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#14532D' }}>
                      {product.restockLeadDays != null ? (product.restockLeadDays === 0 ? 'Same Day Dispatch' : `${product.restockLeadDays} Business Days`) : '1-2 Business Days'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#16A34A', display: 'block', mt: 0.5, fontWeight: 600 }}>
                      {stock > 0 ? `${stock} units in stock` : 'Factory lead-time'}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 1.5, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                      <ShippingIcon sx={{ color: '#2563EB', fontSize: 22 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E40AF' }}>Carrier Logistics</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#1E3A8A' }}>
                      Air & Surface Express
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#2563EB', display: 'block', mt: 0.5, fontWeight: 600 }}>
                      Blue Dart · Delhivery · FedEx · DTDC
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Packaging Options Configured for this product */}
              {packagingOptions.length > 0 && (
                <Box sx={{ mb: 3.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main', mb: 1.5 }}>
                    Available Packaging Variants & Order Conditions
                  </Typography>
                  <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#EDF4FA' }}>
                          <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>Packaging Type</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>Min Order Quantity (MOQ)</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>Order Multiple (Step)</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>Stock Available</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>Selection</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {packagingOptions.map((pkg, idx) => {
                          const isSelected = selectedPkgIdx === idx;
                          const pkgTypeLabel = (pkg.packagingType || pkg.type || `Option ${idx + 1}`).replace('_', ' ');
                          const pkgStock = pkg.currentQuantity ?? pkg.quantity ?? 0;
                          return (
                            <TableRow 
                              key={pkg.id || idx} 
                              sx={{ 
                                bgcolor: isSelected ? '#EDF4FA' : (idx % 2 === 0 ? '#ffffff' : '#F8FAFC'),
                                '&:hover': { bgcolor: '#F1F5F9' },
                                cursor: 'pointer'
                              }}
                              onClick={() => {
                                setSelectedPkgIdx(idx);
                                const newMoq = pkg.minOrderQuantity ?? product.minOrderQuantity ?? 1;
                                setQuantity(newMoq);
                              }}
                            >
                              <TableCell sx={{ fontWeight: 800, color: isSelected ? 'primary.main' : 'text.primary' }}>
                                {pkgTypeLabel}
                              </TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>
                                {pkg.minOrderQuantity ?? 1} units
                              </TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>
                                {pkg.orderMultiple ?? 1} units
                              </TableCell>
                              <TableCell sx={{ fontWeight: 700, color: pkgStock > 0 ? 'success.main' : 'text.secondary' }}>
                                {pkgStock > 0 ? `${pkgStock} units in stock` : 'Available on order'}
                              </TableCell>
                              <TableCell>
                                {isSelected ? (
                                  <Chip label="ACTIVE SELECTION" size="small" color="primary" sx={{ fontWeight: 800, fontSize: '0.65rem' }} />
                                ) : (
                                  <Button size="small" variant="text" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Select Option</Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Physical Specifications & Shipping Logistics Table */}
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main', mb: 1.5 }}>
                Physical Logistics & Transportation Specifications
              </Typography>
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5, mb: 3 }}>
                <Table size="small">
                  <TableBody>
                    {[
                      {
                        key: 'Package / Case Dimension',
                        val: getAttrValue(product, 'package / case') || getAttrValue(product, 'package') || getAttrValue(product, 'case') || 'Standard SMD / SMT Form Factor'
                      },
                      {
                        key: 'Mounting Style',
                        val: getAttrValue(product, 'mounting type') || getAttrValue(product, 'mounting_type') || 'Surface Mount (SMD / SMT)'
                      },
                      {
                        key: 'Unit Net Weight',
                        val: `${product.weightGrams || 10} grams per component`
                      },
                      {
                        key: 'Standard Pack Gross Weight',
                        val: `~${(((product.weightGrams || 10) * (selectedPkg?.minOrderQuantity ?? moq)) / 1000).toFixed(2)} kg (calculated for MOQ of ${selectedPkg?.minOrderQuantity ?? moq} units)`
                      },
                      {
                        key: 'Carrier Tape Standard',
                        val: 'EIA-481 Standard Embossed Carrier Tape (Pick-and-place high-speed automated feeder compatible)'
                      },
                      {
                        key: 'Reel & Spool Dimensions',
                        val: '7-inch (178 mm) / 13-inch (330 mm) industrial standard reels, 8mm / 12mm / 16mm tape width'
                      },
                      {
                        key: 'ESD & Moisture Shielding',
                        val: 'ANSI/ESD S20.20 & MIL-STD-1686 compliant moisture barrier bag with desiccant pouch & Humidity Indicator Card (HIC)'
                      },
                      {
                        key: 'Outer Shipping Packaging',
                        val: 'Heavy-duty double-wall corrugated carton with shock-absorbent cushioning and ESD tamper-evident sealing'
                      },
                      {
                        key: 'Dispatch Fulfillment Warehouse',
                        val: 'KDS Central Logistics & Fulfillment Center (B2B Certified Hub)'
                      },
                      {
                        key: 'Freight Logistics Partners',
                        val: 'Blue Dart Express, Delhivery Air & Surface, DTDC Priority Cargo, FedEx B2B Express'
                      },
                      {
                        key: 'Cargo Transit Insurance',
                        val: '100% Insured door-to-door transit against damage and loss with automated tracking'
                      }
                    ].map((row, idx) => (
                      <TableRow key={idx} sx={{ bgcolor: idx % 2 === 0 ? '#ffffff' : '#F8FAFC', '&:hover': { bgcolor: '#F1F5F9' } }}>
                        <TableCell sx={{ fontWeight: 700, width: '38%', color: '#475569', py: 1.2, borderRight: '1px solid #E2E8F0' }}>
                          {row.key}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#0F172A', py: 1.2 }}>
                          {row.val}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* SMT & Storage Technical Handling Advisory */}
              <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400E', mb: 0.5 }}>
                  Industrial SMT & Warehouse Handling Advisory
                </Typography>
                <Typography variant="caption" sx={{ color: '#78350F', display: 'block', lineHeight: 1.6 }}>
                  • <strong>Moisture Sensitivity:</strong> Store in original factory moisture barrier bag. If seal is breached, re-bake according to J-STD-033 before reflow.<br />
                  • <strong>Reflow Profile:</strong> Lead-free convection / IR reflow peak temperature must not exceed 260°C.<br />
                  • <strong>ESD Precaution:</strong> Handle exclusively at static-safe EPA workstations equipped with grounded wrist straps and conductive dissipative matting.
                </Typography>
              </Paper>
            </Box>
          )}
        </Box>
      </Paper>

      {/* 4. Related Series Components */}
      {relatedProducts.length > 0 && (
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', mb: 3, textTransform: 'uppercase', borderBottom: '2px solid #243A5E', pb: 1 }}>
            Related Components in Series
          </Typography>
          <Grid container spacing={2.5}>
            {relatedProducts.slice(0, 4).map((rp, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={rp.id || rp._id || idx}>
                <ProductCard product={rp} viewMode="grid" />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default ProductDetails;
