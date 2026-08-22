import React, { useState, useEffect } from 'react';
import { 
  Typography, Button, Box, Grid, Paper, Card, CardContent, CardMedia,
  List, ListItemButton, ListItemText, Divider, Chip, Container, Table,
  TableBody, TableCell, TableHead, TableRow, TableContainer, CircularProgress
} from '@mui/material';
import { 
  LocalShipping as LocalShippingIcon,
  FileUpload as FileUploadIcon,
  Search as SearchIcon,
  Engineering as EngineeringIcon,
  ArrowForward as ArrowForwardIcon,
  Bolt as BoltIcon,
  Shield as ShieldIcon,
  Factory as FactoryIcon,
  Description as DescriptionIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
// import { publicService } from '../services/apiServices'; // TODO(backend-missing): see effect below
import { productPublicService, categoryPublicService } from '../services/apiServices';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/common/EmptyState';
import { useCurrency } from '../context/CurrencyContext';

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickPartSearch, setQuickPartSearch] = useState('');
  const { currency } = useCurrency();

  useEffect(() => {
    const fetchIndustrialPortalData = async () => {
      try {
        setLoading(true);
        // TODO(backend-missing): No backend endpoint for GET /public/home.
        // Feature: Home page banners/featured-products/categories aggregate.
        // Commented out until backend implements this; the code below already
        // falls back to querying categories/products directly, so no stub is
        // needed beyond leaving homeData empty.
        // Suggested endpoint: GET /api/public/home
        // let homeData = {};
        // try {
        //   homeData = await publicService.getHomeData() || {};
        // } catch (err) {
        //   console.warn('Backend /public/home route empty or unavailable, querying independent catalog services directly:', err);
        // }
        let homeData = {};

        // Validate or resolve categories directly from real backend APIs without mock fallbacks
        let cats = homeData?.categories || homeData?.data?.categories;
        if (!Array.isArray(cats) || cats.length === 0) {
          try {
            const catRes = await categoryPublicService.listCategories();
            cats = catRes?.data?.content || catRes?.content || catRes?.data || catRes || [];
          } catch (cErr) {
            console.error('Failed to resolve category catalog:', cErr);
            cats = [];
          }
        }

        // Validate or resolve featured product inventory from real APIs without mock fallbacks
        let prods = homeData?.featuredProducts || homeData?.data?.featuredProducts || homeData?.products;
        if (!Array.isArray(prods) || prods.length === 0) {
          const requestedCurrency = currency || 'INR';
          try {
            let prodRes;
            try {
              prodRes = await productPublicService.listProducts({ size: 12, currency: requestedCurrency });
            } catch (priceErr) {
              // Currency guide §8: 503 = no live FX rate yet (transient) — fall back to INR.
              if (priceErr?.response?.status === 503 && requestedCurrency !== 'INR') {
                prodRes = await productPublicService.listProducts({ size: 12, currency: 'INR' });
              } else {
                throw priceErr;
              }
            }
            prods = prodRes?.data?.content || prodRes?.content || prodRes?.data || prodRes || [];
          } catch (pErr) {
            console.error('Failed to resolve product inventory:', pErr);
            prods = [];
          }
        }

        setCategories(Array.isArray(cats) ? cats : []);
        setFeaturedProducts(Array.isArray(prods) ? prods : []);
      } finally {
        setLoading(false);
      }
    };
    fetchIndustrialPortalData();
    // Same categories/products, same order, every currency (guide §3) —
    // refetching here only refreshes displayed prices.
  }, [currency]);

  const handleQuickSearchSubmit = (e) => {
    e.preventDefault();
    if (quickPartSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(quickPartSearch.trim())}`);
    } else {
      navigate('/products');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 16 }}>
        <CircularProgress size={44} color="primary" />
        <Typography variant="body1" sx={{ mt: 2, fontWeight: 700, color: 'text.primary' }}>
          Synchronizing Live Industrial Catalog Data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', pb: 8 }}>
      
      {/* 1. DIGIKEY-INSPIRED HERO PROCUREMENT COMMAND BLOCK */}
      <Paper 
        elevation={0}
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
          mb: 6,
          border: '1px solid #16243C',
          boxShadow: '0 8px 24px rgba(22, 36, 60, 0.15)',
        }}
      >
        <Box sx={{ p: { xs: 4, md: 6 }, maxWidth: 960, position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Chip label="ENTERPRISE B2B PLATFORM" size="small" sx={{ bgcolor: 'secondary.main', color: 'primary.dark', fontWeight: 800 }} />
            <Typography variant="caption" sx={{ color: 'secondary.light', fontWeight: 600, letterSpacing: '0.05em' }}>
              WORLDWIDE INDUSTRIAL COMPONENT SUPPLY
            </Typography>
          </Box>
          <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, fontWeight: 900, lineHeight: 1.15, mb: 2 }}>
            Precision Electronic Parts & Industrial Spares Procurement
          </Typography>
          <Typography variant="body1" sx={{ color: '#CFE3F1', mb: 4, maxWidth: 680, fontSize: '1.0625rem' }}>
            Instant inventory lookup across verified manufacturers, automated BOM quote generation, and ISO-compliant supply chain logistics for OEM engineers.
          </Typography>

          {/* Quick SKU / Part Number Search Box */}
          <Box component="form" onSubmit={handleQuickSearchSubmit} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, mb: 4 }}>
            <Paper elevation={0} sx={{ flexGrow: 1, p: '4px 12px', display: 'flex', alignItems: 'center', borderRadius: 1, border: '2px solid #8FB6D8' }}>
              <SearchIcon sx={{ color: 'primary.main', mr: 1 }} />
              <Box
                component="input"
                placeholder="Enter Part Number, Manufacturer SKU, or Keyword (e.g. IC, MOSFET, Relay)..."
                value={quickPartSearch}
                onChange={(e) => setQuickPartSearch(e.target.value)}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9375rem', fontWeight: 600, color: '#16243C', background: 'transparent', padding: '10px 0' }}
                aria-label="Quick SKU or Part Number search input"
              />
            </Paper>
            <Button
              type="submit"
              variant="contained"
              sx={{ bgcolor: 'secondary.main', color: 'primary.dark', px: 4, py: { xs: 1.5, sm: 0 }, fontSize: '0.9375rem', fontWeight: 800, '&:hover': { bgcolor: '#CFE3F1' } }}
            >
              QUERY INVENTORY
            </Button>
            <Button
              component={RouterLink}
              to="/user/quotations"
              variant="outlined"
              sx={{ color: 'white', borderColor: '#8FB6D8', px: 3, fontWeight: 700, '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' } }}
            >
              UPLOAD BOM FILE
            </Button>
          </Box>

          {/* System Certifications Indicators */}
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShieldIcon sx={{ color: 'secondary.main', fontSize: 22 }} />
                <Typography variant="caption" sx={{ color: 'white', fontWeight: 700 }}>100% FACTORY TESTED & VERIFIED</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BoltIcon sx={{ color: '#00e676', fontSize: 22 }} />
                <Typography variant="caption" sx={{ color: 'white', fontWeight: 700 }}>SAME-DAY DISPATCH AVAILABLE</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FactoryIcon sx={{ color: 'secondary.main', fontSize: 22 }} />
                <Typography variant="caption" sx={{ color: 'white', fontWeight: 700 }}>CUSTOM B2B VOLUME DISCOUNTS</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ position: 'absolute', right: -60, bottom: -40, opacity: 0.08, pointerEvents: 'none', display: { xs: 'none', lg: 'block' } }}>
          <EngineeringIcon sx={{ fontSize: 520, color: 'white' }} />
        </Box>
      </Paper>

      {/* 2. INDUSTRIAL CATALOG CLASSIFICATIONS (Live Categories) */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 3, borderBottom: '2px solid #243A5E', pb: 1.5 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
              Component Categories
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              Browse standardized electronic series, precision mechanical hardware, and power systems.
            </Typography>
          </Box>
          <Button component={RouterLink} to="/products" endIcon={<ArrowForwardIcon />} sx={{ fontWeight: 800 }}>
            VIEW FULL MASTER CATALOG →
          </Button>
        </Box>

        {categories.length > 0 ? (
          <Grid container spacing={2.5}>
            {categories.map((cat, index) => {
              const catName = cat.name || cat.title || `Series ${index + 1}`;
              const catSlug = cat.slug || catName.toLowerCase().replace(/\s+/g, '-');
              const itemCount = cat.productCount || cat.itemsCount || 0;
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={cat.id || index}>
                  <Card 
                    component={RouterLink} 
                    to={`/products?category=${encodeURIComponent(catSlug)}`}
                    sx={{
                      textDecoration: 'none',
                      height: '100%',
                      p: 2.5,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      bgcolor: '#ffffff',
                      border: '1px solid #D6E4EE',
                      borderRadius: 1.5,
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: '#F4F8FB',
                        transform: 'translateY(-3px)',
                        boxShadow: '0 6px 16px rgba(36, 58, 94, 0.1)'
                      }
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: '#EDF4FA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main', fontWeight: 800, fontSize: '1.2rem' }}>
                          {cat.icon || '📦'}
                        </Box>
                        <Chip label={itemCount > 0 ? `${itemCount} parts` : 'Active Series'} size="small" sx={{ bgcolor: '#EDF4FA', color: 'primary.main', fontWeight: 700, fontSize: '0.7rem' }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', mb: 0.5 }}>
                        {catName}
                      </Typography>
                      {cat.subcategories?.length > 0 && (
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                          Includes: {cat.subcategories.map(s => s.name || s).join(', ')}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, pt: 1.5, borderTop: '1px dashed #E2ECF5' }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'secondary.dark' }}>Explore Specification Tiers</Typography>
                      <ArrowForwardIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <EmptyState
            title="Component Categories Initializing"
            description="The master category database is undergoing active synchronization with supplier inventory feeds."
            actionText="Query Complete Product Table"
            onAction={() => navigate('/products')}
          />
        )}
      </Box>

      {/* 3. LIVE B2B PROCUREMENT TOOLBOX & BOM PROMO STRIP */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, bgcolor: '#ffffff', border: '1px solid #D6E4EE', borderLeft: '6px solid #243A5E', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <FileUploadIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>Bill of Materials (BOM) Tool</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Streamline your OEM supply chain. Upload Excel or CSV part numbers to automatically match against our inventory, receive volume pricing breaks, and request customized engineer quotations within 24 hours.
              </Typography>
            </Box>
            <Button component={RouterLink} to="/user/quotations" variant="contained" color="primary" sx={{ width: 'fit-content', fontWeight: 800 }}>
              LAUNCH BOM QUOTE GENERATOR
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, bgcolor: '#ffffff', border: '1px solid #D6E4EE', borderLeft: '6px solid #8FB6D8', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <DescriptionIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>Technical Datasheets & Certificates</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Access verified manufacturer datasheets, REACH / RoHS compliance statements, and CAD electrical model footprints directly from our component detail pages to verify design constraints before corporate signoff.
              </Typography>
            </Box>
            <Button component={RouterLink} to="/products" variant="outlined" color="primary" sx={{ width: 'fit-content', fontWeight: 800, borderWidth: 2 }}>
              SEARCH TECHNICAL ARCHIVE
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* 4. NEW ARRIVALS & IN-STOCK CATALOG SHOWCASE (DigiKey Dense Table/Grid) */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 3, borderBottom: '2px solid #243A5E', pb: 1.5 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
              Ready to Ship Inventory & New Arrivals
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              Live stock levels with guaranteed same-day shipment on enterprise procurement orders placed prior to 17:00 IST.
            </Typography>
          </Box>
          <Button component={RouterLink} to="/products?filter=in-stock" endIcon={<ArrowForwardIcon />} sx={{ fontWeight: 800 }}>
            EXPLORE ALL READY-TO-SHIP PARTS →
          </Button>
        </Box>

        {featuredProducts.length > 0 ? (
          <Grid container spacing={2.5}>
            {featuredProducts.slice(0, 8).map((product, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id || product._id || index}>
                <ProductCard product={product} viewMode="grid" />
              </Grid>
            ))}
          </Grid>
        ) : (
          <EmptyState
            title="Active Inventory Query Result Zero"
            description="Live inventory feeds returned zero matching records for this spotlight segment or backend authentication is pending."
            actionText="Open General Component Catalog"
            onAction={() => navigate('/products')}
          />
        )}
      </Box>

      {/* 5. MANUFACTURER INDEX PARTNERS BANNER */}
      <Box sx={{ p: 4, bgcolor: '#EDF4FA', borderRadius: 2, border: '1px solid #D6E4EE', textAlign: 'center', mb: 2 }}>
        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', mb: 1 }}>
          OFFICIAL INDUSTRIAL COMPONENT AUTHORIZATION
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', mb: 1.5 }}>
          Direct Franchised Distributor for Over 300 Global Component Brands
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 740, mx: 'auto', mb: 3 }}>
          We guarantee 100% genuine component lot traceability back to official OEM semiconductor fabricating plants and industrial interconnect hardware facilities worldwide.
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
          {['TEXAS INSTRUMENTS', 'STMICROELECTRONICS', 'ANALOG DEVICES', 'MURATA', 'KEMET', 'BOURNS', 'MOLEX', 'AMPHENOL', 'VISHAY', 'SCHNEIDER'].map((brand, i) => (
            <Chip key={i} label={brand} onClick={() => navigate(`/products?search=${brand}`)} sx={{ bgcolor: '#ffffff', color: 'primary.main', fontWeight: 800, border: '1px solid #D6E4EE', px: 1, py: 2, cursor: 'pointer', '&:hover': { bgcolor: '#243A5E', color: 'white' } }} />
          ))}
        </Box>
      </Box>

    </Box>
  );
};

export default Home;
