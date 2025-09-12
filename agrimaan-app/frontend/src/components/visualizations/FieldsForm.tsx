import React, { useState, useEffect } from 'react';
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
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

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

interface FieldsFormProps {
  initialData?: any;
  onSubmit: (data: FieldsFormData) => Promise<void>;
  isLoading?: boolean;
  isEdit?: boolean;
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
  'Rain Fed'
];

const FieldsForm: React.FC<FieldsFormProps> = ({ 
  initialData, 
  onSubmit, 
  isLoading = false, 
  isEdit = false 
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FieldsFormData>({
    name: '',
    area: '',
    location: '',
    soilType: '',
    irrigationType: '',
    description: '',
    coordinates: {
      latitude: '',
      longitude: ''
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        area: initialData.area || '',
        location: initialData.location || '',
        soilType: initialData.soilType || '',
        irrigationType: initialData.irrigationType || '',
        description: initialData.description || '',
        coordinates: {
          latitude: initialData.coordinates?.latitude || '',
          longitude: initialData.coordinates?.longitude || ''
        }
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Fields name is required';
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

    if (formData.coordinates.latitude && isNaN(Number(formData.coordinates.latitude))) {
      newErrors.latitude = 'Latitude must be a valid number';
    }

    if (formData.coordinates.longitude && isNaN(Number(formData.coordinates.longitude))) {
      newErrors.longitude = 'Longitude must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleInputChange = (Fields: keyof FieldsFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [Fields]: e.target.value
    }));
  };

  const handleCoordinateChange = (coord: 'latitude' | 'longitude') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      coordinates: {
        ...prev.coordinates,
        [coord]: e.target.value
      }
    }));
  };

  const handleSelectChange = (Fields: keyof FieldsFormData) => (
    e: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [Fields]: e.target.value
    }));
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {isEdit ? 'Edit Fields Details' : 'Add Fields Details'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" color="primary" gutterBottom>
              Basic Information
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Fields Name"
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

          {/* Soil and Irrigation */}
          <Grid item xs={12}>
            <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
              Soil & Irrigation Details
            </Typography>
          </Grid>

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
                  <MenuItem key={type} value={type}>
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
                  <MenuItem key={type} value={type}>
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

          {/* Coordinates */}
          <Grid item xs={12}>
            <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
              GPS Coordinates (Optional)
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Latitude"
              value={formData.coordinates.latitude}
              onChange={handleCoordinateChange('latitude')}
              error={!!errors.latitude}
              helperText={errors.latitude}
              type="number"
              inputProps={{ step: "any" }}
              placeholder="e.g., 28.6139"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Longitude"
              value={formData.coordinates.longitude}
              onChange={handleCoordinateChange('longitude')}
              error={!!errors.longitude}
              helperText={errors.longitude}
              type="number"
              inputProps={{ step: "any" }}
              placeholder="e.g., 77.2090"
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
              Additional Information
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={handleInputChange('description')}
              multiline
              rows={4}
              placeholder="Any additional notes about the Fields..."
            />
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : null}
              >
                {isEdit ? 'Update Fields' : 'Create Fields'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/fields')}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default FieldsForm;
