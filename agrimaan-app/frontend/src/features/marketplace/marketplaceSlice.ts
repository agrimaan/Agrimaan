import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';
import { setAlert } from '../alert/alertSlice';

// Types
export interface MarketplaceItem {
  _id: string;
  cropName: string;
  variety: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  seller: {
    _id: string;
    name: string;
    email: string;
  };
  sellerRating: number;
  location: string;
  harvestDate: Date;
  listedDate: Date;
  quality: string;
  description: string;
  image?: string;
  status: 'Available' | 'Sold' | 'Reserved';
  category: 'Grains' | 'Vegetables' | 'Fruits' | 'Herbs';
  userCropId?: string;
}

interface MarketplaceState {
  items: MarketplaceItem[];
  item: MarketplaceItem | null;
  loading: boolean;
  error: string | null;
}

// Get all marketplace items
export const getMarketplaceItems = createAsyncThunk(
  'marketplace/getMarketplaceItems',
  async ({ category, status }: { category?: string; status?: string } = {}, { rejectWithValue }) => {
    try {
      let url = `${API_BASE_URL}/api/marketplace`;
      const params = [];
      
      if (category) params.push(`category=${category}`);
      if (status) params.push(`status=${status}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const res = await axios.get(url);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch marketplace items');
    }
  }
);

// Get marketplace item by ID
export const getMarketplaceItemById = createAsyncThunk(
  'marketplace/getMarketplaceItemById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/marketplace/${id}`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch marketplace item');
    }
  }
);

// Create marketplace item
export const createMarketplaceItem = createAsyncThunk(
  'marketplace/createMarketplaceItem',
  async (formData: Partial<MarketplaceItem>, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/marketplace`, formData);
      
      dispatch(setAlert({
        message: 'Item listed successfully',
        type: 'success'
      }) as any);
      
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create marketplace listing');
    }
  }
);

// Update marketplace item
export const updateMarketplaceItem = createAsyncThunk(
  'marketplace/updateMarketplaceItem',
  async ({ id, formData }: { id: string; formData: Partial<MarketplaceItem> }, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/api/marketplace/${id}`, formData);
      
      dispatch(setAlert({
        message: 'Listing updated successfully',
        type: 'success'
      }) as any);
      
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update marketplace listing');
    }
  }
);

// Delete marketplace item
export const deleteMarketplaceItem = createAsyncThunk(
  'marketplace/deleteMarketplaceItem',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/marketplace/${id}`);
      
      dispatch(setAlert({
        message: 'Listing deleted successfully',
        type: 'success'
      }) as any);
      
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete marketplace listing');
    }
  }
);

// Get my listings
export const getMyListings = createAsyncThunk(
  'marketplace/getMyListings',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/marketplace/my-listings`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch your listings');
    }
  }
);

// Initial state
const initialState: MarketplaceState = {
  items: [],
  item: null,
  loading: false,
  error: null
};

// Slice
const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    clearItem: (state) => {
      state.item = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all marketplace items
      .addCase(getMarketplaceItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMarketplaceItems.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(getMarketplaceItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get marketplace item by ID
      .addCase(getMarketplaceItemById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMarketplaceItemById.fulfilled, (state, action) => {
        state.item = action.payload;
        state.loading = false;
      })
      .addCase(getMarketplaceItemById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create marketplace item
      .addCase(createMarketplaceItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(createMarketplaceItem.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.item = action.payload;
        state.loading = false;
      })
      .addCase(createMarketplaceItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update marketplace item
      .addCase(updateMarketplaceItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateMarketplaceItem.fulfilled, (state, action) => {
        state.items = state.items.map(item =>
          item._id === action.payload._id ? action.payload : item
        );
        state.item = action.payload;
        state.loading = false;
      })
      .addCase(updateMarketplaceItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete marketplace item
      .addCase(deleteMarketplaceItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteMarketplaceItem.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item._id !== action.payload);
        state.item = null;
        state.loading = false;
      })
      .addCase(deleteMarketplaceItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get my listings
      .addCase(getMyListings.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMyListings.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(getMyListings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearItem, clearError } = marketplaceSlice.actions;

export default marketplaceSlice.reducer;