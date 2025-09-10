import React, { useState, useEffect, useCallback } from 'react';
import {
  TextField,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  InputAdornment,
  Box,
  Typography,
} from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import { searchAddress, getCoordinates, formatAddress, debounce } from '../../services/AddressSearch';

interface AddressSearchProps {
  value: string;
  onChange: (address: string, coordinates: { lat: number; lon: number } | null) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

const AddressSearch: React.FC<AddressSearchProps> = ({
  value,
  onChange,
  label = 'Address',
  placeholder = 'Enter address...',
  required = false,
  disabled = false,
}) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.trim().length < 3) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const results = await searchAddress(query);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Address search error:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setSelectedAddress(newValue);
    debouncedSearch(newValue);
    
    // Clear coordinates when address changes
    onChange(newValue, null);
  };

  const handleSuggestionClick = async (suggestion: any) => {
    const address = formatAddress(suggestion);
    setSelectedAddress(address);
    setShowSuggestions(false);
    
    // Get coordinates for the selected address
    const coordinates = {
      lat: parseFloat(suggestion.lat),
      lon: parseFloat(suggestion.lon),
    };
    
    onChange(address, coordinates);
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <Box position="relative">
      <TextField
        fullWidth
        value={selectedAddress || value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        label={label}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {loading ? <CircularProgress size={20} /> : <LocationOn />}
            </InputAdornment>
          ),
        }}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          zIndex={1000}
          bgcolor="background.paper"
          border={1}
          borderColor="divider"
          borderRadius={1}
          maxHeight={300}
          overflow="auto"
          boxShadow={3}
        >
          <List dense>
            {suggestions.map((suggestion) => (
              <ListItem
                key={suggestion.place_id}
                button
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <ListItemText
                  primary={suggestion.display_name}
                  primaryTypographyProps={{
                    variant: 'body2',
                    noWrap: true,
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      
      {selectedAddress && value && (
        <Box mt={1}>
          <Typography variant="caption" color="text.secondary">
            Coordinates: {value}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AddressSearch;