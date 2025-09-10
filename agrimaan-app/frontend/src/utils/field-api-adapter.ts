/**
 * Adapt field form data to API expected format
 * Fixes 400 Bad Request errors
 */

export interface ApiFieldData {
  name: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  boundaries: {
    type: string;
    coordinates: number[][][];
  };
  area: {
    value: number;
    unit: 'hectare' | 'acre';
  };
  soilType: 'clay' | 'sandy' | 'loamy' | 'silty' | 'peaty' | 'chalky' | 'other';
  crops?: string[];
  sensors?: string[];
  notes?: string;
  irrigationSystem?: {
    type: 'drip' | 'sprinkler' | 'flood' | 'center pivot' | 'none';
    isAutomated: boolean;
  };
}

export const adaptFieldData = (formData: any): ApiFieldData => {
  // Convert form data to API format
  const lat = parseFloat(formData.coordinates?.latitude) || 0;
  const lon = parseFloat(formData.coordinates?.longitude) || 0;
  
  return {
    name: formData.name || '',
    location: {
      type: 'Point',
      coordinates: [lon, lat] // [longitude, latitude]
    },
    boundaries: {
      type: 'Polygon',
      coordinates: [[[lon, lat]]] // Simple point as polygon
    },
    area: {
      value: parseFloat(formData.area) || 0,
      unit: 'acre' // or 'hectare' based on your preference
    },
    soilType: (formData.soilType || 'other').toLowerCase() as any,
    notes: formData.description || '',
    irrigationSystem: {
      type: (formData.irrigationType || 'none') as 'drip' | 'sprinkler' | 'flood' | 'center pivot' | 'none',
      isAutomated: false
    },
    crops: [],
    sensors: []
  };
};

// Usage example:
// const apiData = adaptFieldData(formData);
// await dispatch(createFields(apiData));