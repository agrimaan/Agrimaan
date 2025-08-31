import React, { useState } from 'react';
import { 
  Box, Paper, Typography, Grid, ToggleButtonGroup, ToggleButton, 
  CircularProgress, useTheme, Tooltip
} from '@mui/material';
import { 
  LineChart, Line, AreaChart, Area, Bar, XAxis, YAxis, CartesianGrid, 
  Legend, ResponsiveContainer, Tooltip as RechartsTooltip, ComposedChart
} from 'recharts';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import AirIcon from '@mui/icons-material/Air';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';

// Define prop types for the component
interface WeatherChartProps {
  fieldId: string;
  fieldName: string;
  weatherData: {
    current: {
      temperature: number;
      humidity: number;
      condition: string;
      windSpeed: number;
      windDirection: string;
      pressure: number;
      rainfall: number;
      cloudCover: number;
      uv: number;
    };
    forecast: Array<{
      date: string;
      temperature: {
        min: number;
        max: number;
      };
      humidity: number;
      condition: string;
      windSpeed: number;
      windDirection: string;
      rainfall: number;
      rainChance: number;
    }>;
  };
  historicalData?: Array<{
    date: string;
    temperature: number;
    humidity: number;
    rainfall: number;
    windSpeed: number;
  }>;
  loading?: boolean;
  error?: string | null;
  timeRange?: 'daily' | 'weekly' | 'monthly';
  onTimeRangeChange?: (range: 'daily' | 'weekly' | 'monthly') => void;
}

const WeatherChart: React.FC<WeatherChartProps> = ({
  fieldId,
  fieldName,
  weatherData,
  historicalData = [],
  loading = false,
  error = null,
  timeRange = 'weekly',
  onTimeRangeChange
}) => {
  const theme = useTheme();
  const [chartType, setChartType] = useState<'temperature' | 'rainfall' | 'humidity' | 'combined'>('combined');

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Handle chart type change
  const handleChartTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newChartType: 'temperature' | 'rainfall' | 'humidity' | 'combined'
  ) => {
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };

  // Handle time range change
  const handleTimeRangeChange = (
    event: React.MouseEvent<HTMLElement>,
    newTimeRange: 'daily' | 'weekly' | 'monthly'
  ) => {
    if (newTimeRange !== null && onTimeRangeChange) {
      onTimeRangeChange(newTimeRange);
    }
  };

  // Prepare forecast data
  const prepareForecastData = () => {
    return weatherData.forecast.map(day => ({
      date: formatDate(day.date),
      minTemp: day.temperature.min,
      maxTemp: day.temperature.max,
      avgTemp: (day.temperature.min + day.temperature.max) / 2,
      rainfall: day.rainfall,
      rainChance: day.rainChance,
      humidity: day.humidity,
      windSpeed: day.windSpeed,
      condition: day.condition
    }));
  };

  // Prepare historical data
  const prepareHistoricalData = () => {
    return historicalData.map(day => ({
      date: formatDate(day.date),
      temperature: day.temperature,
      rainfall: day.rainfall,
      humidity: day.humidity,
      windSpeed: day.windSpeed
    }));
  };

  // Get weather condition icon
  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('rain') || lowerCondition.includes('shower')) {
      return <WaterDropIcon />;
    } else if (lowerCondition.includes('cloud')) {
      return <CloudIcon />;
    } else if (lowerCondition.includes('sun') || lowerCondition.includes('clear')) {
      return <WbSunnyIcon />;
    } else {
      return <CloudIcon />;
    }
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

  // Render current weather
  const renderCurrentWeather = () => {
    const { current } = weatherData;
    
    return (
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>{fieldName} - Current Weather</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ mr: 1, fontSize: '2rem' }}>
                {getWeatherIcon(current.condition)}
              </Box>
              <Typography variant="h6">{current.condition}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Tooltip title="Temperature">
                  <Box sx={{ textAlign: 'center' }}>
                    <ThermostatIcon color="error" />
                    <Typography variant="h6">{current.temperature}°C</Typography>
                  </Box>
                </Tooltip>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Tooltip title="Humidity">
                  <Box sx={{ textAlign: 'center' }}>
                    <WaterDropIcon color="primary" />
                    <Typography variant="h6">{current.humidity}%</Typography>
                  </Box>
                </Tooltip>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Tooltip title="Wind">
                  <Box sx={{ textAlign: 'center' }}>
                    <AirIcon color="info" />
                    <Typography variant="h6">{current.windSpeed} km/h</Typography>
                    <Typography variant="caption">{current.windDirection}</Typography>
                  </Box>
                </Tooltip>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Tooltip title="Rainfall">
                  <Box sx={{ textAlign: 'center' }}>
                    <WaterDropIcon sx={{ color: theme.palette.info.dark }} />
                    <Typography variant="h6">{current.rainfall} mm</Typography>
                  </Box>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  // Render chart controls
  const renderChartControls = () => {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={handleChartTypeChange}
          aria-label="chart type"
          size="small"
        >
          <ToggleButton value="combined" aria-label="combined">
            Combined
          </ToggleButton>
          <ToggleButton value="temperature" aria-label="temperature">
            <ThermostatIcon sx={{ mr: 1 }} />
            Temperature
          </ToggleButton>
          <ToggleButton value="rainfall" aria-label="rainfall">
            <WaterDropIcon sx={{ mr: 1 }} />
            Rainfall
          </ToggleButton>
          <ToggleButton value="humidity" aria-label="humidity">
            <CloudIcon sx={{ mr: 1 }} />
            Humidity
          </ToggleButton>
        </ToggleButtonGroup>

        {onTimeRangeChange && (
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={handleTimeRangeChange}
            aria-label="time range"
            size="small"
          >
            <ToggleButton value="daily" aria-label="daily">
              Daily
            </ToggleButton>
            <ToggleButton value="weekly" aria-label="weekly">
              Weekly
            </ToggleButton>
            <ToggleButton value="monthly" aria-label="monthly">
              Monthly
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      </Box>
    );
  };

  // Render temperature chart
  const renderTemperatureChart = (data: any[]) => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" orientation="left" label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }} />
          <RechartsTooltip />
          <Legend />
          {data[0]?.minTemp !== undefined ? (
            <>
              <Line yAxisId="left" type="monotone" dataKey="minTemp" name="Min Temp" stroke={theme.palette.info.main} activeDot={{ r: 8 }} />
              <Line yAxisId="left" type="monotone" dataKey="maxTemp" name="Max Temp" stroke={theme.palette.error.main} activeDot={{ r: 8 }} />
            </>
          ) : (
            <Line yAxisId="left" type="monotone" dataKey="temperature" name="Temperature" stroke={theme.palette.error.main} activeDot={{ r: 8 }} />
          )}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // Render rainfall chart
  const renderRainfallChart = (data: any[]) => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" orientation="left" label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: 'Rain Chance (%)', angle: 90, position: 'insideRight' }} />
          <RechartsTooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="rainfall" name="Rainfall" fill={theme.palette.primary.main} />
          {data[0]?.rainChance !== undefined && (
            <Line yAxisId="right" type="monotone" dataKey="rainChance" name="Rain Chance" stroke={theme.palette.info.dark} />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  // Render humidity chart
  const renderHumidityChart = (data: any[]) => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis label={{ value: 'Humidity (%)', angle: -90, position: 'insideLeft' }} />
          <RechartsTooltip />
          <Legend />
          <Area type="monotone" dataKey="humidity" name="Humidity" stroke={theme.palette.info.main} fill={theme.palette.info.light} fillOpacity={0.3} />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  // Render combined chart
  const renderCombinedChart = (data: any[]) => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="temp" orientation="left" label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="rain" orientation="right" label={{ value: 'Rainfall (mm)', angle: 90, position: 'insideRight' }} />
          <RechartsTooltip />
          <Legend />
          {data[0]?.minTemp !== undefined ? (
            <>
              <Line yAxisId="temp" type="monotone" dataKey="minTemp" name="Min Temp" stroke={theme.palette.info.main} />
              <Line yAxisId="temp" type="monotone" dataKey="maxTemp" name="Max Temp" stroke={theme.palette.error.main} />
            </>
          ) : (
            <Line yAxisId="temp" type="monotone" dataKey="temperature" name="Temperature" stroke={theme.palette.error.main} />
          )}
          <Bar yAxisId="rain" dataKey="rainfall" name="Rainfall" fill={theme.palette.primary.main} />
          <Line yAxisId="temp" type="monotone" dataKey="humidity" name="Humidity" stroke={theme.palette.info.dark} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  // Render the appropriate chart based on selected type
  const renderChart = () => {
    const forecastData = prepareForecastData();
    const historicalData = prepareHistoricalData();
    const data = historicalData.length > 0 ? [...historicalData, ...forecastData] : forecastData;
    
    switch (chartType) {
      case 'temperature':
        return renderTemperatureChart(data);
      case 'rainfall':
        return renderRainfallChart(data);
      case 'humidity':
        return renderHumidityChart(data);
      case 'combined':
      default:
        return renderCombinedChart(data);
    }
  };

  // Render forecast cards
  const renderForecastCards = () => {
    return (
      <Grid container spacing={2} sx={{ mt: 3 }}>
        {weatherData.forecast.slice(0, 5).map((day, index) => (
          <Grid item xs={6} sm={4} md={2.4} key={index}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
              <Typography variant="body2" color="textSecondary">
                {formatDate(day.date)}
              </Typography>
              <Box sx={{ fontSize: '2rem', my: 1 }}>
                {getWeatherIcon(day.condition)}
              </Box>
              <Typography variant="body2">{day.condition}</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1">
                  {day.temperature.min}° - {day.temperature.max}°C
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
                  <WaterDropIcon fontSize="small" color="info" />
                  <Typography variant="body2" sx={{ ml: 0.5 }}>
                    {day.rainfall}mm ({day.rainChance}%)
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      {renderCurrentWeather()}
      
      <Paper elevation={2} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Weather Forecast</Typography>
        {renderChartControls()}
        {renderChart()}
        {renderForecastCards()}
      </Paper>
    </Box>
  );
};

export default WeatherChart;