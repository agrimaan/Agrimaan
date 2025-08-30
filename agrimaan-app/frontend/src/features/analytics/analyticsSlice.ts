import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';
import { setAlert } from '../alert/alertSlice';

// Types
interface Factor {
  name: string;
  value: any;
  weight: number;
}

interface Recommendation {
  _id?: string;
  action: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeframe: string;
  details: string;
}

export interface Analytics {
  _id: string;
  field: string;
  crop?: string;
  date: Date;
  type: 'yield_prediction' | 'pest_risk' | 'disease_risk' | 'irrigation_recommendation' | 'fertilizer_recommendation' | 'harvest_timing' | 'planting_recommendation' | 'other';
  data: any;
  confidence?: number;
  factors?: Factor[];
  recommendations?: Recommendation[];
  modelVersion?: string;
  source?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FieldSummary {
  field: {
    id: string;
    name: string;
    area: {
      value: number;
      unit: string;
    };
    soilType: string;
  };
  analytics: Analytics[];
  sensors: {
    count: number;
    types: Record<string, number>;
    status: Record<string, number>;
  };
  crops: {
    count: number;
    status: Record<string, number>;
    healthStatus: Record<string, number>;
  };
  weather: any;
}

interface Prediction {
  _id: string;
  crop: string;
  type: 'yield_prediction';
  data: any;
  date: Date;
  confidence?: number;
}

interface RecommendationItem {
  id: string;
  analyticsId: string;
  field: {
    _id: string;
    name: string;
  };
  crop?: {
    _id: string;
    name: string;
  };
  type: string;
  action: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeframe: string;
  details: string;
  date: Date;
}

interface AnalyticsState {
  analyticsList: Analytics[];
  analytics: Analytics | null;
  fieldSummary: FieldSummary | null;
  predictions: Prediction[];
  recommendations: RecommendationItem[];
  loading: boolean;
  error: string | null;
}

// Get all analytics
export const getAnalytics = createAsyncThunk(
  'analytics/getAnalytics',
  async (
    { fieldId, cropId, type, startDate, endDate }: 
    { fieldId?: string; cropId?: string; type?: string; startDate?: string; endDate?: string } = {},
    { rejectWithValue }
  ) => {
    try {
  let url = `${API_BASE_URL}/api/analytics`;
      const params = [];
      
      if (fieldId) params.push(`fieldId=${fieldId}`);
      if (cropId) params.push(`cropId=${cropId}`);
      if (type) params.push(`type=${type}`);
      if (startDate) params.push(`startDate=${startDate}`);
      if (endDate) params.push(`endDate=${endDate}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const res = await axios.get(url);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);

// Get analytics by ID
export const getAnalyticsById = createAsyncThunk(
  'analytics/getAnalyticsById',
  async (id: string, { rejectWithValue }) => {
    try {
  const res = await axios.get(`${API_BASE_URL}/api/analytics/${id}`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);

// Create analytics
export const createAnalytics = createAsyncThunk(
  'analytics/createAnalytics',
  async (formData: Partial<Analytics>, { dispatch, rejectWithValue }) => {
    try {
  const res = await axios.post(`${API_BASE_URL}/api/analytics`, formData);
      
      dispatch(setAlert({
        message: 'Analytics created successfully',
        type: 'success'
      }) as any);
      
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create analytics');
    }
  }
);

// Update analytics
export const updateAnalytics = createAsyncThunk(
  'analytics/updateAnalytics',
  async ({ id, formData }: { id: string; formData: Partial<Analytics> }, { dispatch, rejectWithValue }) => {
    try {
  const res = await axios.put(`${API_BASE_URL}/api/analytics/${id}`, formData);
      
      dispatch(setAlert({
        message: 'Analytics updated successfully',
        type: 'success'
      }) as any);
      
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update analytics');
    }
  }
);

// Delete analytics
export const deleteAnalytics = createAsyncThunk(
  'analytics/deleteAnalytics',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
  await axios.delete(`${API_BASE_URL}/api/analytics/${id}`);
      
      dispatch(setAlert({
        message: 'Analytics deleted successfully',
        type: 'success'
      }) as any);
      
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete analytics');
    }
  }
);

// Get field summary
export const getFieldSummary = createAsyncThunk(
  'analytics/getFieldSummary',
  async (fieldId: string, { rejectWithValue }) => {
    try {
  const res = await axios.get(`${API_BASE_URL}/api/analytics/field/${fieldId}/summary`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch field summary');
    }
  }
);

// Get crop predictions
export const getCropPredictions = createAsyncThunk(
  'analytics/getCropPredictions',
  async (cropId: string, { rejectWithValue }) => {
    try {
  const res = await axios.get(`${API_BASE_URL}/api/analytics/crop/${cropId}/predictions`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch crop predictions');
    }
  }
);

// Get recommendations
export const getRecommendations = createAsyncThunk(
  'analytics/getRecommendations',
  async (_, { rejectWithValue }) => {
    try {
  const res = await axios.get(`${API_BASE_URL}/api/analytics/recommendations`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch recommendations');
    }
  }
);

// Initial state
const initialState: AnalyticsState = {
  analyticsList: [],
  analytics: null,
  fieldSummary: null,
  predictions: [],
  recommendations: [],
  loading: false,
  error: null
};

// Slice
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearAnalytics: (state) => {
      state.analytics = null;
    },
    clearFieldSummary: (state) => {
      state.fieldSummary = null;
    },
    clearPredictions: (state) => {
      state.predictions = [];
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all analytics
      .addCase(getAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAnalytics.fulfilled, (state, action) => {
        state.analyticsList = action.payload;
        state.loading = false;
      })
      .addCase(getAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get analytics by ID
      .addCase(getAnalyticsById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAnalyticsById.fulfilled, (state, action) => {
        state.analytics = action.payload;
        state.loading = false;
      })
      .addCase(getAnalyticsById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create analytics
      .addCase(createAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(createAnalytics.fulfilled, (state, action) => {
        state.analyticsList.push(action.payload);
        state.analytics = action.payload;
        state.loading = false;
      })
      .addCase(createAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update analytics
      .addCase(updateAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAnalytics.fulfilled, (state, action) => {
        state.analyticsList = state.analyticsList.map(item =>
          item._id === action.payload._id ? action.payload : item
        );
        state.analytics = action.payload;
        state.loading = false;
      })
      .addCase(updateAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete analytics
      .addCase(deleteAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteAnalytics.fulfilled, (state, action) => {
        state.analyticsList = state.analyticsList.filter(item => item._id !== action.payload);
        state.analytics = null;
        state.loading = false;
      })
      .addCase(deleteAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get field summary
      .addCase(getFieldSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFieldSummary.fulfilled, (state, action) => {
        state.fieldSummary = action.payload;
        state.loading = false;
      })
      .addCase(getFieldSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get crop predictions
      .addCase(getCropPredictions.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCropPredictions.fulfilled, (state, action) => {
        state.predictions = action.payload;
        state.loading = false;
      })
      .addCase(getCropPredictions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get recommendations
      .addCase(getRecommendations.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRecommendations.fulfilled, (state, action) => {
        state.recommendations = action.payload;
        state.loading = false;
      })
      .addCase(getRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearAnalytics, clearFieldSummary, clearPredictions, clearError } = analyticsSlice.actions;

export default analyticsSlice.reducer;