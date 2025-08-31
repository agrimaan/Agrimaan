const mongoose = require('mongoose');

const CurrentWeatherSchema = new mongoose.Schema({
  location: { type: String, required: true },
  coordinates: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  date: { type: Date, required: true },
  temperature: { type: Number, required: true },
  feelsLike: { type: Number, required: true },
  condition: { type: String, required: true },
  humidity: { type: Number, required: true },
  windSpeed: { type: Number, required: true },
  windDirection: { type: String, required: true },
  precipitation: { type: Number, required: true },
  pressure: { type: Number, required: true },
  visibility: { type: Number, required: true },
  uvIndex: { type: Number, required: true },
  sunrise: { type: Date, required: true },
  sunset: { type: Date, required: true }
}, {
  timestamps: true
});

const WeatherForecastSchema = new mongoose.Schema({
  location: { type: String, required: true },
  coordinates: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  date: { type: Date, required: true },
  day: { type: String, required: true },
  condition: { type: String, required: true },
  highTemp: { type: Number, required: true },
  lowTemp: { type: Number, required: true },
  precipitation: { type: Number, required: true },
  windSpeed: { type: Number, required: true },
  windDirection: { type: String, required: true }
}, {
  timestamps: true
});

const WeatherAlertSchema = new mongoose.Schema({
  location: { type: String, required: true },
  type: { type: String, required: true },
  severity: { type: String, enum: ['Low', 'Moderate', 'High', 'Extreme'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

const HistoricalWeatherSchema = new mongoose.Schema({
  location: { type: String, required: true },
  year: { type: Number, required: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  avgHigh: { type: Number, required: true },
  avgLow: { type: Number, required: true },
  totalPrecipitation: { type: Number, required: true },
  avgHumidity: { type: Number, required: true },
  avgWindSpeed: { type: Number, required: true }
}, {
  timestamps: true
});

// Create compound indexes for better query performance
CurrentWeatherSchema.index({ location: 1, date: -1 });
WeatherForecastSchema.index({ location: 1, date: 1 });
WeatherAlertSchema.index({ location: 1, isActive: 1, startDate: -1 });
HistoricalWeatherSchema.index({ location: 1, year: 1, month: 1 });

const CurrentWeather = mongoose.model('CurrentWeather', CurrentWeatherSchema);
const WeatherForecast = mongoose.model('WeatherForecast', WeatherForecastSchema);
const WeatherAlert = mongoose.model('WeatherAlert', WeatherAlertSchema);
const HistoricalWeather = mongoose.model('HistoricalWeather', HistoricalWeatherSchema);

module.exports = {
  CurrentWeather,
  WeatherForecast,
  WeatherAlert,
  HistoricalWeather
};
