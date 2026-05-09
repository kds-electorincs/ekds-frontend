import { useState } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, IconButton, 
  TextField, InputAdornment, Avatar, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { 
  Add as AddIcon, Search as SearchIcon, 
  Edit as EditIcon, Delete as DeleteIcon, 
  FilterList as FilterListIcon,
  Security as SecurityIcon,
  ManageAccounts as ManageAccountsIcon
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
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openRolesModal, setOpenRolesModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openPermissionsModal, setOpenPermissionsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setOpenEditModal(true);
  };

  const handlePermissionsClick = (user) => {
    setSelectedUser(user);
    setOpenPermissionsModal(true);
  };

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

      {/* Add User Modal */}
      <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add New User</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField fullWidth label="First Name" variant="outlined" />
              <TextField fullWidth label="Last Name" variant="outlined" />
            </Box>
            <TextField fullWidth label="Email Address" variant="outlined" type="email" />
            <TextField fullWidth label="Temporary Password" variant="outlined" type="password" />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select label="Role" defaultValue="Customer">
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Manager">Manager</MenuItem>
                <MenuItem value="Staff">Staff</MenuItem>
                <MenuItem value="Customer">Customer</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setOpenAddModal(false)} color="inherit">Cancel</Button>
          <Button 
            onClick={() => {
              toast.success('User added successfully!');
              setOpenAddModal(false);
            }} 
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
                {['Admin', 'Manager', 'Staff', 'Customer'].map((role) => (
                  <TableRow key={role}>
                    <TableCell sx={{ fontWeight: 600 }}>{role}</TableCell>
                    <TableCell>
                      {role === 'Admin' ? 'Full Access' : role === 'Customer' ? 'Storefront Only' : 'Limited Dashboard'}
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
              <TextField fullWidth label="Full Name" variant="outlined" defaultValue={selectedUser.name} />
              <TextField fullWidth label="Email Address" variant="outlined" type="email" defaultValue={selectedUser.email} />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select label="Role" defaultValue={selectedUser.role}>
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Manager">Manager</MenuItem>
                  <MenuItem value="Staff">Staff</MenuItem>
                  <MenuItem value="Customer">Customer</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select label="Status" defaultValue={selectedUser.status}>
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
            onClick={() => {
              toast.success('User updated successfully!');
              setOpenEditModal(false);
            }} 
            variant="contained"
          >
            Update User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Individual Permissions Modal */}
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
    </Box>
  );
};

export default DashboardUsers;
