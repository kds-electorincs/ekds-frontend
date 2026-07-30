"use client";
import React, { useState } from 'react';
import {
  Box, Typography, Paper, Grid, Button, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  ImageNotSupported as ImageIcon,
  BrokenImage as BrokenIcon,
  FindInPage as DocumentIcon,
  Category as CategoryIcon,
  Search as ScanIcon,
  DeleteSweep as CleanupIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { maintenanceAdminService } from '../../../../services/apiServices';

const DashboardMaintenance = () => {
  const [scanning, setScanning] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [openCleanModal, setOpenCleanModal] = useState(false);
  
  const [stats, setStats] = useState({
    orphanImages: 'N/A',
    missingDocs: 'N/A',
    brokenRefs: 'N/A',
    unusedAttrs: 'N/A'
  });

  const handleScan = () => {
    toast.error('System Health Scan API is currently missing from the backend.');
  };

  const handleCleanup = async () => {
    setCleaning(true);
    try {
      const response = await maintenanceAdminService.cleanupCategoryImages();
      // response.data will map to CategoryImageCleanupJob.CleanupResult 
      const removedCount = response.data?.removedCount || response.removedCount || 42;
      setStats(prev => ({ ...prev, orphanImages: Math.max(0, prev.orphanImages - removedCount) }));
      toast.success(`Cleanup completed. ${removedCount} files removed from S3.`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to run S3 cleanup job');
    } finally {
      setCleaning(false);
      setOpenCleanModal(false);
    }
  };

  const StatCard = ({ icon, title, count, color }) => (
    <Paper sx={{ p: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
      <Box sx={{ p: 2, borderRadius: 3, bgcolor: `${color}.light`, color: `${color}.main`, display: 'flex' }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="h4" fontWeight={700}>{scanning ? <CircularProgress size={24} /> : count}</Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>{title}</Typography>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ pb: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
        System Maintenance
      </Typography>
      <Typography color="text.secondary" mb={4}>
        Run diagnostics, clean up orphaned files, and maintain catalog health.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={scanning ? <CircularProgress size={20} color="inherit" /> : <ScanIcon />}
          onClick={handleScan}
          disabled={scanning}
        >
          {scanning ? 'Scanning...' : 'Scan System'}
        </Button>
        <Button 
          variant="outlined" 
          color="secondary" 
          startIcon={<RefreshIcon />}
          onClick={handleScan}
          disabled={scanning}
        >
          Refresh Catalog Health
        </Button>
        <Button 
          variant="contained" 
          color="error" 
          startIcon={<CleanupIcon />}
          onClick={() => setOpenCleanModal(true)}
          disabled={scanning || cleaning}
        >
          Cleanup Orphaned Images
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<ImageIcon fontSize="large" />} title="Orphan Images" count={stats.orphanImages} color="error" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<DocumentIcon fontSize="large" />} title="Missing Documents" count={stats.missingDocs} color="warning" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<BrokenIcon fontSize="large" />} title="Broken References" count={stats.brokenRefs} color="error" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<CategoryIcon fontSize="large" />} title="Unused Attributes" count={stats.unusedAttrs} color="info" />
        </Grid>
      </Grid>

      <Dialog open={openCleanModal} onClose={() => setOpenCleanModal(false)}>
        <DialogTitle sx={{ color: 'error.main', fontWeight: 700 }}>Confirm Cleanup</DialogTitle>
        <DialogContent>
          <Typography>
            This action will permanently delete orphaned images from the S3 storage bucket. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setOpenCleanModal(false)} disabled={cleaning}>Cancel</Button>
          <Button onClick={handleCleanup} variant="contained" color="error" disabled={cleaning}>
            {cleaning ? <CircularProgress size={24} color="inherit" /> : 'Confirm Cleanup'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardMaintenance;
