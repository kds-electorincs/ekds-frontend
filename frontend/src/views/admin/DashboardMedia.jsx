import { useState } from 'react';
import { 
  Box, Typography, Button, Paper, Grid, Card, CardMedia, CardActions, IconButton, Tooltip 
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { convertToWebP } from '../../utils/imageUtils';
import { uploadAdminService } from '../../services/apiServices';

const DashboardMedia = () => {
  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
            Media & Image CMS
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your product and system images centrally.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          component="label"
          startIcon={<CloudUploadIcon />}
          sx={{ borderRadius: 2, textTransform: 'none', px: 3, py: 1 }}
        >
          Upload New Image
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={async (e) => {
              if (e.target.files && e.target.files[0]) {
                const originalFile = e.target.files[0];
                toast.info('Requesting presigned URL from backend...', { autoClose: 2000 });
                try {
                  const presignRes = await uploadAdminService.presignUrl({
                    purpose: 'PRODUCT_IMAGE',
                    contentType: originalFile.type
                  });
                  // Convert to WebP locally
                  const webpFile = await convertToWebP(originalFile);
                  
                  // In a full implementation, you would PUT webpFile to presignRes.uploadUrl here.
                  toast.success(`Successfully obtained presigned URL for: ${webpFile.name}`);
                } catch (err) {
                  console.error(err);
                  toast.error('Failed to communicate with Upload API');
                }
              }
            }}
          />
        </Button>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Media Listing API is currently missing from the backend.
            <br />
            (See controllers.md - only UploadController presign exists)
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default DashboardMedia;
