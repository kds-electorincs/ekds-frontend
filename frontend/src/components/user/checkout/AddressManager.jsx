import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import { Add, Home, Business } from '@mui/icons-material';

const dummyAddresses = [];

const AddressManager = ({ onSelectAddress }) => {
  const [selected, setSelected] = useState(dummyAddresses[0]?.id || null);

  const handleChange = (event) => {
    const val = Number(event.target.value);
    setSelected(val);
    if (onSelectAddress) {
      onSelectAddress(dummyAddresses.find(a => a.id === val));
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Select Shipping Address</Typography>
        <Button startIcon={<Add />} variant="outlined" size="small">Add New</Button>
      </Box>

      <RadioGroup value={selected} onChange={handleChange}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {dummyAddresses.map((addr) => (
            <Paper 
              key={addr.id} 
              elevation={0} 
              sx={{ 
                p: 2, 
                border: '1px solid', 
                borderColor: selected === addr.id ? 'primary.main' : 'divider',
                bgcolor: selected === addr.id ? 'primary.50' : 'background.paper',
                borderRadius: 2
              }}
            >
              <FormControlLabel 
                value={addr.id} 
                control={<Radio />} 
                label={
                  <Box sx={{ ml: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      {addr.type === 'Home' ? <Home fontSize="small" color="action" /> : <Business fontSize="small" color="action" />}
                      <Typography variant="subtitle2" fontWeight={700}>{addr.name} ({addr.type})</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {addr.address}, {addr.city}, {addr.state} {addr.zip}, {addr.country}
                    </Typography>
                  </Box>
                }
                sx={{ width: '100%', m: 0, alignItems: 'flex-start' }}
              />
            </Paper>
          ))}
        </Box>
      </RadioGroup>
    </Box>
  );
};

export default AddressManager;
