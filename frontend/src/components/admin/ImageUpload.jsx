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
import { validateUploadFile } from '../../utils/uploadValidation';

const ImageUpload = ({ 
  value, // The S3 objectKey if it exists
  onChange, // Callback when upload succeeds: (objectKey) => void
  error,
  helperText,
  purpose = 'CATEGORY_HERO'
}) => {
  const { uploadFile, isUploading, uploadProgress } = useS3Upload();
  const [preview, setPreview] = useState(null);
  const [localError, setLocalError] = useState('');

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

  const processFile = async (file, eventTarget) => {
    if (!file) return;

    const validationError = validateUploadFile(file, 'image');
    if (validationError) {
      setLocalError(validationError);
      if (eventTarget) eventTarget.value = '';
      return;
    }

    setLocalError('');
    const localPreviewUrl = URL.createObjectURL(file);
    setPreview(localPreviewUrl);

    try {
      const objectKey = await uploadFile(file, purpose);
      onChange(objectKey);
      URL.revokeObjectURL(localPreviewUrl);
    } catch (err) {
      if (value) {
        setPreview(`${CDN_BASE}/${value}`);
      } else {
        setPreview(null);
      }
      setLocalError(err.message || 'Image upload failed');
      if (eventTarget) eventTarget.value = '';
    }
  };

  const handleFileChange = (event) => {
    processFile(event.target.files[0], event.target);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (isUploading) return;
    processFile(event.dataTransfer.files[0], null);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
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
          borderColor: (error || localError) ? 'error.main' : (isUploading ? 'primary.main' : 'divider'),
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
        onDrop={handleDrop}
        onDragOver={handleDragOver}
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
              Accepted formats: JPEG, PNG, WebP · Max size: 2 MB
            </Typography>
          </Box>
        )}
      </Box>
      {(error || localError || helperText) && (
        <FormHelperText error={!!(error || localError)} sx={{ mt: 1 }}>
          {localError || error || helperText}
        </FormHelperText>
      )}
    </Box>
  );
};

export default ImageUpload;
