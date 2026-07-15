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
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { ROLES } from '../../constants/roles';

const initialStaff = [
  { id: 1, name: 'Jaimeen Vasa', email: 'jaimeen@archana.com', role: ROLES.SUPER_ADMIN, status: 'Active' },
  { id: 2, name: 'Rahul Sharma', email: 'rahul@archana.com', role: ROLES.PRODUCT_MANAGER, status: 'Active' },
  { id: 3, name: 'Sneha Patel', email: 'sneha@archana.com', role: ROLES.SUPPORT_STAFF, status: 'Active' },
  { id: 4, name: 'Amit Gupta', email: 'amit@archana.com', role: ROLES.ORDER_MANAGER, status: 'Inactive' },
];

const StaffManagement = () => {
  const [staff, setStaff] = useState(initialStaff);
  const [open, setOpen] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const theme = useTheme();

  const handleOpen = (item = null) => {
    setEditStaff(item || { name: '', email: '', role: ROLES.SUPPORT_STAFF, status: 'Active' });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditStaff(null);
  };

  const handleSave = () => {
    if (editStaff.id) {
      setStaff(staff.map(s => s.id === editStaff.id ? editStaff : s));
    } else {
      setStaff([...staff, { ...editStaff, id: staff.length + 1 }]);
    }
    handleClose();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this staff member?')) {
      setStaff(staff.filter(s => s.id !== id));
    }
  };

  const getRoleChipColor = (role) => {
    switch (role) {
      case ROLES.SUPER_ADMIN: return 'error';
      case ROLES.PRODUCT_MANAGER: return 'primary';
      case ROLES.SUPPORT_STAFF: return 'info';
      case ROLES.ORDER_MANAGER: return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
            Staff & Roles
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your administrative team and their access levels
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ borderRadius: 2, px: 3, py: 1.2, fontWeight: 600 }}
        >
          Add Staff Member
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'secondary.light' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staff.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell sx={{ fontWeight: 500 }}>{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>
                  <Chip
                    label={row.role.replace('_', ' ')}
                    size="small"
                    color={getRoleChipColor(row.role)}
                    sx={{ fontWeight: 600, borderRadius: 1.5 }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={row.status}
                    size="small"
                    variant="outlined"
                    color={row.status === 'Active' ? 'success' : 'default'}
                    sx={{ fontWeight: 600, borderRadius: 1.5 }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpen(row)} color="primary" size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(row.id)} color="error" size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editStaff?.id ? 'Edit Staff Member' : 'Add New Staff Member'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 1 }}>
            <TextField
              label="Full Name"
              fullWidth
              value={editStaff?.name || ''}
              onChange={(e) => setEditStaff({ ...editStaff, name: e.target.value })}
            />
            <TextField
              label="Email Address"
              fullWidth
              value={editStaff?.email || ''}
              onChange={(e) => setEditStaff({ ...editStaff, email: e.target.value })}
            />
            <TextField
              select
              label="Role"
              fullWidth
              value={editStaff?.role || ROLES.SUPPORT_STAFF}
              onChange={(e) => setEditStaff({ ...editStaff, role: e.target.value })}
            >
              {Object.values(ROLES).map((role) => (
                <MenuItem key={role} value={role}>
                  {role.replace('_', ' ')}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Status"
              fullWidth
              value={editStaff?.status || 'Active'}
              onChange={(e) => setEditStaff({ ...editStaff, status: e.target.value })}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} color="inherit" sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" sx={{ fontWeight: 600, px: 3 }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffManagement;
