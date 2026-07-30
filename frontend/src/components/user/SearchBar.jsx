import React from 'react';
import { Paper, InputBase, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = ({ placeholder = "Search products, orders...", onSearch }) => {
  return (
    <Paper
      component="form"
      sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '100%', maxWidth: 400, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
    >
      <InputBase
        sx={{ ml: 1, flex: 1, px: 1 }}
        placeholder={placeholder}
        onChange={(e) => onSearch && onSearch(e.target.value)}
      />
      <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
        <SearchIcon />
      </IconButton>
    </Paper>
  );
};

export default SearchBar;
