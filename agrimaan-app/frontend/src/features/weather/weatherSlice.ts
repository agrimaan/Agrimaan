import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../lib/api";
import {
  getWeatherAdviceByFields,
  getWeatherAdviceByBundle,
  type WeatherAdvice,
} from "../../services/ai";

export type Suggestion = {
  id: number | string;
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  type?: string;
  countryCode?: string | null;
};

type FieldsLite = {
  _id: string;
  name?: string;
  location?: { lat: number; lng: number };
};

export type WeatherResponse = {
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

interface WeatherState {
  fields: FieldsLite[];
  weather: WeatherResponse | null;
  advice: WeatherAdvice | null;
  FieldsName?: string;
  lastPickedLocation: Suggestion | null;
  loadingWeather: boolean;
  loadingAdvice: boolean;
  error: string | null;
}

const initialState: WeatherState = {
  fields: [],
  weather: null,
  advice: null,
  FieldsName: undefined,
  lastPickedLocation: null,
  loadingWeather: false,
  loadingAdvice: false,
  error: null,
};

// -------------------- Thunks --------------------

// Fetch all fields
export const fetchfields = createAsyncThunk(
  "weather/fetchfields",
  async (_, { rejectWithValue }) => {
    try {
      const list = await api<FieldsLite[]>("/api/fields");
      return Array.isArray(list)
        ? list.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
        : [];
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to load fields");
    }
  }
);

// Fetch weather by Fields ID
export const fetchWeatherByFields = createAsyncThunk(
  "weather/fetchWeatherByFields",
  async (id: string, { rejectWithValue }) => {
    try {
      const wx = await api<WeatherResponse>(`/api/weather/current/${id}`);
      const advice = await getWeatherAdviceByFields(id);
      return { wx, advice, FieldsId: id };
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
        `/api/weather/by-coords?lat=${encodeURIComponent(
          s.lat
        )}&lng=${encodeURIComponent(s.lng)}`
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

// -------------------- Slice --------------------
const weatherSlice = createSlice({
  name: "weather",
  initialState,
  reducers: {
    clearWeatherError: (state) => {
      state.error = null;
    },
    clearWeather: (state) => {
      state.weather = null;
      state.advice = null;
      state.FieldsName = undefined;
      state.lastPickedLocation = null;
      state.loadingWeather = false;
      state.loadingAdvice = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fields
      .addCase(fetchfields.fulfilled, (state, action) => {
        state.fields = action.payload;
      })
      .addCase(fetchfields.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Fields weather
      .addCase(fetchWeatherByFields.pending, (state) => {
        state.loadingWeather = true;
        state.loadingAdvice = true;
        state.error = null;
      })
      .addCase(fetchWeatherByFields.fulfilled, (state, action) => {
        state.weather = { ...action.payload.wx }; // ✅ clone
        state.advice = action.payload.advice;
        state.FieldsName =
          state.fields.find((f) => f._id === action.payload.FieldsId)?.name ||
          undefined;
        state.lastPickedLocation = null;
        state.loadingWeather = false;
        state.loadingAdvice = false;
      })
      .addCase(fetchWeatherByFields.rejected, (state, action) => {
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
        state.weather = { ...action.payload.wx }; // ✅ clone
        state.advice = action.payload.advice;
        state.FieldsName =
          action.payload.location.name ||
          action.payload.location.displayName;
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

export const { clearWeatherError, clearWeather } = weatherSlice.actions;
export default weatherSlice.reducer;
