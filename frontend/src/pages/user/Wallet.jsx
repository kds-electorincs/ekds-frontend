import React from 'react';
import { Box, Typography, Paper, Grid, Button, Divider, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { AccountBalanceWallet, AddCircle, CallMade, CallReceived } from '@mui/icons-material';

const mockTransactions = [
  { id: 1, type: 'credit', amount: 500.00, date: '2023-11-01', description: 'Funds added via Credit Card' },
  { id: 2, type: 'debit', amount: 50.00, date: '2023-10-28', description: 'Order ORD-002 Payment' },
];

const Wallet = () => {
  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>My Wallet</Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'primary.main', color: 'white', textAlign: 'center' }}>
            <AccountBalanceWallet sx={{ fontSize: 48, mb: 2, opacity: 0.8 }} />
            <Typography variant="body1" sx={{ opacity: 0.8, mb: 1 }}>Available Balance</Typography>
            <Typography variant="h3" fontWeight={800}>$450.00</Typography>
            <Button 
              variant="contained" 
              color="secondary" 
              startIcon={<AddCircle />}
              sx={{ mt: 4, borderRadius: 2, px: 4, py: 1 }}
            >
              Add Funds
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 4, height: '100%' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={700}>Recent Transactions</Typography>
            </Box>
            <List sx={{ p: 0 }}>
              {mockTransactions.map((tx, index) => (
                <React.Fragment key={tx.id}>
                  <ListItem sx={{ py: 2, px: 3 }}>
                    <ListItemIcon>
                      {tx.type === 'credit' ? <CallReceived color="success" /> : <CallMade color="error" />}
                    </ListItemIcon>
                    <ListItemText 
                      primary={tx.description} 
                      secondary={tx.date} 
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                    <Typography 
                      variant="subtitle1" 
                      fontWeight={700} 
                      color={tx.type === 'credit' ? 'success.main' : 'error.main'}
                    >
                      {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </Typography>
                  </ListItem>
                  {index < mockTransactions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Wallet;
