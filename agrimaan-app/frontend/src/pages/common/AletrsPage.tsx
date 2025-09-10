
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent,
  Button,
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
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkReadIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setAlert, removeAlert } from '../../features/alert/alertSlice';
import { useTranslation } from 'react-i18next';

interface Alert {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: Date;
  read: boolean;
  category: string;
  priority: 'low' | 'medium' | 'high';
}

const AlertsPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const alerts = useSelector((state: RootState) => state.alert.alerts);
  const [localAlerts, setLocalAlerts] = useState<Alert[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAlert, setNewAlert] = useState({
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    category: 'general',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  useEffect(() => {
    if (alerts.length === 0) {
      const sampleAlerts: Alert[] = [
        {
          id: '1',
          message: t('alerts.sample.lowMoisture'),
          type: 'warning',
          timestamp: new Date(Date.now() - 3600000),
          read: false,
          category: 'irrigation',
          priority: 'high',
        },
        {
          id: '2',
          message: t('alerts.sample.heavyRainfall'),
          type: 'info',
          timestamp: new Date(Date.now() - 7200000),
          read: false,
          category: 'weather',
          priority: 'medium',
        },
        {
          id: '3',
          message: t('alerts.sample.harvestComplete'),
          type: 'success',
          timestamp: new Date(Date.now() - 86400000),
          read: true,
          category: 'harvest',
          priority: 'low',
        },
      ];
      setLocalAlerts(sampleAlerts);
    }
  }, [alerts, t]);

  const handleAddAlert = () => {
    const alert: Alert = {
      ...newAlert,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    setLocalAlerts([alert, ...localAlerts]);
    dispatch(setAlert({ message: newAlert.message, type: newAlert.type }));
    setShowAddDialog(false);
    setNewAlert({
      message: '',
      type: 'info',
      category: 'general',
      priority: 'medium',
    });
  };

  const handleMarkAsRead = (id: string) => {
    setLocalAlerts(prev =>
      prev.map(alert =>
        alert.id === id ? { ...alert, read: true } : alert
      )
    );
  };

  const handleDeleteAlert = (id: string) => {
    setLocalAlerts(prev => prev.filter(alert => alert.id !== id));
    dispatch(removeAlert(id));
  };

  const handleClearAll = () => {
    setLocalAlerts([]);
    alerts.forEach(alert => dispatch(removeAlert(alert.id)));
  };

  const getFilteredAlerts = () => {
    let filtered = localAlerts;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(alert => alert.category === selectedCategory);
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(alert => alert.priority === selectedPriority);
    }

    return filtered.sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'info':
        return <InfoIcon color="info" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getChipColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const filteredAlerts = getFilteredAlerts();
  const unreadCount = filteredAlerts.filter(alert => !alert.read).length;

  const categories = [
    { value: 'all', label: t('common.all') },
    { value: 'irrigation', label: t('fields.irrigation') },
    { value: 'weather', label: t('weather.title') },
    { value: 'harvest', label: t('crops.harvestTime') },
    { value: 'pest', label: t('crops.pesticides') },
    { value: 'general', label: t('common.general') },
  ];

  const priorities = [
    { value: 'all', label: t('common.all') },
    { value: 'high', label: t('alerts.high') },
    { value: 'medium', label: t('alerts.medium') },
    { value: 'low', label: t('alerts.low') },
  ];

  const alertTypes = [
    { value: 'success', label: t('common.success') },
    { value: 'error', label: t('common.error') },
    { value: 'warning', label: t('common.warning') },
    { value: 'info', label: t('common.info') },
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t('alerts.title')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowAddDialog(true)}
          >
            {t('alerts.addAlert')}
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleClearAll}
            disabled={localAlerts.length === 0}
          >
            {t('common.clearAll')}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                {t('alerts.totalAlerts')}
              </Typography>
              <Typography variant="h3" color="primary">
                {localAlerts.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                {t('alerts.unreadAlerts')}
              </Typography>
              <Typography variant="h3" color="warning.main">
                {unreadCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                {t('alerts.highPriority')}
              </Typography>
              <Typography variant="h3" color="error.main">
                {localAlerts.filter(alert => alert.priority === 'high').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>{t('common.category')}</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label={t('common.category')}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>{t('common.priority')}</InputLabel>
              <Select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                label={t('common.priority')}
              >
                {priorities.map((pri) => (
                  <MenuItem key={pri.value} value={pri.value}>
                    {pri.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3}>
        <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          {t('alerts.recentAlerts')}
        </Typography>
        <List>
          {filteredAlerts.length === 0 ? (
            <ListItem>
              <ListItemText
                primary={t('alerts.noAlerts')}
                secondary={t('alerts.allCaughtUp')}
                sx={{ textAlign: 'center', py: 4 }}
              />
            </ListItem>
          ) : (
            filteredAlerts.map((alert) => (
              <ListItem
                key={alert.id}
                sx={{
                  bgcolor: alert.read ? 'transparent' : 'action.hover',
                  borderBottom: 1,
                  borderColor: 'divider',
                }}
                secondaryAction={
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {!alert.read && (
                      <IconButton
                        edge="end"
                        aria-label={t('alerts.markAsRead')}
                        onClick={() => handleMarkAsRead(alert.id)}
                        title={t('alerts.markAsRead')}
                      >
                        <MarkReadIcon />
                      </IconButton>
                    )}
                    <IconButton
                      edge="end"
                      aria-label={t('common.delete')}
                      onClick={() => handleDeleteAlert(alert.id)}
                      title={t('common.delete')}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemIcon>{getIcon(alert.type)}</ListItemIcon>
                <ListItemText
                  primary={alert.message}
                  secondary={
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                      <Chip
                        label={alert.category}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={t(`alerts.${alert.priority}`)}
                        size="small"
                        color={getChipColor(alert.priority) as any}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {alert.timestamp.toLocaleString()}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))
          )}
        </List>
      </Paper>

      {/* Add Alert Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('alerts.addAlert')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label={t('alerts.alertMessage')}
              multiline
              rows={3}
              value={newAlert.message}
              onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>{t('common.type')}</InputLabel>
              <Select
                value={newAlert.type}
                onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value as any })}
                label={t('common.type')}
              >
                {alertTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>{t('common.category')}</InputLabel>
              <Select
                value={newAlert.category}
                onChange={(e) => setNewAlert({ ...newAlert, category: e.target.value })}
                label={t('common.category')}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>{t('common.priority')}</InputLabel>
              <Select
                value={newAlert.priority}
                onChange={(e) => setNewAlert({ ...newAlert, priority: e.target.value as any })}
                label={t('common.priority')}
              >
                {priorities.map((pri) => (
                  <MenuItem key={pri.value} value={pri.value}>
                    {pri.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleAddAlert} variant="contained" disabled={!newAlert.message.trim()}>
            {t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AlertsPage;
