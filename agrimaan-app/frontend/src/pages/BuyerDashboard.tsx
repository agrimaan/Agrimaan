import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
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
  Avatar
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Store as StoreIcon,
  History as HistoryIcon,
  LocalShipping as LocalShippingIcon,
  Favorite as FavoriteIcon
} from '@mui/icons-material';
import { RootState } from '../store';
import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

// Define types
interface Order {
  _id: string;
  seller: {
    _id: string;
    name: string;
  };
  items: Array<{
    crop: {
      _id: string;
      name: string;
      variety: string;
    };
    quantity: number;
    pricePerUnit: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
}

interface MarketplaceItem {
  _id: string;
  cropName: string;
  variety: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  seller: {
    _id: string;
    name: string;
  };
  image?: string;
  quality: string;
  status: string;
}

const BuyerDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState({
    orders: true,
    products: true
  });

  useEffect(() => {
    // Fetch recent orders
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/orders`);
        setRecentOrders(res.data.slice(0, 5)); // Get only the 5 most recent orders
        setLoading(prev => ({ ...prev, orders: false }));
      } catch (err) {
        console.error('Error fetching orders:', err);
        setLoading(prev => ({ ...prev, orders: false }));
      }
    };

    // Fetch featured products
    const fetchFeaturedProducts = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/marketplace/featured`);
        setFeaturedProducts(res.data);
        setLoading(prev => ({ ...prev, products: false }));
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setLoading(prev => ({ ...prev, products: false }));
      }
    };

    fetchOrders();
    fetchFeaturedProducts();
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Buyer Dashboard
        </Typography>
        
        <Box>
          <Button
            component={RouterLink}
            to="/marketplace"
            variant="contained"
            startIcon={<StoreIcon />}
            sx={{ mr: 1 }}
          >
            Browse Marketplace
          </Button>
          <Button
            component={RouterLink}
            to="/orders"
            variant="outlined"
            startIcon={<HistoryIcon />}
          >
            My Orders
          </Button>
        </Box>
      </Box>

      {/* Welcome Card */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Welcome back, {user?.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse the latest agricultural products from verified farmers, place orders, and track your deliveries all in one place.
        </Typography>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Active Orders
                  </Typography>
                  <Typography variant="h4" component="div">
                    {loading.orders ? '..' : recentOrders.filter(order => 
                      ['pending', 'confirmed', 'shipped'].includes(order.status)
                    ).length}
                  </Typography>
                </Box>
                <LocalShippingIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Link component={RouterLink} to="/orders" color="primary" underline="hover">
                  View all orders
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Available Products
                  </Typography>
                  <Typography variant="h4" component="div">
                    {loading.products ? '..' : featuredProducts.length}
                  </Typography>
                </Box>
                <StoreIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Link component={RouterLink} to="/marketplace" color="primary" underline="hover">
                  Browse marketplace
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Saved Items
                  </Typography>
                  <Typography variant="h4" component="div">
                    0
                  </Typography>
                </Box>
                <FavoriteIcon color="error" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Link component={RouterLink} to="/saved" color="primary" underline="hover">
                  View saved items
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Orders */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            Recent Orders
          </Typography>
          <Button 
            component={RouterLink} 
            to="/orders" 
            size="small" 
            endIcon={<HistoryIcon />}
          >
            View All
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        {loading.orders ? (
          <Typography>Loading recent orders...</Typography>
        ) : recentOrders.length === 0 ? (
          <Typography color="text.secondary">
            You haven't placed any orders yet. Browse the marketplace to find products.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Seller</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>{order._id.substring(0, 8)}...</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>{order.seller.name}</TableCell>
                    <TableCell>{order.items.length} item(s)</TableCell>
                    <TableCell align="right">${order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status.charAt(0).toUpperCase() + order.status.slice(1)} 
                        color={getStatusColor(order.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button 
                        component={RouterLink} 
                        to={`/orders/${order._id}`} 
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

      {/* Featured Products */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            Featured Products
          </Typography>
          <Button 
            component={RouterLink} 
            to="/marketplace" 
            size="small" 
            endIcon={<ShoppingCartIcon />}
          >
            Browse All
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        {loading.products ? (
          <Typography>Loading featured products...</Typography>
        ) : featuredProducts.length === 0 ? (
          <Typography color="text.secondary">
            No featured products available at the moment.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {featuredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {product.image ? (
                    <CardMedia
                      component="img"
                      height="140"
                      image={product.image}
                      alt={product.cropName}
                    />
                  ) : (
                    <Box sx={{ height: 140, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        No image available
                      </Typography>
                    </Box>
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {product.cropName} - {product.variety}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Quality: {product.quality}
                      </Typography>
                      <Chip 
                        label={product.status} 
                        color={product.status === 'Available' ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                        {product.seller.name.charAt(0)}
                      </Avatar>
                      <Typography variant="body2">
                        {product.seller.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" color="primary">
                        ${product.pricePerUnit.toFixed(2)}/{product.unit}
                      </Typography>
                      <Typography variant="body2">
                        {product.quantity} {product.unit} available
                      </Typography>
                    </Box>
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button 
                      component={RouterLink}
                      to={`/marketplace/${product._id}`}
                      variant="contained" 
                      fullWidth
                      startIcon={<ShoppingCartIcon />}
                    >
                      View Details
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default BuyerDashboard;