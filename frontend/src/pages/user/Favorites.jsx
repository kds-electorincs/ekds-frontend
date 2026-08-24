import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, CircularProgress } from '@mui/material';
import ProductCard from '../../components/ProductCard';
// import { userService } from '../../services/apiServices';

const Favorites = () => {
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO(backend-missing): No backend endpoint for GET /users/me/favorites.
    // Feature: User Favorites list. Commented out until backend implements this.
    // Suggested endpoint: GET /api/users/me/favorites
    // Stub: loading defaults to false and the list stays empty, so the page
    // renders its existing "no favorite items" empty state instead of an
    // infinite spinner.
    // const fetchFavorites = async () => {
    //   try {
    //     setLoading(true);
    //     const res = await userService.getFavorites();
    //     setFavoriteProducts(res?.data || res?.favorites || res || []);
    //   } catch (err) {
    //     console.error("Failed to fetch favorites", err);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchFavorites();
  }, []);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>My Favorites</Typography>
      
      {loading ? (
        <CircularProgress />
      ) : favoriteProducts.length > 0 ? (
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
