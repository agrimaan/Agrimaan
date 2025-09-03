import React, { useState, useEffect } from 'react';
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
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  LocalShipping as LocalShippingIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  AcUnit as AcUnitIcon,
  LocationOn as LocationOnIcon
} from '@mui/icons-material';
import { RootState } from '../../store';
import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// Define types
interface DeliveryRequest {
  _id: string;
  orderId: string;
  pickup: {
    location: string;
    contactName: string;
    contactPhone: string;
    scheduledTime: string;
  };
  delivery: {
    location: string;
    contactName: string;
    contactPhone: string;
    scheduledTime: string;
  };
  cargo: {
    description: string;
    weight: number;
    volume: number;
    requiresRefrigeration: boolean;
    specialInstructions: string;
  };
  status: 'pending' | 'accepted' | 'in_transit' | 'delivered' | 'cancelled';
  payment: {
    amount: number;
    status: 'pending' | 'completed' | 'failed';
  };
  createdAt: string;
  distance: number;
}

const AvailableRequests: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [availableRequests, setAvailableRequests] = useState<DeliveryRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDistance, setFilterDistance] = useState<string>('all');
  const [filterRefrigeration, setFilterRefrigeration] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');

  useEffect(() => {
    // In a real implementation, these would be API calls
    // For now, we'll use mock data
    const fetchAvailableRequests = async () => {
      setLoading(true);
      try {
        // Mock data - in real implementation, this would be an API call
        const mockRequests: DeliveryRequest[] = [
          {
            _id: 'd1',
            orderId: 'order123',
            pickup: {
              location: 'Farm A, Village X, District Y',
              contactName: 'Farmer Singh',
              contactPhone: '9876543210',
              scheduledTime: new Date(Date.now() + 3600000).toISOString()
            },
            delivery: {
              location: 'Market B, City Z',
              contactName: 'Buyer Kumar',
              contactPhone: '9876543211',
              scheduledTime: new Date(Date.now() + 7200000).toISOString()
            },
            cargo: {
              description: 'Wheat - 500kg',
              weight: 500,
              volume: 1,
              requiresRefrigeration: false,
              specialInstructions: 'Handle with care'
            },
            status: 'pending',
            payment: {
              amount: 1500,
              status: 'pending'
            },
            createdAt: new Date().toISOString(),
            distance: 25
          },
          {
            _id: 'd2',
            orderId: 'order456',
            pickup: {
              location: 'Farm C, Village P, District Q',
              contactName: 'Farmer Patel',
              contactPhone: '9876543212',
              scheduledTime: new Date(Date.now() + 86400000).toISOString()
            },
            delivery: {
              location: 'Warehouse D, City R',
              contactName: 'Buyer Sharma',
              contactPhone: '9876543213',
              scheduledTime: new Date(Date.now() + 172800000).toISOString()
            },
            cargo: {
              description: 'Tomatoes - 200kg',
              weight: 200,
              volume: 0.5,
              requiresRefrigeration: true,
              specialInstructions: 'Temperature sensitive'
            },
            status: 'pending',
            payment: {
              amount: 1200,
              status: 'completed'
            },
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            distance: 50
          },
          {
            _id: 'd3',
            orderId: 'order789',
            pickup: {
              location: 'Farm E, Village M, District N',
              contactName: 'Farmer Reddy',
              contactPhone: '9876543214',
              scheduledTime: new Date(Date.now() - 86400000).toISOString()
            },
            delivery: {
              location: 'Market F, City S',
              contactName: 'Buyer Gupta',
              contactPhone: '9876543215',
              scheduledTime: new Date(Date.now() - 43200000).toISOString()
            },
            cargo: {
              description: 'Rice - 300kg',
              weight: 300,
              volume: 0.7,
              requiresRefrigeration: false,
              specialInstructions: 'None'
            },
            status: 'pending',
            payment: {
              amount: 1000,
              status: 'pending'
            },
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            distance: 10
          },
          {
            _id: 'd4',
            orderId: 'order101',
            pickup: {
              location: 'Farm G, Village T, District U',
              contactName: 'Farmer Khan',
              contactPhone: '9876543216',
              scheduledTime: new Date(Date.now() + 259200000).toISOString()
            },
            delivery: {
              location: 'Market H, City V',
              contactName: 'Buyer Joshi',
              contactPhone: '9876543217',
              scheduledTime: new Date(Date.now() + 345600000).toISOString()
            },
            cargo: {
              description: 'Potatoes - 400kg',
              weight: 400,
              volume: 0.8,
              requiresRefrigeration: false,
              specialInstructions: 'Store in cool place'
            },
            status: 'pending',
            payment: {
              amount: 1800,
              status: 'completed'
            },
            createdAt: new Date(Date.now() - 259200000).toISOString(),
            distance: 75
          },
          {
            _id: 'd5',
            orderId: 'order202',
            pickup: {
              location: 'Farm I, Village W, District X',
              contactName: 'Farmer Rao',
              contactPhone: '9876543218',
              scheduledTime: new Date(Date.now() + 432000000).toISOString()
            },
            delivery: {
              location: 'Market J, City Y',
              contactName: 'Buyer Mehta',
              contactPhone: '9876543219',
              scheduledTime: new Date(Date.now() + 518400000).toISOString()
            },
            cargo: {
              description: 'Apples - 150kg',
              weight: 150,
              volume: 0.4,
              requiresRefrigeration: true,
              specialInstructions: 'Fragile items'
            },
            status: 'pending',
            payment: {
              amount: 2200,
              status: 'pending'
            },
            createdAt: new Date(Date.now() - 345600000).toISOString(),
            distance: 120
          }
        ];

        setAvailableRequests(mockRequests);
        setFilteredRequests(mockRequests);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching available requests:', err);
        setError(err.message || 'Failed to load available requests');
        setLoading(false);
      }
    };

    fetchAvailableRequests();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...availableRequests];
    
    // Apply search term
    if (searchTerm) {
      result = result.filter(
        request => 
          request.pickup.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.delivery.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.cargo.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply distance filter
    if (filterDistance !== 'all') {
      switch (filterDistance) {
        case 'near':
          result = result.filter(request => request.distance <= 25);
          break;
        case 'medium':
          result = result.filter(request => request.distance > 25 && request.distance <= 50);
          break;
        case 'far':
          result = result.filter(request => request.distance > 50);
          break;
      }
    }
    
    // Apply refrigeration filter
    if (filterRefrigeration !== 'all') {
      const requiresRefrigeration = filterRefrigeration === 'yes';
      result = result.filter(request => request.cargo.requiresRefrigeration === requiresRefrigeration);
    }
    
    // Apply payment filter
    if (filterPayment !== 'all') {
      result = result.filter(request => request.payment.status === filterPayment);
    }
    
    setFilteredRequests(result);
  }, [searchTerm, filterDistance, filterRefrigeration, filterPayment, availableRequests]);

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle accept delivery
  const handleAcceptDelivery = (deliveryId: string) => {
    // In a real implementation, this would be an API call
    setAvailableRequests(prevRequests => 
      prevRequests.filter(req => req._id !== deliveryId)
    );
    
    setFilteredRequests(prevRequests => 
      prevRequests.filter(req => req._id !== deliveryId)
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Available Delivery Requests
        </Typography>
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
              placeholder="Search by location or cargo"
            />
          </Grid>
          
          <Grid item xs={12} sm={4} md={2.5}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="distance-filter-label">Distance</InputLabel>
              <Select
                labelId="distance-filter-label"
                value={filterDistance}
                onChange={(e: SelectChangeEvent) => setFilterDistance(e.target.value)}
                label="Distance"
              >
                <MenuItem value="all">All Distances</MenuItem>
                <MenuItem value="near">Nearby (≤ 25km)</MenuItem>
                <MenuItem value="medium">Medium (26-50km)</MenuItem>
                <MenuItem value="far">Far (&gt; 50km)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4} md={2.5}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="refrigeration-filter-label">Refrigeration</InputLabel>
              <Select
                labelId="refrigeration-filter-label"
                value={filterRefrigeration}
                onChange={(e: SelectChangeEvent) => setFilterRefrigeration(e.target.value)}
                label="Refrigeration"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="yes">Requires Refrigeration</MenuItem>
                <MenuItem value="no">No Refrigeration</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4} md={2.5}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="payment-filter-label">Payment Status</InputLabel>
              <Select
                labelId="payment-filter-label"
                value={filterPayment}
                onChange={(e: SelectChangeEvent) => setFilterPayment(e.target.value)}
                label="Payment Status"
              >
                <MenuItem value="all">All Payments</MenuItem>
                <MenuItem value="completed">Pre-paid</MenuItem>
                <MenuItem value="pending">Pay on Delivery</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Available Requests */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">
            {filteredRequests.length} Available Requests
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select a delivery request to accept and start the delivery process
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : filteredRequests.length === 0 ? (
          <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
            No delivery requests match your filters
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredRequests.map((request) => (
              <Grid item xs={12} key={request._id}>
                <Card>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={8}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <LocationOnIcon color="primary" sx={{ mr: 1, mt: 0.5 }} />
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              Pickup: {request.pickup.location}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Contact: {request.pickup.contactName} ({request.pickup.contactPhone})
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Scheduled: {formatDate(request.pickup.scheduledTime)}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <LocationOnIcon color="error" sx={{ mr: 1, mt: 0.5 }} />
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              Delivery: {request.delivery.location}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Contact: {request.delivery.contactName} ({request.delivery.contactPhone})
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Scheduled: {formatDate(request.delivery.scheduledTime)}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Cargo: {request.cargo.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                            <Chip label={`${request.cargo.weight}kg`} size="small" />
                            <Chip label={`${request.cargo.volume}m³`} size="small" />
                            {request.cargo.requiresRefrigeration && (
                              <Chip 
                                icon={<AcUnitIcon />} 
                                label="Refrigerated" 
                                size="small" 
                                color="info" 
                              />
                            )}
                            <Chip 
                              label={`${request.distance}km distance`} 
                              size="small" 
                              color={
                                request.distance <= 25 ? 'success' : 
                                request.distance <= 50 ? 'warning' : 'error'
                              } 
                            />
                          </Box>
                          {request.cargo.specialInstructions && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              <strong>Special Instructions:</strong> {request.cargo.specialInstructions}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          height: '100%', 
                          justifyContent: 'space-between'
                        }}>
                          <Box>
                            <Typography variant="h5" color="primary" gutterBottom>
                              ₹{request.payment.amount.toLocaleString()}
                            </Typography>
                            <Chip 
                              label={request.payment.status === 'completed' ? 'Pre-paid' : 'Pay on Delivery'} 
                              color={request.payment.status === 'completed' ? 'success' : 'warning'} 
                              size="small"
                              sx={{ mb: 2 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              Request ID: {request._id}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Created: {formatDate(request.createdAt)}
                            </Typography>
                          </Box>
                          
                          <Button
                            variant="contained"
                            fullWidth
                            startIcon={<LocalShippingIcon />}
                            onClick={() => handleAcceptDelivery(request._id)}
                            sx={{ mt: 2 }}
                          >
                            Accept Delivery
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default AvailableRequests;