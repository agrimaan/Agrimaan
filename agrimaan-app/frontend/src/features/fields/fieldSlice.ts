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

export interface Fields {
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

interface fieldstate {
  fields: Fields[];
  Fields: Fields | null;
  loading: boolean;
  error: string | null;
}

// Get all fields
export const getFields = createAsyncThunk(
  'Fields/getFields',
  async (_, { rejectWithValue }) => {
    try {
  const res = await axios.get(`${API_BASE_URL}/api/fields`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch fields');
    }
  }
);

// Get Fields by ID
export const getFieldsById = createAsyncThunk(
  'Fields/getFieldsById',
  async (id: string, { rejectWithValue }) => {
    try {
  const res = await axios.get(`${API_BASE_URL}/api/fields/${id}`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch Fields');
    }
  }
);

// Create Fields
export const createFields = createAsyncThunk(
  'Fields/createFields',
  async (formData: Partial<Fields>, { dispatch, rejectWithValue }) => {
    try {
  const res = await axios.post(`${API_BASE_URL}/api/fields`, formData);
      
      dispatch(setAlert({
        message: 'Fields created successfully',
        type: 'success'
      }) as any);
      
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create Fields');
    }
  }
);

// Update Fields
export const updateFields = createAsyncThunk(
  'Fields/updateFields',
  async ({ id, formData }: { id: string; formData: Partial<Fields> }, { dispatch, rejectWithValue }) => {
    try {
  const res = await axios.put(`${API_BASE_URL}/api/fields/${id}`, formData);
      
      dispatch(setAlert({
        message: 'Fields updated successfully',
        type: 'success'
      }) as any);
      
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update Fields');
    }
  }
);

// Delete Fields
export const deleteFields = createAsyncThunk(
  'Fields/deleteFields',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
  await axios.delete(`${API_BASE_URL}/api/fields/${id}`);
      
      dispatch(setAlert({
        message: 'Fields deleted successfully',
        type: 'success'
      }) as any);
      
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete Fields');
    }
  }
);

// Get nearby fields
export const getNearbyfields = createAsyncThunk(
  'Fields/getNearbyfields',
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
const initialState: fieldstate = {
  fields: [],
  Fields: null,
  loading: false,
  error: null
};

// Slice
const fieldslice = createSlice({
  name: 'Fields',
  initialState,
  reducers: {
    clearFields: (state) => {
      state.Fields = null;
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
      
      // Get Fields by ID
      .addCase(getFieldsById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFieldsById.fulfilled, (state, action) => {
        state.Fields = action.payload;
        state.loading = false;
      })
      .addCase(getFieldsById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create Fields
      .addCase(createFields.pending, (state) => {
        state.loading = true;
      })
      .addCase(createFields.fulfilled, (state, action) => {
        state.fields.push(action.payload);
        state.Fields = action.payload;
        state.loading = false;
      })
      .addCase(createFields.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update Fields
      .addCase(updateFields.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateFields.fulfilled, (state, action) => {
        state.fields = state.fields.map(Fields =>
          Fields._id === action.payload._id ? action.payload : Fields
        );
        state.Fields = action.payload;
        state.loading = false;
      })
      .addCase(updateFields.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete Fields
      .addCase(deleteFields.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteFields.fulfilled, (state, action) => {
        state.fields = state.fields.filter(Fields => Fields._id !== action.payload);
        state.Fields = null;
        state.loading = false;
      })
      .addCase(deleteFields.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get nearby fields
      .addCase(getNearbyfields.pending, (state) => {
        state.loading = true;
      })
      .addCase(getNearbyfields.fulfilled, (state, action) => {
        state.fields = action.payload;
        state.loading = false;
      })
      .addCase(getNearbyfields.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearFields, clearError } = fieldslice.actions;

export default fieldslice.reducer;