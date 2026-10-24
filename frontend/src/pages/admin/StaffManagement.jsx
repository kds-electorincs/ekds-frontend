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
  Tabs,
  Tab,
  Switch,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Alert,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  Email as EmailIcon,
  Send as SendIcon,
  PersonAdd as PersonAddIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  AdminPanelSettings as SuperAdminIcon,
  Assignment as RoleIcon,
  ForwardToInbox as InviteIcon,
  TableChart as MatrixIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';
import { ADMIN_PAGES, ADMIN_PAGE_METADATA } from '../../constants/permissions';
import { adminManagementService } from '../../services/apiServices';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';

const ADMIN_PAGES_LIST = [
  ADMIN_PAGES.PRODUCTS,
  ADMIN_PAGES.CATEGORIES,
  ADMIN_PAGES.ORDERS,
  ADMIN_PAGES.USERS,
  ADMIN_PAGES.FINANCE,
  ADMIN_PAGES.SUPPORT,
  ADMIN_PAGES.BANNERS,
  ADMIN_PAGES.REPORTS,
];

const StaffManagement = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.isSuperAdmin || user?.role === ROLES.SUPER_ADMIN;

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Core RBAC State
  const [adminsList, setAdminsList] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [invitationsList, setInvitationsList] = useState([]);

  // Modals State
  // 1. Invite Staff Modal
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);

  // 2. Create / Edit Role Modal
  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [roleFormName, setRoleFormName] = useState('');
  const [roleFormDesc, setRoleFormDesc] = useState('');
  const [roleFormPages, setRoleFormPages] = useState([]);

  // 3. Manage Admin User Roles Modal
  const [openAdminRolesModal, setOpenAdminRolesModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [roleToAssign, setRoleToAssign] = useState('');

  // 4. Promote User Modal
  const [openPromoteModal, setOpenPromoteModal] = useState(false);
  const [promoteUserId, setPromoteUserId] = useState('');

  // Fetch all RBAC datasets from backend
  const fetchAllRbacData = async () => {
    setRefreshing(true);
    try {
      const [adminsRes, rolesRes, invitesRes] = await Promise.allSettled([
        adminManagementService.getAdmins(),
        adminManagementService.getRoles(),
        adminManagementService.getInvitations(),
      ]);

      if (adminsRes.status === 'fulfilled') {
        const rawAdmins = adminsRes.value.data || adminsRes.value || [];
        setAdminsList(Array.isArray(rawAdmins) ? rawAdmins : []);
      } else {
        console.error('Failed to load admins:', adminsRes.reason);
      }

      if (rolesRes.status === 'fulfilled') {
        const rawRoles = rolesRes.value.data || rolesRes.value || [];
        setRolesList(Array.isArray(rawRoles) ? rawRoles : []);
      } else {
        console.error('Failed to load roles:', rolesRes.reason);
      }

      if (invitesRes.status === 'fulfilled') {
        const rawInvites = invitesRes.value.data || invitesRes.value || [];
        setInvitationsList(Array.isArray(rawInvites) ? rawInvites : []);
      } else {
        console.error('Failed to load invitations:', invitesRes.reason);
      }
    } catch (err) {
      console.error('RBAC dataset fetch failed:', err);
      toast.error('Failed to communicate with authentication server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllRbacData();
  }, []);

  // =========================================================================
  // Role CRUD Handlers
  // =========================================================================
  const handleOpenCreateRole = () => {
    setEditingRoleId(null);
    setRoleFormName('');
    setRoleFormDesc('');
    setRoleFormPages(['PRODUCTS', 'CATEGORIES', 'ORDERS']);
    setOpenRoleModal(true);
  };

  const handleOpenEditRole = (role) => {
    setEditingRoleId(role.id);
    setRoleFormName(role.name || '');
    setRoleFormDesc(role.description || '');
    setRoleFormPages(Array.isArray(role.pages) ? [...role.pages] : []);
    setOpenRoleModal(true);
  };

  const handleSaveRole = async () => {
    if (!roleFormName.trim()) {
      toast.error('Role name is required (2-64 characters)');
      return;
    }
    if (roleFormPages.length === 0) {
      toast.error('Please select at least one granted AdminPage');
      return;
    }

    try {
      if (editingRoleId) {
        // PATCH /api/admin/admin-management/roles/{id}
        await adminManagementService.updateRole(editingRoleId, {
          name: roleFormName.trim(),
          description: roleFormDesc.trim(),
          pages: roleFormPages,
        });
        toast.success(`Role "${roleFormName}" updated successfully`);
      } else {
        // POST /api/admin/admin-management/roles
        await adminManagementService.createRole({
          name: roleFormName.trim(),
          description: roleFormDesc.trim(),
          pages: roleFormPages,
        });
        toast.success(`Role "${roleFormName}" created successfully`);
      }
      setOpenRoleModal(false);
      fetchAllRbacData();
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Failed to save role';
      toast.error(msg);
    }
  };

  const handleDeleteRole = async (role) => {
    if (!window.confirm(`Are you sure you want to delete role "${role.name}"? This will revoke it from all staff currently holding it.`)) {
      return;
    }
    try {
      await adminManagementService.deleteRole(role.id);
      toast.success(`Role "${role.name}" deleted`);
      fetchAllRbacData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete role');
    }
  };

  // =========================================================================
  // Invitation Handlers
  // =========================================================================
  const handleOpenInvite = () => {
    setInviteEmail('');
    setSelectedRoleIds(rolesList.length > 0 ? [rolesList[0].id] : []);
    setOpenInviteModal(true);
  };

  const handleSendInvitation = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (selectedRoleIds.length === 0) {
      toast.error('Please attach at least one RBAC role to this invitation');
      return;
    }

    try {
      await adminManagementService.createInvitation({
        email: inviteEmail.trim(),
        roleIds: selectedRoleIds,
      });
      toast.success(`Invitation dispatched to ${inviteEmail}`);
      setOpenInviteModal(false);
      fetchAllRbacData();
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Failed to dispatch invitation';
      toast.error(msg);
    }
  };

  const handleResendInvitation = async (invitationId) => {
    try {
      await adminManagementService.resendInvitation(invitationId);
      toast.success('Invitation refreshed and resent with fresh token');
      fetchAllRbacData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to resend invitation');
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    if (!window.confirm('Cancel this pending invitation?')) return;
    try {
      await adminManagementService.cancelInvitation(invitationId);
      toast.success('Invitation cancelled');
      fetchAllRbacData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to cancel invitation');
    }
  };

  // =========================================================================
  // Admin User Role Assignment & Demote & Status Handlers
  // =========================================================================
  const handleOpenManageRoles = (adminUser) => {
    setSelectedAdmin(adminUser);
    setRoleToAssign(rolesList[0]?.id || '');
    setOpenAdminRolesModal(true);
  };

  const handleAssignRoleToAdmin = async () => {
    if (!selectedAdmin || !roleToAssign) return;
    try {
      const res = await adminManagementService.assignRole(selectedAdmin.id, Number(roleToAssign));
      toast.success('Role assigned successfully');
      setSelectedAdmin(res.data || res);
      fetchAllRbacData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to assign role');
    }
  };

  const handleRevokeRoleFromAdmin = async (roleId) => {
    if (!selectedAdmin) return;
    try {
      await adminManagementService.revokeRole(selectedAdmin.id, roleId);
      toast.success('Role revoked');
      const updatedRoles = (selectedAdmin.assignedRoles || []).filter(r => r.id !== roleId);
      setSelectedAdmin({ ...selectedAdmin, assignedRoles: updatedRoles });
      fetchAllRbacData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to revoke role');
    }
  };

  const handleToggleUserEnabled = async (adminUser) => {
    const newStatus = !adminUser.enabled;
    try {
      await adminManagementService.setUserEnabled(adminUser.id, newStatus);
      toast.success(`Account for ${adminUser.fullName || adminUser.email} is now ${newStatus ? 'Enabled' : 'Disabled'}`);
      fetchAllRbacData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to change account status');
    }
  };

  const handleDemoteAdmin = async (adminUser) => {
    if (adminUser.superAdmin) {
      toast.error('Cannot demote a Super Admin');
      return;
    }
    if (!window.confirm(`Revoke all administrative access for ${adminUser.fullName || adminUser.email}? They will be converted to a regular customer.`)) {
      return;
    }
    try {
      await adminManagementService.demoteUser(adminUser.id);
      toast.success('Admin privileges revoked');
      fetchAllRbacData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to revoke admin privileges');
    }
  };

  const handlePromoteUser = async () => {
    const idNum = Number(promoteUserId.trim());
    if (!idNum || isNaN(idNum)) {
      toast.error('Please enter a valid numeric User ID');
      return;
    }
    try {
      await adminManagementService.promoteUser(idNum);
      toast.success(`User #${idNum} promoted to Administrator`);
      setOpenPromoteModal(false);
      setPromoteUserId('');
      fetchAllRbacData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to promote user');
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Top Header & Metrics */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <SuperAdminIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.5px' }}>
              Role-Based Access Control (RBAC)
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Manage administrative staff, configure custom security roles, and monitor onboarding invitations.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<RefreshIcon />}
            onClick={fetchAllRbacData}
            disabled={refreshing}
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>

          {isSuperAdmin && (
            <>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<PersonAddIcon />}
                onClick={() => setOpenPromoteModal(true)}
                sx={{ borderRadius: 2, fontWeight: 600 }}
              >
                Promote User
              </Button>

              <Button
                variant="outlined"
                color="primary"
                startIcon={<RoleIcon />}
                onClick={handleOpenCreateRole}
                sx={{ borderRadius: 2, fontWeight: 600 }}
              >
                New Role
              </Button>

              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={handleOpenInvite}
                sx={{ borderRadius: 2, px: 2.5, fontWeight: 700, boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)' }}
              >
                Invite Admin
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Active Admins
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mt: 0.5 }}>
                    {adminsList.length}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'primary.light', color: 'primary.main', display: 'flex' }}>
                  <SuperAdminIcon fontSize="medium" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Configured Roles
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'secondary.main', mt: 0.5 }}>
                    {rolesList.length}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: '#f3e8ff', color: 'secondary.main', display: 'flex' }}>
                  <RoleIcon fontSize="medium" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Pending Invitations
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#f59e0b', mt: 0.5 }}>
                    {invitationsList.filter(i => i.status === 'PENDING').length}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: '#fef3c7', color: '#b45309', display: 'flex' }}>
                  <InviteIcon fontSize="medium" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs Navigation */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 3, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2, bgcolor: 'background.paper' }}
        >
          <Tab icon={<SuperAdminIcon />} iconPosition="start" label={`Admin Staff (${adminsList.length})`} sx={{ fontWeight: 700, textTransform: 'none', py: 2 }} />
          <Tab icon={<RoleIcon />} iconPosition="start" label={`RBAC Roles (${rolesList.length})`} sx={{ fontWeight: 700, textTransform: 'none', py: 2 }} />
          <Tab icon={<InviteIcon />} iconPosition="start" label={`Invitations (${invitationsList.length})`} sx={{ fontWeight: 700, textTransform: 'none', py: 2 }} />
          <Tab icon={<MatrixIcon />} iconPosition="start" label="Permissions Matrix" sx={{ fontWeight: 700, textTransform: 'none', py: 2 }} />
        </Tabs>

        {/* =========================================================================
            TAB 0: ADMIN STAFF DIRECTORY
           ========================================================================= */}
        {activeTab === 0 && (
          <Box sx={{ p: 2.5 }}>
            {loading ? (
              <SkeletonLoader type="table" count={5} columns={6} />
            ) : adminsList.length === 0 ? (
              <EmptyState
                title="No Administrators Found"
                description="No users with ROLE_ADMIN are currently registered in the database."
                icon="inbox"
                actionText="Invite Admin"
                onAction={handleOpenInvite}
              />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: 'secondary.light' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>User / Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Authority</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Assigned RBAC Roles</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Account Status</TableCell>
                      {isSuperAdmin && <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {adminsList.map((admin) => (
                      <TableRow key={admin.id} hover>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>
                          #{admin.id}
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {admin.fullName || 'Admin User'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {admin.email}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          {admin.superAdmin ? (
                            <Chip
                              icon={<SuperAdminIcon sx={{ fontSize: '1rem !important' }} />}
                              label="SUPER ADMIN"
                              size="small"
                              sx={{
                                fontWeight: 800,
                                bgcolor: '#fef3c7',
                                color: '#92400e',
                                border: '1px solid #fde68a',
                                fontSize: '0.72rem',
                              }}
                            />
                          ) : (
                            <Chip
                              label="ADMIN"
                              size="small"
                              sx={{
                                fontWeight: 700,
                                bgcolor: '#e0f2fe',
                                color: '#0369a1',
                                border: '1px solid #bae6fd',
                                fontSize: '0.72rem',
                              }}
                            />
                          )}
                        </TableCell>

                        <TableCell>
                          {admin.superAdmin ? (
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                              All pages granted implicitly
                            </Typography>
                          ) : (admin.assignedRoles && admin.assignedRoles.length > 0) ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                              {admin.assignedRoles.map((r) => (
                                <Tooltip key={r.id} title={`Granted on ${new Date(r.grantedAt).toLocaleDateString()}`}>
                                  <Chip
                                    label={r.name}
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                    sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                                  />
                                </Tooltip>
                              ))}
                            </Box>
                          ) : (
                            <Chip label="No Roles Assigned" size="small" variant="outlined" color="default" sx={{ fontSize: '0.7rem' }} />
                          )}
                        </TableCell>

                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {isSuperAdmin && !admin.superAdmin ? (
                              <Switch
                                size="small"
                                checked={admin.enabled}
                                onChange={() => handleToggleUserEnabled(admin)}
                                color="success"
                              />
                            ) : null}
                            <Chip
                              label={admin.enabled ? 'Enabled' : 'Disabled'}
                              size="small"
                              color={admin.enabled ? 'success' : 'error'}
                              variant="outlined"
                              sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                            />
                          </Box>
                        </TableCell>

                        {isSuperAdmin && (
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                              {!admin.superAdmin && (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<RoleIcon />}
                                  onClick={() => handleOpenManageRoles(admin)}
                                  sx={{ fontWeight: 600, textTransform: 'none', borderRadius: 1.5, py: 0.3 }}
                                >
                                  Manage Roles
                                </Button>
                              )}

                              {!admin.superAdmin && (
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  startIcon={<BlockIcon />}
                                  onClick={() => handleDemoteAdmin(admin)}
                                  sx={{ fontWeight: 600, textTransform: 'none', borderRadius: 1.5, py: 0.3 }}
                                >
                                  Demote
                                </Button>
                              )}
                            </Box>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* =========================================================================
            TAB 1: RBAC ROLES DIRECTORY
           ========================================================================= */}
        {activeTab === 1 && (
          <Box sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Custom Role Definitions & Page-Level Grants
              </Typography>
              {isSuperAdmin && (
                <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleOpenCreateRole} sx={{ borderRadius: 1.5, fontWeight: 600 }}>
                  Create Role
                </Button>
              )}
            </Box>

            {loading ? (
              <SkeletonLoader type="table" count={4} columns={5} />
            ) : rolesList.length === 0 ? (
              <EmptyState
                title="No Custom Roles Defined"
                description="Create roles containing bundles of AdminPages (such as Catalog Manager or Order Fulfillment) to assign to staff."
                icon="inbox"
                actionText="Create Role"
                onAction={handleOpenCreateRole}
              />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: 'secondary.light' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Role Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Granted AdminPages</TableCell>
                      {isSuperAdmin && <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rolesList.map((role) => (
                      <TableRow key={role.id} hover>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>#{role.id}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>{role.name}</TableCell>
                        <TableCell sx={{ color: 'text.secondary', maxWidth: 300 }}>{role.description || '—'}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                            {(role.pages || []).map((page) => (
                              <Chip
                                key={page}
                                label={page}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  fontSize: '0.7rem',
                                  bgcolor: '#f1f5f9',
                                  color: '#334155',
                                  border: '1px solid #cbd5e1',
                                }}
                              />
                            ))}
                          </Box>
                        </TableCell>
                        {isSuperAdmin && (
                          <TableCell align="right">
                            <IconButton size="small" color="primary" onClick={() => handleOpenEditRole(role)} title="Edit Role">
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDeleteRole(role)} title="Delete Role">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* =========================================================================
            TAB 2: INVITATIONS & ONBOARDING
           ========================================================================= */}
        {activeTab === 2 && (
          <Box sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Staff Invitations & Email Dispatch Log
              </Typography>
              {isSuperAdmin && (
                <Button variant="contained" size="small" startIcon={<SendIcon />} onClick={handleOpenInvite} sx={{ borderRadius: 1.5, fontWeight: 600 }}>
                  Send Invitation
                </Button>
              )}
            </Box>

            {loading ? (
              <SkeletonLoader type="table" count={4} columns={6} />
            ) : invitationsList.length === 0 ? (
              <EmptyState
                title="No Invitations Sent"
                description="Send secure email invitations with pre-attached roles to onboard new administrators."
                icon="inbox"
                actionText="Invite Admin"
                onAction={handleOpenInvite}
              />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: 'secondary.light' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Invitee Email</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Target Roles</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Sent At</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Expires At</TableCell>
                      {isSuperAdmin && <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invitationsList.map((inv) => (
                      <TableRow key={inv.id} hover>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>#{inv.id}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>{inv.email}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(inv.roles || []).map((r) => (
                              <Chip key={r.id} label={r.name} size="small" variant="outlined" color="primary" sx={{ fontSize: '0.7rem', fontWeight: 600 }} />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={inv.status}
                            size="small"
                            color={
                              inv.status === 'ACCEPTED'
                                ? 'success'
                                : inv.status === 'PENDING'
                                ? 'warning'
                                : 'default'
                            }
                            sx={{ fontWeight: 800, fontSize: '0.72rem' }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                          {inv.createdAt ? new Date(inv.createdAt).toLocaleString() : '—'}
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                          {inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString() : '—'}
                        </TableCell>
                        {isSuperAdmin && (
                          <TableCell align="right">
                            {inv.status === 'PENDING' && (
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleResendInvitation(inv.id)}
                                  sx={{ textTransform: 'none', py: 0.2, fontWeight: 600 }}
                                >
                                  Resend
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  onClick={() => handleCancelInvitation(inv.id)}
                                  sx={{ textTransform: 'none', py: 0.2, fontWeight: 600 }}
                                >
                                  Cancel
                                </Button>
                              </Box>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* =========================================================================
            TAB 3: PERMISSIONS MATRIX & AUDIT
           ========================================================================= */}
        {activeTab === 3 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              Backend AdminPage Architecture & Role Grant Matrix
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Every admin controller method in Spring Boot carries a <code>@PreAuthorize("@adminPageGuard.canAccess('PAGE')")</code> check.
              Super Admins implicitly hold all pages. Regular Admins only pass when assigned a role containing the page.
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mb: 4 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'secondary.light' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>Role Name</TableCell>
                    {ADMIN_PAGES_LIST.map((p) => (
                      <TableCell key={p} align="center" sx={{ fontWeight: 800, fontSize: '0.75rem' }}>
                        {p}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow sx={{ bgcolor: '#fffbeb' }}>
                    <TableCell sx={{ fontWeight: 800, color: '#92400e' }}>
                      SUPER ADMIN (Implicit)
                    </TableCell>
                    {ADMIN_PAGES_LIST.map((p) => (
                      <TableCell key={p} align="center">
                        <CheckCircleIcon sx={{ color: '#059669', fontSize: 18 }} />
                      </TableCell>
                    ))}
                  </TableRow>
                  {rolesList.map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell sx={{ fontWeight: 700 }}>{r.name}</TableCell>
                      {ADMIN_PAGES_LIST.map((p) => (
                        <TableCell key={p} align="center">
                          {r.pages?.includes(p) ? (
                            <CheckCircleIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                          ) : (
                            <Typography variant="caption" sx={{ color: 'text.disabled' }}>—</Typography>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>
              AdminPage Endpoint Mapping Reference
            </Typography>
            <Grid container spacing={2}>
              {ADMIN_PAGES_LIST.map((pageKey) => {
                const meta = ADMIN_PAGE_METADATA[pageKey] || {};
                return (
                  <Grid key={pageKey} size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card variant="outlined" sx={{ height: '100%', borderRadius: 2, p: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                          {pageKey}
                        </Typography>
                        <Chip label={meta.label} size="small" sx={{ fontSize: '0.65rem', fontWeight: 600 }} />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        {meta.description}
                      </Typography>
                      <Box sx={{ mt: 'auto' }}>
                        {(meta.endpoints || []).map((ep, i) => (
                          <Typography key={i} variant="caption" sx={{ display: 'block', fontFamily: 'monospace', color: 'text.secondary', fontSize: '0.68rem' }}>
                            {ep}
                          </Typography>
                        ))}
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}
      </Paper>

      {/* =========================================================================
          MODAL 1: CREATE / EDIT ROLE DIALOG
         ========================================================================= */}
      <Dialog open={openRoleModal} onClose={() => setOpenRoleModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editingRoleId ? 'Edit RBAC Role' : 'Create New RBAC Role'}
          <IconButton size="small" onClick={() => setOpenRoleModal(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Configure a named administrative role and select which backend AdminPages are granted.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Role Name"
              required
              fullWidth
              value={roleFormName}
              onChange={(e) => setRoleFormName(e.target.value)}
              placeholder="e.g., Catalog Manager"
              helperText="Must be unique (2-64 characters)"
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={roleFormDesc}
              onChange={(e) => setRoleFormDesc(e.target.value)}
              placeholder="e.g., Can manage categories, products, and catalog configurations"
            />

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                Granted AdminPage Permissions:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setRoleFormPages([...ADMIN_PAGES_LIST])}
                  sx={{ textTransform: 'none', py: 0.2, fontSize: '0.75rem' }}
                >
                  Select All
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  onClick={() => setRoleFormPages([])}
                  sx={{ textTransform: 'none', py: 0.2, fontSize: '0.75rem' }}
                >
                  Clear All
                </Button>
              </Box>

              <FormGroup>
                <Grid container spacing={1}>
                  {ADMIN_PAGES_LIST.map((pageKey) => {
                    const isChecked = roleFormPages.includes(pageKey);
                    const meta = ADMIN_PAGE_METADATA[pageKey] || {};
                    return (
                      <Grid key={pageKey} size={{ xs: 12, sm: 6 }}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 1,
                            borderRadius: 2,
                            borderColor: isChecked ? 'primary.main' : 'divider',
                            bgcolor: isChecked ? '#eff6ff' : 'background.paper',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <FormControlLabel
                            sx={{ m: 0, width: '100%' }}
                            control={
                              <Checkbox
                                size="small"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setRoleFormPages([...roleFormPages, pageKey]);
                                  } else {
                                    setRoleFormPages(roleFormPages.filter(p => p !== pageKey));
                                  }
                                }}
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                  {pageKey}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.68rem' }}>
                                  {meta.label}
                                </Typography>
                              </Box>
                            }
                          />
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </FormGroup>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenRoleModal(false)} color="inherit" sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button onClick={handleSaveRole} variant="contained" sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}>
            {editingRoleId ? 'Save Changes' : 'Create Role'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* =========================================================================
          MODAL 2: INVITE NEW STAFF MEMBER DIALOG
         ========================================================================= */}
      <Dialog open={openInviteModal} onClose={() => setOpenInviteModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Invite Administrator
          <IconButton size="small" onClick={() => setOpenInviteModal(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Enter the staff member's email address and select the RBAC roles they will receive upon accepting their invitation.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Email Address"
              required
              fullWidth
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="staff@archanainventory.com"
            />

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Select RBAC Roles to Attach:
              </Typography>
              {rolesList.length === 0 ? (
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  No roles exist in the database yet. Please create an RBAC role first.
                </Alert>
              ) : (
                <FormGroup>
                  <Grid container spacing={1}>
                    {rolesList.map((r) => {
                      const isChecked = selectedRoleIds.includes(r.id);
                      return (
                        <Grid key={r.id} size={{ xs: 12 }}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1.2,
                              borderRadius: 2,
                              borderColor: isChecked ? 'primary.main' : 'divider',
                              bgcolor: isChecked ? '#eff6ff' : 'background.paper',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <FormControlLabel
                              sx={{ m: 0, width: '100%' }}
                              control={
                                <Checkbox
                                  size="small"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedRoleIds([...selectedRoleIds, r.id]);
                                    } else {
                                      setSelectedRoleIds(selectedRoleIds.filter(id => id !== r.id));
                                    }
                                  }}
                                />
                              }
                              label={
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                    {r.name}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {r.description || `Pages: ${(r.pages || []).join(', ')}`}
                                  </Typography>
                                </Box>
                              }
                            />
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                </FormGroup>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenInviteModal(false)} color="inherit" sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={handleSendInvitation}
            variant="contained"
            startIcon={<SendIcon />}
            disabled={rolesList.length === 0}
            sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}
          >
            Send Invitation
          </Button>
        </DialogActions>
      </Dialog>

      {/* =========================================================================
          MODAL 3: MANAGE ADMIN USER ROLES DIALOG
         ========================================================================= */}
      <Dialog open={openAdminRolesModal} onClose={() => setOpenAdminRolesModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Manage Roles for {selectedAdmin?.fullName || selectedAdmin?.email}
          <IconButton size="small" onClick={() => setOpenAdminRolesModal(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Assign or revoke individual RBAC roles for this administrator.
          </Typography>

          {/* Currently Assigned Roles List */}
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
            Currently Assigned Roles:
          </Typography>
          {(!selectedAdmin?.assignedRoles || selectedAdmin.assignedRoles.length === 0) ? (
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              This administrator currently has no explicitly assigned RBAC roles.
            </Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
              {selectedAdmin.assignedRoles.map((r) => (
                <Paper
                  key={r.id}
                  variant="outlined"
                  sx={{ p: 1.5, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {r.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Granted on: {new Date(r.grantedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() => handleRevokeRoleFromAdmin(r.id)}
                    sx={{ textTransform: 'none', py: 0.2, fontWeight: 600 }}
                  >
                    Revoke
                  </Button>
                </Paper>
              ))}
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Assign New Role Picker */}
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
            Assign Another Role:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <TextField
              select
              label="Select Role"
              fullWidth
              size="small"
              value={roleToAssign}
              onChange={(e) => setRoleToAssign(e.target.value)}
            >
              {rolesList.map((r) => {
                const alreadyAssigned = (selectedAdmin?.assignedRoles || []).some(ar => ar.id === r.id);
                return (
                  <MenuItem key={r.id} value={r.id} disabled={alreadyAssigned}>
                    {r.name} {alreadyAssigned ? '(Already Assigned)' : ''}
                  </MenuItem>
                );
              })}
            </TextField>
            <Button
              variant="contained"
              onClick={handleAssignRoleToAdmin}
              disabled={!roleToAssign}
              sx={{ fontWeight: 700, borderRadius: 2, whiteSpace: 'nowrap', py: 1 }}
            >
              Assign
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenAdminRolesModal(false)} variant="outlined" sx={{ fontWeight: 600 }}>
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* =========================================================================
          MODAL 4: PROMOTE CUSTOMER TO ADMIN DIALOG
         ========================================================================= */}
      <Dialog open={openPromoteModal} onClose={() => setOpenPromoteModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Promote User to Admin</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Enter the User ID of a registered customer to grant them <code>ROLE_ADMIN</code>.
            Once promoted, you can assign them RBAC roles.
          </Typography>
          <TextField
            label="User ID"
            fullWidth
            type="number"
            value={promoteUserId}
            onChange={(e) => setPromoteUserId(e.target.value)}
            placeholder="e.g., 5"
            helperText="The user's numeric database identifier"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenPromoteModal(false)} color="inherit" sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button onClick={handlePromoteUser} variant="contained" sx={{ fontWeight: 700, borderRadius: 2, px: 2.5 }}>
            Promote to Admin
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffManagement;
