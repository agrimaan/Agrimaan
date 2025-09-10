import { useState, useCallback, useEffect } from 'react';
import { searchAddress, getCoordinates, AddressSuggestion } from '../services/AddressSearch';

interface UseAddressSearchReturn {
  suggestions: AddressSuggestion[];
  loading: boolean;
  searchAddress: (query: string) => Promise<void>;
  getCoordinates: (address: string) => Promise<{ lat: number; lon: number } | null>;
}

export const useAddressSearch = (): UseAddressSearchReturn => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const results = await searchAddress(query);
      setSuggestions(results);
    } catch (error) {
      console.error('Address search error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCoords = useCallback(async (address: string) => {
    if (!address.trim()) return null;

    try {
      return await getCoordinates(address);
    } catch (error) {
      console.error('Coordinates fetch error:', error);
      return null;
    }
  }, []);

  return {
    suggestions,
    loading,
    searchAddress: search,
    getCoordinates: getCoords,
  };
};

// Hook for managing address with coordinates
interface UseAddressWithCoordsReturn {
  address: string;
  coordinates: { lat: number; lon: number } | null;
  loading: boolean;
  setAddress: (address: string) => Promise<void>;
  setCoordinates: (lat: number, lon: number) => Promise<void>;
}

export const useAddressWithCoords = (
  initialAddress: string = '',
  initialCoordinates: { lat: number; lon: number } | null = null
): UseAddressWithCoordsReturn => {
  const [address, setAddressState] = useState(initialAddress);
  const [coordinates, setCoordinatesState] = useState(initialCoordinates);
  const [loading, setLoading] = useState(false);

  const setAddress = useCallback(async (newAddress: string) => {
    setAddressState(newAddress);
    setLoading(true);
    
    try {
      const coords = await getCoordinates(newAddress);
      setCoordinatesState(coords);
    } catch (error) {
      console.error('Error getting coordinates:', error);
      setCoordinatesState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const setCoordinates = useCallback(async (lat: number, lon: number) => {
    setCoordinatesState({ lat, lon });
    setLoading(true);
    
    try {
      const { reverseGeocode } = await import('../services/AddressSearch');
      const addressData = await reverseGeocode(lat, lon);
      if (addressData) {
        setAddressState(addressData.address);
      }
    } catch (error) {
      console.error('Error getting address:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    address,
    coordinates,
    loading,
    setAddress,
    setCoordinates,
  };
};