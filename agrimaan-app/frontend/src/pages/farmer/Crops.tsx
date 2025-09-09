import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import { Link } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';

// Add interfaces
interface Crop {
  id: number;
  name: string;
  variety: string;
  plantedArea: string;
  plantingDate: string;
  harvestDate: string;
  status: string;
  health: string;
  image: string;
}

interface CropFormData {
  name: string;
  variety: string;
  plantedArea: string;
  plantingDate: string;
  harvestDate: string;
  status: string;
  health: string;
  image: string;
}

// Mock data for crops
const mockCrops: Crop[] = [
  { 
    id: 1, 
    name: 'Wheat', 
    variety: 'Hard Red Winter', 
    plantedArea: '45 acres', 
    plantingDate: '2024-03-15', 
    harvestDate: '2024-08-10',
    status: 'Growing',
    health: 'Good',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1c5a6ec21?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
  },
  { 
    id: 2, 
    name: 'Corn', 
    variety: 'Sweet Corn', 
    plantedArea: '30 acres', 
    plantingDate: '2024-04-10', 
    harvestDate: '2024-09-15',
    status: 'Growing',
    health: 'Excellent',
    image: 'https://images.unsplash.com/photo-1601472543578-74691771b8be?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
  },  
  { 
    id: 3, 
    name: 'Soybeans', 
    variety: 'Round-Up Ready', 
    plantedArea: '25 acres', 
    plantingDate: '2024-05-01', 
    harvestDate: '2024-10-20',
    status: 'Growing',
    health: 'Fair',
    image: 'https://images.unsplash.com/photo-1536054695850-b8f9e8d9fd5d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
  },
  { 
    id: 4, 
    name: 'Rice', 
    variety: 'Long Grain', 
    plantedArea: '20 acres', 
    plantingDate: '2024-04-15', 
    harvestDate: '2024-09-30',
    status: 'Harvested',
    health: 'Good',
    image: 'https://images.unsplash.com/photo-1568347355280-d83c8fceb0fd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
  },
];

const Crops: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [crops, setCrops] = useState<Crop[]>(mockCrops);
  
  // Add these new state variables for edit functionality
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [formData, setFormData] = useState<CropFormData>({
    name: '',
    variety: '',
    plantedArea: '',
    plantingDate: '',
    harvestDate: '',
    status: 'Planned',
    health: 'Good',
    image: ''
  });

  const filteredCrops = crops.filter(crop => 
    crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crop.variety.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Growing':
        return 'success';
      case 'Harvested':
        return 'primary';
      case 'Planned':
        return 'info';
      case 'Problem':
        return 'error';
      default:
        return 'default';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'Excellent':
        return 'success';
      case 'Good':
        return 'info';
      case 'Fair':
        return 'warning';
      case 'Poor':
        return 'error';
      default:
        return 'default';
    }
  };

  // Add edit functionality functions
  const handleOpenAddDialog = () => {
    setEditingCrop(null);
    setFormData({
      name: '',
      variety: '',
      plantedArea: '',
      plantingDate: '',
      harvestDate: '',
      status: 'Planned',
      health: 'Good',
      image: ''
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (crop: Crop) => {
    console.log('Opening edit dialog for:', crop.name);
    setEditingCrop(crop);
    setFormData({
      name: crop.name,
      variety: crop.variety,
      plantedArea: crop.plantedArea,
      plantingDate: crop.plantingDate,
      harvestDate: crop.harvestDate,
      status: crop.status,
      health: crop.health,
      image: crop.image
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCrop(null);
  };

  const handleInputChange = (Fields: keyof CropFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [Fields]: value
    }));
  };

  const handleSubmit = () => {
    console.log('Submit button clicked');
    console.log('Editing crop:', editingCrop);
    console.log('Form data:', formData);
    console.log('Is form valid:', isFormValid());

    if (!isFormValid()) {
      console.log('Form is not valid, cannot submit');
      return;
    }

    if (editingCrop) {
      // Edit existing crop
      console.log('Updating existing crop with ID:', editingCrop.id);
      setCrops(prev => {
        const updatedCrops = prev.map(crop => 
          crop.id === editingCrop.id 
            ? { ...crop, ...formData }
            : crop
        );
        console.log('Updated crops array:', updatedCrops);
        return updatedCrops;
      });
      alert(`Crop "${editingCrop.name}" updated successfully!`);
    } else {
      // Add new crop
      console.log('Adding new crop');
      const newCrop: Crop = {
        id: crops.length > 0 ? Math.max(...crops.map(c => c.id)) + 1 : 1,
        ...formData,
        image: formData.image || 'https://images.unsplash.com/photo-1574323347407-f5e1c5a6ec21?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
      };
      console.log('New crop to add:', newCrop);
      setCrops(prev => {
        const newCrops = [...prev, newCrop];
        console.log('Updated crops array with new crop:', newCrops);
        return newCrops;
      });
      alert(`New crop "${formData.name}" added successfully!`);
    }
    handleCloseDialog();
  };

  const isFormValid = () => {
    const isValid = formData.name.trim() !== '' && 
           formData.variety.trim() !== '' && 
           formData.plantedArea.trim() !== '' && 
           formData.plantingDate.trim() !== '' && 
           formData.harvestDate.trim() !== '';
    
    console.log('Form validation check:', {
      name: formData.name.trim(),
      variety: formData.variety.trim(),
      plantedArea: formData.plantedArea.trim(),
      plantingDate: formData.plantingDate.trim(),
      harvestDate: formData.harvestDate.trim(),
      isValid
    });
    
    return isValid;
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="div">
          Crops
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          Add Crop
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search crops by name or variety..."
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
        <Button 
          variant="outlined" 
          startIcon={<FilterListIcon />}
        >
          Filter
        </Button>
      </Box>

      <Grid container spacing={3}>
        {filteredCrops.map((crop) => (
          <Grid item xs={12} sm={6} md={4} key={crop.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="140"
                image={crop.image}
                alt={crop.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography gutterBottom variant="h5" component="div">
                    {crop.name}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Edit button clicked for:', crop.name);
                      handleOpenEditDialog(crop);
                    }}
                    sx={{ ml: 1 }}
                    title="Edit crop"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Variety: {crop.variety}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Chip 
                    label={crop.status} 
                    color={getStatusColor(crop.status) as any} 
                    size="small" 
                  />
                  <Chip 
                    label={crop.health} 
                    color={getHealthColor(crop.health) as any} 
                    size="small" 
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Planted Area: {crop.plantedArea}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Planting Date: {crop.plantingDate}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Expected Harvest: {crop.harvestDate}
                </Typography>
              </CardContent>
              <Box sx={{ p: 2 }}>
                <Button 
                  component={Link} 
                  to={`/crops/${crop.id}`} 
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

      {/* Enhanced Add/Edit Crop Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {editingCrop ? `Edit ${editingCrop.name}` : 'Add New Crop'}
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Crop Name"
              value={formData.name}
              onChange={(e) => {
                console.log('Name changed to:', e.target.value);
                handleInputChange('name', e.target.value);
              }}
              required
              fullWidth
              error={formData.name.trim() === ''}
              helperText={formData.name.trim() === '' ? 'Crop name is required' : ''}
            />
            <TextField
              label="Variety"
              value={formData.variety}
              onChange={(e) => {
                console.log('Variety changed to:', e.target.value);
                handleInputChange('variety', e.target.value);
              }}
              required
              fullWidth
              error={formData.variety.trim() === ''}
              helperText={formData.variety.trim() === '' ? 'Variety is required' : ''}
            />
            <TextField
              label="Planted Area"
              value={formData.plantedArea}
              onChange={(e) => {
                console.log('Planted area changed to:', e.target.value);
                handleInputChange('plantedArea', e.target.value);
              }}
              required
              fullWidth
              placeholder="e.g., 45 acres"
              error={formData.plantedArea.trim() === ''}
              helperText={formData.plantedArea.trim() === '' ? 'Planted area is required' : ''}
            />
            <TextField
              label="Planting Date"
              type="date"
              value={formData.plantingDate}
              onChange={(e) => {
                console.log('Planting date changed to:', e.target.value);
                handleInputChange('plantingDate', e.target.value);
              }}
              InputLabelProps={{
                shrink: true,
              }}
              required
              fullWidth
              error={formData.plantingDate.trim() === ''}
              helperText={formData.plantingDate.trim() === '' ? 'Planting date is required' : ''}
            />
            <TextField
              label="Expected Harvest Date"
              type="date"
              value={formData.harvestDate}
              onChange={(e) => {
                console.log('Harvest date changed to:', e.target.value);
                handleInputChange('harvestDate', e.target.value);
              }}
              InputLabelProps={{
                shrink: true,
              }}
              required
              fullWidth
              error={formData.harvestDate.trim() === ''}
              helperText={formData.harvestDate.trim() === '' ? 'Harvest date is required' : ''}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => {
                  console.log('Status changed to:', e.target.value);
                  handleInputChange('status', e.target.value);
                }}
                label="Status"
              >
                <MenuItem value="Planned">Planned</MenuItem>
                <MenuItem value="Growing">Growing</MenuItem>
                <MenuItem value="Harvested">Harvested</MenuItem>
                <MenuItem value="Problem">Problem</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Health</InputLabel>
              <Select
                value={formData.health}
                onChange={(e) => {
                  console.log('Health changed to:', e.target.value);
                  handleInputChange('health', e.target.value);
                }}
                label="Health"
              >
                <MenuItem value="Excellent">Excellent</MenuItem>
                <MenuItem value="Good">Good</MenuItem>
                <MenuItem value="Fair">Fair</MenuItem>
                <MenuItem value="Poor">Poor</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Image URL (optional)"
              value={formData.image}
              onChange={(e) => {
                console.log('Image URL changed to:', e.target.value);
                handleInputChange('image', e.target.value);
              }}
              fullWidth
              placeholder="https://example.com/image.jpg"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={(e) => {
              console.log('Update/Add button clicked');
              e.preventDefault();
              handleSubmit();
            }}
            variant="contained"
            color="primary"
            disabled={!isFormValid()}
          >
            {editingCrop ? 'Update Crop' : 'Add Crop'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Crops;