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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Tabs,
  Tab
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as LocalShippingIcon,
  Payment as PaymentIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { RootState } from '../../store';
import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// Define types
interface Order {
  _id: string;
  orderNumber: string;
  buyer: {
    _id: string;
    name: string;
    email: string;
  };
  seller: {
    _id: string;
    name: string;
    email: string;
  };
  items: Array<{
    _id: string;
    crop: {
      _id: string;
      name: string;
      variety: string;
    };
    quantity: number;
    unit: string;
    pricePerUnit: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'online' | 'bank_transfer' | 'cash_on_delivery';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  deliveryDate: string | null;
  createdAt: string;
  updatedAt: string;
}

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
      id={`orders-tabpanel-${index}`}
      aria-labelledby={`orders-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `orders-tab-${index}`,
    'aria-controls': `orders-tabpanel-${index}`,
  };
}

const AdminOrders: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [filterBuyer, setFilterBuyer] = useState<string>('all');
  const [filterSeller, setFilterSeller] = useState<string>('all');

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  // Buyers and sellers lists for filters
  const [buyers, setBuyers] = useState<Array<{id: string, name: string}>>([]);
  const [sellers, setSellers] = useState<Array<{id: string, name: string}>>([]);

  useEffect(() => {
    // In a real implementation, these would be API calls
    // For now, we'll use mock data
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // Mock data - in real implementation, this would be an API call
        const mockOrders: Order[] = [
          {
            _id: 'o1',
            orderNumber: 'ORD-2025-001',
            buyer: {
              _id: 'b1',
              name: 'Buyer Kumar',
              email: 'buyer.kumar@example.com'
            },
            seller: {
              _id: 's1',
              name: 'Farmer Singh',
              email: 'farmer.singh@example.com'
            },
            items: [
              {
                _id: 'i1',
                crop: {
                  _id: 'c1',
                  name: 'Wheat',
                  variety: 'HD-2967'
                },
                quantity: 500,
                unit: 'kg',
                pricePerUnit: 25,
                totalPrice: 12500
              },
              {
                _id: 'i2',
                crop: {
                  _id: 'c2',
                  name: 'Rice',
                  variety: 'Basmati-1121'
                },
                quantity: 200,
                unit: 'kg',
                pricePerUnit: 60,
                totalPrice: 12000
              }
            ],
            totalAmount: 24500,
            status: 'confirmed',
            paymentStatus: 'completed',
            paymentMethod: 'online',
            shippingAddress: {
              street: '123 Market Street',
              city: 'Mumbai',
              state: 'Maharashtra',
              zipCode: '400001',
              country: 'India'
            },
            deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'o2',
            orderNumber: 'ORD-2025-002',
            buyer: {
              _id: 'b2',
              name: 'Buyer Sharma',
              email: 'buyer.sharma@example.com'
            },
            seller: {
              _id: 's2',
              name: 'Farmer Patel',
              email: 'farmer.patel@example.com'
            },
            items: [
              {
                _id: 'i3',
                crop: {
                  _id: 'c3',
                  name: 'Cotton',
                  variety: 'Bt Cotton'
                },
                quantity: 300,
                unit: 'kg',
                pricePerUnit: 70,
                totalPrice: 21000
              }
            ],
            totalAmount: 21000,
            status: 'shipped',
            paymentStatus: 'completed',
            paymentMethod: 'bank_transfer',
            shippingAddress: {
              street: '456 Gandhi Road',
              city: 'Delhi',
              state: 'Delhi',
              zipCode: '110001',
              country: 'India'
            },
            deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'o3',
            orderNumber: 'ORD-2025-003',
            buyer: {
              _id: 'b1',
              name: 'Buyer Kumar',
              email: 'buyer.kumar@example.com'
            },
            seller: {
              _id: 's3',
              name: 'Farmer Kumar',
              email: 'farmer.kumar@example.com'
            },
            items: [
              {
                _id: 'i4',
                crop: {
                  _id: 'c4',
                  name: 'Sugarcane',
                  variety: 'CO-0238'
                },
                quantity: 1000,
                unit: 'kg',
                pricePerUnit: 3.5,
                totalPrice: 3500
              }
            ],
            totalAmount: 3500,
            status: 'delivered',
            paymentStatus: 'completed',
            paymentMethod: 'online',
            shippingAddress: {
              street: '789 Nehru Avenue',
              city: 'Mumbai',
              state: 'Maharashtra',
              zipCode: '400002',
              country: 'India'
            },
            deliveryDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'o4',
            orderNumber: 'ORD-2025-004',
            buyer: {
              _id: 'b3',
              name: 'Buyer Gupta',
              email: 'buyer.gupta@example.com'
            },
            seller: {
              _id: 's1',
              name: 'Farmer Singh',
              email: 'farmer.singh@example.com'
            },
            items: [
              {
                _id: 'i5',
                crop: {
                  _id: 'c5',
                  name: 'Tomato',
                  variety: 'Pusa Ruby'
                },
                quantity: 100,
                unit: 'kg',
                pricePerUnit: 40,
                totalPrice: 4000
              }
            ],
            totalAmount: 4000,
            status: 'pending',
            paymentStatus: 'pending',
            paymentMethod: 'cash_on_delivery',
            shippingAddress: {
              street: '101 Rajpath',
              city: 'Bangalore',
              state: 'Karnataka',
              zipCode: '560001',
              country: 'India'
            },
            deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'o5',
            orderNumber: 'ORD-2025-005',
            buyer: {
              _id: 'b2',
              name: 'Buyer Sharma',
              email: 'buyer.sharma@example.com'
            },
            seller: {
              _id: 's2',
              name: 'Farmer Patel',
              email: 'farmer.patel@example.com'
            },
            items: [
              {
                _id: 'i6',
                crop: {
                  _id: 'c2',
                  name: 'Rice',
                  variety: 'Basmati-1121'
                },
                quantity: 500,
                unit: 'kg',
                pricePerUnit: 60,
                totalPrice: 30000
              }
            ],
            totalAmount: 30000,
            status: 'cancelled',
            paymentStatus: 'refunded',
            paymentMethod: 'online',
            shippingAddress: {
              street: '202 Subhash Road',
              city: 'Delhi',
              state: 'Delhi',
              zipCode: '110002',
              country: 'India'
            },
            deliveryDate: null,
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];

        setOrders(mockOrders);
        setFilteredOrders(mockOrders);
        
        // Extract unique buyers for filter
        const uniqueBuyers = Array.from(new Set(mockOrders.map(order => order.buyer._id)))
          .map(buyerId => {
            const buyer = mockOrders.find(order => order.buyer._id === buyerId)?.buyer;
            return {
              id: buyerId,
              name: buyer?.name || 'Unknown'
            };
          });
        setBuyers(uniqueBuyers);
        
        // Extract unique sellers for filter
        const uniqueSellers = Array.from(new Set(mockOrders.map(order => order.seller._id)))
          .map(sellerId => {
            const seller = mockOrders.find(order => order.seller._id === sellerId)?.seller;
            return {
              id: sellerId,
              name: seller?.name || 'Unknown'
            };
          });
        setSellers(uniqueSellers);
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'Failed to load orders');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Reset filters when changing tabs
    setSearchTerm('');
    setFilterStatus('all');
    setFilterPayment('all');
    setFilterBuyer('all');
    setFilterSeller('all');
    
    // Apply tab-specific filters
    let filtered = [...orders];
    switch (newValue) {
      case 0: // All
        break;
      case 1: // Pending
        filtered = filtered.filter(order => order.status === 'pending');
        break;
      case 2: // Processing
        filtered = filtered.filter(order => ['confirmed', 'shipped'].includes(order.status));
        break;
      case 3: // Completed
        filtered = filtered.filter(order => order.status === 'delivered');
        break;
      case 4: // Cancelled
        filtered = filtered.filter(order => order.status === 'cancelled');
        break;
    }
    
    setFilteredOrders(filtered);
  };

  // Apply filters
  useEffect(() => {
    let result = [...orders];
    
    // Apply tab-specific filters first
    switch (tabValue) {
      case 0: // All
        break;
      case 1: // Pending
        result = result.filter(order => order.status === 'pending');
        break;
      case 2: // Processing
        result = result.filter(order => ['confirmed', 'shipped'].includes(order.status));
        break;
      case 3: // Completed
        result = result.filter(order => order.status === 'delivered');
        break;
      case 4: // Cancelled
        result = result.filter(order => order.status === 'cancelled');
        break;
    }
    
    // Apply search term
    if (searchTerm) {
      result = result.filter(
        order => 
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.items.some(item => 
            item.crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.crop.variety.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(order => order.status === filterStatus);
    }
    
    // Apply payment filter
    if (filterPayment !== 'all') {
      result = result.filter(order => order.paymentStatus === filterPayment);
    }
    
    // Apply buyer filter
    if (filterBuyer !== 'all') {
      result = result.filter(order => order.buyer._id === filterBuyer);
    }
    
    // Apply seller filter
    if (filterSeller !== 'all') {
      result = result.filter(order => order.seller._id === filterSeller);
    }
    
    setFilteredOrders(result);
  }, [searchTerm, filterStatus, filterPayment, filterBuyer, filterSeller, tabValue, orders]);

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
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      case 'refunded':
        return 'info';
      default:
        return 'default';
    }
  };

  // Handle delete order
  const handleDeleteOrder = (orderId: string) => {
    setOrderToDelete(orderId);
    setDeleteDialogOpen(true);
  };

  // Confirm delete order
  const confirmDeleteOrder = () => {
    if (orderToDelete) {
      // In a real implementation, this would be an API call
      setOrders(prevOrders => prevOrders.filter(order => order._id !== orderToDelete));
      setFilteredOrders(prevOrders => prevOrders.filter(order => order._id !== orderToDelete));
    }
    setDeleteDialogOpen(false);
    setOrderToDelete(null);
  };

  // Helper function to render the orders table
  const renderOrdersTable = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }
    
    if (filteredOrders.length === 0) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No orders found matching your criteria
          </Typography>
        </Paper>
      );
    }
    
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order #</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Buyer</TableCell>
              <TableCell>Seller</TableCell>
              <TableCell>Items</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Delivery Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order.orderNumber}</TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                    {order.buyer.name}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                    {order.seller.name}
                  </Box>
                </TableCell>
                <TableCell>
                  {order.items.length} item(s)
                  <Typography variant="caption" display="block" color="text.secondary">
                    {order.items.map(item => item.crop.name).join(', ')}
                  </Typography>
                </TableCell>
                <TableCell align="right">₹{order.totalAmount.toLocaleString()}</TableCell>
                <TableCell>
                  <Chip 
                    label={order.status.charAt(0).toUpperCase() + order.status.slice(1)} 
                    color={getStatusColor(order.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)} 
                    color={getPaymentStatusColor(order.paymentStatus) as any}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{formatDate(order.deliveryDate)}</TableCell>
                <TableCell align="right">
                  <Tooltip title="View Details">
                    <IconButton 
                      component={RouterLink} 
                      to={`/admin/orders/${order._id}`} 
                      size="small"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton 
                      component={RouterLink} 
                      to={`/admin/orders/${order._id}/edit`} 
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
                      onClick={() => handleDeleteOrder(order._id)}
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
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Manage Orders
          </Typography>
        </Box>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="All Orders" {...a11yProps(0)} />
            <Tab label="Pending" {...a11yProps(1)} />
            <Tab label="Processing" {...a11yProps(2)} />
            <Tab label="Completed" {...a11yProps(3)} />
            <Tab label="Cancelled" {...a11yProps(4)} />
          </Tabs>
        </Paper>

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
                placeholder="Search by order number, buyer, seller, or crop"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
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
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="shipped">Shipped</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="payment-filter-label">Payment</InputLabel>
                <Select
                  labelId="payment-filter-label"
                  value={filterPayment}
                  onChange={(e: SelectChangeEvent) => setFilterPayment(e.target.value)}
                  label="Payment"
                >
                  <MenuItem value="all">All Payments</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="refunded">Refunded</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="buyer-filter-label">Buyer</InputLabel>
                <Select
                  labelId="buyer-filter-label"
                  value={filterBuyer}
                  onChange={(e: SelectChangeEvent) => setFilterBuyer(e.target.value)}
                  label="Buyer"
                >
                  <MenuItem value="all">All Buyers</MenuItem>
                  {buyers.map(buyer => (
                    <MenuItem key={buyer.id} value={buyer.id}>{buyer.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="seller-filter-label">Seller</InputLabel>
                <Select
                  labelId="seller-filter-label"
                  value={filterSeller}
                  onChange={(e: SelectChangeEvent) => setFilterSeller(e.target.value)}
                  label="Seller"
                >
                  <MenuItem value="all">All Sellers</MenuItem>
                  {sellers.map(seller => (
                    <MenuItem key={seller.id} value={seller.id}>{seller.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Orders Table */}
        <TabPanel value={tabValue} index={0}>
          {renderOrdersTable()}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {renderOrdersTable()}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          {renderOrdersTable()}
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          {renderOrdersTable()}
        </TabPanel>
        
        <TabPanel value={tabValue} index={4}>
          {renderOrdersTable()}
        </TabPanel>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this order? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmDeleteOrder} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default AdminOrders;