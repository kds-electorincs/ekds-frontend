import React from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { Warning as ErrorOutlineIcon, Replay as ReplayIcon } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm" sx={{ py: 10 }}>
          <Paper 
            elevation={4} 
            sx={{ 
              p: 5, 
              textAlign: 'center', 
              borderRadius: 4, 
              border: '1px solid', 
              borderColor: 'error.light',
              bgcolor: 'background.paper'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <ErrorOutlineIcon sx={{ fontSize: 60, color: 'error.main' }} />
            </Box>
            <Typography variant="h4" fontWeight={800} color="primary.main" gutterBottom>
              Something Went Wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              The application encountered an unexpected runtime error. We apologize for the inconvenience.
            </Typography>
            {this.state.error && (
              <Box 
                sx={{ 
                  my: 3, 
                  p: 2, 
                  bgcolor: 'grey.50', 
                  borderRadius: 1.5, 
                  textAlign: 'left',
                  overflowX: 'auto',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Typography variant="caption" component="pre" color="error.dark" sx={{ fontFamily: 'monospace' }}>
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}
            <Button
              variant="contained"
              startIcon={<ReplayIcon />}
              onClick={this.handleReload}
              sx={{ mt: 2, px: 4, py: 1.2, borderRadius: 2 }}
            >
              Reload Application
            </Button>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
