import React, { useState, useEffect } from 'react';
import { 
  Typography, Button, Box, Grid, Paper, Card,
  Container, Chip, CircularProgress, Stack
} from '@mui/material';
import { 
  ArrowForward as ArrowForwardIcon,
  TrendingUp as TrendingUpIcon,
  NewReleases as NewReleasesIcon,
  ThumbUp as BestSellerIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productPublicService, categoryPublicService } from '../services/apiServices';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/common/EmptyState';
import { useCurrency } from '../context/CurrencyContext';
import HeroSlider from '../components/home/HeroSlider';

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currency } = useCurrency();

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);
        let cats = [];
        try {
          const catRes = await categoryPublicService.listCategories();
          cats = catRes?.data?.content || catRes?.content || catRes?.data || catRes || [];
        } catch (cErr) {
          console.error('Failed to resolve category catalog:', cErr);
          cats = [];
        }

        let prods = [];
        const requestedCurrency = currency || 'INR';
        try {
          let prodRes;
          try {
            prodRes = await productPublicService.listProducts({ size: 16, currency: requestedCurrency });
          } catch (priceErr) {
            if (priceErr?.response?.status === 503 && requestedCurrency !== 'INR') {
              prodRes = await productPublicService.listProducts({ size: 16, currency: 'INR' });
            } else {
              throw priceErr;
            }
          }
          prods = prodRes?.data?.content || prodRes?.content || prodRes?.data || prodRes || [];
        } catch (pErr) {
          console.error('Failed to resolve product inventory:', pErr);
          prods = [];
        }

        setCategories(Array.isArray(cats) ? cats : []);
        setFeaturedProducts(Array.isArray(prods) ? prods : []);
      } finally {
        setLoading(false);
      }
    };
    fetchStoreData();
  }, [currency]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 16 }}>
        <CircularProgress size={44} color="primary" />
        <Typography variant="body1" sx={{ mt: 2, fontWeight: 700, color: 'text.primary' }}>
          Loading E-Commerce Catalog...
        </Typography>
      </Box>
    );
  }

  const trendingProducts = featuredProducts.slice(0, 4);
  const newArrivals = featuredProducts.slice(4, 8);
  const bestSellers = featuredProducts.slice(8, 12);

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <Box sx={{ width: '100%', pb: 8 }}>

      {/* 1. FULL-WIDTH HERO SLIDER */}
      <HeroSlider />

      <Container maxWidth="lg">
        
        {/* 2. FEATURED CATEGORIES SECTION */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          <Box sx={{ mb: 8 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#5F86A6', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  COLLECTIONS
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: '-0.02em' }}>
                  Featured Categories
                </Typography>
              </Box>
              <Button component={RouterLink} to="/products" endIcon={<ArrowForwardIcon />} sx={{ fontWeight: 800 }}>
                Browse All Categories
              </Button>
            </Box>

            {categories.length > 0 ? (
              <Grid container spacing={3}>
                {categories.map((cat, index) => {
                  const catName = cat.name || cat.title || `Category ${index + 1}`;
                  const catSlug = cat.slug || catName.toLowerCase().replace(/\s+/g, '-');
                  const itemCount = cat.productCount || cat.itemsCount || 0;
                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={cat.id || index}>
                      <motion.div
                        whileHover={{ y: -6 }}
                        transition={{ duration: 0.25 }}
                        style={{ height: '100%' }}
                      >
                        <Card
                          component={RouterLink}
                          to={`/products?category=${encodeURIComponent(catSlug)}`}
                          sx={{
                            textDecoration: 'none',
                            p: 3,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            bgcolor: '#ffffff',
                            border: '1px solid #E2ECF5',
                            borderRadius: 3,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                            '&:hover': {
                              borderColor: '#243A5E',
                              boxShadow: '0 12px 28px rgba(36, 58, 94, 0.12)'
                            }
                          }}
                        >
                          <Box>
                            <Box sx={{ width: 52, height: 52, borderRadius: 2.5, bgcolor: '#EDF4FA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main', fontWeight: 900, fontSize: '1.5rem', mb: 2, border: '1px solid #D6E4EE' }}>
                              {cat.icon || '⚡'}
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', mb: 0.5 }}>
                              {catName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              {itemCount > 0 ? `${itemCount} Products Available` : 'Active Collection'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 3, color: '#5F86A6', fontWeight: 800, fontSize: '0.8125rem' }}>
                            Shop Category <ArrowForwardIcon sx={{ fontSize: 16 }} />
                          </Box>
                        </Card>
                      </motion.div>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <EmptyState
                title="Catalog Categories Synchronizing"
                description="Browse our master product catalog to explore all components."
                actionText="View Products"
                onAction={() => navigate('/products')}
              />
            )}
          </Box>
        </motion.div>

        {/* 3. TRENDING PRODUCTS SECTION */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          <Box sx={{ mb: 8 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon sx={{ color: '#5F86A6', fontSize: 32 }} />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#5F86A6', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                    MOST POPULAR
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: '-0.02em' }}>
                    Trending Products
                  </Typography>
                </Box>
              </Box>
              <Button component={RouterLink} to="/products" endIcon={<ArrowForwardIcon />} sx={{ fontWeight: 800 }}>
                View All Products
              </Button>
            </Box>

            <Grid container spacing={3}>
              {trendingProducts.map((product, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={product.id || index}>
                  <ProductCard product={product} viewMode="grid" />
                </Grid>
              ))}
            </Grid>
          </Box>
        </motion.div>

        {/* 4. PROMOTIONAL OFFER BANNER */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              mb: 8,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #111B2C 0%, #243A5E 100%)',
              color: '#ffffff',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 4,
              boxShadow: '0 16px 36px rgba(17, 27, 44, 0.25)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <Box sx={{ maxWidth: 640 }}>
              <Chip label="LIMITED TIME B2B OFFER" size="small" sx={{ bgcolor: '#8FB6D8', color: '#0F172A', fontWeight: 900, mb: 2, px: 1 }} />
              <Typography variant="h3" sx={{ fontWeight: 900, mb: 1.5, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                Bulk OEM Procurement Discount
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', lineHeight: 1.6 }}>
                Get up to 25% extra volume savings on orders above 1,000 units. Instant BOM analysis & dedicated procurement manager for enterprise clients.
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Button
                  component={RouterLink}
                  to="/user/quotations"
                  variant="contained"
                  size="large"
                  sx={{ bgcolor: '#8FB6D8', color: '#0F172A', fontWeight: 900, px: 4, py: 1.5, borderRadius: 2.5, '&:hover': { bgcolor: '#ffffff' } }}
                >
                  Upload BOM File
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Button
                  component={RouterLink}
                  to="/contact"
                  variant="outlined"
                  size="large"
                  sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', fontWeight: 700, px: 3, py: 1.5, borderRadius: 2.5, '&:hover': { borderColor: 'white' } }}
                >
                  Contact Sales
                </Button>
              </motion.div>
            </Stack>
          </Paper>
        </motion.div>

        {/* 5. NEW ARRIVALS SHOWCASE */}
        {newArrivals.length > 0 && (
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            <Box sx={{ mb: 8 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NewReleasesIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#5F86A6', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                      JUST ARRIVED
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: '-0.02em' }}>
                      New Arrivals
                    </Typography>
                  </Box>
                </Box>
                <Button component={RouterLink} to="/products" endIcon={<ArrowForwardIcon />} sx={{ fontWeight: 800 }}>
                  Explore New Stock
                </Button>
              </Box>

              <Grid container spacing={3}>
                {newArrivals.map((product, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }} key={product.id || index}>
                    <ProductCard product={product} viewMode="grid" />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </motion.div>
        )}

        {/* 6. BEST SELLERS & RECOMMENDED PRODUCTS */}
        {bestSellers.length > 0 && (
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            <Box sx={{ mb: 8 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BestSellerIcon sx={{ color: '#5F86A6', fontSize: 32 }} />
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#5F86A6', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                      CUSTOMER FAVORITES
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: '-0.02em' }}>
                      Best Sellers & Recommended
                    </Typography>
                  </Box>
                </Box>
                <Button component={RouterLink} to="/products" endIcon={<ArrowForwardIcon />} sx={{ fontWeight: 800 }}>
                  Shop All
                </Button>
              </Box>

              <Grid container spacing={3}>
                {bestSellers.map((product, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }} key={product.id || index}>
                    <ProductCard product={product} viewMode="grid" />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </motion.div>
        )}

        {/* 7. BRAND & TRUST SECTION */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 5,
              bgcolor: '#EDF4FA',
              borderRadius: 4,
              border: '1px solid #D6E4EE',
              textAlign: 'center'
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 900, color: '#5F86A6', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', mb: 1 }}>
              AUTHORIZED GLOBAL DISTRIBUTOR
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', mb: 2 }}>
              Trusted by 10,000+ Engineers & OEMs Worldwide
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720, mx: 'auto', mb: 4, lineHeight: 1.6 }}>
              We source 100% authentic electronic parts directly from world-class semiconductor foundries and component manufacturers with full lot certificate traceability.
            </Typography>

            <Grid container spacing={2} justifyContent="center">
              {['TEXAS INSTRUMENTS', 'STMICROELECTRONICS', 'ANALOG DEVICES', 'MURATA', 'KEMET', 'BOURNS', 'MOLEX', 'SCHNEIDER'].map((brand, i) => (
                <Grid size={{ xs: 6, sm: 4, md: 3 }} key={i}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Paper
                      onClick={() => navigate(`/products?search=${brand}`)}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        fontWeight: 900,
                        color: 'primary.main',
                        border: '1px solid #D6E4EE',
                        borderRadius: 2,
                        cursor: 'pointer',
                        bgcolor: '#ffffff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                        transition: 'all 0.2s ease',
                        '&:hover': { bgcolor: '#243A5E', color: 'white', borderColor: '#243A5E' }
                      }}
                    >
                      {brand}
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </motion.div>

      </Container>
    </Box>
  );
};

export default Home;
