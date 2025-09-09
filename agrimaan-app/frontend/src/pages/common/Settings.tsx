import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Divider,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Tabs,
  Tab,
  FormControlLabel,
  FormGroup,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import LanguageIcon from '@mui/icons-material/Language';

import PersonIcon from '@mui/icons-material/Person';
import DevicesIcon from '@mui/icons-material/Devices';
import SaveIcon from '@mui/icons-material/Save';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import HelpIcon from '@mui/icons-material/Help';

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
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

const Settings: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [language, setLanguage] = useState('english');
  const [units, setUnits] = useState('imperial');
  const [dataRefreshRate, setDataRefreshRate] = useState('15');
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false,
    weatherAlerts: true,
    sensorAlerts: true,
    taskReminders: true,
    systemUpdates: true
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleLanguageChange = (event: SelectChangeEvent) => {
    setLanguage(event.target.value);
  };

  const handleUnitsChange = (event: SelectChangeEvent) => {
    setUnits(event.target.value);
  };

  const handleDataRefreshRateChange = (event: SelectChangeEvent) => {
    setDataRefreshRate(event.target.value);
  };

  const handleNotificationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotificationSettings({
      ...notificationSettings,
      [event.target.name]: event.target.checked
    });
  };

  const handleSave = () => {
    // In a real app, this would save the settings to the backend
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
            <Tab icon={<PersonIcon />} label="Account" />
            <Tab icon={<NotificationsIcon />} label="Notifications" />
            <Tab icon={<LanguageIcon />} label="Preferences" />
            <Tab icon={<DevicesIcon />} label="Devices" />
            <Tab icon={<IntegrationInstructionsIcon />} label="Integrations" />
            <Tab icon={<SecurityIcon />} label="Security" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Account Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Full Name"
                      defaultValue="John Farmer"
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Email Address"
                      defaultValue="john.farmer@example.com"
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Phone Number"
                      defaultValue="(555) 123-4567"
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Farm Name"
                      defaultValue="Green Valley Farm"
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Address"
                      defaultValue="123 Farm Road, Farmville, CA 12345"
                      fullWidth
                      margin="normal"
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                    >
                      Save Changes
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Subscription</Typography>
                <Typography variant="body1" gutterBottom>
                  Current Plan: <strong>Premium</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Renewal Date: August 15, 2025
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button variant="outlined" color="primary">
                    Manage Subscription
                  </Button>
                </Box>
              </Paper>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Account Actions</Typography>
                <List>
                  <ListItem>
                    <Button color="primary">Change Password</Button>
                  </ListItem>
                  <ListItem>
                    <Button color="primary">Download My Data</Button>
                  </ListItem>
                  <ListItem>
                    <Button color="error">Delete Account</Button>
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Notification Methods</Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={notificationSettings.email} 
                        onChange={handleNotificationChange} 
                        name="email" 
                      />
                    }
                    label="Email Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={notificationSettings.push} 
                        onChange={handleNotificationChange} 
                        name="push" 
                      />
                    }
                    label="Push Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={notificationSettings.sms} 
                        onChange={handleNotificationChange} 
                        name="sms" 
                      />
                    }
                    label="SMS Notifications"
                  />
                </FormGroup>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Notification Types</Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={notificationSettings.weatherAlerts} 
                        onChange={handleNotificationChange} 
                        name="weatherAlerts" 
                      />
                    }
                    label="Weather Alerts"
                  />
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={notificationSettings.sensorAlerts} 
                        onChange={handleNotificationChange} 
                        name="sensorAlerts" 
                      />
                    }
                    label="Sensor Alerts"
                  />
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={notificationSettings.taskReminders} 
                        onChange={handleNotificationChange} 
                        name="taskReminders" 
                      />
                    }
                    label="Task Reminders"
                  />
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={notificationSettings.systemUpdates} 
                        onChange={handleNotificationChange} 
                        name="systemUpdates" 
                      />
                    }
                    label="System Updates"
                  />
                </FormGroup>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Alert Thresholds</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Configure when you want to receive alerts based on sensor readings and conditions.
                </Typography>
                <Box sx={{ 
                  height: 200, 
                  bgcolor: 'grey.100', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  mt: 2
                }}>
                  <Typography>Alert Thresholds Configuration UI Would Go Here</Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Display Settings</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="language-select-label">Language</InputLabel>
                      <Select
                        labelId="language-select-label"
                        id="language-select"
                        value={language}
                        label="Language"
                        onChange={handleLanguageChange}
                      >
                        <MenuItem value="english">English</MenuItem>
                        <MenuItem value="spanish">Spanish</MenuItem>
                        <MenuItem value="french">French</MenuItem>
                        <MenuItem value="german">German</MenuItem>
                        <MenuItem value="chinese">Chinese</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="units-select-label">Measurement Units</InputLabel>
                      <Select
                        labelId="units-select-label"
                        id="units-select"
                        value={units}
                        label="Measurement Units"
                        onChange={handleUnitsChange}
                      >
                        <MenuItem value="imperial">Imperial (°F, in, mph)</MenuItem>
                        <MenuItem value="metric">Metric (°C, mm, km/h)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="refresh-select-label">Data Refresh Rate</InputLabel>
                      <Select
                        labelId="refresh-select-label"
                        id="refresh-select"
                        value={dataRefreshRate}
                        label="Data Refresh Rate"
                        onChange={handleDataRefreshRateChange}
                      >
                        <MenuItem value="5">Every 5 minutes</MenuItem>
                        <MenuItem value="15">Every 15 minutes</MenuItem>
                        <MenuItem value="30">Every 30 minutes</MenuItem>
                        <MenuItem value="60">Every hour</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Dashboard Customization</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Configure which widgets appear on your dashboard and their order.
                </Typography>
                <Box sx={{ 
                  height: 200, 
                  bgcolor: 'grey.100', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  mt: 2
                }}>
                  <Typography>Dashboard Customization UI Would Go Here</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                >
                  Save Preferences
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Connected Devices</Typography>
                <List>
                  {[
                    { name: 'Soil Moisture Sensor 1', type: 'Moisture', status: 'Active', battery: '85%', lastSync: '10 minutes ago' },
                    { name: 'Temperature Sensor 1', type: 'Temperature', status: 'Active', battery: '72%', lastSync: '15 minutes ago' },
                    { name: 'Humidity Sensor 1', type: 'Humidity', status: 'Inactive', battery: '15%', lastSync: '2 days ago' },
                    { name: 'Weather Station', type: 'Multi-sensor', status: 'Active', battery: 'N/A (Wired)', lastSync: '5 minutes ago' },
                    { name: 'Irrigation Controller', type: 'Control', status: 'Active', battery: 'N/A (Wired)', lastSync: '30 minutes ago' }
                  ].map((device, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemIcon>
                          <DevicesIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary={device.name} 
                          secondary={`Type: ${device.type} • Status: ${device.status} • Battery: ${device.battery} • Last Sync: ${device.lastSync}`} 
                        />
                        <Button variant="outlined" size="small">
                          Configure
                        </Button>
                      </ListItem>
                      {index < 4 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                <Box sx={{ mt: 2 }}>
                  <Button variant="contained" color="primary">
                    Add New Device
                  </Button>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Device Management</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1">Firmware Updates</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Check and update firmware for all connected devices.
                        </Typography>
                        <Button variant="outlined" size="small" sx={{ mt: 2 }}>
                          Check Updates
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1">Calibration</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Calibrate sensors for accurate readings.
                        </Typography>
                        <Button variant="outlined" size="small" sx={{ mt: 2 }}>
                          Start Calibration
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1">Troubleshooting</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Diagnose and fix issues with devices.
                        </Typography>
                        <Button variant="outlined" size="small" sx={{ mt: 2 }}>
                          Run Diagnostics
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Connected Services</Typography>
                <List>
                  {[
                    { name: 'Weather Service', status: 'Connected', lastSync: '5 minutes ago' },
                    { name: 'Soil Testing Lab', status: 'Connected', lastSync: '2 days ago' },
                    { name: 'Equipment Monitoring', status: 'Not Connected', lastSync: 'N/A' },
                    { name: 'Market Prices API', status: 'Connected', lastSync: '1 hour ago' },
                    { name: 'Satellite Imagery', status: 'Connected', lastSync: '1 day ago' }
                  ].map((service, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemIcon>
                          <CloudSyncIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary={service.name} 
                          secondary={`Status: ${service.status} • Last Sync: ${service.lastSync}`} 
                        />
                        <Button 
                          variant="outlined" 
                          size="small"
                          color={service.status === 'Connected' ? 'error' : 'primary'}
                        >
                          {service.status === 'Connected' ? 'Disconnect' : 'Connect'}
                        </Button>
                      </ListItem>
                      {index < 4 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Available Integrations</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1">Farm Management Software</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Integrate with popular farm management platforms.
                        </Typography>
                        <Button variant="outlined" size="small" sx={{ mt: 2 }}>
                          Connect
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1">Equipment Telematics</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Connect with tractor and equipment monitoring systems.
                        </Typography>
                        <Button variant="outlined" size="small" sx={{ mt: 2 }}>
                          Connect
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1">Accounting Software</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Sync with financial and accounting platforms.
                        </Typography>
                        <Button variant="outlined" size="small" sx={{ mt: 2 }}>
                          Connect
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>API Access</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Manage API keys and access for third-party integrations.
                </Typography>
                <Box sx={{ 
                  height: 150, 
                  bgcolor: 'grey.100', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  mt: 2
                }}>
                  <Typography>API Management UI Would Go Here</Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={tabValue} index={5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Password & Authentication</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Current Password"
                      type="password"
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="New Password"
                      type="password"
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Confirm New Password"
                      type="password"
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Enable Two-Factor Authentication"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={handleSave}
                    >
                      Update Password
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Access Control</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Manage user access and permissions for your farm account.
                </Typography>
                <List>
                  {[
                    { name: 'John Farmer (You)', email: 'john.farmer@example.com', role: 'Owner' },
                    { name: 'Sarah Farmer', email: 'sarah.farmer@example.com', role: 'Administrator' },
                    { name: 'Mike Johnson', email: 'mike.johnson@example.com', role: 'Fields Manager' },
                    { name: 'Lisa Williams', email: 'lisa.williams@example.com', role: 'Viewer' }
                  ].map((user, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemIcon>
                          <PersonIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary={user.name} 
                          secondary={`${user.email} • Role: ${user.role}`} 
                        />
                        {user.name !== 'John Farmer (You)' && (
                          <Button variant="outlined" size="small">
                            Edit Access
                          </Button>
                        )}
                      </ListItem>
                      {index < 3 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                <Box sx={{ mt: 2 }}>
                  <Button variant="contained" color="primary">
                    Invite User
                  </Button>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Security Log</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Recent account activity and security events.
                </Typography>
                <List>
                  {[
                    { event: 'Login', details: 'Successful login from Chrome on Windows', time: 'Today, 10:30 AM' },
                    { event: 'Password Changed', details: 'Password was updated', time: 'May 15, 2025, 2:45 PM' },
                    { event: 'New Device', details: 'First login from iPhone', time: 'May 10, 2025, 8:20 AM' },
                    { event: 'Failed Login Attempt', details: 'Failed login from unknown device', time: 'May 5, 2025, 11:15 PM' }
                  ].map((log, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemText 
                          primary={log.event} 
                          secondary={`${log.details} • ${log.time}`} 
                        />
                      </ListItem>
                      {index < 3 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                <Box sx={{ mt: 2 }}>
                  <Button variant="outlined">
                    View Full Security Log
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<SaveIcon />}
          onClick={handleSave}
          size="large"
        >
          Save All Settings
        </Button>
      </Box>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Need help with settings? <Button startIcon={<HelpIcon />} size="small">Contact Support</Button>
        </Typography>
      </Box>
    </Box>
  );
};

export default Settings;