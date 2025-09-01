// src/pages/Weather.tsx
import React from "react";
import {
  getWeatherAdviceByField,
  getWeatherAdviceByBundle,
  type WeatherAdvice,
} from "../services/ai";
import WeatherAdvicePanel from "../components/WeatherAdvicePanel";
import LocationSearch from "../components/LocationSearch";
import { api } from "../lib/api";

import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CircularProgress,
  Divider,
} from "@mui/material";

import ThermostatIcon from "@mui/icons-material/Thermostat";
import AirIcon from "@mui/icons-material/Air";
import OpacityIcon from "@mui/icons-material/Opacity";
import GrainIcon from "@mui/icons-material/Grain";
import WbSunnyIcon from "@mui/icons-material/WbSunny";

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

// -------- helpers for forecast display ----------
function pickForecastArray(wx: WeatherResponse | null): Array<any> {
  if (!wx) return [];
  const f = (wx as any)?.forecast;
  if (!f) return [];
  if (Array.isArray(f?.forecastday)) return f.forecastday;
  if (Array.isArray(f)) return f;
  return [];
}
function getDateLabel(item: any, index: number): string {
  const date =
    item?.date
      ? new Date(item.date)
      : item?.dt
      ? new Date(item.dt * 1000)
      : new Date(Date.now() + index * 24 * 60 * 60 * 1000);

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
function readMaxC(item: any): number | undefined {
  return item?.day?.maxtemp_c ?? item?.max_c;
}
function readMinC(item: any): number | undefined {
  return item?.day?.mintemp_c ?? item?.min_c;
}
function readRainMM(item: any): number | undefined {
  return item?.day?.totalprecip_mm ?? item?.rain_mm;
}
function readWindKPH(item: any): number | undefined {
  return item?.day?.maxwind_kph ?? item?.wind_kph;
}
function readCondition(item: any): string | undefined {
  return item?.day?.condition?.text ?? item?.condition;
}
// ------------------------------------------------

export default function WeatherPage() {
  const [fields, setFields] = React.useState<FieldLite[]>([]);
  const [fieldId, setFieldId] = React.useState<string>("");
  const [locationQuery, setLocationQuery] = React.useState<string>("");
  const [lastPickedLocation, setLastPickedLocation] = React.useState<Suggestion | null>(null);

  const [fieldName, setFieldName] = React.useState<string | undefined>(undefined);
  const [weather, setWeather] = React.useState<WeatherResponse | null>(null);
  const [advice, setAdvice] = React.useState<WeatherAdvice | null>(null);
  const [loadingWeather, setLoadingWeather] = React.useState(false);
  const [loadingAdvice, setLoadingAdvice] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const list = await api<FieldLite[]>("/api/fields");
        const sorted = [...(Array.isArray(list) ? list : [])].sort((a, b) =>
          (a.name || "").localeCompare(b.name || "")
        );
        setFields(sorted);
      } catch (e: any) {
        setError(e?.message || "Failed to load fields");
      }
    })();
  }, []);

  const fetchByField = React.useCallback(
    async (id: string) => {
      try {
        setError(null);
        setLoadingWeather(true);
        setLoadingAdvice(true);

        const wx = await api<WeatherResponse>(`/api/weather/current/${id}`);
        setWeather(wx);

        const res = await getWeatherAdviceByField(id);
        setAdvice(res);

        const f = fields.find((x) => x._id === id);
        setFieldName(f?.name || undefined);
      } catch (e: any) {
        setError(e?.message || "Failed to fetch weather/advice");
      } finally {
        setLoadingWeather(false);
        setLoadingAdvice(false);
      }
    },
    [fields]
  );

  const onPickLocation = React.useCallback(async (s: Suggestion) => {
    setLastPickedLocation(s);
    try {
      setError(null);
      setLoadingWeather(true);
      setLoadingAdvice(true);

      const wx = await api<WeatherResponse>(
        `/api/weather/by-coords?lat=${encodeURIComponent(s.lat)}&lng=${encodeURIComponent(s.lng)}`
      );
      setWeather(wx);

      setFieldId("");
      setFieldName(s.name || s.displayName);

      const bundle = {
        current: {
          ...wx.current,
          temperatureUnit: "°C",
          windUnit: "km/h",
          station: wx.location?.name || s.name,
        },
        forecast: pickForecastArray(wx),
        historical: [],
        meta: wx.meta || {},
      };
      const res = await getWeatherAdviceByBundle(bundle);
      setAdvice(res);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch weather/advice");
    } finally {
      setLoadingWeather(false);
      setLoadingAdvice(false);
    }
  }, []);

  const forecastArray = React.useMemo(
    () => pickForecastArray(weather).slice(0, 3),
    [weather]
  );

  return (
    <Box display="grid" gridTemplateColumns={{ md: "2fr 1fr" }} gap={3}>
      {/* Left */}
      <Box>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Weather Dashboard
        </Typography>

        {/* Field selector */}
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="field-select-label">Field</InputLabel>
            <Select
              labelId="field-select-label"
              id="field-select"
              value={fieldId}
              label="Field"   // ✅ important: ensures proper floating label
              onChange={(e) => {
                const id = e.target.value;
                setFieldId(id);
                if (id) fetchByField(id);
              }}
            >
              <MenuItem value="">
                <em>Select a field</em>
              </MenuItem>
              {fields.map((f) => (
                <MenuItem key={f._id} value={f._id}>
                  {f.name || f._id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Location search */}
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <LocationSearch
            value={locationQuery}
            onChange={setLocationQuery}
            onPick={onPickLocation}
            placeholder="Type a location (e.g., Melbourne, VIC)"
          />
          <Typography variant="caption" color="text.secondary">
            or pick a field above
          </Typography>
        </Box>

        {/* Current weather */}
        {loadingWeather && <CircularProgress size={24} />}
        {weather && !loadingWeather && (
          <Card variant="outlined" sx={{ mb: 2, p: 1 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Current Weather {fieldName ? `(${fieldName})` : ""}
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <ThermostatIcon color="primary" fontSize="small" />
                  <Typography variant="body2">
                    Temp: <strong>{weather.current?.temp_c ?? "—"} °C</strong>
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <AirIcon color="info" fontSize="small" />
                  <Typography variant="body2">
                    Wind: <strong>{weather.current?.wind_kph ?? "—"} km/h</strong>
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <OpacityIcon color="secondary" fontSize="small" />
                  <Typography variant="body2">
                    Humidity: <strong>{weather.current?.humidity ?? "—"}%</strong>
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <GrainIcon color="success" fontSize="small" />
                  <Typography variant="body2">
                    Precip: <strong>{weather.current?.precip_mm ?? "—"} mm</strong>
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1} gridColumn="span 2">
                  <WbSunnyIcon color="warning" fontSize="small" />
                  <Typography variant="body2">
                    Condition: <strong>{weather.current?.condition?.text || "—"}</strong>
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Forecast */}
        {forecastArray.length > 0 && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Next 3 Days
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <table style={{ width: "100%", fontSize: "0.875rem" }}>
                <thead>
                  <tr>
                    <th align="left">Day</th>
                    <th align="left">Max / Min (°C)</th>
                    <th align="left">Rain (mm)</th>
                    <th align="left">Wind (km/h)</th>
                    <th align="left">Condition</th>
                  </tr>
                </thead>
                <tbody>
                  {forecastArray.map((item, i) => (
                    <tr key={i}>
                      <td>{getDateLabel(item, i)}</td>
                      <td>
                        {readMaxC(item) ?? "—"} / {readMinC(item) ?? "—"}
                      </td>
                      <td>{readRainMM(item) ?? "—"}</td>
                      <td>{readWindKPH(item) ?? "—"}</td>
                      <td>{readCondition(item) ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Typography variant="caption" color="text.secondary">
                * Values shown in °C, km/h, and mm.
              </Typography>
            </CardContent>
          </Card>
        )}

        {error && (
          <Typography color="error" variant="body2" mt={2}>
            {error}
          </Typography>
        )}
      </Box>

      {/* Right */}
      <WeatherAdvicePanel
        advice={advice}
        loading={loadingAdvice}
        error={error}
        onRefresh={() => {
          if (fieldId) {
            fetchByField(fieldId);
          } else if (lastPickedLocation) {
            onPickLocation(lastPickedLocation);
          }
        }}
        fieldName={fieldName}
      />
    </Box>
  );
}
