import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, CircularProgress, Chip, Breadcrumbs, Link,
  TextField, FormControlLabel, Switch, MenuItem, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon, Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon, Cancel as CancelIcon, ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { categoryAdminService, attributeAdminService, segmentAdminService } from '../../services/apiServices';
import ImageUpload from '../../components/admin/ImageUpload';

// Category Validation schema
const categorySchema = yup.object().shape({
  name: yup.string().required('Name is required').max(120, 'Max 120 characters'),
  slug: yup.string().max(140, 'Max 140 characters').nullable().transform((v) => v === '' ? null : v),
  active: yup.boolean()
});

// Segment Validation schema
const segmentSchema = yup.object().shape({
  name: yup.string().required('Name is required').max(120),
  description: yup.string().nullable(),
  displayOrder: yup.number().integer().default(0)
});

// Attribute Validation schema
const attributeSchema = yup.object().shape({
  attrKey: yup.string().required('Attribute Key is required').max(120, 'Max 120 characters'),
  datatype: yup.string().max(16, 'Max 16 chars'),
  unit: yup.string().max(32, 'Max 32 chars').nullable(),
  filterable: yup.boolean(),
  searchable: yup.boolean(),
  required: yup.boolean(),
  displayOrder: yup.number().typeError('Must be a number').integer().nullable(),
  enumValues: yup.array().of(
    yup.object().shape({
      value: yup.string().required('Value is required')
    })
  ).nullable()
});

const CDN_BASE = import.meta.env.VITE_CDN_BASE_URL || 'https://d1sswqar085ync.cloudfront.net';

const DashboardCategoryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [openEditCatModal, setOpenEditCatModal] = useState(false);
  const [openAddSegModal, setOpenAddSegModal] = useState(false);
  const [openEditSegModal, setOpenEditSegModal] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState(null);

  const [openAddAttrModal, setOpenAddAttrModal] = useState(false);
  const [openEditAttrModal, setOpenEditAttrModal] = useState(false);
  const [openDeleteAttrModal, setOpenDeleteAttrModal] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState(null);

  // Forms
  const { control: editCatControl, handleSubmit: handleEditCatSubmit, reset: resetEditCatForm, setError: setEditCatError, formState: { errors: editCatErrors, isSubmitting: isEditingCat } } = useForm({
    resolver: yupResolver(categorySchema),
  });

  const { control: segControl, handleSubmit: handleSegSubmit, reset: resetSegForm, formState: { errors: segErrors, isSubmitting: isSubmittingSeg } } = useForm({
    resolver: yupResolver(segmentSchema),
    defaultValues: { name: '', description: '', displayOrder: 0 }
  });

  const { control: attrControl, handleSubmit: handleAttrSubmit, reset: resetAttrForm, watch: watchAttr, formState: { errors: attrErrors, isSubmitting: isSubmittingAttr } } = useForm({
    resolver: yupResolver(attributeSchema),
    defaultValues: { attrKey: '', datatype: 'TEXT', unit: '', filterable: false, searchable: false, required: false, displayOrder: 0, enumValues: [] }
  });

  const { fields: enumFields, append: appendEnum, remove: removeEnum } = useFieldArray({
    control: attrControl,
    name: "enumValues"
  });

  const attrDatatype = watchAttr('datatype');

  const fetchCategory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await categoryAdminService.getCategory(id);
      setCategory(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load category details');
      navigate('/admin/categories');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchCategory();
  }, [fetchCategory]);

  // --- Category Handlers ---
  const onEditCatSubmit = async (data) => {
    try {
      await categoryAdminService.updateCategory(id, data);
      toast.success('Category updated successfully!');
      setOpenEditCatModal(false);
      fetchCategory();
    } catch (err) {
      toast.error('Failed to update category');
    }
  };

  const openEditCategory = () => {
    resetEditCatForm({
      name: category.name,
      slug: category.slug,
      active: category.active
    });
    setOpenEditCatModal(true);
  };

  const handleHeroImageUpload = async (objectKey) => {
    try {
      await categoryAdminService.updateCategory(id, { heroImageKey: objectKey || null });
      toast.success(objectKey ? 'Hero image updated successfully!' : 'Hero image removed!');
      fetchCategory();
    } catch (err) {
      toast.error('Failed to update category hero image');
    }
  };

  // --- Segment Handlers ---
  const onSegSubmit = async (data) => {
    try {
      if (selectedSegment) {
        await segmentAdminService.updateSegment(id, selectedSegment.id, data);
        toast.success('Segment updated!');
        setOpenEditSegModal(false);
      } else {
        await segmentAdminService.createSegment(id, data);
        toast.success('Segment created!');
        setOpenAddSegModal(false);
      }
      fetchCategory();
    } catch (err) {
      toast.error('Failed to save segment');
    }
  };

  const handleDeleteSegment = async (segId) => {
    if(window.confirm("Are you sure you want to delete this segment?")) {
      try {
        await segmentAdminService.deleteSegment(id, segId);
        toast.success('Segment deleted!');
        fetchCategory();
      } catch (err) {
        toast.error('Failed to delete segment');
      }
    }
  };

  // --- Attribute Handlers ---
  const onAttrSubmit = async (data) => {
    try {
      if (selectedAttribute) {
        await attributeAdminService.updateAttribute(id, selectedSegment.id, selectedAttribute.id, data);
        toast.success('Attribute updated!');
        setOpenEditAttrModal(false);
      } else {
        await attributeAdminService.createAttribute(id, selectedSegment.id, data);
        toast.success('Attribute created!');
        setOpenAddAttrModal(false);
      }
      fetchCategory();
    } catch (err) {
      toast.error('Failed to save attribute');
    }
  };

  const handleDeleteAttrConfirm = async () => {
    try {
      await attributeAdminService.deleteAttribute(id, selectedSegment.id, selectedAttribute.id);
      toast.success('Attribute deactivated!');
      setOpenDeleteAttrModal(false);
      fetchCategory();
    } catch (err) {
      toast.error('Failed to deactivate attribute');
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <CircularProgress />
    </Box>
  );

  if (!category) return null;

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link underline="hover" color="inherit" onClick={() => navigate('/admin/categories')} sx={{ cursor: 'pointer' }}>
            Categories
          </Link>
          <Typography color="text.primary">{category.name}</Typography>
        </Breadcrumbs>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/admin/categories')} color="primary">
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {category.name}
            </Typography>
            <Chip 
              icon={category.active ? <CheckCircleIcon /> : <CancelIcon />}
              label={category.active ? "Active" : "Inactive"} 
              color={category.active ? "success" : "default"}
              size="small" variant={category.active ? "contained" : "outlined"}
            />
          </Box>
          <Button variant="outlined" color="primary" startIcon={<EditIcon />} onClick={openEditCategory}>
            Edit Category
          </Button>
        </Box>
      </Box>

      {/* Overview Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3, mb: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Hero Image</Typography>
          <ImageUpload 
            value={category.heroImageKey} 
            onChange={handleHeroImageUpload} 
            purpose="CATEGORY_HERO"
          />
        </Paper>
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Category Details</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Name</Typography>
              <Typography variant="body1" fontWeight={500}>{category.name}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Slug</Typography>
              <Typography variant="body1" fontWeight={500}>{category.slug || 'N/A'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Description</Typography>
              <Typography variant="body1" fontWeight={500}>{category.description || 'N/A'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Parent Category</Typography>
              <Typography variant="body1" fontWeight={500}>{category.parentCategory?.name || 'None'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Status</Typography>
              <Typography variant="body1" fontWeight={500}>{category.active ? 'Active' : 'Inactive'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Total Segments</Typography>
              <Typography variant="body1" fontWeight={500}>{category.segments?.length || 0}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Created Date</Typography>
              <Typography variant="body1" fontWeight={500}>{category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Updated Date</Typography>
              <Typography variant="body1" fontWeight={500}>{category.updatedAt ? new Date(category.updatedAt).toLocaleDateString() : 'N/A'}</Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Segments Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Segments & Attributes</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => {
          setSelectedSegment(null);
          resetSegForm({ name: '', description: '', displayOrder: 0 });
          setOpenAddSegModal(true);
        }}>
          Add Segment
        </Button>
      </Box>

      {(!category.segments || category.segments.length === 0) ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
          <Typography color="text.secondary">No segments found. Create a segment to add attributes.</Typography>
        </Paper>
      ) : (
        category.segments.map(segment => (
          <Accordion key={segment.id} sx={{ mb: 2, borderRadius: '8px !important', '&:before': { display: 'none' }, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: 'background.default', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pr: 2, alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>{segment.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{segment.description || 'No description'} • {segment.attributes?.length || 0} Attributes</Typography>
                </Box>
                <Box>
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); setSelectedSegment(segment); resetSegForm(segment); setOpenEditSegModal(true); }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDeleteSegment(segment.id); }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => {
                  setSelectedSegment(segment);
                  setSelectedAttribute(null);
                  resetAttrForm({ attrKey: '', datatype: 'TEXT', unit: '', filterable: false, searchable: false, required: false, displayOrder: 0, enumValues: [] });
                  setOpenAddAttrModal(true);
                }}>
                  Add Attribute
                </Button>
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Key</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Unit</TableCell>
                      <TableCell>Req/Search/Filt</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(segment.attributes || []).map(attr => (
                      <TableRow key={attr.id}>
                        <TableCell fontWeight={600}>{attr.attrKey}</TableCell>
                        <TableCell>{attr.datatype}</TableCell>
                        <TableCell>{attr.unit || '-'}</TableCell>
                        <TableCell>
                          {attr.required && <Chip size="small" label="R" color="error" sx={{mr:0.5}} />}
                          {attr.searchable && <Chip size="small" label="S" color="primary" sx={{mr:0.5}} />}
                          {attr.filterable && <Chip size="small" label="F" color="info" />}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" color="secondary" onClick={() => {
                            setSelectedSegment(segment);
                            setSelectedAttribute(attr);
                            resetAttrForm(attr);
                            setOpenEditAttrModal(true);
                          }}><EditIcon fontSize="small" /></IconButton>
                          <IconButton size="small" color="error" disabled={!attr.active} onClick={() => {
                            setSelectedSegment(segment);
                            setSelectedAttribute(attr);
                            setOpenDeleteAttrModal(true);
                          }}><DeleteIcon fontSize="small" /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!segment.attributes || segment.attributes.length === 0) && (
                      <TableRow><TableCell colSpan={5} align="center">No attributes in this segment.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        ))
      )}

      {/* Edit Category Modal */}
      <Dialog open={openEditCatModal} onClose={() => setOpenEditCatModal(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleEditCatSubmit(onEditCatSubmit)}>
          <DialogTitle sx={{ fontWeight: 700 }}>Edit Category</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Controller name="active" control={editCatControl} render={({ field: { value, onChange, ...field } }) => (
                <FormControlLabel control={<Switch checked={value} onChange={onChange} color="primary" {...field} />} label={value ? "Active" : "Inactive"} />
            )} />
            <Controller name="name" control={editCatControl} render={({ field }) => (
                <TextField {...field} fullWidth label="Category Name *" variant="outlined" error={!!editCatErrors.name} helperText={editCatErrors.name?.message} />
            )} />
            <Controller name="slug" control={editCatControl} render={({ field }) => (
                <TextField {...field} fullWidth label="Slug" variant="outlined" error={!!editCatErrors.slug} helperText={editCatErrors.slug?.message} />
            )} />
          </DialogContent>
          <DialogActions sx={{ p: 2, px: 3 }}>
            <Button onClick={() => setOpenEditCatModal(false)} disabled={isEditingCat}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isEditingCat}>Update</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Segment Modal */}
      <Dialog open={openAddSegModal || openEditSegModal} onClose={() => { setOpenAddSegModal(false); setOpenEditSegModal(false); }} maxWidth="sm" fullWidth>
        <form onSubmit={handleSegSubmit(onSegSubmit)}>
          <DialogTitle sx={{ fontWeight: 700 }}>{selectedSegment ? 'Edit Segment' : 'Add Segment'}</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Controller name="name" control={segControl} render={({ field }) => (
                <TextField {...field} fullWidth label="Segment Name *" error={!!segErrors.name} helperText={segErrors.name?.message} />
            )} />
            <Controller name="description" control={segControl} render={({ field }) => (
                <TextField {...field} fullWidth label="Description" multiline rows={2} />
            )} />
            <Controller name="displayOrder" control={segControl} render={({ field }) => (
                <TextField {...field} fullWidth type="number" label="Display Order" />
            )} />
          </DialogContent>
          <DialogActions sx={{ p: 2, px: 3 }}>
            <Button onClick={() => { setOpenAddSegModal(false); setOpenEditSegModal(false); }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isSubmittingSeg}>Save</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Attribute Modal */}
      <Dialog open={openAddAttrModal || openEditAttrModal} onClose={() => { setOpenAddAttrModal(false); setOpenEditAttrModal(false); }} maxWidth="md" fullWidth>
        <form onSubmit={handleAttrSubmit(onAttrSubmit)}>
          <DialogTitle sx={{ fontWeight: 700 }}>{selectedAttribute ? 'Edit Attribute' : 'Add Attribute'}</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Controller name="attrKey" control={attrControl} render={({ field }) => (
                  <TextField {...field} fullWidth label="Attribute Key *" error={!!attrErrors.attrKey} helperText={attrErrors.attrKey?.message} />
              )} />
              <Controller name="datatype" control={attrControl} render={({ field }) => (
                  <TextField {...field} select fullWidth label="Datatype">
                    <MenuItem value="TEXT">TEXT</MenuItem>
                    <MenuItem value="NUMBER">NUMBER</MenuItem>
                    <MenuItem value="FILE">FILE</MenuItem>
                  </TextField>
              )} />
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Controller name="unit" control={attrControl} render={({ field }) => (
                  <TextField {...field} fullWidth label="Unit (e.g. V, µF)" disabled={attrDatatype !== 'NUMBER'} />
              )} />
              <Controller name="displayOrder" control={attrControl} render={({ field }) => (
                  <TextField {...field} fullWidth type="number" label="Display Order" />
              )} />
            </Box>

            <Box sx={{ display: 'flex', gap: 3 }}>
              <Controller name="required" control={attrControl} render={({ field: { value, onChange } }) => (
                  <FormControlLabel control={<Switch checked={value} onChange={onChange} />} label="Required" />
              )} />
              <Controller name="searchable" control={attrControl} render={({ field: { value, onChange } }) => (
                  <FormControlLabel control={<Switch checked={value} onChange={onChange} />} label="Searchable" />
              )} />
              <Controller name="filterable" control={attrControl} render={({ field: { value, onChange } }) => (
                  <FormControlLabel control={<Switch checked={value} onChange={onChange} />} label="Filterable" />
              )} />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, px: 3 }}>
            <Button onClick={() => { setOpenAddAttrModal(false); setOpenEditAttrModal(false); }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isSubmittingAttr}>Save Attribute</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Modal for Attribute */}
      <Dialog open={openDeleteAttrModal} onClose={() => setOpenDeleteAttrModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>Confirm Deactivate</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to deactivate <strong>{selectedAttribute?.attrKey}</strong>?</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setOpenDeleteAttrModal(false)}>Cancel</Button>
          <Button onClick={handleDeleteAttrConfirm} variant="contained" color="error">Deactivate</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardCategoryDetails;
