import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip as MuiTooltip,
  Skeleton,
  SwipeableDrawer,
  Tabs,
  Tab
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
  Thermostat as ThermostatIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Share as ShareIcon
} from '@mui/icons-material';

import { getFields } from '../features/fields/fieldSlice';
import { getCrops } from '../features/crops/cropSlice';
import { getSensors } from '../features/sensors/sensorSlice';
import { getRecommendations } from '../features/analytics/analyticsSlice';
import { RootState } from '../store';

// Import our new responsive components
import ResponsiveDashboard from '../components/layout/ResponsiveDashboard';
import DashboardWidget from '../components/layout/DashboardWidget';

// Chart components
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip as ChartTooltip, // Use alias
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
  ChartTooltip, 
  Legend,
  ArcElement
);

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const { fields, loading: fieldsLoading } = useSelector((state: RootState) => state.field);
  const { crops, loading: cropsLoading } = useSelector((state: RootState) => state.crop);
  const { sensors, loading: sensorsLoading } = useSelector((state: RootState) => state.sensor);
  const { recommendations, loading: recommendationsLoading } = useSelector((state: RootState) => state.analytics);
  
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [refreshing, setRefreshing] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    dispatch(getFields() as any);
    dispatch(getCrops() as any);
    dispatch(getSensors({}) as any);
    dispatch(getRecommendations() as any);
  }, [dispatch]);
  
  // Handle refresh for individual widgets
  const handleWidgetRefresh = (widgetId: string) => {
    setRefreshing(prev => ({ ...prev, [widgetId]: true }));
    
    // Simulate refresh with timeout
    setTimeout(() => {
      setRefreshing(prev => ({ ...prev, [widgetId]: false }));
    }, 1500);
  };
  
  // Handle filter drawer
  const handleFilterDrawerToggle = () => {
    setFilterDrawerOpen(!filterDrawerOpen);
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
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
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        display: !isMobile, // Hide legend on mobile
      },
      title: {
        display: true,
        text: 'Crop Yield Comparison (tons/ha)',
        font: {
          size: isMobile ? 12 : 16
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          }
        }
      }
    }
  };

  // Render the dashboard with our responsive components
  return (
    <Box>
      {/* Dashboard Header with Add Field Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant={isMobile ? "h5" : "h4"} component="h1" gutterBottom>
          Dashboard
        </Typography>
        
        <Box>
          <Button
            component={RouterLink}
            to="/fields/new"
            variant="contained"
            startIcon={<AddIcon />}
            size={isMobile ? "small" : "medium"}
          >
            Add Field
          </Button>
          {isMobile && (
            <IconButton 
              color="primary" 
              onClick={handleFilterDrawerToggle}
              sx={{ ml: 1 }}
            >
              <FilterListIcon />
            </IconButton>
          )}
        </Box>
      </Box>
      
      {/* Summary Cards */}
      <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={6} md={3}>
          <DashboardWidget 
            title="Total Fields" 
            icon={<TerrainIcon color="primary" />}
            loading={fieldsLoading}
            onRefresh={() => handleWidgetRefresh('fields')}
            id="fields-widget"
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant={isMobile ? "h5" : "h4"} component="div">
                {fieldsLoading || refreshing['fields-widget'] ? <Skeleton width={40} /> : fields.length}
              </Typography>
              <Box sx={{ mt: 'auto' }}>
                <Link component={RouterLink} to="/fields" color="primary" underline="hover">
                  View all fields
                </Link>
              </Box>
            </Box>
          </DashboardWidget>
        </Grid>
        
        <Grid item xs={6} sm={6} md={3}>
          <DashboardWidget 
            title="Active Crops" 
            icon={<GrassIcon color="success" />}
            loading={cropsLoading}
            onRefresh={() => handleWidgetRefresh('crops')}
            id="crops-widget"
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant={isMobile ? "h5" : "h4"} component="div">
                {cropsLoading || refreshing['crops-widget'] ? 
                  <Skeleton width={40} /> : 
                  crops.filter(crop => crop.status !== 'harvested' && crop.status !== 'failed').length
                }
              </Typography>
              <Box sx={{ mt: 'auto' }}>
                <Link component={RouterLink} to="/crops" color="primary" underline="hover">
                  View all crops
                </Link>
              </Box>
            </Box>
          </DashboardWidget>
        </Grid>
        
        <Grid item xs={6} sm={6} md={3}>
          <DashboardWidget 
            title="Active Sensors" 
            icon={<SensorsIcon color="info" />}
            loading={sensorsLoading}
            onRefresh={() => handleWidgetRefresh('sensors')}
            id="sensors-widget"
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant={isMobile ? "h5" : "h4"} component="div">
                {sensorsLoading || refreshing['sensors-widget'] ? 
                  <Skeleton width={40} /> : 
                  sensors.filter(sensor => sensor.status === 'active').length
                }
              </Typography>
              <Box sx={{ mt: 'auto' }}>
                <Link component={RouterLink} to="/sensors" color="primary" underline="hover">
                  View all sensors
                </Link>
              </Box>
            </Box>
          </DashboardWidget>
        </Grid>
        
        <Grid item xs={6} sm={6} md={3}>
          <DashboardWidget 
            title="Alerts" 
            icon={<WarningIcon color="error" />}
            loading={sensorsLoading}
            onRefresh={() => handleWidgetRefresh('alerts')}
            id="alerts-widget"
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant={isMobile ? "h5" : "h4"} component="div" color="error.main">
                {sensorsLoading || refreshing['alerts-widget'] ? 
                  <Skeleton width={40} /> : 
                  sensors.filter(sensor => sensor.status === 'error').length
                }
              </Typography>
              <Box sx={{ mt: 'auto' }}>
                <Link component={RouterLink} to="/alerts" color="primary" underline="hover">
                  View all alerts
                </Link>
              </Box>
            </Box>
          </DashboardWidget>
        </Grid>
      </Grid>
      
      {/* Mobile Tabs for Charts and Data */}
      {isMobile && (
        <Box sx={{ mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab label="Soil Moisture" />
            <Tab label="Recommendations" />
            <Tab label="Crop Status" />
            <Tab label="Sensor Status" />
            <Tab label="Weather" />
            <Tab label="Yield Comparison" />
          </Tabs>
        </Box>
      )}
      
      {/* Charts and Data */}
      <Grid container spacing={isMobile ? 2 : 3}>
        {/* Soil Moisture Trend */}
        <Grid item xs={12} md={8} sx={{ display: isMobile && activeTab !== 0 ? 'none' : 'block' }}>
          <DashboardWidget 
            title="Soil Moisture Trend" 
            loading={false}
            onRefresh={() => handleWidgetRefresh('soil-moisture')}
            onDownload={() => console.log('Download soil moisture data')}
            onShare={() => console.log('Share soil moisture data')}
            onFullscreen={() => console.log('Fullscreen soil moisture chart')}
            id="soil-moisture-widget"
            helpText="This chart shows soil moisture levels over time for selected fields. Higher percentages indicate more moisture content in the soil."
          >
            <Box sx={{ height: isMobile ? 250 : 300, width: '100%' }}>
              <Line 
                data={soilMoistureData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      display: true,
                      text: 'Soil Moisture (%) - Last 7 Months',
                      font: {
                        size: isMobile ? 12 : 16
                      }
                    },
                    legend: {
                      position: 'top',
                      labels: {
                        boxWidth: isMobile ? 10 : 40,
                        font: {
                          size: isMobile ? 10 : 12
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      ticks: {
                        font: {
                          size: isMobile ? 10 : 12
                        }
                      }
                    },
                    x: {
                      ticks: {
                        font: {
                          size: isMobile ? 10 : 12
                        }
                      }
                    }
                  }
                }} 
              />
            </Box>
          </DashboardWidget>
        </Grid>
        
        {/* Recommendations */}
        <Grid item xs={12} md={4} sx={{ display: isMobile && activeTab !== 1 ? 'none' : 'block' }}>
          <DashboardWidget 
            title="Recommendations" 
            loading={recommendationsLoading}
            onRefresh={() => handleWidgetRefresh('recommendations')}
            id="recommendations-widget"
            helpText="These are actionable recommendations based on current field conditions, weather forecasts, and crop health data."
          >
            {recommendationsLoading || refreshing['recommendations-widget'] ? (
              <>
                <Skeleton variant="rectangular" height={30} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" height={30} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" height={30} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" height={30} sx={{ mb: 1 }} />
              </>
            ) : recommendations.length === 0 ? (
              <Typography>No recommendations available</Typography>
            ) : (
              <List dense sx={{ width: '100%', p: 0 }}>
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
                      primaryTypographyProps={{
                        variant: isMobile ? 'body2' : 'body1',
                        noWrap: isMobile
                      }}
                      secondaryTypographyProps={{
                        variant: 'caption',
                        noWrap: isMobile
                      }}
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
          </DashboardWidget>
        </Grid>
        
        {/* Crop Status */}
        <Grid item xs={12} sm={6} md={4} sx={{ display: isMobile && activeTab !== 2 ? 'none' : 'block' }}>
          <DashboardWidget 
            title="Crop Status" 
            loading={cropsLoading}
            onRefresh={() => handleWidgetRefresh('crop-status')}
            id="crop-status-widget"
            helpText="This chart shows the distribution of crops by their current growth status."
          >
            <Box sx={{ height: isMobile ? 200 : 250, display: 'flex', justifyContent: 'center' }}>
              <Doughnut 
                data={cropStatusData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        boxWidth: isMobile ? 10 : 40,
                        font: {
                          size: isMobile ? 10 : 12
                        }
                      }
                    }
                  }
                }} 
              />
            </Box>
          </DashboardWidget>
        </Grid>
        
        {/* Sensor Status */}
        <Grid item xs={12} sm={6} md={4} sx={{ display: isMobile && activeTab !== 3 ? 'none' : 'block' }}>
          <DashboardWidget 
            title="Sensor Status" 
            loading={sensorsLoading}
            onRefresh={() => handleWidgetRefresh('sensor-status')}
            id="sensor-status-widget"
            helpText="This chart shows the distribution of IoT sensors by their current operational status."
          >
            <Box sx={{ height: isMobile ? 200 : 250, display: 'flex', justifyContent: 'center' }}>
              <Doughnut 
                data={sensorStatusData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        boxWidth: isMobile ? 10 : 40,
                        font: {
                          size: isMobile ? 10 : 12
                        }
                      }
                    }
                  }
                }} 
              />
            </Box>
          </DashboardWidget>
        </Grid>
        
        {/* Weather Forecast */}
        <Grid item xs={12} sm={6} md={4} sx={{ display: isMobile && activeTab !== 4 ? 'none' : 'block' }}>
          <DashboardWidget 
            title="Weather Forecast" 
            loading={false}
            onRefresh={() => handleWidgetRefresh('weather')}
            id="weather-widget"
            helpText="Current weather conditions and 5-day forecast for your primary field location."
          >
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant={isMobile ? "h4" : "h3"} component="div">
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
          </DashboardWidget>
        </Grid>
        
        {/* Crop Yield Comparison */}
        <Grid item xs={12} sx={{ display: isMobile && activeTab !== 5 ? 'none' : 'block' }}>
          <DashboardWidget 
            title="Crop Yield Comparison" 
            loading={false}
            onRefresh={() => handleWidgetRefresh('crop-yield')}
            onDownload={() => console.log('Download crop yield data')}
            onShare={() => console.log('Share crop yield data')}
            onFullscreen={() => console.log('Fullscreen crop yield chart')}
            id="crop-yield-widget"
            helpText="This chart compares crop yields from last year with projected yields for the current growing season."
          >
            <Box sx={{ height: isMobile ? 250 : 300 }}>
              <Bar 
                data={cropYieldData} 
                options={cropYieldOptions} 
              />
            </Box>
          </DashboardWidget>
        </Grid>
      </Grid>
      
      {/* Filter Drawer for Mobile */}
      <SwipeableDrawer
        anchor="bottom"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        onOpen={() => setFilterDrawerOpen(true)}
        sx={{
          '& .MuiDrawer-paper': {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '70%',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Dashboard Filters</Typography>
            <IconButton onClick={() => setFilterDrawerOpen(false)}>
              <WarningIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>Date Range</Typography>
          <Box sx={{ mb: 2 }}>
            <Chip label="Last 7 Days" color="primary" sx={{ mr: 1, mb: 1 }} />
            <Chip label="Last 30 Days" variant="outlined" sx={{ mr: 1, mb: 1 }} />
            <Chip label="This Season" variant="outlined" sx={{ mr: 1, mb: 1 }} />
            <Chip label="Custom Range" variant="outlined" sx={{ mb: 1 }} />
          </Box>
          
          <Typography variant="subtitle1" gutterBottom>Fields</Typography>
          <Box sx={{ mb: 2 }}>
            <Chip label="All Fields" color="primary" sx={{ mr: 1, mb: 1 }} />
            <Chip label="North Field" variant="outlined" sx={{ mr: 1, mb: 1 }} />
            <Chip label="South Field" variant="outlined" sx={{ mr: 1, mb: 1 }} />
            <Chip label="East Field" variant="outlined" sx={{ mb: 1 }} />
          </Box>
          
          <Typography variant="subtitle1" gutterBottom>Crops</Typography>
          <Box sx={{ mb: 2 }}>
            <Chip label="All Crops" color="primary" sx={{ mr: 1, mb: 1 }} />
            <Chip label="Wheat" variant="outlined" sx={{ mr: 1, mb: 1 }} />
            <Chip label="Corn" variant="outlined" sx={{ mr: 1, mb: 1 }} />
            <Chip label="Soybeans" variant="outlined" sx={{ mb: 1 }} />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button variant="outlined" onClick={() => setFilterDrawerOpen(false)}>
              Reset
            </Button>
            <Button variant="contained" onClick={() => setFilterDrawerOpen(false)}>
              Apply Filters
            </Button>
          </Box>
        </Box>
      </SwipeableDrawer>
    </Box>
  );
};

export default Dashboard;