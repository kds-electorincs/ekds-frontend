import React from 'react';
import { Chip } from '@mui/material';

const StatusChip = ({ status, size = 'small' }) => {
  const getStatusConfig = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'shipped':
      case 'completed':
      case 'success':
        return { color: 'success', label: status };
      case 'pending':
      case 'processing':
      case 'warning':
        return { color: 'warning', label: status };
      case 'cancelled':
      case 'error':
      case 'inactive':
        return { color: 'error', label: status };
      case 'info':
        return { color: 'info', label: status };
      default:
        return { color: 'default', label: status };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Chip
      label={config.label.toUpperCase()}
      color={config.color}
      size={size}
      sx={{ fontWeight: 700, borderRadius: 1.5, fontSize: '0.65rem' }}
    />
  );
};

export default StatusChip;
