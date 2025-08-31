// backend/services/weather.service.js
const axios = require("axios");
const Weather = require("../models/Weather");

// Use env, never hardcode secrets
const WEATHER_API_BASE_URL = process.env.WEATHER_API_BASE_URL || "https://api.weatherapi.com/v1";
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

/**
 * Weather service to handle external API integration and data processing
 */
class WeatherService {
  /**
   * Fetch current+forecast (7d) weather data for a location (lat, lng)
   * Returns a normalized shape your UI/backend can use.
   */
  async getCurrentWeather(lat, lng) {
    const key = process.env.WEATHER_API_KEY;
    if (key) {
      try {
        const url = `${(process.env.WEATHER_API_BASE_URL || 'https://api.weatherapi.com/v1').replace(/\/$/, '')}/forecast.json?key=${encodeURIComponent(key)}&q=${encodeURIComponent(lat + ',' + lng)}&days=3&aqi=no&alerts=yes`;
        const r = await fetch(url, { headers: { 'User-Agent': 'agrimaan-backend' } });
        const text = await r.text();
        if (!r.ok) {
          const err = new Error(`WeatherAPI ${r.status} ${r.statusText}`);
          err.responseBody = text;
          throw err;
        }
        const raw = JSON.parse(text);
        return {
          location: { name: raw?.location?.name, lat: raw?.location?.lat, lon: raw?.location?.lon },
          current: {
            temp_c: raw?.current?.temp_c,
            wind_kph: raw?.current?.wind_kph,
            precip_mm: raw?.current?.precip_mm,
            humidity: raw?.current?.humidity,
            condition: { text: raw?.current?.condition?.text },
          },
          forecast: raw?.forecast?.forecastday || [],
          meta: { provider: 'weatherapi' },
        };
      } catch (e) {
        // fall through to Open-Meteo if WeatherAPI fails
        console.error('WeatherAPI failed, falling back:', e?.responseBody || e?.message || e);
      }
    }
  
    // fallback to Open-Meteo (no key required)
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(lat));
    url.searchParams.set('longitude', String(lng));
    url.searchParams.set('current', 'temperature_2m,precipitation,wind_speed_10m,relative_humidity_2m');
    url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max');
    url.searchParams.set('timezone', 'auto');
  
    const r = await fetch(url.toString(), { headers: { 'User-Agent': 'agrimaan-backend' } });
    const text = await r.text();
    if (!r.ok) {
      const err = new Error(`Open-Meteo ${r.status} ${r.statusText}`);
      err.responseBody = text;
      throw err;
    }
    const raw = JSON.parse(text);
  
    // normalize like the route helper
    const now = {
      temp_c: raw?.current?.temperature_2m,
      wind_kph: raw?.current?.wind_speed_10m != null ? Math.round(raw.current.wind_speed_10m * 3.6) : undefined,
      precip_mm: raw?.current?.precipitation,
      humidity: raw?.current?.relative_humidity_2m,
      condition: { text: '—' },
    };
    const f = [];
    const dates = raw?.daily?.time || [];
    for (let i = 0; i < Math.min(3, dates.length); i++) {
      f.push({
        date: dates[i],
        day: {
          maxtemp_c: raw?.daily?.temperature_2m_max?.[i],
          mintemp_c: raw?.daily?.temperature_2m_min?.[i],
          totalprecip_mm: raw?.daily?.precipitation_sum?.[i],
          maxwind_kph: raw?.daily?.wind_speed_10m_max?.[i] != null
            ? Math.round(raw.daily.wind_speed_10m_max[i] * 3.6)
            : undefined,
          condition: { text: '—' },
        },
      });
    }
    return { location: { name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lon: lng }, current: now, forecast: f, meta: { provider: 'open-meteo' } };
  }
  

  /**
   * Persist a snapshot (optional for your protected routes)
   */
  async saveWeatherData(fieldId, weatherData) {
    try {
      const weather = new Weather({
        field: fieldId,
        date: new Date(),
        temperature: weatherData.current.temperature,
        humidity: weatherData.current.humidity,
        condition: weatherData.current.condition,
        windSpeed: weatherData.current.windSpeed,
        windDirection: weatherData.current.windDirection,
        pressure: weatherData.current.pressure,
        rainfall: weatherData.current.rainfall,
        cloudCover: weatherData.current.cloudCover,
        forecast: weatherData.forecast,
      });
      return await weather.save();
    } catch (error) {
      console.error("Error saving weather data:", error);
      throw new Error("Failed to save weather data");
    }
  }

  // leave getHistoricalWeather / getWeatherAlerts as-is for now
}

async function openMeteoFallback(lat, lng) {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lng));
  url.searchParams.set('current', 'temperature_2m,precipitation,wind_speed_10m,relative_humidity_2m');
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max');
  url.searchParams.set('timezone', 'auto');

  const r = await fetch(url.toString(), { headers: { 'User-Agent': 'agrimaan-backend' } });
  const text = await r.text();
  if (!r.ok) {
    const err = new Error(`Open-Meteo ${r.status} ${r.statusText}`);
    err.responseBody = text;
    throw err;
  }
  const raw = JSON.parse(text);

  const now = {
    temp_c: raw?.current?.temperature_2m,
    wind_kph: raw?.current?.wind_speed_10m != null ? Math.round(raw.current.wind_speed_10m * 3.6) : undefined,
    precip_mm: raw?.current?.precipitation,
    humidity: raw?.current?.relative_humidity_2m,
    condition: { text: '—' },
  };

  const f = [];
  const dates = raw?.daily?.time || [];
  for (let i = 0; i < Math.min(3, dates.length); i++) {
    f.push({
      date: dates[i],
      day: {
        maxtemp_c: raw?.daily?.temperature_2m_max?.[i],
        mintemp_c: raw?.daily?.temperature_2m_min?.[i],
        totalprecip_mm: raw?.daily?.precipitation_sum?.[i],
        maxwind_kph: raw?.daily?.wind_speed_10m_max?.[i] != null
          ? Math.round(raw.daily.wind_speed_10m_max[i] * 3.6)
          : undefined,
        condition: { text: '—' },
      },
    });
  }

  return {
    location: { name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lon: lng },
    current: now,
    forecast: f,
    meta: { provider: 'open-meteo' },
  };
}
module.exports = new WeatherService();
