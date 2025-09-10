import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  LocalShipping as LocalShippingIcon,
  Route as RouteIcon,
  DirectionsCar as DirectionsCarIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  Assignment as AssignmentIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface LogisticsStats {
  totalDeliveries: number;
  activeDeliveries: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  totalRevenue: number;
}

interface Delivery {
  id: string;
  orderId: string;
  farmer: string;
  buyer: string;
  pickupLocation: string;
  deliveryLocation: string;
  status: string;
  estimatedTime: string;
  driver: string;
  vehicle: string;
}

const LogisticsDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<LogisticsStats>({
    totalDeliveries: 150,
    activeDeliveries: 12,
    completedDeliveries: 135,
    pendingDeliveries: 3,
    totalRevenue: 75000,
  });

  const [recentDeliveries, setRecentDeliveries] = useState<Delivery[]>([
    {
      id: '1',
      orderId: 'ORD001',
      farmer: 'राम कुमार',
      buyer: 'श्याम लाल',
      pickupLocation: 'हरियाणा',
      deliveryLocation: 'दिल्ली',
      status: 'in-transit',
      estimatedTime: '2 घंटे',
      driver: 'सुरेश',
      vehicle: 'ट्रक HR01AB1234',
    },
    {
      id: '2',
      orderId: 'ORD002',
      farmer: 'सीता देवी',
      buyer: 'मोहन लाल',
      pickupLocation: 'पंजाब',
      deliveryLocation: 'चंडीगढ़',
      status: 'scheduled',
      estimatedTime: '4 घंटे',
      driver: 'राजेश',
      vehicle: 'ट्रक PB02CD5678',
    },
  ]);

  const quickActions = [
    {
      title: t('roles.logistics.scheduleDelivery'),
      icon: <ScheduleIcon />,
      action: () => navigate('/deliveries/schedule'),
      color: 'success',
    },
    {
      title: t('roles.logistics.manageRoutes'),
      icon: <RouteIcon />,
      action: () => navigate('/routes'),
      color: 'primary',
    },
    {
      title: t('roles.logistics.vehicleTracking'),
      icon: <DirectionsCarIcon />,
      action: () => navigate('/vehicles'),
      color: 'warning',
    },
    {
      title: t('roles.logistics.deliveryStatus'),
      icon: <LocalShippingIcon />,
      action: () => navigate('/deliveries'),
      color: 'info',
    },
  ];

  const dashboardStats = [
    {
      title: t('deliveries.totalDeliveries'),
      value: stats.totalDeliveries,
      icon: <LocalShippingIcon />,
      color: 'primary',
      description: t('roles.logistics.totalDeliveries'),
    },
    {
      title: t('deliveries.activeDeliveries'),
      value: stats.activeDeliveries,
      icon: <LocalShippingIcon />,
      color: 'warning',
      description: t('roles.logistics.activeDeliveries'),
    },
    {
      title: t('deliveries.completedDeliveries'),
      value: stats.completedDeliveries,
      icon: <AssignmentIcon />,
      color: 'success',
      description: t('roles.logistics.completedDeliveries'),
    },
    {
      title: t('deliveries.totalRevenue'),
      value: `₹${stats.totalRevenue}`,
      icon: <LocalShippingIcon />,
      color: 'info',
      description: t('roles.logistics.totalRevenue'),
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'in-transit':
        return 'warning';
      case 'delivered':
        return 'success';
      case 'delayed':
        return 'error';
      default:
        return 'default';
    };
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return t('deliveries.scheduled');
      case 'in-transit':
        return t('deliveries.inTransit');
      case 'delivered':
        return t('deliveries.delivered');
      case 'delayed':
        return t('deliveries.delayed');
      default:
        return status;
    };
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('roles.logistics.title')}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {t('roles.logistics.welcome')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('roles.logistics.description')}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {dashboardStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: `${stat.color}.main`, mr: 2 }}>
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" color={`${stat.color}.main`}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {stat.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t('dashboard.quickActions')}
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Button
                variant="contained"
                fullWidth
                startIcon={action.icon}
                onClick={action.action}
                sx={{
                  bgcolor: `${action.color}.main`,
                  '&:hover': { bgcolor: `${action.color}.dark` },
                  height: 60,
                }}
              >
                {action.title}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Recent Deliveries */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('deliveries.recentDeliveries')}
        </Typography>
        <List>
          {recentDeliveries.map((delivery) => (
            <ListItem key={delivery.id}>
              <ListItemIcon>
                <LocalShippingIcon color={getStatusColor(delivery.status) as any} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                      {t('deliveries.order')}: {delivery.orderId}
                    </Typography>
                    <Chip
                      label={getStatusText(delivery.status)}
                      size="small"
                      color={getStatusColor(delivery.status) as any}
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2">
                      {t('common.farmer')}: {delivery.farmer} → {t('common.buyer')}: {delivery.buyer}
                    </Typography>
                    <Typography variant="body2">
                      {t('common.location')}: {delivery.pickupLocation} → {delivery.deliveryLocation}
                    </Typography>
                    <Typography variant="body2">
                      {t('deliveries.estimatedTime')}: {delivery.estimatedTime}
                    </Typography>
                    <Typography variant="body2">
                      {t('deliveries.driver')}: {delivery.driver} | {t('deliveries.vehicle')}: {delivery.vehicle}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Navigation Cards */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/deliveries')}>
            <CardContent sx={{ textAlign: 'center' }}>
              <LocalShippingIcon sx={{ fontSize: 40, mb: 2, color: 'primary.main' }} />
              <Typography variant="h6">{t('deliveries.title')}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t('roles.logistics.deliveryManagement')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/routes')}>
            <CardContent sx={{ textAlign: 'center' }}>
              <RouteIcon sx={{ fontSize: 40, mb: 2, color: 'success.main' }} />
              <Typography variant="h6">{t('deliveries.routes')}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t('roles.logistics.routeManagement')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/vehicles')}>
            <CardContent sx={{ textAlign: 'center' }}>
              <DirectionsCarIcon sx={{ fontSize: 40, mb: 2, color: 'warning.main' }} />
              <Typography variant="h6">{t('deliveries.vehicles')}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t('roles.logistics.vehicleManagement')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/analytics')}>
            <CardContent sx={{ textAlign: 'center' }}>
              <AssignmentIcon sx={{ fontSize: 40, mb: 2, color: 'info.main' }} />
              <Typography variant="h6">{t('analytics.title')}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t('roles.logistics.analytics')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LogisticsDashboard;