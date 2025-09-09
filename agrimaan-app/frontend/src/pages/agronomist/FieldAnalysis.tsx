import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Paper,
  Typography,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab
} from '@mui/material';
import {
  Terrain as TerrainIcon,
  Spa as SpaIcon,
  WaterDrop as WaterDropIcon,
  Science as ScienceIcon,
  BugReport as BugReportIcon,
  History as HistoryIcon,
  Assignment as AssignmentIcon,
  ArrowBack as ArrowBackIcon,
  VideoCall as VideoCallIcon
} from '@mui/icons-material';
import axios from 'axios';

// Define types
interface Fields {
  _id: string;
  name: string;
  location: string;
  size: number;
  unit: string;
  owner: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  crops: Array<{
    _id: string;
    name: string;
    variety: string;
    plantingDate: string;
    expectedHarvestDate: string;
    status: string;
    healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  }>;
  soilType: string;
  soilHealth: {
    ph: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    organicMatter: number;
    moisture: number;
  };
  lastInspection: string;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  weatherConditions: {
    temperature: number;
    humidity: number;
    rainfall: number;
    windSpeed: number;
  };
  inspectionHistory: Array<{
    _id: string;
    date: string;
    inspector: string;
    findings: string;
    recommendations: string;
  }>;
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
      id={`Fields-analysis-tabpanel-${index}`}
      aria-labelledby={`Fields-analysis-tab-${index}`}
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
    id: `Fields-analysis-tab-${index}`,
    'aria-controls': `Fields-analysis-tabpanel-${index}`,
  };
}

const FieldsAnalysis: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [Fields, setFields] = useState<Fields | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // In a real implementation, this would be an API call
    // For now, we'll use mock data
    const fetchFields = async () => {
      setLoading(true);
      try {
        // Mock Fields data
        const mockFields: Fields = {
          _id: id || 'f1',
          name: 'North Wheat Fields',
          location: 'Punjab',
          size: 25,
          unit: 'acres',
          owner: {
            _id: 'u1',
            name: 'Farmer Singh',
            email: 'farmer.singh@example.com',
            phone: '+91 98765 43210'
          },
          crops: [
            {
              _id: 'c1',
              name: 'Wheat',
              variety: 'HD-2967',
              plantingDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
              expectedHarvestDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'growing',
              healthStatus: 'good'
            }
          ],
          soilType: 'Loamy',
          soilHealth: {
            ph: 6.8,
            nitrogen: 75,
            phosphorus: 45,
            potassium: 80,
            organicMatter: 3.2,
            moisture: 22
          },
          lastInspection: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          healthStatus: 'good',
          weatherConditions: {
            temperature: 32,
            humidity: 65,
            rainfall: 10,
            windSpeed: 8
          },
          inspectionHistory: [
            {
              _id: 'i1',
              date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              inspector: 'Dr. Agronomist Kumar',
              findings: 'Crop is growing well. Some minor signs of nutrient deficiency in the eastern section.',
              recommendations: 'Apply nitrogen fertilizer at 50kg/acre to address yellowing leaves.'
            },
            {
              _id: 'i2',
              date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
              inspector: 'Dr. Agronomist Kumar',
              findings: 'Early growth stage looks promising. Soil moisture is adequate.',
              recommendations: 'Continue with regular irrigation schedule. Monitor for pests.'
            }
          ]
        };

        // Simulate API delay
        setTimeout(() => {
          setFields(mockFields);
          setLoading(false);
        }, 800);
      } catch (err: any) {
        console.error('Error fetching Fields data:', err);
        setError(err.message || 'Failed to load Fields data');
        setLoading(false);
      }
    };

    fetchFields();
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get health status color
  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'success';
      case 'good':
        return 'info';
      case 'fair':
        return 'warning';
      case 'poor':
        return 'error';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get soil health rating
  const getSoilHealthRating = (value: number, type: string) => {
    switch (type) {
      case 'ph':
        if (value >= 6.0 && value <= 7.5) return { rating: 'Optimal', color: 'success' };
        if ((value >= 5.5 && value < 6.0) || (value > 7.5 && value <= 8.0)) return { rating: 'Acceptable', color: 'info' };
        if ((value >= 5.0 && value < 5.5) || (value > 8.0 && value <= 8.5)) return { rating: 'Suboptimal', color: 'warning' };
        return { rating: 'Poor', color: 'error' };
      case 'nitrogen':
        if (value >= 70) return { rating: 'High', color: 'success' };
        if (value >= 40 && value < 70) return { rating: 'Medium', color: 'info' };
        return { rating: 'Low', color: 'error' };
      case 'phosphorus':
        if (value >= 40) return { rating: 'High', color: 'success' };
        if (value >= 20 && value < 40) return { rating: 'Medium', color: 'info' };
        return { rating: 'Low', color: 'error' };
      case 'potassium':
        if (value >= 75) return { rating: 'High', color: 'success' };
        if (value >= 40 && value < 75) return { rating: 'Medium', color: 'info' };
        return { rating: 'Low', color: 'error' };
      case 'organicMatter':
        if (value >= 3.0) return { rating: 'High', color: 'success' };
        if (value >= 2.0 && value < 3.0) return { rating: 'Medium', color: 'info' };
        return { rating: 'Low', color: 'error' };
      case 'moisture':
        if (value >= 20 && value <= 30) return { rating: 'Optimal', color: 'success' };
        if ((value >= 15 && value < 20) || (value > 30 && value <= 35)) return { rating: 'Acceptable', color: 'info' };
        if ((value >= 10 && value < 15) || (value > 35 && value <= 40)) return { rating: 'Suboptimal', color: 'warning' };
        return { rating: 'Poor', color: 'error' };
      default:
        return { rating: 'Unknown', color: 'default' };
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
        <Typography variant="h5" sx={{ mt: 2 }}>
          Loading Fields data...
        </Typography>
      </Container>
    );
  }

  if (error || !Fields) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h5" color="error">
          Error: {error || 'Fields not found'}
        </Typography>
        <Button
          component={RouterLink}
          to="/agronomist/fields"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Back to fields
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          component={RouterLink}
          to="/agronomist/fields"
          startIcon={<ArrowBackIcon />}
        >
          Back to fields
        </Button>
      </Box>

      {/* Fields Overview */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {Fields.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TerrainIcon sx={{ mr: 1 }} />
              <Typography variant="body1">
                {Fields.location} | {Fields.size} {Fields.unit} | {Fields.soilType} soil
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SpaIcon sx={{ mr: 1 }} />
              <Typography variant="body1">
                Main crop: {Fields.crops[0].name} ({Fields.crops[0].variety})
              </Typography>
            </Box>
          </Box>
          <Chip 
            label={`Health: ${Fields.healthStatus.charAt(0).toUpperCase() + Fields.healthStatus.slice(1)}`}
            color={getHealthStatusColor(Fields.healthStatus) as any}
            sx={{ fontSize: '1rem', py: 2, px: 1 }}
          />
        </Box>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Owner Information
            </Typography>
            <Typography variant="body1">
              {Fields.owner.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Fields.owner.email} | {Fields.owner.phone}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Last Inspection
            </Typography>
            <Typography variant="body1">
              {formatDate(Fields.lastInspection)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              By: {Fields.inspectionHistory[0].inspector}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs for different analyses */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Soil Analysis" icon={<TerrainIcon />} iconPosition="start" {...a11yProps(0)} />
          <Tab label="Crop Health" icon={<SpaIcon />} iconPosition="start" {...a11yProps(1)} />
          <Tab label="Weather Impact" icon={<WaterDropIcon />} iconPosition="start" {...a11yProps(2)} />
          <Tab label="Inspection History" icon={<HistoryIcon />} iconPosition="start" {...a11yProps(3)} />
        </Tabs>

        {/* Soil Analysis Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Soil Health Indicators
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Parameter</TableCell>
                        <TableCell>Value</TableCell>
                        <TableCell>Rating</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>pH Level</TableCell>
                        <TableCell>{Fields.soilHealth.ph}</TableCell>
                        <TableCell>
                          <Chip 
                            label={getSoilHealthRating(Fields.soilHealth.ph, 'ph').rating} 
                            color={getSoilHealthRating(Fields.soilHealth.ph, 'ph').color as any}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Nitrogen (ppm)</TableCell>
                        <TableCell>{Fields.soilHealth.nitrogen}</TableCell>
                        <TableCell>
                          <Chip 
                            label={getSoilHealthRating(Fields.soilHealth.nitrogen, 'nitrogen').rating} 
                            color={getSoilHealthRating(Fields.soilHealth.nitrogen, 'nitrogen').color as any}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Phosphorus (ppm)</TableCell>
                        <TableCell>{Fields.soilHealth.phosphorus}</TableCell>
                        <TableCell>
                          <Chip 
                            label={getSoilHealthRating(Fields.soilHealth.phosphorus, 'phosphorus').rating} 
                            color={getSoilHealthRating(Fields.soilHealth.phosphorus, 'phosphorus').color as any}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Potassium (ppm)</TableCell>
                        <TableCell>{Fields.soilHealth.potassium}</TableCell>
                        <TableCell>
                          <Chip 
                            label={getSoilHealthRating(Fields.soilHealth.potassium, 'potassium').rating} 
                            color={getSoilHealthRating(Fields.soilHealth.potassium, 'potassium').color as any}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Organic Matter (%)</TableCell>
                        <TableCell>{Fields.soilHealth.organicMatter}</TableCell>
                        <TableCell>
                          <Chip 
                            label={getSoilHealthRating(Fields.soilHealth.organicMatter, 'organicMatter').rating} 
                            color={getSoilHealthRating(Fields.soilHealth.organicMatter, 'organicMatter').color as any}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Moisture (%)</TableCell>
                        <TableCell>{Fields.soilHealth.moisture}</TableCell>
                        <TableCell>
                          <Chip 
                            label={getSoilHealthRating(Fields.soilHealth.moisture, 'moisture').rating} 
                            color={getSoilHealthRating(Fields.soilHealth.moisture, 'moisture').color as any}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Soil Analysis Summary
                  </Typography>
                  <Typography variant="body1" paragraph>
                    The soil in {Fields.name} is primarily {Fields.soilType.toLowerCase()}, which is generally suitable for {Fields.crops[0].name.toLowerCase()} cultivation.
                  </Typography>
                  <Typography variant="body1" paragraph>
                    The pH level of {Fields.soilHealth.ph} is {getSoilHealthRating(Fields.soilHealth.ph, 'ph').rating.toLowerCase()} for {Fields.crops[0].name.toLowerCase()} growth.
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Nitrogen levels are {getSoilHealthRating(Fields.soilHealth.nitrogen, 'nitrogen').rating.toLowerCase()}, indicating {getSoilHealthRating(Fields.soilHealth.nitrogen, 'nitrogen').rating === 'Low' ? 'a need for nitrogen fertilization' : 'adequate nitrogen for crop growth'}.
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Soil moisture is currently at {Fields.soilHealth.moisture}%, which is {getSoilHealthRating(Fields.soilHealth.moisture, 'moisture').rating.toLowerCase()} for the current growth stage.
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<AssignmentIcon />}
                      component={RouterLink}
                      to={`/agronomist/fields/${Fields._id}/recommendations/new`}
                    >
                      Create Soil Recommendation
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Crop Health Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Crop Health Status
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Crop</TableCell>
                        <TableCell>Variety</TableCell>
                        <TableCell>Planting Date</TableCell>
                        <TableCell>Expected Harvest</TableCell>
                        <TableCell>Health Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Fields.crops.map((crop) => (
                        <TableRow key={crop._id}>
                          <TableCell>{crop.name}</TableCell>
                          <TableCell>{crop.variety}</TableCell>
                          <TableCell>{formatDate(crop.plantingDate)}</TableCell>
                          <TableCell>{formatDate(crop.expectedHarvestDate)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={crop.healthStatus.charAt(0).toUpperCase() + crop.healthStatus.slice(1)} 
                              color={getHealthStatusColor(crop.healthStatus) as any}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Growth Stage
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body1">
                      Current Stage: Vegetative Growth
                    </Typography>
                    <Box sx={{ mt: 2, mb: 1 }}>
                      <Typography variant="body2" gutterBottom>
                        Growth Progress
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={40} 
                        sx={{ height: 10, borderRadius: 5 }} 
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                        <Typography variant="caption">Planting</Typography>
                        <Typography variant="caption">Current</Typography>
                        <Typography variant="caption">Harvest</Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Crop Analysis Summary
                  </Typography>
                  <Typography variant="body1" paragraph>
                    The {Fields.crops[0].name.toLowerCase()} crop ({Fields.crops[0].variety}) is currently in the vegetative growth stage, with overall {Fields.crops[0].healthStatus} health.
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Planted on {formatDate(Fields.crops[0].plantingDate)}, the crop is expected to be ready for harvest around {formatDate(Fields.crops[0].expectedHarvestDate)}.
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Recent inspection found some minor signs of nutrient deficiency in the eastern section, which should be addressed with appropriate fertilization.
                  </Typography>
                  <Typography variant="body1" paragraph>
                    No significant pest or disease issues have been detected in the current inspection.
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<BugReportIcon />}
                      component={RouterLink}
                      to={`/agronomist/fields/${Fields._id}/issues/new`}
                    >
                      Report Issue
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<AssignmentIcon />}
                      component={RouterLink}
                      to={`/agronomist/fields/${Fields._id}/recommendations/new`}
                    >
                      Create Recommendation
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Weather Impact Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Weather Conditions
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Current Weather
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Temperature
                      </Typography>
                      <Typography variant="h6">
                        {Fields.weatherConditions.temperature}°C
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Humidity
                      </Typography>
                      <Typography variant="h6">
                        {Fields.weatherConditions.humidity}%
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Rainfall (last 7 days)
                      </Typography>
                      <Typography variant="h6">
                        {Fields.weatherConditions.rainfall} mm
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Wind Speed
                      </Typography>
                      <Typography variant="h6">
                        {Fields.weatherConditions.windSpeed} km/h
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Weather Impact Analysis
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Current temperature of {Fields.weatherConditions.temperature}°C is within the optimal range for {Fields.crops[0].name.toLowerCase()} growth.
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Rainfall of {Fields.weatherConditions.rainfall}mm in the last 7 days is {Fields.weatherConditions.rainfall < 15 ? 'below' : 'adequate for'} the crop's water requirements.
                  </Typography>
                  <Typography variant="body1">
                    Recommendation: {Fields.weatherConditions.rainfall < 15 ? 'Increase irrigation to compensate for low rainfall.' : 'Maintain current irrigation schedule.'}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Weather Forecast Impact
                  </Typography>
                  <Typography variant="body1" paragraph>
                    The 7-day forecast indicates temperatures will remain in the optimal range for crop growth.
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Expected rainfall of 25mm over the next week will help maintain soil moisture levels.
                  </Typography>
                  <Typography variant="body1">
                    No extreme weather events are forecasted that would negatively impact the crop.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Inspection History Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Inspection History
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Inspector</TableCell>
                    <TableCell>Findings</TableCell>
                    <TableCell>Recommendations</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Fields.inspectionHistory.map((inspection) => (
                    <TableRow key={inspection._id}>
                      <TableCell>{formatDate(inspection.date)}</TableCell>
                      <TableCell>{inspection.inspector}</TableCell>
                      <TableCell>{inspection.findings}</TableCell>
                      <TableCell>{inspection.recommendations}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<ScienceIcon />}
                component={RouterLink}
                to={`/agronomist/fields/${Fields._id}/inspections/new`}
              >
                Record New Inspection
              </Button>
            </Box>
          </Box>
        </TabPanel>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          startIcon={<VideoCallIcon />}
          component={RouterLink}
          to={`/agronomist/consultations/new?FieldsId=${Fields._id}`}
        >
          Schedule Consultation
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            component={RouterLink}
            to={`/agronomist/fields/${Fields._id}/history`}
          >
            View Complete History
          </Button>
          <Button
            variant="contained"
            startIcon={<AssignmentIcon />}
            component={RouterLink}
            to={`/agronomist/fields/${Fields._id}/recommendations/new`}
          >
            Create Recommendation
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default FieldsAnalysis;