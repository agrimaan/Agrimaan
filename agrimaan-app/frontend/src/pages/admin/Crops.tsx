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
  Grass as GrassIcon,
  LocalOffer as LocalOfferIcon
} from '@mui/icons-material';
import { RootState } from '../../store';
import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// Define types
interface Crop {
  _id: string;
  name: string;
  variety: string;
  field: {
    _id: string;
    name: string;
    owner: {
      _id: string;
      name: string;
    }
  };
  plantingDate: string;
  harvestDate: string | null;
  status: 'growing' | 'harvested' | 'sold' | 'failed';
  quantity: {
    expected: number;
    actual: number | null;
    unit: string;
  };
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  notes: string;
  createdAt: string;
}

const AdminCrops: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [crops, setCrops] = useState<Crop[]>([]);
  const [filteredCrops, setFilteredCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterHealth, setFilterHealth] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cropToDelete, setCropToDelete] = useState<string | null>(null);

  // Field owners list for filter
  const [fieldOwners, setFieldOwners] = useState<Array<{id: string, name: string}>>([]);

  useEffect(() => {
    // In a real implementation, these would be API calls
    // For now, we'll use mock data
    const fetchCrops = async () => {
      setLoading(true);
      try {
        // Mock data - in real implementation, this would be an API call
        const mockCrops: Crop[] = [
          {
            _id: 'c1',
            name: 'Wheat',
            variety: 'HD-2967',
            field: {
              _id: 'f1',
              name: 'North Farm',
              owner: {
                _id: 'u1',
                name: 'Farmer Singh'
              }
            },
            plantingDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            harvestDate: null,
            status: 'growing',
            quantity: {
              expected: 2500,
              actual: null,
              unit: 'kg'
            },
            healthStatus: 'excellent',
            notes: 'Growing well with adequate irrigation',
            createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'c2',
            name: 'Rice',
            variety: 'Basmati-1121',
            field: {
              _id: 'f2',
              name: 'South Plantation',
              owner: {
                _id: 'u2',
                name: 'Farmer Patel'
              }
            },
            plantingDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
            harvestDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'harvested',
            quantity: {
              expected: 3000,
              actual: 2800,
              unit: 'kg'
            },
            healthStatus: 'good',
            notes: 'Harvested with good yield',
            createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'c3',
            name: 'Cotton',
            variety: 'Bt Cotton',
            field: {
              _id: 'f3',
              name: 'East Orchard',
              owner: {
                _id: 'u3',
                name: 'Farmer Kumar'
              }
            },
            plantingDate: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
            harvestDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'sold',
            quantity: {
              expected: 1500,
              actual: 1600,
              unit: 'kg'
            },
            healthStatus: 'excellent',
            notes: 'Sold at good market price',
            createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'c4',
            name: 'Sugarcane',
            variety: 'CO-0238',
            field: {
              _id: 'f4',
              name: 'West Field',
              owner: {
                _id: 'u1',
                name: 'Farmer Singh'
              }
            },
            plantingDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
            harvestDate: null,
            status: 'growing',
            quantity: {
              expected: 5000,
              actual: null,
              unit: 'kg'
            },
            healthStatus: 'fair',
            notes: 'Some pest issues observed, treatment applied',
            createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'c5',
            name: 'Tomato',
            variety: 'Pusa Ruby',
            field: {
              _id: 'f2',
              name: 'South Plantation',
              owner: {
                _id: 'u2',
                name: 'Farmer Patel'
              }
            },
            plantingDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            harvestDate: null,
            status: 'failed',
            quantity: {
              expected: 1000,
              actual: 0,
              unit: 'kg'
            },
            healthStatus: 'poor',
            notes: 'Crop failed due to disease outbreak',
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];

        setCrops(mockCrops);
        setFilteredCrops(mockCrops);
        
        // Extract unique field owners for filter
        const uniqueOwners = Array.from(new Set(mockCrops.map(crop => crop.field.owner._id)))
          .map(ownerId => {
            const owner = mockCrops.find(crop => crop.field.owner._id === ownerId)?.field.owner;
            return {
              id: ownerId,
              name: owner?.name || 'Unknown'
            };
          });
        setFieldOwners(uniqueOwners);
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching crops:', err);
        setError(err.message || 'Failed to load crops');
        setLoading(false);
      }
    };

    fetchCrops();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...crops];
    
    // Apply search term
    if (searchTerm) {
      result = result.filter(
        crop => 
          crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          crop.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
          crop.field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          crop.field.owner.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(crop => crop.status === filterStatus);
    }
    
    // Apply health filter
    if (filterHealth !== 'all') {
      result = result.filter(crop => crop.healthStatus === filterHealth);
    }
    
    setFilteredCrops(result);
  }, [searchTerm, filterStatus, filterHealth, crops]);

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'growing':
        return 'primary';
      case 'harvested':
        return 'success';
      case 'sold':
        return 'info';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get health status color
  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent':
        return 'success';
      case 'good':
        return 'info';
      case 'fair':
        return 'warning';
      case 'poor':
        return 'error';
      default:
        return 'default';
    }
  };

  // Handle delete crop
  const handleDeleteCrop = (cropId: string) => {
    setCropToDelete(cropId);
    setDeleteDialogOpen(true);
  };

  // Confirm delete crop
  const confirmDeleteCrop = () => {
    if (cropToDelete) {
      // In a real implementation, this would be an API call
      setCrops(prevCrops => prevCrops.filter(crop => crop._id !== cropToDelete));
      setFilteredCrops(prevCrops => prevCrops.filter(crop => crop._id !== cropToDelete));
    }
    setDeleteDialogOpen(false);
    setCropToDelete(null);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Manage Crops
        </Typography>
        
        <Button
          component={RouterLink}
          to="/admin/crops/new"
          variant="contained"
          startIcon={<AddIcon />}
        >
          Add New Crop
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
              placeholder="Search by name, variety, field, or owner"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={filterStatus}
                onChange={(e: SelectChangeEvent) => setFilterStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="growing">Growing</MenuItem>
                <MenuItem value="harvested">Harvested</MenuItem>
                <MenuItem value="sold">Sold</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="health-filter-label">Health Status</InputLabel>
              <Select
                labelId="health-filter-label"
                value={filterHealth}
                onChange={(e: SelectChangeEvent) => setFilterHealth(e.target.value)}
                label="Health Status"
              >
                <MenuItem value="all">All Health Statuses</MenuItem>
                <MenuItem value="excellent">Excellent</MenuItem>
                <MenuItem value="good">Good</MenuItem>
                <MenuItem value="fair">Fair</MenuItem>
                <MenuItem value="poor">Poor</MenuItem>
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
                  <GrassIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Crops List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : filteredCrops.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No crops found matching your criteria
          </Typography>
          <Button
            component={RouterLink}
            to="/admin/crops/new"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Add New Crop
          </Button>
        </Paper>
      ) : viewMode === 'table' ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Variety</TableCell>
                <TableCell>Field</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Planting Date</TableCell>
                <TableCell>Harvest Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Health</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCrops.map((crop) => (
                <TableRow key={crop._id}>
                  <TableCell>{crop.name}</TableCell>
                  <TableCell>{crop.variety}</TableCell>
                  <TableCell>{crop.field.name}</TableCell>
                  <TableCell>{crop.field.owner.name}</TableCell>
                  <TableCell>{formatDate(crop.plantingDate)}</TableCell>
                  <TableCell>{formatDate(crop.harvestDate)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={crop.status.charAt(0).toUpperCase() + crop.status.slice(1)} 
                      color={getStatusColor(crop.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {crop.quantity.actual !== null ? 
                      `${crop.quantity.actual} ${crop.quantity.unit}` : 
                      `${crop.quantity.expected} ${crop.quantity.unit} (expected)`
                    }
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={crop.healthStatus.charAt(0).toUpperCase() + crop.healthStatus.slice(1)} 
                      color={getHealthColor(crop.healthStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton 
                        component={RouterLink} 
                        to={`/admin/crops/${crop._id}`} 
                        size="small"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton 
                        component={RouterLink} 
                        to={`/admin/crops/${crop._id}/edit`} 
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
                        onClick={() => handleDeleteCrop(crop._id)}
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
          {filteredCrops.map((crop) => (
            <Grid item xs={12} sm={6} md={4} key={crop._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h2">
                      {crop.name}
                    </Typography>
                    <Chip 
                      label={crop.status.charAt(0).toUpperCase() + crop.status.slice(1)} 
                      color={getStatusColor(crop.status)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Variety:</strong> {crop.variety}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Field:</strong> {crop.field.name}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Owner:</strong> {crop.field.owner.name}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Planting Date:</strong> {formatDate(crop.plantingDate)}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Harvest Date:</strong> {formatDate(crop.harvestDate)}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Quantity:</strong> {crop.quantity.actual !== null ? 
                      `${crop.quantity.actual} ${crop.quantity.unit}` : 
                      `${crop.quantity.expected} ${crop.quantity.unit} (expected)`
                    }
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      <strong>Health:</strong>
                    </Typography>
                    <Chip 
                      label={crop.healthStatus.charAt(0).toUpperCase() + crop.healthStatus.slice(1)} 
                      color={getHealthColor(crop.healthStatus)}
                      size="small"
                    />
                  </Box>
                  
                  {crop.notes && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Notes:</strong> {crop.notes}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button 
                    component={RouterLink} 
                    to={`/admin/crops/${crop._id}`} 
                    size="small"
                  >
                    View
                  </Button>
                  <Button 
                    component={RouterLink} 
                    to={`/admin/crops/${crop._id}/edit`} 
                    size="small"
                    color="primary"
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small"
                    color="error"
                    onClick={() => handleDeleteCrop(crop._id)}
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
            Are you sure you want to delete this crop? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteCrop} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminCrops;