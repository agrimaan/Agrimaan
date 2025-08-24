import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

import { logout } from '../../features/auth/authSlice';
import { RootState } from '../../store';

interface HeaderProps {
  open: boolean;
  toggleDrawer: () => void;
}

const Header: React.FC<HeaderProps> = ({ open, toggleDrawer }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = React.useState<null | HTMLElement>(null);
  
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleNotificationsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationsAnchorEl(null);
  };
  
  const handleLogout = () => {
    handleMenuClose();
    dispatch(logout());
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        transition: (theme) =>
          theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        ...(open && {
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }),
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open drawer"
          onClick={toggleDrawer}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography
          component={RouterLink}
          to="/"
          variant="h6"
          color="inherit"
          noWrap
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Box
            component="img"
            src="/logo.png"
            alt="AgriTech Logo"
            sx={{ height: 32, width: 32, display: { xs: 'none', sm: 'block' } }}
          />
          AgriTech
        </Typography>
        
        {/* Notifications */}
        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          <IconButton
            size="large"
            aria-label="show new notifications"
            color="inherit"
            onClick={handleNotificationsMenuOpen}
          >
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Box>
        
        {/* User Profile */}
        <Tooltip title="Account settings">
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            {user?.profileImage ? (
              <Avatar
                alt={user.name}
                src={user.profileImage}
                sx={{ width: 32, height: 32 }}
              />
            ) : (
              <AccountCircle />
            )}
          </IconButton>
        </Tooltip>
      </Toolbar>
      
      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {user?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
          <Typography variant="caption" color="primary" sx={{ textTransform: 'capitalize' }}>
            {user?.role}
          </Typography>
        </Box>
        
        <MenuItem component={RouterLink} to="/profile" onClick={handleMenuClose}>
          <AccountCircle sx={{ mr: 2 }} /> Profile
        </MenuItem>
        
        <MenuItem component={RouterLink} to="/settings" onClick={handleMenuClose}>
          <SettingsIcon sx={{ mr: 2 }} /> Settings
        </MenuItem>
        
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 2 }} /> Logout
        </MenuItem>
      </Menu>
      
      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchorEl}
        id="notifications-menu"
        open={Boolean(notificationsAnchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Notifications
          </Typography>
        </Box>
        
        <MenuItem onClick={handleMenuClose}>
          <Box>
            <Typography variant="body2">Soil moisture low in Field 1</Typography>
            <Typography variant="caption" color="text.secondary">
              10 minutes ago
            </Typography>
          </Box>
        </MenuItem>
        
        <MenuItem onClick={handleMenuClose}>
          <Box>
            <Typography variant="body2">Weather alert: Heavy rain expected</Typography>
            <Typography variant="caption" color="text.secondary">
              1 hour ago
            </Typography>
          </Box>
        </MenuItem>
        
        <MenuItem onClick={handleMenuClose}>
          <Box>
            <Typography variant="body2">Pest risk detected in Wheat crop</Typography>
            <Typography variant="caption" color="text.secondary">
              Yesterday
            </Typography>
          </Box>
        </MenuItem>
        
        <Box sx={{ textAlign: 'center', p: 1 }}>
          <Typography
            component={RouterLink}
            to="/notifications"
            variant="body2"
            color="primary"
            sx={{ textDecoration: 'none' }}
            onClick={handleMenuClose}
          >
            View all notifications
          </Typography>
        </Box>
      </Menu>
    </AppBar>
  );
};

export default Header;