import React, { useState, useEffect, useRef } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, IconButton, Box, Drawer, 
  List, ListItem, ListItemText, useMediaQuery, useTheme, Badge, 
  InputBase, Paper, Menu, MenuItem, Divider, Tooltip, Grid, ListItemButton,
  Select, CircularProgress, ClickAwayListener, Chip
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Search as SearchIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  AccountCircle as AccountCircleIcon,
  ShoppingCart as ShoppingCartIcon,
  FavoriteBorder as FavoriteIcon,
  Description as QuoteIcon,
  ExitToApp as ExitToAppIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon,
  Close as CloseIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  LocalShipping as ShippingIcon,
  Info as InfoIcon,
  ContactSupport as ContactIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useCart } from '../../context/CartContext';
import CartDrawer from '../cart/CartDrawer';
import { categoryPublicService, productService, searchService } from '../../services/apiServices';
import { ROLES } from '../../constants/roles';
import { formatPrice as formatScaledPrice } from '../../utils/priceUtils';
import BrandLogo from './BrandLogo';

const Header = () => {
  const { cartItemCount, toggleCartDrawer } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  
  // Autocomplete Search State
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimeout = useRef(null);
  
  // Mega Menu State
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [megaMenuData, setMegaMenuData] = useState([]);
  const [selectedCatIndex, setSelectedCatIndex] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { currency, setCurrency, supportedCurrencies, showCurrencySelector } = useCurrency();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryPublicService.listCategories();
        const data = response?.data?.content || response?.data || response?.categories || response || [];
        const formatted = (Array.isArray(data) ? data : []).filter(c => c && (c.name || c.title)).map(cat => ({
          id: cat.id || cat._id,
          name: cat.name || cat.title,
          slug: cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-'),
          subcategories: (cat.segments || cat.subcategories || []).map(seg => ({
            name: seg.name || seg.title || seg,
            items: (seg.attributes || seg.items || []).map(attr => attr.attrKey || attr.name || attr)
          }))
        }));
        setMegaMenuData(formatted);
      } catch (err) {
        console.error("Failed to fetch categories for navigation:", err);
        setMegaMenuData([]);
      }
    };
    fetchCategories();
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchVal(val);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    
    if (val.trim().length >= 2) {
      setSearching(true);
      setShowSuggestions(true);
      debounceTimeout.current = setTimeout(async () => {
        try {
          let items = [];
          try {
            const searchRes = await searchService.search({ q: val.trim(), currency: currency || 'INR', size: 6 });
            items = searchRes?.content || searchRes?.data?.content || searchRes?.data || [];
          } catch (meiliErr) {
            const res = await productService.getAllProducts({ search: val.trim(), limit: 6, currency: currency || 'INR' });
            items = res?.data?.content || res?.data?.products || res?.data || [];
          }
          setSuggestions(Array.isArray(items) ? items : []);
        } catch (err) {
          setSuggestions([]);
        } finally {
          setSearching(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setSearching(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchVal.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchVal.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const handleSuggestionClick = (productId) => {
    setShowSuggestions(false);
    setSearchVal('');
    navigate(`/product/${productId}`);
  };

  const handleUserMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleUserMenuClose = () => setAnchorEl(null);
  const handleLogoutClick = () => {
    handleUserMenuClose();
    logout();
    navigate('/');
  };

  const isAdmin = user && (Object.values(ROLES).includes(user.role) || ['ADMIN', 'MANAGER', 'STAFF'].includes(user.role));

  return (
    <Box 
      sx={{ 
        flexGrow: 1, 
        position: 'sticky', 
        top: 0, 
        zIndex: 1100, 
        boxShadow: scrolled ? '0 10px 30px rgba(15, 23, 42, 0.12)' : '0 4px 20px rgba(0,0,0,0.06)',
        transition: 'all 0.3s ease'
      }}
    >
      {/* 1. Top Enterprise Announcement & Utility Bar */}
      <Box sx={{ backgroundColor: '#111B2C', color: '#ffffff', px: { xs: 2, lg: 6 }, py: 0.6, fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1440, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip label="ISO 9001:2015" size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: 'secondary.main', color: 'primary.dark', fontWeight: 800 }} />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500, display: { xs: 'none', sm: 'inline' } }}>
              ⚡ Free Express Delivery on Bulk Orders over ₹15,000 | 100% Genuine Traceable Components
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            {showCurrencySelector && supportedCurrencies.length > 1 && (
              <Select
                value={currency || 'INR'}
                onChange={(e) => setCurrency(e.target.value)}
                size="small"
                variant="standard"
                sx={{
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  '& .MuiSelect-icon': { color: 'white' },
                  '&:before': { display: 'none' },
                  '&:after': { display: 'none' },
                }}
              >
                {supportedCurrencies.map((code) => (
                  <MenuItem key={code} value={code}>{code}</MenuItem>
                ))}
              </Select>
            )}
            <RouterLink to="/about" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontWeight: 600 }}>
              About Us
            </RouterLink>
            <RouterLink to="/contact" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontWeight: 600 }}>
              Contact
            </RouterLink>
            {user && (
              <RouterLink to="/user/orders" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontWeight: 600 }}>
                Order Tracking
              </RouterLink>
            )}
          </Box>
        </Box>
      </Box>

      {/* 2. Main E-Commerce Header Navigation */}
      <AppBar position="static" sx={{ backgroundColor: '#ffffff', color: 'text.primary', boxShadow: 'none', borderBottom: '1px solid #E2ECF5', px: { xs: 1.5, sm: 3, md: 6 }, py: 1 }}>
        <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between', gap: { xs: 1.5, md: 3 }, maxWidth: 1440, mx: 'auto', width: '100%' }}>
          
          {/* Logo & Mobile Menu Toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isMobile && (
              <IconButton onClick={() => setDrawerOpen(true)} color="primary" aria-label="open mobile navigation drawer">
                <MenuIcon />
              </IconButton>
            )}
            <BrandLogo />
          </Box>

          {/* Search Bar with Live Autocomplete */}
          <Box sx={{ flexGrow: 1, maxWidth: 620, position: 'relative', mx: { xs: 1, md: 2 } }}>
            <ClickAwayListener onClickAway={() => setShowSuggestions(false)}>
              <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', width: '100%', position: 'relative' }}>
                <Paper
                  elevation={0}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    border: '2px solid #243A5E',
                    borderRadius: 2,
                    overflow: 'hidden',
                    bgcolor: '#ffffff',
                    height: 44,
                    boxShadow: '0 2px 8px rgba(36, 58, 94, 0.06)'
                  }}
                >
                  <InputBase
                    sx={{ ml: 2, flex: 1, fontSize: '0.875rem', color: 'text.primary', fontWeight: 500 }}
                    placeholder="Search by product name, part number, manufacturer..."
                    value={searchVal}
                    onChange={handleSearchChange}
                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                    slotProps={{ input: { 'aria-label': 'Search products' } }}
                  />
                  {searchVal && (
                    <IconButton size="small" onClick={() => { setSearchVal(''); setSuggestions([]); }} sx={{ mr: 0.5 }}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disableElevation
                    sx={{ height: '100%', borderRadius: 0, px: { xs: 2, sm: 3 }, fontWeight: 800, display: 'flex', gap: 1 }}
                  >
                    <SearchIcon fontSize="small" />
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>SEARCH</Box>
                  </Button>
                </Paper>

                {/* Autocomplete Dropdown */}
                {showSuggestions && (
                  <Paper
                    elevation={6}
                    sx={{
                      position: 'absolute',
                      top: 48,
                      left: 0,
                      right: 0,
                      zIndex: 1500,
                      borderRadius: 2,
                      border: '1px solid #D6E4EE',
                      maxHeight: 400,
                      overflowY: 'auto',
                      bgcolor: '#ffffff',
                    }}
                  >
                    {searching ? (
                      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CircularProgress size={20} color="primary" />
                        <Typography variant="body2" color="text.secondary">Searching catalog...</Typography>
                      </Box>
                    ) : suggestions.length > 0 ? (
                      <List disablePadding>
                        <Box sx={{ px: 2, py: 1, bgcolor: '#EDF4FA', borderBottom: '1px solid #D6E4EE' }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'primary.main' }}>
                            Matching Products ({suggestions.length})
                          </Typography>
                        </Box>
                        {suggestions.map((item) => (
                          <ListItemButton
                            key={item.id || item._id}
                            onClick={() => handleSuggestionClick(item.id || item._id)}
                            sx={{ borderBottom: '1px solid #f0f4f8', py: 1.2, '&:hover': { bgcolor: '#EDF4FA' } }}
                          >
                            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                  {item.partNumber || item.mpn || item.name}
                                </Typography>
                                {item.fromPriceScaled != null && (
                                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                                    {formatScaledPrice(item.fromPriceScaled, item.priceScale ?? 4, item.currency || currency || 'INR')}
                                  </Typography>
                                )}
                              </Box>
                              <Typography variant="caption" color="text.secondary" noWrap sx={{ mt: 0.3 }}>
                                {item.brand || item.manufacturer || 'Part'} • In Stock: {item.totalStock !== undefined ? item.totalStock : (item.stock || 0)} units
                              </Typography>
                            </Box>
                          </ListItemButton>
                        ))}
                      </List>
                    ) : searchVal.trim().length >= 2 && (
                      <Box sx={{ p: 2.5, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          No direct matches found for "<strong>{searchVal}</strong>".
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                )}
              </Box>
            </ClickAwayListener>
          </Box>

          {/* Action Hub: Quotations, Wishlist, Cart & Account */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1.5 } }}>
            <Tooltip title="Saved Favorites">
              <IconButton component={RouterLink} to={user ? "/user/favorites" : "/login"} sx={{ color: 'primary.main' }} aria-label="view favorites">
                <FavoriteIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Shopping Cart">
              <IconButton onClick={toggleCartDrawer} sx={{ color: 'primary.main' }} aria-label={`open shopping cart with ${cartItemCount || 0} items`}>
                <Badge badgeContent={cartItemCount || 0} color="secondary">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ my: 1, mx: 0.5, display: { xs: 'none', md: 'block' } }} />

            {/* Account Dropdown */}
            {user ? (
              <>
                <Button
                  onClick={handleUserMenuClick}
                  endIcon={<KeyboardArrowDownIcon />}
                  sx={{ color: 'primary.main', fontWeight: 700, px: 1.5, border: '1px solid #D6E4EE', borderRadius: 1.5 }}
                >
                  <AccountCircleIcon sx={{ mr: 0.8 }} />
                  <Box component="span" sx={{ display: { xs: 'none', lg: 'inline' }, maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name || user.username || 'My Account'}
                  </Box>
                </Button>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleUserMenuClose} slotProps={{ paper: { sx: { width: 220, mt: 1, borderRadius: 2 } } }}>
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="caption" color="text.secondary">SIGNED IN AS</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main', wordBreak: 'break-word' }}>
                      {user.email}
                    </Typography>
                  </Box>
                  <Divider />
                  {isAdmin && (
                    <MenuItem component={RouterLink} to="/admin/dashboard" onClick={handleUserMenuClose} sx={{ fontWeight: 700, color: 'primary.main' }}>
                      <DashboardIcon sx={{ mr: 1.5, fontSize: 20 }} /> Admin Panel
                    </MenuItem>
                  )}
                  <MenuItem component={RouterLink} to="/user/dashboard" onClick={handleUserMenuClose}>
                    <PersonIcon sx={{ mr: 1.5, fontSize: 20 }} /> My Account Dashboard
                  </MenuItem>
                  <MenuItem component={RouterLink} to="/user/orders" onClick={handleUserMenuClose}>
                    <InventoryIcon sx={{ mr: 1.5, fontSize: 20 }} /> Order History
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogoutClick} sx={{ color: 'error.main', fontWeight: 600 }}>
                    <ExitToAppIcon sx={{ mr: 1.5, fontSize: 20 }} /> Sign Out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                color="primary"
                size="small"
                sx={{ fontWeight: 800, borderRadius: 1.5, px: 2.5, py: 0.8 }}
              >
                Sign In
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* 3. Modern Category & Navigation Bar */}
      <Box sx={{ backgroundColor: 'primary.main', color: 'white', display: { xs: 'none', md: 'block' } }}>
        <Box sx={{ maxWidth: 1440, mx: 'auto', px: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 }}>
          
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            <RouterLink to="/" style={{ color: location.pathname === '/' ? '#8FB6D8' : 'white', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 700 }}>
              Home
            </RouterLink>
            <RouterLink to="/products" style={{ color: location.pathname === '/products' ? '#8FB6D8' : 'white', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 700 }}>
              All Products
            </RouterLink>
            {/* <RouterLink to="/products?filter=in-stock" style={{ color: 'white', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
              🟢 Ready to Ship
            </RouterLink> */}
            <RouterLink to="/about" style={{ color: location.pathname === '/about' ? '#8FB6D8' : 'white', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
              About Us
            </RouterLink>
            <RouterLink to="/contact" style={{ color: location.pathname === '/contact' ? '#8FB6D8' : 'white', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
              Contact Us
            </RouterLink>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <RouterLink to={user ? "/user/quotations" : "/login"} style={{ color: 'secondary.main', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 800 }}>
              📋 Request B2B Bulk Quote
            </RouterLink>
          </Box>
        </Box>
      </Box>

      {/* 4. Mobile Drawer Navigation */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} slotProps={{
        paper: { sx: { width: 300, bgcolor: '#ffffff' } }
      }}>
        <Box sx={{ p: 2.5, bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <BrandLogo light variant="small" />
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List sx={{ pt: 1 }}>
          <ListItemButton component={RouterLink} to="/" onClick={() => setDrawerOpen(false)}>
            <ListItemText primary="Home" slotProps={{ primary: { fontWeight: 700 } }} />
          </ListItemButton>
          <ListItemButton component={RouterLink} to="/products" onClick={() => setDrawerOpen(false)}>
            <ListItemText primary="Shop Products" slotProps={{ primary: { fontWeight: 700 } }} />
          </ListItemButton>
          <ListItemButton component={RouterLink} to="/about" onClick={() => setDrawerOpen(false)}>
            <ListItemText primary="About Us" slotProps={{ primary: { fontWeight: 700 } }} />
          </ListItemButton>
          <ListItemButton component={RouterLink} to="/contact" onClick={() => setDrawerOpen(false)}>
            <ListItemText primary="Contact Us" slotProps={{ primary: { fontWeight: 700 } }} />
          </ListItemButton>
          <ListItemButton component={RouterLink} to={user ? "/user/quotations" : "/login"} onClick={() => setDrawerOpen(false)}>
            <ListItemText primary="Request B2B Quote" slotProps={{ primary: { fontWeight: 700, color: 'primary.main' } }} />
          </ListItemButton>
        </List>
      </Drawer>

      <CartDrawer />
    </Box>
  );
};

export default Header;
