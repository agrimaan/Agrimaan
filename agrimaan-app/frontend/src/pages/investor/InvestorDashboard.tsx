import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Assessment as AssessmentIcon,
  MonetizationOn as MonetizationOnIcon,
  Agriculture as AgricultureIcon,
  Business as BusinessIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { RootState } from '../agronomist/store';

// Chart components
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Define types
interface Investment {
  id: string;
  farmerId: string;
  farmerName: string;
  projectName: string;
  amount: number;
  date: string;
  duration: number; // in months
  returnRate: number; // annual percentage
  status: 'active' | 'completed' | 'pending';
  category: 'crop' | 'equipment' | 'infrastructure';
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  projectedReturn: number;
  actualReturn?: number;
  nextPaymentDate?: string;
}

interface InvestmentSummary {
  totalInvested: number;
  activeInvestments: number;
  completedInvestments: number;
  pendingInvestments: number;
  totalReturns: number;
  projectedAnnualReturn: number;
  averageReturnRate: number;
  portfolioDistribution: {
    crop: number;
    equipment: number;
    infrastructure: number;
  };
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
}

interface FarmProject {
  id: string;
  farmerId: string;
  farmerName: string;
  projectName: string;
  description: string;
  fundingGoal: number;
  fundingRaised: number;
  duration: number; // in months
  returnRate: number; // annual percentage
  startDate: string;
  endDate: string;
  category: 'crop' | 'equipment' | 'infrastructure';
  riskLevel: 'low' | 'medium' | 'high';
  location: string;
  status: 'open' | 'funded' | 'completed';
  investorCount: number;
}

// Mock data
const mockInvestments: Investment[] = [
  {
    id: 'INV-001',
    farmerId: 'FARM-123',
    farmerName: 'Farmer Singh',
    projectName: 'Wheat Cultivation Expansion',
    amount: 50000,
    date: '2025-01-15',
    duration: 6,
    returnRate: 12,
    status: 'active',
    category: 'crop',
    description: 'Expansion of wheat cultivation area by 20 acres',
    riskLevel: 'low',
    projectedReturn: 53000,
    nextPaymentDate: '2025-07-15'
  },
  {
    id: 'INV-002',
    farmerId: 'FARM-456',
    farmerName: 'Green Valley Co-op',
    projectName: 'Irrigation System Upgrade',
    amount: 75000,
    date: '2024-11-20',
    duration: 12,
    returnRate: 15,
    status: 'active',
    category: 'infrastructure',
    description: 'Installation of drip irrigation system for water conservation',
    riskLevel: 'medium',
    projectedReturn: 86250,
    nextPaymentDate: '2025-11-20'
  },
  {
    id: 'INV-003',
    farmerId: 'FARM-789',
    farmerName: 'Organic Farms Ltd',
    projectName: 'Organic Certification',
    amount: 30000,
    date: '2024-08-05',
    duration: 9,
    returnRate: 14,
    status: 'active',
    category: 'infrastructure',
    description: 'Obtaining organic certification for 50 acres of farmland',
    riskLevel: 'low',
    projectedReturn: 33150,
    nextPaymentDate: '2025-05-05'
  },
  {
    id: 'INV-004',
    farmerId: 'FARM-234',
    farmerName: 'Midwest Farms',
    projectName: 'Harvester Purchase',
    amount: 120000,
    date: '2024-06-10',
    duration: 24,
    returnRate: 18,
    status: 'active',
    category: 'equipment',
    description: 'Purchase of modern harvester for increased efficiency',
    riskLevel: 'medium',
    projectedReturn: 163200,
    nextPaymentDate: '2025-06-10'
  },
  {
    id: 'INV-005',
    farmerId: 'FARM-567',
    farmerName: 'Rice Growers Association',
    projectName: 'Rice Processing Unit',
    amount: 200000,
    date: '2023-12-15',
    duration: 36,
    returnRate: 20,
    status: 'active',
    category: 'equipment',
    description: 'Setting up a rice processing unit for value addition',
    riskLevel: 'high',
    projectedReturn: 320000,
    nextPaymentDate: '2025-12-15'
  },
  {
    id: 'INV-006',
    farmerId: 'FARM-890',
    farmerName: 'Apple Orchards Inc',
    projectName: 'Apple Storage Facility',
    amount: 80000,
    date: '2024-03-20',
    duration: 18,
    returnRate: 16,
    status: 'active',
    category: 'infrastructure',
    description: 'Construction of temperature-controlled storage facility',
    riskLevel: 'medium',
    projectedReturn: 99200,
    nextPaymentDate: '2025-09-20'
  },
  {
    id: 'INV-007',
    farmerId: 'FARM-345',
    farmerName: 'Vegetable Growers Co-op',
    projectName: 'Greenhouse Construction',
    amount: 150000,
    date: '2023-09-05',
    duration: 30,
    returnRate: 22,
    status: 'active',
    category: 'infrastructure',
    description: 'Construction of modern greenhouse for year-round production',
    riskLevel: 'high',
    projectedReturn: 227500,
    nextPaymentDate: '2025-09-05'
  },
  {
    id: 'INV-008',
    farmerId: 'FARM-678',
    farmerName: 'Dairy Farm Enterprises',
    projectName: 'Dairy Processing Equipment',
    amount: 100000,
    date: '2024-02-15',
    duration: 24,
    returnRate: 17,
    status: 'active',
    category: 'equipment',
    description: 'Purchase of dairy processing equipment for value addition',
    riskLevel: 'medium',
    projectedReturn: 134000,
    nextPaymentDate: '2025-02-15'
  },
  {
    id: 'INV-009',
    farmerId: 'FARM-901',
    farmerName: 'Sugarcane Growers Ltd',
    projectName: 'Sugarcane Cultivation',
    amount: 60000,
    date: '2024-05-10',
    duration: 12,
    returnRate: 13,
    status: 'active',
    category: 'crop',
    description: 'Expansion of sugarcane cultivation area by 15 acres',
    riskLevel: 'low',
    projectedReturn: 67800,
    nextPaymentDate: '2025-05-10'
  },
  {
    id: 'INV-010',
    farmerId: 'FARM-234',
    farmerName: 'Potato Farmers Association',
    projectName: 'Cold Storage Facility',
    amount: 90000,
    date: '2024-01-20',
    duration: 18,
    returnRate: 15,
    status: 'active',
    category: 'infrastructure',
    description: 'Construction of cold storage facility for potatoes',
    riskLevel: 'medium',
    projectedReturn: 110250,
    nextPaymentDate: '2025-07-20'
  }
];

const mockFarmProjects: FarmProject[] = [
  {
    id: 'PROJ-001',
    farmerId: 'FARM-123',
    farmerName: 'Farmer Singh',
    projectName: 'Organic Vegetable Farm Expansion',
    description: 'Expanding organic vegetable farm by 15 acres with new irrigation system',
    fundingGoal: 100000,
    fundingRaised: 65000,
    duration: 12,
    returnRate: 14,
    startDate: '2025-10-01',
    endDate: '2026-09-30',
    category: 'crop',
    riskLevel: 'medium',
    location: 'Punjab, India',
    status: 'open',
    investorCount: 8
  },
  {
    id: 'PROJ-002',
    farmerId: 'FARM-456',
    farmerName: 'Green Valley Co-op',
    projectName: 'Solar-Powered Irrigation System',
    description: 'Installation of solar-powered irrigation system for 50 acres',
    fundingGoal: 150000,
    fundingRaised: 120000,
    duration: 24,
    returnRate: 16,
    startDate: '2025-11-15',
    endDate: '2027-11-14',
    category: 'infrastructure',
    riskLevel: 'low',
    location: 'Gujarat, India',
    status: 'open',
    investorCount: 12
  },
  {
    id: 'PROJ-003',
    farmerId: 'FARM-789',
    farmerName: 'Organic Farms Ltd',
    projectName: 'Fruit Processing Unit',
    description: 'Setting up a fruit processing unit for value addition',
    fundingGoal: 200000,
    fundingRaised: 180000,
    duration: 36,
    returnRate: 18,
    startDate: '2025-12-01',
    endDate: '2028-11-30',
    category: 'equipment',
    riskLevel: 'medium',
    location: 'Maharashtra, India',
    status: 'open',
    investorCount: 15
  },
  {
    id: 'PROJ-004',
    farmerId: 'FARM-234',
    farmerName: 'Midwest Farms',
    projectName: 'Greenhouse Expansion',
    description: 'Expansion of greenhouse facilities for year-round production',
    fundingGoal: 120000,
    fundingRaised: 90000,
    duration: 18,
    returnRate: 15,
    startDate: '2025-10-15',
    endDate: '2027-04-14',
    category: 'infrastructure',
    riskLevel: 'low',
    location: 'Haryana, India',
    status: 'open',
    investorCount: 10
  },
  {
    id: 'PROJ-005',
    farmerId: 'FARM-567',
    farmerName: 'Rice Growers Association',
    projectName: 'Modern Rice Milling Unit',
    description: 'Setting up a modern rice milling unit for better quality and higher yield',
    fundingGoal: 250000,
    fundingRaised: 150000,
    duration: 30,
    returnRate: 20,
    startDate: '2025-11-01',
    endDate: '2028-04-30',
    category: 'equipment',
    riskLevel: 'high',
    location: 'West Bengal, India',
    status: 'open',
    investorCount: 18
  }
];

const InvestorDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [investments, setInvestments] = useState<Investment[]>(mockInvestments);
  const [farmProjects, setFarmProjects] = useState<FarmProject[]>(mockFarmProjects);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Calculate investment summary
  const investmentSummary: InvestmentSummary = {
    totalInvested: investments.reduce((sum, inv) => sum + inv.amount, 0),
    activeInvestments: investments.filter(inv => inv.status === 'active').length,
    completedInvestments: investments.filter(inv => inv.status === 'completed').length,
    pendingInvestments: investments.filter(inv => inv.status === 'pending').length,
    totalReturns: investments.reduce((sum, inv) => sum + (inv.actualReturn || 0), 0),
    projectedAnnualReturn: investments.reduce((sum, inv) => sum + (inv.projectedReturn - inv.amount), 0),
    averageReturnRate: investments.reduce((sum, inv) => sum + inv.returnRate, 0) / investments.length,
    portfolioDistribution: {
      crop: investments.filter(inv => inv.category === 'crop').reduce((sum, inv) => sum + inv.amount, 0),
      equipment: investments.filter(inv => inv.category === 'equipment').reduce((sum, inv) => sum + inv.amount, 0),
      infrastructure: investments.filter(inv => inv.category === 'infrastructure').reduce((sum, inv) => sum + inv.amount, 0)
    },
    riskDistribution: {
      low: investments.filter(inv => inv.riskLevel === 'low').reduce((sum, inv) => sum + inv.amount, 0),
      medium: investments.filter(inv => inv.riskLevel === 'medium').reduce((sum, inv) => sum + inv.amount, 0),
      high: investments.filter(inv => inv.riskLevel === 'high').reduce((sum, inv) => sum + inv.amount, 0)
    }
  };

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
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

  // Get risk level color
  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'crop':
        return 'primary';
      case 'equipment':
        return 'secondary';
      case 'infrastructure':
        return 'info';
      default:
        return 'default';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'open':
        return 'success';
      case 'completed':
      case 'funded':
        return 'info';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Calculate funding percentage
  const calculateFundingPercentage = (raised: number, goal: number) => {
    return Math.min(Math.round((raised / goal) * 100), 100);
  };

  // Prepare chart data
  const portfolioDistributionData = [
    { name: 'Crop', value: investmentSummary.portfolioDistribution.crop },
    { name: 'Equipment', value: investmentSummary.portfolioDistribution.equipment },
    { name: 'Infrastructure', value: investmentSummary.portfolioDistribution.infrastructure }
  ];

  const riskDistributionData = [
    { name: 'Low Risk', value: investmentSummary.riskDistribution.low },
    { name: 'Medium Risk', value: investmentSummary.riskDistribution.medium },
    { name: 'High Risk', value: investmentSummary.riskDistribution.high }
  ];

  const monthlyReturnsData = [
    { name: 'Jan', returns: 12000 },
    { name: 'Feb', returns: 15000 },
    { name: 'Mar', returns: 18000 },
    { name: 'Apr', returns: 16000 },
    { name: 'May', returns: 21000 },
    { name: 'Jun', returns: 19000 },
    { name: 'Jul', returns: 22000 },
    { name: 'Aug', returns: 25000 },
    { name: 'Sep', returns: 23000 }
  ];

  // Colors for pie charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Investor Dashboard
        </Typography>
        
        <Box>
          <Button
            component={RouterLink}
            to="/investor/projects"
            variant="outlined"
            startIcon={<AgricultureIcon />}
            sx={{ mr: 1 }}
          >
            Browse Projects
          </Button>
          <Button
            component={RouterLink}
            to="/investor/portfolio"
            variant="contained"
            startIcon={<AssessmentIcon />}
          >
            My Portfolio
          </Button>
        </Box>
      </Box>

      {/* Welcome Card */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Welcome, {user?.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your agricultural investments, monitor returns, and discover new farming projects to invest in.
        </Typography>
      </Paper>

      {/* Investment Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Invested
                  </Typography>
                  <Typography variant="h4" component="div">
                    {formatCurrency(investmentSummary.totalInvested)}
                  </Typography>
                </Box>
                <AccountBalanceIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Across {investments.length} investments
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Projected Annual Return
                  </Typography>
                  <Typography variant="h4" component="div" color="success.main">
                    {formatCurrency(investmentSummary.projectedAnnualReturn)}
                  </Typography>
                </Box>
                <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Avg. Rate: {investmentSummary.averageReturnRate.toFixed(1)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Active Investments
                  </Typography>
                  <Typography variant="h4" component="div">
                    {investmentSummary.activeInvestments}
                  </Typography>
                </Box>
                <BusinessIcon color="info" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Button
                  component={RouterLink}
                  to="/investor/investments"
                  size="small"
                  color="primary"
                >
                  View Details
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Available Projects
                  </Typography>
                  <Typography variant="h4" component="div">
                    {farmProjects.length}
                  </Typography>
                </Box>
                <AgricultureIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Button
                  component={RouterLink}
                  to="/investor/projects"
                  size="small"
                  color="primary"
                >
                  Browse Projects
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Portfolio Analysis */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Portfolio Analysis
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={3}>
          {/* Portfolio Distribution */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" align="center" gutterBottom>
              Investment by Category
            </Typography>
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolioDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent ?? 0)* 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {portfolioDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
          
          {/* Risk Distribution */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" align="center" gutterBottom>
              Investment by Risk Level
            </Typography>
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
          
          {/* Monthly Returns */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" align="center" gutterBottom>
              Monthly Returns (2025)
            </Typography>
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyReturnsData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="returns" fill="#8884d8" name="Returns" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs for Investments and Projects */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="My Investments" />
          <Tab label="Available Projects" />
        </Tabs>
        
        {/* My Investments Tab */}
        {tabValue === 0 && (
          <Box p={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Investments
              </Typography>
              <Button
                component={RouterLink}
                to="/investor/investments"
                endIcon={<AssessmentIcon />}
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Project</TableCell>
                      <TableCell>Farmer</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Return Rate</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Risk</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {investments.slice(0, 5).map((investment) => (
                      <TableRow key={investment.id}>
                        <TableCell>
                          <Typography variant="body2">{investment.projectName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Invested on {formatDate(investment.date)}
                          </Typography>
                        </TableCell>
                        <TableCell>{investment.farmerName}</TableCell>
                        <TableCell>{formatCurrency(investment.amount)}</TableCell>
                        <TableCell>{investment.returnRate}%</TableCell>
                        <TableCell>{investment.duration} months</TableCell>
                        <TableCell>
                          <Chip 
                            label={investment.category} 
                            color={getCategoryColor(investment.category) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={investment.riskLevel} 
                            color={getRiskLevelColor(investment.riskLevel) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={investment.status} 
                            color={getStatusColor(investment.status) as any}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
        
        {/* Available Projects Tab */}
        {tabValue === 1 && (
          <Box p={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Featured Investment Opportunities
              </Typography>
              <Button
                component={RouterLink}
                to="/investor/projects"
                endIcon={<AgricultureIcon />}
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <Grid container spacing={3}>
                {farmProjects.slice(0, 3).map((project) => (
                  <Grid item xs={12} md={4} key={project.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {project.projectName}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          <Chip 
                            label={project.category} 
                            color={getCategoryColor(project.category) as any} 
                            size="small" 
                          />
                          <Chip 
                            label={`${project.riskLevel} risk`} 
                            color={getRiskLevelColor(project.riskLevel) as any} 
                            size="small" 
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {project.description}
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" gutterBottom>
                            Funding Progress: {calculateFundingPercentage(project.fundingRaised, project.fundingGoal)}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={calculateFundingPercentage(project.fundingRaised, project.fundingGoal)} 
                            sx={{ height: 8, borderRadius: 5 }}
                          />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {formatCurrency(project.fundingRaised)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatCurrency(project.fundingGoal)}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Return Rate:</Typography>
                          <Typography variant="body2" color="success.main">{project.returnRate}%</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Duration:</Typography>
                          <Typography variant="body2">{project.duration} months</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Farmer:</Typography>
                          <Typography variant="body2">{project.farmerName}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Location:</Typography>
                          <Typography variant="body2">{project.location}</Typography>
                        </Box>
                      </CardContent>
                      <Box sx={{ p: 2, pt: 0 }}>
                        <Button 
                          variant="contained" 
                          fullWidth
                          component={RouterLink}
                          to={`/investor/projects/${project.id}`}
                        >
                          Invest Now
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </Paper>

      {/* Upcoming Payments */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Upcoming Payments
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Project</TableCell>
                  <TableCell>Farmer</TableCell>
                  <TableCell>Payment Date</TableCell>
                  <TableCell align="right">Expected Amount</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {investments
                  .filter(inv => inv.nextPaymentDate)
                  .sort((a, b) => new Date(a.nextPaymentDate!).getTime() - new Date(b.nextPaymentDate!).getTime())
                  .slice(0, 5)
                  .map((investment) => (
                    <TableRow key={investment.id}>
                      <TableCell>{investment.projectName}</TableCell>
                      <TableCell>{investment.farmerName}</TableCell>
                      <TableCell>{formatDate(investment.nextPaymentDate!)}</TableCell>
                      <TableCell align="right">{formatCurrency(investment.amount * (investment.returnRate / 100) / 12)}</TableCell>
                      <TableCell>
                        <Chip 
                          label="Scheduled" 
                          color="info"
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                {investments.filter(inv => inv.nextPaymentDate).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No upcoming payments scheduled.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default InvestorDashboard;