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
  forecast?: any; // supports { forecastday: [...] } or a flat array
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
    item?.date ? new Date(item.date) :
    item?.dt ? new Date(item.dt * 1000) :
    new Date(Date.now() + index * 24 * 60 * 60 * 1000);

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
  // data sources
  const [fields, setFields] = React.useState<FieldLite[]>([]);
  // selection
  const [fieldId, setFieldId] = React.useState<string>("");
  const [locationQuery, setLocationQuery] = React.useState<string>("");
  // UI state
  const [fieldName, setFieldName] = React.useState<string | undefined>(undefined);
  const [weather, setWeather] = React.useState<WeatherResponse | null>(null);
  const [advice, setAdvice] = React.useState<WeatherAdvice | null>(null);
  const [loadingWeather, setLoadingWeather] = React.useState(false);
  const [loadingAdvice, setLoadingAdvice] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // load fields on mount
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

  // fetch weather + advice by field
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

  // when user picks a suggestion from auto-suggest
  const onPickLocation = React.useCallback(
    async (s: Suggestion) => {
      try {
        setError(null);
        setLoadingWeather(true);
        setLoadingAdvice(true);

        // Prefer coords endpoint; adjust if your backend differs
        const wx = await api<WeatherResponse>(
          `/api/weather/by-coords?lat=${encodeURIComponent(s.lat)}&lng=${encodeURIComponent(s.lng)}`
        );
        setWeather(wx);

        setFieldId(""); // clear field selection
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
    },
    []
  );

  const forecastArray = React.useMemo(
    () => pickForecastArray(weather).slice(0, 3),
    [weather]
  );

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Left: Weather UI */}
      <div className="md:col-span-2 space-y-4">
        <h2 className="text-xl font-semibold">Weather Dashboard</h2>

        {/* Field selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Field</label>
          <select
            className="border rounded px-2 py-1 min-w-56"
            value={fieldId}
            onChange={(e) => {
              const id = e.target.value;
              setFieldId(id);
              if (id) fetchByField(id);
            }}
          >
            <option value="">Select a field</option>
            {fields.map((f: FieldLite) => (
              <option key={f._id} value={f._id}>
                {f.name || f._id}
              </option>
            ))}
          </select>
        </div>

        {/* Location auto-suggest */}
        <div className="flex items-center gap-2">
          <LocationSearch
            value={locationQuery}
            onChange={setLocationQuery}
            onPick={onPickLocation}
            placeholder="Type a location (e.g., Melbourne, VIC)"
          />
          <span className="text-xs text-gray-500">or pick a field above</span>
        </div>

        {/* Current weather */}
        {loadingWeather && <p>Loading weather…</p>}
        {weather && !loadingWeather && (
          <div className="rounded border p-3 bg-white/70 dark:bg-zinc-900/50">
            <h3 className="font-medium mb-2">
              Current Weather {fieldName ? `(${fieldName})` : ""}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <div>
                Temp:{" "}
                <span className="font-medium">
                  {weather.current?.temp_c ?? "—"} °C
                </span>
              </div>
              <div>
                Wind:{" "}
                <span className="font-medium">
                  {weather.current?.wind_kph ?? "—"} km/h
                </span>
              </div>
              <div>
                Humidity:{" "}
                <span className="font-medium">
                  {weather.current?.humidity ?? "—"}%
                </span>
              </div>
              <div>
                Precip:{" "}
                <span className="font-medium">
                  {weather.current?.precip_mm ?? "—"} mm
                </span>
              </div>
              <div className="col-span-2 md:col-span-3">
                Condition:{" "}
                <span className="font-medium">
                  {weather.current?.condition?.text || "—"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 3-day forecast */}
        {forecastArray.length > 0 && (
          <div className="rounded border p-3 bg-white/70 dark:bg-zinc-900/50">
            <h3 className="font-medium mb-2">Next 3 Days</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Day</th>
                    <th className="py-2 pr-4">Max / Min (°C)</th>
                    <th className="py-2 pr-4">Rain (mm)</th>
                    <th className="py-2 pr-4">Wind (km/h)</th>
                    <th className="py-2 pr-4">Condition</th>
                  </tr>
                </thead>
                <tbody>
                  {forecastArray.map((item: any, i: number) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 pr-4">{getDateLabel(item, i)}</td>
                      <td className="py-2 pr-4">
                        {(readMaxC(item) ?? "—")} / {(readMinC(item) ?? "—")}
                      </td>
                      <td className="py-2 pr-4">{readRainMM(item) ?? "—"}</td>
                      <td className="py-2 pr-4">{readWindKPH(item) ?? "—"}</td>
                      <td className="py-2 pr-4">{readCondition(item) ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * Values shown in °C, km/h, and mm.
            </p>
          </div>
        )}

        {error && <p className="text-red-600">{error}</p>}
      </div>

      {/* Right: AI Advice */}
      <WeatherAdvicePanel
        advice={advice}
        loading={loadingAdvice}
        error={error}
        onRefresh={() =>
          fieldId ? fetchByField(fieldId) : undefined
        }
        fieldName={fieldName}
      />
    </div>
  );
}
