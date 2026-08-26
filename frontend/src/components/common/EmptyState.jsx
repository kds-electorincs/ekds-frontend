import React from 'react';
import { Box, Typography, Button, Paper, useTheme } from '@mui/material';
import { 
  SearchOff as SearchOffIcon, 
  Inbox as InboxIcon, 
  Refresh as RefreshIcon,
  FolderOpen as FolderIcon
} from '@mui/icons-material';

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
        return <InboxIcon sx={{ fontSize: 64, color: theme.palette.primary.main }} />;
      case "folder":
        return <FolderIcon sx={{ fontSize: 64, color: theme.palette.primary.main }} />;
      case "search":
      default:
        return <SearchOffIcon sx={{ fontSize: 64, color: theme.palette.primary.main }} />;
    }
  };

  return (
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
        border: `1px dashed ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        minHeight: 360,
        my: 2,
        ...sx
      }}
    >
      <Box 
        sx={{ 
          width: 120, 
          height: 120, 
          borderRadius: '50%', 
          bgcolor: theme.palette.primary.light ? `${theme.palette.primary.main}14` : 'rgba(25, 118, 210, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05) rotate(-4deg)',
            bgcolor: `${theme.palette.primary.main}22`,
          }
        }}
      >
        {renderIcon()}
      </Box>

      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary', maxWidth: 450 }}>
        {title}
      </Typography>

      <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 480, mb: 4, lineHeight: 1.6 }}>
        {description}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        {actionText && onAction && (
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={onAction}
            startIcon={<RefreshIcon />}
            sx={{ 
              borderRadius: 3, 
              px: 4, 
              py: 1.2, 
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.24)',
              textTransform: 'none',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.35)',
              }
            }}
          >
            {actionText}
          </Button>
        )}

        {secondaryActionText && onSecondaryAction && (
          <Button
            variant="outlined"
            color="secondary"
            size="large"
            onClick={onSecondaryAction}
            sx={{ 
              borderRadius: 3, 
              px: 3.5, 
              py: 1.2, 
              fontWeight: 600,
              textTransform: 'none'
            }}
          >
            {secondaryActionText}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default EmptyState;
