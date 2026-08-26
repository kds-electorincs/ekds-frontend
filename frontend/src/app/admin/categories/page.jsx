"use client";
import { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, 
  TextField, InputAdornment, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, TablePagination, CircularProgress, Chip
} from '@mui/material';
import { 
  Add as AddIcon, Search as SearchIcon, 
  Edit as EditIcon, Delete as DeleteIcon, 
  Visibility as ViewIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useRouter, usePathname, useParams, useSearchParams } from 'next/navigation';

import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { categoryAdminService } from '../../../../services/apiServices';
import ImageUpload from '../../../../components/admin/ImageUpload';

// Validation schema
const categorySchema = yup.object().shape({
  name: yup.string().required('Name is required').max(120, 'Max 120 characters'),
  slug: yup.string().max(140, 'Max 140 characters').nullable().transform((v) => v === '' ? null : v),
  heroImageKey: yup.string().max(512).nullable(),
});

const CDN_BASE = process.env.NEXT_PUBLIC_CDN_BASE_URL || 'https://d1sswqar085ync.cloudfront.net';

const DashboardCategories = () => {
  const router = useRouter();
  
  // Data State
  const [categories, setCategories] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  
  // Modals State
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Forms
  const { control: addControl, handleSubmit: handleAddSubmit, reset: resetAddForm, setError: setAddError, formState: { errors: addErrors, isSubmitting: isAdding } } = useForm({
    resolver: yupResolver(categorySchema),
    defaultValues: { name: '', slug: '', heroImageKey: '' }
  });

  const { control: editControl, handleSubmit: handleEditSubmit, reset: resetEditForm, setError: setEditError, formState: { errors: editErrors, isSubmitting: isEditing } } = useForm({
    resolver: yupResolver(categorySchema),
  });

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0); // Reset to first page on search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await categoryAdminService.listCategories({
        search: debouncedSearch || undefined,
        page,
        size: rowsPerPage,
        sort: 'name,asc'
      });
      // Handle Spring Data Page envelope
      setCategories(response.content || []);
      setTotalElements(response.page?.totalElements || response.totalElements || 0);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, rowsPerPage]);

  useEffect(() => {
    // eslint-disable-next-line
    fetchCategories();
  }, [fetchCategories]);

  // Actions
  const onAddSubmit = async (data) => {
    try {
      await categoryAdminService.createCategory(data);
      toast.success('Category created successfully!');
      setOpenAddModal(false);
      resetAddForm();
      fetchCategories();
    } catch (err) {
      if (err.response?.data?.errors) {
        Object.entries(err.response.data.errors).forEach(([field, msg]) => {
          setAddError(field, { type: 'server', message: msg });
        });
      } else if (err.response?.status === 409) {
        setAddError('slug', { type: 'server', message: 'Slug already exists' });
      }
    }
  };

  const onEditSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        slug: data.slug,
      };
      await categoryAdminService.updateCategory(selectedCategory.id, payload);
      toast.success('Category updated successfully!');
      setOpenEditModal(false);
      fetchCategories();
    } catch (err) {
      if (err.response?.data?.errors) {
        Object.entries(err.response.data.errors).forEach(([field, msg]) => {
          setEditError(field, { type: 'server', message: msg });
        });
      } else if (err.response?.status === 409) {
        setEditError('slug', { type: 'server', message: 'Slug already exists' });
      }
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await categoryAdminService.deleteCategory(selectedCategory.id);
      toast.success('Category deleted successfully!');
      setOpenDeleteModal(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to delete category';
      toast.error(msg);
    }
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
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            sx={{ borderRadius: 2, textTransform: 'none', px: 3, py: 1 }}
            onClick={() => {
              resetAddForm();
              setOpenAddModal(true);
            }}
          >
            Add Category
          </Button>
        </Box>
      </Box>

      <Paper sx={{ borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            placeholder="Search categories by name..."
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
        </Box>
        <TableContainer sx={{ minHeight: 400 }}>
          {loading && categories.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table sx={{ minWidth: 800 }}>
              <TableHead sx={{ bgcolor: 'background.default' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Image</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Slug</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Created Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((row) => (
                  <TableRow key={row.id} sx={{ '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
                    <TableCell>
                      {row.heroImageKey ? (
                        <img 
                          src={`${CDN_BASE}/${row.heroImageKey}`} 
                          alt={row.name} 
                          style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} 
                        />
                      ) : (
                        <Box sx={{ width: 48, height: 48, bgcolor: 'action.hover', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="caption" color="text.secondary">No Img</Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{row.slug}</TableCell>
                    <TableCell>
                      <Chip 
                        icon={row.active ? <CheckCircleIcon /> : <CancelIcon />}
                        label={row.active ? "Active" : "Inactive"} 
                        color={row.active ? "success" : "default"}
                        size="small"
                        variant={row.active ? "contained" : "outlined"}
                      />
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {new Date(row.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton size="small" color="primary" onClick={() => router.push(`/admin/categories/${row.id}`)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Category">
                        <IconButton size="small" color="secondary" onClick={() => {
                          setSelectedCategory(row);
                          resetEditForm({ name: row.name, slug: row.slug });
                          setOpenEditModal(true);
                        }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={row.active ? "Deactivate Category" : "Category is Inactive"}>
                        <span>
                          <IconButton size="small" color="error" disabled={!row.active} onClick={() => {
                            setSelectedCategory(row);
                            setOpenDeleteModal(true);
                          }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {categories.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" color="text.secondary">
                        No categories found matching your search.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Paper>

      {/* Add Category Modal */}
      <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleAddSubmit(onAddSubmit)}>
          <DialogTitle sx={{ fontWeight: 700 }}>Add New Category</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Controller
              name="name"
              control={addControl}
              render={({ field }) => (
                <TextField 
                  {...field} 
                  fullWidth 
                  label="Category Name *" 
                  variant="outlined" 
                  error={!!addErrors.name}
                  helperText={addErrors.name?.message}
                />
              )}
            />
            <Controller
              name="slug"
              control={addControl}
              render={({ field }) => (
                <TextField 
                  {...field} 
                  fullWidth 
                  label="Slug (Auto-generated if empty)" 
                  variant="outlined" 
                  error={!!addErrors.slug}
                  helperText={addErrors.slug?.message}
                />
              )}
            />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>Hero Image</Typography>
              <Controller
                name="heroImageKey"
                control={addControl}
                render={({ field }) => (
                  <ImageUpload 
                    value={field.value} 
                    onChange={field.onChange} 
                    error={!!addErrors.heroImageKey}
                    helperText={addErrors.heroImageKey?.message}
                    purpose="CATEGORY_HERO"
                  />
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, px: 3 }}>
            <Button onClick={() => setOpenAddModal(false)} color="inherit" disabled={isAdding}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isAdding}>
              {isAdding ? <CircularProgress size={24} /> : 'Save Category'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleEditSubmit(onEditSubmit)}>
          <DialogTitle sx={{ fontWeight: 700 }}>Edit Category</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Controller
              name="name"
              control={editControl}
              render={({ field }) => (
                <TextField 
                  {...field} 
                  fullWidth 
                  label="Category Name *" 
                  variant="outlined" 
                  error={!!editErrors.name}
                  helperText={editErrors.name?.message}
                />
              )}
            />
            <Controller
              name="slug"
              control={editControl}
              render={({ field }) => (
                <TextField 
                  {...field} 
                  fullWidth 
                  label="Slug" 
                  variant="outlined" 
                  error={!!editErrors.slug}
                  helperText={editErrors.slug?.message}
                />
              )}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2, px: 3 }}>
            <Button onClick={() => setOpenEditModal(false)} color="inherit" disabled={isEditing}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isEditing}>
              {isEditing ? <CircularProgress size={24} /> : 'Update Category'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete category "{selectedCategory?.name}"?
            <br /><br />
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setOpenDeleteModal(false)} color="inherit">Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardCategories;
