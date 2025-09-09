import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  LocalShipping as DeliveriesIcon,
  Inventory as AvailableRequestsIcon,
  AttachMoney as EarningsIcon,
  Star as ReviewsIcon,
  Settings as SettingsIcon,
  Person as ProfileIcon,
  Help as HelpIcon
} from '@mui/icons-material';

const drawerWidth = 240;

interface SidebarProps {
  open: boolean;
  toggleDrawer: () => void;
  user: any;
}

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

const LogisticsSidebar: React.FC<SidebarProps> = ({ open, toggleDrawer, user }) => {
  const location = useLocation();
  
  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      path: '/logistics',
      icon: <DashboardIcon />
    },
    {
      title: 'Deliveries',
      path: '/logistics/deliveries',
      icon: <DeliveriesIcon />
    },
    {
      title: 'Available Requests',
      path: '/logistics/available-requests',
      icon: <AvailableRequestsIcon />
    },
    {
      title: 'Earnings',
      path: '/logistics/earnings',
      icon: <EarningsIcon />
    },
    {
      title: 'Reviews',
      path: '/logistics/reviews',
      icon: <ReviewsIcon />
    }
  ];
  
  const secondaryNavItems: NavItem[] = [
    {
      title: 'Profile',
      path: '/logistics/profile',
      icon: <ProfileIcon />
    },
    {
      title: 'Settings',
      path: '/logistics/settings',
      icon: <SettingsIcon />
    },
    {
      title: 'Help',
      path: '/logistics/help',
      icon: <HelpIcon />
    }
  ];

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? drawerWidth : 72,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        transition: (theme) =>
          theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        ...(!open && {
          overflowX: 'hidden',
          width: 72,
          transition: (theme) =>
            theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }),
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          px: [1],
        }}
      >
        <IconButton onClick={toggleDrawer}>
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
      
      <Divider />
      
      {/* Primary Navigation */}
      <List component="nav">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/logistics' && location.pathname.startsWith(item.path));
            
          return (
            <ListItem key={item.title} disablePadding sx={{ display: 'block' }}>
              <Tooltip title={open ? '' : item.title} placement="right">
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  selected={isActive}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    backgroundColor: isActive ? 'action.selected' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                      color: isActive ? 'primary.main' : 'inherit',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.title} 
                    sx={{ 
                      opacity: open ? 1 : 0,
                      color: isActive ? 'primary.main' : 'inherit',
                    }} 
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
      
      <Divider sx={{ my: 1 }} />
      
      {/* Secondary Navigation */}
      <List>
        {secondaryNavItems.map((item) => {
          const isActive = location.pathname === item.path;
            
          return (
            <ListItem key={item.title} disablePadding sx={{ display: 'block' }}>
              <Tooltip title={open ? '' : item.title} placement="right">
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  selected={isActive}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    backgroundColor: isActive ? 'action.selected' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                      color: isActive ? 'primary.main' : 'inherit',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.title} 
                    sx={{ 
                      opacity: open ? 1 : 0,
                      color: isActive ? 'primary.main' : 'inherit',
                    }} 
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
      
      <Box sx={{ flexGrow: 1 }} />
      
      {/* App Version */}
      {open && (
        <Box sx={{ p: 2, opacity: 0.7 }}>
          <ListItemText 
            primary="Agrimaan App" 
            secondary="v1.0.0" 
            primaryTypographyProps={{ variant: 'caption' }}
            secondaryTypographyProps={{ variant: 'caption' }}
          />
        </Box>
      )}
    </Drawer>
  );
};

export default LogisticsSidebar;