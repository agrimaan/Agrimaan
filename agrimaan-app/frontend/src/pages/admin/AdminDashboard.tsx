
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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Snackbar
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
  Store as StoreIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Upload as UploadIcon,
  Report as ReportIcon,
  Download as DownloadIcon,
  Verified as VerifiedIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import SettingsIcon from "@mui/icons-material/Settings";


import { RootState } from '../../store';
import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// Define types
interface DashboardData {
  counts: {
    users: number;
    fields: number;
    crops: number;
    sensors: number;
    orders: number;
    landTokens: number;
    bulkUploads: number;
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
    buyer: { _id: string; name: string };
    seller: { _id: string; name: string };
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
  verificationStats: {
    pendingUsers: number;
    pendingLandTokens: number;
    pendingBulkUploads: number;
  };
  systemHealth: {
    otpEnabled: boolean;
    emailConfigured: boolean;
    smsConfigured: boolean;
    oauthConfigured: boolean;
  };
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  verificationStatus: string;
  createdAt: string;
  phone?: { number: string; verified: boolean };
  emailVerification?: { verified: boolean };
}

interface LandToken {
  _id: string;
  landId: string;
  owner: { name: string; email: string };
  landDetails: {
    location: { city: string; state: string };
    area: { value: number; unit: string };
  };
  verification: { status: string };
  status: string;
  createdAt: string;
}

interface BulkUpload {
  _id: string;
  filename: string;
  type: string;
  status: string;
  records: number;
  success: number;
  failed: number;
  uploadedBy: string;
  uploadedAt: string;
}

const AdminDashboard: React.FC = () => {
  const [success, setSuccess] = useState<string | null>(null);
// you already have this, but keeping for context:
const [verificationDialog, setVerificationDialog] = useState<boolean>(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [landTokens, setLandTokens] = useState<LandToken[]>([]);
  const [bulkUploads, setBulkUploads] = useState<BulkUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedLandToken, setSelectedLandToken] = useState<LandToken | null>(null);
  //const [verificationDialog, setVerificationDialog] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [bulkUploadDialog, setBulkUploadDialog] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Use mock data for development
      const mockData: DashboardData = {
        counts: {
          users: 45,
          fields: 120,
          crops: 350,
          sensors: 78,
          orders: 230,
          landTokens: 25,
          bulkUploads: 15
        },
        usersByRole: {
          farmers: 25,
          buyers: 15,
          agronomists: 3,
          investors: 1,
          admins: 1
        },
        recentOrders: [
          {
            _id: 'order1',
            buyer: { _id: 'b1', name: 'Buyer Kumar' },
            seller: { _id: 'f1', name: 'Farmer Singh' },
            totalAmount: 1500,
            status: 'pending',
            createdAt: new Date().toISOString()
          },
          {
            _id: 'order2',
            buyer: { _id: 'b2', name: 'Buyer Sharma' },
            seller: { _id: 'f2', name: 'Farmer Patel' },
            totalAmount: 2300,
            status: 'confirmed',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ],
        recentUsers: [
          {
            _id: 'user1',
            name: 'New Farmer',
            email: 'farmer@example.com',
            role: 'farmer',
            createdAt: new Date().toISOString()
          },
          {
            _id: 'user2',
            name: 'New Buyer',
            email: 'buyer@example.com',
            role: 'buyer',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ],
        verificationStats: {
          pendingUsers: 5,
          pendingLandTokens: 3,
          pendingBulkUploads: 2
        },
        systemHealth: {
          otpEnabled: true,
          emailConfigured: true,
          smsConfigured: true,
          oauthConfigured: true
        }
      };

      const mockUsers: User[] = [
        {
          _id: 'user1',
          name: 'John Farmer',
          email: 'john@example.com',
          role: 'farmer',
          verificationStatus: 'pending',
          createdAt: new Date().toISOString()
        },
        {
          _id: 'user2',
          name: 'Jane Buyer',
          email: 'jane@example.com',
          role: 'buyer',
          verificationStatus: 'verified',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ];

      const mockLandTokens: LandToken[] = [
        {
          _id: 'token1',
          landId: 'LAND-001',
          owner: { name: 'Farmer Singh', email: 'farmer@example.com' },
          landDetails: {
            location: { city: 'Barabanki', state: 'UP' },
            area: { value: 5, unit: 'hectare' }
          },
          verification: { status: 'pending' },
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ];

      const mockBulkUploads: BulkUpload[] = [
        {
          _id: 'upload1',
          filename: 'farmers_batch_001.csv',
          type: 'users',
          status: 'completed',
          records: 150,
          success: 145,
          failed: 5,
          uploadedBy: 'admin@agrimaan.com',
          uploadedAt: '2025-09-11 10:30:00'
        }
      ];

      setDashboardData(mockData);
      setUsers(mockUsers);
      setLandTokens(mockLandTokens);
      setBulkUploads(mockBulkUploads);
      setLoading(false);
      
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

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
            startIcon={<SettingsIcon />}
          >
            Settings
          </Button>
        </Box>
      </Box>

      {/* Welcome Card */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Welcome, {user?.name || 'Admin'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This is your comprehensive admin control panel. From here, you can manage all aspects of the platform including users, fields, crops, sensors, land tokens, bulk uploads, and system configuration.
        </Typography>
      </Paper>

      {/* Enhanced Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
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
        
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    fields
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
                  Manage fields
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
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
        
        <Grid item xs={12} sm={6} md={2}>
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
        
        <Grid item xs={12} sm={6} md={2}>
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

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Land Tokens
                  </Typography>
                  <Typography variant="h4" component="div">
                    {dashboardData?.counts.landTokens || 0}
                  </Typography>
                </Box>
                <StoreIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Button
                  component={RouterLink}
                  to="/admin/tokens"
                  size="small"
                  color="primary"
                >
                  Manage Tokens
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Verification Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'warning.light', color: 'warning.dark' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PendingIcon sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{dashboardData?.verificationStats.pendingUsers || 0}</Typography>
                  <Typography variant="body2">Pending User Verification</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'info.light', color: 'info.dark' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <StoreIcon sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{dashboardData?.verificationStats.pendingLandTokens || 0}</Typography>
                  <Typography variant="body2">Pending Land Tokens</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.dark' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CloudUploadIcon sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{dashboardData?.verificationStats.pendingBulkUploads || 0}</Typography>
                  <Typography variant="body2">Pending Bulk Uploads</Typography>
                </Box>
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
                System Health
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                OTP Verification
              </Typography>
              <Chip 
                label={dashboardData?.systemHealth.otpEnabled ? 'Enabled' : 'Disabled'}
                color={dashboardData?.systemHealth.otpEnabled ? 'success' : 'default'}
                size="small"
              />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                Email Service
              </Typography>
              <Chip 
                label={dashboardData?.systemHealth.emailConfigured ? 'Configured' : 'Not Configured'}
                color={dashboardData?.systemHealth.emailConfigured ? 'success' : 'error'}
                size="small"
              />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                SMS Service
              </Typography>
              <Chip 
                label={dashboardData?.systemHealth.smsConfigured ? 'Configured' : 'Not Configured'}
                color={dashboardData?.systemHealth.smsConfigured ? 'success' : 'error'}
                size="small"
              />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                Google OAuth
              </Typography>
              <Chip 
                label={dashboardData?.systemHealth.oauthConfigured ? 'Configured' : 'Not Configured'}
                color={dashboardData?.systemHealth.oauthConfigured ? 'success' : 'error'}
                size="small"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Action Buttons Row */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/admin/users/new"
        >
          Add User
        </Button>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => setBulkUploadDialog(true)}
          color="secondary"
        >
          Bulk Upload
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => window.open('/api/admin/reports/users?format=csv', '_blank')}
        >
          Export Users
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => window.open('/api/admin/reports/land-tokens?format=csv', '_blank')}
        >
          Export Land Tokens
        </Button>
      </Box>

      {/* Tabs for Detailed Management */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label={`Recent Users (${users.length})`} />
          <Tab label={`Recent Orders (${dashboardData?.recentOrders?.length || 0})`} />
          <Tab label={`Pending Land Tokens (${landTokens.length})`} />
          <Tab label={`Bulk Uploads (${bulkUploads.length})`} />
        </Tabs>
      </Box>

      {/* Recent Users Tab */}
      {activeTab === 0 && (
        <Paper sx={{ p: 2 }}>
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
          
          {users.length > 0 ? (
            <List>
              {users.map((user) => (
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
                        {` \u2014 Joined ${formatDate(user.createdAt)}`}
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
      )}

      {/* Recent Orders Tab */}
      {activeTab === 1 && (
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h2">
              Recent Orders
            </Typography>
            <Button 
              component={RouterLink} 
              to="/admin/orders" 
              size="small" 
              endIcon={<ShoppingCartIcon />}
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
                        <Tooltip title="View Details">
                          <IconButton 
                            component={RouterLink}
                            to={`/admin/orders/${order._id}`}
                            size="small"
                          >
                            <VisibilityIcon fontSize="small" />
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
      )}

      {/* Pending Land Tokens Tab */}
      {activeTab === 2 && (
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h2">
              Pending Land Tokens
            </Typography>
            <Button 
              component={RouterLink} 
              to="/admin/tokens" 
              size="small" 
              endIcon={<StoreIcon />}
            >
              View All
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          {landTokens.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Land ID</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Area</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {landTokens.map((token) => (
                    <TableRow key={token._id}>
                      <TableCell>{token.landId}</TableCell>
                      <TableCell>{token.owner.name}</TableCell>
                      <TableCell>
                        {token.landDetails.location.city}, {token.landDetails.location.state}
                      </TableCell>
                      <TableCell>
                        {token.landDetails.area.value} {token.landDetails.area.unit}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={token.verification.status} 
                          size="small"
                          color={token.verification.status === 'pending' ? 'warning' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {formatDate(token.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton 
                            component={RouterLink}
                            to={`/admin/tokens/${token._id}`}
                            size="small"
                          >
                            <VisibilityIcon fontSize="small" />
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
              No pending land tokens found.
            </Typography>
          )}
        </Paper>
      )}

      {/* Bulk Uploads Tab */}
      {activeTab === 3 && (
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h2">
              Bulk Uploads
            </Typography>
            <Button 
              component={RouterLink} 
              to="/admin/bulk-uploads" 
              size="small" 
              endIcon={<UploadIcon />}
            >
              View All
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          {bulkUploads.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>File Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Records</TableCell>
                    <TableCell align="right">Success</TableCell>
                    <TableCell align="right">Failed</TableCell>
                    <TableCell>Uploaded</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bulkUploads.map((upload) => (
                    <TableRow key={upload._id}>
                      <TableCell>{upload.filename}</TableCell>
                      <TableCell>
                        <Chip label={upload.type} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={upload.status} 
                          color={getStatusColor(upload.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">{upload.records}</TableCell>
                      <TableCell align="right">{upload.success}</TableCell>
                      <TableCell align="right">{upload.failed}</TableCell>
                      <TableCell>{upload.uploadedAt}</TableCell>
                      <TableCell>
                        <Tooltip title="Download Report">
                          <IconButton size="small">
                            <DownloadIcon />
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
              No bulk uploads found.
            </Typography>
          )}
        </Paper>
      )}

      {/* Verification Dialog */}
      <Dialog open={verificationDialog} onClose={() => setVerificationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'User Verification' : 'Land Token Verification'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Verification Notes / Rejection Reason"
            value={verificationNotes || rejectionReason}
            onChange={(e) => {
              setVerificationNotes(e.target.value);
              setRejectionReason(e.target.value);
            }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerificationDialog(false)}>
            Cancel
          </Button>
          <Button
            color="error"
            onClick={() => {
              setError('Rejection functionality coming soon');
              setVerificationDialog(false);
            }}
          >
            Reject
          </Button>
          <Button
            color="success"
            variant="contained"
            onClick={() => {
              setSuccess('Approval functionality coming soon');
              setVerificationDialog(false);
            }}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={bulkUploadDialog} onClose={() => setBulkUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Upload</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Upload Type</InputLabel>
            <Select
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value)}
              label="Upload Type"
            >
              <MenuItem value="users">Users</MenuItem>
              <MenuItem value="fields">Fields</MenuItem>
              <MenuItem value="crops">Crops</MenuItem>
              <MenuItem value="sensors">Sensors</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            disabled={!uploadType}
            sx={{ mb: 2 }}
          >
            Download Template
          </Button>

          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkUploadDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!uploadFile || !uploadType}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
