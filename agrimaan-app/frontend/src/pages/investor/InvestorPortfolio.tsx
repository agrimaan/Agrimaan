
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Paper,
  Tabs,
  Tab,
  Divider,
  Button,
  MenuItem,
  TextField,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import {
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';

// Mock data for portfolio
const mockPortfolioData = {
  totalInvestment: 405000,
  totalProjects: 5,
  averageROI: 12.17,
  allocationByType: [
    { type: 'Crop Farming', percentage: 45, amount: 182250 },
    { type: 'Vertical Farming', percentage: 25, amount: 101250 },
    { type: 'Hydroponics', percentage: 15, amount: 60750 },
    { type: 'Orchards', percentage: 15, amount: 60750 }
  ],
  allocationByRegion: [
    { region: 'North India', percentage: 30, amount: 121500 },
    { region: 'South India', percentage: 40, amount: 162000 },
    { region: 'East India', percentage: 15, amount: 60750 },
    { region: 'West India', percentage: 15, amount: 60750 }
  ],
  investments: [
    {
      id: 1,
      projectName: 'Organic Rice Farm',
      type: 'Crop Farming',
      region: 'North India',
      investmentAmount: 50000,
      currentValue: 55000,
      changePercentage: 10,
      status: 'Active'
    },
    {
      id: 2,
      projectName: 'Sustainable Wheat Cultivation',
      type: 'Crop Farming',
      region: 'North India',
      investmentAmount: 75000,
      currentValue: 82500,
      changePercentage: 10,
      status: 'Active'
    },
    {
      id: 3,
      projectName: 'Vertical Farming Initiative',
      type: 'Vertical Farming',
      region: 'South India',
      investmentAmount: 100000,
      currentValue: 115000,
      changePercentage: 15,
      status: 'Active'
    },
    {
      id: 4,
      projectName: 'Hydroponic Vegetable Project',
      type: 'Hydroponics',
      region: 'South India',
      investmentAmount: 60000,
      currentValue: 66000,
      changePercentage: 10,
      status: 'Active'
    },
    {
      id: 5,
      projectName: 'Mango Orchard Expansion',
      type: 'Orchards',
      region: 'East India',
      investmentAmount: 120000,
      currentValue: 138000,
      changePercentage: 15,
      status: 'Active'
    }
  ]
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
      id={`portfolio-tabpanel-${index}`}
      aria-labelledby={`portfolio-tab-${index}`}
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

const InvestorPortfolio: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [filterType, setFilterType] = useState('All');
  const [filterRegion, setFilterRegion] = useState('All');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Get unique types and regions for filters
  const projectTypes = ['All', ...Array.from(new Set(mockPortfolioData.investments.map(item => item.type)))];
  const projectRegions = ['All', ...Array.from(new Set(mockPortfolioData.investments.map(item => item.region)))];

  // Filter investments based on selected filters
  const filteredInvestments = mockPortfolioData.investments.filter(item => {
    const matchesType = filterType === 'All' || item.type === filterType;
    const matchesRegion = filterRegion === 'All' || item.region === filterRegion;
    return matchesType && matchesRegion;
  });

  // Calculate total current value of filtered investments
  const totalCurrentValue = filteredInvestments.reduce((sum, item) => sum + item.currentValue, 0);
  const totalInvestedAmount = filteredInvestments.reduce((sum, item) => sum + item.investmentAmount, 0);
  const overallGrowth = totalInvestedAmount > 0 ? ((totalCurrentValue - totalInvestedAmount) / totalInvestedAmount) * 100 : 0;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Page Header */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" component="h1" gutterBottom>
              Investment Portfolio
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
            Track and manage your agricultural investment portfolio
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
                \u20b9{mockPortfolioData.totalInvestment.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Across {mockPortfolioData.totalProjects} projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Current Value
              </Typography>
              <Typography variant="h4" component="div">
                \u20b9{totalCurrentValue.toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon sx={{ color: 'success.main', mr: 0.5 }} fontSize="small" />
                <Typography variant="body2" color="success.main">
                  {overallGrowth.toFixed(2)}% Growth
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Average ROI
              </Typography>
              <Typography variant="h4" component="div">
                {mockPortfolioData.averageROI}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Annual return on investment
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Portfolio Allocation Charts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Allocation by Project Type
              </Typography>
              
              {/* Placeholder for pie chart - in a real app, you would use a charting library */}
              <Box sx={{ height: 200, bgcolor: 'background.paper', p: 2, borderRadius: 1, border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">
                  Allocation by Project Type Chart would be displayed here
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Allocation breakdown */}
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Project Type</TableCell>
                      <TableCell align="right">Allocation</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockPortfolioData.allocationByType.map((item) => (
                      <TableRow key={item.type}>
                        <TableCell>{item.type}</TableCell>
                        <TableCell align="right">{item.percentage}%</TableCell>
                        <TableCell align="right">\u20b9{item.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Allocation by Region
              </Typography>
              
              {/* Placeholder for pie chart - in a real app, you would use a charting library */}
              <Box sx={{ height: 200, bgcolor: 'background.paper', p: 2, borderRadius: 1, border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">
                  Allocation by Region Chart would be displayed here
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Allocation breakdown */}
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Region</TableCell>
                      <TableCell align="right">Allocation</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockPortfolioData.allocationByRegion.map((item) => (
                      <TableRow key={item.region}>
                        <TableCell>{item.region}</TableCell>
                        <TableCell align="right">{item.percentage}%</TableCell>
                        <TableCell align="right">\u20b9{item.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Investments Table */}
        <Grid item xs={12}>
          <Paper sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="portfolio tabs">
                  <Tab label="All Investments" />
                  <Tab label="Active" />
                  <Tab label="Completed" />
                </Tabs>
                
                <Box display="flex" gap={2}>
                  <TextField
                    select
                    size="small"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    label="Project Type"
                    sx={{ width: 150 }}
                  >
                    {projectTypes.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </TextField>
                  
                  <TextField
                    select
                    size="small"
                    value={filterRegion}
                    onChange={(e) => setFilterRegion(e.target.value)}
                    label="Region"
                    sx={{ width: 150 }}
                  >
                    {projectRegions.map(region => (
                      <MenuItem key={region} value={region}>{region}</MenuItem>
                    ))}
                  </TextField>
                </Box>
              </Box>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="investments table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Project Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Region</TableCell>
                      <TableCell align="right">Investment Amount</TableCell>
                      <TableCell align="right">Current Value</TableCell>
                      <TableCell align="right">Change</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredInvestments.map((row) => (
                      <TableRow
                        key={row.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          {row.projectName}
                        </TableCell>
                        <TableCell>{row.type}</TableCell>
                        <TableCell>{row.region}</TableCell>
                        <TableCell align="right">\u20b9{row.investmentAmount.toLocaleString()}</TableCell>
                        <TableCell align="right">\u20b9{row.currentValue.toLocaleString()}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            {row.changePercentage > 0 ? (
                              <ArrowUpwardIcon fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />
                            ) : (
                              <ArrowDownwardIcon fontSize="small" sx={{ color: 'error.main', mr: 0.5 }} />
                            )}
                            <Typography
                              variant="body2"
                              color={row.changePercentage > 0 ? 'success.main' : 'error.main'}
                            >
                              {row.changePercentage}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              bgcolor: row.status === 'Active' ? 'success.light' : 'info.light',
                              color: row.status === 'Active' ? 'success.dark' : 'info.dark',
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
                <Table sx={{ minWidth: 650 }} aria-label="active investments table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Project Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Region</TableCell>
                      <TableCell align="right">Investment Amount</TableCell>
                      <TableCell align="right">Current Value</TableCell>
                      <TableCell align="right">Change</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredInvestments
                      .filter(row => row.status === 'Active')
                      .map((row) => (
                        <TableRow
                          key={row.id}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell component="th" scope="row">
                            {row.projectName}
                          </TableCell>
                          <TableCell>{row.type}</TableCell>
                          <TableCell>{row.region}</TableCell>
                          <TableCell align="right">\u20b9{row.investmentAmount.toLocaleString()}</TableCell>
                          <TableCell align="right">\u20b9{row.currentValue.toLocaleString()}</TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              {row.changePercentage > 0 ? (
                                <ArrowUpwardIcon fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />
                              ) : (
                                <ArrowDownwardIcon fontSize="small" sx={{ color: 'error.main', mr: 0.5 }} />
                              )}
                              <Typography
                                variant="body2"
                                color={row.changePercentage > 0 ? 'success.main' : 'error.main'}
                              >
                                {row.changePercentage}%
                              </Typography>
                            </Box>
                          </TableCell>
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
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No completed investments found
                </Typography>
              </Box>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default InvestorPortfolio;
