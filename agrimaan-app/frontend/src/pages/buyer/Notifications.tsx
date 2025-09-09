
import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Tab,
  Tabs,
  Typography,
  Badge,
  Avatar,
  Switch,
  FormControlLabel,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  LocalShipping as ShippingIcon,
  ShoppingCart as CartIcon,
  Payment as PaymentIcon,
  Discount as DiscountIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

// Mock data for notifications
const mockNotifications = [
  {
    id: 1,
    type: 'order',
    title: 'Order Delivered',
    message: 'Your order #ORD-2025-001 has been delivered successfully.',
    date: '2025-08-18',
    isRead: false,
    icon: <ShippingIcon />,
    link: '/buyer/orders/ORD-2025-001'
  },
  {
    id: 2,
    type: 'payment',
    title: 'Payment Successful',
    message: 'Your payment of \u20b95,300 for order #ORD-2025-001 was successful.',
    date: '2025-08-15',
    isRead: false,
    icon: <PaymentIcon />,
    link: '/buyer/payments'
  },
  {
    id: 3,
    type: 'order',
    title: 'Order Shipped',
    message: 'Your order #ORD-2025-001 has been shipped and is on its way.',
    date: '2025-08-16',
    isRead: true,
    icon: <ShippingIcon />,
    link: '/buyer/orders/ORD-2025-001'
  },
  {
    id: 4,
    type: 'promotion',
    title: 'Special Offer',
    message: 'Get 15% off on all organic vegetables this week!',
    date: '2025-08-10',
    isRead: true,
    icon: <DiscountIcon />,
    link: '/buyer/marketplace'
  },
  {
    id: 5,
    type: 'cart',
    title: 'Items in Cart',
    message: 'You have items waiting in your cart. Complete your purchase now!',
    date: '2025-08-08',
    isRead: true,
    icon: <CartIcon />,
    link: '/buyer/cart'
  }
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`notifications-tabpanel-${index}`}
      aria-labelledby={`notifications-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Notifications: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNotification, setSelectedNotification] = useState<number | null>(null);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, id: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(id);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };
  
  const handleMarkAsRead = () => {
    // In a real app, this would call an API to mark the notification as read
    handleMenuClose();
  };
  
  const handleDelete = () => {
    // In a real app, this would call an API to delete the notification
    handleMenuClose();
  };
  
  const handleMarkAllAsRead = () => {
    // In a real app, this would call an API to mark all notifications as read
  };
  
  const handleClearAll = () => {
    // In a real app, this would call an API to clear all notifications
  };
  
  // Filter notifications based on tab
  const allNotifications = mockNotifications;
  const unreadNotifications = mockNotifications.filter(notification => !notification.isRead);
  const orderNotifications = mockNotifications.filter(notification => notification.type === 'order');
  const paymentNotifications = mockNotifications.filter(notification => notification.type === 'payment');
  const promotionNotifications = mockNotifications.filter(notification => notification.type === 'promotion');
  
  // Get notifications based on current tab
  const getTabNotifications = () => {
    switch (tabValue) {
      case 0:
        return allNotifications;
      case 1:
        return unreadNotifications;
      case 2:
        return orderNotifications;
      case 3:
        return paymentNotifications;
      case 4:
        return promotionNotifications;
      default:
        return allNotifications;
    }
  };
  
  const currentNotifications = getTabNotifications();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Page Header */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" component="h1" gutterBottom>
              Notifications
            </Typography>
            <Box>
              <Button 
                variant="outlined" 
                startIcon={<CheckCircleIcon />}
                onClick={handleMarkAllAsRead}
                sx={{ mr: 2 }}
              >
                Mark All as Read
              </Button>
              <Button 
                variant="outlined" 
                color="error" 
                startIcon={<DeleteIcon />}
                onClick={handleClearAll}
              >
                Clear All
              </Button>
            </Box>
          </Box>
          <Typography variant="subtitle1" color="text.secondary" paragraph>
            Stay updated with your orders, payments, and special offers
          </Typography>
        </Grid>

        {/* Notifications and Settings */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="notifications tabs">
                <Tab label="All" />
                <Tab 
                  label={
                    <Badge badgeContent={unreadNotifications.length} color="error">
                      Unread
                    </Badge>
                  } 
                />
                <Tab label="Orders" />
                <Tab label="Payments" />
                <Tab label="Promotions" />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <NotificationsList 
                notifications={allNotifications} 
                handleMenuOpen={handleMenuOpen} 
              />
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <NotificationsList 
                notifications={unreadNotifications} 
                handleMenuOpen={handleMenuOpen} 
              />
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <NotificationsList 
                notifications={orderNotifications} 
                handleMenuOpen={handleMenuOpen} 
              />
            </TabPanel>
            
            <TabPanel value={tabValue} index={3}>
              <NotificationsList 
                notifications={paymentNotifications} 
                handleMenuOpen={handleMenuOpen} 
              />
            </TabPanel>
            
            <TabPanel value={tabValue} index={4}>
              <NotificationsList 
                notifications={promotionNotifications} 
                handleMenuOpen={handleMenuOpen} 
              />
            </TabPanel>
          </Paper>
        </Grid>
        
        {/* Notification Settings */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <SettingsIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Notification Settings
              </Typography>
            </Box>
            
            <List>
              <ListItem>
                <ListItemText 
                  primary="Order Updates" 
                  secondary="Notifications about your order status" 
                />
                <Switch defaultChecked />
              </ListItem>
              <Divider />
              
              <ListItem>
                <ListItemText 
                  primary="Payment Alerts" 
                  secondary="Notifications about payments and transactions" 
                />
                <Switch defaultChecked />
              </ListItem>
              <Divider />
              
              <ListItem>
                <ListItemText 
                  primary="Promotions & Offers" 
                  secondary="Notifications about discounts and special offers" 
                />
                <Switch defaultChecked />
              </ListItem>
              <Divider />
              
              <ListItem>
                <ListItemText 
                  primary="Product Recommendations" 
                  secondary="Personalized product suggestions" 
                />
                <Switch />
              </ListItem>
              <Divider />
              
              <ListItem>
                <ListItemText 
                  primary="Email Notifications" 
                  secondary="Receive notifications via email" 
                />
                <Switch defaultChecked />
              </ListItem>
              <Divider />
              
              <ListItem>
                <ListItemText 
                  primary="SMS Notifications" 
                  secondary="Receive notifications via SMS" 
                />
                <Switch />
              </ListItem>
            </List>
            
            <Box mt={2} textAlign="center">
              <Button variant="contained">
                Save Settings
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Notification Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMarkAsRead}>
          <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
          Mark as read
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Container>
  );
};

// Notifications List Component
interface NotificationsListProps {
  notifications: any[];
  handleMenuOpen: (event: React.MouseEvent<HTMLButtonElement>, id: number) => void;
}

const NotificationsList: React.FC<NotificationsListProps> = ({ notifications, handleMenuOpen }) => {
  return (
    <>
      {notifications.length > 0 ? (
        <List>
          {notifications.map((notification) => (
            <React.Fragment key={notification.id}>
              <ListItem
                alignItems="flex-start"
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    aria-label="more"
                    onClick={(e) => handleMenuOpen(e, notification.id)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                }
                sx={{ 
                  bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                  borderLeft: notification.isRead ? 'none' : '4px solid',
                  borderLeftColor: 'primary.main',
                  pl: notification.isRead ? 2 : 1.5
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: notification.isRead ? 'action.selected' : 'primary.main' }}>
                    {notification.icon}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box component={RouterLink} to={notification.link} sx={{ textDecoration: 'none', color: 'inherit' }}>
                      <Typography variant="subtitle1" fontWeight={notification.isRead ? 'normal' : 'medium'}>
                        {notification.title}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                        sx={{ display: 'block', mb: 0.5 }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                      >
                        {new Date(notification.date).toLocaleDateString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Box textAlign="center" py={4}>
          <NotificationsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You don't have any notifications in this category
          </Typography>
        </Box>
      )}
    </>
  );
};

export default Notifications;
