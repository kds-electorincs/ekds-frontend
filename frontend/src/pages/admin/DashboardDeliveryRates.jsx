import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Button, Chip, TextField, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, CircularProgress, Alert
} from '@mui/material';
import { Refresh as RefreshIcon, Save as SaveIcon } from '@mui/icons-material';
import { deliveryRatesAdminService } from '../../services/apiServices';
import notification from '../../utils/notification';

const DashboardDeliveryRates = () => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [gujaratRate, setGujaratRate] = useState('');
  const [otherRate, setOtherRate] = useState('');
  const [savingZone, setSavingZone] = useState(null);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await deliveryRatesAdminService.getDeliveryRates();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setRates(list);

      const g = list.find(r => (r.zone || r.deliveryZone) === 'GUJARAT');
      const o = list.find(r => (r.zone || r.deliveryZone) === 'OTHER');

      if (g) setGujaratRate(g.ratePerKgRupees != null ? g.ratePerKgRupees : g.ratePerKg);
      if (o) setOtherRate(o.ratePerKgRupees != null ? o.ratePerKgRupees : o.ratePerKg);
    } catch (err) {
      console.error('Failed to load delivery rates:', err);
      const msg = err?.response?.data?.title || 'Failed to load delivery rates';
      notification.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleUpdateRate = async (zone, value) => {
    const numVal = parseFloat(value);
    if (isNaN(numVal) || numVal < 0 || numVal > 1000) {
      notification.warning('Rate must be between Rs 0.00 and Rs 1000.00 per kg.');
      return;
    }

    setSavingZone(zone);
    try {
      await deliveryRatesAdminService.updateDeliveryRate(zone, numVal);
      notification.success(`Delivery rate for zone ${zone} updated to Rs ${numVal.toFixed(2)}/kg.`);
      await fetchRates();
    } catch (err) {
      console.error('Failed to update rate:', err);
      const data = err?.response?.data;
      notification.error(data?.title || data?.detail || 'Failed to update delivery rate');
    } finally {
      setSavingZone(null);
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
            Delivery Cost Rate Configuration
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Set per-kilogram delivery rates for Gujarat (Intra-State) and Other Indian States (Inter-State).
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchRates} disabled={loading}>
          Refresh
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
        <strong>Configuration Requirement:</strong> Both <code>GUJARAT</code> and <code>OTHER</code> zone rates must be set. If any rate is missing, customer checkout will return <code>503 Delivery Unavailable</code>.
      </Alert>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {/* GUJARAT Zone */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '2px solid #243A5E' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={800} color="primary.main">
                  GUJARAT Zone Rate (Intra-State)
                </Typography>
                <Chip label="State Code 24" color="primary" size="small" sx={{ fontWeight: 700 }} />
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Applies to all shipments where recipient shipping state is Gujarat (`24`). Tax calculated as CGST + SGST.
              </Typography>

              <TextField
                fullWidth
                label="Rate Per Kg (INR Rupees)"
                type="number"
                value={gujaratRate}
                onChange={(e) => setGujaratRate(e.target.value)}
                slotProps={{ htmlInput: { min: 0, max: 1000, step: 0.5 } }}
                helperText="Max limit: Rs 1000.00 / kg"
                sx={{ my: 2 }}
              />

              <Button
                variant="contained"
                color="primary"
                startIcon={savingZone === 'GUJARAT' ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                onClick={() => handleUpdateRate('GUJARAT', gujaratRate)}
                disabled={savingZone === 'GUJARAT'}
                sx={{ px: 4, fontWeight: 800 }}
              >
                Save GUJARAT Rate
              </Button>
            </Paper>
          </Grid>

          {/* OTHER Zone */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '2px solid #5F86A6' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={800} color="primary.main">
                  OTHER Zone Rate (Inter-State)
                </Typography>
                <Chip label="All Other 35 States / UTs" color="secondary" size="small" sx={{ fontWeight: 700 }} />
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Applies to all shipments outside Gujarat across India. Tax calculated as full IGST rate (18%).
              </Typography>

              <TextField
                fullWidth
                label="Rate Per Kg (INR Rupees)"
                type="number"
                value={otherRate}
                onChange={(e) => setOtherRate(e.target.value)}
                slotProps={{ htmlInput: { min: 0, max: 1000, step: 0.5 } }}
                helperText="Max limit: Rs 1000.00 / kg"
                sx={{ my: 2 }}
              />

              <Button
                variant="contained"
                color="secondary"
                startIcon={savingZone === 'OTHER' ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                onClick={() => handleUpdateRate('OTHER', otherRate)}
                disabled={savingZone === 'OTHER'}
                sx={{ px: 4, fontWeight: 800 }}
              >
                Save OTHER Rate
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default DashboardDeliveryRates;
