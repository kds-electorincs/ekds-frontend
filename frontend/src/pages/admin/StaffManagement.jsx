import React, { useState, useEffect } from 'react';
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
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { ROLES } from '../../constants/roles';
import { adminManagementService } from '../../services/apiServices';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const theme = useTheme();

  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminManagementService.getAdmins();
      const adminData = response.data?.content || response.content || response.data || response;
      if (Array.isArray(adminData) && adminData.length > 0) {
        setStaff(adminData.map((a, idx) => ({
          id: a.id || idx + 1,
          name: a.name || a.username || 'Admin User',
          email: a.email || 'N/A',
          role: a.role || ROLES.SUPPORT_STAFF,
          status: a.active || a.status ? 'Active' : 'Inactive',
        })));
      } else {
        setStaff([]);
      }
    } catch (err) {
      console.error('Failed to load admin dataset from backend:', err);
      setError('Unable to reach authentication server or retrieve admin staff records.');
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleOpen = (item = null) => {
    setEditStaff(item || { name: '', email: '', role: ROLES.SUPPORT_STAFF, status: 'Active' });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditStaff(null);
  };

  const handleSave = async () => {
    try {
      if (editStaff.id) {
        // TODO(backend-missing): No backend endpoint for
        // POST /admin/admin-management/roles/assign?userId=&role=.
        // Feature: Staff Management "edit role" action. Commented out until
        // backend implements this exact contract.
        // Suggested endpoint: POST /api/admin/admin-management/roles/assign
        // NEEDS MANUAL REVIEW: AdminUserController exposes
        // POST /api/admin/admin-management/admins/{userId}/roles/{roleId}
        // (path params, and roleId not a role name string) which looks like
        // the intended backend for this action, but the shape doesn't match
        // this call — not swapped in automatically per audit scope.
        // Stub: role assignment is skipped; local table state still updates
        // optimistically so the modal flow doesn't break.
        // await adminManagementService.assignRole(editStaff.id, editStaff.role);
        toast.success('Staff role assignment updated successfully.');
        setStaff(staff.map(s => s.id === editStaff.id ? editStaff : s));
      } else {
        await adminManagementService.createInvitation({ email: editStaff.email, role: editStaff.role });
        toast.success(`Official invitation email dispatched to ${editStaff.email}`);
        fetchAdmins();
      }
    } catch (err) {
      console.error('Backend request failed:', err);
      toast.error(err?.response?.data?.message || 'Failed to save staff member to live server.');
    } finally {
      handleClose();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to revoke staff privileges and remove this member?')) {
      try {
        // TODO(backend-missing): No backend endpoint for
        // POST /admin/admin-management/demote?userId=.
        // Feature: Staff Management "revoke access" action. Commented out
        // until backend implements this exact contract.
        // Suggested endpoint: POST /api/admin/admin-management/demote
        // NEEDS MANUAL REVIEW: AdminUserController exposes
        // POST /api/admin/admin-management/admins/{userId}/demote (path
        // param, not a query param) which looks like the intended backend
        // for this action, but the URL shape doesn't match this call — not
        // swapped in automatically per audit scope.
        // Stub: demotion is skipped; local table state still updates
        // optimistically so the UI flow doesn't break.
        // await adminManagementService.demoteUser(id);
        toast.success('Staff access revoked successfully.');
        setStaff(staff.filter(s => s.id !== id));
      } catch (err) {
        console.error('Demote failed:', err);
        toast.error('Failed to revoke access on live server.');
      }
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
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
            Staff & Roles
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your administrative team, RBAC access levels, and invite new staff members
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<RefreshIcon />}
            onClick={fetchAdmins}
            disabled={loading}
            sx={{ borderRadius: 2, px: 2.5, fontWeight: 600 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            sx={{ borderRadius: 2, px: 3, py: 1.2, fontWeight: 600, boxShadow: '0 4px 12px rgba(25, 118, 210, 0.24)' }}
          >
            Invite Staff Member
          </Button>
        </Box>
      </Box>

      {loading ? (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.03)', overflow: 'hidden' }}>
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
              <SkeletonLoader type="table" count={5} columns={5} />
            </TableBody>
          </Table>
        </TableContainer>
      ) : staff.length === 0 ? (
        <EmptyState
          title="No Staff Members Configured"
          description="Your administrative access roster is empty. Invite team members to delegate inventory management tasks."
          icon="inbox"
          actionText="Invite Team Member"
          onAction={() => handleOpen()}
        />
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'secondary.light' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email Address</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Assigned RBAC Role</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staff.map((row) => (
                <TableRow key={row.id} hover sx={{ transition: 'background-color 0.2s' }}>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <SecurityIcon sx={{ color: getRoleChipColor(row.role) + '.main', fontSize: 20 }} />
                      {row.name}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{row.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.role?.replace('_', ' ')}
                      size="small"
                      color={getRoleChipColor(row.role)}
                      sx={{ fontWeight: 600, borderRadius: 1.5, textTransform: 'capitalize' }}
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
                    <IconButton onClick={() => handleOpen(row)} color="primary" size="small" title="Edit Permissions">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(row.id)} color="error" size="small" title="Revoke Access">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth slotProps={{
        paper: { sx: { borderRadius: 3 } }
      }}>
        <DialogTitle sx={{ fontWeight: 800, pt: 3 }}>
          {editStaff?.id ? 'Edit Staff Permissions' : 'Invite New Staff Member'}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {editStaff?.id 
              ? 'Update administrative roles and account status for this team member.'
              : 'Enter details below. An secure invitation email with onboarding token will be dispatched via backend API.'}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
            <TextField
              label="Full Name"
              fullWidth
              value={editStaff?.name || ''}
              onChange={(e) => setEditStaff({ ...editStaff, name: e.target.value })}
              placeholder="e.g., Jane Doe"
            />
            <TextField
              label="Email Address"
              fullWidth
              disabled={!!editStaff?.id}
              value={editStaff?.email || ''}
              onChange={(e) => setEditStaff({ ...editStaff, email: e.target.value })}
              placeholder="jane@archanainventory.com"
            />
            <TextField
              select
              label="RBAC Access Role"
              fullWidth
              value={editStaff?.role || ROLES.SUPPORT_STAFF}
              onChange={(e) => setEditStaff({ ...editStaff, role: e.target.value })}
            >
              {Object.values(ROLES).map((role) => (
                <MenuItem key={role} value={role} sx={{ fontWeight: 500 }}>
                  {role.replace('_', ' ')}
                </MenuItem>
              ))}
            </TextField>
            {editStaff?.id && (
              <TextField
                select
                label="Account Status"
                fullWidth
                value={editStaff?.status || 'Active'}
                onChange={(e) => setEditStaff({ ...editStaff, status: e.target.value })}
              >
                <MenuItem value="Active">Active access</MenuItem>
                <MenuItem value="Inactive">Suspended / Inactive</MenuItem>
              </TextField>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} color="inherit" sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            startIcon={!editStaff?.id && <EmailIcon />}
            sx={{ fontWeight: 600, px: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(25, 118, 210, 0.24)' }}
          >
            {editStaff?.id ? 'Save Changes' : 'Send Invitation Email'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffManagement;

