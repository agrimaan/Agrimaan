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
  Avatar,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  LocalShipping as LocalShippingIcon,
  Route as RouteIcon,
  Inventory as InventoryIcon,
  History as HistoryIcon,
  AcUnit as AcUnitIcon,
  Paid as PaidIcon,
  Star as StarIcon
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
}

interface DeliveryStats {
  total: number;
  pending: number;
  accepted: number;
  in_transit: number;
  delivered: number;
  cancelled: number;
  totalEarnings: number;
  pendingPayments: number;
  averageRating: number;
}

const LogisticsDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [deliveryRequests, setDeliveryRequests] = useState<DeliveryRequest[]>([]);
  const [stats, setStats] = useState<DeliveryStats>({
    total: 0,
    pending: 0,
    accepted: 0,
    in_transit: 0,
    delivered: 0,
    cancelled: 0,
    totalEarnings: 0,
    pendingPayments: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real implementation, these would be API calls
    // For now, we'll use mock data
    const fetchDeliveryRequests = async () => {
      setLoading(true);
      try {
        // Mock data - in real implementation, this would be an API call
        const mockDeliveryRequests: DeliveryRequest[] = [
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
            createdAt: new Date().toISOString()
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
            status: 'accepted',
            payment: {
              amount: 1200,
              status: 'pending'
            },
            createdAt: new Date(Date.now() - 86400000).toISOString()
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
            status: 'delivered',
            payment: {
              amount: 1000,
              status: 'completed'
            },
            createdAt: new Date(Date.now() - 172800000).toISOString()
          }
        ];

        setDeliveryRequests(mockDeliveryRequests);

        // Calculate stats
        const mockStats: DeliveryStats = {
          total: mockDeliveryRequests.length,
          pending: mockDeliveryRequests.filter(req => req.status === 'pending').length,
          accepted: mockDeliveryRequests.filter(req => req.status === 'accepted').length,
          in_transit: mockDeliveryRequests.filter(req => req.status === 'in_transit').length,
          delivered: mockDeliveryRequests.filter(req => req.status === 'delivered').length,
          cancelled: mockDeliveryRequests.filter(req => req.status === 'cancelled').length,
          totalEarnings: mockDeliveryRequests
            .filter(req => req.payment.status === 'completed')
            .reduce((sum, req) => sum + req.payment.amount, 0),
          pendingPayments: mockDeliveryRequests
            .filter(req => req.payment.status === 'pending')
            .reduce((sum, req) => sum + req.payment.amount, 0),
          averageRating: 4.5 // Mock rating
        };

        setStats(mockStats);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching delivery requests:', err);
        setError(err.message || 'Failed to load delivery requests');
        setLoading(false);
      }
    };

    fetchDeliveryRequests();
  }, []);

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

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'info';
      case 'in_transit':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Handle accept delivery
  const handleAcceptDelivery = (deliveryId: string) => {
    // In a real implementation, this would be an API call
    setDeliveryRequests(prevRequests => 
      prevRequests.map(req => 
        req._id === deliveryId ? { ...req, status: 'accepted' } : req
      )
    );

    // Update stats
    setStats(prevStats => ({
      ...prevStats,
      pending: prevStats.pending - 1,
      accepted: prevStats.accepted + 1
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Logistics Dashboard
        </Typography>
        
        <Box>
          <Button
            component={RouterLink}
            to="/logistics/deliveries"
            variant="outlined"
            startIcon={<HistoryIcon />}
            sx={{ mr: 1 }}
          >
            All Deliveries
          </Button>
          <Button
            component={RouterLink}
            to="/logistics/available-requests"
            variant="contained"
            startIcon={<LocalShippingIcon />}
          >
            Available Requests
          </Button>
        </Box>
      </Box>

      {/* Welcome Card */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Welcome, {user?.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your delivery requests, track shipments, and view your earnings all in one place.
        </Typography>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Pending Requests
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stats.pending}
                  </Typography>
                </Box>
                <LocalShippingIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Button
                  component={RouterLink}
                  to="/logistics/deliveries?status=pending"
                  size="small"
                  color="primary"
                >
                  View Pending
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Active Deliveries
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stats.accepted + stats.in_transit}
                  </Typography>
                </Box>
                <RouteIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Button
                  component={RouterLink}
                  to="/logistics/deliveries?status=active"
                  size="small"
                  color="primary"
                >
                  View Active
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Completed Deliveries
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stats.delivered}
                  </Typography>
                </Box>
                <InventoryIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Button
                  component={RouterLink}
                  to="/logistics/deliveries?status=delivered"
                  size="small"
                  color="primary"
                >
                  View Completed
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Your Rating
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h4" component="div" sx={{ mr: 1 }}>
                      {stats.averageRating.toFixed(1)}
                    </Typography>
                    <StarIcon color="warning" />
                  </Box>
                </Box>
                <StarIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Button
                  component={RouterLink}
                  to="/logistics/reviews"
                  size="small"
                  color="primary"
                >
                  View Reviews
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Earnings Summary */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Earnings Summary
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Total Earnings
              </Typography>
              <Typography variant="h4" sx={{ color: 'success.dark' }}>
                ₹{stats.totalEarnings.toLocaleString()}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Pending Payments
              </Typography>
              <Typography variant="h4" sx={{ color: 'warning.dark' }}>
                ₹{stats.pendingPayments.toLocaleString()}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                This Month
              </Typography>
              <Typography variant="h4" sx={{ color: 'info.dark' }}>
                ₹{(stats.totalEarnings * 0.6).toLocaleString()}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Button
            component={RouterLink}
            to="/logistics/earnings"
            endIcon={<PaidIcon />}
          >
            View Detailed Earnings
          </Button>
        </Box>
      </Paper>

      {/* Recent Delivery Requests */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Recent Delivery Requests
          </Typography>
          <Button
            component={RouterLink}
            to="/logistics/deliveries"
            endIcon={<HistoryIcon />}
          >
            View All
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : deliveryRequests.length === 0 ? (
          <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
            No delivery requests available
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Pickup</TableCell>
                  <TableCell>Delivery</TableCell>
                  <TableCell>Cargo</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Payment</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deliveryRequests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>{request._id}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{request.pickup.location}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(request.pickup.scheduledTime)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{request.delivery.location}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(request.delivery.scheduledTime)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{request.cargo.description}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {request.cargo.weight}kg
                        </Typography>
                        {request.cargo.requiresRefrigeration && (
                          <Chip 
                            icon={<AcUnitIcon />} 
                            label="Refrigerated" 
                            size="small" 
                            color="info" 
                            sx={{ ml: 1 }} 
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={request.status.replace('_', ' ').charAt(0).toUpperCase() + request.status.replace('_', ' ').slice(1)} 
                        color={getStatusColor(request.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">₹{request.payment.amount}</Typography>
                      <Chip 
                        label={request.payment.status} 
                        color={request.payment.status === 'completed' ? 'success' : 'warning'} 
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {request.status === 'pending' ? (
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                          onClick={() => handleAcceptDelivery(request._id)}
                        >
                          Accept
                        </Button>
                      ) : (
                        <Button
                          component={RouterLink}
                          to={`/logistics/deliveries/${request._id}`}
                          variant="outlined"
                          size="small"
                        >
                          Details
                        </Button>
                      )}
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

export default LogisticsDashboard;