import React, { useState } from 'react';
import AddressSearch from '../components/common/AddressSearch';
import AddressField from '../components/forms/AddressField';

// Quick integration components for existing forms

export const LocationSearchField: React.FC<{
  value: string;
  onChange: (address: string, coordinates: { lat: number; lon: number } | null) => void;
  label?: string;
}> = ({ value, onChange, label = "Location" }) => {
  return (
    <AddressField
      address={value}
      coordinates={null}
      onAddressChange={onChange}
      label={label}
      required
      showCoordinates
      enableGeolocation
    />
  );
};

export const SimpleAddressSearch: React.FC<{
  value: string;
  onChange: (address: string, coordinates: { lat: number; lon: number } | null) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder = "Search address..." }) => {
  return (
    <AddressSearch
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
};

// Example usage in existing forms
export const AddressFieldExample: React.FC = () => {
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);

  return (
    <div>
      <h3>Address Search Integration</h3>
      
      {/* Basic usage */}
      <LocationSearchField
        value={location}
        onChange={(address, coords) => {
          setLocation(address);
          setCoordinates(coords);
          console.log('Address:', address);
          console.log('Coordinates:', coords);
        }}
        label="Farm Location"
      />
    </div>
  );
};