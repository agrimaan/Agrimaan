import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
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
  TextField,
  MenuItem,
  InputAdornment,
  LinearProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Tab,
  Tabs
} from '@mui/material';
import {
  Search as SearchIcon,
  VideoCall as VideoCallIcon,
  Event as EventIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { RootState } from '../../store';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Define types
interface Consultation {
  _id: string;
  farmer: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  field?: {
    _id: string;
    name: string;
  };
  topic: string;
  description?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  scheduledDate: string;
  scheduledTime?: string;
  duration?: number; // in minutes
  meetingLink?: string;
  notes?: string;
  createdAt: string;
}

interface Field {
  _id: string;
  name: string;
  owner: {
    _id: string;
    name: string;
  };
}

const AgronomistConsultations: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [filteredConsultations, setFilteredConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Dialog states
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openCompleteDialog, setOpenCompleteDialog] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  
  // Form states
  const [formFarmer, setFormFarmer] = useState('');
  const [formField, setFormField] = useState('');
  const [formTopic, setFormTopic] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState<Date | null>(null);
  const [formTime, setFormTime] = useState('');
  const [formDuration, setFormDuration] = useState(60);
  const [formNotes, setFormNotes] = useState('');
  const [formErrors, setFormErrors] = useState({
    farmer: false,
    topic: false,
    date: false,
    time: false
  });

  // Mock farmers data
  const farmers = [
    { _id: 'u1', name: 'Farmer Singh', email: 'farmer.singh@example.com', phone: '+91 98765 43210' },
    { _id: 'u2', name: 'Farmer Kumar', email: 'farmer.kumar@example.com', phone: '+91 98765 43211' },
    { _id: 'u3', name: 'Farmer Patel', email: 'farmer.patel@example.com', phone: '+91 98765 43212' },
    { _id: 'u4', name: 'Farmer Deshmukh', email: 'farmer.deshmukh@example.com', phone: '+91 98765 43213' },
    { _id: 'u5', name: 'Farmer Reddy', email: 'farmer.reddy@example.com', phone: '+91 98765 43214' }
  ];

  // Mock fields data
  const fields: Field[] = [
    { _id: 'f1', name: 'North Wheat Field', owner: { _id: 'u1', name: 'Farmer Singh' } },
    { _id: 'f2', name: 'South Rice Paddy', owner: { _id: 'u2', name: 'Farmer Kumar' } },
    { _id: 'f3', name: 'East Cotton Field', owner: { _id: 'u3', name: 'Farmer Patel' } },
    { _id: 'f4', name: 'West Sugarcane Field', owner: { _id: 'u4', name: 'Farmer Deshmukh' } },
    { _id: 'f5', name: 'Central Vegetable Garden', owner: { _id: 'u5', name: 'Farmer Reddy' } }
  ];

  useEffect(() => {
    // In a real implementation, this would be an API call
    // For now, we'll use mock data
    const fetchConsultations = async () => {
      setLoading(true);
      
      // Mock consultations data
      const mockConsultations: Consultation[] = [
        {
          _id: 'c1',
          farmer: {
            _id: 'u1',
            name: 'Farmer Singh',
            email: 'farmer.singh@example.com',
            phone: '+91 98765 43210'
          },
          field: {
            _id: 'f1',
            name: 'North Wheat Field'
          },
          topic: 'Wheat disease prevention strategies',
          description: 'Discussion about preventing rust and other common wheat diseases',
          status: 'scheduled',
          scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          scheduledTime: '10:00 AM',
          duration: 45,
          meetingLink: 'https://meet.google.com/abc-defg-hij',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: 'c2',
          farmer: {
            _id: 'u2',
            name: 'Farmer Kumar',
            email: 'farmer.kumar@example.com',
            phone: '+91 98765 43211'
          },
          field: {
            _id: 'f2',
            name: 'South Rice Paddy'
          },
          topic: 'Rice yield optimization techniques',
          description: 'Strategies to improve rice yield and quality',
          status: 'scheduled',
          scheduledDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
          scheduledTime: '2:30 PM',
          duration: 60,
          meetingLink: 'https://meet.google.com/jkl-mnop-qrs',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: 'c3',
          farmer: {
            _id: 'u3',
            name: 'Farmer Patel',
            email: 'farmer.patel@example.com',
            phone: '+91 98765 43212'
          },
          field: {
            _id: 'f3',
            name: 'East Cotton Field'
          },
          topic: 'Cotton pest management',
          description: 'Discussion about bollworm control and other pest management strategies',
          status: 'completed',
          scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          scheduledTime: '11:00 AM',
          duration: 30,
          notes: 'Recommended integrated pest management approach. Farmer will implement neem-based organic pesticides.',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: 'c4',
          farmer: {
            _id: 'u4',
            name: 'Farmer Deshmukh',
            email: 'farmer.deshmukh@example.com',
            phone: '+91 98765 43213'
          },
          field: {
            _id: 'f4',
            name: 'West Sugarcane Field'
          },
          topic: 'Sugarcane irrigation planning',
          description: 'Optimizing irrigation schedule for sugarcane',
          status: 'cancelled',
          scheduledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          scheduledTime: '3:00 PM',
          duration: 45,
          notes: 'Farmer had an emergency and requested to reschedule.',
          createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: 'c5',
          farmer: {
            _id: 'u5',
            name: 'Farmer Reddy',
            email: 'farmer.reddy@example.com',
            phone: '+91 98765 43214'
          },
          field: {
            _id: 'f5',
            name: 'Central Vegetable Garden'
          },
          topic: 'Organic vegetable farming techniques',
          description: 'Discussion about organic farming methods for tomatoes and peppers',
          status: 'scheduled',
          scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          scheduledTime: '9:30 AM',
          duration: 60,
          meetingLink: 'https://meet.google.com/tuv-wxyz-123',
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      // Simulate API delay
      setTimeout(() => {
        setConsultations(mockConsultations);
        setFilteredConsultations(mockConsultations);
        setLoading(false);
      }, 800);
    };

    fetchConsultations();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...consultations];
    
    // Apply tab filter
    switch (tabValue) {
      case 0: // All
        break;
      case 1: // Upcoming
        result = result.filter(consultation => consultation.status === 'scheduled');
        break;
      case 2: // Completed
        result = result.filter(consultation => consultation.status === 'completed');
        break;
      case 3: // Cancelled
        result = result.filter(consultation => consultation.status === 'cancelled');
        break;
    }
    
    // Apply search term
    if (searchTerm) {
      result = result.filter(consultation => 
        consultation.farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultation.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (consultation.field?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false)
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(consultation => consultation.status === filterStatus);
    }
    
    // Apply date filter
    if (filterDate) {
      const filterDateStr = filterDate.toISOString().split('T')[0];
      result = result.filter(consultation => {
        const consultationDate = new Date(consultation.scheduledDate).toISOString().split('T')[0];
        return consultationDate === filterDateStr;
      });
    }
    
    setFilteredConsultations(result);
  }, [consultations, searchTerm, filterStatus, filterDate, tabValue]);

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <EventAvailableIcon />;
      case 'completed':
        return <CheckCircleIcon />;
      case 'cancelled':
        return <CancelIcon />;
      default:
        return <EventIcon />;
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle new consultation dialog
  const handleOpenNewDialog = () => {
    setFormFarmer('');
    setFormField('');
    setFormTopic('');
    setFormDescription('');
    setFormDate(null);
    setFormTime('');
    setFormDuration(60);
    setFormNotes('');
    setFormErrors({
      farmer: false,
      topic: false,
      date: false,
      time: false
    });
    setOpenNewDialog(true);
  };

  const handleCloseNewDialog = () => {
    setOpenNewDialog(false);
  };

  const handleCreateConsultation = () => {
    // Validate form
    const errors = {
      farmer: formFarmer === '',
      topic: formTopic === '',
      date: formDate === null,
      time: formTime === ''
    };
    
    setFormErrors(errors);
    
    if (Object.values(errors).some(error => error)) {
      return;
    }
    
    // In a real implementation, this would be an API call
    // For now, we'll just add to the local state
    const newConsultation: Consultation = {
      _id: `c${consultations.length + 1}`,
      farmer: farmers.find(farmer => farmer._id === formFarmer) || farmers[0],
      field: formField ? fields.find(field => field._id === formField) : undefined,
      topic: formTopic,
      description: formDescription,
      status: 'scheduled',
      scheduledDate: formDate?.toISOString() || new Date().toISOString(),
      scheduledTime: formTime,
      duration: formDuration,
      meetingLink: 'https://meet.google.com/generated-link',
      notes: formNotes,
      createdAt: new Date().toISOString()
    };
    
    setConsultations([...consultations, newConsultation]);
    handleCloseNewDialog();
  };

  // Handle edit consultation dialog
  const handleOpenEditDialog = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setFormFarmer(consultation.farmer._id);
    setFormField(consultation.field?._id || '');
    setFormTopic(consultation.topic);
    setFormDescription(consultation.description || '');
    setFormDate(new Date(consultation.scheduledDate));
    setFormTime(consultation.scheduledTime || '');
    setFormDuration(consultation.duration || 60);
    setFormNotes(consultation.notes || '');
    setFormErrors({
      farmer: false,
      topic: false,
      date: false,
      time: false
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedConsultation(null);
  };

  const handleUpdateConsultation = () => {
    if (!selectedConsultation) return;
    
    // Validate form
    const errors = {
      farmer: formFarmer === '',
      topic: formTopic === '',
      date: formDate === null,
      time: formTime === ''
    };
    
    setFormErrors(errors);
    
    if (Object.values(errors).some(error => error)) {
      return;
    }
    
    // In a real implementation, this would be an API call
    // For now, we'll just update the local state
    const updatedConsultations = consultations.map(consultation => {
      if (consultation._id === selectedConsultation._id) {
        return {
          ...consultation,
          farmer: farmers.find(farmer => farmer._id === formFarmer) || farmers[0],
          field: formField ? fields.find(field => field._id === formField) : undefined,
          topic: formTopic,
          description: formDescription,
          scheduledDate: formDate?.toISOString() || new Date().toISOString(),
          scheduledTime: formTime,
          duration: formDuration,
          notes: formNotes
        };
      }
      return consultation;
    });
    
    setConsultations(updatedConsultations);
    handleCloseEditDialog();
  };

  // Handle cancel consultation dialog
  const handleOpenCancelDialog = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setOpenCancelDialog(true);
  };

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
    setSelectedConsultation(null);
  };

  const handleCancelConsultation = () => {
    if (!selectedConsultation) return;
    
    // In a real implementation, this would be an API call
    // For now, we'll just update the local state
    const updatedConsultations = consultations.map(consultation => {
      if (consultation._id === selectedConsultation._id) {
        return {
          ...consultation,
          status: 'cancelled' as 'cancelled',
          notes: (consultation.notes ? consultation.notes + '\n' : '') + 'Cancelled by agronomist.'
        };
      }
      return consultation;
    });
    
    setConsultations(updatedConsultations);
    handleCloseCancelDialog();
  };

  // Handle complete consultation dialog
  const handleOpenCompleteDialog = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setFormNotes(consultation.notes || '');
    setOpenCompleteDialog(true);
  };

  const handleCloseCompleteDialog = () => {
    setOpenCompleteDialog(false);
    setSelectedConsultation(null);
  };

  const handleCompleteConsultation = () => {
    if (!selectedConsultation) return;
    
    // In a real implementation, this would be an API call
    // For now, we'll just update the local state
    const updatedConsultations = consultations.map(consultation => {
      if (consultation._id === selectedConsultation._id) {
        return {
          ...consultation,
          status: 'completed' as 'completed',
          notes: formNotes
        };
      }
      return consultation;
    });
    
    setConsultations(updatedConsultations);
    handleCloseCompleteDialog();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Consultations
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenNewDialog}
        >
          New Consultation
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="All Consultations" />
          <Tab label="Upcoming" />
          <Tab label="Completed" />
          <Tab label="Cancelled" />
        </Tabs>
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="Search Consultations"
              variant="outlined"
              size="small"
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
          <Grid item xs={12} md={3.5}>
            <TextField
              select
              fullWidth
              label="Status"
              variant="outlined"
              size="small"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3.5}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Filter by Date"
                value={filterDate}
                onChange={(newValue) => setFilterDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    variant: 'outlined'
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
      </Paper>

      {/* Consultations List */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            {tabValue === 0 && 'All Consultations'}
            {tabValue === 1 && 'Upcoming Consultations'}
            {tabValue === 2 && 'Completed Consultations'}
            {tabValue === 3 && 'Cancelled Consultations'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredConsultations.length} consultations found
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        {loading ? (
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        ) : filteredConsultations.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
            No consultations match your search criteria.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Farmer</TableCell>
                  <TableCell>Topic</TableCell>
                  <TableCell>Field</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredConsultations.map((consultation) => (
                  <TableRow key={consultation._id}>
                    <TableCell>{consultation.farmer.name}</TableCell>
                    <TableCell>{consultation.topic}</TableCell>
                    <TableCell>{consultation.field?.name || 'N/A'}</TableCell>
                    <TableCell>
                      {formatDate(consultation.scheduledDate)}
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {consultation.scheduledTime || 'Time not set'}
                      </Typography>
                    </TableCell>
                    <TableCell>{consultation.duration || 60} min</TableCell>
                    <TableCell>
                      <Chip 
                        icon={getStatusIcon(consultation.status)}
                        label={consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)} 
                        color={getStatusColor(consultation.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {consultation.status === 'scheduled' && (
                        <>
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleOpenEditDialog(consultation)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Mark as Completed">
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => handleOpenCompleteDialog(consultation)}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancel">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleOpenCancelDialog(consultation)}
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      {consultation.status !== 'scheduled' && (
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleOpenEditDialog(consultation)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* New Consultation Dialog */}
      <Dialog open={openNewDialog} onClose={handleCloseNewDialog} maxWidth="md" fullWidth>
        <DialogTitle>Schedule New Consultation</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={formErrors.farmer}>
                <InputLabel id="farmer-select-label">Farmer</InputLabel>
                <Select
                  labelId="farmer-select-label"
                  value={formFarmer}
                  label="Farmer"
                  onChange={(e) => setFormFarmer(e.target.value)}
                >
                  {farmers.map((farmer) => (
                    <MenuItem key={farmer._id} value={farmer._id}>
                      {farmer.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.farmer && <FormHelperText>Farmer is required</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="field-select-label">Field (Optional)</InputLabel>
                <Select
                  labelId="field-select-label"
                  value={formField}
                  label="Field (Optional)"
                  onChange={(e) => setFormField(e.target.value)}
                >
                  <MenuItem value="">No specific field</MenuItem>
                  {fields.map((field) => (
                    <MenuItem key={field._id} value={field._id}>
                      {field.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Topic"
                variant="outlined"
                value={formTopic}
                onChange={(e) => setFormTopic(e.target.value)}
                error={formErrors.topic}
                helperText={formErrors.topic ? 'Topic is required' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (Optional)"
                variant="outlined"
                multiline
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={formDate}
                  onChange={(newValue) => setFormDate(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                      error: formErrors.date,
                      helperText: formErrors.date ? 'Date is required' : ''
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Time"
                variant="outlined"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={formTime}
                onChange={(e) => setFormTime(e.target.value)}
                error={formErrors.time}
                helperText={formErrors.time ? 'Time is required' : ''}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                variant="outlined"
                type="number"
                value={formDuration}
                onChange={(e) => setFormDuration(parseInt(e.target.value))}
                InputProps={{ inputProps: { min: 15, step: 15 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes (Optional)"
                variant="outlined"
                multiline
                rows={2}
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewDialog}>Cancel</Button>
          <Button onClick={handleCreateConsultation} variant="contained">Schedule</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Consultation Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedConsultation?.status === 'scheduled' ? 'Edit Consultation' : 'Consultation Details'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={formErrors.farmer} disabled={selectedConsultation?.status !== 'scheduled'}>
                <InputLabel id="edit-farmer-select-label">Farmer</InputLabel>
                <Select
                  labelId="edit-farmer-select-label"
                  value={formFarmer}
                  label="Farmer"
                  onChange={(e) => setFormFarmer(e.target.value)}
                >
                  {farmers.map((farmer) => (
                    <MenuItem key={farmer._id} value={farmer._id}>
                      {farmer.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.farmer && <FormHelperText>Farmer is required</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={selectedConsultation?.status !== 'scheduled'}>
                <InputLabel id="edit-field-select-label">Field (Optional)</InputLabel>
                <Select
                  labelId="edit-field-select-label"
                  value={formField}
                  label="Field (Optional)"
                  onChange={(e) => setFormField(e.target.value)}
                >
                  <MenuItem value="">No specific field</MenuItem>
                  {fields.map((field) => (
                    <MenuItem key={field._id} value={field._id}>
                      {field.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Topic"
                variant="outlined"
                value={formTopic}
                onChange={(e) => setFormTopic(e.target.value)}
                error={formErrors.topic}
                helperText={formErrors.topic ? 'Topic is required' : ''}
                disabled={selectedConsultation?.status !== 'scheduled'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (Optional)"
                variant="outlined"
                multiline
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                disabled={selectedConsultation?.status !== 'scheduled'}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={formDate}
                  onChange={(newValue) => setFormDate(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                      error: formErrors.date,
                      helperText: formErrors.date ? 'Date is required' : '',
                      disabled: selectedConsultation?.status !== 'scheduled'
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Time"
                variant="outlined"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={formTime}
                onChange={(e) => setFormTime(e.target.value)}
                error={formErrors.time}
                helperText={formErrors.time ? 'Time is required' : ''}
                disabled={selectedConsultation?.status !== 'scheduled'}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                variant="outlined"
                type="number"
                value={formDuration}
                onChange={(e) => setFormDuration(parseInt(e.target.value))}
                InputProps={{ inputProps: { min: 15, step: 15 } }}
                disabled={selectedConsultation?.status !== 'scheduled'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                variant="outlined"
                multiline
                rows={3}
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                disabled={selectedConsultation?.status === 'cancelled'}
              />
            </Grid>
            {selectedConsultation?.meetingLink && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Meeting Link"
                  variant="outlined"
                  value={selectedConsultation.meetingLink}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          size="small"
                          href={selectedConsultation.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Close</Button>
          {selectedConsultation?.status === 'scheduled' && (
            <Button onClick={handleUpdateConsultation} variant="contained">Update</Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Cancel Consultation Dialog */}
      <Dialog open={openCancelDialog} onClose={handleCloseCancelDialog}>
        <DialogTitle>Cancel Consultation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this consultation with {selectedConsultation?.farmer.name} scheduled for {selectedConsultation ? formatDate(selectedConsultation.scheduledDate) : ''} at {selectedConsultation?.scheduledTime}?
          </DialogContentText>
          <TextField
            fullWidth
            label="Cancellation Notes (Optional)"
            variant="outlined"
            multiline
            rows={3}
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog}>No, Keep It</Button>
          <Button onClick={handleCancelConsultation} variant="contained" color="error">Yes, Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Complete Consultation Dialog */}
      <Dialog open={openCompleteDialog} onClose={handleCloseCompleteDialog}>
        <DialogTitle>Complete Consultation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Mark this consultation with {selectedConsultation?.farmer.name} as completed. Please add any notes or outcomes from the consultation.
          </DialogContentText>
          <TextField
            fullWidth
            label="Consultation Notes"
            variant="outlined"
            multiline
            rows={4}
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCompleteDialog}>Cancel</Button>
          <Button onClick={handleCompleteConsultation} variant="contained" color="success">Mark as Completed</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AgronomistConsultations;