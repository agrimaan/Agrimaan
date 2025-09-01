import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../lib/api";
import {
  getWeatherAdviceByField,
  getWeatherAdviceByBundle,
  type WeatherAdvice,
} from "../../services/ai";

type FieldLite = {
  _id: string;
  name?: string;
  location?: { lat: number; lng: number };
};

type WeatherResponse = {
  location?: { name?: string };
  current?: {
    temp_c?: number;
    wind_kph?: number;
    condition?: { text?: string };
    humidity?: number;
    precip_mm?: number;
  };
  forecast?: any;
  meta?: any;
};

type Suggestion = {
  id: number | string;
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  type?: string;
  countryCode?: string | null;
};

interface WeatherState {
  fields: FieldLite[];
  weather: WeatherResponse | null;
  advice: WeatherAdvice | null;
  fieldName?: string;
  lastPickedLocation: Suggestion | null;
  loadingWeather: boolean;
  loadingAdvice: boolean;
  error: string | null;
}

const initialState: WeatherState = {
  fields: [],
  weather: null,
  advice: null,
  fieldName: undefined,
  lastPickedLocation: null,
  loadingWeather: false,
  loadingAdvice: false,
  error: null,
};

// Fetch fields
export const fetchFields = createAsyncThunk("weather/fetchFields", async (_, { rejectWithValue }) => {
  try {
    const list = await api<FieldLite[]>("/api/fields");
    return Array.isArray(list) ? list.sort((a, b) => (a.name || "").localeCompare(b.name || "")) : [];
  } catch (e: any) {
    return rejectWithValue(e?.message || "Failed to load fields");
  }
});

// Fetch weather by field
export const fetchWeatherByField = createAsyncThunk(
  "weather/fetchWeatherByField",
  async (id: string, { rejectWithValue }) => {
    try {
      const wx = await api<WeatherResponse>(`/api/weather/current/${id}`);
      const advice = await getWeatherAdviceByField(id);
      return { wx, advice, fieldId: id };
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to fetch weather/advice");
    }
  }
);

// Fetch weather by location
export const fetchWeatherByLocation = createAsyncThunk(
  "weather/fetchWeatherByLocation",
  async (s: Suggestion, { rejectWithValue }) => {
    try {
      const wx = await api<WeatherResponse>(
        `/api/weather/by-coords?lat=${encodeURIComponent(s.lat)}&lng=${encodeURIComponent(s.lng)}`
      );
      const bundle = {
        current: {
          ...wx.current,
          temperatureUnit: "°C",
          windUnit: "km/h",
          station: wx.location?.name || s.name,
        },
        forecast: Array.isArray(wx.forecast?.forecastday)
          ? wx.forecast.forecastday
          : Array.isArray(wx.forecast)
          ? wx.forecast
          : [],
        historical: [],
        meta: wx.meta || {},
      };
      const advice = await getWeatherAdviceByBundle(bundle);
      return { wx, advice, location: s };
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to fetch weather/advice");
    }
  }
);

const weatherSlice = createSlice({
  name: "weather",
  initialState,
  reducers: {
    clearWeatherError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fields
      .addCase(fetchFields.fulfilled, (state, action) => {
        state.fields = action.payload;
      })
      .addCase(fetchFields.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Field weather
      .addCase(fetchWeatherByField.pending, (state) => {
        state.loadingWeather = true;
        state.loadingAdvice = true;
        state.error = null;
      })
      .addCase(fetchWeatherByField.fulfilled, (state, action) => {
        state.weather = action.payload.wx;
        state.advice = action.payload.advice;
        state.fieldName =
          state.fields.find((f) => f._id === action.payload.fieldId)?.name || undefined;
        state.lastPickedLocation = null;
        state.loadingWeather = false;
        state.loadingAdvice = false;
      })
      .addCase(fetchWeatherByField.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loadingWeather = false;
        state.loadingAdvice = false;
      })

      // Location weather
      .addCase(fetchWeatherByLocation.pending, (state) => {
        state.loadingWeather = true;
        state.loadingAdvice = true;
        state.error = null;
      })
      .addCase(fetchWeatherByLocation.fulfilled, (state, action) => {
        state.weather = action.payload.wx;
        state.advice = action.payload.advice;
        state.fieldName = action.payload.location.name || action.payload.location.displayName;
        state.lastPickedLocation = action.payload.location;
        state.loadingWeather = false;
        state.loadingAdvice = false;
      })
      .addCase(fetchWeatherByLocation.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loadingWeather = false;
        state.loadingAdvice = false;
      });
  },
});

export const { clearWeatherError } = weatherSlice.actions;
export default weatherSlice.reducer;
