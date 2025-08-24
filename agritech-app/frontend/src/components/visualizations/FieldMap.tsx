import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '@mui/material/styles';

// Define prop types for the component
interface FieldMapProps {
  fieldData: {
    _id: string;
    name: string;
    location: {
      lat: number;
      lng: number;
    };
    boundaries?: {
      type: string;
      coordinates: number[][][];
    };
    area?: number;
    soilType?: string;
  };
  sensors?: Array<{
    _id: string;
    name: string;
    type: string;
    location: {
      lat: number;
      lng: number;
    };
    status: string;
    lastReading?: {
      value: number;
      timestamp: string;
    };
  }>;
  crops?: Array<{
    _id: string;
    name: string;
    type: string;
    status: string;
    plantingDate: string;
    harvestDate?: string;
    area?: number;
    location?: {
      type: string;
      coordinates: number[][][];
    };
  }>;
  weatherData?: {
    temperature: number;
    humidity: number;
    condition: string;
    windSpeed: number;
    rainfall: number;
  };
  height?: string | number;
  width?: string | number;
  interactive?: boolean;
  showLegend?: boolean;
}

const FieldMap: React.FC<FieldMapProps> = ({
  fieldData,
  sensors = [],
  crops = [],
  weatherData,
  height = '500px',
  width = '100%',
  interactive = true,
  showLegend = true
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define sensor type colors
  const sensorColors: Record<string, string> = {
    soil_moisture: '#3498db', // blue
    temperature: '#e74c3c', // red
    humidity: '#9b59b6', // purple
    light: '#f1c40f', // yellow
    soil_ph: '#2ecc71', // green
    soil_ec: '#e67e22', // orange
    weather_station: '#34495e', // dark blue
    default: '#95a5a6' // gray
  };

  // Define crop status colors
  const cropStatusColors: Record<string, string> = {
    planted: '#27ae60', // green
    growing: '#2ecc71', // light green
    mature: '#f39c12', // orange
    harvested: '#95a5a6', // gray
    failed: '#e74c3c', // red
    default: '#bdc3c7' // light gray
  };

  // Create custom icons for sensors
  const createSensorIcon = (sensorType: string, status: string) => {
    const color = sensorColors[sensorType] || sensorColors.default;
    const statusColor = status === 'active' ? '#2ecc71' : status === 'inactive' ? '#e74c3c' : '#f39c12';
    
    return L.divIcon({
      className: 'custom-sensor-icon',
      html: `<div style="
        width: 12px;
        height: 12px;
        background-color: ${color};
        border: 2px solid ${statusColor};
        border-radius: 50%;
        box-shadow: 0 0 0 2px white;
      "></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !fieldData.location) return;
    
    try {
      // Create map instance if it doesn't exist
      if (!mapInstanceRef.current) {
        const map = L.map(mapRef.current).setView(
          [fieldData.location.lat, fieldData.location.lng],
          14
        );
        
        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // Disable interactions if not interactive
        if (!interactive) {
          map.dragging.disable();
          map.touchZoom.disable();
          map.doubleClickZoom.disable();
          map.scrollWheelZoom.disable();
          map.boxZoom.disable();
          map.keyboard.disable();
          if (map.tap) map.tap.disable();
        }
        
        mapInstanceRef.current = map;
      }
      
      const map = mapInstanceRef.current;
      
      // Clear existing layers
      map.eachLayer((layer) => {
        if (!(layer instanceof L.TileLayer)) {
          map.removeLayer(layer);
        }
      });
      
      // Add field boundary if available
      if (fieldData.boundaries && fieldData.boundaries.coordinates) {
        try {
          // Convert GeoJSON coordinates to Leaflet format
          const coordinates = fieldData.boundaries.coordinates[0].map(coord => [coord[1], coord[0]]);
          
          // Create polygon for field boundary
          const polygon = L.polygon(coordinates as L.LatLngExpression[], {
            color: theme.palette.primary.main,
            weight: 2,
            opacity: 0.7,
            fillColor: theme.palette.primary.light,
            fillOpacity: 0.3
          }).addTo(map);
          
          // Fit map to boundary
          map.fitBounds(polygon.getBounds());
          
          // Add field name popup
          polygon.bindPopup(`<b>${fieldData.name}</b><br>Area: ${fieldData.area || 'N/A'} ha<br>Soil: ${fieldData.soilType || 'N/A'}`);
        } catch (err) {
          console.error('Error creating field boundary:', err);
        }
      } else {
        // If no boundary, just add a marker for the field center
        L.marker([fieldData.location.lat, fieldData.location.lng])
          .addTo(map)
          .bindPopup(`<b>${fieldData.name}</b><br>Area: ${fieldData.area || 'N/A'} ha<br>Soil: ${fieldData.soilType || 'N/A'}`);
      }
      
      // Add crop areas if available
      crops.forEach(crop => {
        if (crop.location && crop.location.coordinates) {
          try {
            // Convert GeoJSON coordinates to Leaflet format
            const coordinates = crop.location.coordinates[0].map(coord => [coord[1], coord[0]]);
            
            // Create polygon for crop area
            const cropColor = cropStatusColors[crop.status] || cropStatusColors.default;
            const polygon = L.polygon(coordinates as L.LatLngExpression[], {
              color: cropColor,
              weight: 1,
              opacity: 0.7,
              fillColor: cropColor,
              fillOpacity: 0.4
            }).addTo(map);
            
            // Add crop info popup
            const plantingDate = new Date(crop.plantingDate).toLocaleDateString();
            const harvestDate = crop.harvestDate ? new Date(crop.harvestDate).toLocaleDateString() : 'Not set';
            polygon.bindPopup(`<b>${crop.name}</b><br>Type: ${crop.type}<br>Status: ${crop.status}<br>Planted: ${plantingDate}<br>Harvest: ${harvestDate}`);
          } catch (err) {
            console.error('Error creating crop area:', err);
          }
        }
      });
      
      // Add sensors
      sensors.forEach(sensor => {
        if (sensor.location) {
          try {
            // Create custom icon based on sensor type and status
            const icon = createSensorIcon(sensor.type, sensor.status);
            
            // Add marker for sensor
            const marker = L.marker([sensor.location.lat, sensor.location.lng], { icon })
              .addTo(map);
            
            // Add sensor info popup
            let popupContent = `<b>${sensor.name}</b><br>Type: ${sensor.type}<br>Status: ${sensor.status}`;
            if (sensor.lastReading) {
              const readingTime = new Date(sensor.lastReading.timestamp).toLocaleString();
              popupContent += `<br>Last reading: ${sensor.lastReading.value}<br>Time: ${readingTime}`;
            }
            marker.bindPopup(popupContent);
          } catch (err) {
            console.error('Error creating sensor marker:', err);
          }
        }
      });
      
      // Add weather info if available
      if (weatherData) {
        const weatherIcon = L.divIcon({
          className: 'weather-icon',
          html: `<div style="
            background-color: rgba(255, 255, 255, 0.8);
            padding: 5px;
            border-radius: 5px;
            border: 1px solid #ccc;
            font-size: 12px;
            width: 120px;
            text-align: center;
          ">
            <b>${weatherData.condition}</b><br>
            ${weatherData.temperature}°C | ${weatherData.humidity}%<br>
            Wind: ${weatherData.windSpeed} km/h<br>
            Rain: ${weatherData.rainfall} mm
          </div>`,
          iconSize: [120, 80],
          iconAnchor: [60, 40]
        });
        
        // Position weather info in the top right corner of the field
        if (fieldData.boundaries && fieldData.boundaries.coordinates) {
          try {
            const bounds = L.latLngBounds(
              fieldData.boundaries.coordinates[0].map(coord => [coord[1], coord[0]]) as L.LatLngExpression[]
            );
            const ne = bounds.getNorthEast();
            L.marker([ne.lat, ne.lng], { icon: weatherIcon }).addTo(map);
          } catch (err) {
            console.error('Error adding weather info:', err);
          }
        } else {
          // If no boundary, place weather info near the field center
          L.marker([fieldData.location.lat + 0.01, fieldData.location.lng + 0.01], { icon: weatherIcon }).addTo(map);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
      setLoading(false);
    }
    
    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [fieldData, sensors, crops, weatherData, theme, interactive]);

  // Render legend
  const renderLegend = () => {
    if (!showLegend) return null;
    
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          position: 'absolute', 
          bottom: '10px', 
          right: '10px', 
          padding: '8px', 
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 1000
        }}
      >
        <Typography variant="subtitle2" gutterBottom>Legend</Typography>
        
        {/* Sensor types */}
        <Typography variant="caption" display="block" sx={{ fontWeight: 'bold', mt: 1 }}>Sensors</Typography>
        {Object.entries(sensorColors).map(([type, color]) => (
          <Box key={type} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                backgroundColor: color, 
                borderRadius: '50%',
                border: '2px solid white',
                mr: 1 
              }} 
            />
            <Typography variant="caption">
              {type.replace('_', ' ')}
            </Typography>
          </Box>
        ))}
        
        {/* Crop statuses */}
        <Typography variant="caption" display="block" sx={{ fontWeight: 'bold', mt: 1 }}>Crops</Typography>
        {Object.entries(cropStatusColors).map(([status, color]) => (
          <Box key={status} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                backgroundColor: color,
                mr: 1 
              }} 
            />
            <Typography variant="caption">
              {status}
            </Typography>
          </Box>
        ))}
      </Paper>
    );
  };

  return (
    <Box sx={{ position: 'relative', height, width }}>
      {loading && (
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          zIndex: 1000
        }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 1000
        }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}
      
      <div 
        ref={mapRef} 
        style={{ 
          height: '100%', 
          width: '100%',
          visibility: loading ? 'hidden' : 'visible'
        }}
      />
      
      {renderLegend()}
    </Box>
  );
};

export default FieldMap;