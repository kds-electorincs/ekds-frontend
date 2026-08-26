import React from 'react';
import { Box, Typography, Checkbox, FormControlLabel, FormGroup, Slider, Button, Divider } from '@mui/material';

const FilterPanel = ({ categories, selectedCategories, priceRange, onFilterChange }) => {
  return (
    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Filters
      </Typography>

      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        Categories
      </Typography>
      <FormGroup sx={{ mb: 3 }}>
        {categories.map((cat) => (
          <FormControlLabel 
            key={cat} 
            control={
              <Checkbox 
                size="small" 
                checked={selectedCategories.includes(cat)}
                onChange={(e) => onFilterChange('category', cat, e.target.checked)} 
              />
            } 
            label={cat} 
          />
        ))}
      </FormGroup>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
        Price Range
      </Typography>
      <Box sx={{ px: 1 }}>
        <Slider
          value={priceRange}
          valueLabelDisplay="auto"
          min={0}
          max={5000}
          onChange={(e, value) => onFilterChange('price', value)}
          sx={{ color: 'primary.main' }}
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="caption">${priceRange[0]}</Typography>
        <Typography variant="caption">${priceRange[1]}+</Typography>
      </Box>

      <Button variant="outlined" fullWidth onClick={() => onFilterChange('reset')}>
        Reset Filters
      </Button>
    </Box>
  );
};

export default FilterPanel;
