import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import ProductCard from '../../components/ProductCard';
import { MOCK_PRODUCTS } from '../../constants/mockData';

const Favorites = () => {
  // Mock just the first two products as favorites
  const favoriteProducts = MOCK_PRODUCTS.slice(0, 2);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>My Favorites</Typography>
      
      {favoriteProducts.length > 0 ? (
        <Grid container spacing={3}>
          {favoriteProducts.map(product => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography color="text.secondary">You have no favorite items yet.</Typography>
      )}
    </Box>
  );
};

export default Favorites;
