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
      default: '#EDF4FA', // Cloud Blue
      paper: '#ffffff',
    },
    text: {
      primary: '#16243C',
      secondary: '#5F86A6',
    },
    divider: '#D6E4EE',
    success: {
      main: '#2e7d32',
      light: '#e8f5e9',
    },
    warning: {
      main: '#ed6c02',
      light: '#fff3e0',
    },
    error: {
      main: '#d32f2f',
      light: '#ffebee',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 700 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.5 },
    body2: { fontSize: '0.8125rem', lineHeight: 1.45 },
    button: { textTransform: 'none', fontWeight: 700, letterSpacing: '0.01em' },
    caption: { fontSize: '0.75rem', fontWeight: 500, color: '#5F86A6' },
  },
  shape: {
    borderRadius: 8, // Enterprise structural precision (8px system)
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '6px 16px',
          boxShadow: 'none',
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            boxShadow: '0 2px 6px rgba(36, 58, 94, 0.15)',
          },
        },
        containedPrimary: {
          backgroundColor: '#243A5E',
          '&:hover': { backgroundColor: '#16243C' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(36, 58, 94, 0.08)',
          borderRadius: 8,
          border: '1px solid #D6E4EE',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '10px 12px',
          borderBottom: '1px solid #D6E4EE',
          fontSize: '0.8125rem',
        },
        head: {
          backgroundColor: '#EDF4FA',
          color: '#243A5E',
          fontWeight: 700,
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          letterSpacing: '0.05em',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontWeight: 600,
          fontSize: '0.75rem',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          backgroundColor: '#ffffff',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#D6E4EE',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#5F86A6',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#243A5E',
            borderWidth: 2,
          },
        },
        input: {
          padding: '10px 14px',
          fontSize: '0.875rem',
        },
      },
    },
  },
});

export default theme;
