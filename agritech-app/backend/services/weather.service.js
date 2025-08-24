const axios = require('axios');
const Weather = require('../models/Weather');

// This would be stored in environment variables in a real application
const WEATHER_API_KEY = 'mock_api_key';
const WEATHER_API_BASE_URL = 'https://api.weatherapi.com/v1';

/**
 * Weather service to handle external API integration and data processing
 */
class WeatherService {
  /**
   * Fetch current weather data for a location
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<Object>} Weather data
   */
  async getCurrentWeather(lat, lng) {
    try {
      // In a real implementation, this would call an actual weather API
      // For now, we'll simulate the API response
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Generate realistic weather data based on random values
      const currentDate = new Date();
      const season = this.getSeason(currentDate, lat > 0);
      
      // Temperature ranges by season (in Celsius)
      const tempRanges = {
        spring: { min: 10, max: 25 },
        summer: { min: 20, max: 35 },
        fall: { min: 5, max: 20 },
        winter: { min: -5, max: 10 }
      };
      
      // Generate temperature based on season
      const tempRange = tempRanges[season];
      const temperature = tempRange.min + Math.random() * (tempRange.max - tempRange.min);
      
      // Generate humidity based on temperature (inverse relationship)
      const baseHumidity = 80 - temperature;
      const humidity = Math.max(30, Math.min(95, baseHumidity + (Math.random() * 20 - 10)));
      
      // Generate rainfall (more likely in spring/fall)
      let rainfall = 0;
      if (season === 'spring' || season === 'fall') {
        rainfall = Math.random() > 0.6 ? Math.random() * 15 : 0;
      } else if (season === 'summer') {
        rainfall = Math.random() > 0.8 ? Math.random() * 25 : 0;
      } else {
        rainfall = Math.random() > 0.7 ? Math.random() * 5 : 0;
      }
      
      // Generate wind speed
      const windSpeed = Math.random() * 30;
      
      // Generate cloud cover
      const cloudCover = Math.random() * 100;
      
      // Generate weather condition
      let condition;
      if (rainfall > 5) {
        condition = 'Rain';
      } else if (cloudCover > 70) {
        condition = 'Cloudy';
      } else if (cloudCover > 30) {
        condition = 'Partly cloudy';
      } else {
        condition = 'Sunny';
      }
      
      return {
        location: {
          lat,
          lng,
          name: `Location at ${lat.toFixed(2)}, ${lng.toFixed(2)}`
        },
        current: {
          temperature: Math.round(temperature * 10) / 10,
          humidity: Math.round(humidity),
          condition,
          windSpeed: Math.round(windSpeed * 10) / 10,
          windDirection: this.getRandomWindDirection(),
          pressure: Math.round(1000 + Math.random() * 50),
          cloudCover: Math.round(cloudCover),
          rainfall: Math.round(rainfall * 10) / 10,
          uv: Math.round(Math.random() * 10 * 10) / 10
        },
        forecast: this.generateForecast(season, temperature, humidity, rainfall)
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw new Error('Failed to fetch weather data');
    }
  }
  
  /**
   * Get the current season based on date and hemisphere
   * @param {Date} date - Current date
   * @param {boolean} northernHemisphere - Whether the location is in the northern hemisphere
   * @returns {string} Season name
   */
  getSeason(date, northernHemisphere = true) {
    const month = date.getMonth();
    
    if (northernHemisphere) {
      if (month >= 2 && month <= 4) return 'spring';
      if (month >= 5 && month <= 7) return 'summer';
      if (month >= 8 && month <= 10) return 'fall';
      return 'winter';
    } else {
      // Southern hemisphere has opposite seasons
      if (month >= 2 && month <= 4) return 'fall';
      if (month >= 5 && month <= 7) return 'winter';
      if (month >= 8 && month <= 10) return 'spring';
      return 'summer';
    }
  }
  
  /**
   * Generate a random wind direction
   * @returns {string} Wind direction
   */
  getRandomWindDirection() {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.floor(Math.random() * directions.length)];
  }
  
  /**
   * Generate a 7-day weather forecast
   * @param {string} season - Current season
   * @param {number} baseTemp - Base temperature
   * @param {number} baseHumidity - Base humidity
   * @param {number} baseRainfall - Base rainfall
   * @returns {Array<Object>} 7-day forecast
   */
  generateForecast(season, baseTemp, baseHumidity, baseRainfall) {
    const forecast = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + i);
      
      // Add some variation to the base values
      const tempVariation = Math.random() * 8 - 4; // -4 to +4
      const humidityVariation = Math.random() * 20 - 10; // -10 to +10
      const rainfallChance = Math.random();
      
      let rainfall = 0;
      if (rainfallChance > 0.7) {
        rainfall = Math.random() * 20;
      }
      
      const temperature = baseTemp + tempVariation;
      const humidity = Math.max(30, Math.min(95, baseHumidity + humidityVariation));
      const cloudCover = Math.random() * 100;
      
      // Generate weather condition
      let condition;
      if (rainfall > 5) {
        condition = 'Rain';
      } else if (cloudCover > 70) {
        condition = 'Cloudy';
      } else if (cloudCover > 30) {
        condition = 'Partly cloudy';
      } else {
        condition = 'Sunny';
      }
      
      forecast.push({
        date: forecastDate,
        temperature: {
          min: Math.round((temperature - 5) * 10) / 10,
          max: Math.round((temperature + 5) * 10) / 10
        },
        humidity: Math.round(humidity),
        condition,
        windSpeed: Math.round(Math.random() * 30 * 10) / 10,
        windDirection: this.getRandomWindDirection(),
        rainfall: Math.round(rainfall * 10) / 10,
        rainChance: Math.round(rainfallChance * 100)
      });
    }
    
    return forecast;
  }
  
  /**
   * Save weather data to database
   * @param {string} fieldId - Field ID
   * @param {Object} weatherData - Weather data to save
   * @returns {Promise<Object>} Saved weather record
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
        forecast: weatherData.forecast
      });
      
      return await weather.save();
    } catch (error) {
      console.error('Error saving weather data:', error);
      throw new Error('Failed to save weather data');
    }
  }
  
  /**
   * Get historical weather data for a field
   * @param {string} fieldId - Field ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array<Object>>} Historical weather data
   */
  async getHistoricalWeather(fieldId, startDate, endDate) {
    try {
      const query = { field: fieldId };
      
      if (startDate && endDate) {
        query.date = { $gte: startDate, $lte: endDate };
      } else if (startDate) {
        query.date = { $gte: startDate };
      } else if (endDate) {
        query.date = { $lte: endDate };
      }
      
      return await Weather.find(query).sort({ date: -1 });
    } catch (error) {
      console.error('Error fetching historical weather data:', error);
      throw new Error('Failed to fetch historical weather data');
    }
  }
  
  /**
   * Get weather alerts for a field
   * @param {string} fieldId - Field ID
   * @param {Object} field - Field data with location
   * @returns {Promise<Array<Object>>} Weather alerts
   */
  async getWeatherAlerts(fieldId, field) {
    try {
      // In a real implementation, this would call an actual weather API
      // For now, we'll simulate the API response
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Generate random alerts based on probability
      const alertChance = Math.random();
      const alerts = [];
      
      if (alertChance > 0.7) {
        // Generate a random alert
        const alertTypes = [
          {
            type: 'heavy_rain',
            title: 'Heavy Rain Warning',
            description: 'Heavy rainfall expected in your area. Consider checking drainage systems.',
            severity: 'moderate'
          },
          {
            type: 'frost',
            title: 'Frost Advisory',
            description: 'Temperatures expected to drop below freezing overnight. Protect sensitive crops.',
            severity: 'high'
          },
          {
            type: 'high_wind',
            title: 'High Wind Alert',
            description: 'Strong winds forecasted. Secure equipment and check crop supports.',
            severity: 'moderate'
          },
          {
            type: 'hail',
            title: 'Hail Possibility',
            description: 'Conditions favorable for hail development. Monitor weather closely.',
            severity: 'high'
          },
          {
            type: 'drought',
            title: 'Drought Conditions',
            description: 'Extended dry period forecasted. Review irrigation plans.',
            severity: 'moderate'
          }
        ];
        
        const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        
        alerts.push({
          id: `alert-${Date.now()}`,
          fieldId,
          ...randomAlert,
          issueDate: new Date(),
          expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
          recommendations: this.getAlertRecommendations(randomAlert.type)
        });
      }
      
      return alerts;
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
      throw new Error('Failed to fetch weather alerts');
    }
  }
  
  /**
   * Get recommendations based on alert type
   * @param {string} alertType - Type of weather alert
   * @returns {Array<Object>} Recommendations
   */
  getAlertRecommendations(alertType) {
    const recommendations = [];
    
    switch (alertType) {
      case 'heavy_rain':
        recommendations.push({
          action: 'Check field drainage',
          priority: 'high',
          timeframe: 'Immediate',
          details: 'Ensure drainage systems are clear of debris to prevent water logging.'
        });
        recommendations.push({
          action: 'Delay fertilizer application',
          priority: 'medium',
          timeframe: 'Until rain passes',
          details: 'Heavy rain may wash away applied fertilizers. Delay application until conditions improve.'
        });
        break;
        
      case 'frost':
        recommendations.push({
          action: 'Apply frost protection',
          priority: 'critical',
          timeframe: 'Before sunset',
          details: 'Cover sensitive crops or use frost protection sprays before temperatures drop.'
        });
        recommendations.push({
          action: 'Irrigate fields',
          priority: 'high',
          timeframe: 'Evening',
          details: 'Moist soil retains heat better than dry soil, providing some frost protection.'
        });
        break;
        
      case 'high_wind':
        recommendations.push({
          action: 'Secure equipment',
          priority: 'high',
          timeframe: 'Immediate',
          details: 'Secure or store loose equipment and materials that could be damaged or cause damage.'
        });
        recommendations.push({
          action: 'Check crop supports',
          priority: 'medium',
          timeframe: 'Today',
          details: 'Ensure trellises, stakes, and other crop supports are secure.'
        });
        break;
        
      case 'hail':
        recommendations.push({
          action: 'Protect high-value crops',
          priority: 'critical',
          timeframe: 'Immediate',
          details: 'If possible, cover high-value crops with hail netting or other protective materials.'
        });
        recommendations.push({
          action: 'Prepare for damage assessment',
          priority: 'medium',
          timeframe: 'After event',
          details: 'Be ready to assess crop damage after the hail event to determine necessary actions.'
        });
        break;
        
      case 'drought':
        recommendations.push({
          action: 'Review irrigation schedule',
          priority: 'high',
          timeframe: 'Next 48 hours',
          details: 'Optimize irrigation scheduling to conserve water while maintaining crop health.'
        });
        recommendations.push({
          action: 'Apply mulch',
          priority: 'medium',
          timeframe: 'This week',
          details: 'Consider applying mulch to reduce soil water evaporation and maintain moisture.'
        });
        break;
        
      default:
        recommendations.push({
          action: 'Monitor conditions',
          priority: 'medium',
          timeframe: 'Ongoing',
          details: 'Continue to monitor weather conditions and be prepared to take action if needed.'
        });
    }
    
    return recommendations;
  }
}

module.exports = new WeatherService();