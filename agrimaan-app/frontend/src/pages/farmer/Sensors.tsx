import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  TextField,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { Link } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import WaterIcon from '@mui/icons-material/Water';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import AirIcon from '@mui/icons-material/Air';
import SensorsIcon from '@mui/icons-material/Sensors';

// Mock data for sensors
const mockSensors = [
  { 
    id: 1, 
    name: 'Soil Moisture Sensor 1', 
    type: 'Moisture',
    Fields: 'North Fields',
    status: 'Active',
    batteryLevel: '85%',
    lastReading: '28%',
    lastUpdate: '2024-06-01 08:30 AM',
    icon: <WaterIcon />
  },
  { 
    id: 2, 
    name: 'Temperature Sensor 1', 
    type: 'Temperature',
    Fields: 'North Fields',
    status: 'Active',
    batteryLevel: '72%',
    lastReading: '72°F',
    lastUpdate: '2024-06-01 08:45 AM',
    icon: <DeviceThermostatIcon />
  },
  { 
    id: 3, 
    name: 'Humidity Sensor 1', 
    type: 'Humidity',
    Fields: 'South Fields',
    status: 'Inactive',
    batteryLevel: '15%',
    lastReading: '65%',
    lastUpdate: '2024-05-30 10:15 AM',
    icon: <WbSunnyIcon />
  },
  { 
    id: 4, 
    name: 'Wind Sensor 1', 
    type: 'Wind',
    Fields: 'East Fields',
    status: 'Active',
    batteryLevel: '90%',
    lastReading: '8 mph NW',
    lastUpdate: '2024-06-01 09:00 AM',
    icon: <AirIcon />
  },
  { 
    id: 5, 
    name: 'Soil Moisture Sensor 2', 
    type: 'Moisture',
    Fields: 'South Fields',
    status: 'Active',
    batteryLevel: '65%',
    lastReading: '32%',
    lastUpdate: '2024-06-01 08:50 AM',
    icon: <WaterIcon />
  },
  { 
    id: 6, 
    name: 'Temperature Sensor 2', 
    type: 'Temperature',
    Fields: 'West Fields',
    status: 'Maintenance',
    batteryLevel: '45%',
    lastReading: '68°F',
    lastUpdate: '2024-05-31 02:30 PM',
    icon: <DeviceThermostatIcon />
  },
];

const Sensors: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [FieldsFilter, setFieldsFilter] = useState('');
  const [sensors] = useState(mockSensors);

  const handleTypeFilterChange = (event: SelectChangeEvent) => {
    setTypeFilter(event.target.value);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };

  const handleFieldsFilterChange = (event: SelectChangeEvent) => {
    setFieldsFilter(event.target.value);
  };

  const filteredSensors = sensors.filter(sensor => {
    const matchesSearch = 
      sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sensor.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sensor.Fields.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === '' || sensor.type === typeFilter;
    const matchesStatus = statusFilter === '' || sensor.status === statusFilter;
    const matchesFields = FieldsFilter === '' || sensor.Fields === FieldsFilter;
    
    return matchesSearch && matchesType && matchesStatus && matchesFields;
  });

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

  const sensorTypes = Array.from(new Set(sensors.map(sensor => sensor.type)));
  const sensorStatuses = Array.from(new Set(sensors.map(sensor => sensor.status)));
  const sensorfields = Array.from(new Set(sensors.map(sensor => sensor.Fields)));

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="div">
          Sensors
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
        >
          Add Sensor
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search sensors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel id="type-filter-label">Type</InputLabel>
              <Select
                labelId="type-filter-label"
                id="type-filter"
                value={typeFilter}
                label="Type"
                onChange={handleTypeFilterChange}
              >
                <MenuItem value="">All Types</MenuItem>
                {sensorTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                label="Status"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="">All Statuses</MenuItem>
                {sensorStatuses.map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel id="Fields-filter-label">Fields</InputLabel>
              <Select
                labelId="Fields-filter-label"
                id="Fields-filter"
                value={FieldsFilter}
                label="Fields"
                onChange={handleFieldsFilterChange}
              >
                <MenuItem value="">All fields</MenuItem>
                {sensorfields.map((Fields) => (
                  <MenuItem key={Fields} value={Fields}>{Fields}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {filteredSensors.map((sensor) => (
          <Grid item xs={12} sm={6} md={4} key={sensor.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    mr: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: 'primary.light',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    color: 'white'
                  }}>
                    {sensor.icon || <SensorsIcon />}
                  </Box>
                  <Typography variant="h6" component="div">
                    {sensor.name}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip 
                    label={sensor.type} 
                    color="primary" 
                    size="small" 
                    variant="outlined"
                  />
                  <Chip 
                    label={sensor.status} 
                    color={getStatusColor(sensor.status) as any} 
                    size="small" 
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  Fields: {sensor.Fields}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last Reading: <strong>{sensor.lastReading}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last Update: {sensor.lastUpdate}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                    Battery:
                  </Typography>
                  <Chip 
                    label={sensor.batteryLevel} 
                    color={getBatteryColor(sensor.batteryLevel) as any} 
                    size="small"
                  />
                </Box>
              </CardContent>
              <Box sx={{ p: 2 }}>
                <Button 
                  component={Link} 
                  to={`/sensors/${sensor.id}`} 
                  variant="outlined" 
                  fullWidth
                >
                  View Details
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Sensors;