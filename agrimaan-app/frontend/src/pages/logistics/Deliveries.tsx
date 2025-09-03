import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  AcUnit as AcUnitIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

// This is a placeholder component for the Deliveries page
// In a real implementation, this would fetch data from the API

const Deliveries: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  // Mock data - in a real implementation, this would come from an API
  const mockDeliveries = [
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
    }
  ];

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

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Deliveries
        </Typography>
        
        <Button
          component={RouterLink}
          to="/logistics/available-requests"
          variant="contained"
        >
          Find New Deliveries
        </Button>
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
          <Tab label="All Deliveries" />
          <Tab label="Pending" />
          <Tab label="Accepted" />
          <Tab label="In Transit" />
          <Tab label="Delivered" />
        </Tabs>
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="Search Deliveries"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                label="Date Range"
                value="7days"
              >
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="7days">Last 7 Days</MenuItem>
                <MenuItem value="30days">Last 30 Days</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<SearchIcon />}
            >
              Search
            </Button>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Deliveries Table */}
      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : mockDeliveries.length === 0 ? (
          <Alert severity="info">
            No deliveries found matching your criteria.
          </Alert>
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
                {mockDeliveries.map((delivery) => (
                  <TableRow key={delivery._id}>
                    <TableCell>{delivery._id}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{delivery.pickup.location}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(delivery.pickup.scheduledTime)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{delivery.delivery.location}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(delivery.delivery.scheduledTime)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{delivery.cargo.description}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {delivery.cargo.weight}kg
                        </Typography>
                        {delivery.cargo.requiresRefrigeration && (
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
                        label={delivery.status.replace('_', ' ').charAt(0).toUpperCase() + delivery.status.replace('_', ' ').slice(1)} 
                        color={getStatusColor(delivery.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">₹{delivery.payment.amount}</Typography>
                      <Chip 
                        label={delivery.payment.status} 
                        color={delivery.payment.status === 'completed' ? 'success' : 'warning'} 
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        component={RouterLink}
                        to={`/logistics/deliveries/${delivery._id}`}
                        variant="outlined"
                        size="small"
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

        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 3 }}>
          <Pagination count={1} color="primary" />
        </Box>
      </Paper>
    </Container>
  );
};

export default Deliveries;