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
  IconButton,
  Chip
} from '@mui/material';
import { Link } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';

// Mock data for crops
const mockCrops = [
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
    status: 'Growing',
    health: 'Good',
    image: 'https://images.unsplash.com/photo-1568347355280-d83c8fceb0fd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
  },
];

const Crops: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [crops, setCrops] = useState(mockCrops);

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
                <Typography gutterBottom variant="h5" component="div">
                  {crop.name}
                </Typography>
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
    </Box>
  );
};

export default Crops;