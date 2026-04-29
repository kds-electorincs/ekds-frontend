import React, { useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Grid, Typography, Box, Button, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, TextField, IconButton } from '@mui/material';
import { Add, Remove, ShoppingCart, Description, Gavel, FavoriteBorder } from '@mui/icons-material';
import { MOCK_PRODUCTS } from '../constants/mockData';
import StatusChip from '../components/StatusChip';
import notification from '../utils/notification';

const ProductDetails = () => {
  const { id } = useParams();
  const product = MOCK_PRODUCTS.find(p => p.id === id);
  const [quantity, setQuantity] = useState(1);

  if (!product) return <Typography>Product not found</Typography>;

  const handleAddToCart = () => {
    notification.success(`Added ${quantity} ${product.name} to cart!`);
  };

  return (
    <Box>
      <Grid container spacing={6}>
        {/* Product Image */}
        <Grid xs={12} md={6}>
          <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
            <img 
              src={product.image} 
              alt={product.name} 
              style={{ width: '100%', height: 'auto', display: 'block' }} 
            />
          </Paper>
        </Grid>

        {/* Product Info */}
        <Grid xs={12} md={6}>
          <Box>
            <Chip label={product.category} color="primary" variant="outlined" size="small" sx={{ mb: 2 }} />
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: 'primary.main' }}>
              {product.name}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                ${product.price}
              </Typography>
              <StatusChip status={product.stock > 0 ? 'shipped' : 'error'} />
            </Box>

            <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: '1.1rem' }}>
              {product.description}
            </Typography>

            <Divider sx={{ my: 4 }} />

            {/* Bulk Pricing */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Bulk Pricing</Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 4 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'secondary.light' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Price per Unit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {product.bulkPricing.map((tier) => (
                    <TableRow key={tier.min}>
                      <TableCell>{tier.min}+ units</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>${tier.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <IconButton onClick={() => setQuantity(Math.max(1, quantity - 1))}><Remove /></IconButton>
                <Typography sx={{ px: 2, fontWeight: 700 }}>{quantity}</Typography>
                <IconButton onClick={() => setQuantity(quantity + 1)}><Add /></IconButton>
              </Box>
              <Button 
                variant="contained" 
                size="large" 
                fullWidth 
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                sx={{ py: 1.5, borderRadius: 2 }}
              >
                Add to Cart
              </Button>
              <IconButton variant="outlined" sx={{ border: '1px solid', borderColor: 'divider', p: 1.5 }}>
                <FavoriteBorder />
              </IconButton>
            </Box>

            <Button 
              variant="outlined" 
              fullWidth 
              startIcon={<Gavel />}
              sx={{ py: 1.5, borderRadius: 2, mb: 4 }}
            >
              Request Quotation
            </Button>
          </Box>
        </Grid>

        {/* Specifications */}
        <Grid xs={12}>
          <Divider sx={{ mb: 6 }} />
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>Specifications</Typography>
          <Grid container spacing={2}>
            {product.specs.map((spec, index) => (
              <Grid xs={12} sm={6} md={4} key={index}>
                <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'background.default' }}>
                  <Description color="primary" />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{spec}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductDetails;
