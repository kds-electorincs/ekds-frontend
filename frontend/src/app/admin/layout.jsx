"use client";
import React, { useState, useEffect } from 'react';
import { Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText, useTheme, useMediaQuery } from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  Logout as LogoutIcon,
  Category as CategoryIcon,
  PhotoLibrary as PhotoLibraryIcon,
  AdminPanelSettings as SecurityIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Build as BuildIcon
} from '@mui/icons-material';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../../../../context/AuthContext';
import { PERMISSIONS } from '../../../../../constants/permissions';

const drawerWidth = 260;

const DashboardLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, hasPermission, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return null; // or a loading spinner
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const allMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard', permission: PERMISSIONS.VIEW_DASHBOARD },
    { text: 'Categories', icon: <CategoryIcon />, path: '/admin/categories', permission: PERMISSIONS.MANAGE_CATEGORIES },
    { text: 'Products', icon: <InventoryIcon />, path: '/admin/products', permission: PERMISSIONS.MANAGE_PRODUCTS },
    // { text: 'Media CMS', icon: <PhotoLibraryIcon />, path: '/admin/media', permission: PERMISSIONS.MANAGE_MEDIA },
    // { text: 'Catalog Config', icon: <SettingsIcon />, path: '/admin/catalog-config', permission: PERMISSIONS.MANAGE_CONFIG },
    // { text: 'Maintenance', icon: <BuildIcon />, path: '/admin/maintenance', permission: PERMISSIONS.MANAGE_MAINTENANCE },
  ];

  const menuItems = allMenuItems.filter(item => hasPermission(item.permission));

  const drawer = (
    <div>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
          KDS
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ px: 2, mt: 2 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={NextLink}
                href={item.path}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '& .MuiListItemIcon-root': { color: 'white' },
                    '&:hover': { backgroundColor: 'primary.dark' },
                  },
                  '&:hover': { backgroundColor: 'secondary.light' },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'white' : 'primary.main' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} slotProps={{
                  primary: { fontWeight: isActive ? 600 : 500 }
                }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ position: 'absolute', bottom: 20, width: '100%', px: 2 }}>
        <Box sx={{ px: 2, mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            Logged in as:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {user?.name || user?.fullName || 'Admin User'} ({user?.role?.replace('_', ' ')})
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
            {menuItems.find(item => item.path === pathname)?.text || 'Admin Panel'}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none', boxShadow: '4px 0 20px 0 rgba(0,0,0,0.02)' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
