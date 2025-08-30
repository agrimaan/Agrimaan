import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  
  Chip,
  Divider,
  Grid,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Terrain as TerrainIcon,
  Grass as GrassIcon,
  Sensors as SensorsIcon,
  Warning as WarningIcon,
  WaterDrop as WaterDropIcon,
  BugReport as BugReportIcon,
  Spa as SpaIcon,
  Thermostat as ThermostatIcon
} from '@mui/icons-material';

import { getFields } from '../features/fields/fieldSlice';
import { getCrops } from '../features/crops/cropSlice';
import { getSensors } from '../features/sensors/sensorSlice';
import { getRecommendations } from '../features/analytics/analyticsSlice';
import { RootState } from '../store';

// Chart components
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  ArcElement
);

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  
  const { fields, loading: fieldsLoading } = useSelector((state: RootState) => state.field);
  const { crops, loading: cropsLoading } = useSelector((state: RootState) => state.crop);
  const { sensors, loading: sensorsLoading } = useSelector((state: RootState) => state.sensor);
  const { recommendations, loading: recommendationsLoading } = useSelector((state: RootState) => state.analytics);
  
  useEffect(() => {
    dispatch(getFields() as any);
    dispatch(getCrops() as any);
    //dispatch(getCrops(undefined) as any); // Also fix this if it has the same issue
    //dispatch(getSensors() as any);
    //dispatch(getSensors(undefined) as any);


// To get crops with a specific status
dispatch(getSensors({ status: 'active' }) as any);

    // To get all sensors
dispatch(getSensors({}) as any);

// To get sensors for a specific field
dispatch(getSensors({ fieldId: 'some-field-id' }) as any);

// To get sensors of a specific type
dispatch(getSensors({ type: 'temperature' }) as any);

// To get sensors with a specific status
dispatch(getSensors({ status: 'active' }) as any);



    dispatch(getRecommendations() as any);
  }, [dispatch]);
  
  // Prepare data for charts
  const cropStatusData = {
    labels: ['Planned', 'Planted', 'Growing', 'Harvested', 'Failed'],
    datasets: [
      {
        label: 'Crop Status',
        data: [
          crops.filter(crop => crop.status === 'planned').length,
          crops.filter(crop => crop.status === 'planted').length,
          crops.filter(crop => crop.status === 'growing').length,
          crops.filter(crop => crop.status === 'harvested').length,
          crops.filter(crop => crop.status === 'failed').length
        ],
        backgroundColor: [
          theme.palette.info.light,
          theme.palette.primary.light,
          theme.palette.success.light,
          theme.palette.secondary.light,
          theme.palette.error.light
        ],
        borderColor: [
          theme.palette.info.main,
          theme.palette.primary.main,
          theme.palette.success.main,
          theme.palette.secondary.main,
          theme.palette.error.main
        ],
        borderWidth: 1
      }
    ]
  };
  
  const sensorStatusData = {
    labels: ['Active', 'Inactive', 'Maintenance', 'Error'],
    datasets: [
      {
        label: 'Sensor Status',
        data: [
          sensors.filter(sensor => sensor.status === 'active').length,
          sensors.filter(sensor => sensor.status === 'inactive').length,
          sensors.filter(sensor => sensor.status === 'maintenance').length,
          sensors.filter(sensor => sensor.status === 'error').length
        ],
        backgroundColor: [
          theme.palette.success.light,
          theme.palette.grey[400],
          theme.palette.warning.light,
          theme.palette.error.light
        ],
        borderColor: [
          theme.palette.success.main,
          theme.palette.grey[600],
          theme.palette.warning.main,
          theme.palette.error.main
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Mock data for soil moisture trend
  const soilMoistureData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Field 1',
        data: [65, 59, 80, 81, 56, 55, 40],
        borderColor: theme.palette.primary.main,
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Field 2',
        data: [28, 48, 40, 19, 86, 27, 90],
        borderColor: theme.palette.secondary.main,
        backgroundColor: 'rgba(255, 143, 0, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };
  
  // Mock data for crop yield comparison
  const cropYieldData = {
    labels: ['Wheat', 'Corn', 'Soybeans', 'Rice'],
    datasets: [
      {
        label: 'Last Year',
        data: [4.2, 9.5, 3.1, 5.8],
        backgroundColor: theme.palette.primary.light,
      },
      {
        label: 'This Year (Projected)',
        data: [4.5, 10.2, 3.4, 6.0],
        backgroundColor: theme.palette.primary.dark,
      }
    ]
  };
  
  const cropYieldOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Crop Yield Comparison (tons/ha)'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        
        <Box>
          <Button
            component={RouterLink}
            to="/fields/new"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ mr: 1 }}
          >
            Add Field
          </Button>
        </Box>
      </Box>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Fields
                  </Typography>
                  <Typography variant="h4" component="div">
                    {fieldsLoading ? '...' : fields.length}
                  </Typography>
                </Box>
                <TerrainIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Link component={RouterLink} to="/fields" color="primary" underline="hover">
                  View all fields
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Active Crops
                  </Typography>
                  <Typography variant="h4" component="div">
                    {cropsLoading ? '...' : crops.filter(crop => crop.status !== 'harvested' && crop.status !== 'failed').length}
                  </Typography>
                </Box>
                <GrassIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Link component={RouterLink} to="/crops" color="primary" underline="hover">
                  View all crops
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Active Sensors
                  </Typography>
                  <Typography variant="h4" component="div">
                    {sensorsLoading ? '...' : sensors.filter(sensor => sensor.status === 'active').length}
                  </Typography>
                </Box>
                <SensorsIcon color="info" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Link component={RouterLink} to="/sensors" color="primary" underline="hover">
                  View all sensors
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Alerts
                  </Typography>
                  <Typography variant="h4" component="div" color="error.main">
                    {sensorsLoading ? '...' : sensors.filter(sensor => sensor.status === 'error').length}
                  </Typography>
                </Box>
                <WarningIcon color="error" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Link component={RouterLink} to="/alerts" color="primary" underline="hover">
                  View all alerts
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts and Data */}
      <Grid container spacing={3}>
        {/* Soil Moisture Trend */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Soil Moisture Trend
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ height: 300 }}>
              <Line 
                data={soilMoistureData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      display: true,
                      text: 'Soil Moisture (%) - Last 7 Months'
                    }
                  }
                }} 
              />
            </Box>
          </Paper>
        </Grid>
        
        {/* Recommendations */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recommendations
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {recommendationsLoading ? (
              <Typography>Loading recommendations...</Typography>
            ) : recommendations.length === 0 ? (
              <Typography>No recommendations available</Typography>
            ) : (
              <List dense>
                {recommendations.slice(0, 5).map((rec, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {rec.type === 'irrigation_recommendation' ? (
                        <WaterDropIcon color="info" />
                      ) : rec.type === 'pest_risk' ? (
                        <BugReportIcon color="error" />
                      ) : rec.type === 'fertilizer_recommendation' ? (
                        <SpaIcon color="success" />
                      ) : (
                        <ThermostatIcon color="warning" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={rec.action}
                      secondary={`Field: ${rec.field.name}`}
                    />
                    <Chip
                      label={rec.priority}
                      size="small"
                      color={
                        rec.priority === 'critical' ? 'error' :
                        rec.priority === 'high' ? 'warning' :
                        rec.priority === 'medium' ? 'info' : 'default'
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
            
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button
                component={RouterLink}
                to="/analytics"
                size="small"
                color="primary"
              >
                View All Recommendations
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Crop Status */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Crop Status
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ height: 250, display: 'flex', justifyContent: 'center' }}>
              <Doughnut 
                data={cropStatusData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }} 
              />
            </Box>
          </Paper>
        </Grid>
        
        {/* Sensor Status */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Sensor Status
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ height: 250, display: 'flex', justifyContent: 'center' }}>
              <Doughnut 
                data={sensorStatusData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }} 
              />
            </Box>
          </Paper>
        </Grid>
        
        {/* Weather Forecast */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Weather Forecast
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" component="div">
                24°C
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Partly Cloudy
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Humidity: 65% | Wind: 8 km/h
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2">Mon</Typography>
                <Typography variant="body1">23°C</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2">Tue</Typography>
                <Typography variant="body1">25°C</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2">Wed</Typography>
                <Typography variant="body1">22°C</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2">Thu</Typography>
                <Typography variant="body1">20°C</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2">Fri</Typography>
                <Typography variant="body1">21°C</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Crop Yield Comparison */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Crop Yield Comparison
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ height: 300 }}>
              <Bar 
                data={cropYieldData} 
                options={cropYieldOptions} 
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;