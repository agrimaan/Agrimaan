
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  LinearProgress,
  Divider,
  Button,
  MenuItem,
  TextField,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  MonetizationOn as MonetizationOnIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';

// Mock data for returns
const mockReturns = [
  {
    id: 1,
    projectName: 'Organic Rice Farm',
    investmentAmount: 50000,
    returnAmount: 5750,
    returnPercentage: 11.5,
    date: '2025-08-15',
    status: 'Paid'
  },
  {
    id: 2,
    projectName: 'Sustainable Wheat Cultivation',
    investmentAmount: 75000,
    returnAmount: 8250,
    returnPercentage: 11.0,
    date: '2025-08-01',
    status: 'Paid'
  },
  {
    id: 3,
    projectName: 'Vertical Farming Initiative',
    investmentAmount: 100000,
    returnAmount: 12500,
    returnPercentage: 12.5,
    date: '2025-09-15',
    status: 'Pending'
  },
  {
    id: 4,
    projectName: 'Hydroponic Vegetable Project',
    investmentAmount: 60000,
    returnAmount: 7200,
    returnPercentage: 12.0,
    date: '2025-09-30',
    status: 'Pending'
  },
  {
    id: 5,
    projectName: 'Mango Orchard Expansion',
    investmentAmount: 120000,
    returnAmount: 15600,
    returnPercentage: 13.0,
    date: '2025-07-20',
    status: 'Paid'
  }
];

// Summary data
const summaryData = {
  totalInvestment: 405000,
  totalReturns: 49300,
  averageROI: 12.17,
  projectedAnnualReturn: 58725,
  nextPayoutDate: '2025-09-15',
  nextPayoutAmount: 12500
};

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
      id={`returns-tabpanel-${index}`}
      aria-labelledby={`returns-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const InvestorReturns: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [filterYear, setFilterYear] = useState('2025');
  const [filterStatus, setFilterStatus] = useState('All');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Filter returns based on selected filters
  const filteredReturns = mockReturns.filter(item => {
    const matchesYear = item.date.startsWith(filterYear);
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    return matchesYear && matchesStatus;
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Page Header */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" component="h1" gutterBottom>
              Investment Returns
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />}
              sx={{ ml: 2 }}
            >
              Export Data
            </Button>
          </Box>
          <Typography variant="subtitle1" color="text.secondary" paragraph>
            Track and analyze your investment returns across all agricultural projects
          </Typography>
        </Grid>

        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Investment
              </Typography>
              <Typography variant="h4" component="div">
                \u20b9{summaryData.totalInvestment.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Across {mockReturns.length} projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Returns
              </Typography>
              <Typography variant="h4" component="div" sx={{ color: 'success.main' }}>
                \u20b9{summaryData.totalReturns.toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon sx={{ color: 'success.main', mr: 0.5 }} fontSize="small" />
                <Typography variant="body2" color="success.main">
                  {summaryData.averageROI}% Avg. ROI
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Next Payout
              </Typography>
              <Typography variant="h4" component="div">
                \u20b9{summaryData.nextPayoutAmount.toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <DateRangeIcon sx={{ mr: 0.5 }} fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  Expected on {new Date(summaryData.nextPayoutDate).toLocaleDateString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Returns Table with Tabs */}
        <Grid item xs={12}>
          <Paper sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="returns tabs">
                  <Tab label="All Returns" />
                  <Tab label="Paid" />
                  <Tab label="Pending" />
                </Tabs>
                
                <Box display="flex" gap={2}>
                  <TextField
                    select
                    size="small"
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    label="Year"
                    sx={{ width: 100 }}
                  >
                    <MenuItem value="2023">2023</MenuItem>
                    <MenuItem value="2024">2024</MenuItem>
                    <MenuItem value="2025">2025</MenuItem>
                  </TextField>
                  
                  <TextField
                    select
                    size="small"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Status"
                    sx={{ width: 120 }}
                  >
                    <MenuItem value="All">All Status</MenuItem>
                    <MenuItem value="Paid">Paid</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                  </TextField>
                </Box>
              </Box>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="returns table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Project Name</TableCell>
                      <TableCell align="right">Investment Amount</TableCell>
                      <TableCell align="right">Return Amount</TableCell>
                      <TableCell align="right">ROI %</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredReturns.map((row) => (
                      <TableRow
                        key={row.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          {row.projectName}
                        </TableCell>
                        <TableCell align="right">\u20b9{row.investmentAmount.toLocaleString()}</TableCell>
                        <TableCell align="right">\u20b9{row.returnAmount.toLocaleString()}</TableCell>
                        <TableCell align="right">{row.returnPercentage}%</TableCell>
                        <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              bgcolor: row.status === 'Paid' ? 'success.light' : 'warning.light',
                              color: row.status === 'Paid' ? 'success.dark' : 'warning.dark',
                            }}
                          >
                            {row.status}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="paid returns table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Project Name</TableCell>
                      <TableCell align="right">Investment Amount</TableCell>
                      <TableCell align="right">Return Amount</TableCell>
                      <TableCell align="right">ROI %</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredReturns
                      .filter(row => row.status === 'Paid')
                      .map((row) => (
                        <TableRow
                          key={row.id}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell component="th" scope="row">
                            {row.projectName}
                          </TableCell>
                          <TableCell align="right">\u20b9{row.investmentAmount.toLocaleString()}</TableCell>
                          <TableCell align="right">\u20b9{row.returnAmount.toLocaleString()}</TableCell>
                          <TableCell align="right">{row.returnPercentage}%</TableCell>
                          <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: 'inline-block',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                bgcolor: 'success.light',
                                color: 'success.dark',
                              }}
                            >
                              {row.status}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="pending returns table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Project Name</TableCell>
                      <TableCell align="right">Investment Amount</TableCell>
                      <TableCell align="right">Expected Return</TableCell>
                      <TableCell align="right">Projected ROI %</TableCell>
                      <TableCell>Expected Date</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredReturns
                      .filter(row => row.status === 'Pending')
                      .map((row) => (
                        <TableRow
                          key={row.id}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell component="th" scope="row">
                            {row.projectName}
                          </TableCell>
                          <TableCell align="right">\u20b9{row.investmentAmount.toLocaleString()}</TableCell>
                          <TableCell align="right">\u20b9{row.returnAmount.toLocaleString()}</TableCell>
                          <TableCell align="right">{row.returnPercentage}%</TableCell>
                          <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: 'inline-block',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                bgcolor: 'warning.light',
                                color: 'warning.dark',
                              }}
                            >
                              {row.status}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
          </Paper>
        </Grid>
        
        {/* Annual Returns Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Annual Returns Projection
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Based on your current investments, your projected annual return is \u20b9{summaryData.projectedAnnualReturn.toLocaleString()}
              </Typography>
              
              {/* Placeholder for chart - in a real app, you would use a charting library */}
              <Box sx={{ height: 200, bgcolor: 'background.paper', p: 2, borderRadius: 1, border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">
                  Annual Returns Chart would be displayed here
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default InvestorReturns;
