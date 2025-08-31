const express = require('express');
const {
  getCurrentWeather,
  getWeatherForecast,
  getWeatherAlerts,
  getHistoricalWeather,
  createCurrentWeather,
  createWeatherForecast,
  createWeatherAlert,
  updateWeatherAlert,
  deleteWeatherAlert,
  createHistoricalWeather,
  bulkCreateForecast
} = require('../controllers/weatherController');

const router = express.Router();

// GET routes
router.get('/current', getCurrentWeather);
router.get('/forecast', getWeatherForecast);
router.get('/alerts', getWeatherAlerts);
router.get('/historical', getHistoricalWeather);

// POST routes
router.post('/current', createCurrentWeather);
router.post('/forecast', createWeatherForecast);
router.post('/forecast/bulk', bulkCreateForecast);
router.post('/alerts', createWeatherAlert);
router.post('/historical', createHistoricalWeather);

// PUT routes
router.put('/alerts/:id', updateWeatherAlert);

// DELETE routes
router.delete('/alerts/:id', deleteWeatherAlert);

module.exports = router;
