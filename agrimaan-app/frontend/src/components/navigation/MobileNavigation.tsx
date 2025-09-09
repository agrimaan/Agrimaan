import React, { useState, useEffect } from 'react';
import { 
  Box, 
  BottomNavigation, 
  BottomNavigationAction, 
  Paper, 
  
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  Typography, 
  Divider, 
  Badge,
  Avatar,
  useTheme,
  Snackbar,
  Alert,
  Slide,
  SwipeableDrawer,
  Tooltip,
  ListSubheader
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
//import fieldscapeIcon from '@mui/icons-material/fieldscape';
import LandscapeIcon from '@mui/icons-material/Landscape';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import SensorsIcon from '@mui/icons-material/Sensors';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseIcon from '@mui/icons-material/Close';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HistoryIcon from '@mui/icons-material/History';
import TuneIcon from '@mui/icons-material/Tune';

// Define prop types for the component
interface MobileNavigationProps {
  notifications?: number;
  userName?: string;
  userAvatar?: string;
  onLogout?: () => void;
  onNotificationsClick?: () => void;
}

// Define navigation items
const mainNavItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'fields', icon: <LandscapeIcon />, path: '/fields' },
  { text: 'Crops', icon: <AgricultureIcon />, path: '/crops' },
  { text: 'Sensors', icon: <SensorsIcon />, path: '/sensors' },
  { text: 'Weather', icon: <WaterDropIcon />, path: '/weather' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
  { text: 'Blockchain', icon: <AccountBalanceWalletIcon />, path: '/blockchain' },
  { text: 'Marketplace', icon: <StorefrontIcon />, path: '/marketplace' },
];

const secondaryNavItems = [
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  { text: 'Help', icon: <HelpIcon />, path: '/help' },
  { text: 'Profile', icon: <AccountCircleIcon />, path: '/profile' },
  { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications' },
];

const favoriteItems = [
  { text: 'Saved fields', icon: <FavoriteIcon />, path: '/fields/saved' },
  { text: 'Recent Activities', icon: <HistoryIcon />, path: '/activities' },
];

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  notifications = 0,
  userName = 'User',
  userAvatar,
  onLogout,
  onNotificationsClick
}) => {
  const theme = useTheme();
  const location = useLocation();
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineSnackbarOpen, setOfflineSnackbarOpen] = useState(false);
  const [onlineSnackbarOpen, setOnlineSnackbarOpen] = useState(false);
  
  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setOnlineSnackbarOpen(true);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setOfflineSnackbarOpen(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Get current path for bottom navigation
  const getCurrentNavValue = () => {
    const path = location.pathname;
    
    if (path.startsWith('/dashboard')) return 0;
    if (path.startsWith('/fields')) return 1;
    if (path.startsWith('/crops')) return 2;
    if (path.startsWith('/sensors')) return 3;
    return 4; // More
  };
  
  // Handle bottom navigation change
  const handleNavChange = (event: React.SyntheticEvent, newValue: number) => {
    if (newValue === 4) {
      setMoreDrawerOpen(true);
    }
  };
  
  // Handle more drawer close
  const handleMoreDrawerClose = () => {
    setMoreDrawerOpen(false);
  };
  
  // Handle more drawer open
  const handleMoreDrawerOpen = () => {
    setMoreDrawerOpen(true);
  };
  
  // Handle filter drawer close
  const handleFilterDrawerClose = () => {
    setFilterDrawerOpen(false);
  };
  
  // Handle filter drawer open
  const handleFilterDrawerOpen = () => {
    setFilterDrawerOpen(true);
  };
  
  // Handle logout
  const handleLogout = () => {
    handleMoreDrawerClose();
    if (onLogout) {
      onLogout();
    }
  };
  
  // Handle notifications click
  const handleNotificationsClick = () => {
    handleMoreDrawerClose();
    if (onNotificationsClick) {
      onNotificationsClick();
    }
  };
  
  // Check if a nav item is active
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  // Handle snackbar close
  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOfflineSnackbarOpen(false);
    setOnlineSnackbarOpen(false);
  };
  
  // Render more drawer content
  const renderMoreDrawerContent = () => (
    <Box sx={{ width: '100%', maxWidth: 360 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {userAvatar ? (
            <Avatar 
              alt={userName} 
              src={userAvatar} 
              sx={{ mr: 2 }}
            />
          ) : (
            <Avatar sx={{ mr: 2, bgcolor: theme.palette.background.paper, color: theme.palette.primary.main }}>
              {userName.charAt(0)}
            </Avatar>
          )}
          <Box>
            <Typography variant="subtitle1">{userName}</Typography>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {isOnline ? (
                <>
                  <CloudDoneIcon fontSize="small" /> Online
                </>
              ) : (
                <>
                  <WifiOffIcon fontSize="small" /> Offline Mode
                </>
              )}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleMoreDrawerClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <List
        subheader={
          <ListSubheader component="div" id="favorites-subheader">
            Favorites
          </ListSubheader>
        }
      >
        {favoriteItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={isActive(item.path)}
              onClick={handleMoreDrawerClose}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: `${theme.palette.primary.main}20`,
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                  '&:hover': {
                    backgroundColor: `${theme.palette.primary.main}30`,
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive(item.path) ? theme.palette.primary.main : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      <List
        subheader={
          <ListSubheader component="div" id="more-features-subheader">
            More Features
          </ListSubheader>
        }
      >
        {mainNavItems.slice(4).map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={isActive(item.path)}
              onClick={handleMoreDrawerClose}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: `${theme.palette.primary.main}20`,
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                  '&:hover': {
                    backgroundColor: `${theme.palette.primary.main}30`,
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive(item.path) ? theme.palette.primary.main : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      <List
        subheader={
          <ListSubheader component="div" id="account-subheader">
            Account
          </ListSubheader>
        }
      >
        {secondaryNavItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={isActive(item.path)}
              onClick={item.text === 'Notifications' ? handleNotificationsClick : handleMoreDrawerClose}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: `${theme.palette.primary.main}20`,
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                  '&:hover': {
                    backgroundColor: `${theme.palette.primary.main}30`,
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive(item.path) ? theme.palette.primary.main : 'inherit',
                }}
              >
                {item.text === 'Notifications' ? (
                  <Badge badgeContent={notifications} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
  
  // Render filter drawer content (context-sensitive based on current page)
  const renderFilterDrawerContent = () => {
    const path = location.pathname;
    
    return (
      <Box sx={{ width: '100%', maxWidth: 360, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {path.startsWith('/fields') ? 'Fields Filters' : 
             path.startsWith('/crops') ? 'Crop Filters' : 
             path.startsWith('/sensors') ? 'Sensor Filters' : 
             'Filters'}
          </Typography>
          <IconButton onClick={handleFilterDrawerClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        {/* This would be replaced with actual filter components based on the current page */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Filter options for {path.split('/')[1]} will appear here.
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <IconButton color="primary" onClick={handleFilterDrawerClose}>
            Apply Filters
          </IconButton>
          <IconButton color="error" onClick={handleFilterDrawerClose}>
            Reset
          </IconButton>
        </Box>
      </Box>
    );
  };
  
  return (
    <>
      {/* Bottom Navigation */}
      <Paper 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1100,
          borderTop: `1px solid ${theme.palette.divider}`
        }} 
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={getCurrentNavValue()}
          onChange={handleNavChange}
        >
          <BottomNavigationAction 
            label="Dashboard" 
            icon={<DashboardIcon />} 
            component={RouterLink}
            to="/dashboard"
          />
          <BottomNavigationAction 
            label="fields" 
            icon={<LandscapeIcon />} 
            component={RouterLink}
            to="/fields"
          />
          <BottomNavigationAction 
            label="Crops" 
            icon={<AgricultureIcon />} 
            component={RouterLink}
            to="/crops"
          />
          <BottomNavigationAction 
            label="Sensors" 
            icon={<SensorsIcon />} 
            component={RouterLink}
            to="/sensors"
          />
          <BottomNavigationAction 
            label="More" 
            icon={
              notifications > 0 ? (
                <Badge badgeContent={notifications} color="error">
                  <MoreHorizIcon />
                </Badge>
              ) : (
                <MoreHorizIcon />
              )
            } 
          />
        </BottomNavigation>
      </Paper>
      
      {/* Context-sensitive filter button */}
      {(location.pathname.startsWith('/fields') || 
        location.pathname.startsWith('/crops') || 
        location.pathname.startsWith('/sensors')) && (
        <Tooltip title="Filters">
          <IconButton
            color="primary"
            aria-label="filter"
            onClick={handleFilterDrawerOpen}
            sx={{
              position: 'fixed',
              right: 16,
              bottom: 70,
              zIndex: 1050,
              bgcolor: theme.palette.background.paper,
              boxShadow: theme.shadows[3],
              '&:hover': {
                bgcolor: theme.palette.background.paper,
              }
            }}
          >
            <TuneIcon />
          </IconButton>
        </Tooltip>
      )}
      
      {/* More Drawer */}
      <SwipeableDrawer
        anchor="right"
        open={moreDrawerOpen}
        onClose={handleMoreDrawerClose}
        onOpen={handleMoreDrawerOpen}
        sx={{
          '& .MuiDrawer-paper': { 
            width: '80%', 
            maxWidth: 360,
            boxSizing: 'border-box',
          },
        }}
      >
        {renderMoreDrawerContent()}
      </SwipeableDrawer>
      
      {/* Filter Drawer */}
      <SwipeableDrawer
        anchor="bottom"
        open={filterDrawerOpen}
        onClose={handleFilterDrawerClose}
        onOpen={handleFilterDrawerOpen}
        sx={{
          '& .MuiDrawer-paper': { 
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '70%',
          },
        }}
      >
        {renderFilterDrawerContent()}
      </SwipeableDrawer>
      
      {/* Offline Alert */}
      <Snackbar
        open={offlineSnackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        TransitionComponent={Slide}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity="warning" 
          variant="filled"
          icon={<WifiOffIcon />}
          sx={{ width: '100%' }}
        >
          You are offline. Some features may be limited.
        </Alert>
      </Snackbar>
      
      {/* Online Alert */}
      <Snackbar
        open={onlineSnackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        TransitionComponent={Slide}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity="success" 
          variant="filled"
          icon={<CloudDoneIcon />}
          sx={{ width: '100%' }}
        >
          You're back online. All features available.
        </Alert>
      </Snackbar>
      
      {/* Add bottom padding to content to account for bottom navigation */}
      <Box sx={{ pb: 7 }} />
    </>
  );
};

export default MobileNavigation;