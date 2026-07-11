import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, IconButton, Box, Drawer, 
  List, ListItem, ListItemText, useMediaQuery, useTheme, Badge, 
  InputBase, Paper, Menu, MenuItem, Divider, Tooltip, Grid, ListItemButton,
  Select
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  ShoppingCart as ShoppingCartIcon,
  Search as SearchIcon,
  FileUpload as FileUploadIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  AccountCircle as AccountCircleIcon,
  LocalShipping as LocalShippingIcon,
  Campaign as CampaignIcon,
  ExitToApp as ExitToAppIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  ListAlt as ListAltIcon,
  ArrowForwardIos as ArrowForwardIosIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import CartDrawer from './cart/CartDrawer';

// Hierarchical Category Data for Mega Menu (DigiKey Style)
const MEGA_MENU_DATA = [
  {
    name: "Semiconductors",
    active: true,
    subcategories: [
      {
        name: "Isolators",
        items: ["Digital Isolators", "Isolators - Gate Drivers", "Optoisolators - Logic Output", "Optoisolators - Transistor", "Optoisolators - Triac Output", "Special Purpose"]
      },
      {
        name: "Integrated Circuits (ICs)",
        items: ["Embedded Microcontrollers", "Linear Amplifiers", "Memory Chips", "Power Management PMIC"]
      },
      {
        name: "Discrete Semiconductors",
        items: ["Diodes - Rectifiers", "Transistors - FETs, MOSFETs", "Thyristors - SCRs", "Transistors - Bipolar BJT"]
      }
    ]
  },
  {
    name: "Industrial Tools",
    active: true,
    subcategories: [
      {
        name: "Power Tools",
        items: ["Drill Machines", "Angle Grinders", "Demolition Hammers", "Heat Guns"]
      },
      {
        name: "Hand Tools",
        items: ["Wrenches & Sockets", "Screwdrivers", "Pliers & Cutters", "Tool Sets"]
      },
      {
        name: "Abrasives",
        items: ["Grinding Wheels", "Sanding Discs", "Cut-off Wheels"]
      }
    ]
  },
  {
    name: "Safety Gear",
    active: true,
    subcategories: [
      {
        name: "Head Protection",
        items: ["Professional Hard Hats", "Safety Helmets", "Bump Caps"]
      },
      {
        name: "Protective Wear",
        items: ["Safety Vests", "Steel Toe Work Boots", "Safety Glasses", "Ear Muffs"]
      },
      {
        name: "Hand Protection",
        items: ["Cut Resistant Gloves", "Chemical Resistant Gloves", "Leather Work Gloves"]
      }
    ]
  },
  {
    name: "Electrical Supplies",
    active: true,
    subcategories: [
      {
        name: "LED & Lighting",
        items: ["Industrial LED Floodlights", "Warehouse High Bay Lights", "LED Strips & Drivers"]
      },
      {
        name: "Switches & Relays",
        items: ["Rocker Switches", "Solid State Relays", "Limit Switches", "Push Buttons"]
      },
      {
        name: "Circuit Protection",
        items: ["Fuses & Fuse Holders", "Circuit Breakers", "Surge Protectors"]
      }
    ]
  },
  {
    name: "Cables & Wires",
    active: false,
    subcategories: [
      {
        name: "Multi-Conductor Cables",
        items: ["Shielded Cables", "Coaxial Cables", "Fiber Optic Cables"]
      }
    ]
  },
  {
    name: "Connectors & Terminals",
    active: false,
    subcategories: [
      {
        name: "Circular Connectors",
        items: ["Circular Shells", "Circular Contacts", "Circular Cable Assemblies"]
      }
    ]
  }
];

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Mega Menu State
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(MEGA_MENU_DATA[0]);
  const [hoveredSubCategory, setHoveredSubCategory] = useState(MEGA_MENU_DATA[0].subcategories[0]);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const { cartItemCount, toggleCartDrawer } = useCart();
  const { user, logout } = useAuth();
  const { currency, setCurrency } = useCurrency();

  const handleUserMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleUserMenuClose();
    logout();
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchVal.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' },
    { label: 'Request a Quote', path: user ? '/user/quotations' : '/login' },
    { label: 'BOM Upload', path: user ? '/user/quotations' : '/login' },
  ];

  // Mobile Side Drawer
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', width: 280, pt: 2 }}>
      <Typography variant="h6" sx={{ my: 2, color: 'primary.main', fontWeight: 'bold', fontFamily: '"Outfit", sans-serif' }}>
        KDS ARCHANA
      </Typography>
      <Divider />
      
      {/* Mobile Search */}
      <Box sx={{ p: 2 }}>
        <form onSubmit={handleSearchSubmit}>
          <Paper
            elevation={0}
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'background.default'
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1, fontSize: '0.875rem' }}
              placeholder="Search part or keyword..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
            <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
              <SearchIcon color="primary" />
            </IconButton>
          </Paper>
        </form>
      </Box>
      
      <Divider />
      
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <Button
              component={RouterLink}
              to={item.path}
              sx={{ textAlign: 'left', justifyContent: 'flex-start', width: '100%', color: 'primary.main', px: 3, py: 1.5 }}
            >
              <ListItemText primary={item.label} />
            </Button>
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      {/* Mobile Currency Selector */}
      <Box sx={{ p: 2, px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
          Currency
        </Typography>
        <Select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          size="small"
          sx={{ minWidth: 100, borderRadius: 1.5, fontSize: '0.85rem' }}
        >
          <MenuItem value="USD">USD ($)</MenuItem>
          <MenuItem value="INR">INR (₹)</MenuItem>
          <MenuItem value="EUR">EUR (€)</MenuItem>
          <MenuItem value="GBP">GBP (£)</MenuItem>
        </Select>
      </Box>
      
      <Divider />
      
      {/* Mobile Auth actions */}
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {user ? (
          <>
            <Typography variant="subtitle2" color="text.secondary">
              Logged in as: <strong>{user?.name || user?.fullName || 'User'}</strong>
            </Typography>
            <Button 
              variant="outlined" 
              component={RouterLink} 
              to={String(user?.role || '').toUpperCase().includes('ADMIN') || String(user?.role || '').toUpperCase().includes('MANAGER') ? '/admin/dashboard' : '/user/dashboard'}
              fullWidth
            >
              My Dashboard
            </Button>
            <Button variant="contained" color="error" onClick={logout} fullWidth>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button variant="outlined" component={RouterLink} to="/login" fullWidth>
              Sign In
            </Button>
            <Button variant="contained" component={RouterLink} to="/register" fullWidth>
              Register
            </Button>
          </>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      {/* Announcement Strip */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText', 
          py: 1, 
          px: 2, 
          fontSize: '0.8rem', 
          fontWeight: 500, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 1,
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <CampaignIcon fontSize="small" sx={{ color: 'secondary.main' }} />
        <span><strong>ATTENTION:</strong> Due to high order volume, B2B wholesale orders may require up to 2 additional business days to process.</span>
      </Box>

      {/* Main AppBar */}
      <AppBar 
        position="sticky" 
        elevation={0} 
        sx={{ 
          backgroundColor: 'background.paper', 
          borderBottom: '1px solid', 
          borderColor: 'divider',
          zIndex: (theme) => theme.zIndex.appBar,
          position: 'sticky',
          top: 0
        }}
      >
        {/* Top Header Row */}
        <Toolbar sx={{ justifyContent: 'space-between', gap: { xs: 1, md: 3 }, py: { xs: 1, md: 1.5 } }}>
          
          {/* Logo */}
          <Typography
            variant="h5"
            component={RouterLink}
            to="/"
            sx={{
              fontWeight: 900,
              color: 'primary.main',
              textDecoration: 'none',
              letterSpacing: '-0.5px',
              fontFamily: '"Outfit", "Inter", sans-serif',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0
            }}
          >
            KDS
            <Box component="span" sx={{ color: 'secondary.main', fontWeight: 500, ml: 0.5 }}>
              ARCHANA
            </Box>
          </Typography>

          {/* Search bar - Desktop */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, maxWidth: 680, mx: 2 }}>
              <form onSubmit={handleSearchSubmit}>
                <Paper
                  elevation={0}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '2px solid',
                    borderColor: 'primary.main',
                    borderRadius: 1,
                    overflow: 'hidden',
                    height: 42,
                    bgcolor: '#fcfcfc'
                  }}
                >
                  <InputBase
                    sx={{ ml: 2, flex: 1, fontSize: '0.9rem', color: 'primary.main' }}
                    placeholder="Enter keyword, manufacturer, or part #"
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                  />
                  
                  {/* Upload List Shortcut inside search bar */}
                  <Tooltip title="Upload Bill of Materials (BOM) List">
                    <Button
                      component={RouterLink}
                      to={user ? '/user/quotations' : '/login'}
                      size="small"
                      startIcon={<FileUploadIcon />}
                      sx={{ 
                        color: 'primary.light', 
                        fontSize: '0.75rem', 
                        textTransform: 'none', 
                        fontWeight: 600,
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 0,
                        px: 2,
                        height: '100%',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }
                      }}
                    >
                      Upload a List
                    </Button>
                  </Tooltip>
                  
                  <IconButton 
                    type="submit" 
                    sx={{ 
                      p: 1.2, 
                      bgcolor: 'primary.main', 
                      color: '#fff',
                      borderRadius: 0,
                      width: 48,
                      height: '100%',
                      '&:hover': { bgcolor: 'primary.dark' }
                    }} 
                    aria-label="search"
                  >
                    <SearchIcon />
                  </IconButton>
                </Paper>
              </form>
            </Box>
          )}

          {/* User actions & Cart (Right Side) */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 2 } }}>
            {/* Country Flag & Currency (India / USD / INR etc.) */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, borderRight: '1px solid', borderColor: 'divider', pr: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <span style={{ fontSize: '1.4rem' }}>🇮🇳</span>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    IN / EN
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ height: 16, my: 'auto' }} />
                <Select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  size="small"
                  variant="standard"
                  disableUnderline
                  sx={{ 
                    fontSize: '0.8rem', 
                    fontWeight: 700, 
                    color: 'primary.main',
                    cursor: 'pointer',
                    '& .MuiSelect-select': { py: 0.5, pr: '16px !important' },
                    '& .MuiSvgIcon-root': { fontSize: '1.2rem', color: 'primary.main' }
                  }}
                >
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="INR">INR (₹)</MenuItem>
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                  <MenuItem value="GBP">GBP (£)</MenuItem>
                </Select>
              </Box>
            )}

            {/* Auth Dropdown */}
            {!isMobile ? (
              <Box sx={{ borderRight: '1px solid', borderColor: 'divider', pr: 2 }}>
                {user ? (
                  <>
                    <Button
                      onClick={handleUserMenuClick}
                      endIcon={<KeyboardArrowDownIcon />}
                      startIcon={<AccountCircleIcon />}
                      sx={{ 
                        color: 'primary.main', 
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.875rem'
                      }}
                    >
                      Hello, {(user?.name || user?.fullName || 'User').split(' ')[0]}
                    </Button>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleUserMenuClose}
                      elevation={3}
                      sx={{ mt: 1 }}
                    >
                      <MenuItem 
                        component={RouterLink} 
                        to={String(user?.role || '').toUpperCase().includes('ADMIN') || String(user?.role || '').toUpperCase().includes('MANAGER') ? '/admin/dashboard' : '/user/dashboard'}
                        onClick={handleUserMenuClose}
                        sx={{ gap: 1.5, minWidth: 160 }}
                      >
                        <DashboardIcon fontSize="small" color="primary" />
                        <Typography variant="body2">My Dashboard</Typography>
                      </MenuItem>
                      <MenuItem 
                        component={RouterLink} 
                        to="/user/orders"
                        onClick={handleUserMenuClose}
                        sx={{ gap: 1.5 }}
                      >
                        <ListAltIcon fontSize="small" color="primary" />
                        <Typography variant="body2">My Orders</Typography>
                      </MenuItem>
                      <MenuItem 
                        component={RouterLink} 
                        to="/user/profile"
                        onClick={handleUserMenuClose}
                        sx={{ gap: 1.5 }}
                      >
                        <PersonIcon fontSize="small" color="primary" />
                        <Typography variant="body2">My Profile</Typography>
                      </MenuItem>
                      <Divider />
                      <MenuItem onClick={handleLogoutClick} sx={{ gap: 1.5, color: 'error.main' }}>
                        <ExitToAppIcon fontSize="small" />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Logout</Typography>
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      Hello, Sign In
                    </Typography>
                    <Button
                      component={RouterLink}
                      to="/login"
                      endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
                      sx={{ 
                        color: 'primary.main', 
                        p: 0, 
                        minWidth: 0,
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                      }}
                    >
                      Login or REGISTER
                    </Button>
                  </Box>
                )}
              </Box>
            ) : null}

            {/* Cart Badge with Count & Subtext */}
            <Button
              onClick={toggleCartDrawer}
              startIcon={
                <Badge badgeContent={cartItemCount} color="error">
                  <ShoppingCartIcon />
                </Badge>
              }
              sx={{ 
                color: 'primary.main', 
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.875rem',
                ml: { xs: 0.5, md: 0 }
              }}
            >
              {!isMobile && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', ml: 0.5 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 500, lineHeight: 1 }}>
                    Shopping
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1, mt: 0.2 }}>
                    {cartItemCount} item(s)
                  </Typography>
                </Box>
              )}
            </Button>

            {/* Mobile Menu Icon */}
            {isMobile && (
              <IconButton color="primary" onClick={handleDrawerToggle}>
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>

        {/* Lower Row Navigation Menu - Desktop Only */}
        {!isMobile && (
          <Box 
            sx={{ 
              bgcolor: 'background.default', 
              borderTop: '1px solid', 
              borderBottom: '1px solid', 
              borderColor: 'divider',
              px: 3, 
              py: 0.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            {/* Links */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {navItems.map((item) => {
                if (item.label === 'Products') {
                  return (
                    <Box
                      key={item.label}
                      onMouseEnter={() => setIsMegaMenuOpen(true)}
                      onMouseLeave={() => setIsMegaMenuOpen(false)}
                      sx={{ display: 'inline-block' }}
                    >
                      <Button
                        component={RouterLink}
                        to={item.path}
                        endIcon={<KeyboardArrowDownIcon sx={{ 
                          transform: isMegaMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease',
                          fontSize: 16
                        }} />}
                        sx={{ 
                          color: 'text.primary', 
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          px: 2,
                          bgcolor: isMegaMenuOpen ? 'rgba(36, 58, 94, 0.05)' : 'transparent',
                          '&:hover': { color: 'primary.main', bgcolor: 'rgba(36, 58, 94, 0.05)' }
                        }}
                      >
                        {item.label}
                      </Button>
                    </Box>
                  );
                }
                return (
                  <Button
                    key={item.label}
                    component={RouterLink}
                    to={item.path}
                    sx={{ 
                      color: 'text.primary', 
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      px: 2,
                      '&:hover': { color: 'primary.main', bgcolor: 'rgba(36, 58, 94, 0.04)' }
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>
            
            {/* Promo Info */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                border: '1px dashed', 
                borderColor: 'secondary.main', 
                borderRadius: 1, 
                px: 2, 
                py: 0.5,
                bgcolor: 'background.paper'
              }}
            >
              <LocalShippingIcon fontSize="small" color="primary" />
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                FREE DELIVERY on Wholesale Orders over ₹10,000!*
              </Typography>
            </Box>
          </Box>
        )}

        {/* ========================================================================= */}
        {/* Products Mega Menu Dropdown Panel (DigiKey Style) */}
        {/* ========================================================================= */}
        {!isMobile && isMegaMenuOpen && (
          <Paper
            elevation={12}
            onMouseEnter={() => setIsMegaMenuOpen(true)}
            onMouseLeave={() => setIsMegaMenuOpen(false)}
            sx={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '95vw',
              maxWidth: 1200,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '0 0 8px 8px',
              display: 'flex',
              height: 460,
              overflow: 'hidden',
              zIndex: 9999,
              '@keyframes fadeInMegaMenu': {
                from: { opacity: 0, transform: 'translate(-50%, -8px)' },
                to: { opacity: 1, transform: 'translate(-50%, 0)' }
              },
              animation: 'fadeInMegaMenu 0.15s ease-out',
            }}
          >
            {/* Column 1: Main Categories */}
            <Box 
              sx={{ 
                width: 240, 
                borderRight: '1px solid', 
                borderColor: 'divider',
                overflowY: 'auto',
                bgcolor: '#fafafa',
                py: 1
              }}
            >
              {MEGA_MENU_DATA.map((cat) => {
                const isHovered = hoveredCategory.name === cat.name;
                return (
                  <ListItemButton
                    key={cat.name}
                    onMouseEnter={() => {
                      setHoveredCategory(cat);
                      setHoveredSubCategory(cat.subcategories[0]);
                    }}
                    sx={{
                      py: 1.2,
                      px: 2.5,
                      bgcolor: isHovered ? 'primary.main' : 'transparent',
                      color: isHovered ? 'white' : 'text.primary',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      '&:hover': {
                        bgcolor: isHovered ? 'primary.main' : 'rgba(36, 58, 94, 0.04)',
                        color: isHovered ? 'white' : 'primary.main',
                      }
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 700 }}>
                      {cat.name}
                    </Typography>
                    <ArrowForwardIosIcon sx={{ fontSize: 9, opacity: 0.7 }} />
                  </ListItemButton>
                );
              })}
            </Box>

            {/* Column 2: Subcategories */}
            <Box 
              sx={{ 
                width: 250, 
                borderRight: '1px solid', 
                borderColor: 'divider',
                overflowY: 'auto',
                py: 1
              }}
            >
              {hoveredCategory.subcategories.map((sub) => {
                const isHovered = hoveredSubCategory.name === sub.name;
                return (
                  <ListItemButton
                    key={sub.name}
                    onMouseEnter={() => setHoveredSubCategory(sub)}
                    sx={{
                      py: 1.2,
                      px: 2.5,
                      bgcolor: isHovered ? 'secondary.light' : 'transparent',
                      color: isHovered ? 'primary.main' : 'text.primary',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      '&:hover': {
                        bgcolor: 'secondary.light',
                        color: 'primary.main'
                      }
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 700 }}>
                      {sub.name}
                    </Typography>
                    <ArrowForwardIosIcon sx={{ fontSize: 9, opacity: 0.7 }} />
                  </ListItemButton>
                );
              })}
            </Box>

            {/* Column 3: Sub-subcategories */}
            <Box 
              sx={{ 
                flexGrow: 1, 
                overflowY: 'auto', 
                p: 3.5,
                bgcolor: '#ffffff'
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 850, color: 'primary.main', mb: 2.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {hoveredSubCategory.name}
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {hoveredSubCategory.items.map((item) => (
                  <Typography
                    key={item}
                    onClick={() => {
                      setIsMegaMenuOpen(false);
                      // Construct direct query redirect
                      let queryStr = "";
                      const itemWord = item.split(' ')[0]; // Take first word for search simplicity
                      if (hoveredCategory.name.includes("Tool")) {
                        queryStr = `?category=Industrial%20Tools&search=${encodeURIComponent(itemWord)}`;
                      } else if (hoveredCategory.name.includes("Safety")) {
                        queryStr = `?category=Safety%20Gear&search=${encodeURIComponent(itemWord)}`;
                      } else if (hoveredCategory.name.includes("Electrical")) {
                        queryStr = `?category=Electrical%20Supplies&search=${encodeURIComponent(itemWord)}`;
                      } else {
                        queryStr = `?search=${encodeURIComponent(itemWord)}`;
                      }
                      navigate(`/products${queryStr}`);
                    }}
                    sx={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'text.secondary',
                      cursor: 'pointer',
                      width: 'fit-content',
                      '&:hover': {
                        color: 'secondary.dark',
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Box>
            </Box>

          </Paper>
        )}
      </AppBar>

      {/* Mobile Drawer Menu */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
      >
        {drawer}
      </Drawer>
      <CartDrawer />
    </>
  );
};

export default Navbar;
