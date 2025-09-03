import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sensors as SensorsIcon,
  WaterDrop as WaterDropIcon,
  Thermostat as ThermostatIcon,
  Air as AirIcon,
  WbSunny as WbSunnyIcon,
  Battery90 as BatteryIcon
} from '@mui/icons-material';
import { RootState } from '../../store';
import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// Define types
interface Sensor {
  _id: string;
  name: string;
  type: 'soil_moisture' | 'temperature' | 'humidity' | 'light' | 'ph' | 'npk';
  field: {
    _id: string;
    name: string;
    owner: {
      _id: string;
      name: string;
    }
  };
  location: {
    latitude: number;
    longitude: number;
    description: string;
  };
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  batteryLevel: number;
  lastReading: {
    value: number;
    unit: string;
    timestamp: string;
  };
  installationDate: string;
  lastMaintenance: string | null;
}

const AdminSensors: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [filteredSensors, setFilteredSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sensorToDelete, setSensorToDelete] = useState<string | null>(null);

  // Field owners list for filter
  const [fieldOwners, setFieldOwners] = useState<Array<{id: string, name: string}>>([]);

  useEffect(() => {
    // In a real implementation, these would be API calls
    // For now, we'll use mock data
    const fetchSensors = async () => {
      setLoading(true);
      try {
        // Mock data - in real implementation, this would be an API call
        const mockSensors: Sensor[] = [
          {
            _id: 's1',
            name: 'Soil Moisture Sensor 1',
            type: 'soil_moisture',
            field: {
              _id: 'f1',
              name: 'North Farm',
              owner: {
                _id: 'u1',
                name: 'Farmer Singh'
              }
            },
            location: {
              latitude: 28.6139,
              longitude: 77.2090,
              description: 'North-east corner'
            },
            status: 'active',
            batteryLevel: 85,
            lastReading: {
              value: 42.5,
              unit: '%',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            installationDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 's2',
            name: 'Temperature Sensor 1',
            type: 'temperature',
            field: {
              _id: 'f1',
              name: 'North Farm',
              owner: {
                _id: 'u1',
                name: 'Farmer Singh'
              }
            },
            location: {
              latitude: 28.6140,
              longitude: 77.2095,
              description: 'Center of field'
            },
            status: 'active',
            batteryLevel: 92,
            lastReading: {
              value: 28.3,
              unit: '°C',
              timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
            },
            installationDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
            lastMaintenance: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 's3',
            name: 'Humidity Sensor 1',
            type: 'humidity',
            field: {
              _id: 'f2',
              name: 'South Plantation',
              owner: {
                _id: 'u2',
                name: 'Farmer Patel'
              }
            },
            location: {
              latitude: 13.0827,
              longitude: 80.2707,
              description: 'South corner'
            },
            status: 'inactive',
            batteryLevel: 15,
            lastReading: {
              value: 65.8,
              unit: '%',
              timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
            },
            installationDate: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
            lastMaintenance: null
          },
          {
            _id: 's4',
            name: 'Light Sensor 1',
            type: 'light',
            field: {
              _id: 'f3',
              name: 'East Orchard',
              owner: {
                _id: 'u3',
                name: 'Farmer Kumar'
              }
            },
            location: {
              latitude: 19.0760,
              longitude: 72.8777,
              description: 'East side'
            },
            status: 'maintenance',
            batteryLevel: 50,
            lastReading: {
              value: 12500,
              unit: 'lux',
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            },
            installationDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
            lastMaintenance: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 's5',
            name: 'pH Sensor 1',
            type: 'ph',
            field: {
              _id: 'f4',
              name: 'West Field',
              owner: {
                _id: 'u1',
                name: 'Farmer Singh'
              }
            },
            location: {
              latitude: 17.3850,
              longitude: 78.4867,
              description: 'West corner'
            },
            status: 'error',
            batteryLevel: 65,
            lastReading: {
              value: 6.8,
              unit: 'pH',
              timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
            },
            installationDate: new Date(Date.now() - 210 * 24 * 60 * 60 * 1000).toISOString(),
            lastMaintenance: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];

        setSensors(mockSensors);
        setFilteredSensors(mockSensors);
        
        // Extract unique field owners for filter
        const uniqueOwners = Array.from(new Set(mockSensors.map(sensor => sensor.field.owner._id)))
          .map(ownerId => {
            const owner = mockSensors.find(sensor => sensor.field.owner._id === ownerId)?.field.owner;
            return {
              id: ownerId,
              name: owner?.name || 'Unknown'
            };
          });
        setFieldOwners(uniqueOwners);
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching sensors:', err);
        setError(err.message || 'Failed to load sensors');
        setLoading(false);
      }
    };

    fetchSensors();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...sensors];
    
    // Apply search term
    if (searchTerm) {
      result = result.filter(
        sensor => 
          sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sensor.field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sensor.field.owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sensor.location.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply type filter
    if (filterType !== 'all') {
      result = result.filter(sensor => sensor.type === filterType);
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(sensor => sensor.status === filterStatus);
    }
    
    setFilteredSensors(result);
  }, [searchTerm, filterType, filterStatus, sensors]);

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
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
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'maintenance':
        return 'info';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get battery color
  const getBatteryColor = (level: number) => {
    if (level > 70) return 'success';
    if (level > 30) return 'warning';
    return 'error';
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

  // Handle delete sensor
  const handleDeleteSensor = (sensorId: string) => {
    setSensorToDelete(sensorId);
    setDeleteDialogOpen(true);
  };

  // Confirm delete sensor
  const confirmDeleteSensor = () => {
    if (sensorToDelete) {
      // In a real implementation, this would be an API call
      setSensors(prevSensors => prevSensors.filter(sensor => sensor._id !== sensorToDelete));
      setFilteredSensors(prevSensors => prevSensors.filter(sensor => sensor._id !== sensorToDelete));
    }
    setDeleteDialogOpen(false);
    setSensorToDelete(null);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Manage Sensors
        </Typography>
        
        <Button
          component={RouterLink}
          to="/admin/sensors/new"
          variant="contained"
          startIcon={<AddIcon />}
        >
          Add New Sensor
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              placeholder="Search by name, field, owner, or location"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="type-filter-label">Sensor Type</InputLabel>
              <Select
                labelId="type-filter-label"
                value={filterType}
                onChange={(e: SelectChangeEvent) => setFilterType(e.target.value)}
                label="Sensor Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="soil_moisture">Soil Moisture</MenuItem>
                <MenuItem value="temperature">Temperature</MenuItem>
                <MenuItem value="humidity">Humidity</MenuItem>
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="ph">pH</MenuItem>
                <MenuItem value="npk">NPK</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={filterStatus}
                onChange={(e: SelectChangeEvent) => setFilterStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="error">Error</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Tooltip title="Table View">
                <IconButton 
                  color={viewMode === 'table' ? 'primary' : 'default'} 
                  onClick={() => setViewMode('table')}
                >
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Grid View">
                <IconButton 
                  color={viewMode === 'grid' ? 'primary' : 'default'} 
                  onClick={() => setViewMode('grid')}
                >
                  <SensorsIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Sensors List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : filteredSensors.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No sensors found matching your criteria
          </Typography>
          <Button
            component={RouterLink}
            to="/admin/sensors/new"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Add New Sensor
          </Button>
        </Paper>
      ) : viewMode === 'table' ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Field</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Battery</TableCell>
                <TableCell>Last Reading</TableCell>
                <TableCell>Installation Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSensors.map((sensor) => (
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
                  <TableCell>{sensor.field.name}</TableCell>
                  <TableCell>{sensor.field.owner.name}</TableCell>
                  <TableCell>
                    <Chip 
                      label={sensor.status.charAt(0).toUpperCase() + sensor.status.slice(1)} 
                      color={getStatusColor(sensor.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BatteryIcon color={getBatteryColor(sensor.batteryLevel)} sx={{ mr: 1 }} />
                      {sensor.batteryLevel}%
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {sensor.lastReading.value} {sensor.lastReading.unit}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTimestamp(sensor.lastReading.timestamp)}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(sensor.installationDate)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton 
                        component={RouterLink} 
                        to={`/admin/sensors/${sensor._id}`} 
                        size="small"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton 
                        component={RouterLink} 
                        to={`/admin/sensors/${sensor._id}/edit`} 
                        size="small"
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small"
                        color="error"
                        onClick={() => handleDeleteSensor(sensor._id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Grid container spacing={3}>
          {filteredSensors.map((sensor) => (
            <Grid item xs={12} sm={6} md={4} key={sensor._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h2">
                      {sensor.name}
                    </Typography>
                    <Chip 
                      label={sensor.status.charAt(0).toUpperCase() + sensor.status.slice(1)} 
                      color={getStatusColor(sensor.status)}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getSensorTypeIcon(sensor.type)}
                    <Typography variant="body1" sx={{ ml: 1 }}>
                      {formatSensorType(sensor.type)}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Field:</strong> {sensor.field.name}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Owner:</strong> {sensor.field.owner.name}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Location:</strong> {sensor.location.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      <strong>Battery:</strong>
                    </Typography>
                    <BatteryIcon color={getBatteryColor(sensor.batteryLevel)} sx={{ mr: 0.5 }} />
                    <Typography variant="body2">
                      {sensor.batteryLevel}%
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Last Reading:</strong> {sensor.lastReading.value} {sensor.lastReading.unit}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    {formatTimestamp(sensor.lastReading.timestamp)}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Installation Date:</strong> {formatDate(sensor.installationDate)}
                  </Typography>
                  
                  <Typography variant="body2">
                    <strong>Last Maintenance:</strong> {formatDate(sensor.lastMaintenance)}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    component={RouterLink} 
                    to={`/admin/sensors/${sensor._id}`} 
                    size="small"
                  >
                    View
                  </Button>
                  <Button 
                    component={RouterLink} 
                    to={`/admin/sensors/${sensor._id}/edit`} 
                    size="small"
                    color="primary"
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small"
                    color="error"
                    onClick={() => handleDeleteSensor(sensor._id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this sensor? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteSensor} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminSensors;