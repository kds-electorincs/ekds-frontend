import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

const initialLogs = [];

const ActivityLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const theme = useTheme();

  const filteredLogs = initialLogs.filter(log => 
    log.admin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionColor = (action) => {
    if (action.includes('Login')) return 'success';
    if (action.includes('Logout')) return 'default';
    if (action.includes('Update')) return 'primary';
    if (action.includes('Delete')) return 'error';
    return 'info';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
            Admin Activity Logs
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor all administrative actions and security events
          </Typography>
        </Box>
        <TextField
          placeholder="Search logs..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: 2 }
            }
          }}
        />
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'secondary.light' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Admin</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Details</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>IP Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary', fontWeight: 500 }}>
                  No administrative system logs recorded.
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
              <TableRow key={log.id} hover>
                <TableCell sx={{ fontWeight: 500, color: 'text.secondary' }}>{log.timestamp}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{log.admin}</Typography>
                    <Typography variant="caption" color="text.secondary">{log.role.replace('_', ' ')}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={log.action}
                    size="small"
                    color={getActionColor(log.action)}
                    sx={{ fontWeight: 600, borderRadius: 1.5 }}
                  />
                </TableCell>
                <TableCell sx={{ maxWidth: 300 }}>{log.details}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>{log.ip}</TableCell>
              </TableRow>
            )))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ActivityLogs;
