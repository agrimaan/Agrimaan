import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Button
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  MonetizationOn as MonetizationOnIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';

interface Investment {
  id: string;
  projectName: string;
  amount: number;
  returnRate: number;
  status: string;
  date: string;
}

interface FarmProject {
  id: string;
  name: string;
  totalInvestment: number;
  expectedReturns: number;
  status: string;
  location: string;
}

interface DashboardStats {
  totalInvestments: number;
  totalReturns: number;
  activeProjects: number;
  portfolioValue: number;
}

const InvestorDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [stats, setStats] = useState<DashboardStats>({
    totalInvestments: 0,
    totalReturns: 0,
    activeProjects: 0,
    portfolioValue: 0
  });
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [farmProjects, setFarmProjects] = useState<FarmProject[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/investor/dashboard');
      const data = await response.json();
      setStats(data.stats);
      setInvestments(data.investments);
      setFarmProjects(data.farmProjects);
    } catch (error) {
      setError('Failed to fetch dashboard data');
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Investor Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your investments and monitor farm project performance
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MonetizationOnIcon color="primary" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Total Investments
                </Typography>
              </Box>
              <Typography variant="h4">{formatCurrency(stats.totalInvestments)}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PieChartIcon color="success" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Total Returns
                </Typography>
              </Box>
              <Typography variant="h4">{formatCurrency(stats.totalReturns)}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TimelineIcon color="warning" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Active Projects
                </Typography>
              </Box>
              <Typography variant="h4">{stats.activeProjects}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DashboardIcon color="info" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Portfolio Value
                </Typography>
              </Box>
              <Typography variant="h4">{formatCurrency(stats.portfolioValue)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Investment Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Active', value: 40 },
                      { name: 'Completed', value: 30 },
                      { name: 'Pending', value: 20 },
                      { name: 'Cancelled', value: 10 }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }: any) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Active', value: 40 },
                      { name: 'Completed', value: 30 },
                      { name: 'Pending', value: 20 },
                      { name: 'Cancelled', value: 10 }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Returns by Project
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={farmProjects.map(project => ({
                    name: project.name,
                    returns: project.expectedReturns,
                    investment: project.totalInvestment
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="investment" fill="#8884d8" />
                  <Bar dataKey="returns" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Investments */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Investments
              </Typography>
              <List>
                {investments.map((investment) => (
                  <ListItem key={investment.id}>
                    <ListItemText
                      primary={investment.projectName}
                      secondary={`Amount: ${formatCurrency(investment.amount)}`}
                    />
                    <Chip
                      label={investment.status}
                      color={investment.status === 'active' ? 'success' : 'warning'}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Farm Projects
              </Typography>
              <List>
                {farmProjects.map((project) => (
                  <ListItem key={project.id}>
                    <ListItemText
                      primary={project.name}
                      secondary={`Location: ${project.location}`}
                    />
                    <Box>
                      <Typography variant="body2">
                        Investment: {formatCurrency(project.totalInvestment)}
                      </Typography>
                      <Typography variant="body2">
                        Expected Returns: {formatCurrency(project.expectedReturns)}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default InvestorDashboard;