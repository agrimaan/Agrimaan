import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  CircularProgress
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createFields } from '../features/fields/fieldSlice';
import { adaptFieldData } from '../utils/field-api-adapter';

interface FieldsFormData {
  name: string;
  area: string;
  location: string;
  soilType: string;
  irrigationType: string;
  description: string;
  coordinates: {
    latitude: string;
    longitude: string;
  };
}

const soilTypes = [
  'Clay',
  'Sandy',
  'Loam',
  'Silt',
  'Peaty',
  'Chalky'
];

const irrigationTypes = [
  'Drip Irrigation',
  'Sprinkler',
  'Surface Irrigation',
  'Subsurface Irrigation',
  'Center Pivot',
  'Manual Watering',
  'Rain-fed'
];

const FieldsFormAPIFixed: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FieldsFormData>({
    name: '',
    area: '',
    location: '',
    soilType: '',
    irrigationType: '',
    description: '',
    coordinates: {
      latitude: '',
      longitude: '',
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Field name is required';
    }

    if (!formData.area.trim()) {
      newErrors.area = 'Area is required';
    } else if (isNaN(Number(formData.area))) {
      newErrors.area = 'Area must be a valid number';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.soilType) {
      newErrors.soilType = 'Soil type is required';
    }

    if (!formData.irrigationType) {
      newErrors.irrigationType = 'Irrigation type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FieldsFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleNestedInputChange = (parent: keyof FieldsFormData, child: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof FieldsFormData] as any,
        [child]: e.target.value,
      },
    }));
  };

  const handleSelectChange = (field: keyof FieldsFormData) => (
    event: SelectChangeEvent<string>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Format data for API
      const apiData = adaptFieldData(formData);
      
      // Dispatch to Redux store
      await dispatch(createFields(apiData) as any);
      
      // Success handling
      navigate('/farmer/fields');
      
    } catch (error) {
      console.error('Error creating field:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom align="center">
        Add New Field
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Field Name"
              value={formData.name}
              onChange={handleInputChange('name')}
              error={!!errors.name}
              helperText={errors.name}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Area (acres)"
              value={formData.area}
              onChange={handleInputChange('area')}
              error={!!errors.area}
              helperText={errors.area}
              required
              type="number"
              inputProps={{ step: "0.1", min: "0" }}
            />
          </Grid>

          {/* Location */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              onChange={handleInputChange('location')}
              error={!!errors.location}
              helperText={errors.location}
              required
              placeholder="e.g., Village Name, District, State"
            />
          </Grid>

          {/* Coordinates */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Latitude"
              value={formData.coordinates.latitude}
              onChange={handleNestedInputChange('coordinates', 'latitude')}
              type="number"
              inputProps={{ step: "any" }}
              placeholder="e.g., 19.0760"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Longitude"
              value={formData.coordinates.longitude}
              onChange={handleNestedInputChange('coordinates', 'longitude')}
              type="number"
              inputProps={{ step: "any" }}
              placeholder="e.g., 72.8777"
            />
          </Grid>

          {/* Soil Type */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.soilType}>
              <InputLabel>Soil Type</InputLabel>
              <Select
                value={formData.soilType}
                onChange={handleSelectChange('soilType')}
                label="Soil Type"
                required
              >
                {soilTypes.map((type) => (
                  <MenuItem key={type} value={type.toLowerCase()}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
              {errors.soilType && (
                <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                  {errors.soilType}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Irrigation Type */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.irrigationType}>
              <InputLabel>Irrigation Type</InputLabel>
              <Select
                value={formData.irrigationType}
                onChange={handleSelectChange('irrigationType')}
                label="Irrigation Type"
                required
              >
                {irrigationTypes.map((type) => (
                  <MenuItem key={type} value={type.toLowerCase().replace(/\s+/g, '_')}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
              {errors.irrigationType && (
                <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                  {errors.irrigationType}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={handleInputChange('description')}
              multiline
              rows={4}
              placeholder="Describe your field, crops grown, special features..."
            />
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => window.history.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Field'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default FieldsFormAPIFixed;