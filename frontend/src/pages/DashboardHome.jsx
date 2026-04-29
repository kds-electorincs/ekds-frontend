import React from 'react';
import { Typography, Grid, Paper, Box, Card, CardContent } from '@mui/material';

const DashboardHome = () => {
  const stats = [
    { title: 'Total Orders', value: '154', change: '+12% from last week' },
    { title: 'Revenue', value: '$12,450', change: '+5% from last month' },
    { title: 'Pending Quotations', value: '23', change: '-2 from yesterday' },
    { title: 'New Customers', value: '48', change: '+18% from last week' },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: 'primary.main' }}>
        Dashboard Overview
      </Typography>
      
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                  {stat.title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                  {stat.change}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Recent Activity
          </Typography>
          <Typography color="text.secondary">
            No recent activity to display. Start by adding products or processing orders.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default DashboardHome;
