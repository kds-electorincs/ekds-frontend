"use client";
import React, { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Chip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

import { configAdminService } from '../../../../services/apiServices';
import { toast } from 'react-toastify';

const DashboardCatalogConfig = () => {
  const [packagingTypes, setPackagingTypes] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchConfig = async () => {
      try {
        const [pkgRes, currRes] = await Promise.all([
          configAdminService.getPackagingTypes(),
          configAdminService.getCurrencies()
        ]);
        // handle both axios .data or direct payload
        setPackagingTypes(pkgRes.data || pkgRes || []);
        setCurrencies(currRes.data || currRes || []);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load catalog configurations');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  return (
    <Box sx={{ pb: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 4 }}>
        Catalog Configuration
      </Typography>

      {/* Packaging Types */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Packaging Types</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => toast.error('Create Packaging Type API missing')}>Add Type</Button>
        </Box>
        <TableContainer component={Paper} sx={{ borderRadius: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Display Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {packagingTypes.map(type => (
                <TableRow key={type.id}>
                  <TableCell fontWeight={600}>{type.code}</TableCell>
                  <TableCell>{type.displayName || type.name}</TableCell>
                  <TableCell>
                    <Chip label="Active" color="success" size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="secondary" onClick={() => toast.error('Update Packaging Type API missing')}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => toast.error('Delete Packaging Type API missing')}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Currencies */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Currencies</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => toast.error('Create Currency API missing')}>Add Currency</Button>
        </Box>
        <TableContainer component={Paper} sx={{ borderRadius: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Symbol</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currencies.map(curr => (
                <TableRow key={curr.id}>
                  <TableCell fontWeight={600}>{curr.code}</TableCell>
                  <TableCell>{curr.displayName || curr.name}</TableCell>
                  <TableCell>{curr.symbol || '-'}</TableCell>
                  <TableCell>
                    <Chip label="Active" color="success" size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="secondary" onClick={() => toast.error('Update Currency API missing')}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => toast.error('Delete Currency API missing')}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default DashboardCatalogConfig;
