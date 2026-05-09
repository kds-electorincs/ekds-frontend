import { useState } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, 
  TextField, InputAdornment, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import { 
  Add as AddIcon, Search as SearchIcon, 
  Edit as EditIcon, Delete as DeleteIcon, 
  FileUpload as FileUploadIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const initialCategories = [
  { id: 1, name: 'Electronics', description: 'Gadgets, devices and accessories', productsCount: 145 },
  { id: 2, name: 'Furniture', description: 'Office and home furniture', productsCount: 56 },
  { id: 3, name: 'Accessories', description: 'Watches, bags, and fashion items', productsCount: 89 },
  { id: 4, name: 'Software', description: 'Digital licenses and software', productsCount: 23 },
  { id: 5, name: 'Office Supplies', description: 'Stationery and office items', productsCount: 310 },
];

const DashboardCategories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setOpenEditModal(true);
  };

  const handleDeleteClick = (category) => {
    setSelectedCategory(category);
    setOpenDeleteModal(true);
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
            Categories
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage product categories and hierarchy.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            color="primary" 
            component="label"
            startIcon={<FileUploadIcon />}
            sx={{ borderRadius: 2, textTransform: 'none', px: 3, py: 1 }}
          >
            Upload CSV
            <input
              type="file"
              hidden
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  toast.success(`Selected file: ${e.target.files[0].name}`);
                }
              }}
            />
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            sx={{ borderRadius: 2, textTransform: 'none', px: 3, py: 1 }}
            onClick={() => setOpenAddModal(true)}
          >
            Add Category
          </Button>
        </Box>
      </Box>

      <Paper sx={{ borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', gap: 2 }}>
          <TextField
            placeholder="Search categories by name..."
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
        </Box>
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Category Name</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Total Products</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {initialCategories.map((row) => (
                <TableRow key={row.id} sx={{ '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
                  <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{row.description}</TableCell>
                  <TableCell>{row.productsCount}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Category">
                      <IconButton size="small" color="primary" sx={{ mr: 1 }} onClick={() => handleEditClick(row)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Category">
                      <IconButton size="small" color="error" onClick={() => handleDeleteClick(row)}>
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

      {/* Add Category Modal */}
      <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add New Category</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField fullWidth label="Category Name" variant="outlined" />
            <TextField fullWidth label="Description" variant="outlined" multiline rows={3} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setOpenAddModal(false)} color="inherit">Cancel</Button>
          <Button 
            onClick={() => {
              toast.success('Category added successfully!');
              setOpenAddModal(false);
            }} 
            variant="contained"
          >
            Save Category
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Category</DialogTitle>
        <DialogContent dividers>
          {selectedCategory && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
              <TextField fullWidth label="Category Name" variant="outlined" defaultValue={selectedCategory.name} />
              <TextField fullWidth label="Description" variant="outlined" multiline rows={3} defaultValue={selectedCategory.description} />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setOpenEditModal(false)} color="inherit">Cancel</Button>
          <Button 
            onClick={() => {
              toast.success('Category updated successfully!');
              setOpenEditModal(false);
            }} 
            variant="contained"
          >
            Update Category
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the category <strong>{selectedCategory?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setOpenDeleteModal(false)} color="inherit">Cancel</Button>
          <Button 
            onClick={() => {
              toast.error('Category deleted!');
              setOpenDeleteModal(false);
            }} 
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardCategories;
