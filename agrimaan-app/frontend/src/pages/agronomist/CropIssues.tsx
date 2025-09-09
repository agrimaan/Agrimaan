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
  Tabs,
  Rating
} from '@mui/material';
import {
  Search as SearchIcon,
  BugReport as BugReportIcon,
  Grass as GrassIcon,
  Terrain as TerrainIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  LocalHospital as LocalHospitalIcon,
  WaterDrop as WaterDropIcon,
  Nature as EcoIcon,
  PestControl as PestIcon,
  Coronavirus as CoronavirusIcon,
  HelpOutline as HelpOutlineIcon
} from '@mui/icons-material';
import { RootState } from '../../store';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Define types
interface CropIssue {
  _id: string;
  field: {
    _id: string;
    name: string;
  };
  farmer: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  crop: {
    _id: string;
    name: string;
    variety: string;
  };
  issueType: 'disease' | 'pest' | 'nutrient' | 'water' | 'other';
  description: string;
  images?: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'diagnosed' | 'treated' | 'resolved';
  reportedDate: string;
  diagnosisDate?: string;
  diagnosis?: string;
  treatmentRecommendation?: string;
  treatmentDate?: string;
  treatmentApplied?: string;
  resolvedDate?: string;
  notes?: string;
}

const AgronomistCropIssues: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [cropIssues, setCropIssues] = useState<CropIssue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<CropIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIssueType, setFilterIssueType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  
  // Dialog states
  const [openDiagnoseDialog, setOpenDiagnoseDialog] = useState(false);
  const [openTreatDialog, setOpenTreatDialog] = useState(false);
  const [openResolveDialog, setOpenResolveDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<CropIssue | null>(null);
  
  // Form states
  const [formDiagnosis, setFormDiagnosis] = useState('');
  const [formTreatment, setFormTreatment] = useState('');
  const [formTreatmentApplied, setFormTreatmentApplied] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formErrors, setFormErrors] = useState({
    diagnosis: false,
    treatment: false
  });

  useEffect(() => {
    // In a real implementation, this would be an API call
    // For now, we'll use mock data
    const fetchCropIssues = async () => {
      setLoading(true);
      
      // Mock crop issues data
      const mockCropIssues: CropIssue[] = [
        {
          _id: 'i1',
          field: {
            _id: 'f1',
            name: 'North Wheat Field'
          },
          farmer: {
            _id: 'u1',
            name: 'Farmer Singh',
            email: 'farmer.singh@example.com',
            phone: '+91 98765 43210'
          },
          crop: {
            _id: 'c1',
            name: 'Wheat',
            variety: 'HD-2967'
          },
          issueType: 'disease',
          description: 'Yellow rust observed on wheat leaves. Affecting approximately 20% of the field.',
          images: [
            'https://example.com/images/yellow-rust-1.jpg',
            'https://example.com/images/yellow-rust-2.jpg'
          ],
          severity: 'medium',
          status: 'diagnosed',
          reportedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          diagnosisDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          diagnosis: 'Confirmed yellow rust (Puccinia striiformis). The infection is in early stages but spreading rapidly due to recent humid conditions.',
          treatmentRecommendation: 'Apply fungicide Tebuconazole at 250g/ha. Ensure complete coverage of leaves. Apply early morning or late evening.'
        },
        {
          _id: 'i2',
          field: {
            _id: 'f4',
            name: 'West Sugarcane Field'
          },
          farmer: {
            _id: 'u4',
            name: 'Farmer Deshmukh',
            email: 'farmer.deshmukh@example.com',
            phone: '+91 98765 43213'
          },
          crop: {
            _id: 'c4',
            name: 'Sugarcane',
            variety: 'CO-0238'
          },
          issueType: 'pest',
          description: 'Sugarcane borer infestation detected. Seeing holes in stalks and dead hearts in young shoots.',
          images: [
            'https://example.com/images/sugarcane-borer-1.jpg'
          ],
          severity: 'high',
          status: 'reported',
          reportedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: 'i3',
          field: {
            _id: 'f2',
            name: 'South Rice Paddy'
          },
          farmer: {
            _id: 'u2',
            name: 'Farmer Kumar',
            email: 'farmer.kumar@example.com',
            phone: '+91 98765 43211'
          },
          crop: {
            _id: 'c2',
            name: 'Rice',
            variety: 'Basmati-1121'
          },
          issueType: 'nutrient',
          description: 'Rice plants showing yellowing of leaves starting from the tips. Growth is stunted compared to other parts of the field.',
          severity: 'medium',
          status: 'treated',
          reportedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          diagnosisDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          diagnosis: 'Nitrogen deficiency confirmed through soil and tissue testing. The affected area has lower nitrogen levels compared to the rest of the field.',
          treatmentRecommendation: 'Apply urea at 40kg/ha in split doses. First application immediately, followed by second application after 15 days.',
          treatmentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          treatmentApplied: 'Applied urea at recommended rate. First application completed on ' + new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString()
        },
        {
          _id: 'i4',
          field: {
            _id: 'f5',
            name: 'Central Vegetable Garden'
          },
          farmer: {
            _id: 'u5',
            name: 'Farmer Reddy',
            email: 'farmer.reddy@example.com',
            phone: '+91 98765 43214'
          },
          crop: {
            _id: 'c5',
            name: 'Tomatoes',
            variety: 'Roma'
          },
          issueType: 'water',
          description: 'Tomato plants wilting despite regular irrigation. Leaves curling and fruits showing blossom end rot.',
          severity: 'high',
          status: 'resolved',
          reportedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          diagnosisDate: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
          diagnosis: 'Water stress due to uneven irrigation and calcium deficiency causing blossom end rot.',
          treatmentRecommendation: 'Adjust irrigation schedule to provide consistent moisture. Apply calcium nitrate foliar spray at 5g/L water.',
          treatmentDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          treatmentApplied: 'Installed drip irrigation system for consistent watering. Applied calcium nitrate spray as recommended.',
          resolvedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Issue resolved successfully. New growth is healthy and no new fruits are showing blossom end rot. Farmer has been advised to maintain the new irrigation schedule.'
        },
        {
          _id: 'i5',
          field: {
            _id: 'f3',
            name: 'East Cotton Field'
          },
          farmer: {
            _id: 'u3',
            name: 'Farmer Patel',
            email: 'farmer.patel@example.com',
            phone: '+91 98765 43212'
          },
          crop: {
            _id: 'c3',
            name: 'Cotton',
            variety: 'Bt Cotton'
          },
          issueType: 'pest',
          description: 'Pink bollworm infestation in cotton bolls. Approximately 15% of bolls affected.',
          severity: 'critical',
          status: 'diagnosed',
          reportedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          diagnosisDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          diagnosis: 'Confirmed pink bollworm (Pectinophora gossypiella) infestation. The pest has completed one lifecycle and is now in second generation, which explains the rapid spread.',
          treatmentRecommendation: 'Immediate application of Spinosad at recommended dose. Install pheromone traps at 10 per hectare. Remove and destroy affected bolls.'
        }
      ];

      // Simulate API delay
      setTimeout(() => {
        setCropIssues(mockCropIssues);
        setFilteredIssues(mockCropIssues);
        setLoading(false);
      }, 800);
    };

    fetchCropIssues();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...cropIssues];
    
    // Apply tab filter
    switch (tabValue) {
      case 0: // All
        break;
      case 1: // Reported
        result = result.filter(issue => issue.status === 'reported');
        break;
      case 2: // Diagnosed
        result = result.filter(issue => issue.status === 'diagnosed');
        break;
      case 3: // Treated
        result = result.filter(issue => issue.status === 'treated');
        break;
      case 4: // Resolved
        result = result.filter(issue => issue.status === 'resolved');
        break;
    }
    
    // Apply search term
    if (searchTerm) {
      result = result.filter(issue => 
        issue.farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply issue type filter
    if (filterIssueType !== 'all') {
      result = result.filter(issue => issue.issueType === filterIssueType);
    }
    
    // Apply severity filter
    if (filterSeverity !== 'all') {
      result = result.filter(issue => issue.severity === filterSeverity);
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(issue => issue.status === filterStatus);
    }
    
    setFilteredIssues(result);
  }, [cropIssues, searchTerm, filterIssueType, filterSeverity, filterStatus, tabValue]);

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'info';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported':
        return 'info';
      case 'diagnosed':
        return 'warning';
      case 'treated':
        return 'primary';
      case 'resolved':
        return 'success';
      default:
        return 'default';
    }
  };

  // Get issue type icon
  const getIssueTypeIcon = (type: string) => {
    switch (type) {
      case 'disease':
        return <CoronavirusIcon />;
      case 'pest':
        return <PestIcon />;
      case 'nutrient':
        return <EcoIcon />;
      case 'water':
        return <WaterDropIcon />;
      default:
        return <HelpOutlineIcon />;
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle diagnose dialog
  const handleOpenDiagnoseDialog = (issue: CropIssue) => {
    setSelectedIssue(issue);
    setFormDiagnosis('');
    setFormTreatment('');
    setFormNotes('');
    setFormErrors({
      diagnosis: false,
      treatment: false
    });
    setOpenDiagnoseDialog(true);
  };

  const handleCloseDiagnoseDialog = () => {
    setOpenDiagnoseDialog(false);
    setSelectedIssue(null);
  };

  const handleDiagnoseIssue = () => {
    if (!selectedIssue) return;
    
    // Validate form
    const errors = {
      diagnosis: formDiagnosis === '',
      treatment: formTreatment === ''
    };
    
    setFormErrors(errors);
    
    if (Object.values(errors).some(error => error)) {
      return;
    }
    
    // In a real implementation, this would be an API call
    // For now, we'll just update the local state
    const updatedIssues = cropIssues.map(issue => {
      if (issue._id === selectedIssue._id) {
        return {
          ...issue,
          status: 'diagnosed' as 'diagnosed',
          diagnosisDate: new Date().toISOString(),
          diagnosis: formDiagnosis,
          treatmentRecommendation: formTreatment,
          notes: formNotes ? (issue.notes ? `${issue.notes}\n\n${formNotes}` : formNotes) : issue.notes
        };
      }
      return issue;
    });
    
    setCropIssues(updatedIssues);
    handleCloseDiagnoseDialog();
  };

  // Handle treat dialog
  const handleOpenTreatDialog = (issue: CropIssue) => {
    setSelectedIssue(issue);
    setFormTreatmentApplied('');
    setFormNotes('');
    setOpenTreatDialog(true);
  };

  const handleCloseTreatDialog = () => {
    setOpenTreatDialog(false);
    setSelectedIssue(null);
  };

  const handleTreatIssue = () => {
    if (!selectedIssue) return;
    
    // In a real implementation, this would be an API call
    // For now, we'll just update the local state
    const updatedIssues = cropIssues.map(issue => {
      if (issue._id === selectedIssue._id) {
        return {
          ...issue,
          status: 'treated' as 'treated',
          treatmentDate: new Date().toISOString(),
          treatmentApplied: formTreatmentApplied,
          notes: formNotes ? (issue.notes ? `${issue.notes}\n\n${formNotes}` : formNotes) : issue.notes
        };
      }
      return issue;
    });
    
    setCropIssues(updatedIssues);
    handleCloseTreatDialog();
  };

  // Handle resolve dialog
  const handleOpenResolveDialog = (issue: CropIssue) => {
    setSelectedIssue(issue);
    setFormNotes('');
    setOpenResolveDialog(true);
  };

  const handleCloseResolveDialog = () => {
    setOpenResolveDialog(false);
    setSelectedIssue(null);
  };

  const handleResolveIssue = () => {
    if (!selectedIssue) return;
    
    // In a real implementation, this would be an API call
    // For now, we'll just update the local state
    const updatedIssues = cropIssues.map(issue => {
      if (issue._id === selectedIssue._id) {
        return {
          ...issue,
          status: 'resolved' as 'resolved',
          resolvedDate: new Date().toISOString(),
          notes: formNotes ? (issue.notes ? `${issue.notes}\n\n${formNotes}` : formNotes) : issue.notes
        };
      }
      return issue;
    });
    
    setCropIssues(updatedIssues);
    handleCloseResolveDialog();
  };

  // Handle view dialog
  const handleOpenViewDialog = (issue: CropIssue) => {
    setSelectedIssue(issue);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedIssue(null);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Crop Issues
        </Typography>
        
        <Box>
          <Button
            component={RouterLink}
            to="/agronomist/fields"
            variant="outlined"
            startIcon={<TerrainIcon />}
            sx={{ mr: 1 }}
          >
            Fields
          </Button>
          <Button
            component={RouterLink}
            to="/agronomist/consultations"
            variant="contained"
            startIcon={<AssignmentIcon />}
          >
            Consultations
          </Button>
        </Box>
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
          <Tab label="All Issues" />
          <Tab label="Reported" />
          <Tab label="Diagnosed" />
          <Tab label="Treated" />
          <Tab label="Resolved" />
        </Tabs>
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Issues"
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
          <Grid item xs={12} md={2.5}>
            <TextField
              select
              fullWidth
              label="Issue Type"
              variant="outlined"
              size="small"
              value={filterIssueType}
              onChange={(e) => setFilterIssueType(e.target.value)}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="disease">Disease</MenuItem>
              <MenuItem value="pest">Pest</MenuItem>
              <MenuItem value="nutrient">Nutrient</MenuItem>
              <MenuItem value="water">Water</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2.5}>
            <TextField
              select
              fullWidth
              label="Severity"
              variant="outlined"
              size="small"
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
            >
              <MenuItem value="all">All Severities</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
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
              <MenuItem value="reported">Reported</MenuItem>
              <MenuItem value="diagnosed">Diagnosed</MenuItem>
              <MenuItem value="treated">Treated</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Crop Issues List */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            {tabValue === 0 && 'All Crop Issues'}
            {tabValue === 1 && 'Reported Issues'}
            {tabValue === 2 && 'Diagnosed Issues'}
            {tabValue === 3 && 'Treated Issues'}
            {tabValue === 4 && 'Resolved Issues'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredIssues.length} issues found
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        {loading ? (
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        ) : filteredIssues.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
            No crop issues match your search criteria.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Field</TableCell>
                  <TableCell>Crop</TableCell>
                  <TableCell>Issue Type</TableCell>
                  <TableCell>Farmer</TableCell>
                  <TableCell>Reported Date</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredIssues.map((issue) => (
                  <TableRow key={issue._id}>
                    <TableCell>{issue.field.name}</TableCell>
                    <TableCell>
                      {issue.crop.name}
                      <Typography variant="caption" display="block" color="text.secondary">
                        {issue.crop.variety}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getIssueTypeIcon(issue.issueType)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {issue.issueType.charAt(0).toUpperCase() + issue.issueType.slice(1)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{issue.farmer.name}</TableCell>
                    <TableCell>{formatDate(issue.reportedDate)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)} 
                        color={getSeverityColor(issue.severity) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={issue.status.charAt(0).toUpperCase() + issue.status.slice(1)} 
                        color={getStatusColor(issue.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {issue.status === 'reported' && (
                        <Tooltip title="Diagnose Issue">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleOpenDiagnoseDialog(issue)}
                          >
                            <LocalHospitalIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {issue.status === 'diagnosed' && (
                        <Tooltip title="Mark as Treated">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleOpenTreatDialog(issue)}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {issue.status === 'treated' && (
                        <Tooltip title="Mark as Resolved">
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => handleOpenResolveDialog(issue)}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          color="info"
                          onClick={() => handleOpenViewDialog(issue)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Issue Summary Cards */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Issues by Type
              </Typography>
              <Box sx={{ mt: 2 }}>
                {['disease', 'pest', 'nutrient', 'water', 'other'].map((type) => {
                  const count = cropIssues.filter(issue => issue.issueType === type).length;
                  const percentage = cropIssues.length > 0 ? (count / cropIssues.length) * 100 : 0;
                  
                  return (
                    <Box key={type} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getIssueTypeIcon(type)}
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          {count} issues ({percentage.toFixed(1)}%)
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={percentage} 
                        color="primary"
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Issues by Status
              </Typography>
              <Box sx={{ mt: 2 }}>
                {['reported', 'diagnosed', 'treated', 'resolved'].map((status) => {
                  const count = cropIssues.filter(issue => issue.status === status).length;
                  const percentage = cropIssues.length > 0 ? (count / cropIssues.length) * 100 : 0;
                  
                  return (
                    <Box key={status} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Typography>
                        <Typography variant="body2">
                          {count} issues ({percentage.toFixed(1)}%)
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={percentage} 
                        color={getStatusColor(status) as any}
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Diagnose Dialog */}
      <Dialog open={openDiagnoseDialog} onClose={handleCloseDiagnoseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Diagnose Crop Issue</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                Issue Details
              </Typography>
              <Typography variant="body2">
                <strong>Field:</strong> {selectedIssue?.field.name}
              </Typography>
              <Typography variant="body2">
                <strong>Crop:</strong> {selectedIssue?.crop.name} ({selectedIssue?.crop.variety})
              </Typography>
              <Typography variant="body2">
                <strong>Reported By:</strong> {selectedIssue?.farmer.name}
              </Typography>
              <Typography variant="body2">
                <strong>Reported Date:</strong> {selectedIssue ? formatDate(selectedIssue.reportedDate) : ''}
              </Typography>
              <Typography variant="body2">
                <strong>Issue Type:</strong> {selectedIssue?.issueType ? selectedIssue.issueType.charAt(0).toUpperCase() + selectedIssue.issueType.slice(1) : ""}
              </Typography>
              <Typography variant="body2">
                <strong>Severity:</strong> {selectedIssue?.severity ? selectedIssue.severity.charAt(0).toUpperCase() + selectedIssue.severity.slice(1) : ""}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Description:</strong>
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {selectedIssue?.description}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Diagnosis"
                variant="outlined"
                multiline
                rows={3}
                value={formDiagnosis}
                onChange={(e) => setFormDiagnosis(e.target.value)}
                error={formErrors.diagnosis}
                helperText={formErrors.diagnosis ? 'Diagnosis is required' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Treatment Recommendation"
                variant="outlined"
                multiline
                rows={3}
                value={formTreatment}
                onChange={(e) => setFormTreatment(e.target.value)}
                error={formErrors.treatment}
                helperText={formErrors.treatment ? 'Treatment recommendation is required' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes (Optional)"
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
          <Button onClick={handleCloseDiagnoseDialog}>Cancel</Button>
          <Button onClick={handleDiagnoseIssue} variant="contained" color="primary">Submit Diagnosis</Button>
        </DialogActions>
      </Dialog>

      {/* Treat Dialog */}
      <Dialog open={openTreatDialog} onClose={handleCloseTreatDialog} maxWidth="md" fullWidth>
        <DialogTitle>Mark Issue as Treated</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                Issue Details
              </Typography>
              <Typography variant="body2">
                <strong>Field:</strong> {selectedIssue?.field.name}
              </Typography>
              <Typography variant="body2">
                <strong>Crop:</strong> {selectedIssue?.crop.name} ({selectedIssue?.crop.variety})
              </Typography>
              <Typography variant="body2">
                <strong>Issue Type:</strong> {selectedIssue?.issueType ? selectedIssue.issueType.charAt(0).toUpperCase() + selectedIssue.issueType.slice(1) : ""}
              </Typography>
              <Typography variant="body2">
                <strong>Diagnosis:</strong> {selectedIssue?.diagnosis}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Treatment Recommendation:</strong>
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {selectedIssue?.treatmentRecommendation}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Treatment Applied"
                variant="outlined"
                multiline
                rows={3}
                value={formTreatmentApplied}
                onChange={(e) => setFormTreatmentApplied(e.target.value)}
                placeholder="Describe the treatment that was applied"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes (Optional)"
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
          <Button onClick={handleCloseTreatDialog}>Cancel</Button>
          <Button onClick={handleTreatIssue} variant="contained" color="primary">Mark as Treated</Button>
        </DialogActions>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={openResolveDialog} onClose={handleCloseResolveDialog}>
        <DialogTitle>Mark Issue as Resolved</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark this issue as resolved? This indicates that the treatment was successful and the issue is no longer affecting the crop.
          </DialogContentText>
          <TextField
            fullWidth
            label="Resolution Notes"
            variant="outlined"
            multiline
            rows={3}
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="Describe the outcome and any follow-up recommendations"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResolveDialog}>Cancel</Button>
          <Button onClick={handleResolveIssue} variant="contained" color="success">Mark as Resolved</Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={openViewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle>Crop Issue Details</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">
                Basic Information
              </Typography>
              <Typography variant="body2">
                <strong>Field:</strong> {selectedIssue?.field.name}
              </Typography>
              <Typography variant="body2">
                <strong>Crop:</strong> {selectedIssue?.crop.name} ({selectedIssue?.crop.variety})
              </Typography>
              <Typography variant="body2">
                <strong>Reported By:</strong> {selectedIssue?.farmer.name}
              </Typography>
              <Typography variant="body2">
                <strong>Reported Date:</strong> {selectedIssue ? formatDate(selectedIssue.reportedDate) : ''}
              </Typography>
              <Typography variant="body2">
                <strong>Issue Type:</strong> {selectedIssue?.issueType ? selectedIssue.issueType.charAt(0).toUpperCase() + selectedIssue.issueType.slice(1) : ""}
              </Typography>
              <Typography variant="body2">
                <strong>Severity:</strong> {selectedIssue?.severity ? selectedIssue.severity.charAt(0).toUpperCase() + selectedIssue.severity.slice(1) : ""}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong> {selectedIssue?.status ? selectedIssue.status.charAt(0).toUpperCase() + selectedIssue.status.slice(1) : ""}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">
                Contact Information
              </Typography>
              <Typography variant="body2">
                <strong>Farmer:</strong> {selectedIssue?.farmer.name}
              </Typography>
              <Typography variant="body2">
                <strong>Email:</strong> {selectedIssue?.farmer.email}
              </Typography>
              <Typography variant="body2">
                <strong>Phone:</strong> {selectedIssue?.farmer.phone || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                Issue Description
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {selectedIssue?.description}
              </Typography>
            </Grid>
            {selectedIssue?.diagnosis && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 1 }}>
                  Diagnosis
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  <strong>Date:</strong> {selectedIssue.diagnosisDate ? formatDate(selectedIssue.diagnosisDate) : 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {selectedIssue.diagnosis}
                </Typography>
              </Grid>
            )}
            {selectedIssue?.treatmentRecommendation && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 1 }}>
                  Treatment Recommendation
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {selectedIssue.treatmentRecommendation}
                </Typography>
              </Grid>
            )}
            {selectedIssue?.treatmentApplied && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 1 }}>
                  Treatment Applied
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  <strong>Date:</strong> {selectedIssue.treatmentDate ? formatDate(selectedIssue.treatmentDate) : 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {selectedIssue.treatmentApplied}
                </Typography>
              </Grid>
            )}
            {selectedIssue?.resolvedDate && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 1 }}>
                  Resolution
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  <strong>Date:</strong> {formatDate(selectedIssue.resolvedDate)}
                </Typography>
              </Grid>
            )}
            {selectedIssue?.notes && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 1 }}>
                  Additional Notes
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-line' }}>
                  {selectedIssue.notes}
                </Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
          {selectedIssue?.status === 'reported' && (
            <Button onClick={() => {
              handleCloseViewDialog();
              handleOpenDiagnoseDialog(selectedIssue);
            }} variant="contained" color="primary">
              Diagnose Issue
            </Button>
          )}
          {selectedIssue?.status === 'diagnosed' && (
            <Button onClick={() => {
              handleCloseViewDialog();
              handleOpenTreatDialog(selectedIssue);
            }} variant="contained" color="primary">
              Mark as Treated
            </Button>
          )}
          {selectedIssue?.status === 'treated' && (
            <Button onClick={() => {
              handleCloseViewDialog();
              handleOpenResolveDialog(selectedIssue);
            }} variant="contained" color="success">
              Mark as Resolved
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AgronomistCropIssues;