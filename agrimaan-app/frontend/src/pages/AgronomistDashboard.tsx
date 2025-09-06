
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  Science as ScienceIcon,
  Grass as GrassIcon,
  Terrain as TerrainIcon,
  Assignment as AssignmentIcon,
  VideoCall as VideoCallIcon,
  Notifications as NotificationsIcon,
  Spa as SpaIcon,
  BugReport as BugReportIcon
} from '@mui/icons-material';
import { RootState } from '../store';
import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

// Define types
interface Field {
  _id: string;
  name: string;
  location: string;
  size: number;
  unit: string;
  owner: {
    _id: string;
    name: string;
  };
  crops: Array<{
    _id: string;
    name: string;
    variety: string;
    status: string;
  }>;
  soilType: string;
  lastInspection: string;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
}

interface Recommendation {
  _id: string;
  field: {
    _id: string;
    name: string;
  };
  farmer: {
    _id: string;
    name: string;
  };
  type: 'fertilizer' | 'pesticide' | 'irrigation' | 'harvest' | 'planting' | 'other';
  description: string;
  status: 'pending' | 'accepted' | 'rejected' | 'implemented';
  createdAt: string;
  dueDate: string;
}

interface Consultation {
  _id: string;
  farmer: {
    _id: string;
    name: string;
    email: string;
  };
  field?: {
    _id: string;
    name: string;
  };
  topic: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  scheduledDate: string;
  notes?: string;
}

interface CropIssue {
  _id: string;
  field: {
    _id: string;
    name: string;
  };
  farmer: {
    _id: string;
    name: string;
  };
  crop: {
    _id: string;
    name: string;
    variety: string;
  };
  issueType: 'disease' | 'pest' | 'nutrient' | 'water' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'diagnosed' | 'treated' | 'resolved';
  reportedDate: string;
}

interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  forecast: Array<{
    date: string;
    condition: string;
    temperature: {
      min: number;
      max: number;
    };
    precipitation: number;
  }>;
}

const AgronomistDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [monitoredFields, setMonitoredFields] = useState<Field[]>([]);
  const [pendingRecommendations, setPendingRecommendations] = useState<Recommendation[]>([]);
  const [upcomingConsultations, setUpcomingConsultations] = useState<Consultation[]>([]);
  const [recentCropIssues, setRecentCropIssues] = useState<CropIssue[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  
  const [loading, setLoading] = useState({
    fields: true,
    recommendations: true,
    consultations: true,
    cropIssues: true,
    weather: true
  });

  useEffect(() => {
    // In a real implementation, these would be API calls
    // For now, we'll use mock data

    // Mock fields data
    const mockFields: Field[] = [
      {
        _id: 'f1',
        name: 'North Wheat Field',
        location: 'Punjab',
        size: 25,
        unit: 'acres',
        owner: {
          _id: 'u1',
          name: 'Farmer Singh'
        },
        crops: [
          {
            _id: 'c1',
            name: 'Wheat',
            variety: 'HD-2967',
            status: 'growing'
          }
        ],
        soilType: 'Loamy',
        lastInspection: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        healthStatus: 'good'
      },
      {
        _id: 'f2',
        name: 'South Rice Paddy',
        location: 'Kerala',
        size: 15,
        unit: 'acres',
        owner: {
          _id: 'u2',
          name: 'Farmer Kumar'
        },
        crops: [
          {
            _id: 'c2',
            name: 'Rice',
            variety: 'Basmati-1121',
            status: 'growing'
          }
        ],
        soilType: 'Clay',
        lastInspection: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        healthStatus: 'fair'
      },
      {
        _id: 'f3',
        name: 'East Cotton Field',
        location: 'Gujarat',
        size: 30,
        unit: 'acres',
        owner: {
          _id: 'u3',
          name: 'Farmer Patel'
        },
        crops: [
          {
            _id: 'c3',
            name: 'Cotton',
            variety: 'Bt Cotton',
            status: 'growing'
          }
        ],
        soilType: 'Sandy Loam',
        lastInspection: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        healthStatus: 'excellent'
      },
      {
        _id: 'f4',
        name: 'West Sugarcane Field',
        location: 'Maharashtra',
        size: 20,
        unit: 'acres',
        owner: {
          _id: 'u4',
          name: 'Farmer Deshmukh'
        },
        crops: [
          {
            _id: 'c4',
            name: 'Sugarcane',
            variety: 'CO-0238',
            status: 'growing'
          }
        ],
        soilType: 'Alluvial',
        lastInspection: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        healthStatus: 'poor'
      }
    ];

    // Mock recommendations data
    const mockRecommendations: Recommendation[] = [
      {
        _id: 'r1',
        field: {
          _id: 'f1',
          name: 'North Wheat Field'
        },
        farmer: {
          _id: 'u1',
          name: 'Farmer Singh'
        },
        type: 'fertilizer',
        description: 'Apply nitrogen fertilizer at 50kg/acre to address yellowing leaves',
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'r2',
        field: {
          _id: 'f2',
          name: 'South Rice Paddy'
        },
        farmer: {
          _id: 'u2',
          name: 'Farmer Kumar'
        },
        type: 'irrigation',
        description: 'Increase irrigation frequency to twice daily due to high temperatures',
        status: 'pending',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'r3',
        field: {
          _id: 'f3',
          name: 'East Cotton Field'
        },
        farmer: {
          _id: 'u3',
          name: 'Farmer Patel'
        },
        type: 'pesticide',
        description: 'Apply recommended pesticide to control bollworm infestation',
        status: 'accepted',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Mock consultations data
    const mockConsultations: Consultation[] = [
      {
        _id: 'c1',
        farmer: {
          _id: 'u1',
          name: 'Farmer Singh',
          email: 'farmer.singh@example.com'
        },
        field: {
          _id: 'f1',
          name: 'North Wheat Field'
        },
        topic: 'Wheat disease prevention strategies',
        status: 'scheduled',
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'c2',
        farmer: {
          _id: 'u2',
          name: 'Farmer Kumar',
          email: 'farmer.kumar@example.com'
        },
        field: {
          _id: 'f2',
          name: 'South Rice Paddy'
        },
        topic: 'Rice yield optimization techniques',
        status: 'scheduled',
        scheduledDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Mock crop issues data
    const mockCropIssues: CropIssue[] = [
      {
        _id: 'i1',
        field: {
          _id: 'f1',
          name: 'North Wheat Field'
        },
        farmer: {
          _id: 'u1',
          name: 'Farmer Singh'
        },
        crop: {
          _id: 'c1',
          name: 'Wheat',
          variety: 'HD-2967'
        },
        issueType: 'disease',
        description: 'Yellow rust observed on wheat leaves',
        severity: 'medium',
        status: 'diagnosed',
        reportedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'i2',
        field: {
          _id: 'f4',
          name: 'West Sugarcane Field'
        },
        farmer: {
          _id: 'u4',
          name: 'Farmer Deshmukh'
        },
        crop: {
          _id: 'c4',
          name: 'Sugarcane',
          variety: 'CO-0238'
        },
        issueType: 'pest',
        description: 'Sugarcane borer infestation detected',
        severity: 'high',
        status: 'reported',
        reportedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Mock weather data
    const mockWeatherData: WeatherData = {
      location: 'Punjab Agricultural Region',
      temperature: 32,
      humidity: 65,
      precipitation: 10,
      windSpeed: 8,
      forecast: [
        {
          date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          condition: 'Partly Cloudy',
          temperature: {
            min: 26,
            max: 34
          },
          precipitation: 20
        },
        {
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          condition: 'Scattered Showers',
          temperature: {
            min: 25,
            max: 33
          },
          precipitation: 40
        },
        {
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          condition: 'Sunny',
          temperature: {
            min: 27,
            max: 36
          },
          precipitation: 5
        }
      ]
    };

    // Set the mock data with a small delay to simulate API calls
    setTimeout(() => {
      setMonitoredFields(mockFields);
      setLoading(prev => ({ ...prev, fields: false }));
    }, 300);

    setTimeout(() => {
      setPendingRecommendations(mockRecommendations);
      setLoading(prev => ({ ...prev, recommendations: false }));
    }, 500);

    setTimeout(() => {
      setUpcomingConsultations(mockConsultations);
      setLoading(prev => ({ ...prev, consultations: false }));
    }, 700);

    setTimeout(() => {
      setRecentCropIssues(mockCropIssues);
      setLoading(prev => ({ ...prev, cropIssues: false }));
    }, 900);

    setTimeout(() => {
      setWeatherData(mockWeatherData);
      setLoading(prev => ({ ...prev, weather: false }));
    }, 1100);
  }, []);

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

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'info';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get recommendation type icon
  const getRecommendationTypeIcon = (type: string) => {
    switch (type) {
      case 'fertilizer':
        return <SpaIcon />;
      case 'pesticide':
        return <BugReportIcon />;
      case 'irrigation':
        return <TerrainIcon />;
      case 'harvest':
        return <GrassIcon />;
      case 'planting':
        return <SpaIcon />;
      default:
        return <AssignmentIcon />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Agronomist Dashboard
        </Typography>
        
        <Box>
          <Button
            component={RouterLink}
            to="/agronomist/fields"
            variant="contained"
            startIcon={<TerrainIcon />}
            sx={{ mr: 1 }}
          >
            Monitor Fields
          </Button>
          <Button
            component={RouterLink}
            to="/agronomist/consultations"
            variant="outlined"
            startIcon={<VideoCallIcon />}
          >
            Consultations
          </Button>
        </Box>
      </Box>

      {/* Welcome Card */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Welcome back, {user?.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor field conditions, provide expert recommendations, and help farmers optimize their crop yields with your agricultural expertise.
        </Typography>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Monitored Fields
                  </Typography>
                  <Typography variant="h4" component="div">
                    {loading.fields ? '..' : monitoredFields.length}
                  </Typography>
                </Box>
                <TerrainIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Link component={RouterLink} to="/agronomist/fields" color="primary" underline="hover">
                  View all fields
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Pending Recommendations
                  </Typography>
                  <Typography variant="h4" component="div">
                    {loading.recommendations ? '..' : pendingRecommendations.filter(rec => rec.status === 'pending').length}
                  </Typography>
                </Box>
                <AssignmentIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Link component={RouterLink} to="/agronomist/recommendations" color="primary" underline="hover">
                  Manage recommendations
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Upcoming Consultations
                  </Typography>
                  <Typography variant="h4" component="div">
                    {loading.consultations ? '..' : upcomingConsultations.length}
                  </Typography>
                </Box>
                <VideoCallIcon color="info" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Link component={RouterLink} to="/agronomist/consultations" color="primary" underline="hover">
                  View schedule
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Crop Issues
                  </Typography>
                  <Typography variant="h4" component="div">
                    {loading.cropIssues ? '..' : recentCropIssues.length}
                  </Typography>
                </Box>
                <BugReportIcon color="error" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Link component={RouterLink} to="/agronomist/crop-issues" color="primary" underline="hover">
                  View all issues
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Weather Information */}
      {!loading.weather && weatherData && (
        <Paper sx={{ p: 2, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h2">
              Weather Information - {weatherData.location}
            </Typography>
            <Button 
              component={RouterLink} 
              to="/agronomist/weather" 
              size="small"
            >
              Detailed Forecast
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1">
                  Current Conditions
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                  <Chip label={`Temperature: ${weatherData.temperature}\u00b0C`} />
                  <Chip label={`Humidity: ${weatherData.humidity}%`} />
                  <Chip label={`Precipitation: ${weatherData.precipitation}%`} />
                  <Chip label={`Wind: ${weatherData.windSpeed} km/h`} />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" gutterBottom>
                3-Day Forecast
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {weatherData.forecast.map((day, index) => (
                  <Chip 
                    key={index}
                    label={`${formatDate(day.date)}: ${day.condition}, ${day.temperature.min}-${day.temperature.max}\u00b0C`} 
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Field Health Status */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            Field Health Status
          </Typography>
          <Button 
            component={RouterLink} 
            to="/agronomist/fields" 
            size="small" 
            endIcon={<TerrainIcon />}
          >
            View All
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        {loading.fields ? (
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        ) : monitoredFields.length === 0 ? (
          <Typography color="text.secondary">
            No fields are currently being monitored.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Field Name</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Crop</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell>Last Inspection</TableCell>
                  <TableCell>Health Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {monitoredFields.map((field) => (
                  <TableRow key={field._id}>
                    <TableCell>{field.name}</TableCell>
                    <TableCell>{field.location}</TableCell>
                    <TableCell>
                      {field.crops.map(crop => crop.name).join(', ')}
                    </TableCell>
                    <TableCell>{field.owner.name}</TableCell>
                    <TableCell>{formatDate(field.lastInspection)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={field.healthStatus.charAt(0).toUpperCase() + field.healthStatus.slice(1)} 
                        color={getHealthStatusColor(field.healthStatus) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button 
                        component={RouterLink} 
                        to={`/agronomist/fields/${field._id}`} 
                        size="small" 
                        variant="outlined"
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Recent Crop Issues */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            Recent Crop Issues
          </Typography>
          <Button 
            component={RouterLink} 
            to="/agronomist/crop-issues" 
            size="small" 
            endIcon={<BugReportIcon />}
          >
            View All
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        {loading.cropIssues ? (
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        ) : recentCropIssues.length === 0 ? (
          <Typography color="text.secondary">
            No crop issues have been reported recently.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Field</TableCell>
                  <TableCell>Crop</TableCell>
                  <TableCell>Issue Type</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Reported Date</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentCropIssues.map((issue) => (
                  <TableRow key={issue._id}>
                    <TableCell>{issue.field.name}</TableCell>
                    <TableCell>{issue.crop.name} ({issue.crop.variety})</TableCell>
                    <TableCell>{issue.issueType.charAt(0).toUpperCase() + issue.issueType.slice(1)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)} 
                        color={getSeverityColor(issue.severity) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}</TableCell>
                    <TableCell>{formatDate(issue.reportedDate)}</TableCell>
                    <TableCell align="right">
                      <Button 
                        component={RouterLink} 
                        to={`/agronomist/crop-issues/${issue._id}`} 
                        size="small" 
                        variant="outlined"
                      >
                        Diagnose
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Pending Recommendations */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            Pending Recommendations
          </Typography>
          <Button 
            component={RouterLink} 
            to="/agronomist/recommendations" 
            size="small" 
            endIcon={<AssignmentIcon />}
          >
            Manage All
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        {loading.recommendations ? (
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        ) : pendingRecommendations.length === 0 ? (
          <Typography color="text.secondary">
            No pending recommendations at the moment.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Field</TableCell>
                  <TableCell>Farmer</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingRecommendations.map((recommendation) => (
                  <TableRow key={recommendation._id}>
                    <TableCell>{recommendation.field.name}</TableCell>
                    <TableCell>{recommendation.farmer.name}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getRecommendationTypeIcon(recommendation.type)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {recommendation.type.charAt(0).toUpperCase() + recommendation.type.slice(1)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {recommendation.description.length > 50 
                        ? `${recommendation.description.substring(0, 50)}...` 
                        : recommendation.description}
                    </TableCell>
                    <TableCell>{formatDate(recommendation.createdAt)}</TableCell>
                    <TableCell>{formatDate(recommendation.dueDate)}</TableCell>
                    <TableCell align="right">
                      <Button 
                        component={RouterLink} 
                        to={`/agronomist/recommendations/${recommendation._id}`} 
                        size="small" 
                        variant="outlined"
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default AgronomistDashboard;
