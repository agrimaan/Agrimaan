import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Types
interface Temperature {
  current: number;
  min: number;
  max: number;
  unit: 'celsius' | 'fahrenheit';
}

interface Precipitation {
  amount: number;
  type: 'rain' | 'snow' | 'sleet' | 'hail' | 'none';
  unit: 'mm' | 'inches';
  probability: number;
}

interface Wind {
  speed: number;
  direction: number;
  unit: 'km/h' | 'mph' | 'm/s';
}

interface Pressure {
  value: number;
  unit: 'hPa' | 'inHg';
}

interface Visibility {
  value: number;
  unit: 'km' | 'miles';
}

interface Forecast {
  date: Date;
  temperature: {
    min: number;
    max: number;
  };
  precipitation: {
    amount: number;
    probability: number;
  };
  description: string;
}

export interface Weather {
  _id: string;
  location: {
    type: string;
    coordinates: number[];
  };
  field?: string;
  date: Date;
  temperature: Temperature;
  humidity: number;
  precipitation: Precipitation;
  wind: Wind;
  pressure: Pressure;
  cloudCover: number;
  uvIndex: number;
  visibility: Visibility;
  sunrise?: Date;
  sunset?: Date;
  source: string;
  forecast: Forecast[];
  createdAt: Date;
  updatedAt: Date;
}

interface WeatherState {
  currentWeather: Weather | null;
  weatherHistory: Weather[];
  forecast: Forecast[];
  loading: boolean;
  error: string | null;
}

// Get current weather for a field
export const getCurrentWeather = createAsyncThunk(
  'weather/getCurrentWeather',
  async (fieldId: string, { rejectWithValue }) => {
    try {
      // Assuming the backend has an endpoint to get the latest weather for a field
      const res = await axios.get(`/api/weather/current/${fieldId}`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch current weather');
    }
  }
);

// Get weather history for a field
export const getWeatherHistory = createAsyncThunk(
  'weather/getWeatherHistory',
  async (
    { fieldId, startDate, endDate }: { fieldId: string; startDate: string; endDate: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.get(
        `/api/weather/history/${fieldId}?startDate=${startDate}&endDate=${endDate}`
      );
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch weather history');
    }
  }
);

// Get weather forecast for a field
export const getWeatherForecast = createAsyncThunk(
  'weather/getWeatherForecast',
  async (fieldId: string, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/weather/forecast/${fieldId}`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch weather forecast');
    }
  }
);

// Initial state
const initialState: WeatherState = {
  currentWeather: null,
  weatherHistory: [],
  forecast: [],
  loading: false,
  error: null
};

// Slice
const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    clearCurrentWeather: (state) => {
      state.currentWeather = null;
    },
    clearWeatherHistory: (state) => {
      state.weatherHistory = [];
    },
    clearForecast: (state) => {
      state.forecast = [];
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get current weather
      .addCase(getCurrentWeather.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentWeather.fulfilled, (state, action) => {
        state.currentWeather = action.payload;
        state.loading = false;
      })
      .addCase(getCurrentWeather.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get weather history
      .addCase(getWeatherHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getWeatherHistory.fulfilled, (state, action) => {
        state.weatherHistory = action.payload;
        state.loading = false;
      })
      .addCase(getWeatherHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get weather forecast
      .addCase(getWeatherForecast.pending, (state) => {
        state.loading = true;
      })
      .addCase(getWeatherForecast.fulfilled, (state, action) => {
        state.forecast = action.payload;
        state.loading = false;
      })
      .addCase(getWeatherForecast.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearCurrentWeather, clearWeatherHistory, clearForecast, clearError } = weatherSlice.actions;

export default weatherSlice.reducer;