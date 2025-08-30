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
  List
} from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import UmbrellaIcon from '@mui/icons-material/Umbrella';
import AirIcon from '@mui/icons-material/Air';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import HistoryIcon from '@mui/icons-material/History';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import FilterDramaIcon from '@mui/icons-material/FilterDrama';

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
      id={`weather-tabpanel-${index}`}
      aria-labelledby={`weather-tab-${index}`}
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

// Mock weather data
const mockCurrentWeather = {
  location: 'Farm Location',
  date: 'Wednesday, June 1, 2025',
  time: '10:30 AM',
  temperature: '72°F',
  feelsLike: '74°F',
  condition: 'Partly Cloudy',
  humidity: '65%',
  windSpeed: '8 mph',
  windDirection: 'NW',
  precipitation: '0%',
  pressure: '1012 hPa',
  visibility: '10 miles',
  uvIndex: '6 (High)',
  sunrise: '5:42 AM',
  sunset: '8:15 PM'
};

const mockForecast = [
  {
    day: 'Today',
    date: 'Jun 1',
    condition: 'Partly Cloudy',
    high: '75°F',
    low: '58°F',
    precipitation: '10%',
    wind: '8 mph',
    icon: <FilterDramaIcon />
  },
  {
    day: 'Thursday',
    date: 'Jun 2',
    condition: 'Sunny',
    high: '78°F',
    low: '60°F',
    precipitation: '0%',
    wind: '5 mph',
    icon: <WbSunnyIcon />
  },
  {
    day: 'Friday',
    date: 'Jun 3',
    condition: 'Sunny',
    high: '80°F',
    low: '62°F',
    precipitation: '0%',
    wind: '6 mph',
    icon: <WbSunnyIcon />
  },
  {
    day: 'Saturday',
    date: 'Jun 4',
    condition: 'Partly Cloudy',
    high: '82°F',
    low: '65°F',
    precipitation: '10%',
    wind: '7 mph',
    icon: <FilterDramaIcon />
  },
  {
    day: 'Sunday',
    date: 'Jun 5',
    condition: 'Chance of Rain',
    high: '79°F',
    low: '64°F',
    precipitation: '40%',
    wind: '10 mph',
    icon: <UmbrellaIcon />
  },
  {
    day: 'Monday',
    date: 'Jun 6',
    condition: 'Thunderstorms',
    high: '75°F',
    low: '62°F',
    precipitation: '80%',
    wind: '15 mph',
    icon: <ThunderstormIcon />
  },
  {
    day: 'Tuesday',
    date: 'Jun 7',
    condition: 'Partly Cloudy',
    high: '77°F',
    low: '60°F',
    precipitation: '20%',
    wind: '8 mph',
    icon: <FilterDramaIcon />
  }
];

const mockAlerts = [
  {
    type: 'Frost Warning',
    date: 'June 5, 2025',
    description: 'Potential overnight frost may affect sensitive crops. Consider protective measures.',
    severity: 'Moderate',
    icon: <AcUnitIcon />
  },
  {
    type: 'Heavy Rain',
    date: 'June 6-7, 2025',
    description: 'Heavy rainfall expected. Potential for localized flooding in low-lying areas.',
    severity: 'High',
    icon: <UmbrellaIcon />
  },
  {
    type: 'Heat Wave',
    date: 'June 10-15, 2025',
    description: 'Extended period of high temperatures. Ensure adequate irrigation for crops.',
    severity: 'High',
    icon: <ThermostatIcon />
  }
];

const mockHistoricalData = [
  { month: 'January', avgHigh: '45°F', avgLow: '28°F', precipitation: '3.2 in' },
  { month: 'February', avgHigh: '48°F', avgLow: '30°F', precipitation: '2.8 in' },
  { month: 'March', avgHigh: '55°F', avgLow: '35°F', precipitation: '3.5 in' },
  { month: 'April', avgHigh: '65°F', avgLow: '42°F', precipitation: '3.0 in' },
  { month: 'May', avgHigh: '72°F', avgLow: '50°F', precipitation: '3.8 in' },
  { month: 'June', avgHigh: '80°F', avgLow: '58°F', precipitation: '3.2 in' },
  { month: 'July', avgHigh: '85°F', avgLow: '65°F', precipitation: '2.5 in' },
  { month: 'August', avgHigh: '83°F', avgLow: '63°F', precipitation: '2.8 in' },
  { month: 'September', avgHigh: '78°F', avgLow: '55°F', precipitation: '3.0 in' },
  { month: 'October', avgHigh: '68°F', avgLow: '45°F', precipitation: '2.5 in' },
  { month: 'November', avgHigh: '55°F', avgLow: '35°F', precipitation: '3.2 in' },
  { month: 'December', avgHigh: '45°F', avgLow: '28°F', precipitation: '3.5 in' }
];

const Weather: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedField, setSelectedField] = useState('all');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFieldChange = (event: SelectChangeEvent) => {
    setSelectedField(event.target.value);
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <WbSunnyIcon fontSize="large" sx={{ color: 'orange' }} />;
      case 'partly cloudy':
        return <FilterDramaIcon fontSize="large" sx={{ color: '#90caf9' }} />;
      case 'cloudy':
        return <CloudIcon fontSize="large" sx={{ color: 'gray' }} />;
      case 'rain':
      case 'chance of rain':
        return <UmbrellaIcon fontSize="large" sx={{ color: '#42a5f5' }} />;
      case 'thunderstorms':
        return <ThunderstormIcon fontSize="large" sx={{ color: '#5c6bc0' }} />;
      default:
        return <WbSunnyIcon fontSize="large" sx={{ color: 'orange' }} />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="div">
          Weather
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="field-select-label">Location</InputLabel>
          <Select
            labelId="field-select-label"
            id="field-select"
            value={selectedField}
            label="Location"
            onChange={handleFieldChange}
          >
            <MenuItem value="all">All Fields</MenuItem>
            <MenuItem value="north">North Field</MenuItem>
            <MenuItem value="south">South Field</MenuItem>
            <MenuItem value="east">East Field</MenuItem>
            <MenuItem value="west">West Field</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="weather tabs">
            <Tab label="Current" icon={<WbSunnyIcon />} iconPosition="start" />
            <Tab label="Forecast" icon={<CalendarMonthIcon />} iconPosition="start" />
            <Tab label="Alerts" icon={<NotificationsActiveIcon />} iconPosition="start" />
            <Tab label="Historical" icon={<HistoryIcon />} iconPosition="start" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  {getWeatherIcon(mockCurrentWeather.condition)}
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h4">{mockCurrentWeather.temperature}</Typography>
                    <Typography variant="subtitle1">{mockCurrentWeather.condition}</Typography>
                  </Box>
                </Box>
                <Typography variant="body1" gutterBottom>
                  {mockCurrentWeather.location}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {mockCurrentWeather.date} | {mockCurrentWeather.time}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Feels like {mockCurrentWeather.feelsLike}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>Details</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <WaterDropIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">
                        Humidity: {mockCurrentWeather.humidity}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AirIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">
                        Wind: {mockCurrentWeather.windSpeed} {mockCurrentWeather.windDirection}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <UmbrellaIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">
                        Precipitation: {mockCurrentWeather.precipitation}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <DeviceThermostatIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">
                        Pressure: {mockCurrentWeather.pressure}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <WbSunnyIcon sx={{ mr: 1, color: 'orange' }} />
                      <Typography variant="body2">
                        UV Index: {mockCurrentWeather.uvIndex}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <WbSunnyIcon sx={{ mr: 1, color: 'orange' }} />
                      <Typography variant="body2">
                        Sunrise: {mockCurrentWeather.sunrise}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <WbSunnyIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">
                        Sunset: {mockCurrentWeather.sunset}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Today's Hourly Forecast</Typography>
                <Box sx={{ 
                  height: 200, 
                  bgcolor: 'grey.100', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}>
                  <Typography>Hourly Forecast Chart Would Go Here</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Agricultural Weather Insights</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1">Growing Degree Days</Typography>
                        <Typography variant="h4">1,245</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Season accumulation: +15 today
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1">Soil Temperature</Typography>
                        <Typography variant="h4">65°F</Typography>
                        <Typography variant="body2" color="text.secondary">
                          At 4-inch depth
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1">Evapotranspiration</Typography>
                        <Typography variant="h4">0.15 in</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Daily rate
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
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>7-Day Forecast</Typography>
                <Grid container spacing={2}>
                  {mockForecast.map((day, index) => (
                    <Grid item xs={6} sm={4} md={12/7} key={index}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="subtitle1" gutterBottom>
                            {day.day}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {day.date}
                          </Typography>
                          <Box sx={{ my: 2 }}>
                            {day.icon}
                          </Box>
                          <Typography variant="body1" gutterBottom>
                            {day.condition}
                          </Typography>
                          <Typography variant="body2">
                            {day.high} / {day.low}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Precip: {day.precipitation}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Wind: {day.wind}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Precipitation Forecast</Typography>
                <Box sx={{ 
                  height: 300, 
                  bgcolor: 'grey.100', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}>
                  <Typography>Precipitation Forecast Chart Would Go Here</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Temperature Trend</Typography>
                <Box sx={{ 
                  height: 300, 
                  bgcolor: 'grey.100', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}>
                  <Typography>Temperature Trend Chart Would Go Here</Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Weather Alerts</Typography>
          <List>
            {mockAlerts.map((alert, index) => (
              <React.Fragment key={index}>
                <Paper sx={{ mb: 2, p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ 
                      mr: 2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: alert.severity === 'High' ? 'error.main' : 'warning.main',
                      borderRadius: '50%',
                      width: 40,
                      height: 40,
                      color: 'white'
                    }}>
                      {alert.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6">{alert.type}</Typography>
                      <Typography variant="body2" color="text.secondary">{alert.date}</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1">{alert.description}</Typography>
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color={alert.severity === 'High' ? 'error.main' : 'warning.main'}>
                      Severity: {alert.severity}
                    </Typography>
                  </Box>
                </Paper>
              </React.Fragment>
            ))}
          </List>
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Alert Settings</Typography>
          <Paper sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Configure which weather alerts you want to receive and how you want to be notified.
            </Typography>
            <Box sx={{ 
              height: 200, 
              bgcolor: 'grey.100', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              mt: 2
            }}>
              <Typography>Alert Settings UI Would Go Here</Typography>
            </Box>
          </Paper>
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Monthly Averages</Typography>
                <Box sx={{ overflowX: 'auto' }}>
                  <Box sx={{ minWidth: 650 }}>
                    <Grid container sx={{ borderBottom: 1, borderColor: 'divider', py: 1, fontWeight: 'bold' }}>
                      <Grid item xs={3}>
                        <Typography variant="subtitle2">Month</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="subtitle2">Avg High</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="subtitle2">Avg Low</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="subtitle2">Precipitation</Typography>
                      </Grid>
                    </Grid>
                    {mockHistoricalData.map((month, index) => (
                      <Grid container key={index} sx={{ 
                        py: 1, 
                        borderBottom: 1, 
                        borderColor: 'divider',
                        bgcolor: month.month === 'June' ? 'action.hover' : 'transparent'
                      }}>
                        <Grid item xs={3}>
                          <Typography variant="body2">{month.month}</Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">{month.avgHigh}</Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">{month.avgLow}</Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">{month.precipitation}</Typography>
                        </Grid>
                      </Grid>
                    ))}
                  </Box>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Annual Temperature Trends</Typography>
                <Box sx={{ 
                  height: 300, 
                  bgcolor: 'grey.100', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}>
                  <Typography>Temperature Trends Chart Would Go Here</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Annual Precipitation</Typography>
                <Box sx={{ 
                  height: 300, 
                  bgcolor: 'grey.100', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}>
                  <Typography>Precipitation Chart Would Go Here</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Growing Season Comparison</Typography>
                <Box sx={{ 
                  height: 300, 
                  bgcolor: 'grey.100', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}>
                  <Typography>Growing Season Comparison Chart Would Go Here</Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default Weather;