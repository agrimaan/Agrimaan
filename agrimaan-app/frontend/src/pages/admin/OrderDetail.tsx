
import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Grid,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  LocationOn as LocationOnIcon,
  Payment as PaymentIcon,
  LocalShipping as LocalShippingIcon,
  Receipt as ReceiptIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarMonth as CalendarIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
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
    phone: string;
  };
  seller: {
    _id: string;
    name: string;
    email: string;
    phone: string;
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
  paymentDetails: {
    transactionId?: string;
    paymentDate?: string;
    paymentGateway?: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  deliveryDate: string | null;
  trackingInfo: {
    provider: string;
    trackingNumber: string;
    trackingUrl: string;
  } | null;
  notes: string;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    comment: string;
  }>;
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
      id={`order-tabpanel-${index}`}
      aria-labelledby={`order-tab-${index}`}
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
    id: `order-tab-${index}`,
    'aria-controls': `order-tabpanel-${index}`,
  };
}

const AdminOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchOrderData = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would be an API call
        // For now, we'll use mock data
        
        // Mock order data
        const mockOrder: Order = {
          _id: id || 'o1',
          orderNumber: 'ORD-2025-001',
          buyer: {
            _id: 'b1',
            name: 'Buyer Kumar',
            email: 'buyer.kumar@example.com',
            phone: '+91 9876543210'
          },
          seller: {
            _id: 's1',
            name: 'Farmer Singh',
            email: 'farmer.singh@example.com',
            phone: '+91 9876543211'
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
          paymentDetails: {
            transactionId: 'TXN123456789',
            paymentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            paymentGateway: 'RazorPay'
          },
          shippingAddress: {
            street: '123 Market Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India'
          },
          billingAddress: {
            street: '123 Market Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India'
          },
          deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          trackingInfo: {
            provider: 'AgriExpress',
            trackingNumber: 'AE123456789',
            trackingUrl: 'https://agriexpress.com/track/AE123456789'
          },
          notes: 'Please deliver during business hours.',
          statusHistory: [
            {
              status: 'pending',
              timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              comment: 'Order placed by buyer'
            },
            {
              status: 'confirmed',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              comment: 'Payment received, order confirmed'
            }
          ],
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        setOrder(mockOrder);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching order data:', err);
        setError(err.message || 'Failed to load order data');
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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

  // Format timestamp
  const formatTimestamp = (dateString: string) => {
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

  // Get order status step
  const getOrderStatusStep = (status: string) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'shipped':
        return 2;
      case 'delivered':
        return 3;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          {error || 'Order not found'}
        </Alert>
        <Button
          component={RouterLink}
          to="/admin/orders"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Back to Orders
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            component={RouterLink}
            to="/admin/orders"
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1">
            Order Details
          </Typography>
        </Box>
        
        <Box>
          <Tooltip title="Edit Order">
            <IconButton 
              component={RouterLink} 
              to={`/admin/orders/${order._id}/edit`}
              color="primary"
              sx={{ mr: 1 }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Order">
            <IconButton color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Order Overview Card */}
      <Paper elevation={3} sx={{ mb: 4, overflow: 'hidden' }}>
        <Box sx={{ 
          p: 3, 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ShoppingCartIcon sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h5" component="h2" gutterBottom>
                Order #{order.orderNumber}
              </Typography>
              <Typography variant="subtitle1">
                Placed on {formatDate(order.createdAt)}
              </Typography>
            </Box>
          </Box>
          <Box>
            <Chip 
              label={order.status.charAt(0).toUpperCase() + order.status.slice(1)} 
              color={getStatusColor(order.status)}
              sx={{ color: 'white', borderColor: 'white' }}
              variant="outlined"
            />
          </Box>
        </Box>
        
        <Box sx={{ p: 3 }}>
          {/* Order Status Stepper */}
          <Stepper activeStep={getOrderStatusStep(order.status)} sx={{ mb: 4 }}>
            <Step>
              <StepLabel>Pending</StepLabel>
            </Step>
            <Step>
              <StepLabel>Confirmed</StepLabel>
            </Step>
            <Step>
              <StepLabel>Shipped</StepLabel>
            </Step>
            <Step>
              <StepLabel>Delivered</StepLabel>
            </Step>
          </Stepper>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Buyer Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary={order.buyer.name} 
                    secondary={
                      <RouterLink to={`/admin/users/${order.buyer._id}`}>
                        View Profile
                      </RouterLink>
                    } 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText primary={order.buyer.email} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText primary={order.buyer.phone} />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Seller Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary={order.seller.name} 
                    secondary={
                      <RouterLink to={`/admin/users/${order.seller._id}`}>
                        View Profile
                      </RouterLink>
                    } 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText primary={order.seller.email} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText primary={order.seller.phone} />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Tabs for different sections */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Items" icon={<InventoryIcon />} iconPosition="start" {...a11yProps(0)} />
          <Tab label="Payment" icon={<PaymentIcon />} iconPosition="start" {...a11yProps(1)} />
          <Tab label="Shipping" icon={<LocalShippingIcon />} iconPosition="start" {...a11yProps(2)} />
          <Tab label="History" icon={<TimelineIcon />} iconPosition="start" {...a11yProps(3)} />
        </Tabs>
      </Paper>

      {/* Items Tab */}
      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom>
          Order Items
        </Typography>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Variety</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Price per Unit</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.crop.name}</TableCell>
                  <TableCell>{item.crop.variety}</TableCell>
                  <TableCell align="right">{item.quantity} {item.unit}</TableCell>
                  <TableCell align="right">\u20b9{item.pricePerUnit.toFixed(2)}</TableCell>
                  <TableCell align="right">\u20b9{item.totalPrice.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} />
                <TableCell align="right">
                  <Typography variant="subtitle1">Total</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle1">\u20b9{order.totalAmount.toFixed(2)}</Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        
        {order.notes && (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Order Notes
            </Typography>
            <Typography variant="body1">
              {order.notes}
            </Typography>
          </Paper>
        )}
      </TabPanel>

      {/* Payment Tab */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Payment Information
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Payment Status
              </Typography>
              <Chip 
                label={order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)} 
                color={getPaymentStatusColor(order.paymentStatus)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Payment Method
              </Typography>
              <Typography variant="body1">
                {order.paymentMethod.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </Typography>
            </Grid>
            
            {order.paymentDetails && (
              <>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Transaction ID
                  </Typography>
                  <Typography variant="body1">
                    {order.paymentDetails.transactionId || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Payment Date
                  </Typography>
                  <Typography variant="body1">
                    {order.paymentDetails.paymentDate ? formatDate(order.paymentDetails.paymentDate) : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Payment Gateway
                  </Typography>
                  <Typography variant="body1">
                    {order.paymentDetails.paymentGateway || 'N/A'}
                  </Typography>
                </Grid>
              </>
            )}
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Total Amount
              </Typography>
              <Typography variant="h5" color="primary">
                \u20b9{order.totalAmount.toFixed(2)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
        
        <Typography variant="h6" gutterBottom>
          Billing Address
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1">
            {order.billingAddress.street}<br />
            {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zipCode}<br />
            {order.billingAddress.country}
          </Typography>
        </Paper>
      </TabPanel>

      {/* Shipping Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Shipping Information
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Shipping Address
              </Typography>
              <Typography variant="body1">
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                {order.shippingAddress.country}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Expected Delivery Date
              </Typography>
              <Typography variant="body1">
                {formatDate(order.deliveryDate)}
              </Typography>
            </Grid>
            
            {order.trackingInfo && (
              <>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Shipping Provider
                  </Typography>
                  <Typography variant="body1">
                    {order.trackingInfo.provider}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Tracking Number
                  </Typography>
                  <Typography variant="body1">
                    {order.trackingInfo.trackingNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    variant="outlined" 
                    component="a" 
                    href={order.trackingInfo.trackingUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    startIcon={<LocalShippingIcon />}
                  >
                    Track Shipment
                  </Button>
                </Grid>
              </>
            )}
          </Grid>
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<LocalShippingIcon />}
            disabled={order.status !== 'confirmed'}
          >
            Mark as Shipped
          </Button>
          <Button 
            variant="contained" 
            color="success" 
            startIcon={<CheckCircleIcon />}
            disabled={order.status !== 'shipped'}
          >
            Mark as Delivered
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            startIcon={<CancelIcon />}
            disabled={['delivered', 'cancelled'].includes(order.status)}
          >
            Cancel Order
          </Button>
        </Box>
      </TabPanel>

      {/* History Tab */}
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom>
          Order History
        </Typography>
        
        <Paper sx={{ p: 3 }}>
          <Stepper orientation="vertical">
            {order.statusHistory.map((history, index) => (
              <Step key={index} active={true} completed={true}>
                <StepLabel>
                  <Typography variant="subtitle1">
                    {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary">
                    {formatTimestamp(history.timestamp)}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {history.comment}
                  </Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>
      </TabPanel>
    </Container>
  );
};

export default AdminOrderDetail;
