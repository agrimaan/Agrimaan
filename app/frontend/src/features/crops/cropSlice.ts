import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setAlert } from '../alert/alertSlice';

// Types
interface ExpectedYield {
  value: number;
  unit: 'kg/ha' | 'ton/ha' | 'lb/acre' | 'bushel/acre';
}

interface ActualYield {
  value: number;
  unit: 'kg/ha' | 'ton/ha' | 'lb/acre' | 'bushel/acre';
}

interface PestIssue {
  _id?: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  detectedDate: Date;
  treatedDate?: Date;
  treatment?: string;
}

interface DiseaseIssue {
  _id?: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  detectedDate: Date;
  treatedDate?: Date;
  treatment?: string;
}

interface Fertilizer {
  _id?: string;
  name: string;
  applicationDate: Date;
  amount: {
    value: number;
    unit: 'kg/ha' | 'lb/acre';
  };
  nutrientContent?: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
}

interface IrrigationEvent {
  _id?: string;
  date: Date;
  amount: {
    value: number;
    unit: 'mm' | 'inches';
  };
  method: 'drip' | 'sprinkler' | 'flood' | 'center pivot' | 'manual';
  duration?: number;
}

interface Image {
  _id?: string;
  url: string;
  date: Date;
  description?: string;
}

export interface Crop {
  _id: string;
  name: string;
  field: string;
  variety?: string;
  plantingDate: Date;
  harvestDate?: Date;
  status: 'planned' | 'planted' | 'growing' | 'harvested' | 'failed';
  growthStage: 'germination' | 'vegetative' | 'flowering' | 'ripening' | 'mature';
  expectedYield?: ExpectedYield;
  actualYield?: ActualYield;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  pestIssues: PestIssue[];
  diseaseIssues: DiseaseIssue[];
  fertilizers: Fertilizer[];
  irrigationEvents: IrrigationEvent[];
  notes?: string;
  images: Image[];
  createdAt: Date;
  updatedAt: Date;
}

interface CropState {
  crops: Crop[];
  crop: Crop | null;
  loading: boolean;
  error: string | null;
}

// Get all crops
export const getCrops = createAsyncThunk(
  'crop/getCrops',
  //this was wrong statement, it async (fieldId?: string, { rejectWithValue }) => {
  async (fieldId: string | undefined, { rejectWithValue }) => {

    try {
      const url = fieldId ? `/api/crops?fieldId=${fieldId}` : '/api/crops';
      const res = await axios.get(url);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch crops');
    }
  }
);

// Get crop by ID
export const getCropById = createAsyncThunk(
  'crop/getCropById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/crops/${id}`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch crop');
    }
  }
);

// Create crop
export const createCrop = createAsyncThunk(
  'crop/createCrop',
  async (formData: Partial<Crop>, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.post('/api/crops', formData);
      
      dispatch(setAlert({
        message: 'Crop created successfully',
        type: 'success'
      }) as any);
      
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create crop');
    }
  }
);

// Update crop
export const updateCrop = createAsyncThunk(
  'crop/updateCrop',
  async ({ id, formData }: { id: string; formData: Partial<Crop> }, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/crops/${id}`, formData);
      
      dispatch(setAlert({
        message: 'Crop updated successfully',
        type: 'success'
      }) as any);
      
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update crop');
    }
  }
);

// Delete crop
export const deleteCrop = createAsyncThunk(
  'crop/deleteCrop',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      await axios.delete(`/api/crops/${id}`);
      
      dispatch(setAlert({
        message: 'Crop deleted successfully',
        type: 'success'
      }) as any);
      
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete crop');
    }
  }
);

// Add pest issue
export const addPestIssue = createAsyncThunk(
  'crop/addPestIssue',
  async ({ cropId, pestIssue }: { cropId: string; pestIssue: Partial<PestIssue> }, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.post(`/api/crops/${cropId}/pest-issue`, pestIssue);
      
      dispatch(setAlert({
        message: 'Pest issue added successfully',
        type: 'success'
      }) as any);
      
      return { cropId, pestIssues: res.data };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add pest issue');
    }
  }
);

// Add disease issue
export const addDiseaseIssue = createAsyncThunk(
  'crop/addDiseaseIssue',
  async ({ cropId, diseaseIssue }: { cropId: string; diseaseIssue: Partial<DiseaseIssue> }, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.post(`/api/crops/${cropId}/disease-issue`, diseaseIssue);
      
      dispatch(setAlert({
        message: 'Disease issue added successfully',
        type: 'success'
      }) as any);
      
      return { cropId, diseaseIssues: res.data };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add disease issue');
    }
  }
);

// Add fertilizer application
export const addFertilizer = createAsyncThunk(
  'crop/addFertilizer',
  async ({ cropId, fertilizer }: { cropId: string; fertilizer: Partial<Fertilizer> }, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.post(`/api/crops/${cropId}/fertilizer`, fertilizer);
      
      dispatch(setAlert({
        message: 'Fertilizer application added successfully',
        type: 'success'
      }) as any);
      
      return { cropId, fertilizers: res.data };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add fertilizer application');
    }
  }
);

// Add irrigation event
export const addIrrigationEvent = createAsyncThunk(
  'crop/addIrrigationEvent',
  async ({ cropId, irrigation }: { cropId: string; irrigation: Partial<IrrigationEvent> }, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.post(`/api/crops/${cropId}/irrigation`, irrigation);
      
      dispatch(setAlert({
        message: 'Irrigation event added successfully',
        type: 'success'
      }) as any);
      
      return { cropId, irrigationEvents: res.data };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add irrigation event');
    }
  }
);

// Initial state
const initialState: CropState = {
  crops: [],
  crop: null,
  loading: false,
  error: null
};

// Slice
const cropSlice = createSlice({
  name: 'crop',
  initialState,
  reducers: {
    clearCrop: (state) => {
      state.crop = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all crops
      .addCase(getCrops.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCrops.fulfilled, (state, action) => {
        state.crops = action.payload;
        state.loading = false;
      })
      .addCase(getCrops.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get crop by ID
      .addCase(getCropById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCropById.fulfilled, (state, action) => {
        state.crop = action.payload;
        state.loading = false;
      })
      .addCase(getCropById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create crop
      .addCase(createCrop.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCrop.fulfilled, (state, action) => {
        state.crops.push(action.payload);
        state.crop = action.payload;
        state.loading = false;
      })
      .addCase(createCrop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update crop
      .addCase(updateCrop.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCrop.fulfilled, (state, action) => {
        state.crops = state.crops.map(crop =>
          crop._id === action.payload._id ? action.payload : crop
        );
        state.crop = action.payload;
        state.loading = false;
      })
      .addCase(updateCrop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete crop
      .addCase(deleteCrop.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCrop.fulfilled, (state, action) => {
        state.crops = state.crops.filter(crop => crop._id !== action.payload);
        state.crop = null;
        state.loading = false;
      })
      .addCase(deleteCrop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Add pest issue
      .addCase(addPestIssue.fulfilled, (state, action) => {
        if (state.crop && state.crop._id === action.payload.cropId) {
          state.crop.pestIssues = action.payload.pestIssues;
        }
      })
      .addCase(addPestIssue.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Add disease issue
      .addCase(addDiseaseIssue.fulfilled, (state, action) => {
        if (state.crop && state.crop._id === action.payload.cropId) {
          state.crop.diseaseIssues = action.payload.diseaseIssues;
        }
      })
      .addCase(addDiseaseIssue.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Add fertilizer
      .addCase(addFertilizer.fulfilled, (state, action) => {
        if (state.crop && state.crop._id === action.payload.cropId) {
          state.crop.fertilizers = action.payload.fertilizers;
        }
      })
      .addCase(addFertilizer.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Add irrigation event
      .addCase(addIrrigationEvent.fulfilled, (state, action) => {
        if (state.crop && state.crop._id === action.payload.cropId) {
          state.crop.irrigationEvents = action.payload.irrigationEvents;
        }
      })
      .addCase(addIrrigationEvent.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  }
});

export const { clearCrop, clearError } = cropSlice.actions;

export default cropSlice.reducer;