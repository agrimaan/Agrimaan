import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Switch,
  FormControlLabel,
  FormGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Tabs,
  Tab,
  IconButton,
  Snackbar,
  Alert,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Slider,
  RadioGroup,
  Radio,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  Dashboard as DashboardIcon,
  Security as SecurityIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  NotificationsActive as NotificationsActiveIcon,
  PhoneAndroid as PhoneAndroidIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  SettingsBrightness as SettingsBrightnessIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Edit as EditIcon
} from '@mui/icons-material';

// Define interfaces for user preferences
interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  weatherAlerts: boolean;
  marketPrices: boolean;
  systemUpdates: boolean;
  fieldAlerts: boolean;
  cropHealth: boolean;
}

interface DisplayPreferences {
  theme: 'light' | 'dark' | 'system';
  dashboardLayout: 'compact' | 'comfortable' | 'spacious';
  dataVisualization: 'simple' | 'detailed';
  measurementUnits: 'metric' | 'imperial';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  fontSize: number;
}

interface PrivacyPreferences {
  shareData: boolean;
  shareLocation: boolean;
  shareCropData: boolean;
  allowAnalytics: boolean;
  profileVisibility: 'public' | 'connections' | 'private';
}

interface LanguagePreferences {
  language: string;
  region: string;
  currency: string;
  timezone: string;
}

interface UserPreferencesData {
  notifications: NotificationPreferences;
  display: DisplayPreferences;
  privacy: PrivacyPreferences;
  language: LanguagePreferences;
}

// Mock initial preferences
const initialPreferences: UserPreferencesData = {
  notifications: {
    email: true,
    sms: false,
    push: true,
    inApp: true,
    weatherAlerts: true,
    marketPrices: true,
    systemUpdates: false,
    fieldAlerts: true,
    cropHealth: true
  },
  display: {
    theme: 'system',
    dashboardLayout: 'comfortable',
    dataVisualization: 'detailed',
    measurementUnits: 'metric',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '24h',
    fontSize: 16
  },
  privacy: {
    shareData: true,
    shareLocation: true,
    shareCropData: false,
    allowAnalytics: true,
    profileVisibility: 'connections'
  },
  language: {
    language: 'en',
    region: 'US',
    currency: 'USD',
    timezone: 'America/Los_Angeles'
  }
};

// Available languages
const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' }
];

// Available regions
const regions = [
  { code: 'US', name: 'United States' },
  { code: 'IN', name: 'India' },
  { code: 'CN', name: 'China' },
  { code: 'BR', name: 'Brazil' },
  { code: 'RU', name: 'Russia' },
  { code: 'EU', name: 'European Union' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'JP', name: 'Japan' }
];

// Available currencies
const currencies = [
  { code: 'USD', name: 'US Dollar ($)', symbol: '$' },
  { code: 'EUR', name: 'Euro (€)', symbol: '€' },
  { code: 'INR', name: 'Indian Rupee (₹)', symbol: '₹' },
  { code: 'CNY', name: 'Chinese Yuan (¥)', symbol: '¥' },
  { code: 'GBP', name: 'British Pound (£)', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen (¥)', symbol: '¥' },
  { code: 'RUB', name: 'Russian Ruble (₽)', symbol: '₽' },
  { code: 'BRL', name: 'Brazilian Real (R$)', symbol: 'R$' }
];

// Available timezones
const timezones = [
  'America/Los_Angeles',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney',
  'Pacific/Auckland'
];

const UserPreferences: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [preferences, setPreferences] = useState<UserPreferencesData>(initialPreferences);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [hasChanges, setHasChanges] = useState(false);
  const [originalPreferences, setOriginalPreferences] = useState<UserPreferencesData>(initialPreferences);
  
  // Simulate loading preferences from API
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setOriginalPreferences({...initialPreferences});
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Handle notification preference change
  const handleNotificationChange = (key: keyof NotificationPreferences) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: event.target.checked
      }
    }));
    setHasChanges(true);
  };
  
  // Handle display preference change
  const handleDisplayChange = <K extends keyof DisplayPreferences>(key: K, value: DisplayPreferences[K]) => {
    setPreferences(prev => ({
      ...prev,
      display: {
        ...prev.display,
        [key]: value
      }
    }));
    setHasChanges(true);
  };
  
  // Handle privacy preference change
  const handlePrivacyChange = <K extends keyof PrivacyPreferences>(key: K, value: PrivacyPreferences[K]) => {
    setPreferences(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
    setHasChanges(true);
  };
  
  // Handle language preference change
  const handleLanguageChange = <K extends keyof LanguagePreferences>(key: K, value: LanguagePreferences[K]) => {
    setPreferences(prev => ({
      ...prev,
      language: {
        ...prev.language,
        [key]: value
      }
    }));
    setHasChanges(true);
  };
  
  // Handle save preferences
  const handleSavePreferences = () => {
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setSnackbarMessage('Preferences saved successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setHasChanges(false);
      setOriginalPreferences({...preferences});
    }, 1500);
  };
  
  // Handle reset preferences
  const handleResetPreferences = () => {
    setPreferences({...originalPreferences});
    setHasChanges(false);
    setSnackbarMessage('Preferences reset to last saved state');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };
  
  // Handle snackbar close
  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };
  
  // Render notification preferences
  const renderNotificationPreferences = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Notification Channels
        </Typography>
        <FormGroup>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.notifications.email}
                    onChange={handleNotificationChange('email')}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon sx={{ mr: 1 }} />
                    Email Notifications
                  </Box>
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.notifications.sms}
                    onChange={handleNotificationChange('sms')}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SmsIcon sx={{ mr: 1 }} />
                    SMS Notifications
                  </Box>
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.notifications.push}
                    onChange={handleNotificationChange('push')}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneAndroidIcon sx={{ mr: 1 }} />
                    Push Notifications
                  </Box>
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.notifications.inApp}
                    onChange={handleNotificationChange('inApp')}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <NotificationsActiveIcon sx={{ mr: 1 }} />
                    In-App Notifications
                  </Box>
                }
              />
            </Grid>
          </Grid>
        </FormGroup>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Notification Types
        </Typography>
        <FormGroup>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.notifications.weatherAlerts}
                    onChange={handleNotificationChange('weatherAlerts')}
                    color="primary"
                  />
                }
                label="Weather Alerts"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.notifications.marketPrices}
                    onChange={handleNotificationChange('marketPrices')}
                    color="primary"
                  />
                }
                label="Market Price Updates"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.notifications.systemUpdates}
                    onChange={handleNotificationChange('systemUpdates')}
                    color="primary"
                  />
                }
                label="System Updates"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.notifications.fieldAlerts}
                    onChange={handleNotificationChange('fieldAlerts')}
                    color="primary"
                  />
                }
                label="Field Alerts"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.notifications.cropHealth}
                    onChange={handleNotificationChange('cropHealth')}
                    color="primary"
                  />
                }
                label="Crop Health Alerts"
              />
            </Grid>
          </Grid>
        </FormGroup>
      </CardContent>
    </Card>
  );
  
  // Render display preferences
  const renderDisplayPreferences = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Theme Settings
        </Typography>
        <Box sx={{ mb: 3 }}>
          <FormControl component="fieldset">
            <RadioGroup
              row
              value={preferences.display.theme}
              onChange={(e) => handleDisplayChange('theme', e.target.value as 'light' | 'dark' | 'system')}
            >
              <FormControlLabel 
                value="light" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LightModeIcon sx={{ mr: 1 }} />
                    Light
                  </Box>
                } 
              />
              <FormControlLabel 
                value="dark" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DarkModeIcon sx={{ mr: 1 }} />
                    Dark
                  </Box>
                } 
              />
              <FormControlLabel 
                value="system" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SettingsBrightnessIcon sx={{ mr: 1 }} />
                    System
                  </Box>
                } 
              />
            </RadioGroup>
          </FormControl>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Layout & Visualization
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel id="dashboard-layout-label">Dashboard Layout</InputLabel>
              <Select
                labelId="dashboard-layout-label"
                id="dashboard-layout"
                value={preferences.display.dashboardLayout}
                onChange={(e) => handleDisplayChange('dashboardLayout', e.target.value as 'compact' | 'comfortable' | 'spacious')}
                label="Dashboard Layout"
              >
                <MenuItem value="compact">Compact</MenuItem>
                <MenuItem value="comfortable">Comfortable</MenuItem>
                <MenuItem value="spacious">Spacious</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel id="data-visualization-label">Data Visualization</InputLabel>
              <Select
                labelId="data-visualization-label"
                id="data-visualization"
                value={preferences.display.dataVisualization}
                onChange={(e) => handleDisplayChange('dataVisualization', e.target.value as 'simple' | 'detailed')}
                label="Data Visualization"
              >
                <MenuItem value="simple">Simple</MenuItem>
                <MenuItem value="detailed">Detailed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          Font Size
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="body2">Small</Typography>
          <Slider
            value={preferences.display.fontSize}
            min={12}
            max={20}
            step={1}
            onChange={(_, value) => handleDisplayChange('fontSize', value as number)}
            valueLabelDisplay="auto"
            sx={{ mx: 2, flexGrow: 1 }}
          />
          <Typography variant="body2">Large</Typography>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Units & Formats
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel id="measurement-units-label">Measurement Units</InputLabel>
              <Select
                labelId="measurement-units-label"
                id="measurement-units"
                value={preferences.display.measurementUnits}
                onChange={(e) => handleDisplayChange('measurementUnits', e.target.value as 'metric' | 'imperial')}
                label="Measurement Units"
              >
                <MenuItem value="metric">Metric (km, kg, °C)</MenuItem>
                <MenuItem value="imperial">Imperial (mi, lb, °F)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel id="date-format-label">Date Format</InputLabel>
              <Select
                labelId="date-format-label"
                id="date-format"
                value={preferences.display.dateFormat}
                onChange={(e) => handleDisplayChange('dateFormat', e.target.value as 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD')}
                label="Date Format"
              >
                <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="time-format-label">Time Format</InputLabel>
              <Select
                labelId="time-format-label"
                id="time-format"
                value={preferences.display.timeFormat}
                onChange={(e) => handleDisplayChange('timeFormat', e.target.value as '12h' | '24h')}
                label="Time Format"
              >
                <MenuItem value="12h">12-hour (AM/PM)</MenuItem>
                <MenuItem value="24h">24-hour</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
  
  // Render privacy preferences
  const renderPrivacyPreferences = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Data Sharing
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              {preferences.privacy.shareData ? <LockOpenIcon color="primary" /> : <LockIcon color="error" />}
            </ListItemIcon>
            <ListItemText 
              primary="Share Anonymous Usage Data" 
              secondary="Help us improve by sharing anonymous usage statistics" 
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={preferences.privacy.shareData}
                onChange={(e) => handlePrivacyChange('shareData', e.target.checked)}
                color="primary"
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemIcon>
              {preferences.privacy.shareLocation ? <LockOpenIcon color="primary" /> : <LockIcon color="error" />}
            </ListItemIcon>
            <ListItemText 
              primary="Share Location Data" 
              secondary="Allow access to your location for weather and field mapping" 
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={preferences.privacy.shareLocation}
                onChange={(e) => handlePrivacyChange('shareLocation', e.target.checked)}
                color="primary"
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemIcon>
              {preferences.privacy.shareCropData ? <LockOpenIcon color="primary" /> : <LockIcon color="error" />}
            </ListItemIcon>
            <ListItemText 
              primary="Share Crop Data" 
              secondary="Share anonymized crop data for agricultural research" 
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={preferences.privacy.shareCropData}
                onChange={(e) => handlePrivacyChange('shareCropData', e.target.checked)}
                color="primary"
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemIcon>
              {preferences.privacy.allowAnalytics ? <LockOpenIcon color="primary" /> : <LockIcon color="error" />}
            </ListItemIcon>
            <ListItemText 
              primary="Allow Analytics" 
              secondary="Enable analytics to improve your experience" 
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={preferences.privacy.allowAnalytics}
                onChange={(e) => handlePrivacyChange('allowAnalytics', e.target.checked)}
                color="primary"
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Profile Visibility
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup
            value={preferences.privacy.profileVisibility}
            onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value as 'public' | 'connections' | 'private')}
          >
            <FormControlLabel 
              value="public" 
              control={<Radio />} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PublicIcon sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="body1">Public</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Anyone can view your profile and farm details
                    </Typography>
                  </Box>
                </Box>
              } 
            />
            <FormControlLabel 
              value="connections" 
              control={<Radio />} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <VisibilityIcon sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="body1">Connections Only</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Only your connections can view your profile and farm details
                    </Typography>
                  </Box>
                </Box>
              } 
            />
            <FormControlLabel 
              value="private" 
              control={<Radio />} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <VisibilityOffIcon sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="body1">Private</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Your profile and farm details are private
                    </Typography>
                  </Box>
                </Box>
              } 
            />
          </RadioGroup>
        </FormControl>
      </CardContent>
    </Card>
  );
  
  // Render language preferences
  const renderLanguagePreferences = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Language & Region
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel id="language-label">Language</InputLabel>
              <Select
                labelId="language-label"
                id="language"
                value={preferences.language.language}
                onChange={(e) => handleLanguageChange('language', e.target.value)}
                label="Language"
              >
                {languages.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>{lang.flag}</Typography>
                      {lang.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel id="region-label">Region</InputLabel>
              <Select
                labelId="region-label"
                id="region"
                value={preferences.language.region}
                onChange={(e) => handleLanguageChange('region', e.target.value)}
                label="Region"
              >
                {regions.map((region) => (
                  <MenuItem key={region.code} value={region.code}>
                    {region.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Currency & Time
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel id="currency-label">Currency</InputLabel>
              <Select
                labelId="currency-label"
                id="currency"
                value={preferences.language.currency}
                onChange={(e) => handleLanguageChange('currency', e.target.value)}
                label="Currency"
              >
                {currencies.map((currency) => (
                  <MenuItem key={currency.code} value={currency.code}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ mr: 1, fontWeight: 'bold' }}>{currency.symbol}</Typography>
                      {currency.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="timezone-label">Timezone</InputLabel>
              <Select
                labelId="timezone-label"
                id="timezone"
                value={preferences.language.timezone}
                onChange={(e) => handleLanguageChange('timezone', e.target.value)}
                label="Timezone"
              >
                {timezones.map((timezone) => (
                  <MenuItem key={timezone} value={timezone}>
                    {timezone.replace('_', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
  
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant={isMobile ? "h5" : "h4"} component="h1" gutterBottom>
          User Preferences
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Customize your experience with personalized settings
        </Typography>
      </Box>
      
      {/* Tabs for different preference categories */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab 
            icon={isMobile ? <NotificationsIcon /> : undefined}
            iconPosition="start"
            label={isMobile ? undefined : "Notifications"} 
          />
          <Tab 
            icon={isMobile ? <PaletteIcon /> : undefined}
            iconPosition="start"
            label={isMobile ? undefined : "Display"} 
          />
          <Tab 
            icon={isMobile ? <SecurityIcon /> : undefined}
            iconPosition="start"
            label={isMobile ? undefined : "Privacy"} 
          />
          <Tab 
            icon={isMobile ? <LanguageIcon /> : undefined}
            iconPosition="start"
            label={isMobile ? undefined : "Language & Region"} 
          />
        </Tabs>
      </Box>
      
      {/* Loading state */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Tab panels */}
          <Box sx={{ mb: 3 }}>
            {activeTab === 0 && renderNotificationPreferences()}
            {activeTab === 1 && renderDisplayPreferences()}
            {activeTab === 2 && renderPrivacyPreferences()}
            {activeTab === 3 && renderLanguagePreferences()}
          </Box>
          
          {/* Action buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleResetPreferences}
              disabled={!hasChanges || saving}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={handleSavePreferences}
              disabled={!hasChanges || saving}
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </Box>
        </>
      )}
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserPreferences;