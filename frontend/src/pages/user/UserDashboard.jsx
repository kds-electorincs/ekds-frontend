import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Grid, Paper, Card, CardContent, Button, Link, 
  Divider, Chip, Avatar, Stack 
} from '@mui/material';
import { 
  ShoppingBag as ShoppingBagIcon,
  LocalShipping as LocalShippingIcon,
  Favorite as FavoriteIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Description as QuoteIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as SuccessIcon,
  RotateLeft as ReorderIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderService, productPublicService } from '../../services/apiServices';
import ProductCard from '../../components/ProductCard';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        try {
          const res = await orderService.getUserOrders({ size: 3 });
          const orderList = res?.data?.content || res?.content || res?.data || res || [];
          setOrders(Array.isArray(orderList) ? orderList : []);
        } catch (e) {
          setOrders([]);
        }

        try {
          const prodRes = await productPublicService.listProducts({ size: 4 });
          const prods = prodRes?.data?.content || prodRes?.content || prodRes?.data || [];
          setRecommendedProducts(Array.isArray(prods) ? prods : []);
        } catch (e) {
          setRecommendedProducts([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      
      {/* 1. CUSTOMER WELCOME & PROFILE BANNER */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 3, md: 4 }, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #111B2C 0%, #243A5E 100%)',
          color: '#ffffff',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 3,
          boxShadow: '0 8px 24px rgba(17, 27, 44, 0.15)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Avatar 
            sx={{ 
              width: 64, 
              height: 64, 
              bgcolor: 'secondary.main', 
              color: 'primary.dark',
              fontWeight: 900,
              fontSize: '1.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5 }}>
              Welcome back, {user?.name || user?.fullName || 'Valued Customer'}!
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              {user?.email} • Member Account
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button 
            component={RouterLink}
            to="/user/orders"
            variant="contained"
            size="small"
            startIcon={<ShoppingBagIcon />}
            sx={{ bgcolor: 'secondary.main', color: 'primary.dark', fontWeight: 900, '&:hover': { bgcolor: 'white' } }}
          >
            My Orders
          </Button>
          <Button 
            component={RouterLink}
            to="/user/profile"
            variant="outlined"
            size="small"
            sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', fontWeight: 700, '&:hover': { borderColor: 'white' } }}
          >
            Edit Profile
          </Button>
        </Stack>
      </Paper>

      {/* 2. ACCOUNT QUICK STATS HUB */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper 
            component={RouterLink}
            to="/user/orders"
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              border: '1px solid #E2ECF5',
              textDecoration: 'none',
              display: 'block',
              transition: 'all 0.2s ease',
              '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' }
            }}
          >
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#EDF4FA', color: 'primary.main', width: 'fit-content', mb: 1.5 }}>
              <ShoppingBagIcon />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>{orders.length}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Total Orders</Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper 
            component={RouterLink}
            to="/user/favorites"
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              border: '1px solid #E2ECF5',
              textDecoration: 'none',
              display: 'block',
              transition: 'all 0.2s ease',
              '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' }
            }}
          >
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#FEE2E2', color: 'error.main', width: 'fit-content', mb: 1.5 }}>
              <FavoriteIcon />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>Wishlist</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Saved Products</Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper 
            component={RouterLink}
            to="/user/addresses"
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              border: '1px solid #E2ECF5',
              textDecoration: 'none',
              display: 'block',
              transition: 'all 0.2s ease',
              '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' }
            }}
          >
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#EDF4FA', color: 'primary.main', width: 'fit-content', mb: 1.5 }}>
              <LocationIcon />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>Addresses</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Saved Shipping Locations</Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper 
            component={RouterLink}
            to="/user/quotations"
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              border: '1px solid #E2ECF5',
              textDecoration: 'none',
              display: 'block',
              transition: 'all 0.2s ease',
              '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' }
            }}
          >
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#FEF3C7', color: 'warning.dark', width: 'fit-content', mb: 1.5 }}>
              <QuoteIcon />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>Quotes</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>BOM & Bulk Pricing</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* 3. RECENT ORDERS BLOCK */}
      <Paper elevation={0} sx={{ border: '1px solid #E2ECF5', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 3, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2ECF5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShoppingBagIcon sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>
              Recent Orders
            </Typography>
          </Box>
          <Button component={RouterLink} to="/user/orders" endIcon={<ArrowForwardIcon />} sx={{ fontWeight: 800 }}>
            View Order History
          </Button>
        </Box>

        {orders.length > 0 ? (
          <Box sx={{ p: 3 }}>
            {orders.map((order, idx) => (
              <Box key={order.id || idx} sx={{ p: 2, mb: 2, border: '1px solid #E2ECF5', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    Order #{order.orderNumber || order.id}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                  </Typography>
                </Box>
                <Chip label={order.status || 'PROCESSING'} color="primary" size="small" sx={{ fontWeight: 800 }} />
                <Button component={RouterLink} to={`/orders/${order.orderNumber || order.id}`} variant="outlined" size="small" sx={{ fontWeight: 700 }}>
                  Order Details
                </Button>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ py: 6, px: 3, textAlign: 'center' }}>
            <ShoppingBagIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
              No recent orders found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Browse our electronic parts catalog and place your first order!
            </Typography>
            <Button component={RouterLink} to="/products" variant="contained" color="primary" sx={{ fontWeight: 800, px: 4, borderRadius: 2 }}>
              Start Shopping
            </Button>
          </Box>
        )}
      </Paper>

      {/* 4. RECOMMENDED PRODUCTS FOR YOU */}
      {recommendedProducts.length > 0 && (
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', mb: 3 }}>
            Recommended For Your Account
          </Typography>
          <Grid container spacing={3}>
            {recommendedProducts.map((product, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={product.id || idx}>
                <ProductCard product={product} viewMode="grid" />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

    </Box>
  );
};

export default UserDashboard;
