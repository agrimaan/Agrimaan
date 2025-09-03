
import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Grid,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Terrain as TerrainIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Grass as GrassIcon,
  Sensors as SensorsIcon,
  Person as PersonIcon,
  LocationOn as LocationOnIcon,
  Straighten as StraightenIcon,
  WaterDrop as WaterDropIcon,
  Thermostat as ThermostatIcon,
  Air as AirIcon,
  WbSunny as WbSunnyIcon
} from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// Define types
interface Field {
  _id: string;
  name: string;
  location: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  size: {
    value: number;
    unit: string;
  };
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  soilType: string;
  waterSource: string;
  crops: Array<{
    _id: string;
    name: string;
    variety: string;
    status: string;
    plantingDate: string;
    harvestDate: string | null;
  }>;
  sensors: Array<{
    _id: string;
    name: string;
    type: string;
    status: string;
    lastReading: {
      value: number;
      unit: string;
      timestamp: string;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

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
      id={`field-tabpanel-${index}`}
      aria-labelledby={`field-tab-${index}`}
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
    id: `field-tab-${index}`,
    'aria-controls': `field-tabpanel-${index}`,
  };
}

const AdminFieldDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [field, setField] = useState<Field | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchFieldData = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would be an API call
        // For now, we'll use mock data
        
        // Mock field data
        const mockField: Field = {
          _id: id || 'f1',
          name: 'North Farm',
          location: {
            address: 'Village X, District Y, State Z',
            coordinates: {
              latitude: 28.6139,
              longitude: 77.2090
            }
          },
          size: {
            value: 5.2,
            unit: 'hectares'
          },
          owner: {
            _id: 'u1',
            name: 'Farmer Singh',
            email: 'farmer.singh@example.com'
          },
          soilType: 'Clay Loam',
          waterSource: 'Canal Irrigation',
          crops: [
            {
              _id: 'c1',
              name: 'Wheat',
              variety: 'HD-2967',
              status: 'growing',
              plantingDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
              harvestDate: null
            },
            {
              _id: 'c2',
              name: 'Rice',
              variety: 'Basmati-1121',
              status: 'harvested',
              plantingDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
              harvestDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            }
          ],
          sensors: [
            {
              _id: 's1',
              name: 'Soil Moisture Sensor 1',
              type: 'soil_moisture',
              status: 'active',
              lastReading: {
                value: 42.5,
                unit: '%',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
              }
            },
            {
              _id: 's2',
              name: 'Temperature Sensor 1',
              type: 'temperature',
              status: 'active',
              lastReading: {
                value: 28.3,
                unit: '\u00b0C',
                timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
              }
            },
            {
              _id: 's3',
              name: 'Humidity Sensor 1',
              type: 'humidity',
              status: 'inactive',
              lastReading: {
                value: 65.8,
                unit: '%',
                timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
              }
            }
          ],
          createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        setField(mockField);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching field data:', err);
        setError(err.message || 'Failed to load field data');
        setLoading(false);
      }
    };

    fetchFieldData();
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format timestamp
  const formatTimestamp = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'growing':
        return 'primary';
      case 'harvested':
        return 'success';
      case 'failed':
        return 'error';
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'maintenance':
        return 'info';
      default:
        return 'default';
    }
  };

  // Get sensor type icon
  const getSensorTypeIcon = (type: string) => {
    switch (type) {
      case 'soil_moisture':
        return <WaterDropIcon />;
      case 'temperature':
        return <ThermostatIcon />;
      case 'humidity':
        return <AirIcon />;
      case 'light':
        return <WbSunnyIcon />;
      default:
        return <SensorsIcon />;
    }
  };

  // Format sensor type label
  const formatSensorType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !field) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          {error || 'Field not found'}
        </Alert>
        <Button
          component={RouterLink}
          to="/admin/fields"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Back to Fields
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            component={RouterLink}
            to="/admin/fields"
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1">
            Field Details
          </Typography>
        </Box>
        
        <Box>
          <Tooltip title="Edit Field">
            <IconButton 
              component={RouterLink} 
              to={`/admin/fields/${field._id}/edit`}
              color="primary"
              sx={{ mr: 1 }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Field">
            <IconButton color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Field Overview Card */}
      <Paper elevation={3} sx={{ mb: 4, overflow: 'hidden' }}>
        <Box sx={{ 
          p: 3, 
          bgcolor: 'success.main', 
          color: 'success.contrastText',
          display: 'flex',
          alignItems: 'center'
        }}>
          <TerrainIcon sx={{ fontSize: 60, mr: 3 }} />
          <Box>
            <Typography variant="h4" component="h2" gutterBottom>
              {field.name}
            </Typography>
            <Typography variant="subtitle1">
              {field.size.value} {field.size.unit} \u2022 {field.soilType}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <LocationOnIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Location" 
                    secondary={field.location.address} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <StraightenIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Size" 
                    secondary={`${field.size.value} ${field.size.unit}`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WaterDropIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Water Source" 
                    secondary={field.waterSource} 
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Owner" 
                    secondary={
                      <RouterLink to={`/admin/users/${field.owner._id}`}>
                        {field.owner.name}
                      </RouterLink>
                    } 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <GrassIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Crops" 
                    secondary={`${field.crops.length} crops`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SensorsIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Sensors" 
                    secondary={`${field.sensors.length} sensors`} 
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Tabs for different sections */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Crops" icon={<GrassIcon />} iconPosition="start" {...a11yProps(0)} />
          <Tab label="Sensors" icon={<SensorsIcon />} iconPosition="start" {...a11yProps(1)} />
          <Tab label="Location" icon={<LocationOnIcon />} iconPosition="start" {...a11yProps(2)} />
        </Tabs>
      </Paper>

      {/* Crops Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Crops in this Field
          </Typography>
          <Button 
            component={RouterLink} 
            to={`/admin/fields/${field._id}/crops/new`} 
            variant="contained" 
            startIcon={<GrassIcon />}
          >
            Add Crop
          </Button>
        </Box>
        
        {field.crops.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No crops have been added to this field
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {field.crops.map((crop) => (
              <Grid item xs={12} md={6} key={crop._id}>
                <Card>
                  <CardHeader
                    title={`${crop.name} - ${crop.variety}`}
                    subheader={`Status: ${crop.status.charAt(0).toUpperCase() + crop.status.slice(1)}`}
                    action={
                      <Chip 
                        label={crop.status.charAt(0).toUpperCase() + crop.status.slice(1)} 
                        color={getStatusColor(crop.status)}
                        size="small"
                      />
                    }
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Planting Date:</strong> {formatDate(crop.plantingDate)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Harvest Date:</strong> {formatDate(crop.harvestDate)}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button 
                        component={RouterLink} 
                        to={`/admin/crops/${crop._id}`} 
                        size="small" 
                        variant="outlined"
                      >
                        View Details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Sensors Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Sensors in this Field
          </Typography>
          <Button 
            component={RouterLink} 
            to={`/admin/fields/${field._id}/sensors/new`} 
            variant="contained" 
            startIcon={<SensorsIcon />}
          >
            Add Sensor
          </Button>
        </Box>
        
        {field.sensors.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No sensors have been added to this field
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Reading</TableCell>
                  <TableCell>Timestamp</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {field.sensors.map((sensor) => (
                  <TableRow key={sensor._id}>
                    <TableCell>{sensor.name}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getSensorTypeIcon(sensor.type)}
                        <Typography sx={{ ml: 1 }}>
                          {formatSensorType(sensor.type)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={sensor.status.charAt(0).toUpperCase() + sensor.status.slice(1)} 
                        color={getStatusColor(sensor.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {sensor.lastReading.value} {sensor.lastReading.unit}
                    </TableCell>
                    <TableCell>
                      {formatTimestamp(sensor.lastReading.timestamp)}
                    </TableCell>
                    <TableCell align="right">
                      <Button 
                        component={RouterLink} 
                        to={`/admin/sensors/${sensor._id}`} 
                        size="small" 
                        variant="outlined"
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* Location Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Field Location
        </Typography>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            <strong>Address:</strong> {field.location.address}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Coordinates:</strong> {field.location.coordinates.latitude}, {field.location.coordinates.longitude}
          </Typography>
        </Paper>
        
        <Paper sx={{ p: 3, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="text.secondary">
            Map view is not available in this version
          </Typography>
        </Paper>
      </TabPanel>
    </Container>
  );
};

export default AdminFieldDetail;
