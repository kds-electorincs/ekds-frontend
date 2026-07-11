import React, { useCallback, useState, useEffect } from 'react';
import { 
  Box, Typography, IconButton, CircularProgress, 
  Button, FormHelperText 
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon, 
  Close as CloseIcon,
  Image as ImageIcon 
} from '@mui/icons-material';
import useS3Upload from '../../hooks/useS3Upload';
import { toast } from 'react-toastify';

const ImageUpload = ({ 
  value, // The S3 objectKey if it exists
  onChange, // Callback when upload succeeds: (objectKey) => void
  error,
  helperText,
  purpose = 'CATEGORY_HERO'
}) => {
  const { uploadFile, isUploading, uploadProgress } = useS3Upload();
  const [preview, setPreview] = useState(null);

  // If we already have a value (S3 key), we should display it.
  // We use the CDN base from env variables to build the full URL.
  const CDN_BASE = import.meta.env.VITE_CDN_BASE_URL || 'https://d1sswqar085ync.cloudfront.net';
  
  useEffect(() => {
    if (value && !value.startsWith('blob:')) {
      setPreview(`${CDN_BASE}/${value}`);
    } else if (!value) {
      setPreview(null);
    }
  }, [value, CDN_BASE]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
      return;
    }

    // Set a local preview immediately for better UX
    const localPreviewUrl = URL.createObjectURL(file);
    setPreview(localPreviewUrl);

    try {
      const objectKey = await uploadFile(file, purpose);
      onChange(objectKey);
    } catch (err) {
      // Revert preview on failure
      if (value) {
        setPreview(`${CDN_BASE}/${value}`);
      } else {
        setPreview(null);
      }
      toast.error(err.message || 'Image upload failed');
    }
  };

  const handleRemove = () => {
    onChange('');
    setPreview(null);
  };

  return (
    <Box>
      <Box
        sx={{
          border: '2px dashed',
          borderColor: error ? 'error.main' : (isUploading ? 'primary.main' : 'divider'),
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          position: 'relative',
          bgcolor: 'background.paper',
          cursor: isUploading ? 'default' : 'pointer',
          '&:hover': {
            borderColor: isUploading ? 'primary.main' : 'primary.light',
            bgcolor: isUploading ? 'background.paper' : 'rgba(0,0,0,0.02)',
          },
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 200,
        }}
        component="label"
      >
        <input
          type="file"
          hidden
          accept="image/jpeg, image/png, image/webp"
          onChange={handleFileChange}
          disabled={isUploading}
        />

        {isUploading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress variant="determinate" value={uploadProgress} size={48} />
            <Typography variant="body2" color="text.secondary">
              Uploading... {uploadProgress}%
            </Typography>
          </Box>
        ) : preview ? (
          <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
            <img 
              src={preview} 
              alt="Preview" 
              style={{ maxHeight: 200, maxWidth: '100%', objectFit: 'contain', borderRadius: 8 }} 
            />
            <IconButton
              size="small"
              sx={{
                position: 'absolute',
                top: -12,
                right: -12,
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': { bgcolor: 'error.light', color: 'white' }
              }}
              onClick={(e) => {
                e.preventDefault();
                handleRemove();
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
            <Typography variant="subtitle1" fontWeight={500}>
              Click or drag to upload
            </Typography>
            <Typography variant="body2" color="text.secondary">
              SVG, PNG, JPG or GIF (max. 3MB)
            </Typography>
          </Box>
        )}
      </Box>
      {(error || helperText) && (
        <FormHelperText error={!!error} sx={{ mt: 1 }}>
          {error || helperText}
        </FormHelperText>
      )}
    </Box>
  );
};

export default ImageUpload;
