import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, Radio, RadioGroup, FormControlLabel, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, 
  IconButton, Chip, CircularProgress, MenuItem
} from '@mui/material';
import { Add, Home, Business, Edit, Delete, StarBorder } from '@mui/icons-material';
import { userService } from '../../services/apiServices';
import { useAuth } from '../../context/AuthContext';
import notification from '../../utils/notification';
import { GST_STATES, getGSTStateByName } from '../../constants/gstStates';

const AddressManager = ({ onSelectAddress, readOnly = false }) => {
  const [addresses, setAddresses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    label: 'Home',
    line1: '',
    line2: '',
    city: '',
    stateCode: '24', // Default to Gujarat (24)
    country: 'IN',   // Always IN as required by GST Guide §4
    pincode: '',
    phone: '',
    makeDefault: false
  });
  const [submitting, setSubmitting] = useState(false);
  
  const { user, refreshProfile } = useAuth();

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await userService.getAddresses();
      const list = Array.isArray(res) ? res : (res?.content || res?.data || []);
      setAddresses(list);
      
      if (list.length > 0) {
        const defaultAddr = list.find(a => a.isDefault) || list[0];
        const currentSelected = list.find(a => a.id === selected) || defaultAddr;
        setSelected(currentSelected.id);
        if (onSelectAddress) onSelectAddress(currentSelected);
      } else {
        setSelected(null);
        if (onSelectAddress) onSelectAddress(null);
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const handleChange = (event) => {
    const val = Number(event.target.value);
    setSelected(val);
    const addr = addresses.find(a => Number(a.id) === val);
    if (onSelectAddress && addr) {
      onSelectAddress(addr);
    }
  };

  const handleOpenDialog = (addr = null) => {
    if (addr) {
      setEditingId(addr.id);
      let derivedStateCode = addr.stateCode;
      if (!derivedStateCode && addr.state) {
        const match = getGSTStateByName(addr.state);
        if (match) derivedStateCode = match.code;
      }

      setFormData({
        label: addr.label || 'Home',
        line1: addr.line1 || '',
        line2: addr.line2 || '',
        city: addr.city || '',
        stateCode: derivedStateCode || '24',
        country: 'IN', // locked to IN
        pincode: addr.pincode || '',
        phone: addr.phone || '',
        makeDefault: addr.isDefault || false
      });
    } else {
      setEditingId(null);
      setFormData({
        label: 'Home',
        line1: '',
        line2: '',
        city: '',
        stateCode: '24',
        country: 'IN',
        pincode: '',
        phone: '',
        makeDefault: addresses.length === 0
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!formData.line1 || !formData.city || !formData.stateCode || !formData.pincode || !formData.phone) {
      notification.warning('Please fill in all required fields (Address, City, State, Pincode, and Phone).');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        label: formData.label ? formData.label.trim() : 'Home',
        line1: formData.line1.trim(),
        line2: formData.line2 ? formData.line2.trim() : null,
        city: formData.city.trim(),
        stateCode: String(formData.stateCode).padStart(2, '0').trim(),
        country: 'IN',
        pincode: formData.pincode.trim(),
        phone: formData.phone.trim(),
        makeDefault: Boolean(formData.makeDefault)
      };

      if (editingId) {
        await userService.updateAddress(editingId, payload);
        notification.success('Address updated successfully!');
      } else {
        await userService.createAddress(payload);
        notification.success('New address added successfully!');
      }
      handleCloseDialog();
      await fetchAddresses();
      if (refreshProfile) await refreshProfile();
    } catch (err) {
      console.error('Save address error:', err);
      const msg = err?.response?.data?.title || err?.response?.data?.detail || 'Failed to save address';
      notification.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await userService.deleteAddress(id);
      notification.info('Address removed.');
      await fetchAddresses();
      if (refreshProfile) await refreshProfile();
    } catch (err) {
      console.error('Delete address error:', err);
    }
  };

  const handleSetDefault = async (id, e) => {
    e.stopPropagation();
    try {
      await userService.setDefaultAddress(id);
      notification.success('Default address updated.');
      await fetchAddresses();
    } catch (err) {
      console.error('Set default error:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Shipping Addresses</Typography>
        <Button startIcon={<Add />} variant="outlined" size="small" onClick={() => handleOpenDialog()}>
          Add New
        </Button>
      </Box>

      {addresses.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            You have no saved addresses yet. Please add a shipping address to continue.
          </Typography>
          <Button variant="contained" size="small" startIcon={<Add />} onClick={() => handleOpenDialog()} sx={{ mt: 1 }}>
            Add Address
          </Button>
        </Paper>
      ) : (
        <RadioGroup value={selected ?? ''} onChange={handleChange}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {addresses.map((addr) => {
              const stateName = addr.state || GST_STATES.find(s => s.code === addr.stateCode)?.name || addr.stateCode;
              return (
                <Paper 
                  key={addr.id} 
                  elevation={0} 
                  sx={{ 
                    p: 2.5, 
                    border: '1px solid', 
                    borderColor: selected === addr.id ? 'primary.main' : 'divider',
                    bgcolor: selected === addr.id ? 'primary.50' : 'background.paper',
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}
                >
                  <FormControlLabel 
                    value={addr.id} 
                    control={<Radio />} 
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                          {addr.label?.toLowerCase() === 'home' ? <Home fontSize="small" color="action" /> : <Business fontSize="small" color="action" />}
                          <Typography variant="subtitle2" fontWeight={700}>{addr.label || 'Address'}</Typography>
                          {addr.isDefault && <Chip label="Default" size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />}
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {addr.city}, {stateName} ({addr.stateCode}) - {addr.pincode} (India)
                        </Typography>
                        {addr.phone && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Phone: {addr.phone}
                          </Typography>
                        )}
                      </Box>
                    }
                    sx={{ flexGrow: 1, m: 0, alignItems: 'flex-start' }}
                  />
                  {!readOnly && (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {!addr.isDefault && (
                        <IconButton size="small" title="Make Default" onClick={(e) => handleSetDefault(addr.id, e)}>
                          <StarBorder fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton size="small" title="Edit Address" onClick={(e) => { e.stopPropagation(); handleOpenDialog(addr); }}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" title="Delete Address" color="error" onClick={(e) => handleDelete(addr.id, e)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Paper>
              );
            })}
          </Box>
        </RadioGroup>
      )}

      {/* Add/Edit Address Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSaveAddress}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editingId ? 'Edit Shipping Address' : 'Add New Shipping Address'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} sx={{ pt: 1 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="Label (e.g., Home, Office)" name="label" value={formData.label} onChange={handleFormChange} required />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="Phone Number" name="phone" value={formData.phone} onChange={handleFormChange} required />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth size="small" label="Address Line 1" name="line1" value={formData.line1} onChange={handleFormChange} required placeholder="Building, Street, Area" />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth size="small" label="Address Line 2 (Optional)" name="line2" value={formData.line2} onChange={handleFormChange} placeholder="Landmark, Suite" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="City" name="city" value={formData.city} onChange={handleFormChange} required />
              </Grid>

              {/* State Dropdown with 2-digit GST State Code (Section 4 breaking change) */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="State (GST State Code)"
                  name="stateCode"
                  value={formData.stateCode}
                  onChange={handleFormChange}
                  required
                >
                  {GST_STATES.map((s) => (
                    <MenuItem key={s.code} value={s.code}>
                      {s.name} ({s.code})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="Pincode / Zip" name="pincode" value={formData.pincode} onChange={handleFormChange} required />
              </Grid>
              
              {/* Country locked to IN */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="Country" value="India (IN)" disabled helperText="Only IN allowed per GST rules" />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2, px: 3 }}>
            <Button onClick={handleCloseDialog} disabled={submitting}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting} sx={{ px: 3 }}>
              {submitting ? 'Saving...' : 'Save Address'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AddressManager;
