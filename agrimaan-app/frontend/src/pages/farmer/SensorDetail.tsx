import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Switch,
  FormControlLabel,
  TextField,
  MenuItem
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';

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
      id={`sensor-tabpanel-${index}`}
      aria-labelledby={`sensor-tab-${index}`}
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

// Mock sensor data
const mockSensor = {
  id: 1,
  name: 'Soil Moisture Sensor 1',
  type: 'Moisture',
  model: 'AgroSense MS-200',
  serialNumber: 'MS2-2024-1234',
  Fields: 'North Fields',
  location: '34.0522° N, 118.2437° W',
  installDate: '2024-01-15',
  status: 'Active',
  batteryLevel: '85%',
  signalStrength: 'Good',
  firmware: 'v2.3.1',
  lastMaintenance: '2024-04-10',
  currentReading: '28%',
  lastUpdate: '2024-06-01 08:30 AM',
  readingFrequency: '15 minutes',
  thresholds: {
    low: '15%',
    high: '45%'
  },
  alerts: {
    lowMoisture: true,
    highMoisture: true,
    lowBattery: true,
    offline: true
  },
  readingHistory: [
    { timestamp: '2024-06-01 08:30 AM', value: '28%' },
    { timestamp: '2024-06-01 08:15 AM', value: '27%' },
    { timestamp: '2024-06-01 08:00 AM', value: '27%' },
    { timestamp: '2024-06-01 07:45 AM', value: '26%' },
    { timestamp: '2024-06-01 07:30 AM', value: '26%' },
    { timestamp: '2024-06-01 07:15 AM', value: '25%' },
    { timestamp: '2024-06-01 07:00 AM', value: '25%' },
    { timestamp: '2024-06-01 06:45 AM', value: '24%' },
    { timestamp: '2024-06-01 06:30 AM', value: '24%' },
    { timestamp: '2024-06-01 06:15 AM', value: '23%' }
  ],
  maintenanceHistory: [
    { date: '2024-04-10', type: 'Battery Replacement', notes: 'Replaced with new lithium battery' },
    { date: '2024-02-20', type: 'Calibration', notes: 'Recalibrated for spring season' },
    { date: '2024-01-15', type: 'Installation', notes: 'Initial installation and setup' }
  ]
};

const SensorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [sensor, setSensor] = useState(mockSensor);
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editedSensor, setEditedSensor] = useState(mockSensor);

  useEffect(() => {
    // In a real app, you would fetch the sensor data based on the ID
    console.log(`Fetching sensor with ID: ${id}`);
    // For now, we're using mock data
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    if (editMode) {
      // Save changes
      setSensor(editedSensor);
    }
    setEditMode(!editMode);
  };

  const handleInputChange = (Fields: string, value: any) => {
    setEditedSensor({
      ...editedSensor,
      [Fields]: value
    });
  };

  const handleThresholdChange = (Fields: string, value: string) => {
    setEditedSensor({
      ...editedSensor,
      thresholds: {
        ...editedSensor.thresholds,
        [Fields]: value
      }
    });
  };

  const handleAlertChange = (Fields: string, checked: boolean) => {
    setEditedSensor({
      ...editedSensor,
      alerts: {
        ...editedSensor.alerts,
        [Fields]: checked
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'error';
      case 'Maintenance':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getBatteryColor = (level: string) => {
    const percentage = parseInt(level.replace('%', ''));
    if (percentage > 70) return 'success';
    if (percentage > 30) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          component={Link}
          to="/sensors"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Sensors
        </Button>
        <Button
          variant="contained"
          startIcon={editMode ? undefined : <EditIcon />}
          color={editMode ? "success" : "primary"}
          onClick={handleEditToggle}
        >
          {editMode ? "Save Changes" : "Edit Sensor"}
        </Button>
      </Box>

      <Typography variant="h4" gutterBottom>
        {editMode ? (
          <TextField 
            value={editedSensor.name} 
            onChange={(e) => handleInputChange('name', e.target.value)}
            variant="standard"
            fullWidth
          />
        ) : (
          sensor.name
        )}
      </Typography>

      <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
        <DeviceThermostatIcon color="primary" />
        <Typography variant="subtitle1" color="text.secondary">
          {sensor.type} Sensor
        </Typography>
        <Chip 
          label={sensor.status} 
          color={getStatusColor(sensor.status) as any} 
          size="small"
          sx={{ ml: 1 }}
        />
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Current Reading</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', py: 3 }}>
              <Typography variant="h2" color="primary">
                {sensor.currentReading}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last Updated: {sensor.lastUpdate}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Sensor Information</Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Model" 
                  secondary={editMode ? 
                    <TextField 
                      value={editedSensor.model} 
                      onChange={(e) => handleInputChange('model', e.target.value)}
                      variant="standard"
                      size="small"
                      fullWidth
                    /> : 
                    sensor.model
                  } 
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="Serial Number" secondary={sensor.serialNumber} />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Fields" 
                  secondary={editMode ? 
                    <TextField 
                      select
                      value={editedSensor.Fields} 
                      onChange={(e) => handleInputChange('Fields', e.target.value)}
                      variant="standard"
                      size="small"
                      fullWidth
                    >
                      <MenuItem value="North Fields">North Fields</MenuItem>
                      <MenuItem value="South Fields">South Fields</MenuItem>
                      <MenuItem value="East Fields">East Fields</MenuItem>
                      <MenuItem value="West Fields">West Fields</MenuItem>
                    </TextField> : 
                    sensor.Fields
                  } 
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="Location" secondary={sensor.location} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Install Date" secondary={sensor.installDate} />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Reading Frequency" 
                  secondary={editMode ? 
                    <TextField 
                      select
                      value={editedSensor.readingFrequency} 
                      onChange={(e) => handleInputChange('readingFrequency', e.target.value)}
                      variant="standard"
                      size="small"
                      fullWidth
                    >
                      <MenuItem value="5 minutes">5 minutes</MenuItem>
                      <MenuItem value="15 minutes">15 minutes</MenuItem>
                      <MenuItem value="30 minutes">30 minutes</MenuItem>
                      <MenuItem value="1 hour">1 hour</MenuItem>
                    </TextField> : 
                    sensor.readingFrequency
                  } 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="sensor details tabs">
            <Tab label="Reading History" icon={<HistoryIcon />} iconPosition="start" />
            <Tab label="Settings" icon={<SettingsIcon />} iconPosition="start" />
            <Tab label="Maintenance" icon={<BatteryFullIcon />} iconPosition="start" />
            <Tab label="Alerts" icon={<NotificationsIcon />} iconPosition="start" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>Recent Readings</Typography>
          <List>
            {sensor.readingHistory.map((reading, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText 
                    primary={reading.value} 
                    secondary={reading.timestamp} 
                  />
                </ListItem>
                {index < sensor.readingHistory.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button variant="outlined">View Full History</Button>
          </Box>
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Thresholds</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Low Moisture Threshold"
                        value={editMode ? editedSensor.thresholds.low : sensor.thresholds.low}
                        onChange={(e) => handleThresholdChange('low', e.target.value)}
                        disabled={!editMode}
                        fullWidth
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="High Moisture Threshold"
                        value={editMode ? editedSensor.thresholds.high : sensor.thresholds.high}
                        onChange={(e) => handleThresholdChange('high', e.target.value)}
                        disabled={!editMode}
                        fullWidth
                        margin="normal"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Status Information</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Battery Level" 
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {sensor.batteryLevel}
                            <Chip 
                              label={sensor.batteryLevel} 
                              color={getBatteryColor(sensor.batteryLevel) as any} 
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        } 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Signal Strength" secondary={sensor.signalStrength} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Firmware Version" secondary={sensor.firmware} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Last Maintenance" secondary={sensor.lastMaintenance} />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Maintenance History</Typography>
          <List>
            {sensor.maintenanceHistory.map((maintenance, index) => (
              <Paper key={index} sx={{ mb: 2, p: 2 }}>
                <Typography variant="subtitle1">{maintenance.date}: {maintenance.type}</Typography>
                <Typography variant="body2">{maintenance.notes}</Typography>
              </Paper>
            ))}
          </List>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button variant="contained" color="primary">Schedule Maintenance</Button>
          </Box>
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Alert Settings</Typography>
          <List>
            <ListItem>
              <FormControlLabel
                control={
                  <Switch
                    checked={editMode ? editedSensor.alerts.lowMoisture : sensor.alerts.lowMoisture}
                    onChange={(e) => handleAlertChange('lowMoisture', e.target.checked)}
                    disabled={!editMode}
                  />
                }
                label="Low Moisture Alert"
              />
            </ListItem>
            <ListItem>
              <FormControlLabel
                control={
                  <Switch
                    checked={editMode ? editedSensor.alerts.highMoisture : sensor.alerts.highMoisture}
                    onChange={(e) => handleAlertChange('highMoisture', e.target.checked)}
                    disabled={!editMode}
                  />
                }
                label="High Moisture Alert"
              />
            </ListItem>
            <ListItem>
              <FormControlLabel
                control={
                  <Switch
                    checked={editMode ? editedSensor.alerts.lowBattery : sensor.alerts.lowBattery}
                    onChange={(e) => handleAlertChange('lowBattery', e.target.checked)}
                    disabled={!editMode}
                  />
                }
                label="Low Battery Alert"
              />
            </ListItem>
            <ListItem>
              <FormControlLabel
                control={
                  <Switch
                    checked={editMode ? editedSensor.alerts.offline : sensor.alerts.offline}
                    onChange={(e) => handleAlertChange('offline', e.target.checked)}
                    disabled={!editMode}
                  />
                }
                label="Offline Alert"
              />
            </ListItem>
          </List>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default SensorDetail;