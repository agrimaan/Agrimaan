import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  Button,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  Tabs,
  Tab,
  IconButton,
  Badge,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import EventIcon from '@mui/icons-material/Event';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';

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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
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

const Profile: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'John Farmer',
    email: 'john.farmer@example.com',
    phone: '(555) 123-4567',
    location: 'Farmville, CA',
    farmName: 'Green Valley Farm',
    farmSize: '250 acres',
    farmingExperience: '15 years',
    bio: 'Fourth-generation farmer specializing in sustainable crop production. Passionate about implementing innovative agricultural technologies to improve efficiency and reduce environmental impact.'
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (editMode) {
      // In a real app, this would save the profile data to the backend
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData({
      ...profileData,
      [field]: value
    });
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    // Reset to original data
    setProfileData({
      name: 'John Farmer',
      email: 'john.farmer@example.com',
      phone: '(555) 123-4567',
      location: 'Farmville, CA',
      farmName: 'Green Valley Farm',
      farmSize: '250 acres',
      farmingExperience: '15 years',
      bio: 'Fourth-generation farmer specializing in sustainable crop production. Passionate about implementing innovative agricultural technologies to improve efficiency and reduce environmental impact.'
    });
  };

  // Mock activity data
  const recentActivities = [
    { action: 'Updated sensor settings', target: 'Soil Moisture Sensor 1', date: 'Today, 9:30 AM' },
    { action: 'Added new crop', target: 'Soybeans in East Field', date: 'Yesterday, 2:15 PM' },
    { action: 'Generated report', target: 'Monthly Yield Analysis', date: 'May 28, 2025' },
    { action: 'Calibrated sensors', target: 'All Weather Sensors', date: 'May 25, 2025' },
    { action: 'Updated irrigation schedule', target: 'North Field', date: 'May 22, 2025' }
  ];

  // Mock notification data
  const notifications = [
    { type: 'alert', message: 'Low soil moisture detected in South Field', date: 'Today, 8:45 AM', read: false },
    { type: 'system', message: 'System update available', date: 'Yesterday, 10:30 AM', read: true },
    { type: 'weather', message: 'Weather alert: Heavy rain expected tomorrow', date: 'Yesterday, 9:15 AM', read: false },
    { type: 'task', message: 'Scheduled task: Fertilizer application due', date: 'May 28, 2025', read: true },
    { type: 'alert', message: 'Battery low on Temperature Sensor 2', date: 'May 26, 2025', read: true }
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Profile updated successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <IconButton 
                    sx={{ 
                      bgcolor: 'primary.main', 
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      width: 32,
                      height: 32
                    }}
                    size="small"
                  >
                    <PhotoCameraIcon fontSize="small" />
                  </IconButton>
                }
              >
                <Avatar 
                  sx={{ 
                    width: 120, 
                    height: 120,
                    mb: 2,
                    border: '4px solid',
                    borderColor: 'primary.main'
                  }}
                >
                  {profileData.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
              </Badge>
            </Box>
            
            {editMode ? (
              <TextField 
                value={profileData.name} 
                onChange={(e) => handleInputChange('name', e.target.value)}
                variant="standard"
                fullWidth
                sx={{ mb: 1 }}
              />
            ) : (
              <Typography variant="h5" gutterBottom>
                {profileData.name}
              </Typography>
            )}
            
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {profileData.farmName}
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Button
                variant={editMode ? "contained" : "outlined"}
                color={editMode ? "success" : "primary"}
                startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                onClick={handleEditToggle}
                sx={{ mr: 1 }}
              >
                {editMode ? "Save Profile" : "Edit Profile"}
              </Button>
              {editMode && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Email" 
                  secondary={
                    editMode ? (
                      <TextField 
                        value={profileData.email} 
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        variant="standard"
                        size="small"
                        fullWidth
                      />
                    ) : profileData.email
                  } 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Phone" 
                  secondary={
                    editMode ? (
                      <TextField 
                        value={profileData.phone} 
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        variant="standard"
                        size="small"
                        fullWidth
                      />
                    ) : profileData.phone
                  } 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocationOnIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Location" 
                  secondary={
                    editMode ? (
                      <TextField 
                        value={profileData.location} 
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        variant="standard"
                        size="small"
                        fullWidth
                      />
                    ) : profileData.location
                  } 
                />
              </ListItem>
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom align="left">
              Farm Information
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <WorkIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Farm Name" 
                  secondary={
                    editMode ? (
                      <TextField 
                        value={profileData.farmName} 
                        onChange={(e) => handleInputChange('farmName', e.target.value)}
                        variant="standard"
                        size="small"
                        fullWidth
                      />
                    ) : profileData.farmName
                  } 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocationOnIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Farm Size" 
                  secondary={
                    editMode ? (
                      <TextField 
                        value={profileData.farmSize} 
                        onChange={(e) => handleInputChange('farmSize', e.target.value)}
                        variant="standard"
                        size="small"
                        fullWidth
                      />
                    ) : profileData.farmSize
                  } 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <EventIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Farming Experience" 
                  secondary={
                    editMode ? (
                      <TextField 
                        value={profileData.farmingExperience} 
                        onChange={(e) => handleInputChange('farmingExperience', e.target.value)}
                        variant="standard"
                        size="small"
                        fullWidth
                      />
                    ) : profileData.farmingExperience
                  } 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
                <Tab label="About" />
                <Tab label="Activity" icon={<HistoryIcon />} iconPosition="start" />
                <Tab 
                  label="Notifications" 
                  icon={
                    <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
                      <NotificationsIcon />
                    </Badge>
                  } 
                  iconPosition="start" 
                />
                <Tab label="Settings" icon={<SettingsIcon />} iconPosition="start" />
              </Tabs>
            </Box>
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>
                About Me
              </Typography>
              {editMode ? (
                <TextField 
                  value={profileData.bio} 
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  sx={{ mb: 3 }}
                />
              ) : (
                <Typography variant="body1" paragraph>
                  {profileData.bio}
                </Typography>
              )}
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Farm Overview
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1">Fields</Typography>
                      <Typography variant="h4">4</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total managed fields
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1">Crops</Typography>
                      <Typography variant="h4">3</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Current active crops
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1">Sensors</Typography>
                      <Typography variant="h4">12</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Deployed monitoring sensors
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Current Season Summary
              </Typography>
              <Box sx={{ 
                height: 200, 
                bgcolor: 'grey.100', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                mt: 2
              }}>
                <Typography>Season Summary Chart Would Go Here</Typography>
              </Box>
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {recentActivities.map((activity, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText 
                        primary={activity.action} 
                        secondary={
                          <>
                            <Typography component="span" variant="body2">
                              {activity.target}
                            </Typography>
                            <Typography component="span" variant="body2" color="text.secondary">
                              {` — ${activity.date}`}
                            </Typography>
                          </>
                        } 
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button variant="outlined">
                  View All Activity
                </Button>
              </Box>
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Notifications
              </Typography>
              <List>
                {notifications.map((notification, index) => (
                  <React.Fragment key={index}>
                    <ListItem 
                      sx={{ 
                        bgcolor: notification.read ? 'transparent' : 'action.hover',
                        borderLeft: notification.read ? 'none' : '4px solid',
                        borderColor: 'primary.main',
                        pl: notification.read ? 2 : 1
                      }}
                    >
                      <ListItemText 
                        primary={notification.message} 
                        secondary={notification.date} 
                      />
                      {!notification.read && (
                        <Button size="small">
                          Mark as Read
                        </Button>
                      )}
                    </ListItem>
                    {index < notifications.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="outlined">
                  Mark All as Read
                </Button>
                <Button variant="outlined">
                  View All Notifications
                </Button>
              </Box>
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom>
                Profile Settings
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Email Notifications" 
                    secondary="Receive updates and alerts via email" 
                  />
                  <Button variant="outlined" size="small">
                    Configure
                  </Button>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="Privacy Settings" 
                    secondary="Manage your data and privacy preferences" 
                  />
                  <Button variant="outlined" size="small">
                    Configure
                  </Button>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="Account Security" 
                    secondary="Password and authentication settings" 
                  />
                  <Button variant="outlined" size="small">
                    Configure
                  </Button>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="Connected Accounts" 
                    secondary="Manage linked services and applications" 
                  />
                  <Button variant="outlined" size="small">
                    Configure
                  </Button>
                </ListItem>
              </List>
              <Box sx={{ mt: 3 }}>
                <Button variant="contained" color="primary">
                  Go to Settings
                </Button>
              </Box>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;