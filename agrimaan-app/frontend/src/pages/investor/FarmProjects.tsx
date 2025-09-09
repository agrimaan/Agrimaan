import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Typography,
  Paper,
  Tabs,
  Tab,
  Divider,
  Button,
  MenuItem,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  LinearProgress,
  Link,
  Rating
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  LocationOn as LocationOnIcon,
  CalendarToday as CalendarTodayIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  ArrowForward as ArrowForwardIcon,
  Agriculture as AgricultureIcon
} from '@mui/icons-material';

// Mock data for farm projects
const mockProjects = [
  {
    id: 1,
    name: 'Organic Rice Farm Expansion',
    description: 'Expansion of organic rice cultivation in fertile lands of Punjab with sustainable farming practices.',
    location: 'Punjab, North India',
    cropType: 'Rice',
    farmSize: '50 acres',
    investmentRequired: 500000,
    investmentRaised: 350000,
    expectedROI: 12,
    duration: '12 months',
    rating: 4.5,
    reviews: 24,
    status: 'Active',
    startDate: '2025-06-01',
    endDate: '2026-05-31',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmljZSUyMGZhcm18ZW58MHx8MHx8&w=1000&q=80',
    isBookmarked: true
  },
  {
    id: 2,
    name: 'Sustainable Wheat Cultivation',
    description: 'Implementing sustainable wheat farming techniques to increase yield and reduce environmental impact.',
    location: 'Haryana, North India',
    cropType: 'Wheat',
    farmSize: '75 acres',
    investmentRequired: 750000,
    investmentRaised: 450000,
    expectedROI: 11,
    duration: '8 months',
    rating: 4.2,
    reviews: 18,
    status: 'Active',
    startDate: '2025-07-15',
    endDate: '2026-03-15',
    image: 'https://images.unsplash.com/photo-1536657464919-892534f79d6f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8d2hlYXQlMjBmaWVsZHxlbnwwfHwwfHw%3D&w=1000&q=80',
    isBookmarked: false
  },
  {
    id: 3,
    name: 'Vertical Farming Initiative',
    description: 'State-of-the-art vertical farming project to grow leafy greens and herbs in urban areas.',
    location: 'Bangalore, South India',
    cropType: 'Mixed Greens',
    farmSize: '0.5 acres (vertical)',
    investmentRequired: 1000000,
    investmentRaised: 800000,
    expectedROI: 14,
    duration: '24 months',
    rating: 4.8,
    reviews: 32,
    status: 'Active',
    startDate: '2025-05-01',
    endDate: '2027-04-30',
    image: 'https://images.unsplash.com/photo-1505471768190-275e2ad7b3f9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8dmVydGljYWwlMjBmYXJtaW5nfGVufDB8fDB8fA%3D%3D&w=1000&q=80',
    isBookmarked: true
  },
  {
    id: 4,
    name: 'Hydroponic Vegetable Project',
    description: 'Hydroponic system for growing premium vegetables with minimal water usage and maximum efficiency.',
    location: 'Chennai, South India',
    cropType: 'Vegetables',
    farmSize: '1 acre (hydroponic)',
    investmentRequired: 600000,
    investmentRaised: 450000,
    expectedROI: 13,
    duration: '18 months',
    rating: 4.3,
    reviews: 15,
    status: 'Active',
    startDate: '2025-08-01',
    endDate: '2027-01-31',
    image: 'https://images.unsplash.com/photo-1489789190018-6c242e189427?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8aHlkcm9wb25pY3N8ZW58MHx8MHx8&w=1000&q=80',
    isBookmarked: false
  },
  {
    id: 5,
    name: 'Mango Orchard Expansion',
    description: 'Expansion of premium mango varieties cultivation with modern irrigation and farming techniques.',
    location: 'Maharashtra, West India',
    cropType: 'Mango',
    farmSize: '30 acres',
    investmentRequired: 1200000,
    investmentRaised: 900000,
    expectedROI: 15,
    duration: '36 months',
    rating: 4.7,
    reviews: 29,
    status: 'Active',
    startDate: '2025-04-01',
    endDate: '2028-03-31',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bWFuZ28lMjBvcmNoYXJkfGVufDB8fDB8fA%3D%3D&w=1000&q=80',
    isBookmarked: true
  }
];

// Summary data
const summaryData = {
  totalProjects: mockProjects.length,
  activeProjects: mockProjects.filter(p => p.status === 'Active').length,
  totalInvestmentOpportunity: mockProjects.reduce((sum, p) => sum + p.investmentRequired, 0),
  averageROI: mockProjects.reduce((sum, p) => sum + p.expectedROI, 0) / mockProjects.length
};

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
      id={`projects-tabpanel-${index}`}
      aria-labelledby={`projects-tab-${index}`}
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

const FarmProjects: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCropType, setFilterCropType] = useState('All');
  const [filterLocation, setFilterLocation] = useState('All');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Get unique crop types and locations for filters
  const cropTypes = ['All', ...Array.from(new Set(mockProjects.map(project => project.cropType)))];
  const locations = ['All', ...Array.from(new Set(mockProjects.map(project => project.location.split(',')[1].trim())))];

  // Filter projects based on search term and filters
  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCropType = filterCropType === 'All' || project.cropType === filterCropType;
    const matchesLocation = filterLocation === 'All' || project.location.includes(filterLocation);
    
    return matchesSearch && matchesCropType && matchesLocation;
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Page Header */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" component="h1" gutterBottom>
              Farm Projects
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AgricultureIcon />}
              color="primary"
            >
              Explore New Projects
            </Button>
          </Box>
          <Typography variant="subtitle1" color="text.secondary" paragraph>
            Discover and invest in sustainable agricultural projects across India
          </Typography>
        </Grid>

        {/* Summary Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Projects
              </Typography>
              <Typography variant="h4" component="div">
                {summaryData.totalProjects}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {summaryData.activeProjects} active projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Investment Opportunity
              </Typography>
              <Typography variant="h4" component="div">
                \u20b9{(summaryData.totalInvestmentOpportunity / 1000000).toFixed(1)}M
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Total funding required
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Average ROI
              </Typography>
              <Typography variant="h4" component="div">
                {summaryData.averageROI.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Expected annual return
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Bookmarked Projects
              </Typography>
              <Typography variant="h4" component="div">
                {mockProjects.filter(p => p.isBookmarked).length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Projects you're interested in
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Search and Filters */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={filterCropType}
                  onChange={(e) => setFilterCropType(e.target.value)}
                  label="Crop Type"
                >
                  {cropTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  label="Region"
                >
                  {locations.map(location => (
                    <MenuItem key={location} value={location}>{location}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Projects Tabs */}
        <Grid item xs={12}>
          <Paper sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="projects tabs">
                <Tab label="All Projects" />
                <Tab label="Bookmarked" />
                <Tab label="Invested" />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map(project => (
                    <Grid item xs={12} md={6} key={project.id}>
                      <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={project.image}
                          alt={project.name}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Typography variant="h6" component="div" gutterBottom>
                              {project.name}
                            </Typography>
                            <IconButton size="small">
                              {project.isBookmarked ? (
                                <BookmarkIcon color="primary" />
                              ) : (
                                <BookmarkBorderIcon />
                              )}
                            </IconButton>
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {project.description}
                          </Typography>
                          
                          <Box display="flex" alignItems="center" mb={1}>
                            <LocationOnIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {project.location}
                            </Typography>
                          </Box>
                          
                          <Box display="flex" alignItems="center" mb={1}>
                            <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              Duration: {project.duration}
                            </Typography>
                          </Box>
                          
                          <Box display="flex" alignItems="center" mb={2}>
                            <Rating value={project.rating} precision={0.5} size="small" readOnly />
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                              ({project.reviews} reviews)
                            </Typography>
                          </Box>
                          
                          <Divider sx={{ my: 1 }} />
                          
                          <Box mb={2}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Investment Progress
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={(project.investmentRaised / project.investmentRequired) * 100} 
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                            <Box display="flex" justifyContent="space-between" mt={0.5}>
                              <Typography variant="body2" color="text.secondary">
                                \u20b9{project.investmentRaised.toLocaleString()} raised
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {Math.round((project.investmentRaised / project.investmentRequired) * 100)}%
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Expected ROI
                              </Typography>
                              <Typography variant="h6" color="primary">
                                {project.expectedROI}%
                              </Typography>
                            </Box>
                            <Button 
                              variant="contained" 
                              size="small" 
                              endIcon={<ArrowForwardIcon />}
                              component={RouterLink}
                              to={`/investor/projects/${project.id}`}
                            >
                              View Details
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No projects found matching your criteria
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                {filteredProjects.filter(p => p.isBookmarked).length > 0 ? (
                  filteredProjects
                    .filter(p => p.isBookmarked)
                    .map(project => (
                      <Grid item xs={12} md={6} key={project.id}>
                        <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                          <CardMedia
                            component="img"
                            height="200"
                            image={project.image}
                            alt={project.name}
                          />
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                              <Typography variant="h6" component="div" gutterBottom>
                                {project.name}
                              </Typography>
                              <IconButton size="small">
                                <BookmarkIcon color="primary" />
                              </IconButton>
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" paragraph>
                              {project.description}
                            </Typography>
                            
                            <Box display="flex" alignItems="center" mb={1}>
                              <LocationOnIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {project.location}
                              </Typography>
                            </Box>
                            
                            <Box display="flex" alignItems="center" mb={1}>
                              <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                Duration: {project.duration}
                              </Typography>
                            </Box>
                            
                            <Box display="flex" alignItems="center" mb={2}>
                              <Rating value={project.rating} precision={0.5} size="small" readOnly />
                              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                ({project.reviews} reviews)
                              </Typography>
                            </Box>
                            
                            <Divider sx={{ my: 1 }} />
                            
                            <Box mb={2}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Investment Progress
                              </Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={(project.investmentRaised / project.investmentRequired) * 100} 
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                              <Box display="flex" justifyContent="space-between" mt={0.5}>
                                <Typography variant="body2" color="text.secondary">
                                  \u20b9{project.investmentRaised.toLocaleString()} raised
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {Math.round((project.investmentRaised / project.investmentRequired) * 100)}%
                                </Typography>
                              </Box>
                            </Box>
                            
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Expected ROI
                                </Typography>
                                <Typography variant="h6" color="primary">
                                  {project.expectedROI}%
                                </Typography>
                              </Box>
                              <Button 
                                variant="contained" 
                                size="small" 
                                endIcon={<ArrowForwardIcon />}
                                component={RouterLink}
                                to={`/investor/projects/${project.id}`}
                              >
                                View Details
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))
                ) : (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No bookmarked projects found
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  You haven't invested in any projects yet
                </Typography>
              </Box>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FarmProjects;
