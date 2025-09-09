
import React, { useState } from 'react';
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
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  GetApp as DownloadIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

// Mock data for order history
const mockOrders = [
  {
    id: 'ORD-2025-001',
    date: '2025-08-15',
    items: [
      { name: 'Organic Rice', quantity: 50, unit: 'kg', price: 3500 },
      { name: 'Red Lentils', quantity: 20, unit: 'kg', price: 1800 }
    ],
    totalAmount: 5300,
    status: 'Delivered',
    paymentMethod: 'Credit Card',
    deliveryAddress: '123 Main St, Delhi, 110001',
    deliveryDate: '2025-08-18'
  },
  {
    id: 'ORD-2025-002',
    date: '2025-07-22',
    items: [
      { name: 'Wheat Flour', quantity: 25, unit: 'kg', price: 1250 },
      { name: 'Organic Vegetables Assorted', quantity: 10, unit: 'kg', price: 1500 }
    ],
    totalAmount: 2750,
    status: 'Delivered',
    paymentMethod: 'UPI',
    deliveryAddress: '123 Main St, Delhi, 110001',
    deliveryDate: '2025-07-25'
  },
  {
    id: 'ORD-2025-003',
    date: '2025-06-10',
    items: [
      { name: 'Basmati Rice', quantity: 30, unit: 'kg', price: 3600 },
      { name: 'Organic Potatoes', quantity: 15, unit: 'kg', price: 750 }
    ],
    totalAmount: 4350,
    status: 'Delivered',
    paymentMethod: 'Bank Transfer',
    deliveryAddress: '123 Main St, Delhi, 110001',
    deliveryDate: '2025-06-13'
  },
  {
    id: 'ORD-2025-004',
    date: '2025-05-05',
    items: [
      { name: 'Organic Tomatoes', quantity: 20, unit: 'kg', price: 1200 },
      { name: 'Organic Onions', quantity: 25, unit: 'kg', price: 1000 }
    ],
    totalAmount: 2200,
    status: 'Delivered',
    paymentMethod: 'Credit Card',
    deliveryAddress: '123 Main St, Delhi, 110001',
    deliveryDate: '2025-05-08'
  },
  {
    id: 'ORD-2025-005',
    date: '2025-04-18',
    items: [
      { name: 'Organic Apples', quantity: 15, unit: 'kg', price: 1800 },
      { name: 'Organic Mangoes', quantity: 10, unit: 'kg', price: 2000 }
    ],
    totalAmount: 3800,
    status: 'Delivered',
    paymentMethod: 'UPI',
    deliveryAddress: '123 Main St, Delhi, 110001',
    deliveryDate: '2025-04-21'
  }
];

const OrderHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDate, setFilterDate] = useState('All Time');

  // Filter orders based on search term and filters
  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
    
    // Simple date filtering logic
    let matchesDate = true;
    if (filterDate === 'Last Month') {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const orderDate = new Date(order.date);
      matchesDate = orderDate >= lastMonth;
    } else if (filterDate === 'Last 3 Months') {
      const last3Months = new Date();
      last3Months.setMonth(last3Months.getMonth() - 3);
      const orderDate = new Date(order.date);
      matchesDate = orderDate >= last3Months;
    } else if (filterDate === 'Last 6 Months') {
      const last6Months = new Date();
      last6Months.setMonth(last6Months.getMonth() - 6);
      const orderDate = new Date(order.date);
      matchesDate = orderDate >= last6Months;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate total spent
  const totalSpent = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Page Header */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" component="h1" gutterBottom>
              Order History
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />}
            >
              Export History
            </Button>
          </Box>
          <Typography variant="subtitle1" color="text.secondary" paragraph>
            View and manage your past orders
          </Typography>
        </Grid>

        {/* Summary Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Total Orders
                    </Typography>
                    <Typography variant="h4">
                      {filteredOrders.length}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Total Spent
                    </Typography>
                    <Typography variant="h4">
                      \u20b9{totalSpent.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Average Order Value
                    </Typography>
                    <Typography variant="h4">
                      \u20b9{filteredOrders.length > 0 ? Math.round(totalSpent / filteredOrders.length).toLocaleString() : 0}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Search and Filters */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search orders by ID or product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="All">All Statuses</MenuItem>
                  <MenuItem value="Delivered">Delivered</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                  <MenuItem value="Returned">Returned</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  label="Time Period"
                >
                  <MenuItem value="All Time">All Time</MenuItem>
                  <MenuItem value="Last Month">Last Month</MenuItem>
                  <MenuItem value="Last 3 Months">Last 3 Months</MenuItem>
                  <MenuItem value="Last 6 Months">Last 6 Months</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Orders Table */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="order history table">
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell align="right">Total Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {order.id}
                    </TableCell>
                    <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.items.map(item => item.name).join(', ')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.items.length} items
                      </Typography>
                    </TableCell>
                    <TableCell align="right">\u20b9{order.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status} 
                        color={
                          order.status === 'Delivered' ? 'success' : 
                          order.status === 'Cancelled' ? 'error' : 
                          'warning'
                        } 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Order Details">
                        <IconButton 
                          component={RouterLink} 
                          to={`/buyer/orders/${order.id}`}
                          size="small"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download Invoice">
                        <IconButton size="small">
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Box textAlign="center">
                        <HistoryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No orders found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Try adjusting your search or filter criteria
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrderHistory;
