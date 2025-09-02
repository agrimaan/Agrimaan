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
  CircularProgress,
  Divider,
  SelectChangeEvent,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LocationSearch from '../components/LocationSearch';

interface FieldFormData {
  name: string;
  location: {
    coordinates: [number, number]; // [lng, lat]
  };
  area: {
    value: number;
    unit: string; // ✅ changed from 'acre' | 'hectare' to string
  };
  soilType: string;
  irrigationSystem: string;
  notes: string;
}

interface FieldFormProps {
  initialData?: any;
  onSubmit: (data: FieldFormData) => Promise<void>;
  isLoading?: boolean;
  isEdit?: boolean;
}

const soilTypes = ['clay', 'sandy', 'loamy', 'silty', 'peaty', 'chalky', 'other'];

const irrigationTypes = ['drip', 'sprinkler', 'flood', 'center pivot', 'none'];

const areaUnits = ['acre', 'hectare']; // ✅ centralized dropdown values

const FieldForm: React.FC<FieldFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  isEdit = false,
}) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FieldFormData>({
    name: '',
    location: { coordinates: [0, 0] },
    area: { value: 0, unit: 'acre' },
    soilType: '',
    irrigationSystem: '',
    notes: '',
  });

  const [locationQuery, setLocationQuery] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        location: {
          coordinates: initialData.location?.coordinates || [0, 0],
        },
        area: {
          value: initialData.area?.value || 0,
          unit: initialData.area?.unit || 'acre',
        },
        soilType: initialData.soilType || '',
        irrigationSystem: initialData.irrigationSystem || '',
        notes: initialData.notes || '',
      });
      setLocationQuery(initialData.location?.label || '');
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Field name is required';
    if (!formData.area.value || isNaN(Number(formData.area.value))) {
      newErrors.area = 'Valid area is required';
    }
    if (!formData.soilType) newErrors.soilType = 'Soil type is required';
    if (!formData.irrigationSystem)
      newErrors.irrigationSystem = 'Irrigation type is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleInputChange =
    (field: keyof FieldFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleSelectChange =
    (field: keyof FieldFormData) => (e: SelectChangeEvent) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleAreaValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      area: {
        ...prev.area,
        value: Number(e.target.value),
      },
    }));
  };

  const handleAreaUnitChange = (e: SelectChangeEvent) => {
    setFormData((prev) => ({
      ...prev,
      area: {
        ...prev.area,
        unit: e.target.value, // ✅ directly takes selected dropdown value
      },
    }));
  };

  const onPickLocation = (place: any) => {
    const label: string =
      place?.label ??
      place?.description ??
      place?.formatted_address ??
      place?.name ??
      '';

    const lat =
      place?.latitude ??
      place?.lat ??
      place?.coords?.lat ??
      (typeof place?.geometry?.location?.lat === 'function'
        ? place.geometry.location.lat()
        : place?.geometry?.location?.lat);

    const lng =
      place?.longitude ??
      place?.lng ??
      place?.coords?.lng ??
      (typeof place?.geometry?.location?.lng === 'function'
        ? place.geometry.location.lng()
        : place?.geometry?.location?.lng);

    if (lat != null && lng != null) {
      setFormData((prev) => ({
        ...prev,
        location: {
          coordinates: [Number(lng), Number(lat)],
        },
      }));
    }

    if (label) setLocationQuery(label);
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {isEdit ? 'Edit Land Details' : 'Add Land Details'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          {/* Field Name */}
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

          {/* Area */}
          <Grid item xs={12} md={3}>
            <TextField
              label="Area"
              type="number"
              value={formData.area.value === 0 ? "" : formData.area.value}
              onChange={(e) => {
                const val = e.target.value;
                setFormData({
                  ...formData,
                  area: {
                    ...formData.area,
                    value: val === "" ? 0 : Number(val)
                  }
                });
              }}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="unit-label">Unit</InputLabel>
              <Select
                labelId="unit-label"
                id="unit-select"
                value={formData.area.unit}
                label="Unit"
                onChange={handleAreaUnitChange}
              >
                {areaUnits.map((unit) => (
                  <MenuItem key={unit} value={unit}>
                    {unit.charAt(0).toUpperCase() + unit.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Location */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Location
            </Typography>

            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <LocationSearch
                value={locationQuery}
                onChange={setLocationQuery}
                onPick={onPickLocation}
                placeholder="Type a location"
              />
              <Typography variant="caption" color="text.secondary">
                Picking a result will auto-fill coordinates
              </Typography>
            </Box>
          </Grid>

          {/* Coordinates (Lat/Lng) */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Latitude"
              value={formData.location.coordinates[1] || ''}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Longitude"
              value={formData.location.coordinates[0] || ''}
              InputProps={{ readOnly: true }}
            />
          </Grid>


          {/* Soil Type */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined" error={!!errors.soilType}>
              <InputLabel id="soil-label">Soil Type</InputLabel>
              <Select
                labelId="soil-label"
                id="soil-select"
                value={formData.soilType}
                label="Soil Type"
                onChange={handleSelectChange('soilType')}
                required
              >
                {soilTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
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

          {/* Irrigation */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined" error={!!errors.irrigationSystem}>
              <InputLabel id="irrigation-label">Irrigation Type</InputLabel>
              <Select
                labelId="irrigation-label"
                id="irrigation-select"
                value={formData.irrigationSystem}
                label="Irrigation Type"
                onChange={handleSelectChange('irrigationSystem')}
                required
              >
                {irrigationTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </Select>
              {errors.irrigationSystem && (
                <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                  {errors.irrigationSystem}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Notes */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description / Notes"
              value={formData.notes}
              onChange={handleInputChange('notes')}
              multiline
              rows={4}
              placeholder="Any additional notes about the field..."
            />
          </Grid>

          {/* Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : null}
              >
                {isEdit ? 'Update Field' : 'Create Field'}
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

export default FieldForm;
