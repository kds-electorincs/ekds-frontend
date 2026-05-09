import { useState } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, IconButton, 
  TextField, InputAdornment, Avatar, Tooltip 
} from '@mui/material';
import { 
  Add as AddIcon, Search as SearchIcon, 
  Edit as EditIcon, Delete as DeleteIcon, 
  FilterList as FilterListIcon 
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const initialUsers = [
  { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'Admin', status: 'Active', joined: '2023-01-15' },
  { id: 2, name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager', status: 'Active', joined: '2023-03-22' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Staff', status: 'Inactive', joined: '2023-06-10' },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'Customer', status: 'Active', joined: '2023-08-05' },
  { id: 5, name: 'Evan Wright', email: 'evan@example.com', role: 'Customer', status: 'Active', joined: '2023-11-20' },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'Active': return 'success';
    case 'Inactive': return 'error';
    default: return 'default';
  }
};

const getRoleColor = (role) => {
  switch (role) {
    case 'Admin': return 'primary';
    case 'Manager': return 'secondary';
    case 'Staff': return 'info';
    case 'Customer': return 'default';
    default: return 'default';
  }
};

const DashboardUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
            Users
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage roles, permissions, and accounts.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          sx={{ borderRadius: 2, textTransform: 'none', px: 3, py: 1 }}
        >
          Add User
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', gap: 2 }}>
          <TextField
            placeholder="Search users by name or email..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, maxWidth: 400, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button 
            variant="outlined" 
            startIcon={<FilterListIcon />}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Filters
          </Button>
        </Box>
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>User</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Date Joined</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {initialUsers.map((row) => (
                <TableRow key={row.id} sx={{ '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
                  <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                      {row.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.email}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={row.role} 
                      color={getRoleColor(row.role)}
                      size="small"
                      variant={row.role === 'Customer' ? 'outlined' : 'filled'}
                      sx={{ fontWeight: 600, borderRadius: 1.5 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={row.status} 
                      color={getStatusColor(row.status)}
                      size="small"
                      sx={{ fontWeight: 600, borderRadius: 1.5, px: 1 }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{row.joined}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit User">
                      <IconButton size="small" color="primary" sx={{ mr: 1 }} onClick={() => toast.info(`Editing user: ${row.name}`)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete User">
                      <IconButton size="small" color="error" onClick={() => toast.error(`Deleted user: ${row.name}`)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default DashboardUsers;
