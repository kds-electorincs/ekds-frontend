import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#243A5E', // Midnight Blue
      light: '#5F86A6', // Dusty Denim
      dark: '#1a2a44',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8FB6D8', // Calm Ocean
      light: '#CFE3F1', // Powder Sky
      dark: '#6e9aba',
      contrastText: '#243A5E',
    },
    background: {
      default: '#EDF4FA', // Cloud Blue
      paper: '#ffffff',
    },
    text: {
      primary: '#243A5E',
      secondary: '#5F86A6',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
          borderRadius: 16,
        },
      },
    },
  },
});

export default theme;
