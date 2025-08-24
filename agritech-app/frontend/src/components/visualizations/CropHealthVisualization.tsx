import React from 'react';
import { Box, Paper, Typography, Grid, Tooltip, CircularProgress, useTheme } from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// Define prop types for the component
interface CropHealthVisualizationProps {
  cropData: {
    _id: string;
    name: string;
    type: string;
    variety?: string;
    status: string;
    healthStatus: string;
    plantingDate: string;
    harvestDate?: string;
    expectedYield?: number;
    actualYield?: number;
  };
  healthMetrics?: {
    ndvi?: number; // Normalized Difference Vegetation Index (0-1)
    leafColorIndex?: number; // Leaf color index (0-100)
    growthRate?: number; // Growth rate compared to expected (0-200%)
    pestRisk?: number; // Pest risk level (0-100)
    diseaseRisk?: number; // Disease risk level (0-100)
    stressLevel?: number; // Plant stress level (0-100)
    soilHealth?: number; // Soil health index (0-100)
    waterStress?: number; // Water stress index (0-100)
    nutrientDeficiency?: number; // Nutrient deficiency level (0-100)
  };
  historicalHealth?: Array<{
    date: string;
    ndvi: number;
    healthScore: number;
  }>;
  loading?: boolean;
  error?: string | null;
}

const CropHealthVisualization: React.FC<CropHealthVisualizationProps> = ({
  cropData,
  healthMetrics = {},
  historicalHealth = [],
  loading = false,
  error = null
}) => {
  const theme = useTheme();

  // Define health status colors
  const healthStatusColors: Record<string, string> = {
    excellent: theme.palette.success.main,
    good: theme.palette.success.light,
    fair: theme.palette.warning.main,
    poor: theme.palette.error.light,
    critical: theme.palette.error.main,
    unknown: theme.palette.grey[500]
  };

  // Get color for current health status
  const getHealthStatusColor = () => {
    return healthStatusColors[cropData.healthStatus.toLowerCase()] || healthStatusColors.unknown;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Calculate days since planting
  const calculateDaysSincePlanting = () => {
    const plantingDate = new Date(cropData.plantingDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - plantingDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calculate days until harvest
  const calculateDaysUntilHarvest = () => {
    if (!cropData.harvestDate) return null;
    
    const harvestDate = new Date(cropData.harvestDate);
    const today = new Date();
    
    if (today > harvestDate) return 0;
    
    const diffTime = Math.abs(harvestDate.getTime() - today.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Prepare data for health metrics radar chart
  const prepareRadarData = () => {
    const metrics = [
      { name: 'NDVI', value: healthMetrics.ndvi ? healthMetrics.ndvi * 100 : 0, fullMark: 100 },
      { name: 'Leaf Color', value: healthMetrics.leafColorIndex || 0, fullMark: 100 },
      { name: 'Growth Rate', value: healthMetrics.growthRate || 0, fullMark: 100 },
      { name: 'Soil Health', value: healthMetrics.soilHealth || 0, fullMark: 100 },
      { name: 'Water', value: 100 - (healthMetrics.waterStress || 0), fullMark: 100 },
      { name: 'Nutrients', value: 100 - (healthMetrics.nutrientDeficiency || 0), fullMark: 100 },
    ];
    return metrics;
  };

  // Prepare data for risk pie chart
  const prepareRiskData = () => {
    return [
      { name: 'Pest Risk', value: healthMetrics.pestRisk || 0 },
      { name: 'Disease Risk', value: healthMetrics.diseaseRisk || 0 },
      { name: 'Stress Level', value: healthMetrics.stressLevel || 0 },
      { name: 'Healthy', value: 100 - ((healthMetrics.pestRisk || 0) + (healthMetrics.diseaseRisk || 0) + (healthMetrics.stressLevel || 0)) / 3 }
    ];
  };

  // Prepare historical health data for line chart
  const prepareHistoricalData = () => {
    return historicalHealth.map(item => ({
      date: new Date(item.date).toLocaleDateString(),
      ndvi: item.ndvi * 100, // Convert to percentage
      healthScore: item.healthScore
    }));
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

  return (
    <Box sx={{ width: '100%' }}>
      {/* Crop Info Header */}
      <Paper elevation={2} sx={{ p: 2, mb: 3, borderLeft: `6px solid ${getHealthStatusColor()}` }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>{cropData.name}</Typography>
            <Typography variant="body1">
              Type: <strong>{cropData.type}</strong>
              {cropData.variety && <> | Variety: <strong>{cropData.variety}</strong></>}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Planted: <strong>{formatDate(cropData.plantingDate)}</strong> ({calculateDaysSincePlanting()} days ago)
            </Typography>
            {cropData.harvestDate && (
              <Typography variant="body2">
                Expected Harvest: <strong>{formatDate(cropData.harvestDate)}</strong> 
                {calculateDaysUntilHarvest() !== null && calculateDaysUntilHarvest() > 0 && 
                  <> ({calculateDaysUntilHarvest()} days remaining)</>
                }
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="body2">Status: <strong>{cropData.status}</strong></Typography>
              <Typography variant="h6" sx={{ color: getHealthStatusColor(), mt: 1 }}>
                Health: <strong>{cropData.healthStatus}</strong>
              </Typography>
              {cropData.expectedYield && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Expected Yield: <strong>{cropData.expectedYield} kg/ha</strong>
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Health Metrics Radar Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Health Metrics</Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={prepareRadarData()}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Health Metrics"
                    dataKey="value"
                    stroke={theme.palette.primary.main}
                    fill={theme.palette.primary.main}
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Risk Assessment Pie Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Risk Assessment</Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={prepareRiskData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {prepareRiskData().map((entry, index) => {
                      const colors = [
                        theme.palette.error.main, // Pest Risk
                        theme.palette.warning.main, // Disease Risk
                        theme.palette.warning.light, // Stress Level
                        theme.palette.success.main, // Healthy
                      ];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Historical Health Chart */}
        {historicalHealth.length > 0 && (
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Historical Health Trends</Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={prepareHistoricalData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="ndvi" name="NDVI (%)" fill={theme.palette.success.main} />
                    <Bar dataKey="healthScore" name="Health Score" fill={theme.palette.primary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Health Indicators */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Health Indicators</Typography>
            <Grid container spacing={2}>
              {Object.entries(healthMetrics).map(([key, value]) => {
                if (value === undefined) return null;
                
                // Format the key for display
                const formattedKey = key
                  .replace(/([A-Z])/g, ' $1') // Add space before capital letters
                  .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
                  .replace(/([a-z])([A-Z])/g, '$1 $2'); // Add space between camelCase words
                
                // Determine color based on value and metric type
                let color = theme.palette.info.main;
                let formattedValue = value;
                
                if (key === 'ndvi') {
                  formattedValue = (value * 100).toFixed(1) + '%';
                  if (value < 0.3) color = theme.palette.error.main;
                  else if (value < 0.5) color = theme.palette.warning.main;
                  else color = theme.palette.success.main;
                } else if (key === 'growthRate') {
                  formattedValue = value.toFixed(1) + '%';
                  if (value < 70) color = theme.palette.error.main;
                  else if (value < 90) color = theme.palette.warning.main;
                  else color = theme.palette.success.main;
                } else if (key.includes('Risk') || key.includes('Stress') || key.includes('Deficiency')) {
                  formattedValue = value.toFixed(1) + '%';
                  if (value > 70) color = theme.palette.error.main;
                  else if (value > 30) color = theme.palette.warning.main;
                  else color = theme.palette.success.main;
                } else {
                  formattedValue = value.toFixed(1) + '%';
                  if (value < 30) color = theme.palette.error.main;
                  else if (value < 60) color = theme.palette.warning.main;
                  else color = theme.palette.success.main;
                }
                
                return (
                  <Grid item xs={6} sm={4} md={3} key={key}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        {formattedKey}
                      </Typography>
                      <Typography variant="h6" sx={{ color }}>
                        {formattedValue}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CropHealthVisualization;