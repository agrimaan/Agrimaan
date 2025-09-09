import React, { useState } from 'react';
import { 
  Box, Paper, Typography, Grid, Card, CardContent, CardHeader, 
  CircularProgress, useTheme, Chip, Divider, IconButton, 
  ToggleButtonGroup, ToggleButton, Menu, MenuItem, Tooltip
} from '@mui/material';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip
} from 'recharts';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import BoltIcon from '@mui/icons-material/Bolt';
import OpacityIcon from '@mui/icons-material/Opacity';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import SensorsIcon from '@mui/icons-material/Sensors';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

// Define prop types for the component
interface SensorDashboardProps {
  FieldsId: string;
  FieldsName: string;
  sensors: Array<{
    _id: string;
    name: string;
    type: string;
    status: string;
    location?: {
      lat: number;
      lng: number;
    };
    lastReading?: {
      value: number;
      timestamp: string;
    };
    batteryLevel?: number;
    signalStrength?: number;
    thresholds?: {
      min?: number;
      max?: number;
    };
  }>;
  sensorReadings?: Record<string, Array<{
    timestamp: string;
    value: number;
    isAnomaly?: boolean;
  }>>;
  alerts?: Array<{
    _id: string;
    sensorId: string;
    type: string;
    value: number;
    threshold: number;
    timestamp: string;
    status: string;
  }>;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onSensorClick?: (sensorId: string) => void;
  timeRange?: 'day' | 'week' | 'month';
  onTimeRangeChange?: (range: 'day' | 'week' | 'month') => void;
}

const SensorDashboard: React.FC<SensorDashboardProps> = ({
  FieldsId,
  FieldsName,
  sensors,
  sensorReadings = {},
  alerts = [],
  loading = false,
  error = null,
  onRefresh,
  onSensorClick,
  timeRange = 'day',
  onTimeRangeChange
}) => {
  const theme = useTheme();
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  // Get all unique sensor types
  const sensorTypes = Array.from(new Set(sensors.map(sensor => sensor.type)));
  
  // Get all unique sensor statuses
  const sensorStatuses = Array.from(new Set(sensors.map(sensor => sensor.status)));

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date for chart tooltip
  const formatChartDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Handle filter menu open
  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  // Handle filter menu close
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  // Handle type filter change
  const handleTypeFilterChange = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  // Handle status filter change
  const handleStatusFilterChange = (status: string) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter(s => s !== status));
    } else {
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };

  // Handle sensor menu open
  const handleSensorMenuClick = (event: React.MouseEvent<HTMLElement>, sensorId: string) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedSensor(sensorId);
  };

  // Handle sensor menu close
  const handleSensorMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedSensor(null);
  };

  // Handle time range change
  const handleTimeRangeChange = (
    event: React.MouseEvent<HTMLElement>,
    newTimeRange: 'day' | 'week' | 'month'
  ) => {
    if (newTimeRange !== null && onTimeRangeChange) {
      onTimeRangeChange(newTimeRange);
    }
  };

  // Filter sensors based on selected types and statuses
  const filteredSensors = sensors.filter(sensor => {
    const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(sensor.type);
    const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(sensor.status);
    return typeMatch && statusMatch;
  });

  // Get sensor icon based on type
  const getSensorIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'soil_moisture':
        return <WaterDropIcon />;
      case 'temperature':
      case 'soil_temperature':
        return <ThermostatIcon />;
      case 'humidity':
      case 'soil_humidity':
        return <OpacityIcon />;
      case 'light':
        return <WbSunnyIcon />;
      case 'soil_ph':
      case 'soil_ec':
        return <BoltIcon />;
      default:
        return <SensorsIcon />;
    }
  };

  // Get sensor status icon
  const getSensorStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <CheckCircleIcon sx={{ color: theme.palette.success.main }} />;
      case 'inactive':
        return <ErrorIcon sx={{ color: theme.palette.error.main }} />;
      case 'warning':
        return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
      default:
        return <SensorsIcon sx={{ color: theme.palette.grey[500] }} />;
    }
  };

  // Get sensor reading unit based on type
  const getSensorUnit = (type: string) => {
    switch (type.toLowerCase()) {
      case 'soil_moisture':
        return '%';
      case 'temperature':
      case 'soil_temperature':
        return '°C';
      case 'humidity':
      case 'soil_humidity':
        return '%';
      case 'light':
        return 'lux';
      case 'soil_ph':
        return 'pH';
      case 'soil_ec':
        return 'mS/cm';
      default:
        return '';
    }
  };

  // Get color for sensor value based on thresholds
  const getSensorValueColor = (sensor: typeof sensors[0]) => {
    if (!sensor.lastReading || sensor.thresholds === undefined) {
      return theme.palette.text.primary;
    }
    
    const { value } = sensor.lastReading;
    const { min, max } = sensor.thresholds;
    
    if ((min !== undefined && value < min) || (max !== undefined && value > max)) {
      return theme.palette.error.main;
    }
    
    return theme.palette.success.main;
  };

  // Prepare sensor readings data for chart
  const prepareSensorReadingsData = (sensorId: string) => {
    const readings = sensorReadings[sensorId] || [];
    return readings.map(reading => ({
      time: formatDate(reading.timestamp),
      fullTime: formatChartDate(reading.timestamp),
      value: reading.value,
      isAnomaly: reading.isAnomaly
    }));
  };

  // Get alerts for a specific sensor
  const getSensorAlerts = (sensorId: string) => {
    return alerts.filter(alert => alert.sensorId === sensorId);
  };

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Render dashboard header
  const renderDashboardHeader = () => {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">{FieldsName} - Sensor Dashboard</Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {onTimeRangeChange && (
            <ToggleButtonGroup
              value={timeRange}
              exclusive
              onChange={handleTimeRangeChange}
              aria-label="time range"
              size="small"
            >
              <ToggleButton value="day" aria-label="day">
                Day
              </ToggleButton>
              <ToggleButton value="week" aria-label="week">
                Week
              </ToggleButton>
              <ToggleButton value="month" aria-label="month">
                Month
              </ToggleButton>
            </ToggleButtonGroup>
          )}
          
          <IconButton onClick={handleFilterClick} aria-label="filter sensors">
            <FilterListIcon />
          </IconButton>
          
          {onRefresh && (
            <IconButton onClick={onRefresh} aria-label="refresh data">
              <RefreshIcon />
            </IconButton>
          )}
        </Box>
        
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
        >
          <MenuItem disabled>
            <Typography variant="subtitle2">Filter by Type</Typography>
          </MenuItem>
          {sensorTypes.map(type => (
            <MenuItem 
              key={`type-${type}`} 
              onClick={() => handleTypeFilterChange(type)}
              sx={{ 
                backgroundColor: selectedTypes.includes(type) 
                  ? `${theme.palette.primary.light}30` 
                  : 'transparent' 
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {getSensorIcon(type)}
                <Typography sx={{ ml: 1 }}>
                  {type.replace('_', ' ')}
                </Typography>
              </Box>
            </MenuItem>
          ))}
          
          <Divider sx={{ my: 1 }} />
          
          <MenuItem disabled>
            <Typography variant="subtitle2">Filter by Status</Typography>
          </MenuItem>
          {sensorStatuses.map(status => (
            <MenuItem 
              key={`status-${status}`} 
              onClick={() => handleStatusFilterChange(status)}
              sx={{ 
                backgroundColor: selectedStatuses.includes(status) 
                  ? `${theme.palette.primary.light}30` 
                  : 'transparent' 
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {getSensorStatusIcon(status)}
                <Typography sx={{ ml: 1 }}>
                  {status}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Menu>
      </Box>
    );
  };

  // Render sensor cards
  const renderSensorCards = () => {
    return (
      <Grid container spacing={3}>
        {filteredSensors.map(sensor => {
          const sensorAlerts = getSensorAlerts(sensor._id);
          const hasActiveAlerts = sensorAlerts.some(alert => alert.status === 'active');
          
          return (
            <Grid item xs={12} sm={6} md={4} key={sensor._id}>
              <Card 
                elevation={2} 
                sx={{ 
                  height: '100%',
                  cursor: onSensorClick ? 'pointer' : 'default',
                  transition: 'transform 0.2s',
                  '&:hover': onSensorClick ? { transform: 'translateY(-4px)' } : {}
                }}
                onClick={() => onSensorClick && onSensorClick(sensor._id)}
              >
                <CardHeader
                  avatar={getSensorIcon(sensor.type)}
                  action={
                    <IconButton 
                      aria-label="sensor menu" 
                      onClick={(e) => handleSensorMenuClick(e, sensor._id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  }
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {sensor.name}
                      {hasActiveAlerts && (
                        <Tooltip title={`${sensorAlerts.length} active alerts`}>
                          <WarningIcon 
                            color="warning" 
                            fontSize="small" 
                            sx={{ ml: 1 }} 
                          />
                        </Tooltip>
                      )}
                    </Box>
                  }
                  subheader={
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Chip 
                        label={sensor.type.replace('_', ' ')} 
                        size="small" 
                        sx={{ mr: 1 }} 
                      />
                      <Chip 
                        label={sensor.status} 
                        size="small"
                        color={
                          sensor.status === 'active' ? 'success' : 
                          sensor.status === 'inactive' ? 'error' : 
                          'warning'
                        }
                      />
                    </Box>
                  }
                />
                <CardContent>
                  {sensor.lastReading ? (
                    <Box>
                      <Typography variant="h4" align="center" sx={{ color: getSensorValueColor(sensor) }}>
                        {sensor.lastReading.value}{getSensorUnit(sensor.type)}
                      </Typography>
                      <Typography variant="caption" display="block" align="center" color="text.secondary">
                        Last updated: {new Date(sensor.lastReading.timestamp).toLocaleString()}
                      </Typography>
                      
                      {/* Sensor readings chart */}
                      {sensorReadings[sensor._id] && sensorReadings[sensor._id].length > 0 && (
                        <Box sx={{ height: 150, mt: 2 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={prepareSensorReadingsData(sensor._id)}
                              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="time" />
                              <YAxis hide />
                              <RechartsTooltip 
                                formatter={(value: number) => [`${value}${getSensorUnit(sensor.type)}`, 'Value']}
                                labelFormatter={(label) => {
                                  const dataPoint = prepareSensorReadingsData(sensor._id).find(d => d.time === label);
                                  return dataPoint ? dataPoint.fullTime : label;
                                }}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke={theme.palette.primary.main} 
                                fill={theme.palette.primary.light} 
                                fillOpacity={0.3}
                                /*
                                dot={(props: any) => {
                                  const { cx, cy, payload } = props;
                                  return payload.isAnomaly ? (
                                    <circle 
                                      cx={cx} 
                                      cy={cy} 
                                      r={4} 
                                      fill={theme.palette.error.main} 
                                      stroke={theme.palette.error.dark}
                                    />
                                  ) : null;
                                }}
                                  // Return a transparent circle instead of null
                                  //return <circle cx={cx} cy={cy} r={2} fill={theme.palette.primary.main} />;
  
                                  */
                                activeDot={(props: any) => {
                                  const { cx, cy, payload } = props;
                                  if (!payload?.isAnomaly) return <circle cx={cx} cy={cy} r={0} fill="transparent" />;
                                  return (
                                    <circle 
                                      cx={cx} 
                                      cy={cy} 
                                      r={4} 
                                      fill={theme.palette.error.main}
                                      stroke={theme.palette.error.dark}
                                      strokeWidth={2}
                                    />
                                  );
                                }}                                
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </Box>
                      )}
                      
                      {/* Sensor health indicators */}
                      {(sensor.batteryLevel !== undefined || sensor.signalStrength !== undefined) && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                          {sensor.batteryLevel !== undefined && (
                            <Tooltip title="Battery Level">
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" display="block" color="text.secondary">
                                  Battery
                                </Typography>
                                <Typography 
                                  variant="body2"
                                  color={
                                    sensor.batteryLevel < 20 ? 'error' :
                                    sensor.batteryLevel < 50 ? 'warning.main' :
                                    'success.main'
                                  }
                                >
                                  {sensor.batteryLevel}%
                                </Typography>
                              </Box>
                            </Tooltip>
                          )}
                          
                          {sensor.signalStrength !== undefined && (
                            <Tooltip title="Signal Strength">
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" display="block" color="text.secondary">
                                  Signal
                                </Typography>
                                <Typography 
                                  variant="body2"
                                  color={
                                    sensor.signalStrength < 20 ? 'error' :
                                    sensor.signalStrength < 50 ? 'warning.main' :
                                    'success.main'
                                  }
                                >
                                  {sensor.signalStrength}%
                                </Typography>
                              </Box>
                            </Tooltip>
                          )}
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Typography variant="body1" align="center" color="text.secondary">
                      No readings available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  // Render alerts section
  const renderAlerts = () => {
    if (alerts.length === 0) return null;
    
    const activeAlerts = alerts.filter(alert => alert.status === 'active');
    
    if (activeAlerts.length === 0) return null;
    
    return (
      <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>Active Alerts</Typography>
        <Grid container spacing={2}>
          {activeAlerts.map(alert => {
            const sensor = sensors.find(s => s._id === alert.sensorId);
            if (!sensor) return null;
            
            return (
              <Grid item xs={12} sm={6} md={4} key={alert._id}>
                <Card sx={{ backgroundColor: `${theme.palette.error.light}20` }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <WarningIcon color="error" sx={{ mr: 1 }} />
                      <Typography variant="subtitle1">
                        {sensor.name} - {alert.type.replace('_', ' ')}
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      Value: <strong>{alert.value}{getSensorUnit(sensor.type)}</strong> 
                      {alert.type.includes('above') ? ' > ' : ' < '}
                      <strong>{alert.threshold}{getSensorUnit(sensor.type)}</strong>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Detected: {new Date(alert.timestamp).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      {renderDashboardHeader()}
      {renderSensorCards()}
      {renderAlerts()}
      
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleSensorMenuClose}
      >
        <MenuItem onClick={handleSensorMenuClose}>View Details</MenuItem>
        <MenuItem onClick={handleSensorMenuClose}>Edit Settings</MenuItem>
        <MenuItem onClick={handleSensorMenuClose}>Calibrate</MenuItem>
        <MenuItem onClick={handleSensorMenuClose}>View History</MenuItem>
        <Divider />
        <MenuItem onClick={handleSensorMenuClose} sx={{ color: theme.palette.error.main }}>
          Deactivate
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default SensorDashboard;