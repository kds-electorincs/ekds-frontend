import React from 'react';
import { Box, Card, CardContent, Grid, Skeleton, Stack, TableCell, TableRow, Paper, useTheme } from '@mui/material';

/**
 * Reusable UI Shimmer / Skeleton Loader
 * Supports types: 'card' (product cards), 'table' (data rows), 'stat' (dashboard metric cards), 'detail' (product detail page)
 */
const SkeletonLoader = ({ type = 'card', count = 4, columns = 5 }) => {
  const theme = useTheme();
  const items = Array.from({ length: count });

  if (type === 'card') {
    return (
      <Grid container spacing={3}>
        {items.map((_, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
              overflow: 'hidden',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.paper'
            }}>
              <Skeleton variant="rectangular" height={220} animation="wave" />
              <CardContent sx={{ flex: 1, p: 2.5 }}>
                <Skeleton variant="text" width="40%" height={16} sx={{ mb: 1 }} animation="wave" />
                <Skeleton variant="text" width="85%" height={28} sx={{ mb: 1.5 }} animation="wave" />
                <Skeleton variant="text" width="100%" height={18} sx={{ mb: 0.5 }} animation="wave" />
                <Skeleton variant="text" width="60%" height={18} sx={{ mb: 3 }} animation="wave" />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 1 }}>
                  <Skeleton variant="text" width="35%" height={32} animation="wave" />
                  <Skeleton variant="rounded" width={80} height={36} sx={{ borderRadius: 2 }} animation="wave" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (type === 'table') {
    return (
      <>
        {items.map((_, index) => (
          <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            {Array.from({ length: columns }).map((__, colIdx) => (
              <TableCell key={colIdx} sx={{ py: 2 }}>
                {colIdx === 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Skeleton variant="circular" width={36} height={36} animation="wave" />
                    <Skeleton variant="text" width={140} height={20} animation="wave" />
                  </Box>
                ) : colIdx === columns - 1 ? (
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Skeleton variant="circular" width={32} height={32} animation="wave" />
                    <Skeleton variant="circular" width={32} height={32} animation="wave" />
                  </Box>
                ) : (
                  <Skeleton variant="text" width="75%" height={20} animation="wave" />
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </>
    );
  }

  if (type === 'stat') {
    return (
      <Grid container spacing={3}>
        {items.map((_, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Paper sx={{ p: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <Skeleton variant="rounded" width={60} height={60} sx={{ borderRadius: 3 }} animation="wave" />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="50%" height={36} sx={{ mb: 0.5 }} animation="wave" />
                <Skeleton variant="text" width="80%" height={18} animation="wave" />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (type === 'detail') {
    return (
      <Grid container spacing={5} sx={{ py: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton variant="rounded" width="100%" height={450} sx={{ borderRadius: 4, mb: 2 }} animation="wave" />
          <Stack direction="row" spacing={2}>
            {[1, 2, 3, 4].map((idx) => (
              <Skeleton key={idx} variant="rounded" width={90} height={90} sx={{ borderRadius: 2 }} animation="wave" />
            ))}
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} animation="wave" />
          <Skeleton variant="text" width="80%" height={48} sx={{ mb: 2 }} animation="wave" />
          <Skeleton variant="text" width="40%" height={36} sx={{ mb: 4 }} animation="wave" />
          <Stack spacing={1.5} sx={{ mb: 4 }}>
            <Skeleton variant="text" width="100%" height={18} animation="wave" />
            <Skeleton variant="text" width="95%" height={18} animation="wave" />
            <Skeleton variant="text" width="70%" height={18} animation="wave" />
          </Stack>
          <Box sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, mb: 4 }}>
            <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} animation="wave" />
            <Grid container spacing={2}>
              {[1, 2, 3].map((idx) => (
                <Grid size={{ xs: 4 }} key={idx}>
                  <Skeleton variant="rounded" width="100%" height={70} sx={{ borderRadius: 2 }} animation="wave" />
                </Grid>
              ))}
            </Grid>
          </Box>
          <Stack direction="row" spacing={2}>
            <Skeleton variant="rounded" width={140} height={52} sx={{ borderRadius: 3 }} animation="wave" />
            <Skeleton variant="rounded" flex={1} height={52} sx={{ borderRadius: 3, flex: 1 }} animation="wave" />
          </Stack>
        </Grid>
      </Grid>
    );
  }

  return null;
};

export default SkeletonLoader;
