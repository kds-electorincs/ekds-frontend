import { useRouter } from 'next/navigation';
"use client";
import React from 'react';
import { Typography, Box, Grid, Card, CardContent, Button, Link, Paper, Divider } from '@mui/material';
import { 
  ReceiptLong as ReceiptLongIcon,
  FileUpload as FileUploadIcon,
  ImportContacts as ImportContactsIcon,
  SupportAgent as SupportAgentIcon,
  InfoOutlined as InfoIcon,
  ShoppingBagOutlined as ShoppingBagIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const UserDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      
      {/* 1. Registration Confirmation Warning Banner */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          bgcolor: '#FFFDF0', // Very light yellowish cream
          border: '1px solid #FFE58F', // Yellow border
          borderRadius: 2,
          display: 'flex',
          gap: 2,
          alignItems: 'flex-start'
        }}
      >
        <InfoIcon sx={{ color: '#D4B106', mt: 0.3 }} />
        <Box>
          <Typography variant="body2" sx={{ color: '#8A6D07', fontWeight: 600, mb: 1, lineHeight: 1.5 }}>
            You will receive an email confirmation when your wholesale registration profile review is complete. Sometimes we need to contact our customers with additional verification questions before approving credit terms. Please check your junk or spam folder for missing correspondence.
          </Typography>
          <Typography variant="body2" sx={{ color: '#8A6D07', fontWeight: 600 }}>
            If you have any questions about your pending B2B registration, please reach out to{' '}
            <Link 
              href="mailto:registration@archana.com" 
              sx={{ color: 'primary.main', textDecoration: 'underline', fontWeight: 700 }}
            >
              registration@archana.com
            </Link>
          </Typography>
        </Box>
      </Paper>

      {/* 2. Top Action Cards Grid (3 Columns) */}
      <Grid container spacing={3}>
        {/* Card 1: myLists */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              height: '100%', 
              border: '1px solid', 
              borderColor: 'divider',
              borderRadius: 2,
              background: 'linear-gradient(135deg, #EDF4FA 0%, #CFE3F1 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 2,
              '&:hover': { boxShadow: '0 4px 12px rgba(36, 58, 94, 0.05)' }
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <ReceiptLongIcon color="primary" />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  myLists & Quotes
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.4 }}>
                Build out wholesale product lists to complete your designs or inventory requirements. Generate a B2B quote to preserve pricing for 30 days.
              </Typography>
            </Box>
            <Button 
              component={RouterLink}
              to="/user/quotations"
              variant="text" 
              size="small" 
              sx={{ 
                alignSelf: 'flex-start', 
                fontWeight: 700, 
                color: 'primary.main',
                p: 0,
                textTransform: 'none',
                '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' }
              }}
            >
              View More Info →
            </Button>
          </Paper>
        </Grid>

        {/* Card 2: BOM Upload */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              height: '100%', 
              border: '1px solid', 
              borderColor: 'divider',
              borderRadius: 2,
              background: 'linear-gradient(135deg, #EDF4FA 0%, #CFE3F1 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 2,
              '&:hover': { boxShadow: '0 4px 12px rgba(36, 58, 94, 0.05)' }
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <FileUploadIcon color="primary" />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  BOM Upload & Scheme-it
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.4 }}>
                Upload spreadsheet lists of products or design schematics. Instantly track parts matching against our live warehouses and stock levels.
              </Typography>
            </Box>
            <Button 
              component={RouterLink}
              to="/user/quotations"
              variant="text" 
              size="small" 
              sx={{ 
                alignSelf: 'flex-start', 
                fontWeight: 700, 
                color: 'primary.main',
                p: 0,
                textTransform: 'none',
                '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' }
              }}
            >
              Upload B2B List →
            </Button>
          </Paper>
        </Grid>

        {/* Card 3: Reference Library */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              height: '100%', 
              border: '1px solid', 
              borderColor: 'divider',
              borderRadius: 2,
              background: 'linear-gradient(135deg, #EDF4FA 0%, #CFE3F1 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 2,
              '&:hover': { boxShadow: '0 4px 12px rgba(36, 58, 94, 0.05)' }
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <ImportContactsIcon color="primary" />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Reference Design Library
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.4 }}>
                Access verified technical product documentation, compliance certificates, voltage conversion charts, and safety manuals.
              </Typography>
            </Box>
            <Button 
              component={RouterLink}
              to="/products"
              variant="text" 
              size="small" 
              sx={{ 
                alignSelf: 'flex-start', 
                fontWeight: 700, 
                color: 'primary.main',
                p: 0,
                textTransform: 'none',
                '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' }
              }}
            >
              Browse Catalog Designs →
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* 3. Recent Orders Block */}
      <Paper 
        elevation={0}
        sx={{ 
          border: '1px solid', 
          borderColor: 'divider', 
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        {/* Block Header */}
        <Box sx={{ bgcolor: 'rgba(36, 58, 94, 0.01)', px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>
            Recent Orders
          </Typography>
        </Box>
        {/* Block Content */}
        <Box sx={{ py: 6, px: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
          <ShoppingBagIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            You have no recent orders at this time.
          </Typography>
          <Button 
            component={RouterLink} 
            to="/products" 
            variant="outlined" 
            size="small"
            sx={{ mt: 1, fontWeight: 700, textTransform: 'none' }}
          >
            Start Shopping
          </Button>
        </Box>
      </Paper>

      {/* 4. Support Representative Card */}
      <Paper 
        elevation={0}
        sx={{ 
          border: '1px solid', 
          borderColor: 'divider', 
          borderRadius: 2,
          overflow: 'hidden',
          maxWidth: 500
        }}
      >
        {/* Block Header */}
        <Box sx={{ bgcolor: 'rgba(36, 58, 94, 0.01)', px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>
            My KDS Archana Team
          </Typography>
        </Box>
        {/* Block Content */}
        <Box sx={{ p: 3, display: 'flex', gap: 2.5, alignItems: 'center' }}>
          <Box sx={{ bgcolor: 'secondary.light', p: 1.5, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SupportAgentIcon color="primary" sx={{ fontSize: 32 }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', mb: 0.5 }}>
              KDS Archana Sales Support
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.2, fontWeight: 600, fontSize: '0.85rem' }}>
              Phone: +91 80 2215 0210
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
              Email:{' '}
              <Link href="mailto:support@archana.com" sx={{ color: 'primary.main', textDecoration: 'underline' }}>
                support@archana.com
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>

    </Box>
  );
};

export default UserDashboard;
