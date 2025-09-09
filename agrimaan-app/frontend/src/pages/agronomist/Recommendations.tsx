import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Assignment as AssignmentIcon,
  Spa as SpaIcon,
  BugReport as BugReportIcon,
  WaterDrop as WaterDropIcon,
  Agriculture as AgricultureIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import axios from 'axios';

// Define types
interface Recommendation {
  _id: string;
  Fields: {
    _id: string;
    name: string;
  };
  farmer: {
    _id: string;
    name: string;
  };
  type: 'fertilizer' | 'pesticide' | 'irrigation' | 'harvest' | 'planting' | 'other';
  description: string;
  details: string;
  status: 'pending' | 'accepted' | 'rejected' | 'implemented';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  dueDate: string;
  implementedDate?: string;
  feedback?: string;
}

const Recommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recommendationToDelete, setRecommendationToDelete] = useState<string | null>(null);

  useEffect(() => {
    // In a real implementation, this would be an API call
    // For now, we'll use mock data
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        // Mock recommendations data
        const mockRecommendations: Recommendation[] = [
          {
            _id: 'r1',
            Fields: {
              _id: 'f1',
              name: 'North Wheat Fields'
            },
            farmer: {
              _id: 'u1',
              name: 'Farmer Singh'
            },
            type: 'fertilizer',
            description: 'Apply nitrogen fertilizer at 50kg/acre',
            details: 'Apply nitrogen fertilizer at 50kg/acre to address yellowing leaves. Use urea-based fertilizer for best results. Apply in the morning or evening to avoid direct sunlight.',
            status: 'pending',
            priority: 'high',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'r2',
            Fields: {
              _id: 'f2',
              name: 'South Rice Paddy'
            },
            farmer: {
              _id: 'u2',
              name: 'Farmer Kumar'
            },
            type: 'irrigation',
            description: 'Increase irrigation frequency to twice daily',
            details: 'Increase irrigation frequency to twice daily due to high temperatures. Ensure water level is maintained at 5cm above soil level. Monitor soil moisture daily.',
            status: 'pending',
            priority: 'urgent',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'r3',
            Fields: {
              _id: 'f3',
              name: 'East Cotton Fields'
            },
            farmer: {
              _id: 'u3',
              name: 'Farmer Patel'
            },
            type: 'pesticide',
            description: 'Apply recommended pesticide to control bollworm infestation',
            details: 'Apply recommended pesticide to control bollworm infestation. Use cypermethrin at 250ml/acre. Apply in the evening and ensure proper safety measures are followed.',
            status: 'accepted',
            priority: 'high',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'r4',
            Fields: {
              _id: 'f4',
              name: 'West Sugarcane Fields'
            },
            farmer: {
              _id: 'u4',
              name: 'Farmer Deshmukh'
            },
            type: 'harvest',
            description: 'Schedule harvest within the next 2 weeks',
            details: 'Schedule harvest within the next 2 weeks as the crop has reached maturity. Ensure proper harvesting equipment is available. Monitor weather forecast to avoid rainy days.',
            status: 'implemented',
            priority: 'medium',
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            implementedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            feedback: 'Harvest completed successfully. Yield was as expected.'
          },
          {
            _id: 'r5',
            Fields: {
              _id: 'f5',
              name: 'Central Vegetable Plot'
            },
            farmer: {
              _id: 'u5',
              name: 'Farmer Sharma'
            },
            type: 'planting',
            description: 'Prepare for next season planting with recommended seed varieties',
            details: 'Prepare for next season planting with recommended seed varieties. Use hybrid tomato varieties for better yield. Ensure proper spacing of 60cm between plants.',
            status: 'rejected',
            priority: 'low',
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
            feedback: 'Farmer has decided to plant a different crop this season.'
          }
        ];

        // Simulate API delay
        setTimeout(() => {
          setRecommendations(mockRecommendations);
          setFilteredRecommendations(mockRecommendations);
          setLoading(false);
        }, 800);
      } catch (err: any) {
        console.error('Error fetching recommendations:', err);
        setError(err.message || 'Failed to load recommendations');
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...recommendations];
    
    // Apply search term
    if (searchTerm) {
      result = result.filter(
        rec => 
          rec.Fields.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(rec => rec.status === filterStatus);
    }
    
    // Apply type filter
    if (filterType !== 'all') {
      result = result.filter(rec => rec.type === filterType);
    }
    
    // Apply priority filter
    if (filterPriority !== 'all') {
      result = result.filter(rec => rec.priority === filterPriority);
    }
    
    setFilteredRecommendations(result);
  }, [searchTerm, filterStatus, filterType, filterPriority, recommendations]);

  // Format date
  const formatDate = (dateString: string) => {
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
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'info';
      case 'implemented':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'info';
      case 'medium':
        return 'success';
      case 'high':
        return 'warning';
      case 'urgent':
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
        return <WaterDropIcon />;
      case 'harvest':
        return <AgricultureIcon />;
      case 'planting':
        return <SpaIcon />;
      default:
        return <AssignmentIcon />;
    }
  };

  // Handle delete recommendation
  const handleDeleteRecommendation = (recommendationId: string) => {
    setRecommendationToDelete(recommendationId);
    setDeleteDialogOpen(true);
  };

  // Confirm delete recommendation
  const confirmDeleteRecommendation = () => {
    if (recommendationToDelete) {
      // In a real implementation, this would be an API call
      setRecommendations(prevRecommendations => 
        prevRecommendations.filter(rec => rec._id !== recommendationToDelete)
      );
      setFilteredRecommendations(prevRecommendations => 
        prevRecommendations.filter(rec => rec._id !== recommendationToDelete)
      );
    }
    setDeleteDialogOpen(false);
    setRecommendationToDelete(null);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Manage Recommendations
        </Typography>
        
        <Button
          component={RouterLink}
          to="/agronomist/recommendations/new"
          variant="contained"
          startIcon={<AddIcon />}
        >
          Create Recommendation
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
              placeholder="Search by Fields, farmer, or description"
            />
          </Grid>
          
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={filterStatus}
                onChange={(e: SelectChangeEvent) => setFilterStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="accepted">Accepted</MenuItem>
                <MenuItem value="implemented">Implemented</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="type-filter-label">Type</InputLabel>
              <Select
                labelId="type-filter-label"
                value={filterType}
                onChange={(e: SelectChangeEvent) => setFilterType(e.target.value)}
                label="Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="fertilizer">Fertilizer</MenuItem>
                <MenuItem value="pesticide">Pesticide</MenuItem>
                <MenuItem value="irrigation">Irrigation</MenuItem>
                <MenuItem value="harvest">Harvest</MenuItem>
                <MenuItem value="planting">Planting</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="priority-filter-label">Priority</InputLabel>
              <Select
                labelId="priority-filter-label"
                value={filterPriority}
                onChange={(e: SelectChangeEvent) => setFilterPriority(e.target.value)}
                label="Priority"
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Recommendations Table */}
      {loading ? (
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
          <Typography variant="body1" sx={{ mt: 2, textAlign: 'center' }}>
            Loading recommendations...
          </Typography>
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">
            Error: {error}
          </Typography>
        </Paper>
      ) : filteredRecommendations.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No recommendations found matching your criteria
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fields</TableCell>
                <TableCell>Farmer</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecommendations.map((recommendation) => (
                <TableRow key={recommendation._id}>
                  <TableCell>{recommendation.Fields.name}</TableCell>
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
                  <TableCell>
                    <Chip 
                      label={recommendation.priority.charAt(0).toUpperCase() + recommendation.priority.slice(1)} 
                      color={getPriorityColor(recommendation.priority) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={recommendation.status.charAt(0).toUpperCase() + recommendation.status.slice(1)} 
                      color={getStatusColor(recommendation.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(recommendation.dueDate)}</TableCell>
                  <TableCell align="right">
                    <Button
                      component={RouterLink}
                      to={`/agronomist/recommendations/${recommendation._id}`}
                      size="small"
                      sx={{ minWidth: 'auto', p: 0.5, mr: 0.5 }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </Button>
                    <Button
                      component={RouterLink}
                      to={`/agronomist/recommendations/${recommendation._id}/edit`}
                      size="small"
                      color="primary"
                      sx={{ minWidth: 'auto', p: 0.5, mr: 0.5 }}
                      disabled={recommendation.status === 'implemented' || recommendation.status === 'rejected'}
                    >
                      <EditIcon fontSize="small" />
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      sx={{ minWidth: 'auto', p: 0.5 }}
                      onClick={() => handleDeleteRecommendation(recommendation._id)}
                      disabled={recommendation.status === 'implemented'}
                    >
                      <DeleteIcon fontSize="small" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this recommendation? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteRecommendation} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Recommendations;