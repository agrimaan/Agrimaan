import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  FormControl,
  Grid,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Button,
  Chip,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardHeader
} from '@mui/material';
import {
  Map as MapIcon,
  Layers as LayersIcon,
  Satellite as SatelliteIcon,
  Terrain as TerrainIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  MyLocation as MyLocationIcon,
  Timeline as TimelineIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Crop as CropIcon,
  Grass as GrassIcon,
  WaterDrop as WaterDropIcon,
  Spa as SpaIcon,
  Straighten as StraightenIcon,
  SquareFoot as SquareFootIcon,
  CompareArrows as CompareArrowsIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

// Fix for Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Define interfaces
interface MapLayer {
  id: string;
  name: string;
  type: 'base' | 'overlay';
  url: string;
  visible: boolean;
  opacity: number;
  attribution: string;
  maxZoom: number;
  minZoom: number;
}

interface Field {
  id: string;
  name: string;
  geometry: any; // GeoJSON geometry
  area: number;
  crop?: string;
  soilType?: string;
  plantingDate?: string;
  harvestDate?: string;
  visible: boolean;
}

interface SatelliteImage {
  id: string;
  date: string;
  url: string;
  type: 'rgb' | 'ndvi' | 'false-color';
  cloudCover: number;
}

// Styled components
const MapContainer = styled(Box)(({ theme }) => ({
  height: '70vh',
  width: '100%',
  position: 'relative',
  '& .leaflet-container': {
    height: '100%',
    width: '100%',
    borderRadius: theme.shape.borderRadius,
  },
}));

const MapToolbar = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: 1000,
  padding: theme.spacing(0.5),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
}));

const DrawingToolbar = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: theme.spacing(2),
  zIndex: 1000,
  padding: theme.spacing(0.5),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
}));

const ZoomControls = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: 1000,
  padding: theme.spacing(0.5),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
}));

const TimeSlider = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1000,
  width: '80%',
  maxWidth: '500px',
  padding: theme.spacing(1),
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  borderRadius: theme.shape.borderRadius,
}));

// Mock data
const baseLayers: MapLayer[] = [
  {
    id: 'osm',
    name: 'OpenStreetMap',
    type: 'base',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    visible: true,
    opacity: 1,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    minZoom: 1
  },
  {
    id: 'satellite',
    name: 'Satellite',
    type: 'base',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    visible: false,
    opacity: 1,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 19,
    minZoom: 1
  },
  {
    id: 'terrain',
    name: 'Terrain',
    type: 'base',
    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
    visible: false,
    opacity: 1,
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
    minZoom: 1
  }
];

const overlayLayers: MapLayer[] = [
  {
    id: 'soil',
    name: 'Soil Types',
    type: 'overlay',
    url: 'https://maps.nationalmap.gov/arcgis/rest/services/USGSSoilSurvey/MapServer/tile/{z}/{y}/{x}',
    visible: false,
    opacity: 0.7,
    attribution: 'USGS Soil Survey',
    maxZoom: 19,
    minZoom: 1
  },
  {
    id: 'precipitation',
    name: 'Precipitation',
    type: 'overlay',
    url: 'https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/{z}/{x}/{y}.png',
    visible: false,
    opacity: 0.7,
    attribution: 'NOAA, Iowa State University',
    maxZoom: 18,
    minZoom: 1
  }
];

const mockFields: Field[] = [
  {
    id: 'field-1',
    name: 'North Field',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-121.1867, 37.6564],
        [-121.1867, 37.6664],
        [-121.1767, 37.6664],
        [-121.1767, 37.6564],
        [-121.1867, 37.6564]
      ]]
    },
    area: 25.4,
    crop: 'Corn',
    soilType: 'Clay Loam',
    plantingDate: '2025-03-15',
    harvestDate: '2025-09-20',
    visible: true
  },
  {
    id: 'field-2',
    name: 'South Field',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-121.1867, 37.6464],
        [-121.1867, 37.6564],
        [-121.1767, 37.6564],
        [-121.1767, 37.6464],
        [-121.1867, 37.6464]
      ]]
    },
    area: 18.7,
    crop: 'Soybeans',
    soilType: 'Silt Loam',
    plantingDate: '2025-04-10',
    harvestDate: '2025-10-05',
    visible: true
  }
];

const mockSatelliteImages: SatelliteImage[] = [
  {
    id: 'sat-1',
    date: '2025-05-15',
    url: 'https://example.com/satellite/20250515_rgb.png',
    type: 'rgb',
    cloudCover: 5
  },
  {
    id: 'sat-2',
    date: '2025-05-15',
    url: 'https://example.com/satellite/20250515_ndvi.png',
    type: 'ndvi',
    cloudCover: 5
  },
  {
    id: 'sat-3',
    date: '2025-06-01',
    url: 'https://example.com/satellite/20250601_rgb.png',
    type: 'rgb',
    cloudCover: 10
  },
  {
    id: 'sat-4',
    date: '2025-06-01',
    url: 'https://example.com/satellite/20250601_ndvi.png',
    type: 'ndvi',
    cloudCover: 10
  },
  {
    id: 'sat-5',
    date: '2025-06-15',
    url: 'https://example.com/satellite/20250615_rgb.png',
    type: 'rgb',
    cloudCover: 2
  },
  {
    id: 'sat-6',
    date: '2025-06-15',
    url: 'https://example.com/satellite/20250615_ndvi.png',
    type: 'ndvi',
    cloudCover: 2
  }
];

const InteractiveFieldMap: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const mapRef = useRef<L.Map | null>(null);
  const drawControlRef = useRef<L.Control.Draw | null>(null);
  const layersRef = useRef<Record<string, L.Layer>>({});
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [layersDrawerOpen, setLayersDrawerOpen] = useState(false);
  const [fieldsDrawerOpen, setFieldsDrawerOpen] = useState(false);
  const [satelliteDrawerOpen, setSatelliteDrawerOpen] = useState(false);
  const [activeBaseLayer, setActiveBaseLayer] = useState('osm');
  const [visibleOverlays, setVisibleOverlays] = useState<string[]>([]);
  const [overlayOpacity, setOverlayOpacity] = useState<Record<string, number>>({});
  const [fields, setFields] = useState<Field[]>(mockFields);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [satelliteDate, setSatelliteDate] = useState<string>(mockSatelliteImages[0].date);
  const [satelliteType, setSatelliteType] = useState<'rgb' | 'ndvi' | 'false-color'>('rgb');
  const [satelliteOpacity, setSatelliteOpacity] = useState(0.7);
  const [satelliteVisible, setSatelliteVisible] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapTabValue, setMapTabValue] = useState(0);
  
  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      // Create map
      const map = L.map('map', {
        center: [37.6564, -121.1867],
        zoom: 14,
        zoomControl: false
      });
      
      // Create feature group for drawn items
      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);
      drawnItemsRef.current = drawnItems;
      
      // Initialize draw control
      const drawControl = new L.Control.Draw({
        draw: {
          polyline: false,
          circle: false,
          circlemarker: false,
          marker: false,
          rectangle: {
            shapeOptions: {
              color: theme.palette.primary.main,
              weight: 3
            }
          },
          polygon: {
            allowIntersection: false,
            showArea: true,
            shapeOptions: {
              color: theme.palette.primary.main,
              weight: 3
            }
          }
        },
        edit: {
          featureGroup: drawnItems,
        //  poly: {
        //   allowIntersection: false
        //  }
        }
      });
      
      // Add base layers
      baseLayers.forEach(layer => {
        const tileLayer = L.tileLayer(layer.url, {
          attribution: layer.attribution,
          maxZoom: layer.maxZoom,
          minZoom: layer.minZoom
        });
        
        if (layer.visible) {
          tileLayer.addTo(map);
        }
        
        layersRef.current[layer.id] = tileLayer;
      });
      
      // Add overlay layers
      overlayLayers.forEach(layer => {
        const tileLayer = L.tileLayer(layer.url, {
          attribution: layer.attribution,
          maxZoom: layer.maxZoom,
          minZoom: layer.minZoom,
          opacity: layer.opacity
        });
        
        if (layer.visible) {
          tileLayer.addTo(map);
          setVisibleOverlays(prev => [...prev, layer.id]);
        }
        
        setOverlayOpacity(prev => ({ ...prev, [layer.id]: layer.opacity }));
        layersRef.current[layer.id] = tileLayer;
      });
      
      // Add fields as GeoJSON
      fields.forEach(field => {
        const geoJSONLayer = L.geoJSON(
          { type: 'Feature', geometry: field.geometry, properties: { id: field.id, name: field.name } } as GeoJSON.Feature, // Type assertion
          {
            style: {
              color: theme.palette.secondary.main,
              weight: 2,
              opacity: 1,
              fillOpacity: 0.2
            },
            onEachFeature: (feature, layer) => {
              layer.bindTooltip(field.name);
              layer.on('click', () => {
                setSelectedField(field.id);
              });
            }
          }
        );
        
        if (field.visible) {
          geoJSONLayer.addTo(map);
        }
        
        layersRef.current[`field-${field.id}`] = geoJSONLayer;
      });
      
      // Handle draw events
      map.on(L.Draw.Event.CREATED, (e: any) => {
        const layer = e.layer;
        drawnItems.addLayer(layer);
        
        // Generate a new field from the drawn shape
        const geoJSON = layer.toGeoJSON();
        const newField: Field = {
          id: `field-${Date.now()}`,
          name: `New Field ${fields.length + 1}`,
          geometry: geoJSON.geometry,
          area: L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]),
          visible: true
        };
        
        setFields(prev => [...prev, newField]);
        setSelectedField(newField.id);
        
        showSnackbar('Field created successfully', 'success');
      });
      
      // Save map reference
      mapRef.current = map;
      drawControlRef.current = drawControl;
      
      // Finish loading
      setLoading(false);
    }
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);
  
  // Handle base layer change
  const handleBaseLayerChange = (layerId: string) => {
    if (mapRef.current) {
      // Remove current base layer
      baseLayers.forEach(layer => {
        if (layer.id !== layerId && layer.visible) {
          mapRef.current?.removeLayer(layersRef.current[layer.id]);
        }
      });
      
      // Add new base layer
      mapRef.current.addLayer(layersRef.current[layerId]);
      
      // Update state
      setActiveBaseLayer(layerId);
    }
  };
  
  // Handle overlay layer toggle
  const handleOverlayToggle = (layerId: string) => {
    if (mapRef.current) {
      const layer = layersRef.current[layerId];
      
      if (visibleOverlays.includes(layerId)) {
        // Remove overlay
        mapRef.current.removeLayer(layer);
        setVisibleOverlays(prev => prev.filter(id => id !== layerId));
      } else {
        // Add overlay
        mapRef.current.addLayer(layer);
        setVisibleOverlays(prev => [...prev, layerId]);
      }
    }
  };
  
  // Handle overlay opacity change
  const handleOverlayOpacityChange = (layerId: string, value: number) => {
    if (mapRef.current) {
      const layer = layersRef.current[layerId] as L.TileLayer;
      layer.setOpacity(value);
      setOverlayOpacity(prev => ({ ...prev, [layerId]: value }));
    }
  };
  
  // Handle field visibility toggle
  const handleFieldVisibilityToggle = (fieldId: string) => {
    if (mapRef.current) {
      const field = fields.find(f => f.id === fieldId);
      const layer = layersRef.current[`field-${fieldId}`];
      
      if (field) {
        if (field.visible) {
          // Hide field
          mapRef.current.removeLayer(layer);
        } else {
          // Show field
          mapRef.current.addLayer(layer);
        }
        
        // Update state
        setFields(prev => prev.map(f => 
          f.id === fieldId ? { ...f, visible: !f.visible } : f
        ));
      }
    }
  };
  
  // Handle edit mode toggle
  const handleEditModeToggle = () => {
    if (mapRef.current && drawControlRef.current) {
      if (editMode) {
        // Disable edit mode
        mapRef.current.removeControl(drawControlRef.current);
      } else {
        // Enable edit mode
        mapRef.current.addControl(drawControlRef.current);
      }
      
      setEditMode(!editMode);
    }
  };
  
  // Handle satellite date change
  const handleSatelliteDateChange = (date: string) => {
    setSatelliteDate(date);
    
    // Update satellite layer if visible
    if (satelliteVisible) {
      updateSatelliteLayer(date, satelliteType);
    }
  };
  
  // Handle satellite type change
  const handleSatelliteTypeChange = (type: 'rgb' | 'ndvi' | 'false-color') => {
    setSatelliteType(type);
    
    // Update satellite layer if visible
    if (satelliteVisible) {
      updateSatelliteLayer(satelliteDate, type);
    }
  };
  
  // Handle satellite visibility toggle
  const handleSatelliteVisibilityToggle = () => {
    if (satelliteVisible) {
      // Hide satellite layer
      if (mapRef.current && layersRef.current['satellite-layer']) {
        mapRef.current.removeLayer(layersRef.current['satellite-layer']);
      }
    } else {
      // Show satellite layer
      updateSatelliteLayer(satelliteDate, satelliteType);
    }
    
    setSatelliteVisible(!satelliteVisible);
  };
  
  // Update satellite layer
  const updateSatelliteLayer = (date: string, type: 'rgb' | 'ndvi' | 'false-color') => {
    if (mapRef.current) {
      // Remove existing satellite layer
      if (layersRef.current['satellite-layer']) {
        mapRef.current.removeLayer(layersRef.current['satellite-layer']);
      }
      
      // Find satellite image
      const image = mockSatelliteImages.find(img => img.date === date && img.type === type);
      
      if (image) {
        // Create new satellite layer
        // Note: In a real app, we would use the actual image URL
        // For this example, we'll use a placeholder
        const bounds = L.latLngBounds(
          [37.6464, -121.1867],
          [37.6664, -121.1767]
        );
        
        const satelliteLayer = L.imageOverlay(
          `https://via.placeholder.com/1000x1000?text=${type.toUpperCase()}+${date}`,
          bounds,
          { opacity: satelliteOpacity }
        );
        
        satelliteLayer.addTo(mapRef.current);
        layersRef.current['satellite-layer'] = satelliteLayer;
      }
    }
  };
  
  // Handle satellite opacity change
  const handleSatelliteOpacityChange = (value: number) => {
    setSatelliteOpacity(value);
    
    if (mapRef.current && layersRef.current['satellite-layer']) {
      (layersRef.current['satellite-layer'] as L.ImageOverlay).setOpacity(value);
    }
  };
  
  // Handle zoom in
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };
  
  // Handle zoom out
  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };
  
  // Handle locate me
  const handleLocateMe = () => {
    if (mapRef.current) {
      mapRef.current.locate({ setView: true, maxZoom: 16 });
      showSnackbar('Finding your location...', 'info');
    }
  };
  
  // Handle fullscreen toggle
  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Handle map tab change
  const handleMapTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setMapTabValue(newValue);
  };
  
  // Show snackbar message
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  // Render layers drawer content
  const renderLayersDrawerContent = () => (
    <Box sx={{ width: isMobile ? '100%' : 300, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Map Layers</Typography>
        <IconButton onClick={() => setLayersDrawerOpen(false)}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />
      
      <Typography variant="subtitle1" gutterBottom>Base Maps</Typography>
      <List dense>
        {baseLayers.map(layer => (
          <ListItem key={layer.id} disablePadding>
            <ListItemButton
              selected={activeBaseLayer === layer.id}
              onClick={() => handleBaseLayerChange(layer.id)}
            >
              <ListItemIcon>
                {layer.id === 'osm' && <MapIcon />}
                {layer.id === 'satellite' && <SatelliteIcon />}
                {layer.id === 'terrain' && <TerrainIcon />}
              </ListItemIcon>
              <ListItemText primary={layer.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="subtitle1" gutterBottom>Overlay Layers</Typography>
      <List dense>
        {overlayLayers.map(layer => (
          <React.Fragment key={layer.id}>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleOverlayToggle(layer.id)}>
                <ListItemIcon>
                  {layer.id === 'soil' && <SpaIcon />}
                  {layer.id === 'precipitation' && <WaterDropIcon />}
                </ListItemIcon>
                <ListItemText primary={layer.name} />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={visibleOverlays.includes(layer.id)}
                    onChange={() => handleOverlayToggle(layer.id)}
                  />
                </ListItemSecondaryAction>
              </ListItemButton>
            </ListItem>
            {visibleOverlays.includes(layer.id) && (
              <ListItem sx={{ pl: 4 }}>
                <Box sx={{ width: '100%' }}>
                  <Typography variant="body2" gutterBottom>
                    Opacity: {Math.round(overlayOpacity[layer.id] * 100)}%
                  </Typography>
                  <Slider
                    value={overlayOpacity[layer.id]}
                    min={0}
                    max={1}
                    step={0.1}
                    onChange={(_, value) => handleOverlayOpacityChange(layer.id, value as number)}
                  />
                </Box>
              </ListItem>
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
  
  // Render fields drawer content
  const renderFieldsDrawerContent = () => (
    <Box sx={{ width: isMobile ? '100%' : 300, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Fields</Typography>
        <IconButton onClick={() => setFieldsDrawerOpen(false)}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />
      
      <List dense>
        {fields.map(field => (
          <ListItem 
            key={field.id} 
            disablePadding
            secondaryAction={
              <Switch
                edge="end"
                checked={field.visible}
                onChange={() => handleFieldVisibilityToggle(field.id)}
              />
            }
          >
            <ListItemButton
              selected={selectedField === field.id}
              onClick={() => setSelectedField(field.id)}
            >
              <ListItemIcon>
                <CropIcon />
              </ListItemIcon>
              <ListItemText 
                primary={field.name} 
                secondary={`${field.area.toFixed(1)} acres${field.crop ? ` • ${field.crop}` : ''}`} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      {selectedField && (
        <>
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>Field Details</Typography>
          <Box sx={{ p: 1 }}>
            {(() => {
              const field = fields.find(f => f.id === selectedField);
              if (!field) return null;
              
              return (
                <>
                  <Typography variant="h6">{field.name}</Typography>
                  <Typography variant="body2" gutterBottom>
                    Area: {field.area.toFixed(2)} acres
                  </Typography>
                  
                  {field.crop && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <GrassIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Crop: {field.crop}
                      </Typography>
                    </Box>
                  )}
                  
                  {field.soilType && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <SpaIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Soil Type: {field.soilType}
                      </Typography>
                    </Box>
                  )}
                  
                  {field.plantingDate && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2">
                        Planting Date: {new Date(field.plantingDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  )}
                  
                  {field.harvestDate && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2">
                        Harvest Date: {new Date(field.harvestDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                    >
                      Delete
                    </Button>
                  </Box>
                </>
              );
            })()}
          </Box>
        </>
      )}
    </Box>
  );
  
  // Render satellite drawer content
  const renderSatelliteDrawerContent = () => (
    <Box sx={{ width: isMobile ? '100%' : 300, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Satellite Imagery</Typography>
        <IconButton onClick={() => setSatelliteDrawerOpen(false)}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="satellite-date-label">Date</InputLabel>
        <Select
          labelId="satellite-date-label"
          id="satellite-date"
          value={satelliteDate}
          onChange={(e) => handleSatelliteDateChange(e.target.value)}
          label="Date"
        >
          {Array.from(new Set(mockSatelliteImages.map(img => img.date))).map(date => (
            <MenuItem key={date} value={date}>
              {new Date(date).toLocaleDateString()}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="satellite-type-label">Image Type</InputLabel>
        <Select
          labelId="satellite-type-label"
          id="satellite-type"
          value={satelliteType}
          onChange={(e) => handleSatelliteTypeChange(e.target.value as 'rgb' | 'ndvi' | 'false-color')}
          label="Image Type"
        >
          <MenuItem value="rgb">RGB (Natural Color)</MenuItem>
          <MenuItem value="ndvi">NDVI (Vegetation Index)</MenuItem>
          <MenuItem value="false-color">False Color</MenuItem>
        </Select>
      </FormControl>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" gutterBottom>
          Opacity: {Math.round(satelliteOpacity * 100)}%
        </Typography>
        <Slider
          value={satelliteOpacity}
          min={0}
          max={1}
          step={0.1}
          onChange={(_, value) => handleSatelliteOpacityChange(value as number)}
        />
      </Box>
      
      <Button
        fullWidth
        variant={satelliteVisible ? "contained" : "outlined"}
        startIcon={satelliteVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
        onClick={handleSatelliteVisibilityToggle}
      >
        {satelliteVisible ? "Hide Satellite Imagery" : "Show Satellite Imagery"}
      </Button>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="subtitle1" gutterBottom>Available Dates</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {Array.from(new Set(mockSatelliteImages.map(img => img.date))).map(date => {
          const image = mockSatelliteImages.find(img => img.date === date);
          return (
            <Chip
              key={date}
              label={new Date(date).toLocaleDateString()}
              onClick={() => handleSatelliteDateChange(date)}
              color={satelliteDate === date ? "primary" : "default"}
              variant={satelliteDate === date ? "filled" : "outlined"}
              size="small"
              icon={<SatelliteIcon />}
            />
          );
        })}
      </Box>
    </Box>
  );
  
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant={isMobile ? "h5" : "h4"} component="h1" gutterBottom>
          Interactive Field Map
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Visualize and manage your fields with advanced mapping tools
        </Typography>
      </Box>
      
      {/* Map Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={mapTabValue}
          onChange={handleMapTabChange}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab label="Field Map" />
          <Tab label="Satellite Imagery" />
          <Tab label="Soil Zones" />
          <Tab label="Crop Rotation" />
        </Tabs>
      </Box>
      
      {/* Map Container */}
      <MapContainer
        id="map"
        sx={{
          height: isFullscreen ? '100vh' : '70vh',
          ...(isFullscreen && {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: theme.zIndex.modal,
            borderRadius: 0,
          }),
        }}
      >
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 1001,
            }}
          >
            <CircularProgress />
          </Box>
        )}
        
        {/* Map Toolbar */}
        <MapToolbar>
          <Tooltip title="Layers">
            <IconButton onClick={() => setLayersDrawerOpen(true)}>
              <LayersIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Fields">
            <IconButton onClick={() => setFieldsDrawerOpen(true)}>
              <CropIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Satellite Imagery">
            <IconButton onClick={() => setSatelliteDrawerOpen(true)}>
              <SatelliteIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Measure">
            <IconButton>
              <StraightenIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Compare">
            <IconButton>
              <CompareArrowsIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={editMode ? "Exit Edit Mode" : "Edit Mode"}>
            <IconButton 
              onClick={handleEditModeToggle}
              color={editMode ? "primary" : "default"}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
            <IconButton onClick={handleFullscreenToggle}>
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
        </MapToolbar>
        
        {/* Drawing Toolbar (visible in edit mode) */}
        {editMode && (
          <DrawingToolbar>
            <Tooltip title="Draw Rectangle">
              <IconButton>
                <SquareFootIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Draw Polygon">
              <IconButton>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Undo">
              <IconButton>
                <UndoIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Redo">
              <IconButton>
                <RedoIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Save">
              <IconButton>
                <SaveIcon />
              </IconButton>
            </Tooltip>
          </DrawingToolbar>
        )}
        
        {/* Zoom Controls */}
        <ZoomControls>
          <Tooltip title="Zoom In">
            <IconButton onClick={handleZoomIn}>
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out">
            <IconButton onClick={handleZoomOut}>
              <RemoveIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="My Location">
            <IconButton onClick={handleLocateMe}>
              <MyLocationIcon />
            </IconButton>
          </Tooltip>
        </ZoomControls>
        
        {/* Time Slider (visible when satellite imagery is active) */}
        {satelliteVisible && (
          <TimeSlider>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TimelineIcon sx={{ mr: 1 }} />
              <Typography variant="body2">
                Satellite Image: {new Date(satelliteDate).toLocaleDateString()} - {satelliteType.toUpperCase()}
              </Typography>
            </Box>
            <Slider
              value={Array.from(new Set(mockSatelliteImages.map(img => img.date))).indexOf(satelliteDate)}
              min={0}
              max={Array.from(new Set(mockSatelliteImages.map(img => img.date))).length - 1}
              step={1}
              marks
              onChange={(_, value) => handleSatelliteDateChange(
                Array.from(new Set(mockSatelliteImages.map(img => img.date)))[value as number]
              )}
            />
          </TimeSlider>
        )}
      </MapContainer>
      
      {/* Field Information (below map) */}
      {selectedField && !isFullscreen && (
        <Card sx={{ mt: 3 }}>
          <CardHeader
            title={fields.find(f => f.id === selectedField)?.name || 'Field Details'}
            action={
              <IconButton onClick={() => setSelectedField(null)}>
                <CloseIcon />
              </IconButton>
            }
          />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="text.secondary">Area</Typography>
                <Typography variant="body1">
                  {fields.find(f => f.id === selectedField)?.area.toFixed(2)} acres
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="text.secondary">Crop</Typography>
                <Typography variant="body1">
                  {fields.find(f => f.id === selectedField)?.crop || 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="text.secondary">Soil Type</Typography>
                <Typography variant="body1">
                  {fields.find(f => f.id === selectedField)?.soilType || 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="text.secondary">Planting Date</Typography>
                <Typography variant="body1">
                  {fields.find(f => f.id === selectedField)?.plantingDate ? 
                    new Date(fields.find(f => f.id === selectedField)?.plantingDate as string).toLocaleDateString() : 
                    'Not specified'}
                </Typography>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                sx={{ mr: 1 }}
              >
                Edit Field
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
              >
                Delete Field
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
      
      {/* Drawers */}
      <Drawer
        anchor={isMobile ? "bottom" : "right"}
        open={layersDrawerOpen}
        onClose={() => setLayersDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': isMobile ? {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '90%'
          } : {}
        }}
      >
        {renderLayersDrawerContent()}
      </Drawer>
      
      <Drawer
        anchor={isMobile ? "bottom" : "right"}
        open={fieldsDrawerOpen}
        onClose={() => setFieldsDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': isMobile ? {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '90%'
          } : {}
        }}
      >
        {renderFieldsDrawerContent()}
      </Drawer>
      
      <Drawer
        anchor={isMobile ? "bottom" : "right"}
        open={satelliteDrawerOpen}
        onClose={() => setSatelliteDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': isMobile ? {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '90%'
          } : {}
        }}
      >
        {renderSatelliteDrawerContent()}
      </Drawer>
      
      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InteractiveFieldMap;