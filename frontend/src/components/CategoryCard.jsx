import React from 'react';
import { Card, CardContent, Typography, Box, CardActionArea } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const CategoryCard = ({ category }) => {
  const { name, icon, count, path } = category;

  return (
    <Card sx={{ height: '100%', borderRadius: 4, transition: 'all 0.3s', '&:hover': { transform: 'scale(1.05)', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' } }}>
      <CardActionArea component={RouterLink} to={path || '#'}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Box sx={{ fontSize: '3rem', mb: 2, color: 'primary.main' }}>
            {icon}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {count} Products
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default CategoryCard;
