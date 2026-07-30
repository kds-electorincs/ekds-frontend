import React, { useState, useEffect, useRef } from 'react';
import { 
  Grid, Typography, Box, Breadcrumbs, Link, IconButton, 
  Drawer, CircularProgress, Paper, InputBase, Checkbox, 
  FormControlLabel, FormGroup, Button, Divider, Chip, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { 
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Replay as ReplayIcon,
  ShoppingBag as ShoppingBagIcon
} from '@mui/icons-material';
import { Link as RouterLink, useSearchParams, useNavigate } from 'react-router-dom';
import ProductCard from '../../../../components/ProductCard';
import { productPublicService, categoryPublicService } from '../../../../services/apiServices';

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [productIndexData, setProductIndexData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search parameters syncing
  const searchParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';

  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  
  // Custom sidebar filters
  const [searchWithin, setSearchWithin] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [rohsCompliant, setRohsCompliant] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productPublicService.listProducts();
        setProducts(response?.data || response?.products || response || []);
        setError(null);
      } catch (err) {
        console.error("Failed to load products:", err);
        setError("Failed to load products from server.");
      } finally {
        setLoading(false);
      }
    };
    
    const fetchCategories = async () => {
      try {
        const response = await categoryPublicService.listCategories();
        const data = response?.data?.content || response?.data || response?.categories || response || [];
        const formattedData = (Array.isArray(data) ? data : []).map(cat => ({
          name: cat.name,
          icon: cat.icon || "📁",
          subcategories: (cat.segments || cat.subcategories || []).map(seg => ({
            name: seg.name,
            items: (seg.attributes || seg.items || []).map(attr => ({
              name: attr.attrKey || attr.name || attr,
              count: attr.count || 0
            }))
          }))
        }));
        setProductIndexData(formattedData);
      } catch (err) {
        console.error("Failed to fetch categories for index:", err);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  // Sync state if URL parameters change (from navbar, mega menu, or other links)
  useEffect(() => {
    const s = searchParams.get('search') || '';
    const c = searchParams.get('category') || '';
    setSearchQuery(s);
    setSelectedCategory(c);
  }, [searchParams]);

  // Smooth scroll handler for the Index View sidebar
  const handleCategoryScroll = (catName) => {
    const isGridView = searchQuery || selectedCategory;
    if (isGridView) {
      // Clear filters to transition to index view, then scroll
      setSearchQuery('');
      setSelectedCategory('');
      setSearchParams({});
      setTimeout(() => {
        const element = document.getElementById(`category-section-${catName}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    } else {
      const element = document.getElementById(`category-section-${catName}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Handle Search Within sidebar filter submission
  const handleSearchWithinSubmit = (e) => {
    e.preventDefault();
    if (searchWithin.trim()) {
      setSearchQuery(searchWithin.trim());
      const nextParams = {};
      if (searchWithin.trim()) nextParams.search = searchWithin.trim();
      if (selectedCategory) nextParams.category = selectedCategory;
      setSearchParams(nextParams);
      setSearchWithin('');
    }
  };

  // Click handler for index items (links direct to grid view)
  const handleIndexItemClick = (mainCat, subItemName) => {
    // Standard B2B catalog mapping
    let mappedCat = "";
    if (mainCat.includes("Tool")) mappedCat = "Industrial Tools";
    else if (mainCat.includes("Safety")) mappedCat = "Safety Gear";
    else if (mainCat.includes("Electrical")) mappedCat = "Electrical Supplies";
    else if (mainCat.includes("Office")) mappedCat = "Office Equipment";
    else mappedCat = mainCat;

    const firstWord = subItemName.split(' ')[0]; // Search for the product word (e.g. "Drill" under "Drill Machines")
    
    setSelectedCategory(mappedCat);
    setSearchQuery(firstWord);
    
    const nextParams = {};
    if (mappedCat) nextParams.category = mappedCat;
    if (firstWord) nextParams.search = firstWord;
    setSearchParams(nextParams);
  };

  // Filter Reset
  const handleResetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSearchWithin('');
    setInStockOnly(false);
    setRohsCompliant(false);
    setSearchParams({});
  };

  // Memoized Filtered and Sorted products list
  const sortedProducts = React.useMemo(() => {
    const filtered = products.filter(product => {
      const matchesSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || 
        product.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesStock = !inStockOnly || product.stock > 0;
      const matchesRohs = !rohsCompliant || !!product.rohsCompliant; 
      return matchesSearch && matchesCategory && matchesStock && matchesRohs;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'stock') return b.stock - a.stock;
      return 0; // Default featured
    });
  }, [products, searchQuery, selectedCategory, inStockOnly, rohsCompliant, sortBy]);

  const isGridView = searchQuery || selectedCategory;

  // Sidebar Filter Form Content
  const sidebarFilterContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* 1. Filters Title */}
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Filters
        </Typography>
        <Divider />
      </Box>

      {/* 2. Search Within Input */}
      <Box>
        <form onSubmit={handleSearchWithinSubmit}>
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1.5,
              p: '2px 4px',
              bgcolor: 'background.default'
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1, fontSize: '0.8rem' }}
              placeholder="Search Within..."
              value={searchWithin}
              onChange={(e) => setSearchWithin(e.target.value)}
            />
            <IconButton type="submit" sx={{ p: '8px' }} aria-label="search">
              <SearchIcon fontSize="small" color="primary" />
            </IconButton>
          </Paper>
        </form>
      </Box>

      {/* 3. Checkboxes */}
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox 
              size="small" 
              checked={inStockOnly} 
              onChange={(e) => setInStockOnly(e.target.checked)} 
            />
          }
          label={<Typography variant="body2" sx={{ fontSize: '0.825rem', fontWeight: 600, color: 'text.secondary' }}>In Stock Only</Typography>}
        />
        <FormControlLabel
          control={
            <Checkbox 
              size="small" 
              checked={rohsCompliant} 
              onChange={(e) => setRohsCompliant(e.target.checked)} 
            />
          }
          label={<Typography variant="body2" sx={{ fontSize: '0.825rem', fontWeight: 600, color: 'text.secondary' }}>RoHS Compliant</Typography>}
        />
      </FormGroup>

      {/* 4. Reset Filters Button */}
      <Button
        variant="outlined"
        size="small"
        startIcon={<ReplayIcon />}
        onClick={handleResetAllFilters}
        sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 1.5 }}
      >
        Reset Filters
      </Button>

      {/* 5. Categories Navigation */}
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Categories
        </Typography>
        <Divider sx={{ mb: 1.5 }} />
        
        <Box sx={{ maxHeight: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
          {productIndexData.map((cat) => (
            <Link
              key={cat.name}
              onClick={() => {
                handleCategoryScroll(cat.name);
                if (isMobile) setMobileFilterOpen(false);
              }}
              sx={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'text.secondary',
                cursor: 'pointer',
                textDecoration: 'none',
                py: 0.2,
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline'
                }
              }}
            >
              {cat.icon} {cat.name}
            </Link>
          ))}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" underline="hover" color="inherit">Home</Link>
        <Typography color="text.primary">Products</Typography>
      </Breadcrumbs>

      {/* Page Title */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', fontFamily: '"Outfit", sans-serif', letterSpacing: -0.5 }}>
          {isGridView ? "Product Catalog" : "Product Index"}
        </Typography>
        
        {/* Mobile Filter Trigger */}
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <Button 
            variant="outlined" 
            onClick={() => setMobileFilterOpen(true)}
            startIcon={<FilterListIcon />}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            Filters
          </Button>
        </Box>
      </Box>

      {/* Outer Content Layout (Sidebar + Main Panel) */}
      <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
        
        {/* Left Filters Sidebar Card (Desktop Only) */}
        <Box sx={{ width: 260, flexShrink: 0, display: { xs: 'none', md: 'block' } }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              border: '1px solid', 
              borderColor: 'divider', 
              borderRadius: 2,
              position: 'sticky',
              top: 100
            }}
          >
            {sidebarFilterContent}
          </Paper>
        </Box>

        {/* Right Main Panel */}
        <Box sx={{ flexGrow: 1, width: { xs: '100%', md: 'calc(100% - 260px - 32px)' } }}>
          
          {/* ========================================================================= */}
          {/* CASE A: Grid View (When filters are applied) */}
          {/* ========================================================================= */}
          {isGridView ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
              {/* Filter details & Sort */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                
                {/* Active Filter Chips */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', mr: 1 }}>
                    Active Filters:
                  </Typography>
                  {selectedCategory && (
                    <Chip
                      label={`Category: ${selectedCategory}`}
                      size="small"
                      onDelete={() => {
                        setSelectedCategory('');
                        const nextParams = {};
                        if (searchQuery) nextParams.search = searchQuery;
                        setSearchParams(nextParams);
                      }}
                      color="primary"
                      sx={{ borderRadius: 1.5, fontWeight: 600 }}
                    />
                  )}
                  {searchQuery && (
                    <Chip
                      label={`Search: "${searchQuery}"`}
                      size="small"
                      onDelete={() => {
                        setSearchQuery('');
                        const nextParams = {};
                        if (selectedCategory) nextParams.category = selectedCategory;
                        setSearchParams(nextParams);
                      }}
                      color="primary"
                      sx={{ borderRadius: 1.5, fontWeight: 600 }}
                    />
                  )}
                  <Button 
                    size="small" 
                    onClick={handleResetAllFilters} 
                    sx={{ textTransform: 'none', fontWeight: 750, color: 'error.main' }}
                  >
                    Clear All
                  </Button>
                </Box>

                {/* Sort selector */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                    Sort By:
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      sx={{ borderRadius: 1.5, fontSize: '0.8rem', fontWeight: 600 }}
                    >
                      <MenuItem value="featured">Featured</MenuItem>
                      <MenuItem value="price-asc">Price: Low to High</MenuItem>
                      <MenuItem value="price-desc">Price: High to Low</MenuItem>
                      <MenuItem value="stock">In Stock</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {/* Grid Content */}
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                  <Typography variant="h6" color="error">{error}</Typography>
                </Box>
              ) : sortedProducts.length > 0 ? (
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' }, 
                  gap: 3 
                }}>
                  {sortedProducts.map((product) => (
                    <RouterLink to={`/product/${product.id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }} key={product.id}>
                      <ProductCard product={product} sx={{ height: '100%' }} />
                    </RouterLink>
                  ))}
                </Box>
              ) : (
                <Paper 
                  elevation={0} 
                  sx={{ p: 8, border: '1px solid', borderColor: 'divider', borderRadius: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
                >
                  <ShoppingBagIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                  <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600 }}>
                    No products found matching your active criteria.
                  </Typography>
                  <Button variant="outlined" size="small" onClick={handleResetAllFilters} sx={{ textTransform: 'none', fontWeight: 700 }}>
                    Reset Filters & View Index
                  </Button>
                </Paper>
              )}
            </Box>
          ) : (
            
            // =========================================================================
            // CASE B: Index View (Default grouped view)
            // =========================================================================
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {productIndexData.map((cat) => (
                <Box 
                  key={cat.name} 
                  id={`category-section-${cat.name}`} 
                  sx={{ 
                    border: '1px solid', 
                    borderColor: 'divider', 
                    borderRadius: 2, 
                    overflow: 'hidden',
                    scrollMarginTop: 120, // Critical for smooth scroll offsets
                    bgcolor: 'background.paper',
                    '&:hover': { boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }
                  }}
                >
                  {/* Category Header Bar */}
                  <Box 
                    sx={{ 
                      bgcolor: 'primary.main', 
                      color: 'white', 
                      px: 3, 
                      py: 2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1.5 
                    }}
                  >
                    <Typography sx={{ fontSize: '1.4rem' }}>{cat.icon}</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: 0.5 }}>
                      {cat.name}
                    </Typography>
                  </Box>
                  
                  {/* Subcategories Details Container */}
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={4}>
                      {cat.subcategories.map((sub) => (
                        <Grid item xs={12} sm={6} md={4} key={sub.name}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {/* Subcategory Header */}
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                              {sub.name}
                            </Typography>
                            
                            {/* Sub-subcategory Items list */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              {sub.items.map((item) => (
                                <Box key={item.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                  <Link
                                    onClick={() => handleIndexItemClick(cat.name, item.name)}
                                    sx={{
                                      fontSize: '0.8rem',
                                      fontWeight: 600,
                                      color: 'text.secondary',
                                      cursor: 'pointer',
                                      textDecoration: 'none',
                                      '&:hover': {
                                        color: 'secondary.dark',
                                        textDecoration: 'underline'
                                      }
                                    }}
                                  >
                                    {item.name}
                                  </Link>
                                  <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, ml: 1 }}>
                                    ({item.count})
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* Mobile Drawer filters */}
      <Drawer
        anchor="right"
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
      >
        <Box sx={{ width: 280, p: 3 }}>
          {sidebarFilterContent}
        </Box>
      </Drawer>
    </Box>
  );
};

export default ProductListing;
