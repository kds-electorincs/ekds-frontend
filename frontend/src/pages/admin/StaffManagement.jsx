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
  Checkbox,
  FormGroup,
  FormControlLabel,
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
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';
import { PERMISSIONS } from '../../constants/permissions';
import { adminManagementService } from '../../services/apiServices';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';

const StaffManagement = () => {
  const { user, hasPermission } = useAuth();
  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN || hasPermission(PERMISSIONS.MANAGE_STAFF);

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const theme = useTheme();

  const [rolesList, setRolesList] = useState([]);
  const [invitations, setInvitations] = useState([]);

  // Role Creation modal state
  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [selectedPages, setSelectedPages] = useState(['PRODUCTS', 'CATEGORIES', 'ORDERS']);

  const ADMIN_PAGES_LIST = ['PRODUCTS', 'CATEGORIES', 'ORDERS', 'USERS', 'SUPPORT', 'FINANCE', 'BANNERS', 'REPORTS'];

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      toast.error('Role name is required.');
      return;
    }
    if (selectedPages.length === 0) {
      toast.error('Please select at least one page permission.');
      return;
    }
    try {
      await adminManagementService.createRole({
        name: newRoleName.trim(),
        description: newRoleDesc.trim(),
        pages: selectedPages
      });
      toast.success(`Role "${newRoleName}" created successfully!`);
      setOpenRoleModal(false);
      setNewRoleName('');
      setNewRoleDesc('');
      setSelectedPages(['PRODUCTS', 'CATEGORIES', 'ORDERS']);
      fetchAdmins();
    } catch (err) {
      console.error('Failed to create role:', err);
      toast.error(err?.response?.data?.message || err?.response?.data?.detail || 'Failed to create role.');
    }
  };

  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const [adminRes, roleRes, inviteRes] = await Promise.allSettled([
        adminManagementService.getAdmins(),
        adminManagementService.getRoles(),
        adminManagementService.getInvitations()
      ]);

      if (adminRes.status === 'fulfilled') {
        const adminData = adminRes.value.data?.content || adminRes.value.content || adminRes.value.data || adminRes.value;
        if (Array.isArray(adminData)) {
          setStaff(adminData.map((a) => ({
            id: a.userId || a.id,
            name: a.fullName || a.name || a.email || 'Admin User',
            email: a.email || 'N/A',
            role: a.roles?.[0]?.name || a.role || 'ROLE_ADMIN',
            roles: a.roles || [],
            status: a.enabled !== false ? 'Active' : 'Inactive',
          })));
        }
      }

      if (roleRes.status === 'fulfilled') {
        const rData = roleRes.value.data || roleRes.value;
        if (Array.isArray(rData)) setRolesList(rData);
      }

      if (inviteRes.status === 'fulfilled') {
        const iData = inviteRes.value.data || inviteRes.value;
        if (Array.isArray(iData)) setInvitations(iData);
      }
    } catch (err) {
      console.error('Failed to load admin dataset from backend:', err);
      setError('Unable to reach authentication server or retrieve admin staff records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleOpen = (item = null) => {
    setEditStaff(item || { name: '', email: '', roleId: rolesList[0]?.id || 1, status: 'Active' });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditStaff(null);
  };

  const handleSave = async () => {
    try {
      if (editStaff.id) {
        if (editStaff.roleId) {
          let targetRoleId = editStaff.roleId;
          // If roleId is a string role name (e.g. 'SUPER_ADMIN'), match it in rolesList
          if (typeof targetRoleId === 'string' && isNaN(Number(targetRoleId))) {
            const matched = rolesList.find(r => r.name === targetRoleId || r.name === `ROLE_${targetRoleId}`);
            if (matched) targetRoleId = matched.id;
          }
          await adminManagementService.assignRole(editStaff.id, Number(targetRoleId) || 1);
        }
        toast.success('Staff role assignment updated successfully.');
        fetchAdmins();
      } else {
        let targetRoleId = editStaff.roleId;
        
        // Find numeric ID in rolesList if available
        if (targetRoleId && !isNaN(Number(targetRoleId))) {
          targetRoleId = Number(targetRoleId);
        } else {
          const matched = rolesList.find(r => 
            r.id === targetRoleId ||
            r.name === targetRoleId ||
            r.name === `ROLE_${targetRoleId}` ||
            r.name?.replace('ROLE_', '') === targetRoleId
          );
          if (matched) {
            targetRoleId = matched.id;
          } else if (rolesList.length > 0) {
            targetRoleId = rolesList[0].id;
          } else {
            targetRoleId = null;
          }
        }

        if (!targetRoleId) {
          toast.error('No valid RBAC Admin Role found in database. Please create a role first.');
          return;
        }

        const roleIds = [targetRoleId];
        await adminManagementService.createInvitation({ email: editStaff.email, roleIds });
        toast.success(`Official invitation email dispatched to ${editStaff.email}`);
        fetchAdmins();
      }
    } catch (err) {
      console.error('Backend request failed:', err);
      const backendMessage = err?.response?.data?.detail || err?.response?.data?.message || err?.response?.data?.error || 'Failed to save staff member.';
      toast.error(backendMessage);
    } finally {
      handleClose();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to demote staff member and revoke access?')) {
      try {
        await adminManagementService.demoteUser(id);
        toast.success('Staff access revoked successfully.');
        fetchAdmins();
      } catch (err) {
        console.error('Demote failed:', err);
        toast.error(err?.response?.data?.detail || 'Failed to revoke access on live server.');
      }
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    if (window.confirm('Are you sure you want to cancel this pending invitation?')) {
      try {
        await adminManagementService.cancelInvitation(invitationId);
        toast.success('Invitation cancelled.');
        fetchAdmins();
      } catch (err) {
        toast.error('Failed to cancel invitation.');
      }
    }
  };

  const handleResendInvitation = async (invitationId) => {
    try {
      await adminManagementService.resendInvitation(invitationId);
      toast.success('Invitation email resent successfully.');
      fetchAdmins();
    } catch (err) {
      toast.error('Failed to resend invitation.');
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
            variant="outlined"
            color="secondary"
            startIcon={<SecurityIcon />}
            onClick={() => setOpenRoleModal(true)}
            sx={{ borderRadius: 2, px: 2.5, fontWeight: 600 }}
          >
            + Create RBAC Role
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
              value={editStaff?.roleId || editStaff?.role || (rolesList[0]?.id || ROLES.SUPPORT_STAFF)}
              onChange={(e) => setEditStaff({ ...editStaff, roleId: e.target.value })}
            >
              {rolesList.length > 0
                ? rolesList.map((r) => (
                    <MenuItem key={r.id} value={r.id} sx={{ fontWeight: 500 }}>
                      {r.name} - {r.description || r.code || ''}
                    </MenuItem>
                  ))
                : Object.values(ROLES).map((role) => (
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

      {/* Create Role Modal */}
      <Dialog open={openRoleModal} onClose={() => setOpenRoleModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Create New Admin RBAC Role
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Define a custom administrative access level and assign page-level CRUD permissions.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
            <TextField
              label="Role Name"
              fullWidth
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="e.g., INVENTORY_MANAGER"
              helperText="Must be unique. Example: INVENTORY_MANAGER"
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              placeholder="Brief summary of permissions granted by this role"
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>
              Granted Admin Page Permissions:
            </Typography>
            <FormGroup row sx={{ gap: 1 }}>
              {ADMIN_PAGES_LIST.map((page) => (
                <FormControlLabel
                  key={page}
                  control={
                    <Checkbox
                      checked={selectedPages.includes(page)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPages([...selectedPages, page]);
                        } else {
                          setSelectedPages(selectedPages.filter(p => p !== page));
                        }
                      }}
                    />
                  }
                  label={page}
                />
              ))}
            </FormGroup>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenRoleModal(false)} color="inherit" sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateRole}
            variant="contained"
            color="secondary"
            sx={{ fontWeight: 600, px: 3, borderRadius: 2 }}
          >
            Create Role
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffManagement;

