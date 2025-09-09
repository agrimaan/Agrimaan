import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';
import { setAlert } from '../alert/alertSlice';

// Types
interface Location {
  type: string;
  coordinates: number[];
}

interface MeasurementRange {
  min: number;
  max: number;
}

interface Reading {
  _id?: string;
  value: any;
  timestamp: Date;
}

interface Alert {
  _id?: string;
  type: 'low_battery' | 'out_of_range' | 'connection_lost' | 'malfunction' | 'other';
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface Sensor {
  _id: string;
  name: string;
  type: 'soil_moisture' | 'temperature' | 'humidity' | 'rainfall' | 'light' | 'wind' | 'soil_nutrient' | 'water_level' | 'other';
  Fields: string;
  location: Location;
  manufacturer?: string;
  model?: string;
  serialNumber: string;
  installationDate: Date;
  batteryLevel?: number;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  firmwareVersion?: string;
  measurementUnit?: string;
  measurementRange?: MeasurementRange;
  accuracy?: number;
  calibrationDate?: Date;
  dataTransmissionInterval?: number;
  lastReading?: Reading;
  readings: Reading[];
  alerts: Alert[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SensorState {
  sensors: Sensor[];
  sensor: Sensor | null;
  loading: boolean;
  error: string | null;
}

// Get all sensors
export const getSensors = createAsyncThunk(
  'sensor/getSensors',
  async (
    { FieldsId, type, status }: { FieldsId?: string; type?: string; status?: string } = {},
    { rejectWithValue }
  ) => {
    try {
  let url = `${API_BASE_URL}/api/sensors`;
      const params = [];
      
      if (FieldsId) params.push(`FieldsId=${FieldsId}`);
      if (type) params.push(`type=${type}`);
      if (status) params.push(`status=${status}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const res = await axios.get(url);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch sensors');
    }
  }
);

// Get sensor by ID
export const getSensorById = createAsyncThunk(
  'sensor/getSensorById',
  async (id: string, { rejectWithValue }) => {
    try {
  const res = await axios.get(`${API_BASE_URL}/api/sensors/${id}`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch sensor');
    }
  }
);

// Create sensor
export const createSensor = createAsyncThunk(
  'sensor/createSensor',
  async (formData: Partial<Sensor>, { dispatch, rejectWithValue }) => {
    try {
  const res = await axios.post(`${API_BASE_URL}/api/sensors`, formData);
      
      dispatch(setAlert({
        message: 'Sensor created successfully',
        type: 'success'
      }) as any);
      
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create sensor');
    }
  }
);

// Update sensor
export const updateSensor = createAsyncThunk(
  'sensor/updateSensor',
  async ({ id, formData }: { id: string; formData: Partial<Sensor> }, { dispatch, rejectWithValue }) => {
    try {
  const res = await axios.put(`${API_BASE_URL}/api/sensors/${id}`, formData);
      
      dispatch(setAlert({
        message: 'Sensor updated successfully',
        type: 'success'
      }) as any);
      
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update sensor');
    }
  }
);

// Delete sensor
export const deleteSensor = createAsyncThunk(
  'sensor/deleteSensor',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
  await axios.delete(`${API_BASE_URL}/api/sensors/${id}`);
      
      dispatch(setAlert({
        message: 'Sensor deleted successfully',
        type: 'success'
      }) as any);
      
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete sensor');
    }
  }
);

// Add sensor reading
export const addSensorReading = createAsyncThunk(
  'sensor/addSensorReading',
  async ({ sensorId, reading }: { sensorId: string; reading: Partial<Reading> }, { dispatch, rejectWithValue }) => {
    try {
  const res = await axios.post(`${API_BASE_URL}/api/sensors/${sensorId}/reading`, reading);
      
      dispatch(setAlert({
        message: 'Sensor reading added successfully',
        type: 'success'
      }) as any);
      
      return { sensorId, readings: res.data };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add sensor reading');
    }
  }
);

// Add sensor alert
export const addSensorAlert = createAsyncThunk(
  'sensor/addSensorAlert',
  async ({ sensorId, alert }: { sensorId: string; alert: Partial<Alert> }, { dispatch, rejectWithValue }) => {
    try {
  const res = await axios.post(`${API_BASE_URL}/api/sensors/${sensorId}/alert`, alert);
      
      dispatch(setAlert({
        message: 'Sensor alert added successfully',
        type: 'success'
      }) as any);
      
      return { sensorId, alerts: res.data };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add sensor alert');
    }
  }
);

// Resolve sensor alert
export const resolveSensorAlert = createAsyncThunk(
  'sensor/resolveSensorAlert',
  async ({ sensorId, alertId }: { sensorId: string; alertId: string }, { dispatch, rejectWithValue }) => {
    try {
  const res = await axios.put(`${API_BASE_URL}/api/sensors/${sensorId}/alert/${alertId}`);
      
      dispatch(setAlert({
        message: 'Sensor alert resolved successfully',
        type: 'success'
      }) as any);
      
      return { sensorId, alerts: res.data };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to resolve sensor alert');
    }
  }
);

// Get nearby sensors
export const getNearbySensors = createAsyncThunk(
  'sensor/getNearbySensors',
  async ({ lng, lat, distance }: { lng: number; lat: number; distance: number }, { rejectWithValue }) => {
    try {
  const res = await axios.get(`${API_BASE_URL}/api/sensors/nearby/${distance}?lng=${lng}&lat=${lat}`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch nearby sensors');
    }
  }
);

// Initial state
const initialState: SensorState = {
  sensors: [],
  sensor: null,
  loading: false,
  error: null
};

// Slice
const sensorSlice = createSlice({
  name: 'sensor',
  initialState,
  reducers: {
    clearSensor: (state) => {
      state.sensor = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all sensors
      .addCase(getSensors.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSensors.fulfilled, (state, action) => {
        state.sensors = action.payload;
        state.loading = false;
      })
      .addCase(getSensors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get sensor by ID
      .addCase(getSensorById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSensorById.fulfilled, (state, action) => {
        state.sensor = action.payload;
        state.loading = false;
      })
      .addCase(getSensorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create sensor
      .addCase(createSensor.pending, (state) => {
        state.loading = true;
      })
      .addCase(createSensor.fulfilled, (state, action) => {
        state.sensors.push(action.payload);
        state.sensor = action.payload;
        state.loading = false;
      })
      .addCase(createSensor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update sensor
      .addCase(updateSensor.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSensor.fulfilled, (state, action) => {
        state.sensors = state.sensors.map(sensor =>
          sensor._id === action.payload._id ? action.payload : sensor
        );
        state.sensor = action.payload;
        state.loading = false;
      })
      .addCase(updateSensor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete sensor
      .addCase(deleteSensor.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteSensor.fulfilled, (state, action) => {
        state.sensors = state.sensors.filter(sensor => sensor._id !== action.payload);
        state.sensor = null;
        state.loading = false;
      })
      .addCase(deleteSensor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Add sensor reading
      .addCase(addSensorReading.fulfilled, (state, action) => {
        if (state.sensor && state.sensor._id === action.payload.sensorId) {
          state.sensor.readings = action.payload.readings;
        }
      })
      .addCase(addSensorReading.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Add sensor alert
      .addCase(addSensorAlert.fulfilled, (state, action) => {
        if (state.sensor && state.sensor._id === action.payload.sensorId) {
          state.sensor.alerts = action.payload.alerts;
        }
      })
      .addCase(addSensorAlert.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Resolve sensor alert
      .addCase(resolveSensorAlert.fulfilled, (state, action) => {
        if (state.sensor && state.sensor._id === action.payload.sensorId) {
          state.sensor.alerts = action.payload.alerts;
        }
      })
      .addCase(resolveSensorAlert.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Get nearby sensors
      .addCase(getNearbySensors.pending, (state) => {
        state.loading = true;
      })
      .addCase(getNearbySensors.fulfilled, (state, action) => {
        state.sensors = action.payload;
        state.loading = false;
      })
      .addCase(getNearbySensors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearSensor, clearError } = sensorSlice.actions;

export default sensorSlice.reducer;