import React, { useState } from 'react';
import {
  Box, Container, Grid, Typography, Link, Divider, Stack, IconButton, Chip, InputBase, Button
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  VerifiedUser as ShieldIcon,
  LocalShipping as ShippingIcon,
  HeadsetMic as SupportIcon,
  Lock as LockIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import BrandLogo from './BrandLogo';
import notification from '../../utils/notification';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      notification.success('Thank you for subscribing to KDS Industrial Insights!');
      setEmail('');
    }
  };

  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(180deg, #0F172A 0%, #090D16 100%)',
        color: '#ffffff',
        pt: 8,
        pb: 4,
        borderTop: '1px solid rgba(143, 182, 216, 0.2)',
        position: 'relative'
      }}
    >
      {/* 0. Newsletter Subscription CTA Banner */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #16243C 0%, #243A5E 100%)',
            borderRadius: 4,
            p: { xs: 3, md: 5 },
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 3
          }}
        >
          <Box sx={{ maxWidth: 500 }}>
            <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Subscribe to Component Insights
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
              Get weekly inventory drop notifications, BOM market trends, and exclusive B2B price break updates directly to your inbox.
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubscribe}
            sx={{
              display: 'flex',
              width: { xs: '100%', md: 'auto' },
              minWidth: { md: 400 },
              gap: 1,
              bgcolor: 'rgba(255,255,255,0.1)',
              p: 0.8,
              borderRadius: 3,
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <InputBase
              placeholder="Enter your engineer email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ ml: 2, flex: 1, color: 'white', fontSize: '0.875rem' }}
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                variant="contained"
                endIcon={<SendIcon fontSize="small" />}
                sx={{
                  bgcolor: '#8FB6D8',
                  color: '#0F172A',
                  fontWeight: 900,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  whiteSpace: 'nowrap',
                  '&:hover': { bgcolor: '#ffffff' }
                }}
              >
                Join
              </Button>
            </motion.div>
          </Box>
        </Box>
      </Container>

      {/* 1. Value Proposition / Trust Banner Strip */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Grid container spacing={3} sx={{ pb: 6, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(143, 182, 216, 0.15)', color: '#8FB6D8', border: '1px solid rgba(143, 182, 216, 0.3)' }}>
                <ShippingIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Express Worldwide Delivery</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Same-day dispatch for in-stock orders</Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(143, 182, 216, 0.15)', color: '#8FB6D8', border: '1px solid rgba(143, 182, 216, 0.3)' }}>
                <ShieldIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>100% Genuine Components</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Factory certified & lot traceable</Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(143, 182, 216, 0.15)', color: '#8FB6D8', border: '1px solid rgba(143, 182, 216, 0.3)' }}>
                <SupportIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>24/7 Procurement Support</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Dedicated OEM engineering team</Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(143, 182, 216, 0.15)', color: '#8FB6D8', border: '1px solid rgba(143, 182, 216, 0.3)' }}>
                <LockIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Encrypted B2B Payments</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>ISO 27001 & Razorpay Secured</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* 2. Main Navigation & Information Directory */}
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 6 }}>

          {/* Brand Info & Summary */}
          <Grid size={{ xs: 12, md: 4 }}>
            <BrandLogo light sx={{ mb: 2.5 }} />
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3, lineHeight: 1.7, pr: { md: 4 } }}>
              KDS Electronics is a premier franchised distributor of active, passive, and electromechanical components serving electronics OEMs, contract manufacturers, and research institutions worldwide.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton 
                component="a" 
                href="https://www.linkedin.com/company/kds-electronics/" 
                target="_blank" 
                rel="noopener noreferrer" 
                size="small" 
                sx={{ color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.2)', '&:hover': { bgcolor: '#8FB6D8', color: '#0F172A' } }}
              >
                <LinkedInIcon fontSize="small" />
              </IconButton>
              <IconButton 
                component="a" 
                href="https://www.instagram.com/kds.electronics" 
                target="_blank" 
                rel="noopener noreferrer" 
                size="small" 
                sx={{ color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.2)', '&:hover': { bgcolor: '#8FB6D8', color: '#0F172A' } }}
              >
                <InstagramIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Grid>

          {/* Quick Shop Links */}
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2.5, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8FB6D8' }}>
              Shop & Discover
            </Typography>
            <Stack spacing={1.5}>
              <Link component={RouterLink} to="/products" color="inherit" underline="hover" variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}>
                All Catalog Parts
              </Link>
              <Link component={RouterLink} to="/products?filter=in-stock" color="inherit" underline="hover" variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}>
                Ready to Ship (In Stock)
              </Link>
              <Link component={RouterLink} to="/products?category=semiconductors" color="inherit" underline="hover" variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}>
                Semiconductors
              </Link>
              <Link component={RouterLink} to="/products?category=passives" color="inherit" underline="hover" variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}>
                Passive Components
              </Link>
              <Link component={RouterLink} to="/user/quotations" color="inherit" underline="hover" variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}>
                Request B2B Quote
              </Link>
            </Stack>
          </Grid>

          {/* Customer Service Links */}
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2.5, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8FB6D8' }}>
              Customer Care
            </Typography>
            <Stack spacing={1.5}>
              <Link component={RouterLink} to="/user/orders" color="inherit" underline="hover" variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}>
                Track Order
              </Link>
              <Link component={RouterLink} to="/contact" color="inherit" underline="hover" variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}>
                Contact Support
              </Link>
              <Link component={RouterLink} to="/contact#faq" color="inherit" underline="hover" variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}>
                Help & FAQ
              </Link>
              <Link component={RouterLink} to="/user/dashboard" color="inherit" underline="hover" variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}>
                Procurement Portal
              </Link>
            </Stack>
          </Grid>

          {/* Company & Legal Links */}
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2.5, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8FB6D8' }}>
              Company
            </Typography>
            <Stack spacing={1.5}>
              <Link component={RouterLink} to="/about" color="inherit" underline="hover" variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}>
                About Us
              </Link>
              <Link component={RouterLink} to="/about#quality" color="inherit" underline="hover" variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}>
                Quality & Compliance
              </Link>
              <Link component={RouterLink} to="/contact" color="inherit" underline="hover" variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}>
                Corporate Address
              </Link>
            </Stack>
          </Grid>

          {/* Contact Details */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2.5, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8FB6D8' }}>
              Get in Touch
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <PhoneIcon sx={{ color: '#8FB6D8', fontSize: 18, mt: 0.2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block' }}>Sales Hotline</Typography>
                  <Typography
                    component="a"
                    href="tel:+919925801333"
                    variant="body2"
                    sx={{ fontWeight: 700, color: 'inherit', textDecoration: 'none', '&:hover': { textDecoration: 'underline', color: '#8FB6D8' } }}
                  >
                    +91 99258 01333
                  </Typography>
                  <Typography
                    component="a"
                    href="tel:+919925001333"
                    variant="body2"
                    sx={{ fontWeight: 700, color: 'inherit', textDecoration: 'none', '&:hover': { textDecoration: 'underline', color: '#8FB6D8' } }}
                  >
                    +91 99250 01333
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <EmailIcon sx={{ color: '#8FB6D8', fontSize: 18, mt: 0.2 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block' }}>Inquiries</Typography>
                  <Typography
                    component="a"
                    href="mailto:sales@kdselectronics.com"
                    variant="body2"
                    sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'inherit', textDecoration: 'none', '&:hover': { textDecoration: 'underline', color: '#8FB6D8' } }}
                  >
                    sales@kdselectronics.com
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <LocationIcon sx={{ color: '#8FB6D8', fontSize: 18, mt: 0.2 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block' }}>Location</Typography>
                  <Typography
                    component="a"
                    href="https://maps.app.goo.gl/V5H9xHWCKsWJbaMh8"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="caption"
                    sx={{ color: 'rgba(255,255,255,0.8)', display: 'block', textDecoration: 'none', '&:hover': { textDecoration: 'underline', color: '#8FB6D8' } }}
                  >
                    K&DS Electronic Limited, MM Enterprise, Maruti Munchies, 7- Mani nagar, 7, Maninagar Main Rd, near Ashok garden, Mavadi Plot, Rajkot, Gujarat 360004
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />

        {/* 3. Bottom Legal & Copyright Bar */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            &copy; {new Date().getFullYear()} KDS Electronics Industrial Supply Ltd. All rights reserved. Registered ISO 9001:2015 Distributor.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip label="VISA" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 700 }} />
            <Chip label="MASTERCARD" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 700 }} />
            <Chip label="RAZORPAY" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 700 }} />
            <Chip label="UPI" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 700 }} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
