import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
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
  useTheme,
  Avatar
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
  Store as StoreIcon,
  MonetizationOn as MonetizationOnIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';

import { getFields } from '../../features/fields/fieldSlice';
import { getCrops } from '../../features/crops/cropSlice';
import { getSensors } from '../../features/sensors/sensorSlice';
import { getRecommendations } from '../../features/analytics/analyticsSlice';
import { RootState } from '../../store';

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

const FarmerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();
  
  const { fields, loading: fieldsLoading } = useSelector((state: RootState) => state.fields);
  const { crops, loading: cropsLoading } = useSelector((state: RootState) => state.crop);
  const { sensors, loading: sensorsLoading } = useSelector((state: RootState) => state.sensor);
  const { recommendations, loading: recommendationsLoading } = useSelector((state: RootState) => state.analytics);
  
  useEffect(() => {
    dispatch(getFields() as any);
    dispatch(getCrops() as any);
    dispatch(getSensors({}) as any);
    dispatch(getRecommendations() as any);
  }, [dispatch]);
  
  // Add function to get crops ready for sale
  const cropsReadyForSale = crops.filter(crop => 
    crop.status === 'harvested' || crop.status === 'growing'
  );

  // Helper function to get field name
  const getFieldName = (fieldRef: any): string => {
    if (typeof fieldRef === 'string') {
      // If field is just an ID, find the field name from fields array
      const field = fields.find(f => f._id === fieldRef);
      return field?.name || t('common.unknown');
    } else if (fieldRef && typeof fieldRef === 'object' && fieldRef.name) {
      // If field is populated object
      return fieldRef.name;
    }
    return t('common.unknown');
  };
  
  // Prepare data for charts with translated labels
  const cropStatusData = {
    labels: [
      t('crops.status.planned'),
      t('crops.status.planted'),
      t('crops.status.growing'),
      t('crops.status.harvested'),
      t('crops.status.failed')
    ],
    datasets: [
      {
        label: t('crops.status.title'),
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
    labels: [
      t('sensors.status.active'),
      t('sensors.status.inactive'),
      t('sensors.status.maintenance'),
      t('sensors.status.error')
    ],
    datasets: [
      {
        label: t('sensors.status.title'),
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
    labels: [
      t('months.jan'),
      t('months.feb'),
      t('months.mar'),
      t('months.apr'),
      t('months.may'),
      t('months.jun'),
      t('months.jul')
    ],
    datasets: [
      {
        label: t('dashboard.field1'),
        data: [65, 59, 80, 81, 56, 55, 40],
        borderColor: theme.palette.primary.main,
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: t('dashboard.field2'),
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
    labels: [
      t('crops.wheat'),
      t('crops.corn'),
      t('crops.soybeans'),
      t('crops.rice')
    ],
    datasets: [
      {
        label: t('dashboard.lastYear'),
        data: [4.2, 9.5, 3.1, 5.8],
        backgroundColor: theme.palette.primary.light,
      },
      {
        label: t('dashboard.thisYearProjected'),
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
        text: t('dashboard.cropYieldComparison')
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
          {t('dashboard.title')}
        </Typography>
        
        <Box>
          <Button
            component={RouterLink}
            to="/marketplace"
            variant="outlined"
            startIcon={<StoreIcon />}
            sx={{ mr: 1 }}
          >
            {t('dashboard.sellCrops')}
          </Button>
          <Button
            component={RouterLink}
            to="/fields/new"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ mr: 1 }}
          >
            {t('dashboard.addField')}
          </Button>
        </Box>
      </Box>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('dashboard.totalFields')}
                  </Typography>
                  <Typography variant="h4" component="div">
                    {fieldsLoading ? '...' : fields.length}
                  </Typography>
                </Box>
                <TerrainIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Link component={RouterLink} to="/fields" color="primary" underline="hover">
                  {t('dashboard.viewAllFields')}
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('dashboard.activeCrops')}
                  </Typography>
                  <Typography variant="h4" component="div">
                    {cropsLoading ? '...' : crops.filter(crop => crop.status !== 'harvested' && crop.status !== 'failed').length}
                  </Typography>
                </Box>
                <GrassIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Link component={RouterLink} to="/crops" color="primary" underline="hover">
                  {t('dashboard.viewAllCrops')}
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('dashboard.activeSensors')}
                  </Typography>
                  <Typography variant="h4" component="div">
                    {sensorsLoading ? '...' : sensors.filter(sensor => sensor.status === 'active').length}
                  </Typography>
                </Box>
                <SensorsIcon color="info" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Link component={RouterLink} to="/sensors" color="primary" underline="hover">
                  {t('dashboard.viewAllSensors')}
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('dashboard.readyToSell')}
                  </Typography>
                  <Typography variant="h4" component="div">
                    {cropsLoading ? '...' : cropsReadyForSale.length}
                  </Typography>
                </Box>
                <MonetizationOnIcon color="secondary" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Link component={RouterLink} to="/marketplace" color="primary" underline="hover">
                  {t('dashboard.viewMarketplace')}
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('dashboard.alerts')}
                  </Typography>
                  <Typography variant="h4" component="div" color="error.main">
                    {sensorsLoading ? '...' : sensors.filter(sensor => sensor.status === 'error').length}
                  </Typography>
                </Box>
                <WarningIcon color="error" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Link component={RouterLink} to="/alerts" color="primary" underline="hover">
                  {t('dashboard.viewAllAlerts')}
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
              {t('dashboard.soilMoistureTrend')}
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
                      text: t('dashboard.soilMoistureLast7Months')
                    }
                  }
                }} 
              />
            </Box>
          </Paper>
        </Grid>
        
        {/* Crops Ready for Sale */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.cropsReadyForSale')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {cropsLoading ? (
              <Typography>{t('common.loading')}</Typography>
            ) : cropsReadyForSale.length === 0 ? (
              <Typography color="text.secondary">
                {t('dashboard.noCropsReady')}
              </Typography>
            ) : (
              <List dense>
                {cropsReadyForSale.slice(0, 4).map((crop) => (
                  <ListItem 
                    key={crop._id} 
                    sx={{ px: 0, mb: 1 }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Avatar sx={{ bgcolor: 'success.light', width: 32, height: 32 }}>
                        <GrassIcon fontSize="small" />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2">
                            {crop.name}
                          </Typography>
                          <Chip
                            label={crop.status}
                            size="small"
                            color={crop.status === 'harvested' ? 'success' : 'warning'}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {`${t('common.field')}: ${getFieldName(crop.field)}`}
                          </Typography>
                          <Typography variant="body2" color="primary">
                            {`${crop.expectedYield || 'N/A'} kg`}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
            
            {cropsReadyForSale.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  component={RouterLink}
                  to="/crops"
                  size="small"
                  color="primary"
                >
                  {t('dashboard.viewAllCrops')}
                </Button>
                <Button
                  component={RouterLink}
                  to="/marketplace"
                  size="small"
                  variant="contained"
                  startIcon={<ShoppingCartIcon />}
                >
                  {t('dashboard.sellNow')}
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Recommendations */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.recommendations')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {recommendationsLoading ? (
              <Typography>{t('common.loading')}</Typography>
            ) : recommendations.length === 0 ? (
              <Typography>{t('dashboard.noRecommendations')}</Typography>
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
                      secondary={`${t('common.field')}: ${rec.Fields.name}`}
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
                {t('dashboard.viewAllRecommendations')}
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Weather Forecast */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.weatherForecast')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" component="div">
                24°C
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('weather.partlyCloudy')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t('weather.humidity')}: 65% | {t('weather.wind')}: 8 km/h
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2">{t('days.mon')}</Typography>
                <Typography variant="body1">23°C</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2">{t('days.tue')}</Typography>
                <Typography variant="body1">25°C</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2">{t('days.wed')}</Typography>
                <Typography variant="body1">22°C</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2">{t('days.thu')}</Typography>
                <Typography variant="body1">20°C</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2">{t('days.fri')}</Typography>
                <Typography variant="body1">21°C</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Crop Status */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.cropStatus')}
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
              {t('dashboard.sensorStatus')}
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
        
        {/* Crop Yield Comparison */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.cropYieldComparison')}
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

export default FarmerDashboard;