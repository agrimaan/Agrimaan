import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tabs,
  Tab,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Divider
} from '@mui/material';
import {
  AttachMoney as AttachMoneyIcon,
  CalendarToday as CalendarTodayIcon,
  FilterList as FilterListIcon,
  GetApp as GetAppIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  LocalShipping as LocalShippingIcon
} from '@mui/icons-material';
import { RootState } from '../../store';
//import { DatePicker } from '@mui/x-date-pickers/DatePicker';
//import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
//import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';

import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Chart components
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Define types
interface Transaction {
  id: string;
  date: string;
  orderId: string;
  customer: string;
  service: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Processing' | 'Failed';
  paymentMethod: string;
}

interface EarningsSummary {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  totalEarnings: number;
  pendingPayments: number;
  completedDeliveries: number;
  averagePerDelivery: number;
}

interface ChartData {
  name: string;
  earnings: number;
  deliveries: number;
}

// Mock data
const mockTransactions: Transaction[] = [
  {
    id: 'TRX-001',
    date: '2025-09-05',
    orderId: 'ORD-1234',
    customer: 'Farmer Singh',
    service: 'Crop Delivery',
    amount: 1200,
    status: 'Completed',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 'TRX-002',
    date: '2025-09-04',
    orderId: 'ORD-1235',
    customer: 'Green Valley Co-op',
    service: 'Warehouse Transport',
    amount: 1800,
    status: 'Completed',
    paymentMethod: 'Credit Card'
  },
  {
    id: 'TRX-003',
    date: '2025-09-03',
    orderId: 'ORD-1236',
    customer: 'Buyer Kumar',
    service: 'Express Delivery',
    amount: 950,
    status: 'Pending',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 'TRX-004',
    date: '2025-09-02',
    orderId: 'ORD-1237',
    customer: 'Orchard Valley',
    service: 'Cold Storage Transport',
    amount: 2200,
    status: 'Completed',
    paymentMethod: 'Digital Wallet'
  },
  {
    id: 'TRX-005',
    date: '2025-09-01',
    orderId: 'ORD-1238',
    customer: 'Asian Farms Co.',
    service: 'Bulk Transport',
    amount: 3100,
    status: 'Processing',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 'TRX-006',
    date: '2025-08-31',
    orderId: 'ORD-1239',
    customer: 'Midwest Farms',
    service: 'Standard Delivery',
    amount: 850,
    status: 'Completed',
    paymentMethod: 'Credit Card'
  },
  {
    id: 'TRX-007',
    date: '2025-08-30',
    orderId: 'ORD-1240',
    customer: 'John Smith Farm',
    service: 'Express Delivery',
    amount: 1100,
    status: 'Completed',
    paymentMethod: 'Digital Wallet'
  },
  {
    id: 'TRX-008',
    date: '2025-08-29',
    orderId: 'ORD-1241',
    customer: 'Fresh Produce Inc.',
    service: 'Cold Storage Transport',
    amount: 1950,
    status: 'Failed',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 'TRX-009',
    date: '2025-08-28',
    orderId: 'ORD-1242',
    customer: 'Farmer Singh',
    service: 'Bulk Transport',
    amount: 2800,
    status: 'Completed',
    paymentMethod: 'Credit Card'
  },
  {
    id: 'TRX-010',
    date: '2025-08-27',
    orderId: 'ORD-1243',
    customer: 'Green Valley Co-op',
    service: 'Standard Delivery',
    amount: 750,
    status: 'Pending',
    paymentMethod: 'Bank Transfer'
  }
];

const mockEarningsSummary: EarningsSummary = {
  daily: 1200,
  weekly: 8650,
  monthly: 32500,
  yearly: 387000,
  totalEarnings: 387000,
  pendingPayments: 4800,
  completedDeliveries: 245,
  averagePerDelivery: 1580
};

const mockChartData: ChartData[] = [
  { name: 'Aug 1', earnings: 1200, deliveries: 5 },
  { name: 'Aug 8', earnings: 1900, deliveries: 8 },
  { name: 'Aug 15', earnings: 2800, deliveries: 12 },
  { name: 'Aug 22', earnings: 3100, deliveries: 15 },
  { name: 'Aug 29', earnings: 2500, deliveries: 10 },
  { name: 'Sep 5', earnings: 3500, deliveries: 18 }
];

const Earnings: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [earningsSummary, setEarningsSummary] = useState<EarningsSummary>(mockEarningsSummary);
  const [chartData, setChartData] = useState<ChartData[]>(mockChartData);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    // Filter by status
    const matchesStatus = filterStatus === 'All' || transaction.status === filterStatus;
    
    // Filter by search term
    const matchesSearch = 
      transaction.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by date range
    let matchesDateRange = true;
    if (startDate && endDate) {
      const transactionDate = new Date(transaction.date);
      matchesDateRange = transactionDate >= startDate && transactionDate <= endDate;
    }
    
    return matchesStatus && matchesSearch && matchesDateRange;
  });

  // Export transactions as CSV
  const exportTransactions = () => {
    const headers = ['ID', 'Date', 'Order ID', 'Customer', 'Service', 'Amount', 'Status', 'Payment Method'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => 
        [t.id, t.date, t.orderId, t.customer, t.service, t.amount, t.status, t.paymentMethod].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `earnings_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Processing':
        return 'info';
      case 'Failed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Earnings
        </Typography>
        <Button
          variant="outlined"
          startIcon={<GetAppIcon />}
          onClick={exportTransactions}
        >
          Export Report
        </Button>
      </Box>

      {/* Earnings Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Earnings
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h4" component="div">
                  ${earningsSummary.totalEarnings.toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Pending Payments
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountBalanceIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h4" component="div">
                  ${earningsSummary.pendingPayments.toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Completed Deliveries
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalShippingIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h4" component="div">
                  {earningsSummary.completedDeliveries}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Average Per Delivery
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h4" component="div">
                  ${earningsSummary.averagePerDelivery.toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Time Period Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Daily" />
          <Tab label="Weekly" />
          <Tab label="Monthly" />
          <Tab label="Yearly" />
        </Tabs>
        <Box p={3}>
          <Typography variant="h5" gutterBottom>
            {tabValue === 0 && `Daily Earnings: $${earningsSummary.daily.toLocaleString()}`}
            {tabValue === 1 && `Weekly Earnings: $${earningsSummary.weekly.toLocaleString()}`}
            {tabValue === 2 && `Monthly Earnings: $${earningsSummary.monthly.toLocaleString()}`}
            {tabValue === 3 && `Yearly Earnings: $${earningsSummary.yearly.toLocaleString()}`}
          </Typography>
          
          {/* Chart */}
          <Box sx={{ height: 300, mt: 3 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="earnings" stroke="#8884d8" activeDot={{ r: 8 }} name="Earnings ($)" />
                <Line yAxisId="right" type="monotone" dataKey="deliveries" stroke="#82ca9d" name="Deliveries" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </Paper>

      {/* Transactions */}
      <Paper sx={{ mb: 4 }}>
        <Box p={3}>
          <Typography variant="h5" gutterBottom>
            Transaction History
          </Typography>
          
          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Search by customer, order ID, or service"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="All">All Statuses</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Processing">Processing</MenuItem>
                  <MenuItem value="Failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
          
          {/* Transactions Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Payment Method</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.orderId}</TableCell>
                      <TableCell>{transaction.customer}</TableCell>
                      <TableCell>{transaction.service}</TableCell>
                      <TableCell align="right">${transaction.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label={transaction.status} 
                          color={getStatusColor(transaction.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{transaction.paymentMethod}</TableCell>
                    </TableRow>
                  ))}
                {filteredTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No transactions found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredTransactions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Paper>

      {/* Payment Methods Summary */}
      <Paper>
        <Box p={3}>
          <Typography variant="h5" gutterBottom>
            Payment Methods Summary
          </Typography>
          <Box sx={{ height: 300, mt: 3 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Bank Transfer', value: 8050 },
                  { name: 'Credit Card', value: 5350 },
                  { name: 'Digital Wallet', value: 3300 },
                  { name: 'Cash', value: 1500 }
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                <Legend />
                <Bar dataKey="value" name="Amount ($)" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Earnings;