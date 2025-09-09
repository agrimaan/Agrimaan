import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Link,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  Rating,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationOnIcon,
  CalendarToday as CalendarTodayIcon,
  Person as PersonIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Share as ShareIcon,
  MonetizationOn as MonetizationOnIcon,
  Agriculture as AgricultureIcon,
  Terrain as TerrainIcon,
  WaterDrop as WaterDropIcon,
  Nature as EcoIcon,
  Timeline as TimelineIcon,
  InsertChart as InsertChartIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Image as ImageIcon,
  Comment as CommentIcon
} from '@mui/icons-material';

// Mock data for project details
const mockProjects = [
  {
    id: 1,
    name: 'Organic Rice Farm Expansion',
    description: 'Expansion of organic rice cultivation in fertile lands of Punjab with sustainable farming practices.',
    detailedDescription: `
      This project aims to expand our existing organic rice cultivation operations in the fertile lands of Punjab. 
      We are committed to sustainable farming practices that preserve soil health and biodiversity while producing 
      premium quality organic rice.
      
      The expansion will cover an additional 50 acres of land, allowing us to increase production capacity by 60%. 
      We will implement advanced irrigation systems to optimize water usage and introduce new organic pest control methods.
      
      The project includes the following components:
      - Land preparation and soil enhancement using organic methods
      - Installation of water-efficient irrigation systems
      - Implementation of crop rotation and companion planting techniques
      - Construction of on-site processing and storage facilities
      - Certification and quality control processes
      
      Our team has over 15 years of experience in organic farming, and we have established relationships with premium 
      organic food distributors across India and export markets.
    `,
    location: 'Punjab, North India',
    cropType: 'Rice',
    farmSize: '50 acres',
    investmentRequired: 500000,
    investmentRaised: 350000,
    expectedROI: 12,
    duration: '12 months',
    rating: 4.5,
    reviewCount: 24,
    status: 'Active',
    startDate: '2025-06-01',
    endDate: '2026-05-31',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmljZSUyMGZhcm18ZW58MHx8MHx8&w=1000&q=80',
    isBookmarked: true,
    farmOwner: {
      name: 'Rajinder Singh',
      experience: '15 years',
      bio: 'Experienced organic farmer with expertise in sustainable rice cultivation techniques.',
      image: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    riskAssessment: {
      overall: 'Low',
      factors: [
        { name: 'Weather Conditions', risk: 'Medium', description: 'Potential for irregular monsoon patterns' },
        { name: 'Market Demand', risk: 'Low', description: 'Strong and growing demand for organic rice' },
        { name: 'Operational', risk: 'Low', description: 'Experienced team with proven track record' },
        { name: 'Financial', risk: 'Low', description: 'Conservative financial projections with buffer' }
      ]
    },
    financials: {
      totalCost: 500000,
      expectedRevenue: 750000,
      projectedProfit: 250000,
      breakevenPeriod: '8 months',
      paybackPeriod: '10 months',
      minimumInvestment: 10000
    },
    timeline: [
      { phase: 'Land Preparation', duration: '1 month', status: 'Completed' },
      { phase: 'Irrigation Setup', duration: '2 months', status: 'In Progress' },
      { phase: 'Planting', duration: '1 month', status: 'Pending' },
      { phase: 'Growth Period', duration: '4 months', status: 'Pending' },
      { phase: 'Harvest', duration: '1 month', status: 'Pending' },
      { phase: 'Processing & Distribution', duration: '3 months', status: 'Pending' }
    ],
    sustainability: {
      waterConservation: 'Drip irrigation system reduces water usage by 40%',
      soilHealth: 'Organic composting and crop rotation to maintain soil fertility',
      biodiversity: 'Dedicated 5 acres for natural habitat preservation',
      carbonFootprint: '30% lower than conventional farming methods'
    },
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmljZSUyMGZhcm18ZW58MHx8MHx8&w=1000&q=80',
      'https://images.unsplash.com/photo-1595339406911-b1f1b4e9e5a7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8cmljZSUyMGZhcm18ZW58MHx8MHx8&w=1000&q=80',
      'https://images.unsplash.com/photo-1626289535777-68d7b2a6a6b4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8cmljZSUyMGZhcm18ZW58MHx8MHx8&w=1000&q=80'
    ],
    reviews: [
      { 
        user: 'Amit Patel', 
        rating: 5, 
        date: '2025-08-01', 
        comment: 'Excellent project with transparent management and regular updates. The returns have been consistent with projections.' 
      },
      { 
        user: 'Priya Sharma', 
        rating: 4, 
        date: '2025-07-15', 
        comment: 'Good investment opportunity. The team is responsive and provides detailed reports on progress.' 
      },
      { 
        user: 'Vikram Mehta', 
        rating: 5, 
        date: '2025-07-10', 
        comment: 'I appreciate the focus on sustainability while maintaining good returns. The project is well-managed.' 
      }
    ]
  },
  {
    id: 2,
    name: 'Sustainable Wheat Cultivation',
    description: 'Implementing sustainable wheat farming techniques to increase yield and reduce environmental impact.',
    detailedDescription: `
      This project focuses on implementing sustainable wheat farming techniques in Haryana to increase yield while reducing environmental impact. 
      We are adopting a holistic approach to wheat cultivation that combines traditional knowledge with modern agricultural science.
      
      The project covers 75 acres of prime agricultural land and aims to demonstrate how sustainable practices can lead to 
      higher productivity and better economic outcomes for farmers.
      
      Key components of the project include:
      - Implementation of conservation tillage to reduce soil erosion
      - Precision agriculture techniques for optimal resource utilization
      - Integrated pest management to minimize chemical inputs
      - Water-efficient irrigation systems
      - Post-harvest processing facilities to increase value addition
      
      Our team consists of agricultural experts with backgrounds in agronomy, soil science, and sustainable farming practices.
      We have partnerships with agricultural universities and research institutions to continuously improve our methods.
    `,
    location: 'Haryana, North India',
    cropType: 'Wheat',
    farmSize: '75 acres',
    investmentRequired: 750000,
    investmentRaised: 450000,
    expectedROI: 11,
    duration: '8 months',
    rating: 4.2,
    reviewCount: 18,
    status: 'Active',
    startDate: '2025-07-15',
    endDate: '2026-03-15',
    image: 'https://images.unsplash.com/photo-1536657464919-892534f79d6f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8d2hlYXQlMjBmaWVsZHxlbnwwfHwwfHw%3D&w=1000&q=80',
    isBookmarked: false,
    farmOwner: {
      name: 'Harpreet Kaur',
      experience: '12 years',
      bio: 'Agricultural scientist turned farmer with focus on sustainable wheat cultivation.',
      image: 'https://randomuser.me/api/portraits/women/45.jpg'
    },
    riskAssessment: {
      overall: 'Low-Medium',
      factors: [
        { name: 'Weather Conditions', risk: 'Medium', description: 'Potential for unseasonal rains' },
        { name: 'Market Demand', risk: 'Low', description: 'Stable demand for wheat products' },
        { name: 'Operational', risk: 'Low', description: 'Well-established farming practices' },
        { name: 'Financial', risk: 'Medium', description: 'Initial investment in sustainable technologies' }
      ]
    },
    financials: {
      totalCost: 750000,
      expectedRevenue: 975000,
      projectedProfit: 225000,
      breakevenPeriod: '6 months',
      paybackPeriod: '8 months',
      minimumInvestment: 15000
    },
    timeline: [
      { phase: 'Land Preparation', duration: '1 month', status: 'Completed' },
      { phase: 'Sowing', duration: '1 month', status: 'In Progress' },
      { phase: 'Growth Period', duration: '3 months', status: 'Pending' },
      { phase: 'Harvest', duration: '1 month', status: 'Pending' },
      { phase: 'Processing & Distribution', duration: '2 months', status: 'Pending' }
    ],
    sustainability: {
      waterConservation: 'Precision irrigation reduces water usage by 35%',
      soilHealth: 'Minimal tillage practices to preserve soil structure',
      biodiversity: 'Buffer zones and hedgerows to support local wildlife',
      carbonFootprint: '25% lower than conventional wheat farming'
    },
    images: [
      'https://images.unsplash.com/photo-1536657464919-892534f79d6f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8d2hlYXQlMjBmaWVsZHxlbnwwfHwwfHw%3D&w=1000&q=80',
      'https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8d2hlYXQlMjBmaWVsZHxlbnwwfHwwfHw%3D&w=1000&q=80',
      'https://images.unsplash.com/photo-1629721671030-a83fcdc3bc43?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8d2hlYXQlMjBmaWVsZHxlbnwwfHwwfHw%3D&w=1000&q=80'
    ],
    reviews: [
      { 
        user: 'Rahul Gupta', 
        rating: 4, 
        date: '2025-08-05', 
        comment: 'Solid project with good potential. The sustainable approach is commendable.' 
      },
      { 
        user: 'Neha Singh', 
        rating: 5, 
        date: '2025-07-22', 
        comment: 'Very impressed with the management team and their attention to detail. Regular updates keep investors informed.' 
      },
      { 
        user: 'Sanjay Verma', 
        rating: 4, 
        date: '2025-07-12', 
        comment: 'Good investment with reasonable risk profile. The focus on sustainability adds long-term value.' 
      }
    ]
  }
];

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
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
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

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [openInvestDialog, setOpenInvestDialog] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Simulate API call to fetch project details
    const fetchProject = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        const projectId = parseInt(id || '1');
        const foundProject = mockProjects.find(p => p.id === projectId);
        
        if (foundProject) {
          setProject(foundProject);
          setIsBookmarked(foundProject.isBookmarked);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBookmarkToggle = () => {
    setIsBookmarked(!isBookmarked);
    // In a real app, this would call an API to update the bookmark status
  };

  const handleInvestDialogOpen = () => {
    setOpenInvestDialog(true);
  };

  const handleInvestDialogClose = () => {
    setOpenInvestDialog(false);
  };

  const handleInvestmentSubmit = () => {
    // In a real app, this would call an API to process the investment
    console.log(`Investing ${investmentAmount} in project ${id}`);
    setOpenInvestDialog(false);
    // Show success message or redirect
  };

  const nextImage = () => {
    if (project && project.images) {
      setCurrentImageIndex((currentImageIndex + 1) % project.images.length);
    }
  };

  const prevImage = () => {
    if (project && project.images) {
      setCurrentImageIndex((currentImageIndex - 1 + project.images.length) % project.images.length);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
          <LinearProgress sx={{ width: '50%' }} />
        </Box>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error">
            Project not found
          </Typography>
          <Button 
            component={RouterLink} 
            to="/investor/projects" 
            startIcon={<ArrowBackIcon />}
            sx={{ mt: 2 }}
          >
            Back to Projects
          </Button>
        </Paper>
      </Container>
    );
  }

  const progressPercentage = Math.round((project.investmentRaised / project.investmentRequired) * 100);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box mb={3}>
        <Button 
          component={RouterLink} 
          to="/investor/projects" 
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Projects
        </Button>
        
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Typography variant="h4" component="h1" gutterBottom>
            {project.name}
          </Typography>
          <Box>
            <IconButton onClick={handleBookmarkToggle} color={isBookmarked ? 'primary' : 'default'}>
              {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </IconButton>
            <IconButton>
              <ShareIcon />
            </IconButton>
          </Box>
        </Box>
        
        <Box display="flex" alignItems="center" mb={1}>
          <LocationOnIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
          <Typography variant="body1" color="text.secondary">
            {project.location}
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center" mb={2}>
          <Rating value={project.rating} precision={0.5} size="small" readOnly />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({project.reviewCount} reviews)
          </Typography>
        </Box>
      </Box>
      
      {/* Project Image Carousel */}
      <Paper sx={{ position: 'relative', mb: 4, borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ position: 'relative', height: 400 }}>
          <CardMedia
            component="img"
            height="400"
            image={project.images[currentImageIndex]}
            alt={project.name}
            sx={{ objectFit: 'cover' }}
          />
          {project.images.length > 1 && (
            <>
              <IconButton 
                sx={{ 
                  position: 'absolute', 
                  left: 16, 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255,255,255,0.8)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                }}
                onClick={prevImage}
              >
                <ArrowBackIcon />
              </IconButton>
              <IconButton 
                sx={{ 
                  position: 'absolute', 
                  right: 16, 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255,255,255,0.8)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                }}
                onClick={nextImage}
              >
                <ArrowBackIcon sx={{ transform: 'rotate(180deg)' }} />
              </IconButton>
              <Box 
                sx={{ 
                  position: 'absolute', 
                  bottom: 16, 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: 1
                }}
              >
                {project.images.map((_: string, index: number) => (
                  <Box 
                    key={index}
                    sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      bgcolor: index === currentImageIndex ? 'primary.main' : 'rgba(255,255,255,0.7)',
                      cursor: 'pointer'
                    }}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </Box>
            </>
          )}
        </Box>
      </Paper>
      
      <Grid container spacing={4}>
        {/* Left Column - Project Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ mb: 4 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="project tabs">
                <Tab label="Overview" />
                <Tab label="Financials" />
                <Tab label="Timeline" />
                <Tab label="Sustainability" />
                <Tab label="Reviews" />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>
                Project Description
              </Typography>
              <Typography variant="body1" paragraph>
                {project.detailedDescription}
              </Typography>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Farm Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <AgricultureIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Crop Type
                      </Typography>
                      <Typography variant="body1">
                        {project.cropType}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <TerrainIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Farm Size
                      </Typography>
                      <Typography variant="body1">
                        {project.farmSize}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <CalendarTodayIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Project Duration
                      </Typography>
                      <Typography variant="body1">
                        {project.duration}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <MonetizationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Expected ROI
                      </Typography>
                      <Typography variant="body1">
                        {project.expectedROI}%
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Risk Assessment
              </Typography>
              <Box mb={2}>
                <Typography variant="body1" fontWeight="medium">
                  Overall Risk: <Chip label={project.riskAssessment.overall} color={project.riskAssessment.overall === 'Low' ? 'success' : project.riskAssessment.overall === 'Medium' ? 'warning' : 'error'} size="small" />
                </Typography>
              </Box>
              <Grid container spacing={2}>
                {project.riskAssessment.factors.map((factor: any, index: number) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="body1" fontWeight="medium">
                          {factor.name}
                        </Typography>
                        <Box display="flex" alignItems="center" mt={1}>
                          <Chip 
                            label={factor.risk} 
                            size="small" 
                            color={factor.risk === 'Low' ? 'success' : factor.risk === 'Medium' ? 'warning' : 'error'} 
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {factor.description}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>
                Financial Overview
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Investment Details
                      </Typography>
                      
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <MonetizationOnIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Total Investment Required" 
                            secondary={`₹${project.financials.totalCost.toLocaleString()}`} 
                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                            secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <MonetizationOnIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Minimum Investment" 
                            secondary={`₹${project.financials.minimumInvestment.toLocaleString()}`} 
                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                            secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <TimelineIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Expected ROI" 
                            secondary={`${project.expectedROI}%`} 
                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                            secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CalendarTodayIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Payback Period" 
                            secondary={project.financials.paybackPeriod} 
                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                            secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Projected Returns
                      </Typography>
                      
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <MonetizationOnIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Expected Revenue" 
                            secondary={`₹${project.financials.expectedRevenue.toLocaleString()}`} 
                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                            secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <MonetizationOnIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Projected Profit" 
                            secondary={`₹${project.financials.projectedProfit.toLocaleString()}`} 
                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                            secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <InsertChartIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Profit Margin" 
                            secondary={`${Math.round((project.financials.projectedProfit / project.financials.expectedRevenue) * 100)}%`} 
                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                            secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CalendarTodayIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Breakeven Period" 
                            secondary={project.financials.breakevenPeriod} 
                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                            secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Box mt={4}>
                <Typography variant="h6" gutterBottom>
                  Financial Projections
                </Typography>
                
                {/* Placeholder for financial chart */}
                <Box sx={{ height: 300, bgcolor: 'background.paper', p: 2, borderRadius: 1, border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                  <Typography color="text.secondary">
                    Financial Projections Chart would be displayed here
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  * Projections are based on historical data and market analysis. Actual results may vary.
                </Typography>
              </Box>
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Project Timeline
              </Typography>
              
              <Box sx={{ position: 'relative', mb: 4 }}>
                {/* Timeline line */}
                <Box sx={{ position: 'absolute', left: 16, top: 0, bottom: 0, width: 2, bgcolor: 'divider' }} />
                
                {project.timeline.map((phase: any, index: number) => (
                  <Box key={index} sx={{ position: 'relative', pl: 5, pb: 4 }}>
                    {/* Timeline dot */}
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        left: 8, 
                        top: 0, 
                        width: 18, 
                        height: 18, 
                        borderRadius: '50%', 
                        bgcolor: phase.status === 'Completed' ? 'success.main' : phase.status === 'In Progress' ? 'primary.main' : 'text.disabled',
                        border: '3px solid white',
                        zIndex: 1
                      }} 
                    />
                    
                    <Typography variant="h6" gutterBottom>
                      {phase.phase}
                    </Typography>
                    
                    <Box display="flex" alignItems="center" mb={1}>
                      <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Duration: {phase.duration}
                      </Typography>
                    </Box>
                    
                    <Chip 
                      label={phase.status} 
                      size="small" 
                      color={
                        phase.status === 'Completed' ? 'success' : 
                        phase.status === 'In Progress' ? 'primary' : 
                        'default'
                      } 
                    />
                  </Box>
                ))}
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Key Milestones
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body1" fontWeight="medium" gutterBottom>
                        Project Start
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(project.startDate).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body1" fontWeight="medium" gutterBottom>
                        First Harvest
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(new Date(project.startDate).setMonth(new Date(project.startDate).getMonth() + 6)).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body1" fontWeight="medium" gutterBottom>
                        Project Completion
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(project.endDate).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
            
            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom>
                Sustainability Practices
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <WaterDropIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6">
                          Water Conservation
                        </Typography>
                      </Box>
                      <Typography variant="body1">
                        {project.sustainability.waterConservation}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <TerrainIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6">
                          Soil Health
                        </Typography>
                      </Box>
                      <Typography variant="body1">
                        {project.sustainability.soilHealth}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <EcoIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6">
                          Biodiversity
                        </Typography>
                      </Box>
                      <Typography variant="body1">
                        {project.sustainability.biodiversity}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <EcoIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6">
                          Carbon Footprint
                        </Typography>
                      </Box>
                      <Typography variant="body1">
                        {project.sustainability.carbonFootprint}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Box mt={4}>
                <Typography variant="h6" gutterBottom>
                  Sustainability Certifications
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4} md={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <EcoIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="body1" fontWeight="medium">
                          Organic Certified
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={6} sm={4} md={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <WaterDropIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="body1" fontWeight="medium">
                          Water Efficient
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={6} sm={4} md={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <TerrainIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="body1" fontWeight="medium">
                          Soil Friendly
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>
            
            <TabPanel value={tabValue} index={4}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">
                  Investor Reviews
                </Typography>
                <Box display="flex" alignItems="center">
                  <Typography variant="body1" fontWeight="medium" mr={1}>
                    {project.rating}
                  </Typography>
                  <Rating value={project.rating} precision={0.5} readOnly />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    ({project.reviewCount} reviews)
                  </Typography>
                </Box>
              </Box>
              
              {project.reviews && project.reviews.map((review: any, index: number) => (
                <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ mr: 2 }}>{review.user.charAt(0)}</Avatar>
                      <Typography variant="body1" fontWeight="medium">
                        {review.user}
                      </Typography>
                    </Box>
                    <Rating value={review.rating} size="small" readOnly />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    {new Date(review.date).toLocaleDateString()}
                  </Typography>
                  
                  <Typography variant="body1">
                    {review.comment}
                  </Typography>
                </Paper>
              ))}
              
              <Box mt={3} textAlign="center">
                <Button variant="outlined" startIcon={<CommentIcon />}>
                  See All Reviews
                </Button>
              </Box>
            </TabPanel>
          </Paper>
        </Grid>
        
        {/* Right Column - Investment Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 24 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Investment Progress
              </Typography>
              
              <Box mb={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    {progressPercentage}% Funded
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ₹{project.investmentRaised.toLocaleString()} of ₹{project.investmentRequired.toLocaleString()}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={progressPercentage} 
                  sx={{ height: 10, borderRadius: 5, mt: 1 }}
                />
              </Box>
              
              <Box textAlign="center" my={3}>
                <Typography variant="h5" color="primary" gutterBottom>
                  {project.expectedROI}% ROI
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Expected Annual Return
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <MonetizationOnIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Minimum Investment" 
                    secondary={`₹${project.financials.minimumInvestment.toLocaleString()}`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarTodayIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Project Duration" 
                    secondary={project.duration} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Farm Owner" 
                    secondary={project.farmOwner.name} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Status" 
                    secondary={project.status} 
                  />
                </ListItem>
              </List>
              
              <Button 
                variant="contained" 
                fullWidth 
                size="large" 
                sx={{ mt: 2 }}
                onClick={handleInvestDialogOpen}
              >
                Invest Now
              </Button>
              
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ mt: 2 }}
                onClick={handleBookmarkToggle}
                startIcon={isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
              >
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </Button>
            </CardContent>
          </Card>
          
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar src={project.farmOwner.image} sx={{ width: 56, height: 56, mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {project.farmOwner.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {project.farmOwner.experience} of experience
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="body1" paragraph>
                {project.farmOwner.bio}
              </Typography>
              
              <Button variant="outlined" fullWidth>
                Contact Farm Owner
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Investment Dialog */}
      <Dialog open={openInvestDialog} onClose={handleInvestDialogClose}>
        <DialogTitle>Invest in {project.name}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the amount you would like to invest. The minimum investment amount is ₹{project.financials.minimumInvestment.toLocaleString()}.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Investment Amount (₹)"
            type="number"
            fullWidth
            variant="outlined"
            value={investmentAmount}
            onChange={(e) => setInvestmentAmount(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
            sx={{ mt: 2 }}
          />
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              Expected Annual Return: <Typography component="span" fontWeight="bold" color="primary">{project.expectedROI}%</Typography>
            </Typography>
            {investmentAmount && (
              <Typography variant="body2" color="text.secondary">
                Estimated Annual Return: <Typography component="span" fontWeight="bold" color="primary">₹{Math.round(Number(investmentAmount) * (project.expectedROI / 100)).toLocaleString()}</Typography>
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleInvestDialogClose}>Cancel</Button>
          <Button 
            onClick={handleInvestmentSubmit} 
            variant="contained"
            disabled={!investmentAmount || Number(investmentAmount) < project.financials.minimumInvestment}
          >
            Invest
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectDetail;