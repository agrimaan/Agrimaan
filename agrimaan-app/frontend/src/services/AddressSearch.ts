import axios from 'axios';

// OpenStreetMap Nominatim API configuration
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'AgrimaanApp/1.0';

// Rate limiting configuration
const REQUEST_DELAY = 1000; // 1 second between requests
let lastRequestTime = 0;

// Type definitions
export interface AddressSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
  address: {
    house_number?: string;
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface AddressData {
  address: string;
  coordinates: Coordinates;
  components: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

/**
 * Rate limiting helper
 */
const rateLimit = async (): Promise<void> => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < REQUEST_DELAY) {
    await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY - timeSinceLastRequest));
  }
  
  lastRequestTime = Date.now();
};

/**
 * Search for address suggestions
 */
export const searchAddress = async (query: string): Promise<AddressSuggestion[]> => {
  if (!query.trim()) return [];

  try {
    await rateLimit();

    const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
      params: {
        q: query,
        format: 'json',
        addressdetails: 1,
        limit: 5,
        'accept-language': 'en',
        countrycodes: 'in', // Focus on India for Agrimaan
      },
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Address search error:', error);
    return [];
  }
};

/**
 * Get coordinates for a specific address
 */
export const getCoordinates = async (address: string): Promise<Coordinates | null> => {
  if (!address.trim()) return null;

  try {
    await rateLimit();

    const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
      params: {
        q: address,
        format: 'json',
        limit: 1,
        'accept-language': 'en',
        countrycodes: 'in',
      },
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
      };
    }

    return null;
  } catch (error) {
    console.error('Coordinates fetch error:', error);
    return null;
  }
};

/**
 * Reverse geocode - get address from coordinates
 */
export const reverseGeocode = async (lat: number, lon: number): Promise<AddressData | null> => {
  try {
    await rateLimit();

    const response = await axios.get(`${NOMINATIM_BASE_URL}/reverse`, {
      params: {
        lat: lat,
        lon: lon,
        format: 'json',
        addressdetails: 1,
        'accept-language': 'en',
      },
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

    const data = response.data;
    if (data && data.address) {
      return {
        address: data.display_name,
        coordinates: { lat, lon },
        components: {
          street: data.address.road || data.address.street,
          city: data.address.city || data.address.town || data.address.village,
          state: data.address.state,
          postalCode: data.address.postcode,
          country: data.address.country,
        },
      };
    }

    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

/**
 * Format address for display
 */
export const formatAddress = (address: AddressSuggestion): string => {
  const { address: addr } = address;
  const parts = [];

  if (addr.house_number) parts.push(addr.house_number);
  if (addr.road) parts.push(addr.road);
  if (addr.city) parts.push(addr.city);
  if (addr.state) parts.push(addr.state);
  if (addr.postcode) parts.push(addr.postcode);

  return parts.join(', ') || address.display_name;
};

/**
 * Debounce function for search input
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
