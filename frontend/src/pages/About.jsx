import React from 'react';
import { 
  Box, Container, Typography, Grid, Paper, Card, CardContent, Button, Stack, Chip, Divider 
} from '@mui/material';
import { 
  Verified as VerifiedIcon, 
  VerifiedUser as ShieldIcon, 
  LocalShipping as ShippingIcon, 
  Engineering as EngineeringIcon, 
  Factory as FactoryIcon, 
  ShoppingBag as ShopIcon,
  CheckCircle as CheckIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const About = () => {
  return (
    <Box sx={{ pb: 8, bgcolor: 'background.default' }}>
      
      {/* 1. HERO BANNER */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: '#ffffff',
          py: { xs: 6, md: 10 },
          mb: 8,
          background: 'linear-gradient(135deg, #111B2C 0%, #243A5E 100%)',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Chip label="ABOUT KDS ELECTRONICS" size="small" sx={{ bgcolor: 'secondary.main', color: 'primary.dark', fontWeight: 900, mb: 2 }} />
          <Typography variant="h2" sx={{ fontWeight: 900, mb: 2, fontSize: { xs: '2rem', md: '3.25rem' } }}>
            Powering Global Electronics Innovation
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', lineHeight: 1.7, maxWidth: 720, mx: 'auto' }}>
            We are an authorized, franchised distributor of active, passive, and electromechanical components delivering zero-defect supply chain solutions to OEMs, engineers, and manufacturers worldwide.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg">
        
        {/* 2. OUR STORY & MISSION */}
        <Grid container spacing={6} alignItems="center" sx={{ mb: 10 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="caption" sx={{ fontWeight: 900, color: 'secondary.dark', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              OUR JOURNEY
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main', mb: 3, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
              Built by Engineers, Dedicated to Reliability
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
              Founded with the mission to eradicate counterfeit components and supply chain delays, KDS Electronics has grown into a trusted industrial e-commerce platform stocking over 500,000 factory-certified part numbers.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
              Our automated procurement hub empowers hardware designers, purchasing agents, and manufacturing plants with real-time stock visibility, volume pricing breakdowns, and guaranteed lot traceability.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button component={RouterLink} to="/products" variant="contained" color="primary" size="large" startIcon={<ShopIcon />} sx={{ fontWeight: 900, px: 3, borderRadius: 2 }}>
                Shop Our Catalog
              </Button>
              <Button component={RouterLink} to="/contact" variant="outlined" color="primary" size="large" sx={{ fontWeight: 700, borderRadius: 2 }}>
                Get in Touch
              </Button>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                width: '100%',
                height: 380,
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: '0 16px 36px rgba(0,0,0,0.12)',
                border: '1px solid #D6E4EE'
              }}
            >
              <Box
                component="img"
                src="https://d1sswqar085ync.cloudfront.net/assets/quality_facility.png"
                alt="KDS Quality Inspection Facility"
                sx={{ width: '100%', height: '100%', objectFit: 'contain', bgcolor: '#16243C', p: 4 }}
              />
            </Box>
          </Grid>
        </Grid>

        {/* 3. CORE VALUES & STATS */}
        <Box sx={{ mb: 10 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="caption" sx={{ fontWeight: 900, color: 'secondary.dark', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              THE KDS PROMISE
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main' }}>
              Why Choose KDS Electronics?
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 4, height: '100%', borderRadius: 3, border: '1px solid #E2ECF5', textAlign: 'center' }}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#EDF4FA', color: 'primary.main', width: 'fit-content', mx: 'auto', mb: 2 }}>
                  <ShieldIcon fontSize="large" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>100% Genuine</Typography>
                <Typography variant="body2" color="text.secondary">
                  Direct manufacturer sourcing with full certificates of compliance and anti-counterfeit protection.
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 4, height: '100%', borderRadius: 3, border: '1px solid #E2ECF5', textAlign: 'center' }}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#EDF4FA', color: 'primary.main', width: 'fit-content', mx: 'auto', mb: 2 }}>
                  <ShippingIcon fontSize="large" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Same-Day Dispatch</Typography>
                <Typography variant="body2" color="text.secondary">
                  Guaranteed same-day shipping on all ready-to-ship inventory items placed before cut-off hours.
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 4, height: '100%', borderRadius: 3, border: '1px solid #E2ECF5', textAlign: 'center' }}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#EDF4FA', color: 'primary.main', width: 'fit-content', mx: 'auto', mb: 2 }}>
                  <FactoryIcon fontSize="large" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>OEM Bulk Pricing</Typography>
                <Typography variant="body2" color="text.secondary">
                  Transparent volume price breaks and automated BOM quotation analysis for production runs.
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 4, height: '100%', borderRadius: 3, border: '1px solid #E2ECF5', textAlign: 'center' }}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#EDF4FA', color: 'primary.main', width: 'fit-content', mx: 'auto', mb: 2 }}>
                  <EngineeringIcon fontSize="large" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Expert Support</Typography>
                <Typography variant="body2" color="text.secondary">
                  Dedicated component engineers ready to assist with cross-references, replacements, and specifications.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* 4. PERFORMANCE NUMBERS BANNER */}
        <Paper
          elevation={0}
          sx={{
            p: 6,
            mb: 10,
            borderRadius: 4,
            bgcolor: '#111B2C',
            color: 'white',
            textAlign: 'center'
          }}
        >
          <Grid container spacing={4}>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 900, color: 'secondary.light', mb: 0.5 }}>500,000+</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>Parts in Stock</Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 900, color: 'secondary.light', mb: 0.5 }}>10,000+</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>Active OEM Clients</Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 900, color: 'secondary.light', mb: 0.5 }}>99.9%</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>On-Time Shipment Rate</Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 900, color: 'secondary.light', mb: 0.5 }}>ISO 9001</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>Certified Quality Facility</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* 5. SHOPPING CTA */}
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', mb: 2 }}>
            Ready to Start Procuring Genuine Parts?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Explore our ready-to-ship electronic catalog or submit a custom bill of materials for bulk quotes.
          </Typography>
          <Button component={RouterLink} to="/products" variant="contained" color="primary" size="large" startIcon={<ShopIcon />} sx={{ fontWeight: 900, px: 5, py: 1.5, borderRadius: 2 }}>
            Explore Product Catalog
          </Button>
        </Box>

      </Container>
    </Box>
  );
};

export default About;
