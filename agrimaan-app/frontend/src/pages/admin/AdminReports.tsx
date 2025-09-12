import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  TrendingUp,
  People,
  AttachMoney,
  Assessment,
  Download,
  FilterList,
  Refresh,
  PieChart,
  BarChart,
  ShowChart
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import axios from 'axios';
import { AppDispatch } from '../../store';

interface ReportData {
  totalUsers: number;
  totalFields: number;
  totalRevenue: number;
  totalOrders: number;
  userGrowth: number;
  fieldGrowth: number;
  revenueGrowth: number;
  orderGrowth: number;
}

interface ReportFilters {
  startDate: string;
  endDate: string;
  userType: string;
  status: string;
}

const AdminReports: React.FC = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [selectedReport, setSelectedReport] = useState<string>('overview');
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    userType: 'all',
    status: 'all'
  });
  const [exportDialog, setExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');

  useEffect(() => {
    fetchReportData();
  }, [selectedReport, filters]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/admin/reports/${selectedReport}`, {
        params: filters,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.post('/api/admin/reports/export', {
        report: selectedReport,
        format: exportFormat,
        filters
      }, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${selectedReport}-${new Date().toISOString()}.${exportFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setExportDialog(false);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const StatCard = ({ title, value, growth, icon, color }: any) => (
    <Card sx={{ height: '100%', borderLeft: `4px solid ${color}` }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            <Box display="flex" alignItems="center" mt={1}>
              <TrendingUp color={growth >= 0 ? 'success' : 'error'} fontSize="small" />
              <Typography 
                variant="body2" 
                color={growth >= 0 ? 'success.main' : 'error.main'}
                ml={1}
              >
                {growth >= 0 ? '+' : ''}{growth}%
              </Typography>
            </Box>
          </Box>
          <Box color={color}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'overview':
        return renderOverviewReport();
      case 'users':
        return renderUserReport();
      case 'financial':
        return renderFinancialReport();
      case 'system':
        return renderSystemReport();
      default:
        return <Typography>Select a report type</Typography>;
    }
  };

  const renderOverviewReport = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Users"
          value={reportData?.totalUsers || 0}
          growth={reportData?.userGrowth || 0}
          icon={<People fontSize="large" />}
          color="#1976d2"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Fields"
          value={reportData?.totalFields || 0}
          growth={reportData?.fieldGrowth || 0}
          icon={<Assessment fontSize="large" />}
          color="#388e3c"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Revenue"
          value={`$${(reportData?.totalRevenue || 0).toLocaleString()}`}
          growth={reportData?.revenueGrowth || 0}
          icon={<AttachMoney fontSize="large" />}
          color="#f57c00"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Orders"
          value={reportData?.totalOrders || 0}
          growth={reportData?.orderGrowth || 0}
          icon={<BarChart fontSize="large" />}
          color="#7b1fa2"
        />
      </Grid>
    </Grid>
  );

  const renderUserReport = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User Type</TableCell>
            <TableCell align="right">Count</TableCell>
            <TableCell align="right">Active</TableCell>
            <TableCell align="right">Growth</TableCell>
            <TableCell align="right">Engagement</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Farmers</TableCell>
            <TableCell align="right">1,234</TableCell>
            <TableCell align="right">1,089</TableCell>
            <TableCell align="right">+12.5%</TableCell>
            <TableCell align="right">87%</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Buyers</TableCell>
            <TableCell align="right">856</TableCell>
            <TableCell align="right">743</TableCell>
            <TableCell align="right">+8.3%</TableCell>
            <TableCell align="right">79%</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Investors</TableCell>
            <TableCell align="right">234</TableCell>
            <TableCell align="right">198</TableCell>
            <TableCell align="right">+15.2%</TableCell>
            <TableCell align="right">92%</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderFinancialReport = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Revenue by Category
            </Typography>
            <Box height={300} display="flex" alignItems="center" justifyContent="center">
              <PieChart sx={{ fontSize: 100 }} />
              <Typography ml={2}>Chart visualization coming soon</Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Monthly Revenue Trend
            </Typography>
            <Box height={300} display="flex" alignItems="center" justifyContent="center">
              <ShowChart sx={{ fontSize: 100 }} />
              <Typography ml={2}>Chart visualization coming soon</Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderSystemReport = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Metric</TableCell>
            <TableCell align="right">Current</TableCell>
            <TableCell align="right">Target</TableCell>
            <TableCell align="right">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>API Response Time</TableCell>
            <TableCell align="right">145ms</TableCell>
            <TableCell align="right">Less than 200ms</TableCell>
            <TableCell align="right">
              <Chip label="Good" color="success" size="small" />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>System Uptime</TableCell>
            <TableCell align="right">99.8%</TableCell>
            <TableCell align="right">Greater than 99.5%</TableCell>
            <TableCell align="right">
              <Chip label="Excellent" color="success" size="small" />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Error Rate</TableCell>
            <TableCell align="right">0.02%</TableCell>
            <TableCell align="right">Less than 0.1%</TableCell>
            <TableCell align="right">
              <Chip label="Excellent" color="success" size="small" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Reports & Analytics</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => {/* Implement filter dialog */}}
            sx={{ mr: 2 }}
          >
            Filters
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => setExportDialog(true)}
          >
            Export
          </Button>
        </Box>
      </Box>

      <Box mb={3}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Report Type</InputLabel>
          <Select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            label="Report Type"
          >
            <MenuItem value="overview">Overview</MenuItem>
            <MenuItem value="users">Users</MenuItem>
            <MenuItem value="financial">Financial</MenuItem>
            <MenuItem value="system">System Health</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        renderReportContent()
      )}

      <Dialog open={exportDialog} onClose={() => setExportDialog(false)}>
        <DialogTitle>Export Report</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Format</InputLabel>
            <Select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              label="Format"
            >
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="excel">Excel</MenuItem>
              <MenuItem value="csv">CSV</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialog(false)}>Cancel</Button>
          <Button onClick={handleExport} variant="contained">
            Export
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminReports;