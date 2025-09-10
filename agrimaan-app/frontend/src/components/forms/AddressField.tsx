import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  Typography,
  Box,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { LocationOn, MyLocation } from '@mui/icons-material';
import { getCoordinates, reverseGeocode } from '../../services/AddressSearch';

interface AddressFieldProps {
  address: string;
  coordinates: { lat: number; lon: number } | null;
  onAddressChange: (address: string, coordinates: { lat: number; lon: number } | null) => void;
  label?: string;
  required?: boolean;
  showCoordinates?: boolean;
  enableGeolocation?: boolean;
}

const AddressField: React.FC<AddressFieldProps> = ({
  address,
  coordinates,
  onAddressChange,
  label = 'Address',
  required = false,
  showCoordinates = true,
  enableGeolocation = true,
}) => {
  const [loading, setLoading] = useState(false);
  const [manualLat, setManualLat] = useState<string>('');
  const [manualLon, setManualLon] = useState<string>('');

  useEffect(() => {
    if (coordinates) {
      setManualLat(coordinates.lat.toString());
      setManualLon(coordinates.lon.toString());
    } else {
      setManualLat('');
      setManualLon('');
    }
  }, [coordinates]);

  const handleAddressChange = (newAddress: string) => {
    onAddressChange(newAddress, coordinates);
  };

  const handleCoordinateChange = (lat: string, lon: string) => {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    if (!isNaN(latNum) && !isNaN(lonNum)) {
      onAddressChange(address, { lat: latNum, lon: lonNum });
    }
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const addressData = await reverseGeocode(latitude, longitude);
        
        if (addressData) {
          onAddressChange(addressData.address, { lat: latitude, lon: longitude });
        }
        
        setLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to retrieve your location. Please check your browser settings.');
        setLoading(false);
      }
    );
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={label}
            value={address}
            onChange={(e) => handleAddressChange(e.target.value)}
            required={required}
            multiline
            rows={2}
            InputProps={{
              endAdornment: enableGeolocation && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleUseCurrentLocation}
                    disabled={loading}
                    size="small"
                    title="Use current location"
                  >
                    <MyLocation fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {showCoordinates && (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Latitude"
                value={manualLat}
                onChange={(e) => {
                  setManualLat(e.target.value);
                  handleCoordinateChange(e.target.value, manualLon);
                }}
                type="number"
                inputProps={{ step: "any" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Longitude"
                value={manualLon}
                onChange={(e) => {
                  setManualLon(e.target.value);
                  handleCoordinateChange(manualLat, e.target.value);
                }}
                type="number"
                inputProps={{ step: "any" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </>
        )}

        {coordinates && showCoordinates && (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Current location: {coordinates.lat.toFixed(6)}, {coordinates.lon.toFixed(6)}
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default AddressField;