import React, { useState, useEffect, useMemo } from 'react';
import { 
  Grid, Typography, Box, Breadcrumbs, IconButton, Drawer, CircularProgress, 
  Paper, InputBase, Checkbox, FormControlLabel, FormGroup, Button, Divider, 
  Chip, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { 
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Replay as ReplayIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { Link as RouterLink, useSearchParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productPublicService, categoryPublicService, searchService } from '../services/apiServices';
import SkeletonLoader from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';
import { useCurrency } from '../context/CurrencyContext';

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL query parameter synchronization
  const searchParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';
  const filterParam = searchParams.get('filter') || '';

  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  
  // Interactive Parametric Filters
  const [searchWithin, setSearchWithin] = useState('');
  const [inStockOnly, setInStockOnly] = useState(filterParam === 'in-stock');
  const [rohsCompliant, setRohsCompliant] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortBy, setSortBy] = useState('featured');
  const [pageSize, setPageSize] = useState('25');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const { currency } = useCurrency();
  // Default to INR until the currency context resolves (guide §3/§4) — the
  // /currencies call is in flight on first mount, so this component must
  // not wait on it or omit currency on /api/search/* (required there).
  const activeCurrency = currency || 'INR';

  // Load category classifications
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryPublicService.listCategories();
        const data = response?.content || response?.data?.content || response?.data || response?.categories || response || [];
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to retrieve categories:", err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Load product catalog from Meilisearch Universal Search / Backend API
  useEffect(() => {
    // Runs the branch selection for a given currency — factored out so a 503
    // (no live FX rate yet, guide §8, transient) can retry the same shape of
    // request in INR instead of failing the whole listing.
    const fetchForCurrency = async (curr) => {
      let response;
      const qParam = searchQuery || searchWithin || undefined;
      const manufacturerParam = selectedBrands.length > 0 ? selectedBrands[0] : undefined;
      const inStockParam = inStockOnly ? true : undefined;

      if (selectedCategory) {
        const foundCat = categories.find(c =>
          c.name?.toLowerCase() === selectedCategory.toLowerCase() ||
          c.slug?.toLowerCase() === selectedCategory.toLowerCase() ||
          String(c.id) === String(selectedCategory)
        );
        const slugToUse = foundCat ? (foundCat.slug || foundCat.name?.toLowerCase().replace(/\s+/g, '-')) : selectedCategory.toLowerCase().replace(/\s+/g, '-');
        try {
          if (qParam || manufacturerParam || inStockParam) {
            response = await searchService.searchCategory(slugToUse, { q: qParam, manufacturer: manufacturerParam, inStock: inStockParam, currency: curr, size: Number(pageSize) || 50 });
          } else {
            response = await categoryPublicService.getCategoryProducts(slugToUse, { currency: curr, size: Number(pageSize) || 50 });
          }
        } catch (e) {
          console.warn("Category search/product endpoint fallback:", e);
          response = await productPublicService.listProducts({ currency: curr, size: Number(pageSize) || 50 });
        }
      } else if (qParam || manufacturerParam || inStockParam) {
        try {
          response = await searchService.search({ q: qParam, manufacturer: manufacturerParam, inStock: inStockParam, currency: curr, size: Number(pageSize) || 50 });
        } catch (e) {
          console.warn("Meilisearch offline, fallback to standard listing:", e);
          response = await productPublicService.listProducts({ currency: curr, size: Number(pageSize) || 50 });
        }
      } else {
        response = await productPublicService.listProducts({ currency: curr, size: Number(pageSize) || 50 });
      }
      return response;
    };

    const fetchProducts = async () => {
      try {
        setLoading(true);
        let response;
        try {
          response = await fetchForCurrency(activeCurrency);
        } catch (priceErr) {
          if (priceErr?.response?.status === 503 && activeCurrency !== 'INR') {
            response = await fetchForCurrency('INR');
          } else {
            throw priceErr;
          }
        }
        const items = response?.content || response?.data?.content || response?.data || response?.products || response || [];
        setProducts(Array.isArray(items) ? items : []);
        setError(null);
      } catch (err) {
        console.error("Catalog API offline:", err);
        setError("Unable to synchronize with live catalog database server.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    // activeCurrency triggers a refetch (new prices) but every branch above
    // keeps the same filter/search params, so the result set, its order,
    // and its count are unaffected — only the displayed numbers change
    // (guide §3: "currency means render prices in this currency, does not
    // filter which products come back").
  }, [selectedCategory, pageSize, searchQuery, searchWithin, inStockOnly, selectedBrands, categories, activeCurrency]);

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || '');
    setInStockOnly(searchParams.get('filter') === 'in-stock');
  }, [searchParams]);

  // Derive dynamic manufacturer list from loaded real inventory items
  const availableBrands = useMemo(() => {
    const brandSet = new Set();
    products.forEach(p => {
      if (p.brand) brandSet.add(p.brand);
      else if (p.manufacturer) brandSet.add(p.manufacturer);
    });
    return Array.from(brandSet).sort();
  }, [products]);

  const handleBrandToggle = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSearchWithin('');
    setInStockOnly(false);
    setRohsCompliant(false);
    setSelectedBrands([]);
    setSearchParams({});
  };

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter(p => {
      const pName = (p.name || p.title || '').toLowerCase();
      const pMfr = (p.brand || p.manufacturer || '').toLowerCase();
      const pMpn = (p.partNumber || p.mpn || p.sku || '').toLowerCase();
      const query = (searchQuery || '').toLowerCase();
      const within = (searchWithin || '').toLowerCase();
      const stockVal = p.totalStock !== undefined ? p.totalStock : (p.stock || p.quantity || 0);

      if (query && !pName.includes(query) && !pMfr.includes(query) && !pMpn.includes(query)) return false;
      if (within && !pName.includes(within) && !pMfr.includes(within) && !pMpn.includes(within)) return false;
      if (inStockOnly && stockVal <= 0) return false;
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand || p.manufacturer)) return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      // fromPriceScaled/priceScale (guide §2) — same scale on every item in
      // one response, but read each item's own priceScale defensively.
      const priceA = a.fromPriceScaled != null ? a.fromPriceScaled / 10 ** (a.priceScale ?? 4) : 0;
      const priceB = b.fromPriceScaled != null ? b.fromPriceScaled / 10 ** (b.priceScale ?? 4) : 0;
      const stockA = a.totalStock !== undefined ? a.totalStock : (a.stock || 0);
      const stockB = b.totalStock !== undefined ? b.totalStock : (b.stock || 0);

      if (sortBy === 'priceAsc') return priceA - priceB;
      if (sortBy === 'priceDesc') return priceB - priceA;
      if (sortBy === 'stockDesc') return stockB - stockA;
      return (b.id || b._id || 0) - (a.id || a._id || 0); // Featured / Newest fallback
    });
  }, [products, searchQuery, searchWithin, inStockOnly, rohsCompliant, selectedBrands, sortBy]);

  const totalResults = filteredAndSortedProducts.length;
  const hasActiveFilters = Boolean(searchQuery || selectedCategory || searchWithin || inStockOnly || rohsCompliant || selectedBrands.length > 0);

  // Left Parametric Filter Panel Component
  const filterPanel = (
    <Box sx={{ p: 2.5, bgcolor: '#ffffff', border: '1px solid #D6E4EE', borderRadius: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Parametric Filters
        </Typography>
        {hasActiveFilters && (
          <Button size="small" onClick={handleResetFilters} startIcon={<ReplayIcon sx={{ fontSize: 14 }} />} sx={{ fontSize: '0.7rem', fontWeight: 700, minWidth: 'auto', p: 0 }}>
            RESET
          </Button>
        )}
      </Box>
      <Divider sx={{ mb: 2.5 }} />

      {/* 1. Search within results */}
      <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 1, textTransform: 'uppercase' }}>
        Search Within Matches
      </Typography>
      <Box component="form" onSubmit={(e) => { e.preventDefault(); }} sx={{ mb: 3 }}>
        <InputBase
          placeholder="Filter by attribute or word..."
          value={searchWithin}
          onChange={(e) => setSearchWithin(e.target.value)}
          slotProps={{ input: { 'aria-label': 'Filter matches by attribute or keyword' } }}
          sx={{ width: '100%', border: '1px solid #D6E4EE', borderRadius: 1, px: 1.5, py: 0.5, fontSize: '0.8125rem', bgcolor: '#f8fafc' }}
        />
      </Box>

      {/* 2. Availability & Standards Compliance */}
      <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 1, textTransform: 'uppercase' }}>
        Stock & Compliance
      </Typography>
      <FormGroup sx={{ mb: 3 }}>
        <FormControlLabel
          control={<Checkbox checked={inStockOnly} onChange={(e) => { setInStockOnly(e.target.checked); if(e.target.checked) setSearchParams({ ...Object.fromEntries(searchParams), filter: 'in-stock' }); else { const p = { ...Object.fromEntries(searchParams) }; delete p.filter; setSearchParams(p); } }} size="small" color="primary" />}
          label={<Typography variant="body2" sx={{ fontWeight: 700, color: inStockOnly ? 'primary.main' : 'text.primary' }}>🟢 In Stock Ready-to-Ship</Typography>}
        />
        <FormControlLabel
          control={<Checkbox checked={rohsCompliant} onChange={(e) => setRohsCompliant(e.target.checked)} size="small" color="primary" />}
          label={<Typography variant="body2" sx={{ fontWeight: 600 }}>RoHS & REACH Compliant</Typography>}
        />
      </FormGroup>
      <Divider sx={{ mb: 2.5 }} />

      {/* 3. Component Categories */}
      <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 1, textTransform: 'uppercase' }}>
        Category Classifications
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, mb: 3, maxHeight: 220, overflowY: 'auto' }}>
        <Typography 
          variant="body2" 
          onClick={() => { setSelectedCategory(''); const p = { ...Object.fromEntries(searchParams) }; delete p.category; setSearchParams(p); }}
          sx={{ cursor: 'pointer', fontWeight: !selectedCategory ? 800 : 500, color: !selectedCategory ? 'primary.main' : 'text.primary', '&:hover': { color: 'primary.main' } }}
        >
          • All Electronic Parts ({products.length})
        </Typography>
        {categories.map((cat, idx) => {
          const cName = cat.name || cat.title || `Series ${idx+1}`;
          const isSelected = selectedCategory?.toLowerCase() === (cat.slug || cName).toLowerCase();
          return (
            <Typography
              key={idx}
              variant="body2"
              onClick={() => { const val = cat.slug || cName; setSelectedCategory(val); setSearchParams({ ...Object.fromEntries(searchParams), category: val }); }}
              sx={{ cursor: 'pointer', fontWeight: isSelected ? 800 : 500, color: isSelected ? 'primary.main' : 'text.primary', pl: 1, borderLeft: isSelected ? '2px solid #243A5E' : 'none', '&:hover': { color: 'primary.main' } }}
            >
              └ {cName}
            </Typography>
          );
        })}
      </Box>
      <Divider sx={{ mb: 2.5 }} />

      {/* 4. Manufacturers & Brands Index */}
      {availableBrands.length > 0 && (
        <>
          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 1, textTransform: 'uppercase' }}>
            Verified Manufacturers ({availableBrands.length})
          </Typography>
          <Box sx={{ maxHeight: 200, overflowY: 'auto', pr: 0.5 }}>
            <FormGroup>
              {availableBrands.map((brand, i) => (
                <FormControlLabel
                  key={i}
                  control={<Checkbox size="small" checked={selectedBrands.includes(brand)} onChange={() => handleBrandToggle(brand)} />}
                  label={<Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>{brand}</Typography>}
                />
              ))}
            </FormGroup>
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ pb: 8 }}>
      {/* Top Navigation Breadcrumbs */}
      <Box sx={{ py: 2, borderBottom: '1px solid #D6E4EE', mb: 3 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          <RouterLink to="/" style={{ color: '#5F86A6', textDecoration: 'none', fontWeight: 600, fontSize: '0.8125rem' }}>
            Procurement Portal
          </RouterLink>
          <Typography color="primary" sx={{ fontWeight: 800, fontSize: '0.8125rem' }}>
            {selectedCategory ? `Series: ${selectedCategory.toUpperCase()}` : searchQuery ? `Search: "${searchQuery}"` : 'Master Component Catalog'}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Header Bar: Results count and View / Sort Controls */}
      <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#ffffff', border: '1px solid #D6E4EE', borderRadius: 1.5, mb: 3, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main' }}>
            {selectedCategory ? selectedCategory : searchQuery ? `Results for "${searchQuery}"` : 'Industrial Electronic Components'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mt: 0.5 }}>
            Displaying <strong>{totalResults}</strong> precision matching components verified for OEM dispatch.
          </Typography>
        </Box>

        {/* View mode toggle & sort selector */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Button variant="outlined" startIcon={<FilterListIcon />} onClick={() => setMobileFilterOpen(true)} size="small">
              FILTERS ({selectedBrands.length + (inStockOnly ? 1 : 0) + (selectedCategory ? 1 : 0)})
            </Button>
          </Box>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="sort-select-label" sx={{ fontSize: '0.8125rem', fontWeight: 700 }}>SORT ORDER</InputLabel>
            <Select labelId="sort-select-label" value={sortBy} label="SORT ORDER" onChange={(e) => setSortBy(e.target.value)} sx={{ fontSize: '0.8125rem', fontWeight: 700 }}>
              <MenuItem value="featured">Featured / Relevancy</MenuItem>
              <MenuItem value="priceAsc">Unit Price: Low to High</MenuItem>
              <MenuItem value="priceDesc">Unit Price: High to Low</MenuItem>
              <MenuItem value="stockDesc">Availability: High Stock First</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ width: 100, display: { xs: 'none', sm: 'inline-flex' } }}>
            <InputLabel id="limit-select-label" sx={{ fontSize: '0.8125rem', fontWeight: 700 }}>PER PAGE</InputLabel>
            <Select labelId="limit-select-label" value={pageSize} label="PER PAGE" onChange={(e) => setPageSize(e.target.value)} sx={{ fontSize: '0.8125rem', fontWeight: 700 }}>
              <MenuItem value="25">25</MenuItem>
              <MenuItem value="50">50</MenuItem>
              <MenuItem value="100">100</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Sticky Applied Filter Chips Bar */}
      {hasActiveFilters && (
        <Box sx={{ p: 1.5, mb: 3, bgcolor: '#EDF4FA', borderRadius: 1, border: '1px dashed #A0B4C8', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', mr: 1 }}>APPLIED CRITERIA:</Typography>
          {selectedCategory && (
            <Chip label={`Series: ${selectedCategory}`} size="small" onDelete={() => { setSelectedCategory(''); const p = { ...Object.fromEntries(searchParams) }; delete p.category; setSearchParams(p); }} sx={{ bgcolor: '#ffffff', fontWeight: 700 }} />
          )}
          {searchQuery && (
            <Chip label={`Keyword: "${searchQuery}"`} size="small" onDelete={() => { setSearchQuery(''); const p = { ...Object.fromEntries(searchParams) }; delete p.search; setSearchParams(p); }} sx={{ bgcolor: '#ffffff', fontWeight: 700 }} />
          )}
          {searchWithin && (
            <Chip label={`Within: "${searchWithin}"`} size="small" onDelete={() => setSearchWithin('')} sx={{ bgcolor: '#ffffff', fontWeight: 700 }} />
          )}
          {inStockOnly && (
            <Chip label="🟢 Ready to Ship (In Stock)" size="small" onDelete={() => { setInStockOnly(false); const p = { ...Object.fromEntries(searchParams) }; delete p.filter; setSearchParams(p); }} sx={{ bgcolor: '#ffffff', fontWeight: 700 }} />
          )}
          {selectedBrands.map(b => (
            <Chip key={b} label={`MFR: ${b}`} size="small" onDelete={() => handleBrandToggle(b)} sx={{ bgcolor: '#ffffff', fontWeight: 700 }} />
          ))}
          <Button size="small" onClick={handleResetFilters} sx={{ ml: 'auto', fontSize: '0.7rem', fontWeight: 800, color: 'error.main' }}>
            CLEAR ALL FILTERS
          </Button>
        </Box>
      )}

      {/* Main Layout Columns */}
      <Grid container spacing={4}>
        
        {/* Left Parametric Column (Desktop) */}
        <Grid size={{ xs: 12, md: 3.2 }} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Box sx={{ position: 'sticky', top: 120 }}>
            {filterPanel}
          </Box>
        </Grid>

        {/* Right Catalog Results Column */}
        <Grid size={{ xs: 12, md: 8.8 }}>
          {loading ? (
            <SkeletonLoader count={8} />
          ) : error ? (
            <EmptyState
              title="Database Server Unreachable"
              description={error}
              actionText="Retry Synchronization"
              onAction={() => window.location.reload()}
            />
          ) : totalResults > 0 ? (
            <Box>
              {/* High-Density Industrial Table / List View */}
              <Paper elevation={0} sx={{ border: '1px solid #D6E4EE', borderRadius: 1, overflow: 'hidden' }}>
                {/* Table Header Row */}
                <Box sx={{ display: { xs: 'none', md: 'grid' }, gridTemplateColumns: '120px 2.5fr 1.5fr 1.5fr 1.8fr 180px', gap: 2, px: 2, py: 1.2, bgcolor: '#EDF4FA', borderBottom: '2px solid #243A5E', fontWeight: 800, fontSize: '0.75rem', color: 'primary.main', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Box>Part Image</Box>
                  <Box>Part Number / Description</Box>
                  <Box>Stock Availability</Box>
                  <Box>Unit / Tier Price</Box>
                  <Box>Compliance & Series</Box>
                  <Box sx={{ textAlign: 'right' }}>Procurement Action</Box>
                </Box>
                {filteredAndSortedProducts.map((product, idx) => (
                  <ProductCard key={product.id || product._id || idx} product={product} viewMode="list" />
                ))}
              </Paper>
            </Box>
          ) : (
            <EmptyState
              title="No Matching Industrial Components"
              description="Your current parametric combinations did not return any corresponding part numbers in our live warehouse database."
              actionText="Clear Parametric Filters"
              onAction={handleResetFilters}
            />
          )}
        </Grid>
      </Grid>

      {/* Mobile Sidebar Drawer */}
      <Drawer anchor="left" open={mobileFilterOpen} onClose={() => setMobileFilterOpen(false)} slotProps={{
        paper: { sx: { width: 300, p: 1 } }
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <Button size="small" onClick={() => setMobileFilterOpen(false)} sx={{ fontWeight: 800 }}>CLOSE PANELS ✕</Button>
        </Box>
        {filterPanel}
      </Drawer>
    </Box>
  );
};

export default ProductListing;
