import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Divider, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  useMediaQuery,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  Container,
  CssBaseline,
  SwipeableDrawer,
  Collapse,
  Fab
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import LandscapeIcon from '@mui/icons-material/Landscape';
import SensorsIcon from '@mui/icons-material/Sensors';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Link as RouterLink, useLocation } from 'react-router-dom';

// Import MobileNavigation for small screens
import MobileNavigation from '../navigation/MobileNavigation';

// Define prop types for the component
interface ResponsiveLayoutProps {
  children: React.ReactNode;
  title?: string;
  notifications?: number;
  userName?: string;
  userAvatar?: string;
  onLogout?: () => void;
  onNotificationsClick?: () => void;
}

// Define navigation items
const mainNavItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Fields', icon: <LandscapeIcon />, path: '/fields' },
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
];

const drawerWidth = 240;

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  title = 'Agrimaan Platform',
  notifications = 0,
  userName = 'User',
  userAvatar,
  onLogout,
  onNotificationsClick
}) => {
  const theme = useTheme();
  const isXsScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('main');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const location = useLocation();

  // Handle drawer open/close
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Handle user menu open
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  // Handle user menu close
  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  // Handle logout
  const handleLogout = () => {
    handleUserMenuClose();
    if (onLogout) {
      onLogout();
    }
  };

  // Handle section expand/collapse
  const handleSectionToggle = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Check if a nav item is active
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Scroll to top handler
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Listen for scroll events to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Render drawer content
  const renderDrawerContent = () => (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
        }}
      >
        <Typography variant="h6" noWrap component="div">
          Agrimaan
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>
      <Divider />
      
      {/* Main Navigation Section */}
      <Box>
        <ListItemButton onClick={() => handleSectionToggle('main')}>
          <ListItemText primary="Main Navigation" />
          {expandedSection === 'main' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemButton>
        <Collapse in={expandedSection === 'main'} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {mainNavItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  selected={isActive(item.path)}
                  sx={{
                    pl: 4,
                    '&.Mui-selected': {
                      backgroundColor: `${theme.palette.primary.main}20`,
                      borderRight: `4px solid ${theme.palette.primary.main}`,
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
        </Collapse>
      </Box>
      
      <Divider />
      
      {/* Settings Section */}
      <Box>
        <ListItemButton onClick={() => handleSectionToggle('settings')}>
          <ListItemText primary="Settings & Help" />
          {expandedSection === 'settings' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemButton>
        <Collapse in={expandedSection === 'settings'} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {secondaryNavItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  selected={isActive(item.path)}
                  sx={{
                    pl: 4,
                    '&.Mui-selected': {
                      backgroundColor: `${theme.palette.primary.main}20`,
                      borderRight: `4px solid ${theme.palette.primary.main}`,
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
        </Collapse>
      </Box>
      
      {/* User Profile Section */}
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {userAvatar ? (
            <Avatar 
              alt={userName} 
              src={userAvatar} 
              sx={{ width: 32, height: 32, mr: 1 }}
            />
          ) : (
            <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: theme.palette.primary.main }}>
              {userName.charAt(0)}
            </Avatar>
          )}
          <Typography variant="body2">{userName}</Typography>
        </Box>
        <ListItemButton
          component={RouterLink}
          to="/profile"
          sx={{
            borderRadius: 1,
            '&:hover': {
              backgroundColor: `${theme.palette.primary.main}10`,
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItemButton>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 1,
            '&:hover': {
              backgroundColor: `${theme.palette.error.main}10`,
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: drawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { md: drawerOpen ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: drawerOpen ? 'none' : 'flex' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton 
              color="inherit" 
              onClick={onNotificationsClick}
              sx={{ mr: 1 }}
            >
              <Badge badgeContent={notifications} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* User Menu */}
          <Box>
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleUserMenuOpen}
                size="small"
                sx={{ ml: 1 }}
                aria-controls={Boolean(userMenuAnchorEl) ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={Boolean(userMenuAnchorEl) ? 'true' : undefined}
              >
                {userAvatar ? (
                  <Avatar 
                    alt={userName} 
                    src={userAvatar} 
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                    {userName.charAt(0)}
                  </Avatar>
                )}
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={userMenuAnchorEl}
              id="account-menu"
              open={Boolean(userMenuAnchorEl)}
              onClose={handleUserMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem component={RouterLink} to="/profile" onClick={handleUserMenuClose}>
                <ListItemIcon>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem component={RouterLink} to="/settings" onClick={handleUserMenuClose}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Drawer - Mobile (swipeable) */}
      {isMobile && (
        <SwipeableDrawer
          variant="temporary"
          open={drawerOpen}
          onOpen={() => setDrawerOpen(true)}
          onClose={() => setDrawerOpen(false)}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {renderDrawerContent()}
        </SwipeableDrawer>
      )}
      
      {/* Drawer - Desktop (persistent) */}
      {!isMobile && (
        <Drawer
          variant="persistent"
          open={drawerOpen}
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            width: drawerOpen ? drawerWidth : 0,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
        >
          {renderDrawerContent()}
        </Drawer>
      )}
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: drawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { md: drawerOpen ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          pt: { xs: 8, sm: 9 }, // Add padding to account for app bar height
        }}
      >
        <Container maxWidth="xl" disableGutters={isXsScreen}>
          {children}
        </Container>
        
        {/* Mobile Navigation for XS screens */}
        {isXsScreen && (
          <MobileNavigation 
            notifications={notifications}
            userName={userName}
            userAvatar={userAvatar}
            onLogout={onLogout}
            onNotificationsClick={onNotificationsClick}
          />
        )}
        
        {/* Scroll to top button */}
        <Fab
          color="primary"
          size="small"
          aria-label="scroll back to top"
          onClick={handleScrollToTop}
          sx={{
            position: 'fixed',
            bottom: { xs: 70, sm: 30 }, // Higher on mobile to account for bottom navigation
            right: 30,
            opacity: showScrollTop ? 1 : 0,
            transition: 'opacity 0.3s',
            pointerEvents: showScrollTop ? 'auto' : 'none',
          }}
        >
          <KeyboardArrowUpIcon />
        </Fab>
      </Box>
    </Box>
  );
};

export default ResponsiveLayout;