import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#243A5E', // Midnight Blue (Primary Brand)
      light: '#5F86A6', // Dusty Denim
      dark: '#16243C', // Deep Enterprise Blue
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8FB6D8', // Calm Ocean
      light: '#CFE3F1', // Powder Sky
      dark: '#5883A7',
      contrastText: '#16243C',
    },
    background: {
      default: '#F6F9FC', // Softer cloud blue — less saturated, more premium
      paper: '#ffffff',
    },
    text: {
      primary: '#16243C',
      secondary: '#5F86A6',
    },
    divider: 'rgba(214, 228, 238, 0.6)',
    success: {
      main: '#10B981',
      light: '#ECFDF5',
      dark: '#059669',
    },
    warning: {
      main: '#F59E0B',
      light: '#FFFBEB',
      dark: '#D97706',
    },
    error: {
      main: '#EF4444',
      light: '#FEF2F2',
      dark: '#DC2626',
    },
    info: {
      main: '#3B82F6',
      light: '#EFF6FF',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.1 },
    h2: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15 },
    h3: { fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.2 },
    h4: { fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.25 },
    h5: { fontWeight: 600, lineHeight: 1.3 },
    h6: { fontWeight: 700, lineHeight: 1.35 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
    button: { textTransform: 'none', fontWeight: 700, letterSpacing: '0.01em' },
    caption: { fontSize: '0.75rem', fontWeight: 500, color: '#5F86A6' },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 2px rgba(22, 36, 60, 0.04)',
    '0 1px 3px rgba(22, 36, 60, 0.06), 0 1px 2px rgba(22, 36, 60, 0.04)',
    '0 4px 6px -1px rgba(22, 36, 60, 0.06), 0 2px 4px -1px rgba(22, 36, 60, 0.04)',
    '0 6px 12px -2px rgba(22, 36, 60, 0.08), 0 3px 6px -2px rgba(22, 36, 60, 0.04)',
    '0 10px 20px -3px rgba(22, 36, 60, 0.08), 0 4px 8px -2px rgba(22, 36, 60, 0.04)',
    '0 12px 24px -4px rgba(22, 36, 60, 0.1), 0 4px 10px -2px rgba(22, 36, 60, 0.05)',
    '0 14px 28px -5px rgba(22, 36, 60, 0.1), 0 6px 12px -3px rgba(22, 36, 60, 0.05)',
    '0 16px 32px -6px rgba(22, 36, 60, 0.12), 0 6px 14px -3px rgba(22, 36, 60, 0.06)',
    '0 20px 40px -8px rgba(22, 36, 60, 0.14), 0 8px 16px -4px rgba(22, 36, 60, 0.06)',
    '0 24px 48px -10px rgba(22, 36, 60, 0.16), 0 10px 20px -5px rgba(22, 36, 60, 0.06)',
    '0 28px 56px -12px rgba(22, 36, 60, 0.18), 0 12px 24px -6px rgba(22, 36, 60, 0.06)',
    '0 32px 64px -14px rgba(22, 36, 60, 0.2), 0 14px 28px -7px rgba(22, 36, 60, 0.06)',
    ...Array(12).fill('0 32px 64px -14px rgba(22, 36, 60, 0.2), 0 14px 28px -7px rgba(22, 36, 60, 0.06)'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollBehavior: 'smooth',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 20px',
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(36, 58, 94, 0.15)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #243A5E 0%, #1E3050 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1E3050 0%, #16243C 100%)',
            boxShadow: '0 6px 20px rgba(36, 58, 94, 0.3)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #8FB6D8 0%, #7BA8CE 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #7BA8CE 0%, #6B9AC4 100%)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
        sizeLarge: {
          padding: '12px 28px',
          fontSize: '0.95rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(22, 36, 60, 0.06), 0 1px 2px rgba(22, 36, 60, 0.04)',
          borderRadius: 16,
          border: '1px solid rgba(214, 228, 238, 0.5)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 12px 28px -4px rgba(36, 58, 94, 0.12), 0 4px 10px -2px rgba(36, 58, 94, 0.05)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
        outlined: {
          borderColor: 'rgba(214, 228, 238, 0.5)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '0.75rem',
          letterSpacing: '0.01em',
        },
        sizeSmall: {
          height: 24,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '12px 16px',
          borderBottom: '1px solid rgba(214, 228, 238, 0.5)',
          fontSize: '0.8125rem',
        },
        head: {
          backgroundColor: '#F6F9FC',
          color: '#243A5E',
          fontWeight: 700,
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          letterSpacing: '0.05em',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#ffffff',
          transition: 'all 0.2s ease',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(214, 228, 238, 0.7)',
            transition: 'all 0.2s ease',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#8FB6D8',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#243A5E',
            borderWidth: 2,
          },
          '&.Mui-focused': {
            boxShadow: '0 0 0 3px rgba(36, 58, 94, 0.08)',
          },
        },
        input: {
          padding: '12px 16px',
          fontSize: '0.875rem',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: '0 24px 48px -10px rgba(22, 36, 60, 0.2), 0 10px 20px -5px rgba(22, 36, 60, 0.08)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          fontSize: '0.75rem',
          fontWeight: 600,
          backgroundColor: '#16243C',
          boxShadow: '0 4px 12px rgba(22, 36, 60, 0.2)',
          padding: '6px 12px',
        },
        arrow: {
          color: '#16243C',
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontWeight: 700,
          fontSize: '0.65rem',
          minWidth: 18,
          height: 18,
          borderRadius: 9,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
        },
      },
    },
  },
});

export default theme;
