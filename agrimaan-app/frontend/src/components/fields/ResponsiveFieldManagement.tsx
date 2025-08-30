import React, { useState } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Button, 
  IconButton, 
  Chip, 
  Divider, 
  useTheme, 
  useMediaQuery,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Fab,
  Drawer,
  AppBar,
  Toolbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
// ...existing code...
import LandscapeIcon from '@mui/icons-material/Landscape';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import SensorsIcon from '@mui/icons-material/Sensors';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { FieldMap } from '../visualizations';

// Define prop types for the component
interface ResponsiveFieldManagementProps {
  fields: Array<{
    _id: string;
    name: string;
    location: {
      lat: number;
      lng: number;
    };
    boundaries?: {
      type: string;
      coordinates: number[][][];
    };
    area?: number;
    soilType?: string;
    status?: string;
    crops?: Array<{
      _id: string;
      name: string;
      type: string;
      status: string;
    }>;
    sensors?: Array<{
      _id: string;
      name: string;
      type: string;
      status: string;
    }>;
    lastUpdated?: string;
    image?: string;
  }>;
  loading?: boolean;
  error?: string | null;
  onFieldClick?: (fieldId: string) => void;
  onAddField?: () => void;
  onEditField?: (fieldId: string) => void;
  onDeleteField?: (fieldId: string) => void;
  onViewCrops?: (fieldId: string) => void;
  onViewSensors?: (fieldId: string) => void;
  onViewWeather?: (fieldId: string) => void;
  onViewAnalytics?: (fieldId: string) => void;
}

// Define tab interface
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab Panel component
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`field-tabpanel-${index}`}
      aria-labelledby={`field-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const ResponsiveFieldManagement: React.FC<ResponsiveFieldManagementProps> = ({
  fields,
  loading = false,
  error = null,
  onFieldClick,
  onAddField,
  onEditField,
  onDeleteField,
  onViewCrops,
  onViewSensors,
  onViewWeather,
  onViewAnalytics
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedDetailField, setSelectedDetailField] = useState<typeof fields[0] | null>(null);
  
  // Filter options
  const [filterSoilType, setFilterSoilType] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  
  // Sort option
  const [sortOption, setSortOption] = useState<'name' | 'area' | 'updated'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Handle search change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Handle filter menu open
  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  // Handle filter menu close
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  // Handle sort menu open
  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  // Handle sort menu close
  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  // Handle field menu open
  const handleFieldMenuClick = (event: React.MouseEvent<HTMLElement>, fieldId: string) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedField(fieldId);
  };

  // Handle field menu close
  const handleFieldMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedField(null);
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle soil type filter change
  const handleSoilTypeFilterChange = (soilType: string) => {
    if (filterSoilType.includes(soilType)) {
      setFilterSoilType(filterSoilType.filter(type => type !== soilType));
    } else {
      setFilterSoilType([...filterSoilType, soilType]);
    }
  };

  // Handle status filter change
  const handleStatusFilterChange = (status: string) => {
    if (filterStatus.includes(status)) {
      setFilterStatus(filterStatus.filter(s => s !== status));
    } else {
      setFilterStatus([...filterStatus, status]);
    }
  };

  // Handle sort option change
  const handleSortOptionChange = (option: 'name' | 'area' | 'updated', direction: 'asc' | 'desc') => {
    setSortOption(option);
    setSortDirection(direction);
    handleSortClose();
  };

  // Handle field click
  const handleFieldClick = (field: typeof fields[0]) => {
    if (isMobile || isTablet) {
      setSelectedDetailField(field);
      setDetailDrawerOpen(true);
    } else if (onFieldClick) {
      onFieldClick(field._id);
    }
  };

  // Handle detail drawer close
  const handleDetailDrawerClose = () => {
    setDetailDrawerOpen(false);
    setSelectedDetailField(null);
  };

  // Filter and sort fields
  const filteredFields = fields
    .filter(field => {
      // Search filter
      const matchesSearch = field.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Soil type filter
      const matchesSoilType = filterSoilType.length === 0 || 
        (field.soilType && filterSoilType.includes(field.soilType));
      
      // Status filter
      const matchesStatus = filterStatus.length === 0 || 
        (field.status && filterStatus.includes(field.status));
      
      return matchesSearch && matchesSoilType && matchesStatus;
    })
    .sort((a, b) => {
      // Sort by selected option
      if (sortOption === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortOption === 'area') {
        const areaA = a.area || 0;
        const areaB = b.area || 0;
        return sortDirection === 'asc' 
          ? areaA - areaB
          : areaB - areaA;
      } else if (sortOption === 'updated') {
        const dateA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
        const dateB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
        return sortDirection === 'asc' 
          ? dateA - dateB
          : dateB - dateA;
      }
      return 0;
    });

  // Get all unique soil types
  const soilTypes = Array.from(new Set(fields.map(field => field.soilType).filter(Boolean) as string[]));
  
  // Get all unique statuses
  const statuses = Array.from(new Set(fields.map(field => field.status).filter(Boolean) as string[]));

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Render field card
  const renderFieldCard = (field: typeof fields[0]) => {
    return (
      <Card 
        elevation={2} 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6
          }
        }}
        onClick={() => handleFieldClick(field)}
      >
        <Box sx={{ position: 'relative' }}>
          {field.image ? (
            <CardMedia
              component="img"
              height="140"
              image={field.image}
              alt={field.name}
            />
          ) : (
            <Box 
              sx={{ 
                height: 140, 
                backgroundColor: `${theme.palette.primary.main}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <LandscapeIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />
            </Box>
          )}
          
          <IconButton
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              }
            }}
            onClick={(e) => handleFieldMenuClick(e, field._id)}
          >
            <MoreVertIcon />
          </IconButton>
          
          {field.status && (
            <Chip
              label={field.status}
              size="small"
              color={
                field.status === 'active' ? 'success' :
                field.status === 'inactive' ? 'error' :
                'default'
              }
              sx={{
                position: 'absolute',
                bottom: 8,
                left: 8
              }}
            />
          )}
        </Box>
        
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" gutterBottom>
            {field.name}
          </Typography>
          
          <Box sx={{ mb: 1 }}>
            {field.soilType && (
              <Typography variant="body2" color="text.secondary">
                Soil Type: {field.soilType}
              </Typography>
            )}
            
            {field.area && (
              <Typography variant="body2" color="text.secondary">
                Area: {field.area} ha
              </Typography>
            )}
          </Box>
          
          <Divider sx={{ my: 1 }} />
          
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Crops
              </Typography>
              <Typography variant="body2">
                {field.crops?.length || 0}
              </Typography>
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Sensors
              </Typography>
              <Typography variant="body2">
                {field.sensors?.length || 0}
              </Typography>
            </Grid>
          </Grid>
          
          {field.lastUpdated && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Last updated: {new Date(field.lastUpdated).toLocaleDateString()}
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  };

  // Render field list view
  const renderFieldList = () => {
    return (
      <Grid container spacing={3}>
        {filteredFields.map((field) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={field._id}>
            {renderFieldCard(field)}
          </Grid>
        ))}
      </Grid>
    );
  };

  // Render field map view
  const renderFieldMap = () => {
    // Create a combined field with all boundaries for the map
    const combinedField = {
      _id: 'all-fields',
      name: 'All Fields',
      location: fields[0]?.location || { lat: 0, lng: 0 },
      boundaries: undefined
    };
    
    return (
      <Box sx={{ height: 600, width: '100%' }}>
        <FieldMap
          fieldData={combinedField}
          sensors={[]}
          crops={[]}
          height="100%"
          width="100%"
        />
      </Box>
    );
  };

  // Render field detail drawer
  const renderFieldDetailDrawer = () => {
    if (!selectedDetailField) return null;
    
    return (
      <Drawer
        anchor="right"
        open={detailDrawerOpen}
        onClose={handleDetailDrawerClose}
        sx={{
          '& .MuiDrawer-paper': { 
            width: { xs: '100%', sm: 400 },
            boxSizing: 'border-box',
          },
        }}
      >
        <AppBar position="static" color="default" elevation={0}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {selectedDetailField.name}
            </Typography>
            <IconButton edge="end" color="inherit" onClick={handleDetailDrawerClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        
        <Box sx={{ p: 2 }}>
          {/* Field Map */}
          <Box sx={{ height: 200, mb: 2 }}>
            <FieldMap
              fieldData={selectedDetailField}
              height="100%"
              width="100%"
              interactive={false}
              showLegend={false}
            />
          </Box>
          
          {/* Field Details */}
          <Typography variant="h6" gutterBottom>Field Details</Typography>
          
          <Grid container spacing={2}>
            {selectedDetailField.area && (
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Area
                </Typography>
                <Typography variant="body1">
                  {selectedDetailField.area} ha
                </Typography>
              </Grid>
            )}
            
            {selectedDetailField.soilType && (
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Soil Type
                </Typography>
                <Typography variant="body1">
                  {selectedDetailField.soilType}
                </Typography>
              </Grid>
            )}
            
            {selectedDetailField.status && (
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={selectedDetailField.status}
                  size="small"
                  color={
                    selectedDetailField.status === 'active' ? 'success' :
                    selectedDetailField.status === 'inactive' ? 'error' :
                    'default'
                  }
                />
              </Grid>
            )}
            
            {selectedDetailField.lastUpdated && (
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {new Date(selectedDetailField.lastUpdated).toLocaleDateString()}
                </Typography>
              </Grid>
            )}
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Actions */}
          <Typography variant="h6" gutterBottom>Actions</Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<AgricultureIcon />}
                onClick={() => onViewCrops && onViewCrops(selectedDetailField._id)}
              >
                Crops ({selectedDetailField.crops?.length || 0})
              </Button>
            </Grid>
            
            <Grid item xs={6}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<SensorsIcon />}
                onClick={() => onViewSensors && onViewSensors(selectedDetailField._id)}
              >
                Sensors ({selectedDetailField.sensors?.length || 0})
              </Button>
            </Grid>
            
            <Grid item xs={6}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<WaterDropIcon />}
                onClick={() => onViewWeather && onViewWeather(selectedDetailField._id)}
              >
                Weather
              </Button>
            </Grid>
            
            <Grid item xs={6}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<AnalyticsIcon />}
                onClick={() => onViewAnalytics && onViewAnalytics(selectedDetailField._id)}
              >
                Analytics
              </Button>
            </Grid>
            
            <Grid item xs={6}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<EditIcon />}
                onClick={() => onEditField && onEditField(selectedDetailField._id)}
              >
                Edit Field
              </Button>
            </Grid>
            
            <Grid item xs={6}>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                startIcon={<DeleteIcon />}
                onClick={() => onDeleteField && onDeleteField(selectedDetailField._id)}
              >
                Delete
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Drawer>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header with search and filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h5" component="h1" gutterBottom>
              Field Management
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                placeholder="Search fields..."
                variant="outlined"
                size="small"
                fullWidth
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              
              <IconButton onClick={handleFilterClick}>
                <FilterListIcon />
              </IconButton>
              
              <IconButton onClick={handleSortClick}>
                <SortIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      {/* Tabs for list/map view */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="List View" id="field-tab-0" aria-controls="field-tabpanel-0" />
          <Tab label="Map View" id="field-tab-1" aria-controls="field-tabpanel-1" />
        </Tabs>
      </Paper>
      
      {/* Tab panels */}
      <TabPanel value={tabValue} index={0}>
        {renderFieldList()}
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        {renderFieldMap()}
      </TabPanel>
      
      {/* Add Field FAB */}
      <Fab
        color="primary"
        aria-label="add field"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={onAddField}
      >
        <AddIcon />
      </Fab>
      
      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2">Filter by Soil Type</Typography>
        </MenuItem>
        {soilTypes.map(soilType => (
          <MenuItem 
            key={`soil-${soilType}`} 
            onClick={() => handleSoilTypeFilterChange(soilType)}
            sx={{ 
              backgroundColor: filterSoilType.includes(soilType) 
                ? `${theme.palette.primary.light}20` 
                : 'transparent' 
            }}
          >
            <ListItemIcon>
              {filterSoilType.includes(soilType) ? (
                <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: theme.palette.primary.main }} />
              ) : (
                <Box sx={{ width: 18, height: 18, borderRadius: '50%', border: `1px solid ${theme.palette.divider}` }} />
              )}
            </ListItemIcon>
            <ListItemText primary={soilType} />
          </MenuItem>
        ))}
        
        <Divider sx={{ my: 1 }} />
        
        <MenuItem disabled>
          <Typography variant="subtitle2">Filter by Status</Typography>
        </MenuItem>
        {statuses.map(status => (
          <MenuItem 
            key={`status-${status}`} 
            onClick={() => handleStatusFilterChange(status)}
            sx={{ 
              backgroundColor: filterStatus.includes(status) 
                ? `${theme.palette.primary.light}20` 
                : 'transparent' 
            }}
          >
            <ListItemIcon>
              {filterStatus.includes(status) ? (
                <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: theme.palette.primary.main }} />
              ) : (
                <Box sx={{ width: 18, height: 18, borderRadius: '50%', border: `1px solid ${theme.palette.divider}` }} />
              )}
            </ListItemIcon>
            <ListItemText primary={status} />
          </MenuItem>
        ))}
      </Menu>
      
      {/* Sort Menu */}
      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={handleSortClose}
      >
        <MenuItem onClick={() => handleSortOptionChange('name', 'asc')}>
          <ListItemIcon>
            {sortOption === 'name' && sortDirection === 'asc' && (
              <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: theme.palette.primary.main }} />
            )}
          </ListItemIcon>
          <ListItemText primary="Name (A-Z)" />
        </MenuItem>
        <MenuItem onClick={() => handleSortOptionChange('name', 'desc')}>
          <ListItemIcon>
            {sortOption === 'name' && sortDirection === 'desc' && (
              <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: theme.palette.primary.main }} />
            )}
          </ListItemIcon>
          <ListItemText primary="Name (Z-A)" />
        </MenuItem>
        <MenuItem onClick={() => handleSortOptionChange('area', 'asc')}>
          <ListItemIcon>
            {sortOption === 'area' && sortDirection === 'asc' && (
              <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: theme.palette.primary.main }} />
            )}
          </ListItemIcon>
          <ListItemText primary="Area (Smallest first)" />
        </MenuItem>
        <MenuItem onClick={() => handleSortOptionChange('area', 'desc')}>
          <ListItemIcon>
            {sortOption === 'area' && sortDirection === 'desc' && (
              <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: theme.palette.primary.main }} />
            )}
          </ListItemIcon>
          <ListItemText primary="Area (Largest first)" />
        </MenuItem>
        <MenuItem onClick={() => handleSortOptionChange('updated', 'desc')}>
          <ListItemIcon>
            {sortOption === 'updated' && sortDirection === 'desc' && (
              <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: theme.palette.primary.main }} />
            )}
          </ListItemIcon>
          <ListItemText primary="Recently Updated" />
        </MenuItem>
        <MenuItem onClick={() => handleSortOptionChange('updated', 'asc')}>
          <ListItemIcon>
            {sortOption === 'updated' && sortDirection === 'asc' && (
              <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: theme.palette.primary.main }} />
            )}
          </ListItemIcon>
          <ListItemText primary="Oldest Updated" />
        </MenuItem>
      </Menu>
      
      {/* Field Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleFieldMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedField && onViewCrops) onViewCrops(selectedField);
          handleFieldMenuClose();
        }}>
          <ListItemIcon>
            <AgricultureIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="View Crops" />
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedField && onViewSensors) onViewSensors(selectedField);
          handleFieldMenuClose();
        }}>
          <ListItemIcon>
            <SensorsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="View Sensors" />
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedField && onViewWeather) onViewWeather(selectedField);
          handleFieldMenuClose();
        }}>
          <ListItemIcon>
            <WaterDropIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="View Weather" />
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedField && onViewAnalytics) onViewAnalytics(selectedField);
          handleFieldMenuClose();
        }}>
          <ListItemIcon>
            <AnalyticsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="View Analytics" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          if (selectedField && onEditField) onEditField(selectedField);
          handleFieldMenuClose();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Edit Field" />
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedField && onDeleteField) onDeleteField(selectedField);
          handleFieldMenuClose();
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Delete Field" sx={{ color: theme.palette.error.main }} />
        </MenuItem>
      </Menu>
      
      {/* Field Detail Drawer */}
      {renderFieldDetailDrawer()}
    </Box>
  );
};

export default ResponsiveFieldManagement;