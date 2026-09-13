import React from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import { 
  SearchOff as SearchOffIcon, 
  Inbox as InboxIcon, 
  Refresh as RefreshIcon,
  FolderOpen as FolderIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

/**
 * Premium Illustrated Empty State Component
 * Provides intuitive visual feedback and clear action steps when content or filtered listings are empty.
 */
const EmptyState = ({
  title = "No Items Found",
  description = "We couldn't find anything matching your search or filters. Try adjusting your criteria or clearing filters.",
  icon = "search",
  actionText = null,
  onAction = null,
  secondaryActionText = null,
  onSecondaryAction = null,
  sx = {}
}) => {
  const theme = useTheme();

  const renderIcon = () => {
    switch (icon) {
      case "inbox":
        return <InboxIcon sx={{ fontSize: 64, color: '#243A5E' }} />;
      case "folder":
        return <FolderIcon sx={{ fontSize: 64, color: '#243A5E' }} />;
      case "search":
      default:
        return <SearchOffIcon sx={{ fontSize: 64, color: '#243A5E' }} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          textAlign: 'center',
          py: 8,
          px: 3,
          borderRadius: 4,
          border: '1px dashed #A0B4C8',
          background: 'linear-gradient(180deg, #ffffff 0%, #F4F8FB 100%)',
          minHeight: 360,
          my: 2,
          boxShadow: '0 8px 32px rgba(36, 58, 94, 0.04)',
          ...sx
        }}
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Box 
            sx={{ 
              width: 120, 
              height: 120, 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #EDF4FA 0%, #D6E4EE 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              boxShadow: '0 12px 28px rgba(36, 58, 94, 0.1)',
              border: '2px solid #ffffff'
            }}
          >
            {renderIcon()}
          </Box>
        </motion.div>

        <Typography variant="h5" sx={{ fontWeight: 900, mb: 1.5, color: '#16243C', maxWidth: 450 }}>
          {title}
        </Typography>

        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 480, mb: 4, lineHeight: 1.6 }}>
          {description}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          {actionText && onAction && (
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="contained"
                size="large"
                onClick={onAction}
                startIcon={<RefreshIcon />}
                sx={{ 
                  borderRadius: 2.5, 
                  px: 4, 
                  py: 1.2, 
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #243A5E 0%, #16243C 100%)',
                  boxShadow: '0 6px 20px rgba(36, 58, 94, 0.3)',
                  textTransform: 'none'
                }}
              >
                {actionText}
              </Button>
            </motion.div>
          )}

          {secondaryActionText && onSecondaryAction && (
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="outlined"
                color="secondary"
                size="large"
                onClick={onSecondaryAction}
                sx={{ 
                  borderRadius: 2.5, 
                  px: 3.5, 
                  py: 1.2, 
                  fontWeight: 700,
                  borderWidth: 2,
                  textTransform: 'none'
                }}
              >
                {secondaryActionText}
              </Button>
            </motion.div>
          )}
        </Box>
      </Box>
    </motion.div>
  );
};

export default EmptyState;
