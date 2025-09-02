import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Chip, Divider, Grid, Link, List,
  ListItem, ListItemIcon, ListItemText, Paper, Typography, useTheme, Avatar
} from '@mui/material';
import {
  Add as AddIcon, Terrain as TerrainIcon, Grass as GrassIcon, Sensors as SensorsIcon,
  Warning as WarningIcon, WaterDrop as WaterDropIcon, BugReport as BugReportIcon,
  Spa as SpaIcon, Thermostat as ThermostatIcon, Store as StoreIcon,
  MonetizationOn as MonetizationOnIcon, ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';

import { getFields } from '../features/fields/fieldSlice';
import { getCrops } from '../features/crops/cropSlice';
import { getSensors } from '../features/sensors/sensorSlice';
import { getRecommendations } from '../features/analytics/analyticsSlice';
import { RootState } from '../store';

import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

/* --------------------- deep store helpers --------------------- */

type AnyObj = Record<string, any>;

const isEntity = (v: any) =>
  v && typeof v === 'object' && !Array.isArray(v) && (('_id' in v) || ('id' in v) || ('name' in v));

const firstEntitiesArray = (node: any, maxDepth = 4): any[] => {
  // Breadth-first scan to find the first array of entities
  if (!node || typeof node !== 'object') return [];
  const queue: Array<{ n: any; d: number }> = [{ n: node, d: 0 }];
  while (queue.length) {
    const { n, d } = queue.shift()!;
    if (!n || d > maxDepth) continue;

    if (Array.isArray(n)) {
      if (n.length && n.every(isEntity)) return n;
      continue;
    }

    // Check common keys that hold arrays directly
    for (const k of Object.keys(n)) {
      const v = n[k];
      if (Array.isArray(v) && v.length && v.every(isEntity)) return v;
    }

    // Enqueue children
    for (const k of Object.keys(n)) {
      const v = n[k];
      if (v && typeof v === 'object') queue.push({ n: v, d: d + 1 });
    }
  }
  return [];
};

const arrayFromSlice = (slice: any, preferKeys: string[] = []) => {
  if (!slice) return [];

  // Prefer explicit keys
  for (const k of preferKeys) {
    if (Array.isArray(slice?.[k])) return slice[k];
  }

  // Common list keys
  const candidates = ['items', 'list', 'data', 'results', 'rows', 'docs', 'values', 'records'];
  for (const k of candidates) {
    if (Array.isArray(slice?.[k])) return slice[k];
    if (Array.isArray(slice?.data?.[k])) return slice.data[k];
  }

  // RTK entity adapter
  if (slice?.ids && slice?.entities && Array.isArray(slice.ids)) {
    return slice.ids.map((id: any) => slice.entities[id]).filter(Boolean);
  }

  // Single-named arrays
  const guesses = ['fields', 'crops', 'sensors', 'recommendations'];
  for (const k of guesses) {
    if (Array.isArray(slice?.[k])) return slice[k];
    if (Array.isArray(slice?.data?.[k])) return slice.data[k];
  }

  // Deep scan fallback
  return firstEntitiesArray(slice);
};

const dedupeById = <T extends AnyObj>(arr: T[]) => {
  const map = new Map<any, T>();
  for (const item of arr) {
    const key = item?._id ?? item?.id ?? JSON.stringify(item);
    if (!map.has(key)) map.set(key, item);
  }
  return Array.from(map.values());
};

const getLoading = (slice: any): boolean => {
  if (!slice) return false;
  if (slice.loading != null) return !!slice.loading;
  if (slice.isLoading != null) return !!slice.isLoading;
  const val = String(slice.status ?? slice.fetchStatus ?? '');
  return val.toLowerCase() === 'loading' || val.toLowerCase() === 'pending';
};

/* --------------------- component --------------------- */

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const root = useSelector((s: RootState) => s) as AnyObj;

  // Try likely reducer keys first; otherwise deep-scan root to find the first matching array
  const fieldSlice = root.field ?? root.fields ?? root.fieldSlice ?? root.fieldReducer ?? root.entities?.field ?? root.domain?.field ?? root;
  const cropSlice = root.crop ?? root.crops ?? root.cropSlice ?? root.cropReducer ?? root.entities?.crop ?? root.domain?.crop ?? root;
  const sensorSlice = root.sensor ?? root.sensors ?? root.sensorSlice ?? root.sensorReducer ?? root.entities?.sensor ?? root.domain?.sensor ?? root;
  const analyticsSlice = root.analytics ?? root.recommendations ?? root.analyticsSlice ?? root.analyticsReducer ?? root.domain?.analytics ?? root;

  const _fieldsRaw = arrayFromSlice(fieldSlice, ['fields']);
  const _cropsRaw = arrayFromSlice(cropSlice, ['crops']);
  const _sensorsRaw = arrayFromSlice(sensorSlice, ['sensors']);
  const _recsRaw = arrayFromSlice(analyticsSlice, ['recommendations']);

  const fields = useMemo(() => dedupeById(_fieldsRaw), [_fieldsRaw]);
  const crops = useMemo(() => dedupeById(_cropsRaw), [_cropsRaw]);
  const sensors = useMemo(() => dedupeById(_sensorsRaw), [_sensorsRaw]);
  const recommendations = _recsRaw;

  const fieldsLoading = getLoading(fieldSlice);
  const cropsLoading = getLoading(cropSlice);
  const sensorsLoading = getLoading(sensorSlice);
  const recommendationsLoading = getLoading(analyticsSlice);

  useEffect(() => {
    dispatch(getFields() as any);
    dispatch(getCrops() as any);
    dispatch(getSensors({}) as any);
    dispatch(getRecommendations() as any);
  }, [dispatch]);

  // Dev console: show where arrays were found
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.info('[Dashboard] counts', {
      fields: fields.length, fromFieldSlice: fieldSlice,
      crops: crops.length, fromCropSlice: cropSlice,
      sensors: sensors.length, fromSensorSlice: sensorSlice,
      recommendations: recommendations.length, fromAnalyticsSlice: analyticsSlice
    });
  }

  // Helpers
  const isPast = (d?: string | Date) => {
    if (!d) return false;
    const dt = new Date(d);
    return !isNaN(+dt) && dt.getTime() <= Date.now();
  };

  const getQty = (crop: any) => {
    const raw = crop?.availableQuantity ?? crop?.harvestedQuantity ?? crop?.expectedYield ?? 0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  };

  const cropsReadyForSale = crops.filter((crop: any) => {
    const status = String(crop?.status ?? '').trim().toLowerCase();
    const readyStatuses = new Set(['harvested', 'ready', 'ready_for_sale', 'market_ready', 'sale_ready', 'mature']);
    const looksReady = readyStatuses.has(status) || (status === 'growing' && isPast(crop?.expectedHarvestDate));
    return looksReady && getQty(crop) > 0;
  });

  const getFieldName = (fieldRef: any): string => {
    if (!fieldRef) return 'Unknown';
    if (typeof fieldRef === 'string') {
      const field = fields.find(f => f._id === fieldRef || f.id === fieldRef);
      return field?.name || 'Unknown';
    }
    if (typeof fieldRef === 'object') return fieldRef.name ?? 'Unknown';
    return 'Unknown';
  };

  // Charts
  const cropStatusData = {
    labels: ['Planned', 'Planted', 'Growing', 'Harvested', 'Failed'],
    datasets: [{
      label: 'Crop Status',
      data: [
        crops.filter(c => String(c.status ?? '').toLowerCase() === 'planned').length,
        crops.filter(c => String(c.status ?? '').toLowerCase() === 'planted').length,
        crops.filter(c => String(c.status ?? '').toLowerCase() === 'growing').length,
        crops.filter(c => String(c.status ?? '').toLowerCase() === 'harvested').length,
        crops.filter(c => String(c.status ?? '').toLowerCase() === 'failed').length
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
    }]
  };

  const sensorStatusData = {
    labels: ['Active', 'Inactive', 'Maintenance', 'Error'],
    datasets: [{
      label: 'Sensor Status',
      data: [
        sensors.filter(s => String(s.status ?? '').toLowerCase() === 'active').length,
        sensors.filter(s => String(s.status ?? '').toLowerCase() === 'inactive').length,
        sensors.filter(s => String(s.status ?? '').toLowerCase() === 'maintenance').length,
        sensors.filter(s => String(s.status ?? '').toLowerCase() === 'error').length
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
    }]
  };

  const soilMoistureData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      { label: 'Field 1', data: [65, 59, 80, 81, 56, 55, 40], borderColor: theme.palette.primary.main, backgroundColor: 'rgba(46, 125, 50, 0.1)', fill: true, tension: 0.4 },
      { label: 'Field 2', data: [28, 48, 40, 19, 86, 27, 90], borderColor: theme.palette.secondary.main, backgroundColor: 'rgba(255, 143, 0, 0.1)', fill: true, tension: 0.4 }
    ]
  };

  const cropYieldData = {
    labels: ['Wheat', 'Corn', 'Soybeans', 'Rice'],
    datasets: [
      { label: 'Last Year', data: [4.2, 9.5, 3.1, 5.8], backgroundColor: theme.palette.primary.light },
      { label: 'This Year (Projected)', data: [4.5, 10.2, 3.4, 6.0], backgroundColor: theme.palette.primary.dark }
    ]
  };

  const cropYieldOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' as const }, title: { display: true, text: 'Crop Yield Comparison (tons/ha)' } },
    scales: { y: { beginAtZero: true } }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>Dashboard</Typography>
        <Box>
          <Button component={RouterLink} to="/marketplace" variant="outlined" startIcon={<StoreIcon />} sx={{ mr: 1 }}>Sell Crops</Button>
          <Button component={RouterLink} to="/fields/new" variant="contained" startIcon={<AddIcon />} sx={{ mr: 1 }}>Add Field</Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Total Fields</Typography>
                  <Typography variant="h4" component="div">{fieldsLoading ? '...' : fields.length}</Typography>
                </Box>
                <TerrainIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Link component={RouterLink} to="/fields" color="primary" underline="hover">View all fields</Link>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Active Crops</Typography>
                  <Typography variant="h4" component="div">
                    {cropsLoading ? '...' : crops.filter(c => {
                      const s = String(c.status ?? '').toLowerCase();
                      return s !== 'harvested' && s !== 'failed';
                    }).length}
                  </Typography>
                </Box>
                <GrassIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Link component={RouterLink} to="/crops" color="primary" underline="hover">View all crops</Link>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Active Sensors</Typography>
                  <Typography variant="h4" component="div">
                    {sensorsLoading ? '...' : sensors.filter(s => String(s.status ?? '').toLowerCase() === 'active').length}
                  </Typography>
                </Box>
                <SensorsIcon color="info" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Link component={RouterLink} to="/sensors" color="primary" underline="hover">View all sensors</Link>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Ready to Sell</Typography>
                  <Typography variant="h4" component="div">{cropsLoading ? '...' : cropsReadyForSale.length}</Typography>
                </Box>
                <MonetizationOnIcon color="secondary" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Link component={RouterLink} to="/marketplace" color="primary" underline="hover">View marketplace</Link>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts and Data */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Soil Moisture Trend</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ height: 300 }}>
              <Line data={soilMoistureData} options={{ responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Soil Moisture (%) - Last 7 Months' } } }} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Crops Ready for Sale</Typography>
            <Divider sx={{ mb: 2 }} />
            {cropsLoading ? (
              <Typography>Loading crops...</Typography>
            ) : cropsReadyForSale.length === 0 ? (
              <Typography color="text.secondary">No crops ready for sale at the moment</Typography>
            ) : (
              <List dense>
                {cropsReadyForSale.slice(0, 4).map((crop: any) => {
                  const chipLabel = String(crop?.status ?? '').replace(/_/g, ' ').trim() || 'ready';
                  return (
                    <ListItem key={crop._id ?? crop.id} sx={{ px: 0, mb: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Avatar sx={{ bgcolor: 'success.light', width: 32, height: 32 }}>
                          <GrassIcon fontSize="small" />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2">{crop.name}</Typography>
                            <Chip
                              label={chipLabel}
                              size="small"
                              color={chipLabel.toLowerCase().includes('harvest') || chipLabel.toLowerCase().includes('ready') ? 'success' : 'warning'}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">{`Field: ${getFieldName(crop.field)}`}</Typography>
                            <Typography variant="body2" color="primary">{`${getQty(crop)} kg`}</Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
            {cropsReadyForSale.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button component={RouterLink} to="/crops" size="small" color="primary">View All Crops</Button>
                <Button component={RouterLink} to="/marketplace" size="small" variant="contained" startIcon={<ShoppingCartIcon />}>Sell Now</Button>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Recommendations</Typography>
            <Divider sx={{ mb: 2 }} />
            {recommendationsLoading ? (
              <Typography>Loading recommendations...</Typography>
            ) : recommendations.length === 0 ? (
              <Typography>No recommendations available</Typography>
            ) : (
              <List dense>
                {recommendations.slice(0, 5).map((rec: any, index: number) => (
                  <ListItem key={rec._id ?? rec.id ?? index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {rec.type === 'irrigation_recommendation' ? <WaterDropIcon color="info" /> :
                       rec.type === 'pest_risk' ? <BugReportIcon color="error" /> :
                       rec.type === 'fertilizer_recommendation' ? <SpaIcon color="success" /> :
                       <ThermostatIcon color="warning" />}
                    </ListItemIcon>
                    <ListItemText primary={rec.action} secondary={`Field: ${rec.field?.name ?? getFieldName(rec.field)}`} />
                    <Chip
                      label={rec.priority}
                      size="small"
                      color={rec.priority === 'critical' ? 'error' : rec.priority === 'high' ? 'warning' : rec.priority === 'medium' ? 'info' : 'default'}
                    />
                  </ListItem>
                ))}
              </List>
            )}
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button component={RouterLink} to="/analytics" size="small" color="primary">View All Recommendations</Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Weather Forecast</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" component="div">24°C</Typography>
              <Typography variant="body1" color="text.secondary">Partly Cloudy</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Humidity: 65% | Wind: 8 km/h</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d, i) => (
                <Box key={d} sx={{ textAlign: 'center' }}>
                  <Typography variant="body2">{d}</Typography>
                  <Typography variant="body1">{[23, 25, 22, 20, 21][i]}°C</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Crop Status</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ height: 250, display: 'flex', justifyContent: 'center' }}>
              <Doughnut data={cropStatusData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Sensor Status</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ height: 250, display: 'flex', justifyContent: 'center' }}>
              <Doughnut data={sensorStatusData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Crop Yield Comparison</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ height: 300 }}>
              <Bar data={cropYieldData} options={cropYieldOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick debug summary (dev only) */}
      {process.env.NODE_ENV !== 'production' && (
        <Box sx={{ mt: 2, fontSize: 12, color: 'text.secondary' }}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption">
            Debug — fields: {fields.length} | crops: {crops.length} | sensors: {sensors.length} | recs: {recommendations.length}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
