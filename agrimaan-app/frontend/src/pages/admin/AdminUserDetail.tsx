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
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  CardHeader,
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
  TableRow
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Terrain as TerrainIcon,
  Grass as GrassIcon,
  Sensors as SensorsIcon,
  ShoppingCart as ShoppingCartIcon,
  SupervisorAccount as AdminIcon,
  Agriculture as FarmerIcon,
  Store as InvestorIcon,
  Science as AgronomistIcon,
  LocalShipping as LogisticsIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// Define types
interface User {
  _id: string;
  name: string;
  email: string;
  role: 'farmer' | 'buyer' | 'admin' | 'agronomist' | 'investor' | 'logistics';
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  profileImage: string | null;
  fields: Array<{
    _id: string;
    name: string;
    size: {
      value: number;
      unit: string;
    };
    location: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface Fields {
  _id: string;
  name: string;
  size: {
    value: number;
    unit: string;
  };
  location: string;
  crops: number;
  sensors: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
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
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
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
    id: `user-tab-${index}`,
    'aria-controls': `user-tabpanel-${index}`,
  };
}

const AdminUserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [fields, setfields] = useState<Fields[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // In a real implementation, these would be API calls
        // For now, we'll use mock data
        
        // Mock user data
        const mockUser: User = {
          _id: id || 'u1',
          name: 'Farmer Singh',
          email: 'farmer.singh@example.com',
          role: 'farmer',
          phone: '+91 9876543210',
          address: {
            street: '123 Farm Road',
            city: 'Amritsar',
            state: 'Punjab',
            country: 'India',
            zipCode: '143001'
          },
          profileImage: null,
          fields: [
            {
              _id: 'f1',
              name: 'North Farm',
              size: {
                value: 5.2,
                unit: 'hectares'
              },
              location: 'Village X, District Y, State Z'
            },
            {
              _id: 'f4',
              name: 'West Fields',
              size: {
                value: 4.1,
                unit: 'hectares'
              },
              location: 'Village J, District K, State L'
            }
          ],
          createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        // Mock fields data
        const mockfields: Fields[] = [
          {
            _id: 'f1',
            name: 'North Farm',
            size: {
              value: 5.2,
              unit: 'hectares'
            },
            location: 'Village X, District Y, State Z',
            crops: 2,
            sensors: 3
          },
          {
            _id: 'f4',
            name: 'West Fields',
            size: {
              value: 4.1,
              unit: 'hectares'
            },
            location: 'Village J, District K, State L',
            crops: 1,
            sensors: 2
          }
        ];
        
        // Mock orders data
        const mockOrders: Order[] = [
          {
            _id: 'o1',
            orderNumber: 'ORD-2025-001',
            totalAmount: 24500,
            status: 'confirmed',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'o3',
            orderNumber: 'ORD-2025-003',
            totalAmount: 3500,
            status: 'delivered',
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        
        setUser(mockUser);
        setfields(mockfields);
        setOrders(mockOrders);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching user data:', err);
        setError(err.message || 'Failed to load user data');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <AdminIcon />;
      case 'farmer':
        return <FarmerIcon />;
      case 'buyer':
        return <ShoppingCartIcon />;
      case 'agronomist':
        return <AgronomistIcon />;
      case 'investor':
        return <InvestorIcon />;
      case 'logistics':
        return <LogisticsIcon />;
      default:
        return <PersonIcon />;
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
      case 'logistics':
        return 'secondary';
      default:
        return 'default';
    }
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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          {error || 'User not found'}
        </Alert>
        <Button
          component={RouterLink}
          to="/admin/users"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Back to Users
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
            to="/admin/users"
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1">
            User Details
          </Typography>
        </Box>
        
        <Box>
          <Tooltip title="Edit User">
            <IconButton 
              component={RouterLink} 
              to={`/admin/users/${user._id}/edit`}
              color="primary"
              sx={{ mr: 1 }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete User">
            <IconButton color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* User Profile Card */}
      <Paper elevation={3} sx={{ mb: 4, overflow: 'hidden' }}>
        <Box sx={{ 
          p: 3, 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Avatar 
            sx={{ 
              width: 100, 
              height: 100, 
              bgcolor: 'white', 
              color: 'primary.main',
              mr: 3,
              fontSize: '3rem'
            }}
          >
            {user.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h2" gutterBottom>
              {user.name}
            </Typography>
            <Chip 
              icon={getRoleIcon(user.role)} 
              label={user.role.charAt(0).toUpperCase() + user.role.slice(1)} 
              color={getRoleColor(user.role) as any}
              sx={{ color: 'white', borderColor: 'white', '& .MuiChip-icon': { color: 'white' } }}
              variant="outlined"
            />
          </Box>
        </Box>
        
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Email" 
                    secondary={user.email} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Phone" 
                    secondary={user.phone || 'Not provided'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <HomeIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Address" 
                    secondary={
                      user.address ? 
                      `${user.address.street}, ${user.address.city}, ${user.address.state}, ${user.address.country}, ${user.address.zipCode}` : 
                      'Not provided'
                    } 
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <TerrainIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="fields" 
                    secondary={`${user.fields.length} fields`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Member Since" 
                    secondary={formatDate(user.createdAt)} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <EditIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Last Updated" 
                    secondary={formatDate(user.updatedAt)} 
                  />
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
          <Tab label="fields" icon={<TerrainIcon />} iconPosition="start" {...a11yProps(0)} />
          <Tab label="Orders" icon={<ShoppingCartIcon />} iconPosition="start" {...a11yProps(1)} />
          <Tab label="Activity" icon={<PersonIcon />} iconPosition="start" {...a11yProps(2)} />
        </Tabs>
      </Paper>

      {/* fields Tab */}
      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom>
          User's fields
        </Typography>
        {fields.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              This user has no fields
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {fields.map((Fields) => (
              <Grid item xs={12} md={6} key={Fields._id}>
                <Card>
                  <CardHeader
                    title={Fields.name}
                    subheader={Fields.location}
                    action={
                      <IconButton 
                        component={RouterLink} 
                        to={`/admin/fields/${Fields._id}`}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    }
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Size:</strong> {Fields.size.value} {Fields.size.unit}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Chip 
                        icon={<GrassIcon />} 
                        label={`${Fields.crops} Crops`} 
                        color="success" 
                        variant="outlined" 
                      />
                      <Chip 
                        icon={<SensorsIcon />} 
                        label={`${Fields.sensors} Sensors`} 
                        color="info" 
                        variant="outlined" 
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Orders Tab */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          User's Orders
        </Typography>
        {orders.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              This user has no orders
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order #</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell align="right">₹{order.totalAmount.toLocaleString()}</TableCell>
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
                        to={`/admin/orders/${order._id}`} 
                        size="small" 
                        variant="outlined"
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* Activity Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Activity tracking is not available in this version
          </Typography>
        </Paper>
      </TabPanel>
    </Container>
  );
};

export default AdminUserDetail;