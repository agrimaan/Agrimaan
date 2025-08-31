import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';
import { setAlert } from '../alert/alertSlice';

// Types
interface Location {
  type: string;
  coordinates: number[];
}

interface Boundaries {
  type: string;
  coordinates: number[][][];
}

interface Area {
  value: number;
  unit: 'hectare' | 'acre';
}

interface Weather {
  station: string;
  lastUpdated: Date;
}

interface IrrigationSystem {
  type: 'drip' | 'sprinkler' | 'flood' | 'center pivot' | 'none';
  isAutomated: boolean;
}

export interface Field {
  _id: string;
  name: string;
  owner: string;
  location: Location;
  boundaries: Boundaries;
  area: Area;
  soilType: 'clay' | 'sandy' | 'loamy' | 'silty' | 'peaty' | 'chalky' | 'other';
  crops: string[];
  sensors: string[];
  weather?: Weather;
  irrigationSystem?: IrrigationSystem;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FieldState {
  fields: Field[];
  field: Field | null;
  loading: boolean;
  error: string | null;
}

// Get all fields
export const getFields = createAsyncThunk(
  'field/getFields',
  async (_, { rejectWithValue }) => {
    try {
  const res = await axios.get(`${API_BASE_URL}/api/fields`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch fields');
    }
  }
);

// Get field by ID
export const getFieldById = createAsyncThunk(
  'field/getFieldById',
  async (id: string, { rejectWithValue }) => {
    try {
  const res = await axios.get(`${API_BASE_URL}/api/fields/${id}`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch field');
    }
  }
);

// Create field
export const createField = createAsyncThunk(
  'field/createField',
  async (formData: Partial<Field>, { dispatch, rejectWithValue }) => {
    try {
  const res = await axios.post(`${API_BASE_URL}/api/fields`, formData);
      
      dispatch(setAlert({
        message: 'Field created successfully',
        type: 'success'
      }) as any);
      
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create field');
    }
  }
);

// Update field
export const updateField = createAsyncThunk(
  'field/updateField',
  async ({ id, formData }: { id: string; formData: Partial<Field> }, { dispatch, rejectWithValue }) => {
    try {
  const res = await axios.put(`${API_BASE_URL}/api/fields/${id}`, formData);
      
      dispatch(setAlert({
        message: 'Field updated successfully',
        type: 'success'
      }) as any);
      
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update field');
    }
  }
);

// Delete field
export const deleteField = createAsyncThunk(
  'field/deleteField',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
  await axios.delete(`${API_BASE_URL}/api/fields/${id}`);
      
      dispatch(setAlert({
        message: 'Field deleted successfully',
        type: 'success'
      }) as any);
      
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete field');
    }
  }
);

// Get nearby fields
export const getNearbyFields = createAsyncThunk(
  'field/getNearbyFields',
  async ({ lng, lat, distance }: { lng: number; lat: number; distance: number }, { rejectWithValue }) => {
    try {
  const res = await axios.get(`${API_BASE_URL}/api/fields/nearby/${distance}?lng=${lng}&lat=${lat}`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch nearby fields');
    }
  }
);

// Initial state
const initialState: FieldState = {
  fields: [],
  field: null,
  loading: false,
  error: null
};

// Slice
const fieldSlice = createSlice({
  name: 'field',
  initialState,
  reducers: {
    clearField: (state) => {
      state.field = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all fields
      .addCase(getFields.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFields.fulfilled, (state, action) => {
        state.fields = action.payload;
        state.loading = false;
      })
      .addCase(getFields.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get field by ID
      .addCase(getFieldById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFieldById.fulfilled, (state, action) => {
        state.field = action.payload;
        state.loading = false;
      })
      .addCase(getFieldById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create field
      .addCase(createField.pending, (state) => {
        state.loading = true;
      })
      .addCase(createField.fulfilled, (state, action) => {
        state.fields.push(action.payload);
        state.field = action.payload;
        state.loading = false;
      })
      .addCase(createField.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update field
      .addCase(updateField.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateField.fulfilled, (state, action) => {
        state.fields = state.fields.map(field =>
          field._id === action.payload._id ? action.payload : field
        );
        state.field = action.payload;
        state.loading = false;
      })
      .addCase(updateField.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete field
      .addCase(deleteField.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteField.fulfilled, (state, action) => {
        state.fields = state.fields.filter(field => field._id !== action.payload);
        state.field = null;
        state.loading = false;
      })
      .addCase(deleteField.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get nearby fields
      .addCase(getNearbyFields.pending, (state) => {
        state.loading = true;
      })
      .addCase(getNearbyFields.fulfilled, (state, action) => {
        state.fields = action.payload;
        state.loading = false;
      })
      .addCase(getNearbyFields.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearField, clearError } = fieldSlice.actions;

export default fieldSlice.reducer;