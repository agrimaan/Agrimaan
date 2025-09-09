import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  TextField,
  MenuItem,
  InputAdornment,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Terrain as TerrainIcon,
  Grass as GrassIcon,
  Science as ScienceIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  BugReport as BugReportIcon
} from '@mui/icons-material';
import { RootState } from '../../store';

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

const AgronomistFields: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [fields, setFields] = useState<Field[]>([]);
  const [filteredFields, setFilteredFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHealthStatus, setFilterHealthStatus] = useState('all');
  const [filterSoilType, setFilterSoilType] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');

  useEffect(() => {
    // In a real implementation, this would be an API call
    // For now, we'll use mock data
    const fetchFields = async () => {
      setLoading(true);
      
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
        },
        {
          _id: 'f5',
          name: 'Central Vegetable Garden',
          location: 'Karnataka',
          size: 5,
          unit: 'acres',
          owner: {
            _id: 'u5',
            name: 'Farmer Reddy'
          },
          crops: [
            {
              _id: 'c5',
              name: 'Tomatoes',
              variety: 'Roma',
              status: 'growing'
            },
            {
              _id: 'c6',
              name: 'Peppers',
              variety: 'Bell',
              status: 'growing'
            }
          ],
          soilType: 'Loamy',
          lastInspection: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          healthStatus: 'good'
        },
        {
          _id: 'f6',
          name: 'Hillside Orchard',
          location: 'Himachal Pradesh',
          size: 10,
          unit: 'acres',
          owner: {
            _id: 'u6',
            name: 'Farmer Thakur'
          },
          crops: [
            {
              _id: 'c7',
              name: 'Apples',
              variety: 'Red Delicious',
              status: 'growing'
            }
          ],
          soilType: 'Sandy',
          lastInspection: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          healthStatus: 'excellent'
        }
      ];

      // Simulate API delay
      setTimeout(() => {
        setFields(mockFields);
        setFilteredFields(mockFields);
        setLoading(false);
      }, 800);
    };

    fetchFields();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...fields];
    
    // Apply search term
    if (searchTerm) {
      result = result.filter(field => 
        field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.crops.some(crop => crop.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply health status filter
    if (filterHealthStatus !== 'all') {
      result = result.filter(field => field.healthStatus === filterHealthStatus);
    }
    
    // Apply soil type filter
    if (filterSoilType !== 'all') {
      result = result.filter(field => field.soilType.toLowerCase() === filterSoilType.toLowerCase());
    }
    
    // Apply location filter
    if (filterLocation !== 'all') {
      result = result.filter(field => field.location === filterLocation);
    }
    
    setFilteredFields(result);
  }, [fields, searchTerm, filterHealthStatus, filterSoilType, filterLocation]);

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

  // Get unique locations for filter
  const locations = ['all', ...Array.from(new Set(fields.map(field => field.location)))];
  
  // Get unique soil types for filter
  const soilTypes = ['all', ...Array.from(new Set(fields.map(field => field.location)))];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Monitored Fields
        </Typography>
        
        <Box>
          <Button
            component={RouterLink}
            to="/agronomist/recommendations"
            variant="outlined"
            startIcon={<AssignmentIcon />}
            sx={{ mr: 1 }}
          >
            Recommendations
          </Button>
          <Button
            component={RouterLink}
            to="/agronomist/crop-issues"
            variant="contained"
            startIcon={<BugReportIcon />}
          >
            Crop Issues
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Fields"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2.5}>
            <TextField
              select
              fullWidth
              label="Health Status"
              variant="outlined"
              size="small"
              value={filterHealthStatus}
              onChange={(e) => setFilterHealthStatus(e.target.value)}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="excellent">Excellent</MenuItem>
              <MenuItem value="good">Good</MenuItem>
              <MenuItem value="fair">Fair</MenuItem>
              <MenuItem value="poor">Poor</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2.5}>
            <TextField
              select
              fullWidth
              label="Soil Type"
              variant="outlined"
              size="small"
              value={filterSoilType}
              onChange={(e) => setFilterSoilType(e.target.value)}
            >
              <MenuItem value="all">All Soil Types</MenuItem>
              {soilTypes.slice(1).map((type, index) => (
                <MenuItem key={index} value={type.toLowerCase()}>{type}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Location"
              variant="outlined"
              size="small"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
            >
              <MenuItem value="all">All Locations</MenuItem>
              {locations.slice(1).map((location, index) => (
                <MenuItem key={index} value={location}>{location}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Fields List */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            Field List
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredFields.length} fields found
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        {loading ? (
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        ) : filteredFields.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
            No fields match your search criteria.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Field Name</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Crops</TableCell>
                  <TableCell>Soil Type</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell>Last Inspection</TableCell>
                  <TableCell>Health Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFields.map((field) => (
                  <TableRow key={field._id}>
                    <TableCell>{field.name}</TableCell>
                    <TableCell>{field.location}</TableCell>
                    <TableCell>{field.size} {field.unit}</TableCell>
                    <TableCell>
                      {field.crops.map(crop => (
                        <Chip 
                          key={crop._id}
                          label={`${crop.name} (${crop.variety})`} 
                          size="small"
                          icon={<GrassIcon />}
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </TableCell>
                    <TableCell>{field.soilType}</TableCell>
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
                      <Tooltip title="View Field Analysis">
                        <IconButton 
                          component={RouterLink} 
                          to={`/agronomist/fields/${field._id}`} 
                          size="small" 
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Create Recommendation">
                        <IconButton 
                          component={RouterLink} 
                          to={`/agronomist/recommendations/new?fieldId=${field._id}`} 
                          size="small" 
                          color="secondary"
                        >
                          <AssignmentIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Field Health Summary */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Field Health Distribution
              </Typography>
              <Box sx={{ mt: 2 }}>
                {['excellent', 'good', 'fair', 'poor', 'critical'].map((status) => {
                  const count = fields.filter(field => field.healthStatus === status).length;
                  const percentage = fields.length > 0 ? (count / fields.length) * 100 : 0;
                  
                  return (
                    <Box key={status} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Typography>
                        <Typography variant="body2">
                          {count} fields ({percentage.toFixed(1)}%)
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={percentage} 
                        color={getHealthStatusColor(status) as any}
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Soil Type Distribution
              </Typography>
              <Box sx={{ mt: 2 }}>
                {soilTypes.slice(1).map((type) => {
                  const count = fields.filter(field => field.soilType === type).length;
                  const percentage = fields.length > 0 ? (count / fields.length) * 100 : 0;
                  
                  return (
                    <Box key={type} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">
                          {type}
                        </Typography>
                        <Typography variant="body2">
                          {count} fields ({percentage.toFixed(1)}%)
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={percentage} 
                        color="primary"
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AgronomistFields;