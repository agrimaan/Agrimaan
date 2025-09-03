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
  TableRow,
  LinearProgress
} from '@mui/material';
import {
  Grass as GrassIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Terrain as TerrainIcon,
  CalendarMonth as CalendarIcon,
  LocalOffer as LocalOfferIcon,
  Person as PersonIcon,
  Straighten as StraightenIcon,
  WaterDrop as WaterDropIcon,
  Thermostat as ThermostatIcon,
  Air as AirIcon,
  WbSunny as WbSunnyIcon,
  Sensors as SensorsIcon,
  BarChart as BarChartIcon,
  Notes as NotesIcon,
  Spa as SpaIcon,
  Nature as EcoIcon,
  Science as ScienceIcon
} from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// Define types
interface Crop {
  _id: string;
  name: string;
  variety: string;
  field: {
    _id: string;
    name: string;
    owner: {
      _id: string;
      name: string;
    }
  };
  plantingDate: string;
  harvestDate: string | null;
  expectedHarvestDate: string | null;
  status: 'growing' | 'harvested' | 'sold' | 'failed';
  quantity: {
    expected: number;
    actual: number | null;
    unit: string;
  };
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  growthStage: string;
  notes: string;
  activities: Array<{
    _id: string;
    type: string;
    date: string;
    description: string;
    performedBy: string;
  }>;
  sensorData: {
    soilMoisture: Array<{
      date: string;
      value: number;
    }>;
    temperature: Array<{
      date: string;
      value: number;
    }>;
    humidity: Array<{
      date: string;
      value: number;
    }>;
  };
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
      id={`crop-tabpanel-${index}`}
      aria-labelledby={`crop-tab-${index}`}
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
    id: `crop-tab-${index}`,
    'aria-controls': `crop-tabpanel-${index}`,
  };
}

const AdminCropDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [crop, setCrop] = useState<Crop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchCropData = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would be an API call
        // For now, we'll use mock data
        
        // Mock crop data
        const mockCrop: Crop = {
          _id: id || 'c1',
          name: 'Wheat',
          variety: 'HD-2967',
          field: {
            _id: 'f1',
            name: 'North Farm',
            owner: {
              _id: 'u1',
              name: 'Farmer Singh'
            }
          },
          plantingDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          harvestDate: null,
          expectedHarvestDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'growing',
          quantity: {
            expected: 2500,
            actual: null,
            unit: 'kg'
          },
          healthStatus: 'excellent',
          growthStage: 'Vegetative',
          notes: 'Growing well with adequate irrigation. No pest issues observed so far.',
          activities: [
            {
              _id: 'a1',
              type: 'Planting',
              date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
              description: 'Seeds planted at 5cm depth with row spacing of 20cm',
              performedBy: 'Farmer Singh'
            },
            {
              _id: 'a2',
              type: 'Fertilizer Application',
              date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
              description: 'Applied NPK fertilizer at recommended dosage',
              performedBy: 'Farm Worker 1'
            },
            {
              _id: 'a3',
              type: 'Irrigation',
              date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              description: 'Flood irrigation applied',
              performedBy: 'Farmer Singh'
            },
            {
              _id: 'a4',
              type: 'Pest Control',
              date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
              description: 'Applied organic pesticide to control aphids',
              performedBy: 'Farm Worker 2'
            }
          ],
          sensorData: {
            soilMoisture: [
              { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), value: 42 },
              { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), value: 40 },
              { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), value: 38 },
              { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), value: 45 },
              { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), value: 43 },
              { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), value: 41 },
              { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), value: 40 }
            ],
            temperature: [
              { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), value: 28 },
              { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), value: 29 },
              { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), value: 30 },
              { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), value: 31 },
              { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), value: 30 },
              { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), value: 29 },
              { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), value: 28 }
            ],
            humidity: [
              { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), value: 65 },
              { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), value: 68 },
              { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), value: 70 },
              { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), value: 72 },
              { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), value: 69 },
              { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), value: 67 },
              { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), value: 66 }
            ]
          },
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        setCrop(mockCrop);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching crop data:', err);
        setError(err.message || 'Failed to load crop data');
        setLoading(false);
      }
    };

    fetchCropData();
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

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'growing':
        return 'primary';
      case 'harvested':
        return 'success';
      case 'sold':
        return 'info';
      case 'failed':
        return 'error';
      case 'excellent':
        return 'success';
      case 'good':
        return 'info';
      case 'fair':
        return 'warning';
      case 'poor':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'planting':
        return <SpaIcon />;
      case 'fertilizer application':
        return <ScienceIcon />;
      case 'irrigation':
        return <WaterDropIcon />;
      case 'pest control':
        return <EcoIcon />;
      case 'harvest':
        return <GrassIcon />;
      default:
        return <CalendarIcon />;
    }
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

  if (error || !crop) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          {error || 'Crop not found'}
        </Alert>
        <Button
          component={RouterLink}
          to="/admin/crops"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Back to Crops
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
            to="/admin/crops"
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1">
            Crop Details
          </Typography>
        </Box>
        
        <Box>
          <Tooltip title="Edit Crop">
            <IconButton 
              component={RouterLink} 
              to={`/admin/crops/${crop._id}/edit`}
              color="primary"
              sx={{ mr: 1 }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Crop">
            <IconButton color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Crop Overview Card */}
      <Paper elevation={3} sx={{ mb: 4, overflow: 'hidden' }}>
        <Box sx={{ 
          p: 3, 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center'
        }}>
          <GrassIcon sx={{ fontSize: 60, mr: 3 }} />
          <Box>
            <Typography variant="h4" component="h2" gutterBottom>
              {crop.name} - {crop.variety}
            </Typography>
            <Chip 
              label={crop.status.charAt(0).toUpperCase() + crop.status.slice(1)} 
              color={getStatusColor(crop.status)}
              sx={{ color: 'white', borderColor: 'white' }}
              variant="outlined"
            />
          </Box>
        </Box>
        
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <TerrainIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Field" 
                    secondary={
                      <RouterLink to={`/admin/fields/${crop.field._id}`}>
                        {crop.field.name}
                      </RouterLink>
                    } 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Planting Date" 
                    secondary={formatDate(crop.plantingDate)} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Expected Harvest Date" 
                    secondary={formatDate(crop.expectedHarvestDate)} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Harvest Date" 
                    secondary={formatDate(crop.harvestDate)} 
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
                      <RouterLink to={`/admin/users/${crop.field.owner._id}`}>
                        {crop.field.owner.name}
                      </RouterLink>
                    } 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <StraightenIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Expected Quantity" 
                    secondary={`${crop.quantity.expected} ${crop.quantity.unit}`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <StraightenIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Actual Quantity" 
                    secondary={crop.quantity.actual ? `${crop.quantity.actual} ${crop.quantity.unit}` : 'Not harvested yet'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocalOfferIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Health Status" 
                    secondary={
                      <Chip 
                        label={crop.healthStatus.charAt(0).toUpperCase() + crop.healthStatus.slice(1)} 
                        color={getStatusColor(crop.healthStatus)}
                        size="small"
                      />
                    } 
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
          <Tab label="Activities" icon={<CalendarIcon />} iconPosition="start" {...a11yProps(0)} />
          <Tab label="Sensor Data" icon={<SensorsIcon />} iconPosition="start" {...a11yProps(1)} />
          <Tab label="Notes" icon={<NotesIcon />} iconPosition="start" {...a11yProps(2)} />
        </Tabs>
      </Paper>

      {/* Activities Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Crop Activities
          </Typography>
          <Button 
            component={RouterLink} 
            to={`/admin/crops/${crop._id}/activities/new`} 
            variant="contained" 
            startIcon={<CalendarIcon />}
          >
            Add Activity
          </Button>
        </Box>
        
        {crop.activities.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No activities have been recorded for this crop
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Performed By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {crop.activities.map((activity) => (
                  <TableRow key={activity._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getActivityIcon(activity.type)}
                        <Typography sx={{ ml: 1 }}>
                          {activity.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(activity.date)}</TableCell>
                    <TableCell>{activity.description}</TableCell>
                    <TableCell>{activity.performedBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* Sensor Data Tab */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Sensor Data (Last 7 Days)
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Soil Moisture (%)
              </Typography>
              <Box sx={{ height: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <Box sx={{ display: 'flex', height: '100%', alignItems: 'flex-end' }}>
                  {crop.sensorData.soilMoisture.map((data, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        flex: 1, 
                        mx: 0.5, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        height: '100%',
                        justifyContent: 'flex-end'
                      }}
                    >
                      <Box 
                        sx={{ 
                          width: '100%', 
                          bgcolor: 'primary.main', 
                          height: `${data.value}%`,
                          maxHeight: '100%',
                          minHeight: '10%',
                          borderTopLeftRadius: 4,
                          borderTopRightRadius: 4
                        }} 
                      />
                      <Typography variant="caption" sx={{ mt: 1 }}>
                        {formatDate(data.date).split(' ')[0]}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Temperature (°C)
              </Typography>
              <Box sx={{ height: 150, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <Box sx={{ display: 'flex', height: '100%', alignItems: 'flex-end' }}>
                  {crop.sensorData.temperature.map((data, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        flex: 1, 
                        mx: 0.5, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        height: '100%',
                        justifyContent: 'flex-end'
                      }}
                    >
                      <Box 
                        sx={{ 
                          width: '100%', 
                          bgcolor: 'error.main', 
                          height: `${(data.value / 40) * 100}%`,
                          maxHeight: '100%',
                          minHeight: '10%',
                          borderTopLeftRadius: 4,
                          borderTopRightRadius: 4
                        }} 
                      />
                      <Typography variant="caption" sx={{ mt: 1 }}>
                        {formatDate(data.date).split(' ')[0]}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Humidity (%)
              </Typography>
              <Box sx={{ height: 150, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <Box sx={{ display: 'flex', height: '100%', alignItems: 'flex-end' }}>
                  {crop.sensorData.humidity.map((data, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        flex: 1, 
                        mx: 0.5, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        height: '100%',
                        justifyContent: 'flex-end'
                      }}
                    >
                      <Box 
                        sx={{ 
                          width: '100%', 
                          bgcolor: 'info.main', 
                          height: `${data.value}%`,
                          maxHeight: '100%',
                          minHeight: '10%',
                          borderTopLeftRadius: 4,
                          borderTopRightRadius: 4
                        }} 
                      />
                      <Typography variant="caption" sx={{ mt: 1 }}>
                        {formatDate(data.date).split(' ')[0]}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Notes Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Crop Notes
        </Typography>
        <Paper sx={{ p: 3 }}>
          {crop.notes ? (
            <Typography variant="body1">
              {crop.notes}
            </Typography>
          ) : (
            <Typography color="text.secondary">
              No notes have been added for this crop
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button 
              component={RouterLink} 
              to={`/admin/crops/${crop._id}/edit`} 
              variant="contained" 
              startIcon={<EditIcon />}
            >
              Edit Notes
            </Button>
          </Box>
        </Paper>
      </TabPanel>
    </Container>
  );
};

export default AdminCropDetail;