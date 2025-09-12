import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge
} from '@mui/material';
import {
  People as PeopleIcon,
  Verified as VerifiedIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  CloudUpload as UploadIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  Visibility as ViewIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

interface DashboardStats {
  userStats: {
    totalUsers: number;
    verifiedUsers: number;
    pendingUsers: number;
    unverifiedUsers: number;
  };
  roleStats: Array<{ _id: string; count: number }>;
  recentRegistrations: number;
  landTokenStats: {
    totalLandTokens: number;
    pendingApproval: number;
    underReview: number;
    verified: number;
    rejected: number;
  };
  bulkUploadStats: {
    totalUploads: number;
    completedUploads: number;
    failedUploads: number;
    processingUploads: number;
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

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [landTokens, setLandTokens] = useState<LandToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedLandToken, setSelectedLandToken] = useState<LandToken | null>(null);
  const [verificationDialog, setVerificationDialog] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [bulkUploadDialog, setBulkUploadDialog] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Load dashboard stats
      const statsResponse = await fetch('/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Load pending users
      const usersResponse = await fetch('/api/admin/users?verificationStatus=pending&limit=10', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersResponse.json();
      setUsers(usersData.users);

      // Load pending land tokens
      const landTokensResponse = await fetch('/api/admin/land-tokens?verificationStatus=pending&limit=10', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const landTokensData = await landTokensResponse.json();
      setLandTokens(landTokensData.landTokens);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUserVerification = async (userId: string, action: 'verify' | 'reject') => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = `/api/admin/users/${userId}/${action}`;
      const body = action === 'verify' 
        ? { verificationNotes }
        : { rejectionReason };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error('Verification failed');
      }

      setSuccess(`User ${action}ed successfully`);
      setVerificationDialog(false);
      setVerificationNotes('');
      setRejectionReason('');
      loadDashboardData();

    } catch (error) {
      setError(`Failed to ${action} user`);
    }
  };

  const handleLandTokenVerification = async (tokenId: string, action: 'verify' | 'reject') => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = `/api/admin/land-tokens/${tokenId}/${action}`;
      const body = action === 'verify' 
        ? { verificationNotes }
        : { rejectionReason };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error('Verification failed');
      }

      setSuccess(`Land token ${action}ed successfully`);
      setVerificationDialog(false);
      setVerificationNotes('');
      setRejectionReason('');
      loadDashboardData();

    } catch (error) {
      setError(`Failed to ${action} land token`);
    }
  };

  const handleBulkUpload = async () => {
    if (!uploadFile || !uploadType) {
      setError('Please select a file and upload type');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('uploadType', uploadType);

      const response = await fetch('/api/admin/bulk-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Bulk upload failed');
      }

      setSuccess('Bulk upload started successfully. You will receive an email notification when complete.');
      setBulkUploadDialog(false);
      setUploadFile(null);
      setUploadType('');

    } catch (error) {
      setError('Bulk upload failed');
    }
  };

  const downloadTemplate = (type: string) => {
    const token = localStorage.getItem('token');
    window.open(`/api/admin/bulk-upload/template/${type}?token=${token}`, '_blank');
  };

  const generateReport = (type: 'users' | 'land-tokens', format: 'json' | 'csv') => {
    const token = localStorage.getItem('token');
    window.open(`/api/admin/reports/${type}?format=${format}&token=${token}`, '_blank');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PeopleIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{stats?.userStats.totalUsers || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Badge badgeContent={stats?.userStats.pendingUsers || 0} color="warning">
                  <PendingIcon color="warning" sx={{ mr: 2 }} />
                </Badge>
                <Box>
                  <Typography variant="h6">{stats?.userStats.pendingUsers || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Verification
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <VerifiedIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{stats?.userStats.verifiedUsers || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Verified Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Badge badgeContent={stats?.landTokenStats.pendingApproval || 0} color="info">
                  <ReportIcon color="info" sx={{ mr: 2 }} />
                </Badge>
                <Box>
                  <Typography variant="h6">{stats?.landTokenStats.totalLandTokens || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Land Tokens
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => setBulkUploadDialog(true)}
          sx={{ mr: 2 }}
        >
          Bulk Upload
        </Button>
        <Button
          variant="outlined"
          startIcon={<ReportIcon />}
          onClick={() => generateReport('users', 'csv')}
          sx={{ mr: 2 }}
        >
          Export Users
        </Button>
        <Button
          variant="outlined"
          startIcon={<ReportIcon />}
          onClick={() => generateReport('land-tokens', 'csv')}
        >
          Export Land Tokens
        </Button>
      </Box>

      {/* Tabs for different sections */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label={`Pending Users (${users.length})`} />
          <Tab label={`Pending Land Tokens (${landTokens.length})`} />
          <Tab label="System Health" />
        </Tabs>
      </Box>

      {/* Pending Users Tab */}
      {activeTab === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Registration Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip label={user.role} size="small" />
                  </TableCell>
                  <TableCell>
                    {user.phone?.number}
                    {user.phone?.verified && (
                      <VerifiedIcon color="success" sx={{ ml: 1, fontSize: 16 }} />
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="success"
                      onClick={() => {
                        setSelectedUser(user);
                        setVerificationDialog(true);
                      }}
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => {
                        setSelectedUser(user);
                        setVerificationDialog(true);
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                    <IconButton color="primary">
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pending Land Tokens Tab */}
      {activeTab === 1 && (
        <TableContainer component={Paper}>
          <Table>
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
                    {new Date(token.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="success"
                      onClick={() => {
                        setSelectedLandToken(token);
                        setVerificationDialog(true);
                      }}
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => {
                        setSelectedLandToken(token);
                        setVerificationDialog(true);
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                    <IconButton color="primary">
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* System Health Tab */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Configuration
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    OTP Verification
                  </Typography>
                  <Chip 
                    label={stats?.systemHealth.otpEnabled ? 'Enabled' : 'Disabled'}
                    color={stats?.systemHealth.otpEnabled ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    Email Service
                  </Typography>
                  <Chip 
                    label={stats?.systemHealth.emailConfigured ? 'Configured' : 'Not Configured'}
                    color={stats?.systemHealth.emailConfigured ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    SMS Service
                  </Typography>
                  <Chip 
                    label={stats?.systemHealth.smsConfigured ? 'Configured' : 'Not Configured'}
                    color={stats?.systemHealth.smsConfigured ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    Google OAuth
                  </Typography>
                  <Chip 
                    label={stats?.systemHealth.oauthConfigured ? 'Configured' : 'Not Configured'}
                    color={stats?.systemHealth.oauthConfigured ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Bulk Upload Statistics
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    Total Uploads
                  </Typography>
                  <Typography variant="h6">
                    {stats?.bulkUploadStats.totalUploads || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    Completed
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {stats?.bulkUploadStats.completedUploads || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    Processing
                  </Typography>
                  <Typography variant="h6" color="warning.main">
                    {stats?.bulkUploadStats.processingUploads || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    Failed
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    {stats?.bulkUploadStats.failedUploads || 0}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
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
              if (selectedUser) {
                handleUserVerification(selectedUser._id, 'reject');
              } else if (selectedLandToken) {
                handleLandTokenVerification(selectedLandToken._id, 'reject');
              }
            }}
          >
            Reject
          </Button>
          <Button
            color="success"
            variant="contained"
            onClick={() => {
              if (selectedUser) {
                handleUserVerification(selectedUser._id, 'verify');
              } else if (selectedLandToken) {
                handleLandTokenVerification(selectedLandToken._id, 'verify');
              }
            }}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={bulkUploadDialog} onClose={() => setBulkUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Upload Users</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Upload Type</InputLabel>
            <Select
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value)}
              label="Upload Type"
            >
              <MenuItem value="farmer">Farmers</MenuItem>
              <MenuItem value="buyer">Buyers</MenuItem>
              <MenuItem value="agronomist">Agronomists</MenuItem>
              <MenuItem value="investor">Investors</MenuItem>
              <MenuItem value="logistics">Logistics Providers</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => uploadType && downloadTemplate(uploadType)}
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
            onClick={handleBulkUpload}
            disabled={!uploadFile || !uploadType}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;