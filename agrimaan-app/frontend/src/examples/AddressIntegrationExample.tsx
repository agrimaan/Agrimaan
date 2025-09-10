import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
  Alert,
} from '@mui/material';
import AddressField from '../components/forms/AddressField';
import AddressSearch from '../components/common/AddressSearch';
import { useAddressWithCoords } from '../hooks/useAddressSearch';

interface AddressFormData {
  farmAddress: string;
  farmCoordinates: { lat: number; lon: number } | null;
  warehouseAddress: string;
  warehouseCoordinates: { lat: number; lon: number } | null;
}

const AddressIntegrationExample: React.FC = () => {
  const [formData, setFormData] = useState<AddressFormData>({
    farmAddress: '',
    farmCoordinates: null,
    warehouseAddress: '',
    warehouseCoordinates: null,
  });

  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleAddressChange = (field: keyof AddressFormData, type: 'address' | 'coordinates') => 
    (value: string, coordinates?: { lat: number; lon: number } | null) => {
    if (type === 'address') {
      setFormData(prev => ({
        ...prev,
        [`${field}`]: value,
        [`${field.replace('Address', 'Coordinates')}`]: coordinates || null,
      }));
    }
  };

  const handleSubmit = () => {
    console.log('Form data:', formData);
    setSuccessMessage('Address information saved successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Farm & Warehouse Locations
        </Typography>
        
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Farm Location
            </Typography>
            <AddressField
              address={formData.farmAddress}
              coordinates={formData.farmCoordinates}
              onAddressChange={handleAddressChange('farmAddress', 'address')}
              label="Farm Address"
              required
              showCoordinates
              enableGeolocation
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Warehouse Location
            </Typography>
            <AddressSearch
              value={formData.warehouseAddress}
              onChange={(address, coordinates) => 
                handleAddressChange('warehouseAddress', 'address')(address, coordinates)
              }
              label="Warehouse Address"
              placeholder="Search for warehouse location..."
            />
          </Grid>
        </Grid>

        <Box mt={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!formData.farmAddress}
          >
            Save Locations
          </Button>
        </Box>

        {/* Display current values */}
        <Box mt={3}>
          <Typography variant="h6" gutterBottom>
            Current Values
          </Typography>
          <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>Farm:</strong> {formData.farmAddress || 'Not set'}
              {formData.farmCoordinates && ` (${formData.farmCoordinates.lat.toFixed(4)}, ${formData.farmCoordinates.lon.toFixed(4)})`}
            </Typography>
            <Typography variant="body2">
              <strong>Warehouse:</strong> {formData.warehouseAddress || 'Not set'}
              {formData.warehouseCoordinates && ` (${formData.warehouseCoordinates.lat.toFixed(4)}, ${formData.warehouseCoordinates.lon.toFixed(4)})`}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AddressIntegrationExample;