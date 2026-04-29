import React, { useState, useEffect } from 'react';
import { Grid, Typography, Box, Breadcrumbs, Link, IconButton, Drawer, CircularProgress } from '@mui/material';
import { FilterList as FilterListIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import FilterPanel from '../components/FilterPanel';
import SearchBar from '../components/SearchBar';
import axios from 'axios';

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 5000]);

  useEffect(() => {
    // Function to fetch products from your backend
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Replace this URL with your actual backend URL/API endpoint
        const response = await axios.get('http://localhost:5000/api/products');
        
        // Assuming your backend sends an array of products
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products from backend. Please ensure the server is running.");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array ensures this runs only once when component mounts
  
  const categories = Array.from(new Set(products.map(p => p.category)));

  // Filtered Products Calculation
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const handleFilterChange = (type, value, checked) => {
    if (type === 'reset') {
      setSelectedCategories([]);
      setPriceRange([0, 5000]);
      setSearchQuery('');
    } else if (type === 'category') {
      if (checked) {
        setSelectedCategories(prev => [...prev, value]);
      } else {
        setSelectedCategories(prev => prev.filter(c => c !== value));
      }
    } else if (type === 'price') {
      setPriceRange(value);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" underline="hover" color="inherit">Home</Link>
        <Typography color="text.primary">Products</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
          Our Products
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', sm: 'auto' } }}>
          <SearchBar onSearch={handleSearch} placeholder="Search products..." />
          <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
            <IconButton variant="outlined" onClick={() => setMobileFilterOpen(true)} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <FilterListIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4, alignItems: 'flex-start' }}>
        {/* Sidebar Filter */}
        <Box sx={{ width: { xs: '100%', sm: '260px', md: '300px' }, flexShrink: 0, display: { xs: 'none', sm: 'block' } }}>
          <Box sx={{ position: 'sticky', top: 100 }}>
            <FilterPanel 
              categories={categories} 
              selectedCategories={selectedCategories}
              priceRange={priceRange}
              onFilterChange={handleFilterChange} 
            />
          </Box>
        </Box>

        {/* Product Grid */}
        <Box sx={{ flexGrow: 1, width: { xs: '100%', sm: 'calc(100% - 260px - 32px)', md: 'calc(100% - 300px - 32px)' } }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <Typography variant="h6" color="error">
                {error}
              </Typography>
            </Box>
          ) : filteredProducts.length > 0 ? (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' }, 
              gap: 3 
            }}>
              {filteredProducts.map((product) => (
                <RouterLink to={`/product/${product.id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }} key={product.id}>
                  <ProductCard product={product} sx={{ height: '100%' }} />
                </RouterLink>
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <Typography variant="h6" color="text.secondary">
                No products found matching your criteria.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Mobile Filter Drawer */}
      <Drawer
        anchor="right"
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
      >
        <Box sx={{ width: 280, p: 2 }}>
          <FilterPanel 
            categories={categories} 
            selectedCategories={selectedCategories}
            priceRange={priceRange}
            onFilterChange={(t, v, c) => {
              handleFilterChange(t, v, c);
              if (t === 'reset') setMobileFilterOpen(false);
            }} 
          />
        </Box>
      </Drawer>
    </Box>
  );
};

export default ProductListing;
