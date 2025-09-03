import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Grid,
  Divider,
  Chip,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  LocalShipping as LocalShippingIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  Inventory as InventoryIcon,
  AcUnit as AcUnitIcon,
  Notes as NotesIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Update as UpdateIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

// This is a placeholder component for the DeliveryDetail page
// In a real implementation, this would fetch data from the API

const DeliveryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [notes, setNotes] = useState('');
  
  // Mock data - in a real implementation, this would come from an API
  const mockDelivery = {
    _id: id || 'd1',
    orderId: 'order123',
    pickup: {
      location: 'Farm A, Village X, District Y',
      contactName: 'Farmer Singh',
      contactPhone: '9876543210',
      scheduledTime: new Date(Date.now() + 3600000).toISOString()
    },
    delivery: {
      location: 'Market B, City Z',
      contactName: 'Buyer Kumar',
      contactPhone: '9876543211',
      scheduledTime: new Date(Date.now() + 7200000).toISOString()
    },
    cargo: {
      description: 'Wheat - 500kg',
      weight: 500,
      volume: 1,
      requiresRefrigeration: false,
      specialInstructions: 'Handle with care'
    },
    status: 'accepted',
    payment: {
      amount: 1500,
      status: 'pending'
    },
    distance: 45, // km
    estimatedDuration: 90, // minutes
    history: [
      {
        status: 'pending',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        notes: 'Delivery request created'
      },
      {
        status: 'accepted',
        timestamp: new Date(Date.now() - 43200000).toISOString(),
        notes: 'Delivery accepted by logistics provider'
      }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  };

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'info';
      case 'in_transit':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get active step
  const getActiveStep = (status: string) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'accepted':
        return 1;
      case 'in_transit':
        return 2;
      case 'delivered':
        return 3;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  // Handle update dialog open
  const handleUpdateDialogOpen = () => {
    setUpdateDialogOpen(true);
  };

  // Handle update dialog close
  const handleUpdateDialogClose = () => {
    setUpdateDialogOpen(false);
  };

  // Handle status update
  const handleStatusUpdate = () => {
    // In a real implementation, this would be an API call
    console.log('Status update:', statusUpdate, 'Notes:', notes);
    setUpdateDialogOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          component={RouterLink}
          to="/logistics/deliveries"
          startIcon={<ArrowBackIcon />}
        >
          Back to Deliveries
        </Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Delivery #{mockDelivery._id}
        </Typography>
        
        <Chip 
          label={mockDelivery.status.replace('_', ' ').charAt(0).toUpperCase() + mockDelivery.status.replace('_', ' ').slice(1)} 
          color={getStatusColor(mockDelivery.status) as any}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Delivery Status Timeline */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Delivery Status
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Stepper activeStep={getActiveStep(mockDelivery.status)} orientation="horizontal">
                <Step>
                  <StepLabel>Pending</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Accepted</StepLabel>
                </Step>
                <Step>
                  <StepLabel>In Transit</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Delivered</StepLabel>
                </Step>
              </Stepper>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<UpdateIcon />}
                  onClick={handleUpdateDialogOpen}
                  disabled={mockDelivery.status === 'delivered' || mockDelivery.status === 'cancelled'}
                >
                  Update Status
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Pickup and Delivery Information */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Pickup Information
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">
                      Location
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {mockDelivery.pickup.location}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">
                      Contact Person
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {mockDelivery.pickup.contactName}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">
                      Contact Phone
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {mockDelivery.pickup.contactPhone}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">
                      Scheduled Time
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ScheduleIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(mockDelivery.pickup.scheduledTime)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOnIcon color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Delivery Information
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">
                      Location
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {mockDelivery.delivery.location}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">
                      Contact Person
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {mockDelivery.delivery.contactName}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">
                      Contact Phone
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {mockDelivery.delivery.contactPhone}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">
                      Scheduled Time
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ScheduleIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(mockDelivery.delivery.scheduledTime)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Cargo Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <InventoryIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Cargo Information
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">
                      Description
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {mockDelivery.cargo.description}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">
                      Weight
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {mockDelivery.cargo.weight} kg
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">
                      Volume
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {mockDelivery.cargo.volume} m³
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">
                      Requirements
                    </Typography>
                    {mockDelivery.cargo.requiresRefrigeration ? (
                      <Chip 
                        icon={<AcUnitIcon />} 
                        label="Refrigeration Required" 
                        color="info" 
                        variant="outlined"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No special requirements
                      </Typography>
                    )}
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">
                      Special Instructions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {mockDelivery.cargo.specialInstructions || 'None'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Payment Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocalShippingIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Delivery Details
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">
                      Distance
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {mockDelivery.distance} km
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">
                      Estimated Duration
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {mockDelivery.estimatedDuration} minutes
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">
                      Payment Amount
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ₹{mockDelivery.payment.amount}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">
                      Payment Status
                    </Typography>
                    <Chip 
                      label={mockDelivery.payment.status.charAt(0).toUpperCase() + mockDelivery.payment.status.slice(1)} 
                      color={mockDelivery.payment.status === 'completed' ? 'success' : 'warning'} 
                      size="small"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">
                      Order ID
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {mockDelivery.orderId}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Status History */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <NotesIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Status History
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Stepper orientation="vertical">
                  {mockDelivery.history.map((historyItem, index) => (
                    <Step key={index} active={true} completed={true}>
                      <StepLabel>
                        <Typography variant="subtitle1">
                          {historyItem.status.charAt(0).toUpperCase() + historyItem.status.slice(1)}
                        </Typography>
                      </StepLabel>
                      <StepContent>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(historyItem.timestamp)}
                        </Typography>
                        <Typography variant="body2">
                          {historyItem.notes}
                        </Typography>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Update Status Dialog */}
      <Dialog open={updateDialogOpen} onClose={handleUpdateDialogClose}>
        <DialogTitle>Update Delivery Status</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              select
              fullWidth
              label="New Status"
              value={statusUpdate}
              onChange={(e) => setStatusUpdate(e.target.value)}
              SelectProps={{
                native: true,
              }}
              sx={{ mb: 2 }}
            >
              <option value="">Select status</option>
              {mockDelivery.status === 'accepted' && (
                <option value="in_transit">In Transit</option>
              )}
              {mockDelivery.status === 'in_transit' && (
                <option value="delivered">Delivered</option>
              )}
              {(mockDelivery.status === 'accepted' || mockDelivery.status === 'in_transit') && (
                <option value="cancelled">Cancelled</option>
              )}
            </TextField>
            
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any relevant notes about this status update"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUpdateDialogClose}>Cancel</Button>
          <Button 
            onClick={handleStatusUpdate} 
            variant="contained"
            disabled={!statusUpdate}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DeliveryDetail;