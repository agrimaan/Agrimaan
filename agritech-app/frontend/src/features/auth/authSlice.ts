import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setAlert } from '../alert/alertSlice';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  fields?: string[];
  profileImage?: string;
}

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
}

// Set auth token in headers
const setAuthToken = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
    localStorage.setItem('token', token);
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
    localStorage.removeItem('token');
  }
};

// Load user
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      setAuthToken(token);
    }
    
    try {
      const res = await axios.get('/api/auth/me');
      return res.data;
    } catch (err: any) {
      setAuthToken(null);
      return rejectWithValue(err.response?.data?.message || 'Failed to load user');
    }
  }
);

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (formData: RegisterData, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.post('/api/auth/register', formData);
      
      dispatch(setAlert({
        message: 'Registration successful! Welcome to AgriTech.',
        type: 'success'
      }) as any);
      
      return res.data;
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      
      if (errors) {
        errors.forEach((error: any) => {
          dispatch(setAlert({
            message: error.msg,
            type: 'error'
          }) as any);
        });
      }
      
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (formData: LoginCredentials, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/auth/login', formData);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Invalid credentials');
    }
  }
);

// Update profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (formData: Partial<User>, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const userId = state.auth.user?.id;
      
      const res = await axios.put(`/api/users/${userId}`, formData);
      
      dispatch(setAlert({
        message: 'Profile updated successfully',
        type: 'success'
      }) as any);
      
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update profile');
    }
  }
);

// Change password
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (
    { currentPassword, newPassword }: { currentPassword: string; newPassword: string },
    { getState, dispatch, rejectWithValue }
  ) => {
    try {
      const state = getState() as { auth: AuthState };
      const userId = state.auth.user?.id;
      
      await axios.put(`/api/users/${userId}/change-password`, {
        currentPassword,
        newPassword
      });
      
      dispatch(setAlert({
        message: 'Password changed successfully',
        type: 'success'
      }) as any);
      
      return true;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to change password');
    }
  }
);

// Initial state
const initialState: AuthState = {
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  user: null,
  error: null
};

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      setAuthToken(null);
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.user = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Load user
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.user = null;
        state.error = action.payload as string;
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.loading = false;
        setAuthToken(action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Change password
      .addCase(changePassword.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  }
});

export const { logout, clearError } = authSlice.actions;

export default authSlice.reducer;