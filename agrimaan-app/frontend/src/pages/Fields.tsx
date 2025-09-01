import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import OpacityIcon from '@mui/icons-material/Opacity';
import TerrainIcon from '@mui/icons-material/Terrain';

// Mock data for fields (expanded)
const mockFields = [
  { 
    id: 1, 
    name: 'North Field', 
    area: '12.5', 
    crop: 'Wheat', 
    health: 'Good', 
    location: 'Village Rampur, Meerut',
    soilType: 'Loam',
    irrigationType: 'Drip Irrigation',
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
  },
  { 
    id: 2, 
    name: 'South Field', 
    area: '8.3', 
    crop: 'Corn', 
    health: 'Excellent', 
    location: 'Village Kashipur, Meerut',
    soilType: 'Clay',
    irrigationType: 'Sprinkler',
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
  },
  { 
    id: 3, 
    name: 'East Field', 
    area: '15.7', 
    crop: 'Soybeans', 
    health: 'Fair', 
    location: 'Village Sardhana, Meerut',
    soilType: 'Sandy',
    irrigationType: 'Surface Irrigation',
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
  },
  { 
    id: 4, 
    name: 'West Field', 
    area: '10.2', 
    crop: 'Rice', 
    health: 'Good', 
    location: 'Village Hastinapur, Meerut',
    soilType: 'Silt',
    irrigationType: 'Subsurface Irrigation',
    status: 'Inactive',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
  },
];

const Fields: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [fields, setFields] = useState(mockFields);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedField, setSelectedField] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const filteredFields = fields.filter(field => 
    field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, field: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedField(field);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedField(null);
  };

  const handleEdit = () => {
    if (selectedField) {
      navigate(`/fields/${selectedField.id}/edit`);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (selectedField) {
      try {
        // TODO: Replace with actual API call
        // await dispatch(deleteField(selectedField.id) as any);
        
        // For now, just remove from local state
        setFields(prev => prev.filter(f => f.id !== selectedField.id));
        setDeleteSuccess(true);
        
        setTimeout(() => {
          setDeleteSuccess(false);
        }, 3000);
        
      } catch (error) {
        console.error('Error deleting field:', error);
      }
    }
    
    setDeleteDialogOpen(false);
    setSelectedField(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedField(null);
  };

  const getHealthColor = (health: string) => {
    switch (health.toLowerCase()) {
      case 'excellent': return 'success';
      case 'good': return 'primary';
      case 'fair': return 'warning';
      case 'poor': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' ? 'success' : 'default';
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="div">
          Fields Management
        </Typography>
        <Button 
          component={Link}
          to="/fields/new"
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
        >
          Add Field
        </Button>
      </Box>

      {deleteSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Field deleted successfully!
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search fields by name, crop, or location..."
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
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Found {filteredFields.length} field{filteredFields.length !== 1 ? 's' : ''}
      </Typography>

      <Grid container spacing={3}>
        {filteredFields.map((field) => (
          <Grid item xs={12} sm={6} md={4} key={field.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              {/* Menu Button */}
              <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                <IconButton
                  onClick={(e) => handleMenuOpen(e, field)}
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' }
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
              </Box>

              <CardMedia
                component="img"
                height="140"
                image={field.image}
                alt={field.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography gutterBottom variant="h6" component="div">
                    {field.name}
                  </Typography>
                  <Chip 
                    label={field.status} 
                    color={getStatusColor(field.status) as any}
                    size="small"
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TerrainIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {field.area} acres
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOnIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {field.location}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Current Crop:</strong> {field.crop}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                    <strong>Soil:</strong> {field.soilType}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <OpacityIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {field.irrigationType}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Health:</strong>
                  </Typography>
                  <Chip 
                    label={field.health} 
                    color={getHealthColor(field.health) as any}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </CardContent>
              <Box sx={{ p: 2 }}>
                <Button 
                  component={Link} 
                  to={`/fields/${field.id}`} 
                  variant="outlined" 
                  fullWidth
                >
                  View Details
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredFields.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No fields found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first field'}
          </Typography>
          <Button 
            component={Link}
            to="/fields/new"
            variant="contained" 
            startIcon={<AddIcon />}
          >
            Add Your First Field
          </Button>
        </Box>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Edit Field
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Delete Field
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Field
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete "{selectedField?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Fields;