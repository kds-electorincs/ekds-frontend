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
  Factory as FactoryIcon,
  Close as CloseIcon,
  ArrowForwardIos as ArrowForwardIosIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import CartDrawer from './cart/CartDrawer';
import { categoryPublicService, productService, searchService } from '../services/apiServices';
import { ROLES } from '../constants/roles';
import { formatPrice as formatScaledPrice } from '../utils/priceUtils';

const Navbar = () => {
  const { cartItemCount, toggleCartDrawer } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  
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
  const { user, logout } = useAuth();
  const { currency, setCurrency, supportedCurrencies, showCurrencySelector } = useCurrency();

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
        console.error("Failed to fetch live categories for navigation:", err);
        setMegaMenuData([]);
      }
    };
    fetchCategories();
  }, []);

  // Live Autocomplete Handler via Backend API (No Mock Data)
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
            console.warn("Meilisearch endpoint offline, fallback to store products:", meiliErr?.message);
            const res = await productService.getAllProducts({ search: val.trim(), limit: 6, currency: currency || 'INR' });
            items = res?.data?.content || res?.data?.products || res?.data || [];
          }
          setSuggestions(Array.isArray(items) ? items : []);
        } catch (err) {
          console.error("Autocomplete query failed:", err);
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
    <Box sx={{ flexGrow: 1, position: 'sticky', top: 0, zIndex: 1100, boxShadow: '0 2px 8px rgba(22, 36, 60, 0.12)' }}>
      {/* 1. Top Industrial Enterprise Utility Bar */}
      <Box sx={{ backgroundColor: 'primary.dark', color: 'primary.contrastText', px: { xs: 2, lg: 6 }, py: 0.6, fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1440, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="caption" sx={{ color: 'secondary.light', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
              ⚡ ISO 9001:2015 CERTIFIED B2B DISTRIBUTOR
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Support: procurement@kdselectronics.com | (+91) 22-8900-4321
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Currency selector — driven entirely by GET /store/products/currencies
                (guide §4). Hidden when the backend reports only one supported
                currency (no live FX rates); never hardcode the list. */}
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
            <RouterLink to="/products" style={{ color: 'white', textDecoration: 'none', fontWeight: 600 }}>
              Quick Order
            </RouterLink>
            {user && (
              <RouterLink to="/user/orders" style={{ color: 'white', textDecoration: 'none', fontWeight: 600 }}>
                Order Tracking
              </RouterLink>
            )}
          </Box>
        </Box>
      </Box>

      {/* 2. Primary Brand & Mega Search Header */}
      <AppBar position="static" sx={{ backgroundColor: '#ffffff', color: 'text.primary', boxShadow: 'none', borderBottom: '1px solid #D6E4EE', px: { xs: 1, sm: 3, md: 6 }, py: 1 }}>
        <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between', gap: { xs: 2, md: 4 }, maxWidth: 1440, mx: 'auto', width: '100%' }}>
          
          {/* Logo & Corporate Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isMobile && (
              <IconButton onClick={() => setDrawerOpen(true)} color="primary" aria-label="open mobile navigation drawer">
                <MenuIcon />
              </IconButton>
            )}
            <Box component={RouterLink} to="/" sx={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ bgcolor: 'primary.main', color: 'white', px: 1.2, py: 0.3, borderRadius: 1, fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.05em' }}>
                  KDS
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: '-0.03em', display: { xs: 'none', sm: 'block' } }}>
                  ELECTRONICS
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.secondary', fontWeight: 700, letterSpacing: '0.08em', mt: -0.2 }}>
                INDUSTRIAL PROCUREMENT
              </Typography>
            </Box>
          </Box>

          {/* Mega Search Bar with Live Backend Autocomplete */}
          <Box sx={{ flexGrow: 1, maxWidth: 640, position: 'relative' }}>
            <ClickAwayListener onClickAway={() => setShowSuggestions(false)}>
              <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', width: '100%', position: 'relative' }}>
                <Paper
                  elevation={0}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    border: '2px solid #243A5E',
                    borderRadius: 1,
                    overflow: 'hidden',
                    bgcolor: '#ffffff',
                    height: 44,
                  }}
                >
                  <InputBase
                    sx={{ ml: 2, flex: 1, fontSize: '0.875rem', color: 'text.primary', fontWeight: 500 }}
                    placeholder="Search by Part Number, Keyword, Manufacturer, or SKU..."
                    value={searchVal}
                    onChange={handleSearchChange}
                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                    inputProps={{ 'aria-label': 'Search industrial components by part number, manufacturer, or keyword' }}
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
                    sx={{ height: '100%', borderRadius: 0, px: { xs: 2, sm: 4 }, fontWeight: 700, display: 'flex', gap: 1 }}
                  >
                    <SearchIcon fontSize="small" />
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>SEARCH</Box>
                  </Button>
                </Paper>

                {/* Autocomplete Dropdown List */}
                {showSuggestions && (
                  <Paper
                    elevation={6}
                    sx={{
                      position: 'absolute',
                      top: 48,
                      left: 0,
                      right: 0,
                      zIndex: 1500,
                      borderRadius: 1,
                      border: '1px solid #D6E4EE',
                      maxHeight: 420,
                      overflowY: 'auto',
                      bgcolor: '#ffffff',
                    }}
                  >
                    {searching ? (
                      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CircularProgress size={20} color="primary" />
                        <Typography variant="body2" color="text.secondary">Querying catalog inventory...</Typography>
                      </Box>
                    ) : suggestions.length > 0 ? (
                      <List disablePadding>
                        <Box sx={{ px: 2, py: 1, bgcolor: '#EDF4FA', borderBottom: '1px solid #D6E4EE' }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                            Live Component Matches ({suggestions.length})
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
                                  {item.partNumber || item.mpn || item.sku || item.name}
                                </Typography>
                                {item.fromPriceScaled != null && (
                                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                                    {formatScaledPrice(item.fromPriceScaled, item.priceScale ?? 4, item.currency || currency || 'INR')}
                                  </Typography>
                                )}
                              </Box>
                              <Typography variant="caption" color="text.secondary" noWrap sx={{ mt: 0.3 }}>
                                {item.brand || item.manufacturer || 'Industrial Part'} • {item.categoryName || item.category || 'Component'} • In Stock: {item.totalStock !== undefined ? item.totalStock : (item.stock || item.quantity || 0)} units
                              </Typography>
                            </Box>
                          </ListItemButton>
                        ))}
                        <Box sx={{ p: 1, textAlign: 'center', bgcolor: '#f8fbfd' }}>
                          <Button size="small" onClick={handleSearchSubmit} sx={{ width: '100%', fontWeight: 700 }}>
                            View all matching catalog parts →
                          </Button>
                        </Box>
                      </List>
                    ) : searchVal.trim().length >= 2 && (
                      <Box sx={{ p: 2.5, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          No direct component matches found for "<strong>{searchVal}</strong>".
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                          Try searching by manufacturer shortcode, category name, or general specifications.
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
            
            <Tooltip title="B2B Quotations & BOM Requests">
              <IconButton component={RouterLink} to={user ? "/user/quotations" : "/login"} sx={{ color: 'primary.main' }} aria-label="view B2B quotations and bill of materials">
                <QuoteIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Saved Industrial Favorites">
              <IconButton component={RouterLink} to={user ? "/user/favorites" : "/login"} sx={{ color: 'primary.main' }} aria-label="view saved favorite products">
                <FavoriteIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Procurement Cart">
              <IconButton onClick={toggleCartDrawer} sx={{ color: 'primary.main' }} aria-label={`open procurement cart with ${cartItemCount || 0} items`}>
                <Badge badgeContent={cartItemCount || 0} color="secondary">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ my: 1, mx: 0.5, display: { xs: 'none', md: 'block' } }} />

            {/* User Account Portal */}
            {user ? (
              <>
                <Button
                  onClick={handleUserMenuClick}
                  endIcon={<KeyboardArrowDownIcon />}
                  sx={{ color: 'primary.main', fontWeight: 700, px: 1.5, border: '1px solid #D6E4EE', borderRadius: 1 }}
                >
                  <AccountCircleIcon sx={{ mr: 0.8 }} />
                  <Box component="span" sx={{ display: { xs: 'none', lg: 'inline' }, maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name || user.username || 'My Account'}
                  </Box>
                </Button>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleUserMenuClose} PaperProps={{ sx: { width: 220, mt: 1, borderRadius: 1 } }}>
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="caption" color="text.secondary">SIGNED IN AS</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main', wordBreak: 'break-word' }}>
                      {user.email}
                    </Typography>
                    <Chip label={user.role || 'CUSTOMER'} size="small" sx={{ mt: 0.5, fontSize: '0.625rem', height: 20 }} />
                  </Box>
                  <Divider />
                  {isAdmin && (
                    <MenuItem component={RouterLink} to="/admin/dashboard" onClick={handleUserMenuClose} sx={{ fontWeight: 700, color: 'primary.main' }}>
                      <DashboardIcon sx={{ mr: 1.5, fontSize: 20 }} /> Admin Command Center
                    </MenuItem>
                  )}
                  <MenuItem component={RouterLink} to="/user/dashboard" onClick={handleUserMenuClose}>
                    <PersonIcon sx={{ mr: 1.5, fontSize: 20 }} /> Procurement Portal
                  </MenuItem>
                  <MenuItem component={RouterLink} to="/user/orders" onClick={handleUserMenuClose}>
                    <InventoryIcon sx={{ mr: 1.5, fontSize: 20 }} /> My Order History
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
                variant="outlined"
                color="primary"
                size="small"
                sx={{ fontWeight: 700, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
              >
                Sign In / Register
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* 3. High-Density Industrial Mega Navigation Bar */}
      <Box sx={{ backgroundColor: 'primary.main', color: 'white', borderTop: '1px solid rgba(255,255,255,0.08)', display: { xs: 'none', md: 'block' } }}>
        <Box sx={{ maxWidth: 1440, mx: 'auto', px: 6, display: 'flex', alignItems: 'center', position: 'relative', minHeight: 44 }}>
          
          {/* Mega Menu Trigger Toggle */}
          <Box
            onMouseEnter={() => setIsMegaMenuOpen(true)}
            onMouseLeave={() => setIsMegaMenuOpen(false)}
            sx={{ display: 'flex', alignItems: 'center', height: '100%', mr: 4 }}
          >
            <Button
              sx={{
                color: 'white',
                fontWeight: 700,
                fontSize: '0.8125rem',
                py: 1.2,
                px: 2,
                bgcolor: isMegaMenuOpen ? 'primary.dark' : 'transparent',
                borderRadius: 0,
                borderLeft: '1px solid rgba(255,255,255,0.1)',
                borderRight: '1px solid rgba(255,255,255,0.1)',
              }}
              endIcon={<KeyboardArrowDownIcon />}
            >
              ALL PRODUCTS & CATEGORIES
            </Button>

            {/* Expandable Mega Navigation Drawer */}
            {isMegaMenuOpen && megaMenuData.length > 0 && (
              <Paper
                elevation={12}
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  width: '100%',
                  minHeight: 340,
                  maxHeight: 460,
                  bgcolor: '#ffffff',
                  color: 'text.primary',
                  zIndex: 1600,
                  display: 'flex',
                  border: '1px solid #D6E4EE',
                  borderTop: '3px solid #8FB6D8',
                  borderRadius: '0 0 8px 8px',
                  boxShadow: '0 12px 36px rgba(22, 36, 60, 0.2)',
                  overflow: 'hidden',
                }}
              >
                {/* Left Column: Primary Categories */}
                <Box sx={{ width: 300, borderRight: '1px solid #D6E4EE', bgcolor: '#F4F8FB', overflowY: 'auto', py: 1 }}>
                  <Typography variant="caption" sx={{ px: 2, py: 0.8, display: 'block', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
                    Industrial Classifications
                  </Typography>
                  <List disablePadding>
                    {megaMenuData.map((cat, idx) => (
                      <ListItemButton
                        key={cat.id || idx}
                        selected={selectedCatIndex === idx}
                        onMouseEnter={() => setSelectedCatIndex(idx)}
                        onClick={() => { setIsMegaMenuOpen(false); navigate(`/products?category=${encodeURIComponent(cat.slug || cat.name)}`); }}
                        sx={{
                          py: 1,
                          px: 2,
                          borderLeft: selectedCatIndex === idx ? '4px solid #243A5E' : '4px solid transparent',
                          bgcolor: selectedCatIndex === idx ? '#ffffff' : 'transparent',
                          '&.Mui-selected': { bgcolor: '#ffffff', fontWeight: 700 },
                        }}
                      >
                        <ListItemText 
                          primary={cat.name} 
                          primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: selectedCatIndex === idx ? 700 : 600, color: 'primary.main' }} 
                        />
                        <ArrowForwardIosIcon sx={{ fontSize: 12, color: selectedCatIndex === idx ? 'primary.main' : '#A0B4C8' }} />
                      </ListItemButton>
                    ))}
                  </List>
                </Box>

                {/* Right Column: Subcategories & Specification Groups */}
                <Box sx={{ flexGrow: 1, p: 4, overflowY: 'auto' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', pb: 2, mb: 3, borderBottom: '1px solid #D6E4EE' }}>
                    <Box>
                      <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 800 }}>
                        {megaMenuData[selectedCatIndex]?.name || 'Category Overview'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Browse verified electronic parts and precision industrial spares in this series.
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => { setIsMegaMenuOpen(false); navigate(`/products?category=${encodeURIComponent(megaMenuData[selectedCatIndex]?.slug || megaMenuData[selectedCatIndex]?.name)}`); }}
                    >
                      View All in Series →
                    </Button>
                  </Box>

                  <Grid container spacing={3}>
                    {megaMenuData[selectedCatIndex]?.subcategories?.length > 0 ? (
                      megaMenuData[selectedCatIndex].subcategories.map((sub, sIdx) => (
                        <Grid item xs={12} sm={6} md={4} key={sIdx}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 1, borderBottom: '1px dashed #D6E4EE', pb: 0.5 }}>
                            {sub.name}
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {sub.items?.slice(0, 5).map((item, iIdx) => (
                              <Typography
                                key={iIdx}
                                variant="caption"
                                component={RouterLink}
                                to={`/products?search=${encodeURIComponent(item)}`}
                                onClick={() => setIsMegaMenuOpen(false)}
                                sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}
                              >
                                • {item}
                              </Typography>
                            ))}
                          </Box>
                        </Grid>
                      ))
                    ) : (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center', fontStyle: 'italic' }}>
                          Direct specification sub-segmenting available on full category page. Click "View All in Series" to explore filtered inventory.
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </Paper>
            )}
          </Box>

          {/* Quick Nav Toolbar Links */}
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            <RouterLink to="/products" style={{ color: 'white', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600 }}>
              All Electronic Parts
            </RouterLink>
            <RouterLink to="/products?filter=in-stock" style={{ color: 'white', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600 }}>
              🟢 Ready to Ship (In Stock)
            </RouterLink>
            <RouterLink to={user ? "/user/quotations" : "/login"} style={{ color: '#8FB6D8', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 700 }}>
              📋 Request Bulk B2B Quote
            </RouterLink>
          </Box>
        </Box>
      </Box>

      {/* 4. Mobile Drawer Navigation */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: 300, bgcolor: '#EDF4FA' } }}>
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>KDS ELECTRONICS</Typography>
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'white' }} aria-label="close drawer">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List sx={{ pt: 0 }}>
          <ListItemButton component={RouterLink} to="/" onClick={() => setDrawerOpen(false)}>
            <ListItemText primary="Home Command Portal" primaryTypographyProps={{ fontWeight: 700 }} />
          </ListItemButton>
          <ListItemButton component={RouterLink} to="/products" onClick={() => setDrawerOpen(false)}>
            <ListItemText primary="Browse Electronic Catalog" primaryTypographyProps={{ fontWeight: 700 }} />
          </ListItemButton>
          <ListItemButton component={RouterLink} to={user ? "/user/quotations" : "/login"} onClick={() => setDrawerOpen(false)}>
            <ListItemText primary="Request B2B Quotations" primaryTypographyProps={{ fontWeight: 700 }} />
          </ListItemButton>
          <Divider sx={{ my: 1 }} />
          <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
            Product Categories
          </Typography>
          {megaMenuData.map((cat, i) => (
            <ListItemButton key={i} component={RouterLink} to={`/products?category=${encodeURIComponent(cat.slug || cat.name)}`} onClick={() => setDrawerOpen(false)}>
              <ListItemText primary={cat.name} primaryTypographyProps={{ fontSize: '0.875rem' }} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* Procurement Cart Drawer integration */}
      <CartDrawer />
    </Box>
  );
};

export default Navbar;
