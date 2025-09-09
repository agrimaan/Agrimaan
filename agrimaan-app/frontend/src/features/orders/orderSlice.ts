import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';
import { setAlert } from '../alert/alertSlice';

// Types
interface OrderItem {
  crop: {
    _id: string;
    name: string;
    variety: string;
  };
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface Order {
  _id: string;
  buyer: {
    _id: string;
    name: string;
    email: string;
  };
  seller: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'credit_card' | 'bank_transfer' | 'cash_on_delivery' | 'digital_wallet';
  shippingAddress: ShippingAddress;
  trackingNumber?: string;
  estimatedDeliveryDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderState {
  orders: Order[];
  order: Order | null;
  loading: boolean;
  error: string | null;
}

// Get all orders
export const getOrders = createAsyncThunk(
  'order/getOrders',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/orders`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

// Get order by ID
export const getOrderById = createAsyncThunk(
  'order/getOrderById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/orders/${id}`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch order');
    }
  }
);

// Create order
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (formData: {
    seller: string;
    items: { crop: string; quantity: number; pricePerUnit: number }[];
    paymentMethod: string;
    shippingAddress: ShippingAddress;
    notes?: string;
  }, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/orders`, formData);
      
      dispatch(setAlert({
        message: 'Order created successfully',
        type: 'success'
      }) as any);
      
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create order');
    }
  }
);

// Update order status
export const updateOrderStatus = createAsyncThunk(
  'order/updateOrderStatus',
  async ({ id, status, trackingNumber, estimatedDeliveryDate }: {
    id: string;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    trackingNumber?: string;
    estimatedDeliveryDate?: Date;
  }, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/api/orders/${id}`, {
        status,
        trackingNumber,
        estimatedDeliveryDate
      });
      
      dispatch(setAlert({
        message: 'Order status updated successfully',
        type: 'success'
      }) as any);
      
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update order status');
    }
  }
);

// Update payment status
export const updatePaymentStatus = createAsyncThunk(
  'order/updatePaymentStatus',
  async ({ id, paymentStatus }: {
    id: string;
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  }, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/api/orders/${id}/payment`, {
        paymentStatus
      });
      
      dispatch(setAlert({
        message: 'Payment status updated successfully',
        type: 'success'
      }) as any);
      
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update payment status');
    }
  }
);

// Initial state
const initialState: OrderState = {
  orders: [],
  order: null,
  loading: false,
  error: null
};

// Slice
const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrder: (state) => {
      state.order = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all orders
      .addCase(getOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
        state.loading = false;
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get order by ID
      .addCase(getOrderById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.order = action.payload;
        state.loading = false;
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orders.push(action.payload);
        state.order = action.payload;
        state.loading = false;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.orders = state.orders.map(order =>
          order._id === action.payload._id ? action.payload : order
        );
        state.order = action.payload;
        state.loading = false;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update payment status
      .addCase(updatePaymentStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        state.orders = state.orders.map(order =>
          order._id === action.payload._id ? action.payload : order
        );
        state.order = action.payload;
        state.loading = false;
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearOrder, clearError } = orderSlice.actions;

export default orderSlice.reducer;