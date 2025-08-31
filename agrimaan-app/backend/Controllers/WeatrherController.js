const { CurrentWeather, WeatherForecast, WeatherAlert, HistoricalWeather } = require('../models/Weather');

const getCurrentWeather = async (req, res) => {
  try {
    const { location } = req.query;
    
    const query = location && location !== 'all' ? { location } : {};
    
    const currentWeather = await CurrentWeather.findOne(query)
      .sort({ date: -1 });

    if (!currentWeather) {
      return res.status(404).json({ message: 'No current weather data found' });
    }

    res.json(currentWeather);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching current weather', error: error.message });
  }
};

const getWeatherForecast = async (req, res) => {
  try {
    const { location, days = 7 } = req.query;
    
    const query = location && location !== 'all' ? { location } : {};
    
    const forecast = await WeatherForecast.find(query)
      .sort({ date: 1 })
      .limit(parseInt(days));

    res.json(forecast);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching weather forecast', error: error.message });
  }
};

const getWeatherAlerts = async (req, res) => {
  try {
    const { location } = req.query;
    
    const query = {
      ...(location && location !== 'all' ? { location } : {}),
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    };
    
    const alerts = await WeatherAlert.find(query)
      .sort({ severity: -1, startDate: -1 });

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching weather alerts', error: error.message });
  }
};

const getHistoricalWeather = async (req, res) => {
  try {
    const { location, year } = req.query;
    
    const query = {
      ...(location && location !== 'all' ? { location } : {}),
      ...(year ? { year: parseInt(year) } : { year: new Date().getFullYear() })
    };
    
    const historicalData = await HistoricalWeather.find(query)
      .sort({ month: 1 });

    res.json(historicalData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching historical weather', error: error.message });
  }
};

const createCurrentWeather = async (req, res) => {
  try {
    const weatherData = new CurrentWeather(req.body);
    const savedWeather = await weatherData.save();
    res.status(201).json(savedWeather);
  } catch (error) {
    res.status(400).json({ message: 'Error creating weather data', error: error.message });
  }
};

const createWeatherForecast = async (req, res) => {
  try {
    const forecastData = new WeatherForecast(req.body);
    const savedForecast = await forecastData.save();
    res.status(201).json(savedForecast);
  } catch (error) {
    res.status(400).json({ message: 'Error creating forecast data', error: error.message });
  }
};

const createWeatherAlert = async (req, res) => {
  try {
    const alertData = new WeatherAlert(req.body);
    const savedAlert = await alertData.save();
    res.status(201).json(savedAlert);
  } catch (error) {
    res.status(400).json({ message: 'Error creating weather alert', error: error.message });
  }
};

const updateWeatherAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAlert = await WeatherAlert.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedAlert) {
      return res.status(404).json({ message: 'Weather alert not found' });
    }
    
    res.json(updatedAlert);
  } catch (error) {
    res.status(400).json({ message: 'Error updating weather alert', error: error.message });
  }
};

const deleteWeatherAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAlert = await WeatherAlert.findByIdAndDelete(id);
    
    if (!deletedAlert) {
      return res.status(404).json({ message: 'Weather alert not found' });
    }
    
    res.json({ message: 'Weather alert deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting weather alert', error: error.message });
  }
};

const createHistoricalWeather = async (req, res) => {
  try {
    const historicalData = new HistoricalWeather(req.body);
    const savedData = await historicalData.save();
    res.status(201).json(savedData);
  } catch (error) {
    res.status(400).json({ message: 'Error creating historical weather data', error: error.message });
  }
};

const bulkCreateForecast = async (req, res) => {
  try {
    const { forecasts } = req.body;
    const savedForecasts = await WeatherForecast.insertMany(forecasts);
    res.status(201).json(savedForecasts);
  } catch (error) {
    res.status(400).json({ message: 'Error creating forecast data', error: error.message });
  }
};

module.exports = {
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
};
