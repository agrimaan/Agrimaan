import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Terrain as TerrainIcon,
  LocationOn as LocationOnIcon
} from '@mui/icons-material';
import { RootState } from '../../store';
import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// Define types
interface Field {
  _id: string;
  name: string;
  location: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  size: {
    value: number;
    unit: string;
  };
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  soilType: string;
  crops: Array<{
    _id: string;
    name: string;
    status: string;
  }>;
  sensors: number;
  createdAt: string;
}

const AdminFields: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [fields, setFields] = useState<Field[]>([]);
  const [filteredFields, setFilteredFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOwner, setFilterOwner] = useState('all');
  const [filterSoilType, setFilterSoilType] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<string | null>(null);

  // Owners list for filter
  const [owners, setOwners] = useState<Array<{id: string, name: string}>>([]);
  // Soil types list for filter
  const [soilTypes, setSoilTypes] = useState<string[]>([]);

  useEffect(() => {
    // In a real implementation, these would be API calls
    // For now, we'll use mock data
    const fetchFields = async () => {
      setLoading(true);
      try {
        // Mock data - in real implementation, this would be an API call
        const mockFields: Field[] = [
          {
            _id: 'f1',
            name: 'North Farm',
            location: {
              address: 'Village X, District Y, State Z',
              coordinates: {
                latitude: 28.6139,
                longitude: 77.2090
              }
            },
            size: {
              value: 5.2,
              unit: 'hectares'
            },
            owner: {
              _id: 'u1',
              name: 'Farmer Singh',
              email: 'farmer.singh@example.com'
            },
            soilType: 'Clay Loam',
            crops: [
              {
                _id: 'c1',
                name: 'Wheat',
                status: 'growing'
              },
              {
                _id: 'c2',
                name: 'Rice',
                status: 'harvested'
              }
            ],
            sensors: 3,
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'f2',
            name: 'South Plantation',
            location: {
              address: 'Village P, District Q, State R',
              coordinates: {
                latitude: 13.0827,
                longitude: 80.2707
              }
            },
            size: {
              value: 3.8,
              unit: 'hectares'
            },
            owner: {
              _id: 'u2',
              name: 'Farmer Patel',
              email: 'farmer.patel@example.com'
            },
            soilType: 'Sandy Loam',
            crops: [
              {
                _id: 'c3',
                name: 'Cotton',
                status: 'growing'
              }
            ],
            sensors: 2,
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'f3',
            name: 'East Orchard',
            location: {
              address: 'Village M, District N, State O',
              coordinates: {
                latitude: 19.0760,
                longitude: 72.8777
              }
            },
            size: {
              value: 2.5,
              unit: 'hectares'
            },
            owner: {
              _id: 'u3',
              name: 'Farmer Kumar',
              email: 'farmer.kumar@example.com'
            },
            soilType: 'Silt Loam',
            crops: [
              {
                _id: 'c4',
                name: 'Mango',
                status: 'growing'
              },
              {
                _id: 'c5',
                name: 'Banana',
                status: 'growing'
              }
            ],
            sensors: 4,
            createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'f4',
            name: 'West Field',
            location: {
              address: 'Village J, District K, State L',
              coordinates: {
                latitude: 17.3850,
                longitude: 78.4867
              }
            },
            size: {
              value: 4.1,
              unit: 'hectares'
            },
            owner: {
              _id: 'u1',
              name: 'Farmer Singh',
              email: 'farmer.singh@example.com'
            },
            soilType: 'Clay',
            crops: [
              {
                _id: 'c6',
                name: 'Sugarcane',
                status: 'growing'
              }
            ],
            sensors: 2,
            createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];

        setFields(mockFields);
        setFilteredFields(mockFields);
        
        // Extract unique owners for filter
        const uniqueOwners = Array.from(new Set(mockFields.map(field => field.owner._id)))
          .map(ownerId => {
            const owner = mockFields.find(field => field.owner._id === ownerId)?.owner;
            return {
              id: ownerId,
              name: owner?.name || 'Unknown'
            };
          });
        setOwners(uniqueOwners);
        
        // Extract unique soil types for filter
        const uniqueSoilTypes = Array.from(new Set(mockFields.map(field => field.soilType)));
        setSoilTypes(uniqueSoilTypes);
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching fields:', err);
        setError(err.message || 'Failed to load fields');
        setLoading(false);
      }
    };

    fetchFields();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...fields];
    
    // Apply search term
    if (searchTerm) {
      result = result.filter(
        field => 
          field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          field.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          field.owner.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply owner filter
    if (filterOwner !== 'all') {
      result = result.filter(field => field.owner._id === filterOwner);
    }
    
    // Apply soil type filter
    if (filterSoilType !== 'all') {
      result = result.filter(field => field.soilType === filterSoilType);
    }
    
    setFilteredFields(result);
  }, [searchTerm, filterOwner, filterSoilType, fields]);

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle delete field
  const handleDeleteField = (fieldId: string) => {
    setFieldToDelete(fieldId);
    setDeleteDialogOpen(true);
  };

  // Confirm delete field
  const confirmDeleteField = () => {
    if (fieldToDelete) {
      // In a real implementation, this would be an API call
      setFields(prevFields => prevFields.filter(field => field._id !== fieldToDelete));
      setFilteredFields(prevFields => prevFields.filter(field => field._id !== fieldToDelete));
    }
    setDeleteDialogOpen(false);
    setFieldToDelete(null);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Manage Fields
        </Typography>
        
        <Button
          component={RouterLink}
          to="/admin/fields/new"
          variant="contained"
          startIcon={<AddIcon />}
        >
          Add New Field
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              placeholder="Search by name, location, or owner"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="owner-filter-label">Owner</InputLabel>
              <Select
                labelId="owner-filter-label"
                value={filterOwner}
                onChange={(e: SelectChangeEvent) => setFilterOwner(e.target.value)}
                label="Owner"
              >
                <MenuItem value="all">All Owners</MenuItem>
                {owners.map(owner => (
                  <MenuItem key={owner.id} value={owner.id}>{owner.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="soil-filter-label">Soil Type</InputLabel>
              <Select
                labelId="soil-filter-label"
                value={filterSoilType}
                onChange={(e: SelectChangeEvent) => setFilterSoilType(e.target.value)}
                label="Soil Type"
              >
                <MenuItem value="all">All Soil Types</MenuItem>
                {soilTypes.map(soilType => (
                  <MenuItem key={soilType} value={soilType}>{soilType}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Tooltip title="Table View">
                <IconButton 
                  color={viewMode === 'table' ? 'primary' : 'default'} 
                  onClick={() => setViewMode('table')}
                >
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Grid View">
                <IconButton 
                  color={viewMode === 'grid' ? 'primary' : 'default'} 
                  onClick={() => setViewMode('grid')}
                >
                  <TerrainIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Fields List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : filteredFields.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No fields found matching your criteria
          </Typography>
          <Button
            component={RouterLink}
            to="/admin/fields/new"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Add New Field
          </Button>
        </Paper>
      ) : viewMode === 'table' ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Soil Type</TableCell>
                <TableCell>Crops</TableCell>
                <TableCell>Sensors</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFields.map((field) => (
                <TableRow key={field._id}>
                  <TableCell>{field.name}</TableCell>
                  <TableCell>{field.location.address}</TableCell>
                  <TableCell>{field.size.value} {field.size.unit}</TableCell>
                  <TableCell>{field.owner.name}</TableCell>
                  <TableCell>{field.soilType}</TableCell>
                  <TableCell>
                    {field.crops.map(crop => (
                      <Chip 
                        key={crop._id}
                        label={crop.name} 
                        size="small" 
                        color={crop.status === 'growing' ? 'success' : 'default'}
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </TableCell>
                  <TableCell>{field.sensors}</TableCell>
                  <TableCell>{formatDate(field.createdAt)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton 
                        component={RouterLink} 
                        to={`/admin/fields/${field._id}`} 
                        size="small"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton 
                        component={RouterLink} 
                        to={`/admin/fields/${field._id}/edit`} 
                        size="small"
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small"
                        color="error"
                        onClick={() => handleDeleteField(field._id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Grid container spacing={3}>
          {filteredFields.map((field) => (
            <Grid item xs={12} sm={6} md={4} key={field._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {field.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <LocationOnIcon color="primary" sx={{ mr: 1, mt: 0.5 }} fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      {field.location.address}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Size:</strong> {field.size.value} {field.size.unit}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Owner:</strong> {field.owner.name}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Soil Type:</strong> {field.soilType}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Crops:</strong>
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    {field.crops.map(crop => (
                      <Chip 
                        key={crop._id}
                        label={crop.name} 
                        size="small" 
                        color={crop.status === 'growing' ? 'success' : 'default'}
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Sensors:</strong> {field.sensors}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    Created: {formatDate(field.createdAt)}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    component={RouterLink} 
                    to={`/admin/fields/${field._id}`} 
                    size="small"
                  >
                    View
                  </Button>
                  <Button 
                    component={RouterLink} 
                    to={`/admin/fields/${field._id}/edit`} 
                    size="small"
                    color="primary"
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small"
                    color="error"
                    onClick={() => handleDeleteField(field._id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this field? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteField} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminFields;