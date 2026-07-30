"use client";
import React, { useState } from 'react';
import { Box, Drawer, List, Typography, Divider, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText, useTheme, useMediaQuery, Paper } from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  AccountBalanceWallet as WalletIcon,
  Favorite as FavoriteIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../../../../context/AuthContext';
import Navbar from '../../../../../components/Navbar';

const UserDashboardLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Match md down to match navbar mobile view
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const groupedMenuItems = [
    {
      groupTitle: 'Dashboard & Lists',
      items: [
        { text: 'Dashboard Home', icon: <DashboardIcon sx={{ fontSize: 18 }} />, path: '/user/dashboard' },
        { text: 'Quotations & Lists', icon: <ReceiptIcon sx={{ fontSize: 18 }} />, path: '/user/quotations' },
        { text: 'Favorites', icon: <FavoriteIcon sx={{ fontSize: 18 }} />, path: '/user/favorites' },
      ]
    },
    {
      groupTitle: 'Orders & Payments',
      items: [
        { text: 'My Orders', icon: <ShoppingCartIcon sx={{ fontSize: 18 }} />, path: '/user/orders' },
      ]
    },
    {
      groupTitle: 'Account & Settings',
      items: [
        { text: 'Profile Details', icon: <PersonIcon sx={{ fontSize: 18 }} />, path: '/user/profile' },
        { text: 'Saved Addresses', icon: <LocationIcon sx={{ fontSize: 18 }} />, path: '/user/addresses' },
        { text: 'Email Preferences', icon: <NotificationsIcon sx={{ fontSize: 18 }} />, path: '/user/preferences' },
      ]
    }
  ];

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
      {/* User Greeting Block (My DigiKey Style) */}
      <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'rgba(36, 58, 94, 0.02)' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          Hello,
        </Typography>
        <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 800, mt: 0.5, lineHeight: 1.2 }}>
          {(user?.name || user?.fullName || 'User').toUpperCase()}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5, fontWeight: 500 }}>
          {user?.email || 'jaimeenjvs@gmail.com'}
        </Typography>
      </Box>

      {/* Grouped Sidebar List */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 2, py: 2 }}>
        {groupedMenuItems.map((group) => (
          <Box key={group.groupTitle} sx={{ mb: 3 }}>
            {/* Group Section Title */}
            <Typography 
              variant="caption" 
              sx={{ 
                px: 1.5, 
                mb: 1, 
                display: 'block', 
                fontWeight: 800, 
                color: 'primary.main', 
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                fontSize: '0.68rem'
              }}
            >
              {group.groupTitle}
            </Typography>
            
            {/* Group Items */}
            <List disablePadding>
              {group.items.map((item) => {
                const isActive = pathname === item.path || (pathname === '/user' && item.path === '/user/dashboard' && item.text === 'Dashboard Home');
                return (
                  <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      component={NextLink}
                      href={item.path}
                      selected={isActive}
                      onClick={() => isMobile && setMobileOpen(false)} // Close mobile drawer when clicking item
                      sx={{
                        borderRadius: 1.5,
                        py: 0.8,
                        px: 1.5,
                        '&.Mui-selected': {
                          backgroundColor: 'primary.main',
                          color: 'white',
                          '& .MuiListItemIcon-root': { color: 'white' },
                          '&:hover': { backgroundColor: 'primary.dark' },
                        },
                        '&:hover': { backgroundColor: 'secondary.light', color: 'primary.main', '& .MuiListItemIcon-root': { color: 'primary.main' } },
                      }}
                    >
                      <ListItemIcon sx={{ color: isActive ? 'white' : 'primary.main', minWidth: 32 }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text} 
                        primaryTypographyProps={{ 
                          fontSize: '0.8rem', 
                          fontWeight: isActive ? 700 : 500 
                        }} 
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* Logout Footer Box */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <ListItemButton 
          onClick={handleLogout} 
          sx={{ 
            borderRadius: 1.5, 
            color: 'error.main', 
            py: 1,
            '&:hover': { bgcolor: 'error.50' }
          }}
        >
          <ListItemIcon sx={{ color: 'error.main', minWidth: 32 }}>
            <LogoutIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600 }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  const allItems = groupedMenuItems.flatMap(group => group.items);
  const activeTitle = allItems.find(item => item.path === pathname)?.text || 'Dashboard';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      
      {/* 1. Global Storefront Header */}
      <Navbar />

      {/* 2. Mobile Dashboard Menu Trigger Strip */}
      {isMobile && (
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            px: 3, 
            py: 1.2, 
            borderBottom: '1px solid', 
            borderColor: 'divider',
            bgcolor: 'background.paper',
            gap: 1.5
          }}
        >
          <IconButton
            color="primary"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            size="small"
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '0.85rem' }}>
            Dashboard Menu: {activeTitle}
          </Typography>
        </Box>
      )}

      {/* 3. Centered Layout Area */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexGrow: 1, 
          maxWidth: 1200, 
          mx: 'auto', 
          width: '100%', 
          px: { xs: 2.5, md: 3 }, 
          py: 4, 
          gap: 4 
        }}
      >
        {/* Left Sidebar (Desktop Only) */}
        {!isMobile && (
          <Box sx={{ width: 280, flexShrink: 0 }}>
            <Paper 
              elevation={0} 
              sx={{ 
                border: '1px solid', 
                borderColor: 'divider', 
                borderRadius: 2, 
                overflow: 'hidden',
                position: 'sticky',
                top: 100,
                height: 'fit-content'
              }}
            >
              {drawer}
            </Paper>
          </Box>
        )}

        {/* Main Workspace (Outlet) */}
        <Box 
          component="main"
          sx={{ 
            flexGrow: 1, 
            width: { xs: '100%', md: 'calc(100% - 280px - 32px)' } 
          }}
        >
          {children}
        </Box>
      </Box>

      {/* 4. Drawer for Mobile Dashboard Links */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
          }}
        >
          {drawer}
        </Drawer>
      )}

    </Box>
  );
};

export default UserDashboardLayout;
