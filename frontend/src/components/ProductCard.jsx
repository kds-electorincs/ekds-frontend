import React from 'react';
import { Card, CardMedia, CardContent, Typography, Button, Box, Chip } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const ProductCard = ({ product }) => {
  const { name, price, category, image, stock } = product;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={image || 'https://via.placeholder.com/300x200?text=No+Image'}
          alt={name}
        />
        <Chip 
          label={category} 
          size="small" 
          sx={{ position: 'absolute', top: 10, left: 10, bgcolor: 'rgba(255,255,255,0.9)', color: 'primary.main', fontWeight: 600 }} 
        />
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 700, fontSize: '1rem', mb: 1 }}>
          {name}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800 }}>
            ${price.toLocaleString()}
          </Typography>
          <Typography variant="body2" color={stock > 0 ? 'success.main' : 'error.main'} sx={{ fontWeight: 600 }}>
            {stock > 0 ? `${stock} in stock` : 'Out of stock'}
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          fullWidth 
          startIcon={<ShoppingCartIcon />}
          disabled={stock === 0}
          sx={{ borderRadius: 2 }}
        >
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
