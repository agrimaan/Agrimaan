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
  IconButton
} from '@mui/material';
import { Link } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';

// Mock data for fields
const mockFields = [
  { id: 1, name: 'North Field', area: '12.5 acres', crop: 'Wheat', health: 'Good', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
  { id: 2, name: 'South Field', area: '8.3 acres', crop: 'Corn', health: 'Excellent', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
  { id: 3, name: 'East Field', area: '15.7 acres', crop: 'Soybeans', health: 'Fair', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
  { id: 4, name: 'West Field', area: '10.2 acres', crop: 'Rice', health: 'Good', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
];

const Fields: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fields, setFields] = useState(mockFields);

  const filteredFields = fields.filter(field => 
    field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.crop.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="div">
          Fields
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
        >
          Add Field
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search fields by name or crop..."
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

      <Grid container spacing={3}>
        {filteredFields.map((field) => (
          <Grid item xs={12} sm={6} md={4} key={field.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="140"
                image={field.image}
                alt={field.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="div">
                  {field.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Area: {field.area}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current Crop: {field.crop}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Health: {field.health}
                </Typography>
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
    </Box>
  );
};

export default Fields;