import { useState } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, IconButton, 
  TextField, InputAdornment, Avatar, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
  Tabs, Tab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import SecurityIcon from '@mui/icons-material/Security';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { toast } from 'react-toastify';

const initialUsers = [];
const initialPendingB2B = [];

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
    case 'B2B Customer': return 'warning';
    case 'Customer': return 'default';
    default: return 'default';
  }
};

const DashboardUsers = () => {
  const [users, setUsers] = useState(initialUsers);
  const [pendingB2B, setPendingB2B] = useState(initialPendingB2B);
  
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openRolesModal, setOpenRolesModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openPermissionsModal, setOpenPermissionsModal] = useState(false);
  const [openB2BModal, setOpenB2BModal] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedB2B, setSelectedB2B] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');

  // Form States
  const [addForm, setAddForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'Customer' });
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'Customer', status: 'Active' });

  // Filtering Logic
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term) || u.role.toLowerCase().includes(term);
  });

  const filteredB2B = pendingB2B.filter((b) => {
    const term = searchTerm.toLowerCase();
    return b.companyName.toLowerCase().includes(term) || b.gstin.toLowerCase().includes(term) || b.representative.toLowerCase().includes(term);
  });

  // Handlers
  const handleAddUser = () => {
    if (!addForm.firstName || !addForm.lastName || !addForm.email) {
      toast.error('Please fill in First Name, Last Name, and Email');
      return;
    }
    const newUser = {
      id: Date.now(),
      name: `${addForm.firstName} ${addForm.lastName}`,
      email: addForm.email,
      role: addForm.role,
      status: 'Active',
      joined: new Date().toISOString().split('T')[0]
    };
    setUsers(prev => [...prev, newUser]);
    setOpenAddModal(false);
    setAddForm({ firstName: '', lastName: '', email: '', password: '', role: 'Customer' });
    toast.success('User added successfully!');
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setOpenEditModal(true);
  };

  const handleUpdateUser = () => {
    if (!editForm.name || !editForm.email) {
      toast.error('Please fill in Name and Email');
      return;
    }
    setUsers(prev => prev.map(u => {
      if (u.id === selectedUser.id) {
        return {
          ...u,
          name: editForm.name,
          email: editForm.email,
          role: editForm.role,
          status: editForm.status
        };
      }
      return u;
    }));
    setOpenEditModal(false);
    toast.success('User updated successfully!');
  };

  const handleDeleteUser = (user) => {
    setUsers(prev => prev.filter(u => u.id !== user.id));
    toast.error(`Deleted user: ${user.name}`);
  };

  const handlePermissionsClick = (user) => {
    setSelectedUser(user);
    setOpenPermissionsModal(true);
  };

  const handleApproveB2B = () => {
    if (!selectedB2B) return;
    
    const newUser = {
      id: Date.now(),
      name: selectedB2B.representative,
      email: selectedB2B.email,
      role: 'B2B Customer',
      status: 'Active',
      joined: new Date().toISOString().split('T')[0]
    };
    
    setUsers(prev => [...prev, newUser]);
    setPendingB2B(prev => prev.filter(item => item.id !== selectedB2B.id));
    setOpenB2BModal(false);
    setVerificationNotes('');
    toast.success(`Approved ${selectedB2B.companyName} as a B2B Customer!`);
  };

  const handleRejectB2B = () => {
    if (!selectedB2B) return;
    
    setPendingB2B(prev => prev.filter(item => item.id !== selectedB2B.id));
    setOpenB2BModal(false);
    setVerificationNotes('');
    toast.warning(`Rejected B2B registration for ${selectedB2B.companyName}. Reason: ${verificationNotes || 'Invalid documents'}`);
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
            Users
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage roles, permissions, accounts, and B2B corporate verification queues.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            color="secondary" 
            startIcon={<SecurityIcon />}
            sx={{ borderRadius: 2, textTransform: 'none', px: 3, py: 1 }}
            onClick={() => setOpenRolesModal(true)}
          >
            Manage Roles
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            sx={{ borderRadius: 2, textTransform: 'none', px: 3, py: 1 }}
            onClick={() => setOpenAddModal(true)}
          >
            Add User
          </Button>
        </Box>
      </Box>

      <Paper sx={{ borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs value={activeTab} onChange={(e, val) => { setActiveTab(val); setSearchTerm(''); }} aria-label="user management tabs">
            <Tab label="All Users" sx={{ textTransform: 'none', fontWeight: 600 }} />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  B2B Verification Queue
                  {pendingB2B.length > 0 && (
                    <Chip label={pendingB2B.length} size="small" color="warning" sx={{ height: 20, fontSize: '0.75rem', fontWeight: 700 }} />
                  )}
                </Box>
              } 
              sx={{ textTransform: 'none', fontWeight: 600 }} 
            />
          </Tabs>
        </Box>
        
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', gap: 2 }}>
          <TextField
            placeholder={activeTab === 0 ? "Search users by name or email..." : "Search pending B2B by company or GSTIN..."}
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, maxWidth: 400, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }
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

        {activeTab === 0 ? (
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
                {filteredUsers.map((row) => (
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
                      <Tooltip title="Manage Permissions">
                        <IconButton size="small" color="secondary" sx={{ mr: 1 }} onClick={() => handlePermissionsClick(row)}>
                          <ManageAccountsIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit User">
                        <IconButton size="small" color="primary" sx={{ mr: 1 }} onClick={() => handleEditClick(row)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User">
                        <IconButton size="small" color="error" onClick={() => handleDeleteUser(row)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" color="text.secondary">No users found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <TableHead sx={{ bgcolor: 'background.default' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Company</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>GSTIN / TAX ID</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Representative</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Submitted Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredB2B.map((row) => (
                  <TableRow key={row.id} sx={{ '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.companyName}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.constitution}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>{row.gstin}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.representative}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.email}</Typography>
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{row.submittedAt}</TableCell>
                    <TableCell align="right">
                      <Button 
                        variant="contained" 
                        color="secondary" 
                        size="small"
                        startIcon={<AssignmentTurnedInIcon />}
                        sx={{ borderRadius: 1.5, textTransform: 'none' }}
                        onClick={() => {
                          setSelectedB2B(row);
                          setVerificationNotes('');
                          setOpenB2BModal(true);
                        }}
                      >
                        Review & Audit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredB2B.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" color="text.secondary">No pending B2B verifications.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add User Modal */}
      <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add New User</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                fullWidth 
                label="First Name" 
                variant="outlined" 
                value={addForm.firstName} 
                onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })} 
              />
              <TextField 
                fullWidth 
                label="Last Name" 
                variant="outlined" 
                value={addForm.lastName} 
                onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })} 
              />
            </Box>
            <TextField 
              fullWidth 
              label="Email Address" 
              variant="outlined" 
              type="email" 
              value={addForm.email} 
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} 
            />
            <TextField 
              fullWidth 
              label="Temporary Password" 
              variant="outlined" 
              type="password" 
              value={addForm.password} 
              onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} 
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select 
                label="Role" 
                value={addForm.role} 
                onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
              >
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Manager">Manager</MenuItem>
                <MenuItem value="Staff">Staff</MenuItem>
                <MenuItem value="B2B Customer">B2B Customer</MenuItem>
                <MenuItem value="Customer">Customer</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setOpenAddModal(false)} color="inherit">Cancel</Button>
          <Button 
            onClick={handleAddUser} 
            variant="contained"
          >
            Save User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Roles Modal */}
      <Dialog open={openRolesModal} onClose={() => setOpenRolesModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Manage Roles & Permissions</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Configure default permissions for each system role.
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Role Name</TableCell>
                  <TableCell>Access Level</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {['Admin', 'Manager', 'Staff', 'B2B Customer', 'Customer'].map((role) => (
                  <TableRow key={role}>
                    <TableCell sx={{ fontWeight: 600 }}>{role}</TableCell>
                    <TableCell>
                      {role === 'Admin' ? 'Full Access' : role === 'Customer' ? 'Storefront Only' : role === 'B2B Customer' ? 'Wholesale Pricing Storefront' : 'Limited Dashboard'}
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="outlined" onClick={() => {
                        handlePermissionsClick({ name: `${role} Default Permissions`, role: role });
                        setOpenRolesModal(false);
                      }}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setOpenRolesModal(false)} color="inherit">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit User</DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
              <TextField 
                fullWidth 
                label="Full Name" 
                variant="outlined" 
                value={editForm.name} 
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} 
              />
              <TextField 
                fullWidth 
                label="Email Address" 
                variant="outlined" 
                type="email" 
                value={editForm.email} 
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} 
              />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select 
                  label="Role" 
                  value={editForm.role} 
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                >
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Manager">Manager</MenuItem>
                  <MenuItem value="Staff">Staff</MenuItem>
                  <MenuItem value="B2B Customer">B2B Customer</MenuItem>
                  <MenuItem value="Customer">Customer</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select 
                  label="Status" 
                  value={editForm.status} 
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setOpenEditModal(false)} color="inherit">Cancel</Button>
          <Button 
            onClick={handleUpdateUser} 
            variant="contained"
          >
            Update User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Custom Permissions Modal */}
      <Dialog open={openPermissionsModal} onClose={() => setOpenPermissionsModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Custom Permissions</DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Override default role permissions for <strong>{selectedUser.name}</strong>.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">View Reports</Typography>
                  <Button size="small" variant="contained" color="success">Granted</Button>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Manage Inventory</Typography>
                  <Button size="small" variant="outlined" color="error">Denied</Button>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Manage Users</Typography>
                  <Button size="small" variant="outlined" color="error">Denied</Button>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setOpenPermissionsModal(false)} color="inherit">Cancel</Button>
          <Button 
            onClick={() => {
              toast.success('Permissions updated successfully!');
              setOpenPermissionsModal(false);
            }} 
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* B2B Application Review Modal with GST Mock Certificate */}
      <Dialog open={openB2BModal} onClose={() => setOpenB2BModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Verify B2B Business Registration</DialogTitle>
        <DialogContent dividers>
          {selectedB2B && (
            <Box sx={{ display: 'flex', flexDirection: 'column', pt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Verify the submitted tax certificates and registry details against official records.
              </Typography>

              {/* Government Certificate Mock Preview */}
              <Box sx={{ 
                border: '2px double #243A5E', 
                p: 3, 
                borderRadius: 2, 
                bgcolor: '#FAF8F5', 
                mb: 3, 
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)',
                fontFamily: 'serif' 
              }}>
                <Box sx={{ textAlign: 'center', mb: 2, borderBottom: '1px solid #243A5E', pb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#243A5E', textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: 'sans-serif' }}>
                    Government of India
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1a3038', mt: 0.5, fontFamily: 'sans-serif' }}>
                    Form GST REG-06
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontStyle: 'italic' }}>
                    [See Rule 10(1)]
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main', mt: 1, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: 'sans-serif' }}>
                    Registration Certificate
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: 1.5, fontSize: '0.875rem' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontFamily: 'sans-serif' }}>Registration Number:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>{selectedB2B.gstin}</Typography>

                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontFamily: 'sans-serif' }}>Legal Name of Business:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedB2B.companyName}</Typography>

                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontFamily: 'sans-serif' }}>Constitution of Business:</Typography>
                  <Typography variant="body2">{selectedB2B.constitution}</Typography>

                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontFamily: 'sans-serif' }}>Registered Address:</Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.4 }}>{selectedB2B.address}</Typography>

                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontFamily: 'sans-serif' }}>Representative User:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedB2B.representative} ({selectedB2B.email})</Typography>

                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontFamily: 'sans-serif' }}>Verification Status:</Typography>
                  <Typography variant="body2">
                    <Chip label="PROVISIONAL / ACTIVE" color="success" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.75rem', fontWeight: 700 }} />
                  </Typography>
                </Box>

                <Box sx={{ mt: 3, pt: 2, borderTop: '1px dashed #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontFamily: 'sans-serif' }}>Date of Issue</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedB2B.submittedAt}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontFamily: 'sans-serif' }}>Validation Authority</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main', fontFamily: 'sans-serif' }}>GST SYSTEM INDIA - DIGITALLY SECURED</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Feedback and audit options */}
              <TextField
                fullWidth
                label="Audit Verification Notes / Comments"
                placeholder="Specify audit remarks, e.g. GSTIN verified successfully, or rejection reason if rejecting..."
                multiline
                rows={3}
                variant="outlined"
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                sx={{ mb: 1 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3, justifyContent: 'space-between' }}>
          <Button onClick={() => setOpenB2BModal(false)} color="inherit">Cancel</Button>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button 
              onClick={handleRejectB2B} 
              variant="outlined" 
              color="error"
            >
              Reject Application
            </Button>
            <Button 
              onClick={handleApproveB2B} 
              variant="contained" 
              color="success"
            >
              Approve & Promote to B2B
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardUsers;
