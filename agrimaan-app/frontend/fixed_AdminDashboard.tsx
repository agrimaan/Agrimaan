import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { batch } from 'react-redux';

import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
} from '@mui/material';

import {
  People as PeopleIcon,
  Settings as SettingsIcon,
  WarningAmber as WarningIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Insights as InsightsIcon,
} from '@mui/icons-material';

import { RootState } from '../store';
import { setKpis, setSystemHealth, addApproval } from '../features/admin/adminSlice';

// Import API_BASE_URL from config
import { API_BASE_URL } from '../config/apiConfig';

// Use environment variable or default to false
const ENABLE_ADMIN_API = process.env.REACT_APP_ENABLE_ADMIN_API === 'true';

type Kpis = Partial<{
  totalUsers: number;
  activeFarmers: number;
  totalOrders: number;
  revenue: number;
}>;

type HealthItem = {
  name: string;
  status: 'ok' | 'degraded' | 'down' | string;
  message?: string;
};

type ApprovalItem = {
  _id: string;
  type: string;
  targetName?: string;
  requestedBy?: string;
  createdAt?: string;
  status?: 'pending' | 'approved' | 'rejected';
};

const statusColor = (s: string): 'success'|'warning'|'error'|'default' => {
  switch (s) {
    case 'ok': return 'success';
    case 'degraded': return 'warning';
    case 'down': return 'error';
    default: return 'default';
  }
};

const fmtDate = (iso?: string) => {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
};

// Helper function to transform approval data if needed
const toApproval = (approval: any): ApprovalItem => {
  return {
    _id: approval._id || '',
    type: approval.type || '',
    targetName: approval.targetName,
    requestedBy: approval.requestedBy,
    createdAt: approval.createdAt,
    status: approval.status || 'pending'
  };
};

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const admin = useSelector((s: RootState) => s.admin);
  const fetchedRef = useRef(false);

  const [loading, setLoading] = useState({ dashboard: !!ENABLE_ADMIN_API });

  useEffect(() => {
    if (!ENABLE_ADMIN_API) {
      setLoading({ dashboard: false });
      return;
    }
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const ctrl = new AbortController();

    axios.get(`${API_BASE_URL}/api/admin/dashboard`, { signal: ctrl.signal })
      .then(res => {
        const data = res.data || {};
        if (data.kpis) dispatch(setKpis(data.kpis));
        if (Array.isArray(data.systemHealth)) dispatch(setSystemHealth(data.systemHealth));
        if (Array.isArray(data.approvals)) {
          // Use batch to optimize multiple dispatches
          batch(() => {
            data.approvals.forEach((approval: any) => {
              dispatch(addApproval(toApproval(approval)));
            });
          });
        }
      })
      .catch(err => {
        // Ignore missing route in dev, log others
        if (err?.response?.status !== 404) {
          console.error('Error fetching admin dashboard:', err);
        }
      })
      .finally(() => setLoading({ dashboard: false }));

    return () => ctrl.abort();
  }, [dispatch]);

  const kpis: Kpis = admin?.kpis || {};
  const systemHealth: HealthItem[] = Array.isArray(admin?.systemHealth) ? admin.systemHealth : [];
  const approvals: ApprovalItem[] = Array.isArray(admin?.approvals) ? admin.approvals : [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Box>
          <Button
            component={RouterLink}
            to="/admin/users"
            variant="contained"
            startIcon={<PeopleIcon />}
            sx={{ mr: 1 }}
          >
            Manage Users
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

      {/* Summary Cards (similar structure to BuyerDashboard) */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Users
                  </Typography>
                  <Typography variant="h4">{loading.dashboard ? '…' : (kpis.totalUsers ?? 0)}</Typography>
                </Box>
                <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Link component={RouterLink} to="/admin/users" underline="hover">
                  View users
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Active Farmers
                  </Typography>
                  <Typography variant="h4">{loading.dashboard ? '…' : (kpis.activeFarmers ?? 0)}</Typography>
                </Box>
                <InsightsIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Orders
                  </Typography>
                  <Typography variant="h4">{loading.dashboard ? '…' : (kpis.totalOrders ?? 0)}</Typography>
                </Box>
                <AssignmentTurnedInIcon color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Revenue
                  </Typography>
                  <Typography variant="h4">
                    {loading.dashboard ? '…' : (kpis.revenue != null ? `$${Number(kpis.revenue).toFixed(2)}` : '$0.00')}
                  </Typography>
                </Box>
                <InsightsIcon color="secondary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* System Health */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            System Health
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {loading.dashboard ? (
          <Typography>Loading system health…</Typography>
        ) : systemHealth.length === 0 ? (
          <Typography color="text.secondary">No health data available.</Typography>
        ) : (
          <Grid container spacing={2}>
            {systemHealth.map((h, idx) => (
              <Grid item xs={12} md={6} key={`${h.name}-${idx}`}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1">{h.name}</Typography>
                      {h.message && (
                        <Typography variant="body2" color="text.secondary">
                          {h.message}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      label={h.status.toUpperCase()}
                      color={statusColor(h.status)}
                      icon={h.status === 'ok' ? undefined : <WarningIcon />}
                      size="small"
                    />
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Pending Approvals */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            Pending Approvals
          </Typography>
          <Button
            component={RouterLink}
            to="/admin/approvals"
            size="small"
            endIcon={<AssignmentTurnedInIcon />}
          >
            Manage
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {loading.dashboard ? (
          <Typography>Loading approvals…</Typography>
        ) : approvals.length === 0 ? (
          <Typography color="text.secondary">No pending approvals.</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Target</TableCell>
                  <TableCell>Requested By</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {approvals.map((a) => (
                  <TableRow key={a._id}>
                    <TableCell>{a._id?.slice(0, 8)}…</TableCell>
                    <TableCell>{a.type}</TableCell>
                    <TableCell>{a.targetName ?? '-'}</TableCell>
                    <TableCell>{a.requestedBy ?? '-'}</TableCell>
                    <TableCell>{fmtDate(a.createdAt)}</TableCell>
                    <TableCell>
                      <Chip
                        label={(a.status ?? 'pending').toUpperCase()}
                        color={(a.status ?? 'pending') === 'pending' ? 'warning' : (a.status === 'approved' ? 'success' : 'default')}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default AdminDashboard;