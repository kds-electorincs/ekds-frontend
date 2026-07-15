import React from 'react';
import { Card, CardMedia, CardContent, Typography, Button, Box, Chip } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

const ProductCard = ({ product }) => {
  const { name, price, category, image, stock } = product;
  const { addToCart, setIsCartOpen } = useCart();
  const { formatPrice } = useCurrency();

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      transition: 'transform 0.2s, box-shadow 0.2s', 
      '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
      '&:focus-within': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 }
    }}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=500'}
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
            {formatPrice(price)}
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
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation(); // Stops routing navigation
            addToCart(product, 1);
            setIsCartOpen(true);
          }}
        >
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
