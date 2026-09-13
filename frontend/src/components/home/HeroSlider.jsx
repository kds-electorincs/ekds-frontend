import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, IconButton, Chip, Stack } from '@mui/material';
import { 
  ArrowBackIosNew as PrevIcon, 
  ArrowForwardIos as NextIcon,
  ShoppingBag as ShopIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const SLIDES = [
  {
    id: 1,
    badge: 'NEW SEASON RELEASE',
    title: 'High-Precision Electronic Components & Spares',
    subtitle: 'Over 500,000 factory-tested semiconductors, microcontrollers, and passive components in stock for immediate worldwide dispatch.',
    primaryCtaText: 'Shop All Components',
    primaryCtaLink: '/products',
    secondaryCtaText: 'Browse Ready to Ship',
    secondaryCtaLink: '/products?filter=in-stock',
    bgColor: '#16243C',
    gradient: 'linear-gradient(135deg, #16243C 0%, #243A5E 50%, #0F172A 100%)',
    accentColor: '#8FB6D8',
    image: 'https://d1sswqar085ync.cloudfront.net/assets/hero_semiconductor.png'
  },
  {
    id: 2,
    badge: 'ENTERPRISE B2B SOLUTIONS',
    title: 'Automated Bill of Materials (BOM) Quotations',
    subtitle: 'Upload your OEM component list to receive instant volume price breaks, lot traceability data, and 24-hour engineer approval.',
    primaryCtaText: 'Request B2B Quote',
    primaryCtaLink: '/user/quotations',
    secondaryCtaText: 'Explore Categories',
    secondaryCtaLink: '/products',
    bgColor: '#0F172A',
    gradient: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #090D16 100%)',
    accentColor: '#38BDF8',
    image: 'https://d1sswqar085ync.cloudfront.net/assets/hero_bom.png'
  },
  {
    id: 3,
    badge: 'ISO 9001:2015 CERTIFIED',
    title: 'Guaranteed Genuine Factory Traceability',
    subtitle: 'Direct franchised supply chain partner for leading semiconductor manufacturers. 100% anti-counterfeit protection guaranteed.',
    primaryCtaText: 'Discover Brand Partners',
    primaryCtaLink: '/about',
    secondaryCtaText: 'Shop New Arrivals',
    secondaryCtaLink: '/products',
    bgColor: '#1E1B4B',
    gradient: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #0F172A 100%)',
    accentColor: '#A78BFA',
    image: 'https://d1sswqar085ync.cloudfront.net/assets/hero_iso.png'
  }
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const slide = SLIDES[currentSlide];

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.98
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    },
    exit: (direction) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
    })
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: { xs: 460, sm: 500, md: 540 },
        background: slide.gradient,
        color: '#ffffff',
        overflow: 'hidden',
        transition: 'background 0.8s ease-in-out',
        display: 'flex',
        alignItems: 'center',
        mb: 6
      }}
    >
      {/* Floating Decorative Ambient Lights */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '-10%',
          right: '10%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${slide.accentColor} 0%, rgba(0,0,0,0) 70%)`,
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, position: 'relative', zIndex: 2 }}>
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            style={{ width: '100%' }}
          >
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 0.8fr' }, gap: 4, alignItems: 'center' }}>
              
              {/* Slide Text Content */}
              <Box>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  <Chip
                    label={slide.badge}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                      color: slide.accentColor,
                      fontWeight: 900,
                      fontSize: '0.75rem',
                      letterSpacing: '0.08em',
                      backdropFilter: 'blur(8px)',
                      border: `1px solid ${slide.accentColor}44`,
                      px: 1.5,
                      py: 0.5,
                      mb: 2.5
                    }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '2rem', sm: '2.5rem', md: '3.25rem' },
                      fontWeight: 900,
                      lineHeight: 1.15,
                      mb: 2,
                      letterSpacing: '-0.02em',
                      textShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}
                  >
                    {slide.title}
                  </Typography>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.85)',
                      fontSize: { xs: '0.95rem', md: '1.1rem' },
                      mb: 4,
                      lineHeight: 1.6,
                      maxWidth: 600
                    }}
                  >
                    {slide.subtitle}
                  </Typography>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                      <Button
                        component={RouterLink}
                        to={slide.primaryCtaLink}
                        variant="contained"
                        size="large"
                        startIcon={<ShopIcon />}
                        sx={{
                          bgcolor: slide.accentColor,
                          color: '#0F172A',
                          fontWeight: 900,
                          px: 3.5,
                          py: 1.4,
                          fontSize: '0.95rem',
                          borderRadius: 2.5,
                          boxShadow: `0 8px 24px ${slide.accentColor}55`,
                          '&:hover': { bgcolor: '#ffffff', color: '#0F172A' }
                        }}
                      >
                        {slide.primaryCtaText}
                      </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                      <Button
                        component={RouterLink}
                        to={slide.secondaryCtaLink}
                        variant="outlined"
                        size="large"
                        sx={{
                          color: '#ffffff',
                          borderColor: 'rgba(255, 255, 255, 0.4)',
                          fontWeight: 700,
                          px: 3,
                          py: 1.4,
                          fontSize: '0.95rem',
                          borderRadius: 2.5,
                          backdropFilter: 'blur(4px)',
                          '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255, 255, 255, 0.15)' }
                        }}
                      >
                        {slide.secondaryCtaText}
                      </Button>
                    </motion.div>
                  </Stack>
                </motion.div>
              </Box>

              {/* Slide Visual Image Card */}
              <Box
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative'
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      maxHeight: 340,
                      borderRadius: 4,
                      overflow: 'hidden',
                      boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      bgcolor: 'rgba(0,0,0,0.2)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <Box
                      component="img"
                      src={slide.image}
                      alt={slide.title}
                      sx={{
                        width: '100%',
                        height: 340,
                        objectFit: 'cover',
                        filter: 'brightness(0.95)'
                      }}
                    />
                  </Box>
                </motion.div>
              </Box>
            </Box>
          </motion.div>
        </AnimatePresence>
      </Container>

      {/* Slide Navigation Controls */}
      <IconButton
        onClick={handlePrev}
        aria-label="Previous Slide"
        sx={{
          position: 'absolute',
          left: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'white',
          bgcolor: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.15)',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.7)', transform: 'translateY(-50%) scale(1.1)' },
          transition: 'all 0.2s ease',
          zIndex: 3
        }}
      >
        <PrevIcon fontSize="small" />
      </IconButton>

      <IconButton
        onClick={handleNext}
        aria-label="Next Slide"
        sx={{
          position: 'absolute',
          right: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'white',
          bgcolor: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.15)',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.7)', transform: 'translateY(-50%) scale(1.1)' },
          transition: 'all 0.2s ease',
          zIndex: 3
        }}
      >
        <NextIcon fontSize="small" />
      </IconButton>

      {/* Slide Indicators */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1.5,
          zIndex: 3
        }}
      >
        {SLIDES.map((_, idx) => (
          <Box
            key={idx}
            onClick={() => {
              setDirection(idx > currentSlide ? 1 : -1);
              setCurrentSlide(idx);
            }}
            sx={{
              width: currentSlide === idx ? 36 : 10,
              height: 10,
              borderRadius: 5,
              bgcolor: currentSlide === idx ? slide.accentColor : 'rgba(255,255,255,0.35)',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: currentSlide === idx ? `0 0 10px ${slide.accentColor}` : 'none'
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default HeroSlider;
