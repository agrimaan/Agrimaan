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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  People as PeopleIcon,
  Terrain as TerrainIcon,
  Grass as GrassIcon,
  Sensors as SensorsIcon,
  ShoppingCart as ShoppingCartIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  SupervisorAccount as AdminIcon,
  LocalShipping as ShippingIcon,
  Store as StoreIcon
} from '@mui/icons-material';
import { RootState } from '../store';
import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

// Define types
interface DashboardData {
  counts: {
    users: number;
    fields: number;
    crops: number;
    sensors: number;
    orders: number;
  };
  usersByRole: {
    farmers: number;
    buyers: number;
    agronomists: number;
    investors: number;
    admins: number;
  };
  recentOrders: Array<{
    _id: string;
    buyer: {
      _id: string;
      name: string;
    };
    seller: {
      _id: string;
      name: string;
    };
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
  recentUsers: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
}

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/dashboard`);
        setDashboardData(res.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
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

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'farmer':
        return 'success';
      case 'buyer':
        return 'primary';
      case 'agronomist':
        return 'info';
      case 'investor':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <AdminIcon />;
      case 'farmer':
        return <TerrainIcon />;
      case 'buyer':
        return <ShoppingCartIcon />;
      case 'agronomist':
        return <GrassIcon />;
      case 'investor':
        return <StoreIcon />;
      default:
        return <PersonIcon />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading dashboard data...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        
        <Box>
          <Button
            component={RouterLink}
            to="/admin/users/new"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ mr: 1 }}
          >
            Add User
          </Button>
          <Button
            component={RouterLink}
            to="/admin/settings"
            variant="outlined"
            startIcon={<DashboardIcon />}
          >
            Settings
          </Button>
        </Box>
      </Box>

      {/* Welcome Card */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Welcome, {user?.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This is your admin control panel. From here, you can manage users, fields, crops, sensors, and marketplace listings.
        </Typography>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Users
                  </Typography>
                  <Typography variant="h4" component="div">
                    {dashboardData?.counts.users || 0}
                  </Typography>
                </Box>
                <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Button
                  component={RouterLink}
                  to="/admin/users"
                  size="small"
                  color="primary"
                >
                  Manage Users
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fields
                  </Typography>
                  <Typography variant="h4" component="div">
                    {dashboardData?.counts.fields || 0}
                  </Typography>
                </Box>
                <TerrainIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Button
                  component={RouterLink}
                  to="/admin/fields"
                  size="small"
                  color="primary"
                >
                  Manage Fields
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Crops
                  </Typography>
                  <Typography variant="h4" component="div">
                    {dashboardData?.counts.crops || 0}
                  </Typography>
                </Box>
                <GrassIcon color="info" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Button
                  component={RouterLink}
                  to="/admin/crops"
                  size="small"
                  color="primary"
                >
                  Manage Crops
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Sensors
                  </Typography>
                  <Typography variant="h4" component="div">
                    {dashboardData?.counts.sensors || 0}
                  </Typography>
                </Box>
                <SensorsIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Button
                  component={RouterLink}
                  to="/admin/sensors"
                  size="small"
                  color="primary"
                >
                  Manage Sensors
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Orders
                  </Typography>
                  <Typography variant="h4" component="div">
                    {dashboardData?.counts.orders || 0}
                  </Typography>
                </Box>
                <ShoppingCartIcon color="secondary" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Button
                  component={RouterLink}
                  to="/admin/orders"
                  size="small"
                  color="primary"
                >
                  Manage Orders
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* User Distribution */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              User Distribution
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card sx={{ bgcolor: 'success.light', p: 2, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TerrainIcon sx={{ color: 'success.dark', mr: 1 }} />
                    <Typography variant="subtitle1" color="success.dark">
                      Farmers
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ mt: 1, color: 'success.dark' }}>
                    {dashboardData?.usersByRole.farmers || 0}
                  </Typography>
                </Card>
              </Grid>
              
              <Grid item xs={6}>
                <Card sx={{ bgcolor: 'primary.light', p: 2, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ShoppingCartIcon sx={{ color: 'primary.dark', mr: 1 }} />
                    <Typography variant="subtitle1" color="primary.dark">
                      Buyers
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ mt: 1, color: 'primary.dark' }}>
                    {dashboardData?.usersByRole.buyers || 0}
                  </Typography>
                </Card>
              </Grid>
              
              <Grid item xs={4}>
                <Card sx={{ bgcolor: 'info.light', p: 2, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <GrassIcon sx={{ color: 'info.dark', mr: 1 }} />
                    <Typography variant="subtitle2" color="info.dark">
                      Agronomists
                    </Typography>
                  </Box>
                  <Typography variant="h5" sx={{ mt: 1, color: 'info.dark' }}>
                    {dashboardData?.usersByRole.agronomists || 0}
                  </Typography>
                </Card>
              </Grid>
              
              <Grid item xs={4}>
                <Card sx={{ bgcolor: 'warning.light', p: 2, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <StoreIcon sx={{ color: 'warning.dark', mr: 1 }} />
                    <Typography variant="subtitle2" color="warning.dark">
                      Investors
                    </Typography>
                  </Box>
                  <Typography variant="h5" sx={{ mt: 1, color: 'warning.dark' }}>
                    {dashboardData?.usersByRole.investors || 0}
                  </Typography>
                </Card>
              </Grid>
              
              <Grid item xs={4}>
                <Card sx={{ bgcolor: 'error.light', p: 2, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AdminIcon sx={{ color: 'error.dark', mr: 1 }} />
                    <Typography variant="subtitle2" color="error.dark">
                      Admins
                    </Typography>
                  </Box>
                  <Typography variant="h5" sx={{ mt: 1, color: 'error.dark' }}>
                    {dashboardData?.usersByRole.admins || 0}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2">
                Recent Users
              </Typography>
              <Button 
                component={RouterLink} 
                to="/admin/users" 
                size="small" 
                endIcon={<PeopleIcon />}
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {dashboardData?.recentUsers && dashboardData.recentUsers.length > 0 ? (
              <List>
                {dashboardData.recentUsers.map((user) => (
                  <ListItem
                    key={user._id}
                    secondaryAction={
                      <Box>
                        <Tooltip title="View">
                          <IconButton 
                            component={RouterLink} 
                            to={`/admin/users/${user._id}`} 
                            edge="end" 
                            aria-label="view"
                            size="small"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton 
                            component={RouterLink} 
                            to={`/admin/users/${user._id}/edit`} 
                            edge="end" 
                            aria-label="edit"
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: getRoleColor(user.role) }}>
                        {getRoleIcon(user.role)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.name}
                      secondary={
                        <React.Fragment>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {user.email}
                          </Typography>
                          {` — Joined ${formatDate(user.createdAt)}`}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">
                No users found.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Orders */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            Recent Orders
          </Typography>
          <Button 
            component={RouterLink} 
            to="/admin/orders" 
            size="small" 
            endIcon={<ShippingIcon />}
          >
            View All
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        {dashboardData?.recentOrders && dashboardData.recentOrders.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Buyer</TableCell>
                  <TableCell>Seller</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dashboardData.recentOrders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>{order._id.substring(0, 8)}...</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>{order.buyer.name}</TableCell>
                    <TableCell>{order.seller.name}</TableCell>
                    <TableCell align="right">${order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status.charAt(0).toUpperCase() + order.status.slice(1)} 
                        color={getStatusColor(order.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View">
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
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography color="text.secondary">
            No recent orders found.
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default AdminDashboard;