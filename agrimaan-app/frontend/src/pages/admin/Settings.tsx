
import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Grid,
  Divider,
  TextField,
  FormControl,
  FormControlLabel,
  FormGroup,
  Switch,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Save as SaveIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Storage as StorageIcon,
  Email as EmailIcon,
  Payment as PaymentIcon,
  Help as HelpIcon,
  Info as InfoIcon
} from '@mui/icons-material';

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
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
}

const AdminSettings: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // General Settings
  const [siteName, setSiteName] = useState('Agrimaan');
  const [siteDescription, setSiteDescription] = useState('Agricultural Management Platform');
  const [contactEmail, setContactEmail] = useState('support@agrimaan.com');
  const [contactPhone, setContactPhone] = useState('+91 1234567890');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  
  // Security Settings
  const [passwordPolicy, setPasswordPolicy] = useState('medium');
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [ipRestriction, setIpRestriction] = useState(false);
  
  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [userNotifications, setUserNotifications] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);
  
  // Payment Settings
  const [paymentGateway, setPaymentGateway] = useState('razorpay');
  const [currencyCode, setCurrencyCode] = useState('INR');
  const [taxRate, setTaxRate] = useState('18');
  const [allowCashOnDelivery, setAllowCashOnDelivery] = useState(true);
  const [allowBankTransfer, setAllowBankTransfer] = useState(true);
  
  // System Settings
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [logRetention, setLogRetention] = useState('30');
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleSaveSettings = () => {
    // In a real implementation, this would save the settings to the backend
    setSuccessMessage('Settings saved successfully');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Admin Settings
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
        >
          Save All Settings
        </Button>
      </Box>
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}
      
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<SettingsIcon />} label="General" {...a11yProps(0)} />
          <Tab icon={<SecurityIcon />} label="Security" {...a11yProps(1)} />
          <Tab icon={<NotificationsIcon />} label="Notifications" {...a11yProps(2)} />
          <Tab icon={<PaymentIcon />} label="Payment" {...a11yProps(3)} />
          <Tab icon={<StorageIcon />} label="System" {...a11yProps(4)} />
          <Tab icon={<InfoIcon />} label="About" {...a11yProps(5)} />
        </Tabs>
      </Paper>
      
      {/* General Settings */}
      <TabPanel value={tabValue} index={0}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            General Settings
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Site Name"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Site Description"
                value={siteDescription}
                onChange={(e) => setSiteDescription(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={language}
                  label="Language"
                  onChange={(e: SelectChangeEvent) => setLanguage(e.target.value)}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="hi">Hindi</MenuItem>
                  <MenuItem value="mr">Marathi</MenuItem>
                  <MenuItem value="ta">Tamil</MenuItem>
                  <MenuItem value="te">Telugu</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Timezone</InputLabel>
                <Select
                  value={timezone}
                  label="Timezone"
                  onChange={(e: SelectChangeEvent) => setTimezone(e.target.value)}
                >
                  <MenuItem value="Asia/Kolkata">Asia/Kolkata (IST)</MenuItem>
                  <MenuItem value="UTC">UTC</MenuItem>
                  <MenuItem value="America/New_York">America/New_York (EST)</MenuItem>
                  <MenuItem value="Europe/London">Europe/London (GMT)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </TabPanel>
      
      {/* Security Settings */}
      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Security Settings
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Password Policy</InputLabel>
                <Select
                  value={passwordPolicy}
                  label="Password Policy"
                  onChange={(e: SelectChangeEvent) => setPasswordPolicy(e.target.value)}
                >
                  <MenuItem value="low">Low (6+ characters)</MenuItem>
                  <MenuItem value="medium">Medium (8+ characters, alphanumeric)</MenuItem>
                  <MenuItem value="high">High (10+ characters, alphanumeric with special chars)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Session Timeout (minutes)</InputLabel>
                <Select
                  value={sessionTimeout}
                  label="Session Timeout (minutes)"
                  onChange={(e: SelectChangeEvent) => setSessionTimeout(e.target.value)}
                >
                  <MenuItem value="15">15 minutes</MenuItem>
                  <MenuItem value="30">30 minutes</MenuItem>
                  <MenuItem value="60">60 minutes</MenuItem>
                  <MenuItem value="120">120 minutes</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={twoFactorAuth}
                      onChange={(e) => setTwoFactorAuth(e.target.checked)}
                    />
                  }
                  label="Enable Two-Factor Authentication"
                />
              </FormGroup>
            </Grid>
            <Grid item xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={ipRestriction}
                      onChange={(e) => setIpRestriction(e.target.checked)}
                    />
                  }
                  label="Enable IP Restriction"
                />
              </FormGroup>
            </Grid>
          </Grid>
        </Paper>
      </TabPanel>
      
      {/* Notification Settings */}
      <TabPanel value={tabValue} index={2}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Notification Settings
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Notification Channels
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                    />
                  }
                  label="Email Notifications"
                />
              </FormGroup>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={smsNotifications}
                      onChange={(e) => setSmsNotifications(e.target.checked)}
                    />
                  }
                  label="SMS Notifications"
                />
              </FormGroup>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={pushNotifications}
                      onChange={(e) => setPushNotifications(e.target.checked)}
                    />
                  }
                  label="Push Notifications"
                />
              </FormGroup>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Notification Types
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={orderNotifications}
                      onChange={(e) => setOrderNotifications(e.target.checked)}
                    />
                  }
                  label="Order Notifications"
                />
              </FormGroup>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={userNotifications}
                      onChange={(e) => setUserNotifications(e.target.checked)}
                    />
                  }
                  label="User Notifications"
                />
              </FormGroup>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemNotifications}
                      onChange={(e) => setSystemNotifications(e.target.checked)}
                    />
                  }
                  label="System Notifications"
                />
              </FormGroup>
            </Grid>
          </Grid>
        </Paper>
      </TabPanel>
      
      {/* Payment Settings */}
      <TabPanel value={tabValue} index={3}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Payment Settings
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Gateway</InputLabel>
                <Select
                  value={paymentGateway}
                  label="Payment Gateway"
                  onChange={(e: SelectChangeEvent) => setPaymentGateway(e.target.value)}
                >
                  <MenuItem value="razorpay">Razorpay</MenuItem>
                  <MenuItem value="paytm">Paytm</MenuItem>
                  <MenuItem value="stripe">Stripe</MenuItem>
                  <MenuItem value="paypal">PayPal</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={currencyCode}
                  label="Currency"
                  onChange={(e: SelectChangeEvent) => setCurrencyCode(e.target.value)}
                >
                  <MenuItem value="INR">Indian Rupee (\u20b9)</MenuItem>
                  <MenuItem value="USD">US Dollar ($)</MenuItem>
                  <MenuItem value="EUR">Euro (\u20ac)</MenuItem>
                  <MenuItem value="GBP">British Pound (\u00a3)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tax Rate (%)"
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={allowCashOnDelivery}
                      onChange={(e) => setAllowCashOnDelivery(e.target.checked)}
                    />
                  }
                  label="Allow Cash on Delivery"
                />
              </FormGroup>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={allowBankTransfer}
                      onChange={(e) => setAllowBankTransfer(e.target.checked)}
                    />
                  }
                  label="Allow Bank Transfer"
                />
              </FormGroup>
            </Grid>
          </Grid>
        </Paper>
      </TabPanel>
      
      {/* System Settings */}
      <TabPanel value={tabValue} index={4}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            System Settings
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={maintenanceMode}
                      onChange={(e) => setMaintenanceMode(e.target.checked)}
                    />
                  }
                  label="Maintenance Mode"
                />
              </FormGroup>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={debugMode}
                      onChange={(e) => setDebugMode(e.target.checked)}
                    />
                  }
                  label="Debug Mode"
                />
              </FormGroup>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Backup Frequency</InputLabel>
                <Select
                  value={backupFrequency}
                  label="Backup Frequency"
                  onChange={(e: SelectChangeEvent) => setBackupFrequency(e.target.value)}
                >
                  <MenuItem value="hourly">Hourly</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Log Retention (days)</InputLabel>
                <Select
                  value={logRetention}
                  label="Log Retention (days)"
                  onChange={(e: SelectChangeEvent) => setLogRetention(e.target.value)}
                >
                  <MenuItem value="7">7 days</MenuItem>
                  <MenuItem value="30">30 days</MenuItem>
                  <MenuItem value="90">90 days</MenuItem>
                  <MenuItem value="365">365 days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button variant="contained" color="primary">
                  Run System Backup
                </Button>
                <Button variant="outlined" color="error">
                  Clear Cache
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </TabPanel>
      
      {/* About */}
      <TabPanel value={tabValue} index={5}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            About Agrimaan
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="System Information" />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemText primary="Version" secondary="1.0.0" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Last Updated" secondary="September 2, 2025" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Environment" secondary="Production" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Database" secondary="MongoDB 6.0" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Node.js Version" secondary="18.12.0" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="React Version" secondary="18.2.0" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Support Information" />
                <CardContent>
                  <Typography variant="body1" paragraph>
                    For technical support, please contact:
                  </Typography>
                  <Typography variant="body1">
                    Email: support@agrimaan.com
                  </Typography>
                  <Typography variant="body1">
                    Phone: +91 1234567890
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    Documentation: <a href="https://docs.agrimaan.com" target="_blank" rel="noopener noreferrer">https://docs.agrimaan.com</a>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </TabPanel>
    </Container>
  );
};

export default AdminSettings;
