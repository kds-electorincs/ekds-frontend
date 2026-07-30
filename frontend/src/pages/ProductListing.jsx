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
import ProductCard from '../components/ProductCard';
import { productPublicService, categoryPublicService } from '../services/apiServices';
import SkeletonLoader from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';

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
  const [viewMode, setViewMode] = useState('grid');

  // Fetch categories once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryPublicService.listCategories();
        const data = response?.content || response?.data?.content || response?.data || response?.categories || response || [];
        const formattedData = (Array.isArray(data) ? data : []).map(cat => ({
          id: cat.id,
          name: cat.name || '',
          slug: cat.slug || (cat.name || '').toLowerCase().replace(/\s+/g, '-'),
          icon: cat.icon || "📁",
          productCount: cat.productCount || 0,
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
    fetchCategories();
  }, []);

  // Fetch products whenever selectedCategory changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let response;
        if (selectedCategory) {
          const foundCat = productIndexData.find(c => 
            c.name?.toLowerCase() === selectedCategory.toLowerCase() || 
            c.slug?.toLowerCase() === selectedCategory.toLowerCase() ||
            String(c.id) === String(selectedCategory)
          );
          const slugToUse = foundCat ? foundCat.slug : selectedCategory.toLowerCase().replace(/\s+/g, '-');
          try {
            response = await categoryPublicService.getCategoryProducts(slugToUse, { currency: 'INR', size: 50 });
          } catch (e) {
            console.warn("Category product fetch fallback to all products:", e);
            response = await productPublicService.listProducts({ currency: 'INR', size: 50 });
          }
        } else {
          response = await productPublicService.listProducts({ currency: 'INR', size: 50 });
        }
        const items = response?.content || response?.data || response?.products || response || [];
        setProducts(Array.isArray(items) ? items : []);
        setError(null);
      } catch (err) {
        console.error("Failed to load products:", err);
        setError("Failed to load products from server.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [selectedCategory, productIndexData]);

  // Sync state if URL parameters change (from navbar, mega menu, or other links)
  useEffect(() => {
    const s = searchParams.get('search') || '';
    const c = searchParams.get('category') || '';
    setSearchQuery(s);
    setSelectedCategory(c);
  }, [searchParams]);

  // Handle Category select in sidebar or index cards
  const handleCategorySelect = (cat) => {
    const targetVal = cat.slug || cat.name;
    setSelectedCategory(targetVal);
    setSearchParams({ category: targetVal });
    setViewMode('grid');
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
      const name = (product.name || '').toLowerCase();
      const mfr = (product.manufacturer || '').toLowerCase();
      const mpn = (product.mpn || '').toLowerCase();
      const cat = (typeof product.category === 'object' ? product.category?.name : product.category || '').toLowerCase();
      const query = (searchQuery || '').toLowerCase();

      const matchesSearch = !searchQuery || 
        name.includes(query) || 
        mfr.includes(query) || 
        mpn.includes(query) || 
        cat.includes(query);
      
      const stock = product.totalStock !== undefined ? product.totalStock : (product.stock || 0);
      const matchesStock = !inStockOnly || stock > 0;
      const matchesRohs = !rohsCompliant || !!product.rohsCompliant; 
      return matchesSearch && matchesStock && matchesRohs;
    });

    return [...filtered].sort((a, b) => {
      const priceA = (a.fromPriceMinor !== undefined ? a.fromPriceMinor / 100 : a.price) || 0;
      const priceB = (b.fromPriceMinor !== undefined ? b.fromPriceMinor / 100 : b.price) || 0;
      const stockA = a.totalStock !== undefined ? a.totalStock : (a.stock || 0);
      const stockB = b.totalStock !== undefined ? b.totalStock : (b.stock || 0);

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'stock') return stockB - stockA;
      return 0; // Default featured
    });
  }, [products, searchQuery, inStockOnly, rohsCompliant, sortBy]);

  const isGridView = viewMode === 'grid' || Boolean(searchQuery) || Boolean(selectedCategory);

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
          {productIndexData.map((cat) => {
            const isSelected = selectedCategory && (selectedCategory.toLowerCase() === (cat.slug || '').toLowerCase() || selectedCategory.toLowerCase() === (cat.name || '').toLowerCase());
            return (
              <Link
                key={cat.id || cat.name}
                onClick={() => {
                  handleCategorySelect(cat);
                  if (isMobile) setMobileFilterOpen(false);
                }}
                sx={{
                  fontSize: '0.85rem',
                  fontWeight: isSelected ? 800 : 600,
                  color: isSelected ? 'primary.main' : 'text.secondary',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  py: 0.4,
                  px: 1,
                  borderRadius: 1,
                  bgcolor: isSelected ? 'primary.50' : 'transparent',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <span>{cat.icon} {cat.name}</span>
                {cat.productCount > 0 && (
                  <Chip label={cat.productCount} size="small" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
                )}
              </Link>
            );
          })}
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
          {isGridView ? "Product Catalog" : "Category Index"}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* View Toggle */}
          <Box sx={{ display: 'flex', gap: 0.5, bgcolor: 'action.hover', p: 0.5, borderRadius: 2 }}>
            <Button
              size="small"
              variant={isGridView ? 'contained' : 'text'}
              onClick={() => setViewMode('grid')}
              sx={{ borderRadius: 1.5, fontWeight: 700, textTransform: 'none', px: 2 }}
            >
              All Products
            </Button>
            <Button
              size="small"
              variant={!isGridView ? 'contained' : 'text'}
              onClick={() => { setViewMode('grouped'); handleResetAllFilters(); }}
              sx={{ borderRadius: 1.5, fontWeight: 700, textTransform: 'none', px: 2 }}
            >
              Category Index
            </Button>
          </Box>

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
                <Box sx={{ py: 3 }}>
                  <SkeletonLoader type="card" count={8} />
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
                    <RouterLink to={`/product/${product.slug || product.id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }} key={product.id || product.slug}>
                      <ProductCard product={product} sx={{ height: '100%' }} />
                    </RouterLink>
                  ))}
                </Box>
              ) : (
                <EmptyState
                  title="No Products Matching Filters"
                  description="We couldn't locate items corresponding to your active search keywords or filter criteria."
                  icon="search"
                  actionText="Reset All Filters"
                  onAction={handleResetAllFilters}
                />
              )}
            </Box>
          ) : (
            
            // =========================================================================
            // CASE B: Index View (Default grouped view)
            // =========================================================================
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {productIndexData.map((cat) => (
                <Box 
                  key={cat.id || cat.name}  
                  id={`category-section-${cat.name}`} 
                  sx={{ 
                    border: '1px solid', 
                    borderColor: 'divider', 
                    borderRadius: 3, 
                    overflow: 'hidden',
                    scrollMarginTop: 120,
                    bgcolor: 'background.paper',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s',
                    '&:hover': { boxShadow: '0 8px 25px rgba(0,0,0,0.06)' }
                  }}
                >
                  {/* Category Header Bar */}
                  <Box 
                    sx={{ 
                      bgcolor: 'primary.main', 
                      color: 'white', 
                      px: 3.5, 
                      py: 2.5, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Typography sx={{ fontSize: '1.6rem' }}>{cat.icon}</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.5, fontFamily: '"Outfit", sans-serif' }}>
                        {cat.name}
                      </Typography>
                    </Box>
                    <Chip 
                      label={`${cat.productCount || 0} Products`} 
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700, px: 1.5 }} 
                    />
                  </Box>
                  
                  {/* Category Content */}
                  <Box sx={{ p: 3.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 600, fontSize: '0.95rem', fontWeight: 500 }}>
                      Browse our high-quality inventory of {cat.name}. Check real-time stock levels, volume price breaks, and request immediate quotes or delivery.
                    </Typography>
                    <Button
                      variant="contained"
                      size="medium"
                      onClick={() => handleCategorySelect(cat)}
                      sx={{ fontWeight: 700, borderRadius: 2, px: 3, py: 1, textTransform: 'none', boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)' }}
                    >
                      Explore {cat.name} ➔
                    </Button>
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
