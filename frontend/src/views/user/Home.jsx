import { useRouter } from 'next/navigation';
"use client";
import React, { useState, useEffect } from 'react';
import { 
  Typography, Button, Box, Grid, Paper, Card, CardContent, CardMedia,
  List, ListItem, ListItemButton, ListItemText, Divider, Chip, Rating, 
  IconButton, useTheme, Fade
} from '@mui/material';
import { 
  LocalShipping as LocalShippingIcon,
  FileUpload as FileUploadIcon,
  Build as BuildIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ArrowRightAlt as ArrowRightAltIcon,
  AddShoppingCart as AddShoppingCartIcon,
  ArrowForward as ArrowForwardIcon,
  Settings as SettingsIcon,
  Engineering as EngineeringIcon,
  Forum as ForumIcon,
  Bolt as BoltIcon,
  Shield as ShieldIcon,
  ArrowForwardIos as ArrowForwardIosIcon
} from '@mui/icons-material';
import StarIcon from '@mui/icons-material/Star';
import Link from 'next/link';
import { as RouterLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '../constants/mockData';

// Auto-playing Carousel Banners Data
const CAROUSEL_SLIDES = [
  {
    title: "Free B2B Shipping on Orders over ₹10,000!",
    description: "Get your industrial tools, safety gear, and electrical parts delivered with extreme speed. Secure wholesale packaging and real-time tracking for bulk shipments.",
    buttonText: "Shop Catalog Now",
    link: "/products",
    bg: "linear-gradient(135deg, #EDF4FA 0%, #CFE3F1 100%)",
    visual: <LocalShippingIcon sx={{ fontSize: { xs: 80, md: 120 }, color: 'primary.main', opacity: 0.85 }} />
  },
  {
    title: "Submit a BOM List for Custom Quotations",
    description: "Ordering in bulk? Upload your bill of materials (BOM) file directly on our portal, and our dedicated sales agents will review and return custom tiered B2B pricing within 24 hours.",
    buttonText: "Request B2B Quote",
    link: "/user/quotations",
    bg: "linear-gradient(135deg, #CFE3F1 0%, #8FB6D8 100%)",
    visual: <FileUploadIcon sx={{ fontSize: { xs: 80, md: 120 }, color: 'primary.main', opacity: 0.85 }} />
  },
  {
    title: "Premium Tools from Trusted Global Brands",
    description: "High-performance power drills, certified head protection, and industrial-grade floodlights. Upgrade your workshop productivity and warehouse safety compliance today.",
    buttonText: "Browse New Arrivals",
    link: "/products",
    bg: "linear-gradient(135deg, #EDF4FA 0%, #ffffff 100%)",
    visual: <BuildIcon sx={{ fontSize: { xs: 80, md: 120 }, color: 'primary.main', opacity: 0.85 }} />
  }
];

const Home = () => {
  const theme = useTheme();
  const router = useRouter();
  const { addToCart } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  };

  // Tools, Services, Content lists
  const toolsColumns = [
    {
      title: "B2B Tools",
      icon: <SettingsIcon sx={{ color: 'primary.main', fontSize: 24 }} />,
      items: [
        { label: "BOM Upload List", desc: "Submit your wholesale spreadsheet parts list", path: "/user/quotations" },
        { label: "Price Calculator", desc: "Estimate volume discounts & custom quotes", path: "/products" },
        { label: "Bulk Order Entry", desc: "Enter codes and counts to purchase directly", path: "/products" }
      ]
    },
    {
      title: "Customer Services",
      icon: <EngineeringIcon sx={{ color: 'primary.main', fontSize: 24 }} />,
      items: [
        { label: "Live Order Tracking", desc: "Track shipment details & carrier status", path: "/user/orders" },
        { label: "Custom B2B Quotations", desc: "Submit specifications for special pricing", path: "/user/quotations" },
        { label: "ERP API Integrations", desc: "Sync catalog inventory with internal systems", path: "/" }
      ]
    },
    {
      title: "Technical Resources",
      icon: <ForumIcon sx={{ color: 'primary.main', fontSize: 24 }} />,
      items: [
        { label: "New Product Catalog", desc: "Browse recently added B2B components", path: "/products" },
        { label: "Datasheets & Manuals", desc: "Download safety specs and usage guides", path: "/products" },
        { label: "Technical Support Forum", desc: "Read tutorials and troubleshoot gear", path: "/" }
      ]
    }
  ];

  // Mock list of categories for the sidebar (looks dense and professional)
  const sidebarCategories = [
    { name: "Industrial Tools", path: "/products?category=Industrial%20Tools", active: true },
    { name: "Electrical Supplies", path: "/products?category=Electrical%20Supplies", active: true },
    { name: "Safety Gear", path: "/products?category=Safety%20Gear", active: true },
    { name: "Office Equipment", path: "/products?category=Office%20Equipment", active: true },
    { name: "Connectors & Terminals", path: "/products", active: false },
    { name: "Cables & Wires", path: "/products", active: false },
    { name: "Semiconductors & Actuators", path: "/products", active: false },
    { name: "Power Supplies & Converters", path: "/products", active: false },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      
      {/* SECTION 1: HERO CONTAINER (Sidebar + Banner) */}
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'stretch', width: '100%', flexDirection: { xs: 'column', md: 'row' } }}>
        
        {/* Left Side: Product Category Sidebar */}
        <Box sx={{ width: { xs: '100%', md: '25%' }, display: { xs: 'none', md: 'block' } }}>
          <Paper 
            elevation={0} 
            sx={{ 
              border: '1px solid', 
              borderColor: 'divider', 
              borderRadius: 2, 
              overflow: 'hidden',
              height: 440,
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.paper'
            }}
          >
            {/* Sidebar Title */}
            <Box 
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'white', 
                p: 2, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center'
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: 0.5 }}>
                PRODUCTS ({currentSlide})
              </Typography>
              <Button 
                component={RouterLink} 
                to="/products" 
                size="small" 
                sx={{ 
                  color: 'secondary.light', 
                  fontWeight: 700, 
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  p: 0,
                  minWidth: 0,
                  '&:hover': { color: 'white', bgcolor: 'transparent' }
                }}
              >
                VIEW ALL
              </Button>
            </Box>

            {/* Category list items */}
            <List 
              disablePadding 
              sx={{ 
                flexGrow: 1, 
                overflowY: 'auto',
                '&::-webkit-scrollbar': { width: '5px' },
                '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(36, 58, 94, 0.15)', borderRadius: '4px' },
                '&::-webkit-scrollbar-track': { bgcolor: 'transparent' }
              }}
            >
              {sidebarCategories.map((cat, i) => (
                <React.Fragment key={i}>
                  <ListItem disablePadding>
                    <ListItemButton 
                      component={RouterLink} 
                      to={cat.path}
                      disabled={!cat.active}
                      sx={{ 
                        py: 1.2, 
                        px: 2.5,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        '&:hover': {
                          bgcolor: 'rgba(36, 58, 94, 0.04)',
                          '& svg': { transform: 'translateX(4px)', color: 'primary.main' }
                        }
                      }}
                    >
                      <ListItemText 
                        primary={cat.name} 
                        primaryTypographyProps={{ 
                          fontSize: '0.825rem', 
                          fontWeight: cat.active ? 600 : 500,
                          color: cat.active ? 'text.primary' : 'text.disabled'
                        }} 
                      />
                      {cat.active ? (
                        <ArrowForwardIosIcon 
                          sx={{ 
                            fontSize: 10, 
                            color: 'text.secondary', 
                            transition: 'all 0.2s ease' 
                          }} 
                        />
                      ) : (
                        <Chip 
                          label="Soon" 
                          size="small" 
                          sx={{ 
                            height: 18, 
                            fontSize: '0.65rem', 
                            fontWeight: 700,
                            bgcolor: 'rgba(0,0,0,0.06)' 
                          }} 
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                  {i < sidebarCategories.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>

        {/* Right Side: Promotion Banner Carousel */}
        <Box sx={{ flexGrow: 10, minWidth: 0, height: 440 }}>
          <Paper 
            elevation={0}
            sx={{ 
              position: 'relative', 
              height: '100%', 
              width: '100%',
              borderRadius: 2, 
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper'
            }}
          >
            {/* Carousel Item with CSS transition */}
            {CAROUSEL_SLIDES.map((slide, index) => {
              const isActive = currentSlide === index;
              return (
                <Box 
                  key={index}
                  sx={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: slide.bg, 
                    p: { xs: 4, md: 6 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    opacity: isActive ? 1 : 0,
                    pointerEvents: isActive ? 'auto' : 'none',
                    transition: 'opacity 0.8s ease-in-out',
                    zIndex: isActive ? 2 : 1
                  }}
                >
                  {/* Slide Content */}
                  <Box sx={{ maxWidth: { xs: '100%', md: '100%' }, display: 'flex', flexDirection: 'column', gap: 2, zIndex: 2 }}>
                    <Typography 
                      variant="h4" 
                      component="h2" 
                      sx={{ 
                        fontWeight: 1050, 
                        color: 'primary.main',
                        lineHeight: 1.2,
                        fontSize: { xs: '1.5rem', md: '2.2rem' }
                      }}
                    >
                      {slide.title}
                    </Typography>
                    
                    <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                      {slide.description}
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Button
                        component={RouterLink}
                        to={slide.link}
                        variant="contained"
                        size="large"
                        sx={{ 
                          py: 1.2, 
                          px: 3.5, 
                          fontWeight: 700, 
                          fontSize: '0.9rem',
                          bgcolor: 'primary.main',
                          boxShadow: '0 4px 14px rgba(36, 58, 94, 0.2)',
                          '&:hover': { bgcolor: 'primary.dark' }
                        }}
                      >
                        {slide.buttonText}
                      </Button>
                    </Box>
                  </Box>

                  {/* Slide Visual Illustration (Desktop Only) */}
                  <Box 
                    sx={{ 
                      display: { xs: 'none', md: 'flex' }, 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      pr: 4,
                      zIndex: 1,
                      transform: 'scale(1.05)',
                      transition: 'transform 0.5s ease',
                      '&:hover': { transform: 'scale(1.1) rotate(2deg)' }
                    }}
                  >
                    {slide.visual}
                  </Box>
                </Box>
              );
            })}

            {/* Left/Right Navigation Buttons */}
            <IconButton 
              onClick={handlePrevSlide}
              sx={{ 
                position: 'absolute', 
                left: 12, 
                top: '50%', 
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255,255,255,0.7)',
                color: 'primary.main',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                zIndex: 3
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
            
            <IconButton 
              onClick={handleNextSlide}
              sx={{ 
                position: 'absolute', 
                right: 12, 
                top: '50%', 
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255,255,255,0.7)',
                color: 'primary.main',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                zIndex: 3
              }}
            >
              <ChevronRightIcon />
            </IconButton>

            {/* Navigation Dots Indicator */}
            <Box 
              sx={{ 
                position: 'absolute', 
                bottom: 20, 
                width: '100%', 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 1.5,
                zIndex: 3
              }}
            >
              {CAROUSEL_SLIDES.map((_, i) => (
                <Box 
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  sx={{ 
                    width: i === currentSlide ? 24 : 8, 
                    height: 8, 
                    borderRadius: 4, 
                    bgcolor: i === currentSlide ? 'primary.main' : 'rgba(36, 58, 94, 0.3)', 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* SECTION 2: 3-COLUMN TOOLS, SERVICES, CONTENT SECTION */}
      <Grid container spacing={3}>
        {toolsColumns.map((col, index) => (
          <Grid size={{ xs: 12, md: 4 }} key={index}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3.5, 
                height: '100%', 
                border: '1px solid', 
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: '#fafcfd',
                '&:hover': { boxShadow: '0 8px 24px rgba(36, 58, 94, 0.06)' }
              }}
            >
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                {col.icon}
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', ml: 1.5, fontSize: '1.05rem', letterSpacing: 0.2 }}>
                  {col.title}
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 2 }} />

              {/* Items List */}
              <List disablePadding>
                {col.items.map((item, i) => (
                  <ListItem disablePadding key={i} sx={{ mb: i < col.items.length - 1 ? 2.5 : 0 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                      <Typography 
                        component={RouterLink}
                        to={item.path}
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: 700, 
                          color: 'primary.main', 
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          width: 'fit-content',
                          '&:hover': { 
                            color: 'secondary.dark',
                            textDecoration: 'underline'
                          }
                        }}
                      >
                        {item.label}
                        <ArrowRightAltIcon sx={{ fontSize: 16 }} />
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.3, fontWeight: 500 }}>
                        {item.desc}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* SECTION 3: FEATURED CATEGORIES GRID */}
      <Box>
        {/* Section Title */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: -0.5 }}>
            Featured Product Categories
          </Typography>
          <Button 
            component={RouterLink} 
            to="/products"
            endIcon={<ArrowForwardIcon />} 
            sx={{ fontWeight: 700, color: 'primary.main', textTransform: 'none' }}
          >
            All Categories
          </Button>
        </Box>

        <Grid container spacing={3}>
          {MOCK_CATEGORIES.map((cat) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={cat.id}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%', 
                  border: '1px solid', 
                  borderColor: 'divider',
                  borderRadius: 2.5,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 8px 25px rgba(36, 58, 94, 0.08)',
                    '& img': { transform: 'scale(1.08)' }
                  }
                }}
                onClick={() => router.push(cat.path)}
              >
                {/* Category Cover Image */}
                <Box sx={{ height: 160, overflow: 'hidden', bgcolor: 'rgba(0,0,0,0.02)', position: 'relative' }}>
                  {/* Category Image - falls back based on name */}
                  <CardMedia
                    component="img"
                    height="160"
                    image={
                      cat.name.includes("Tool") ? "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=500" :
                      cat.name.includes("Electrical") ? "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&q=80&w=500" :
                      cat.name.includes("Safety") ? "https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?auto=format&fit=crop&q=80&w=500" :
                      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=500"
                    }
                    alt={cat.name}
                    sx={{ 
                      transition: 'transform 0.4s ease'
                    }}
                  />
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: 12, 
                      left: 12, 
                      bgcolor: 'background.paper', 
                      borderRadius: '50%', 
                      width: 36, 
                      height: 36, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    {cat.icon}
                  </Box>
                </Box>

                <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1.2 }}>
                    {cat.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {cat.count} Products Available
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* SECTION 4: FEATURED PRODUCTS GRID WITH DIRECT CART INTERACTION */}
      <Box sx={{ mb: 2 }}>
        {/* Section Title */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: -0.5 }}>
              Featured Products & Components
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
              Top industrial supplies and electronics in stock. Tier-based pricing applies at checkout.
            </Typography>
          </Box>
          <Button 
            component={RouterLink} 
            to="/products"
            endIcon={<ArrowForwardIcon />} 
            sx={{ fontWeight: 700, color: 'primary.main', textTransform: 'none' }}
          >
            Browse All Products
          </Button>
        </Box>

        {/* Product Cards Grid */}
        <Grid container spacing={3}>
          {MOCK_PRODUCTS.slice(0, 4).map((product) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={product.id}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%', 
                  border: '1px solid', 
                  borderColor: 'divider',
                  borderRadius: 2.5,
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 8px 25px rgba(36, 58, 94, 0.08)',
                    '& img': { transform: 'scale(1.06)' }
                  }
                }}
                onClick={() => router.push(`/product/${product.id}`)}
              >
                {/* Product Badge */}
                {product.stock === 0 && (
                  <Chip 
                    label="OUT OF STOCK" 
                    color="error" 
                    size="small" 
                    sx={{ 
                      position: 'absolute', 
                      top: 12, 
                      left: 12, 
                      zIndex: 3, 
                      fontWeight: 800, 
                      borderRadius: 1,
                      fontSize: '0.65rem'
                    }} 
                  />
                )}
                {product.stock > 0 && product.stock <= 30 && (
                  <Chip 
                    label="LOW STOCK" 
                    color="warning" 
                    size="small" 
                    sx={{ 
                      position: 'absolute', 
                      top: 12, 
                      left: 12, 
                      zIndex: 3, 
                      fontWeight: 800, 
                      borderRadius: 1,
                      fontSize: '0.65rem'
                    }} 
                  />
                )}

                {/* Product Image */}
                <Box sx={{ height: 180, overflow: 'hidden', bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <CardMedia
                    component="img"
                    image={product.image}
                    alt={product.name}
                    sx={{ 
                      maxHeight: '100%', 
                      maxWidth: '100%', 
                      objectFit: 'contain',
                      transition: 'transform 0.4s ease',
                      p: 2
                    }}
                  />
                </Box>

                {/* Card Details */}
                <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 1 }}>
                  {/* Category Chip */}
                  <Typography variant="caption" sx={{ color: 'secondary.dark', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {product.category}
                  </Typography>
                  
                  {/* Product Title */}
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', height: 40, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.3 }}>
                    {product.name}
                  </Typography>

                  {/* Rating */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Rating value={4.5} readOnly size="small" precision={0.5} emptyIcon={<StarIcon sx={{ opacity: 0.2 }} fontSize="inherit" />} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>(24)</Typography>
                  </Box>

                  {/* Specifications (Brief bullet points) */}
                  <Box sx={{ minHeight: 48, display: 'flex', flexDirection: 'column', gap: 0.3, mt: 0.5 }}>
                    {product.specs?.slice(0, 2).map((spec, i) => (
                      <Typography variant="caption" color="text.secondary" key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 500 }}>
                        <span style={{ fontSize: '10px', color: theme.palette.primary.light }}>●</span> {spec}
                      </Typography>
                    ))}
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />

                  {/* Price & Action Row */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>
                        B2B Price
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main', lineHeight: 1 }}>
                        ₹{product.price.toLocaleString()}
                      </Typography>
                    </Box>

                    {/* Add to Cart Button */}
                    <Button
                      variant="contained"
                      disabled={product.stock === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        addToCart(product, 1);
                      }}
                      sx={{ 
                        minWidth: 40,
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        p: 0,
                        bgcolor: 'primary.main',
                        '&:hover': { bgcolor: 'primary.dark' }
                      }}
                    >
                      <AddShoppingCartIcon fontSize="small" />
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

    </Box>
  );
};

export default Home;
