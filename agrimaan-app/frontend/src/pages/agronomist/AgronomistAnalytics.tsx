
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Paper,
  Tabs,
  Tab,
  Divider,
  Button,
  MenuItem,
  TextField,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';

// Mock data for analytics
const mockAnalyticsData = {
  totalFields: 128,
  totalCrops: 15,
  totalIssuesResolved: 87,
  issuesByType: [
    { type: 'Pest', count: 42, percentage: 35 },
    { type: 'Disease', count: 38, percentage: 32 },
    { type: 'Nutrient Deficiency', count: 25, percentage: 21 },
    { type: 'Water Stress', count: 15, percentage: 12 }
  ],
  cropPerformance: [
    { crop: 'Rice', healthScore: 85, yieldPrediction: 92 },
    { crop: 'Wheat', healthScore: 78, yieldPrediction: 80 },
    { crop: 'Maize', healthScore: 92, yieldPrediction: 95 },
    { crop: 'Cotton', healthScore: 65, yieldPrediction: 70 },
    { crop: 'Sugarcane', healthScore: 88, yieldPrediction: 90 }
  ],
  monthlyIssues: [
    { month: 'Jan', count: 12 },
    { month: 'Feb', count: 15 },
    { month: 'Mar', count: 18 },
    { month: 'Apr', count: 22 },
    { month: 'May', count: 28 },
    { month: 'Jun', count: 32 },
    { month: 'Jul', count: 25 },
    { month: 'Aug', count: 20 },
    { month: 'Sep', count: 18 },
    { month: 'Oct', count: 15 },
    { month: 'Nov', count: 12 },
    { month: 'Dec', count: 10 }
  ]
};

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
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AgronomistAnalytics: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('This Year');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Page Header */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" component="h1" gutterBottom>
              Analytics Dashboard
            </Typography>
            <Box>
              <TextField
                select
                size="small"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                sx={{ width: 150, mr: 2 }}
              >
                <MenuItem value="This Week">This Week</MenuItem>
                <MenuItem value="This Month">This Month</MenuItem>
                <MenuItem value="This Year">This Year</MenuItem>
                <MenuItem value="All Time">All Time</MenuItem>
              </TextField>
              <Button 
                variant="outlined" 
                startIcon={<DownloadIcon />}
              >
                Export Data
              </Button>
            </Box>
          </Box>
          <Typography variant="subtitle1" color="text.secondary" paragraph>
            Comprehensive analytics and insights for agricultural data
          </Typography>
        </Grid>

        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <BarChartIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Total Fields Monitored
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {mockAnalyticsData.totalFields}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Across multiple regions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <PieChartIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Crop Varieties
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {mockAnalyticsData.totalCrops}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Under active monitoring
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TimelineIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Issues Resolved
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {mockAnalyticsData.totalIssuesResolved}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                In the current period
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Analytics Tabs */}
        <Grid item xs={12}>
          <Paper sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="analytics tabs">
                <Tab label="Crop Performance" />
                <Tab label="Issue Analysis" />
                <Tab label="Field Health" />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>
                Crop Performance Analysis
              </Typography>
              
              {/* Placeholder for crop performance chart */}
              <Box sx={{ height: 300, bgcolor: 'background.paper', p: 2, borderRadius: 1, border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                <Typography color="text.secondary">
                  Crop Performance Chart would be displayed here
                </Typography>
              </Box>
              
              <Typography variant="subtitle1" gutterBottom>
                Crop Health & Yield Prediction
              </Typography>
              
              <Grid container spacing={2}>
                {mockAnalyticsData.cropPerformance.map((crop) => (
                  <Grid item xs={12} md={6} lg={4} key={crop.crop}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {crop.crop}
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                              Health Score
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {crop.healthScore}%
                            </Typography>
                          </Box>
                          <Box sx={{ width: '100%', bgcolor: 'background.paper', height: 8, borderRadius: 4, mt: 1, position: 'relative', overflow: 'hidden' }}>
                            <Box sx={{ width: `${crop.healthScore}%`, bgcolor: crop.healthScore > 80 ? 'success.main' : crop.healthScore > 60 ? 'warning.main' : 'error.main', height: '100%', borderRadius: 4 }} />
                          </Box>
                        </Box>
                        <Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                              Yield Prediction
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {crop.yieldPrediction}%
                            </Typography>
                          </Box>
                          <Box sx={{ width: '100%', bgcolor: 'background.paper', height: 8, borderRadius: 4, mt: 1, position: 'relative', overflow: 'hidden' }}>
                            <Box sx={{ width: `${crop.yieldPrediction}%`, bgcolor: crop.yieldPrediction > 80 ? 'success.main' : crop.yieldPrediction > 60 ? 'warning.main' : 'error.main', height: '100%', borderRadius: 4 }} />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Issues by Type
                  </Typography>
                  
                  {/* Placeholder for issues by type chart */}
                  <Box sx={{ height: 300, bgcolor: 'background.paper', p: 2, borderRadius: 1, border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                    <Typography color="text.secondary">
                      Issues by Type Chart would be displayed here
                    </Typography>
                  </Box>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Distribution
                  </Typography>
                  
                  {mockAnalyticsData.issuesByType.map((issue) => (
                    <Box key={issue.type} sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">
                          {issue.type}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {issue.count} ({issue.percentage}%)
                        </Typography>
                      </Box>
                      <Box sx={{ width: '100%', bgcolor: 'background.paper', height: 8, borderRadius: 4, mt: 1, position: 'relative', overflow: 'hidden' }}>
                        <Box sx={{ width: `${issue.percentage}%`, bgcolor: 'primary.main', height: '100%', borderRadius: 4 }} />
                      </Box>
                    </Box>
                  ))}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Monthly Issue Trends
                  </Typography>
                  
                  {/* Placeholder for monthly issues chart */}
                  <Box sx={{ height: 300, bgcolor: 'background.paper', p: 2, borderRadius: 1, border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                    <Typography color="text.secondary">
                      Monthly Issue Trends Chart would be displayed here
                    </Typography>
                  </Box>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Resolution Metrics
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">
                            Average Resolution Time
                          </Typography>
                          <Typography variant="h6">
                            2.4 days
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">
                            Resolution Rate
                          </Typography>
                          <Typography variant="h6">
                            94%
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Field Health Overview
              </Typography>
              
              {/* Placeholder for field health map */}
              <Box sx={{ height: 400, bgcolor: 'background.paper', p: 2, borderRadius: 1, border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                <Typography color="text.secondary">
                  Field Health Map would be displayed here
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Soil Health
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: '50%',
                              bgcolor: '#f0f0f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                width: 70,
                                height: 70,
                                borderRadius: '50%',
                                bgcolor: 'white',
                              }
                            }}
                          >
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                background: `conic-gradient(#4caf50 0% 78%, transparent 78% 100%)`,
                                transform: 'rotate(-90deg)',
                              }}
                            />
                            <Typography variant="h6" sx={{ position: 'relative', zIndex: 1 }}>
                              78%
                            </Typography>
                          </Box>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Overall soil health score based on nutrient levels, pH, and organic matter
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Water Management
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: '50%',
                              bgcolor: '#f0f0f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                width: 70,
                                height: 70,
                                borderRadius: '50%',
                                bgcolor: 'white',
                              }
                            }}
                          >
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                background: `conic-gradient(#2196f3 0% 85%, transparent 85% 100%)`,
                                transform: 'rotate(-90deg)',
                              }}
                            />
                            <Typography variant="h6" sx={{ position: 'relative', zIndex: 1 }}>
                              85%
                            </Typography>
                          </Box>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Water efficiency score based on irrigation practices and moisture levels
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Pest Management
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: '50%',
                              bgcolor: '#f0f0f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                width: 70,
                                height: 70,
                                borderRadius: '50%',
                                bgcolor: 'white',
                              }
                            }}
                          >
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                background: `conic-gradient(#ff9800 0% 72%, transparent 72% 100%)`,
                                transform: 'rotate(-90deg)',
                              }}
                            />
                            <Typography variant="h6" sx={{ position: 'relative', zIndex: 1 }}>
                              72%
                            </Typography>
                          </Box>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Pest control effectiveness based on detection and treatment metrics
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AgronomistAnalytics;
