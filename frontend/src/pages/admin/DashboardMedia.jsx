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

const initialMedia = [
  { id: 1, name: 'headphones.jpg', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80', size: '245 KB' },
  { id: 2, name: 'watch.jpg', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80', size: '180 KB' },
  { id: 3, name: 'camera.jpg', url: 'https://images.unsplash.com/photo-1557825835-b453e9df2c21?w=300&q=80', size: '320 KB' },
  { id: 4, name: 'chair.jpg', url: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=300&q=80', size: '410 KB' },
  { id: 5, name: 'keyboard.jpg', url: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=300&q=80', size: '290 KB' },
];

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
                toast.info('Converting to WebP...', { autoClose: 1000 });
                try {
                  const webpFile = await convertToWebP(originalFile);
                  toast.success(`Successfully converted and "uploaded": ${webpFile.name} (${(webpFile.size/1024).toFixed(1)} KB)`);
                  // Here is where you would send `webpFile` to your backend via API
                } catch (err) {
                  toast.error('Failed to convert image');
                }
              }
            }}
          />
        </Button>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
        <Grid container spacing={3}>
          {initialMedia.map((media) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={media.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <CardMedia
                  component="img"
                  height="160"
                  image={media.url}
                  alt={media.name}
                  sx={{ objectFit: 'cover' }}
                />
                <Box sx={{ p: 2, flexGrow: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
                    {media.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {media.size}
                  </Typography>
                </Box>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2, pt: 0 }}>
                  <Tooltip title="Copy Image URL">
                    <IconButton size="small" onClick={() => {
                      navigator.clipboard.writeText(media.url);
                      toast.success('Image URL copied!');
                    }}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Image">
                    <IconButton size="small" color="error" onClick={() => toast.error(`Deleted image: ${media.name}`)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default DashboardMedia;
