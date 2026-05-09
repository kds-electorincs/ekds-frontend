import React from 'react';
import { Typography, Button, Box, Grid, Paper, Card, CardContent } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Home = () => {
  return (
    <Box>
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ color: 'primary.main', fontWeight: 800 }}>
          KDS B2B Inventory Management
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
          Streamline your wholesale operations with our advanced inventory and e-commerce system. Manage products, track orders, and grow your business with ARCHANA.
        </Typography>
        <Button
          variant="contained"
          size="large"
          component={RouterLink}
          to="/products"
          sx={{ py: 1.5, px: 6, fontSize: '1.1rem' }}
        >
          Explore Products
        </Button>
      </Box>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        {[
          { title: 'Real-time Inventory', desc: 'Track your stock levels across multiple warehouses with ease.' },
          { title: 'Wholesale Pricing', desc: 'Manage tiered pricing and quantity discounts for your B2B clients.' },
          { title: 'Order Tracking', desc: 'Follow every order from placement to final delivery seamlessly.' }
        ].map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom color="primary.main">
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">
                  {feature.desc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Home;
