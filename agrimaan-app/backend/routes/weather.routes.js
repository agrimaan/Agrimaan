const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Weather = require('../models/Weather');
const Field = require('../models/Field');
const auth = require('../middleware/auth');
const weatherService = require('../services/weather.service');

// @route   GET api/weather/field/:fieldId/current
// @desc    Get current weather for a field
// @access  Private
router.get('/field/:fieldId/current', auth, async (req, res) => {
  try {
    const fieldId = req.params.fieldId;
    
    // Check if field exists and user has access
    const field = await Field.findById(fieldId);
    if (!field) {
      return res.status(404).json({ message: 'Field not found' });
    }
    
    if (field.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get field location
    const { location } = field;
    if (!location || !location.lat || !location.lng) {
      return res.status(400).json({ message: 'Field location not available' });
    }
    
    // Get current weather data
    const weatherData = await weatherService.getCurrentWeather(location.lat, location.lng);
    
    // Save weather data to database
    const savedWeather = await weatherService.saveWeatherData(fieldId, weatherData);
    
    res.json({
      weather: weatherData,
      saved: savedWeather
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/weather/field/:fieldId/history
// @desc    Get historical weather data for a field
// @access  Private
router.get('/field/:fieldId/history', auth, async (req, res) => {
  try {
    const fieldId = req.params.fieldId;
    const { startDate, endDate } = req.query;
    
    // Check if field exists and user has access
    const field = await Field.findById(fieldId);
    if (!field) {
      return res.status(404).json({ message: 'Field not found' });
    }
    
    if (field.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Parse dates if provided
    let parsedStartDate, parsedEndDate;
    if (startDate) {
      parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({ message: 'Invalid start date format' });
      }
    }
    
    if (endDate) {
      parsedEndDate = new Date(endDate);
      if (isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({ message: 'Invalid end date format' });
      }
    }
    
    // Get historical weather data
    const weatherHistory = await weatherService.getHistoricalWeather(
      fieldId, 
      parsedStartDate, 
      parsedEndDate
    );
    
    res.json(weatherHistory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/weather/field/:fieldId/forecast
// @desc    Get weather forecast for a field
// @access  Private
router.get('/field/:fieldId/forecast', auth, async (req, res) => {
  try {
    const fieldId = req.params.fieldId;
    
    // Check if field exists and user has access
    const field = await Field.findById(fieldId);
    if (!field) {
      return res.status(404).json({ message: 'Field not found' });
    }
    
    if (field.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get field location
    const { location } = field;
    if (!location || !location.lat || !location.lng) {
      return res.status(400).json({ message: 'Field location not available' });
    }
    
    // Get current weather data which includes forecast
    const weatherData = await weatherService.getCurrentWeather(location.lat, location.lng);
    
    res.json({
      forecast: weatherData.forecast
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/weather/field/:fieldId/alerts
// @desc    Get weather alerts for a field
// @access  Private
router.get('/field/:fieldId/alerts', auth, async (req, res) => {
  try {
    const fieldId = req.params.fieldId;
    
    // Check if field exists and user has access
    const field = await Field.findById(fieldId);
    if (!field) {
      return res.status(404).json({ message: 'Field not found' });
    }
    
    if (field.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get weather alerts
    const alerts = await weatherService.getWeatherAlerts(fieldId, field);
    
    res.json(alerts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/weather/fields/summary
// @desc    Get weather summary for all user's fields
// @access  Private
router.get('/fields/summary', auth, async (req, res) => {
  try {
    // Get user's fields
    const fields = await Field.find({ owner: req.user.id });
    
    if (fields.length === 0) {
      return res.json([]);
    }
    
    // Get latest weather data for each field
    const weatherSummaries = [];
    
    for (const field of fields) {
      // Get latest weather record
      const latestWeather = await Weather.findOne({ field: field._id })
        .sort({ date: -1 })
        .limit(1);
      
      // If no weather data exists, get current weather
      let weatherData;
      if (!latestWeather) {
        // Only fetch if field has location
        if (field.location && field.location.lat && field.location.lng) {
          weatherData = await weatherService.getCurrentWeather(field.location.lat, field.location.lng);
          await weatherService.saveWeatherData(field._id, weatherData);
        }
      } else {
        weatherData = {
          current: {
            temperature: latestWeather.temperature,
            humidity: latestWeather.humidity,
            condition: latestWeather.condition,
            windSpeed: latestWeather.windSpeed,
            windDirection: latestWeather.windDirection,
            rainfall: latestWeather.rainfall
          },
          forecast: latestWeather.forecast
        };
      }
      
      // Get alerts
      const alerts = await weatherService.getWeatherAlerts(field._id, field);
      
      weatherSummaries.push({
        field: {
          id: field._id,
          name: field.name,
          location: field.location
        },
        weather: weatherData,
        alerts,
        lastUpdated: latestWeather ? latestWeather.date : new Date()
      });
    }
    
    res.json(weatherSummaries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/weather/field/:fieldId/refresh
// @desc    Refresh weather data for a field
// @access  Private
router.post('/field/:fieldId/refresh', auth, async (req, res) => {
  try {
    const fieldId = req.params.fieldId;
    
    // Check if field exists and user has access
    const field = await Field.findById(fieldId);
    if (!field) {
      return res.status(404).json({ message: 'Field not found' });
    }
    
    if (field.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get field location
    const { location } = field;
    if (!location || !location.lat || !location.lng) {
      return res.status(400).json({ message: 'Field location not available' });
    }
    
    // Get current weather data
    const weatherData = await weatherService.getCurrentWeather(location.lat, location.lng);
    
    // Save weather data to database
    const savedWeather = await weatherService.saveWeatherData(fieldId, weatherData);
    
    // Get alerts
    const alerts = await weatherService.getWeatherAlerts(fieldId, field);
    
    res.json({
      weather: weatherData,
      saved: savedWeather,
      alerts
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET /api/weather/search?query=Melbourne
router.get('/search', async (req, res) => {
  try {
    const q = (req.query.query || '').toString().trim();
    if (!q) return res.status(400).json({ error: 'Missing query' });

    const data = await weatherService.getByLocationName(q);
    return res.json(data);
  } catch (e) {
    console.error('GET /api/weather/search error:', e?.responseBody || e?.message || e);
    return res.status(500).json({ error: 'weather search failed', detail: e?.message || 'unknown' });
  }
});

// GET /api/weather/by-coords?lat=...&lng=...
router.get('/by-coords', async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ error: 'lat and lng query params are required (numbers)' });
  }

  try {
    // Primary provider via your service (e.g., WeatherAPI if configured)
    const wx = await weatherService.getCurrentWeather(lat, lng);
    return res.json(wx);
  } catch (e1) {
    console.error('Primary provider failed:', e1?.responseBody || e1?.message || e1);

    // Fallback to Open-Meteo so the UI still works
    try {
      const wx2 = await openMeteoFallback(lat, lng);
      return res.json(wx2);
    } catch (e2) {
      console.error('Open-Meteo fallback failed:', e2?.responseBody || e2?.message || e2);
      return res.status(500).json({
        error: 'weather fetch failed',
        detail: e1?.message || e2?.message || 'unknown'
      });
    }
  }
});






module.exports = router;