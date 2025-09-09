import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Tabs,
  Tab,
  Button
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DateRangeIcon from '@mui/icons-material/DateRange';
import InsightsIcon from '@mui/icons-material/Insights';
import WaterIcon from '@mui/icons-material/Water';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';

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

const Analytics: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('7days');
  const [selectedFields, setSelectedFields] = useState('all');
  const [selectedCrop, setSelectedCrop] = useState('all');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRange(event.target.value);
  };

  const handleFieldsChange = (event: SelectChangeEvent) => {
    setSelectedFields(event.target.value);
  };

  const handleCropChange = (event: SelectChangeEvent) => {
    setSelectedCrop(event.target.value);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="div">
          Analytics
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<DownloadIcon />}
        >
          Export Data
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel id="time-range-label">Time Range</InputLabel>
            <Select
              labelId="time-range-label"
              id="time-range"
              value={timeRange}
              label="Time Range"
              onChange={handleTimeRangeChange}
              startAdornment={<DateRangeIcon sx={{ mr: 1 }} />}
            >
              <MenuItem value="24hours">Last 24 Hours</MenuItem>
              <MenuItem value="7days">Last 7 Days</MenuItem>
              <MenuItem value="30days">Last 30 Days</MenuItem>
              <MenuItem value="90days">Last 90 Days</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
              <MenuItem value="custom">Custom Range</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel id="Fields-select-label">Fields</InputLabel>
            <Select
              labelId="Fields-select-label"
              id="Fields-select"
              value={selectedFields}
              label="Fields"
              onChange={handleFieldsChange}
            >
              <MenuItem value="all">All fields</MenuItem>
              <MenuItem value="north">North Fields</MenuItem>
              <MenuItem value="south">South Fields</MenuItem>
              <MenuItem value="east">East Fields</MenuItem>
              <MenuItem value="west">West Fields</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel id="crop-select-label">Crop</InputLabel>
            <Select
              labelId="crop-select-label"
              id="crop-select"
              value={selectedCrop}
              label="Crop"
              onChange={handleCropChange}
            >
              <MenuItem value="all">All Crops</MenuItem>
              <MenuItem value="wheat">Wheat</MenuItem>
              <MenuItem value="corn">Corn</MenuItem>
              <MenuItem value="soybeans">Soybeans</MenuItem>
              <MenuItem value="rice">Rice</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="analytics tabs">
            <Tab label="Overview" icon={<InsightsIcon />} iconPosition="start" />
            <Tab label="Soil & Water" icon={<WaterIcon />} iconPosition="start" />
            <Tab label="Crop Performance" icon={<AgricultureIcon />} iconPosition="start" />
            <Tab label="Weather Impact" icon={<DeviceThermostatIcon />} iconPosition="start" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, height: 400 }}>
                <Typography variant="h6" gutterBottom>Yield Trends</Typography>
                <Box sx={{ 
                  height: 350, 
                  bgcolor: 'grey.100', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}>
                  <Typography>Yield Trend Chart Would Go Here</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Yield Forecast</Typography>
                      <Typography variant="h3" color="primary">+12%</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Compared to last season
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Resource Efficiency</Typography>
                      <Typography variant="h3" color="success.main">+8%</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Improved water usage efficiency
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Health Index</Typography>
                      <Typography variant="h3" color="info.main">85/100</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Overall crop health score
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Key Insights</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                      <CardContent>
                        <Typography variant="subtitle1">Optimal Irrigation</Typography>
                        <Typography variant="body2">
                          Soil moisture levels have been maintained within optimal range 92% of the time, 
                          leading to 15% water savings compared to previous seasons.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                      <CardContent>
                        <Typography variant="subtitle1">Pest Alert</Typography>
                        <Typography variant="body2">
                          Early detection of aphid population in the South Fields. 
                          Recommended action: targeted treatment in affected areas.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
                      <CardContent>
                        <Typography variant="subtitle1">Weather Forecast Impact</Typography>
                        <Typography variant="body2">
                          Upcoming dry spell predicted. Recommended action: 
                          adjust irrigation schedule for the next 10 days.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 400 }}>
                <Typography variant="h6" gutterBottom>Soil Moisture Trends</Typography>
                <Box sx={{ 
                  height: 350, 
                  bgcolor: 'grey.100', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}>
                  <Typography>Soil Moisture Chart Would Go Here</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 400 }}>
                <Typography variant="h6" gutterBottom>Water Usage</Typography>
                <Box sx={{ 
                  height: 350, 
                  bgcolor: 'grey.100', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}>
                  <Typography>Water Usage Chart Would Go Here</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Soil Health Indicators</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1">pH Level</Typography>
                        <Typography variant="h4">6.8</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Optimal range: 6.5-7.0
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1">Nitrogen</Typography>
                        <Typography variant="h4">Medium</Typography>
                        <Typography variant="body2" color="text.secondary">
                          65 ppm (Adequate)
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1">Phosphorus</Typography>
                        <Typography variant="h4">High</Typography>
                        <Typography variant="body2" color="text.secondary">
                          80 ppm (Optimal)
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1">Potassium</Typography>
                        <Typography variant="h4">Low</Typography>
                        <Typography variant="body2" color="warning.main">
                          55 ppm (Needs attention)
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, height: 400 }}>
                <Typography variant="h6" gutterBottom>Growth Rate Comparison</Typography>
                <Box sx={{ 
                  height: 350, 
                  bgcolor: 'grey.100', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}>
                  <Typography>Growth Rate Chart Would Go Here</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: 400 }}>
                <Typography variant="h6" gutterBottom>Crop Health Distribution</Typography>
                <Box sx={{ 
                  height: 350, 
                  bgcolor: 'grey.100', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}>
                  <Typography>Crop Health Pie Chart Would Go Here</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Yield Comparison by Fields</Typography>
                <Box sx={{ 
                  height: 300, 
                  bgcolor: 'grey.100', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}>
                  <Typography>Yield Comparison Bar Chart Would Go Here</Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 400 }}>
                <Typography variant="h6" gutterBottom>Temperature vs. Growth Rate</Typography>
                <Box sx={{ 
                  height: 350, 
                  bgcolor: 'grey.100', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}>
                  <Typography>Temperature Impact Chart Would Go Here</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 400 }}>
                <Typography variant="h6" gutterBottom>Rainfall Distribution</Typography>
                <Box sx={{ 
                  height: 350, 
                  bgcolor: 'grey.100', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}>
                  <Typography>Rainfall Chart Would Go Here</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Weather Event Impact Analysis</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1">Heat Stress Days</Typography>
                        <Typography variant="h4">12 days</Typography>
                        <Typography variant="body2" color="warning.main">
                          3 days above critical threshold
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1">Frost Events</Typography>
                        <Typography variant="h4">0 days</Typography>
                        <Typography variant="body2" color="success.main">
                          No frost damage detected
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1">Drought Stress</Typography>
                        <Typography variant="h4">5 days</Typography>
                        <Typography variant="body2" color="info.main">
                          Mitigated by irrigation adjustments
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default Analytics;