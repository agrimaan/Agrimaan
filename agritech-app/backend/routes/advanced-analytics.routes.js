const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Analytics = require('../models/Analytics');
const Field = require('../models/Field');
const Crop = require('../models/Crop');
const Sensor = require('../models/Sensor');
const Weather = require('../models/Weather');
const auth = require('../middleware/auth');

// Mock AI model functions (in production, these would connect to actual ML models)
const predictYield = async (cropData, fieldData, weatherData, sensorData) => {
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Calculate base yield based on crop type and historical data
  const baseYield = cropData.expectedYield || 100; // kg per hectare
  
  // Apply modifiers based on various factors
  let yieldModifier = 1.0;
  
  // Weather impact
  if (weatherData && weatherData.length > 0) {
    const recentWeather = weatherData[0];
    // Rainfall impact
    if (recentWeather.rainfall < 10) {
      yieldModifier *= 0.8; // Drought conditions
    } else if (recentWeather.rainfall > 50) {
      yieldModifier *= 0.9; // Excessive rain
    } else {
      yieldModifier *= 1.1; // Optimal rain
    }
    
    // Temperature impact
    const avgTemp = recentWeather.temperature;
    if (avgTemp < 10 || avgTemp > 35) {
      yieldModifier *= 0.85; // Temperature stress
    } else if (avgTemp >= 20 && avgTemp <= 30) {
      yieldModifier *= 1.15; // Optimal temperature
    }
  }
  
  // Soil health impact
  if (fieldData.soilHealth) {
    switch (fieldData.soilHealth) {
      case 'excellent':
        yieldModifier *= 1.2;
        break;
      case 'good':
        yieldModifier *= 1.1;
        break;
      case 'fair':
        yieldModifier *= 0.9;
        break;
      case 'poor':
        yieldModifier *= 0.7;
        break;
      default:
        break;
    }
  }
  
  // Sensor data impact (e.g., soil moisture)
  if (sensorData && sensorData.length > 0) {
    const soilMoistureSensors = sensorData.filter(s => s.type === 'soil_moisture');
    if (soilMoistureSensors.length > 0) {
      const avgMoisture = soilMoistureSensors.reduce((sum, sensor) => {
        return sum + (sensor.lastReading?.value || 0);
      }, 0) / soilMoistureSensors.length;
      
      if (avgMoisture < 20) {
        yieldModifier *= 0.8; // Too dry
      } else if (avgMoisture > 80) {
        yieldModifier *= 0.85; // Too wet
      } else if (avgMoisture >= 40 && avgMoisture <= 60) {
        yieldModifier *= 1.1; // Optimal moisture
      }
    }
  }
  
  // Calculate predicted yield
  const predictedYield = baseYield * yieldModifier;
  
  // Calculate confidence based on data completeness
  let confidence = 70; // Base confidence
  if (weatherData && weatherData.length > 10) confidence += 5;
  if (sensorData && sensorData.length > 5) confidence += 10;
  if (fieldData.soilTests && fieldData.soilTests.length > 0) confidence += 10;
  
  // Cap confidence at 95%
  confidence = Math.min(confidence, 95);
  
  // Generate factors that influenced the prediction
  const factors = [
    {
      name: 'Weather Conditions',
      value: weatherData && weatherData.length > 0 ? 'Analyzed' : 'Limited Data',
      weight: 0.3
    },
    {
      name: 'Soil Health',
      value: fieldData.soilHealth || 'Unknown',
      weight: 0.25
    },
    {
      name: 'Irrigation',
      value: sensorData && sensorData.filter(s => s.type === 'soil_moisture').length > 0 ? 'Monitored' : 'Unmonitored',
      weight: 0.2
    },
    {
      name: 'Crop Variety',
      value: cropData.variety || 'Standard',
      weight: 0.15
    },
    {
      name: 'Historical Performance',
      value: cropData.previousYields && cropData.previousYields.length > 0 ? 'Available' : 'Unavailable',
      weight: 0.1
    }
  ];
  
  // Generate recommendations based on the analysis
  const recommendations = [];
  
  if (yieldModifier < 0.9) {
    recommendations.push({
      action: 'Review irrigation schedule',
      priority: 'high',
      timeframe: 'Within 1 week',
      details: 'Current conditions suggest suboptimal water levels that may impact yield.'
    });
  }
  
  if (fieldData.soilHealth === 'fair' || fieldData.soilHealth === 'poor') {
    recommendations.push({
      action: 'Apply soil amendments',
      priority: 'medium',
      timeframe: 'Within 2 weeks',
      details: 'Soil health is below optimal levels. Consider applying organic matter or specific nutrients based on soil test results.'
    });
  }
  
  if (!sensorData || sensorData.length === 0) {
    recommendations.push({
      action: 'Install soil moisture sensors',
      priority: 'medium',
      timeframe: 'Next planting season',
      details: 'Adding soil moisture sensors would improve irrigation management and yield prediction accuracy.'
    });
  }
  
  return {
    predictedYield: Math.round(predictedYield * 100) / 100,
    yieldUnit: 'kg/hectare',
    confidence,
    factors,
    recommendations,
    potentialRange: {
      min: Math.round(predictedYield * 0.8 * 100) / 100,
      max: Math.round(predictedYield * 1.2 * 100) / 100
    }
  };
};

const assessPestRisk = async (cropData, fieldData, weatherData) => {
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Base risk assessment
  let riskScore = 50; // Medium risk as baseline
  let confidence = 70; // Base confidence
  
  // Factors affecting pest risk
  const factors = [];
  
  // Weather impact
  if (weatherData && weatherData.length > 0) {
    const recentWeather = weatherData[0];
    
    // Temperature impact
    const avgTemp = recentWeather.temperature;
    if (avgTemp > 25) {
      riskScore += 15; // Higher temperatures often increase pest activity
      factors.push({
        name: 'High Temperature',
        value: `${avgTemp}°C`,
        weight: 0.3
      });
    } else if (avgTemp < 15) {
      riskScore -= 10; // Lower temperatures often reduce pest activity
      factors.push({
        name: 'Low Temperature',
        value: `${avgTemp}°C`,
        weight: 0.3
      });
    } else {
      factors.push({
        name: 'Moderate Temperature',
        value: `${avgTemp}°C`,
        weight: 0.2
      });
    }
    
    // Humidity impact
    if (recentWeather.humidity > 70) {
      riskScore += 20; // High humidity increases risk for many pests
      factors.push({
        name: 'High Humidity',
        value: `${recentWeather.humidity}%`,
        weight: 0.25
      });
    } else {
      factors.push({
        name: 'Moderate/Low Humidity',
        value: `${recentWeather.humidity}%`,
        weight: 0.15
      });
    }
    
    confidence += 10; // Weather data increases confidence
  } else {
    factors.push({
      name: 'Weather Data',
      value: 'Unavailable',
      weight: 0.3
    });
  }
  
  // Crop type impact
  if (cropData.type) {
    // Different crops have different pest susceptibilities
    const highRiskCrops = ['tomato', 'potato', 'apple', 'cotton'];
    const mediumRiskCrops = ['corn', 'wheat', 'soybean'];
    const lowRiskCrops = ['barley', 'oats', 'rye'];
    
    if (highRiskCrops.includes(cropData.type.toLowerCase())) {
      riskScore += 15;
      factors.push({
        name: 'Crop Type',
        value: `${cropData.type} (High Risk)`,
        weight: 0.25
      });
    } else if (mediumRiskCrops.includes(cropData.type.toLowerCase())) {
      riskScore += 5;
      factors.push({
        name: 'Crop Type',
        value: `${cropData.type} (Medium Risk)`,
        weight: 0.2
      });
    } else if (lowRiskCrops.includes(cropData.type.toLowerCase())) {
      riskScore -= 10;
      factors.push({
        name: 'Crop Type',
        value: `${cropData.type} (Low Risk)`,
        weight: 0.15
      });
    } else {
      factors.push({
        name: 'Crop Type',
        value: cropData.type,
        weight: 0.2
      });
    }
    
    confidence += 5;
  } else {
    factors.push({
      name: 'Crop Type',
      value: 'Unknown',
      weight: 0.2
    });
  }
  
  // Previous pest history
  if (fieldData.pestHistory && fieldData.pestHistory.length > 0) {
    const recentPests = fieldData.pestHistory.filter(p => {
      const pestDate = new Date(p.date);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return pestDate >= sixMonthsAgo;
    });
    
    if (recentPests.length > 0) {
      riskScore += 25; // Recent pest history significantly increases risk
      factors.push({
        name: 'Recent Pest History',
        value: `${recentPests.length} incidents in last 6 months`,
        weight: 0.35
      });
    } else {
      factors.push({
        name: 'Pest History',
        value: 'No recent incidents',
        weight: 0.15
      });
    }
    
    confidence += 15;
  } else {
    factors.push({
      name: 'Pest History',
      value: 'Unknown',
      weight: 0.25
    });
  }
  
  // Neighboring fields
  if (fieldData.neighboringCrops && fieldData.neighboringCrops.length > 0) {
    // Diversity in neighboring crops reduces risk
    const uniqueCrops = new Set(fieldData.neighboringCrops.map(c => c.type)).size;
    if (uniqueCrops > 2) {
      riskScore -= 10;
      factors.push({
        name: 'Crop Diversity',
        value: 'High (neighboring fields)',
        weight: 0.15
      });
    } else {
      riskScore += 5;
      factors.push({
        name: 'Crop Diversity',
        value: 'Low (neighboring fields)',
        weight: 0.1
      });
    }
    
    confidence += 5;
  }
  
  // Cap risk score between 0-100
  riskScore = Math.max(0, Math.min(100, riskScore));
  
  // Cap confidence at 95%
  confidence = Math.min(confidence, 95);
  
  // Determine risk level
  let riskLevel;
  if (riskScore >= 75) {
    riskLevel = 'high';
  } else if (riskScore >= 40) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }
  
  // Generate recommendations
  const recommendations = [];
  
  if (riskLevel === 'high') {
    recommendations.push({
      action: 'Implement preventive spraying',
      priority: 'high',
      timeframe: 'Within 3 days',
      details: 'Current conditions indicate high pest risk. Consider applying appropriate preventive treatments.'
    });
    
    recommendations.push({
      action: 'Increase monitoring frequency',
      priority: 'high',
      timeframe: 'Immediate',
      details: 'Inspect fields daily for early signs of pest activity, focusing on plant damage and pest presence.'
    });
  } else if (riskLevel === 'medium') {
    recommendations.push({
      action: 'Prepare for potential treatment',
      priority: 'medium',
      timeframe: 'Within 1 week',
      details: 'Have pest control measures ready to deploy if monitoring indicates increasing pest presence.'
    });
    
    recommendations.push({
      action: 'Implement regular monitoring',
      priority: 'medium',
      timeframe: 'Twice weekly',
      details: 'Check fields twice weekly for signs of pest activity.'
    });
  } else {
    recommendations.push({
      action: 'Maintain routine monitoring',
      priority: 'low',
      timeframe: 'Weekly',
      details: 'Continue standard pest monitoring practices.'
    });
  }
  
  // Add recommendation for historical data if missing
  if (!fieldData.pestHistory) {
    recommendations.push({
      action: 'Start tracking pest incidents',
      priority: 'medium',
      timeframe: 'Ongoing',
      details: 'Maintaining records of pest occurrences will improve future risk assessments.'
    });
  }
  
  return {
    riskScore,
    riskLevel,
    confidence,
    factors,
    recommendations,
    potentialPests: determinePotentialPests(cropData.type, weatherData)
  };
};

// Helper function to determine potential pests based on crop type and weather
const determinePotentialPests = (cropType, weatherData) => {
  if (!cropType) return [];
  
  const pestDatabase = {
    corn: ['European corn borer', 'Corn earworm', 'Armyworm', 'Corn rootworm'],
    wheat: ['Hessian fly', 'Wheat stem sawfly', 'Cereal leaf beetle'],
    soybean: ['Soybean aphid', 'Bean leaf beetle', 'Japanese beetle'],
    cotton: ['Boll weevil', 'Cotton bollworm', 'Spider mites'],
    potato: ['Colorado potato beetle', 'Potato leafhopper', 'Wireworms'],
    tomato: ['Tomato hornworm', 'Whiteflies', 'Aphids', 'Early blight'],
    apple: ['Codling moth', 'Apple maggot', 'Fire blight'],
    rice: ['Rice water weevil', 'Rice stink bug', 'Rice blast']
  };
  
  // Default to generic pests if crop type not in database
  const potentialPests = pestDatabase[cropType.toLowerCase()] || ['Aphids', 'Whiteflies', 'Spider mites'];
  
  // If we have weather data, we can refine the pest list
  if (weatherData && weatherData.length > 0) {
    const recentWeather = weatherData[0];
    const isWarm = recentWeather.temperature > 25;
    const isHumid = recentWeather.humidity > 70;
    
    // Filter or prioritize pests based on conditions
    if (isWarm && isHumid) {
      // These conditions favor many pests
      return potentialPests.map(pest => ({
        name: pest,
        likelihood: 'High',
        conditions: 'Current warm and humid conditions favor rapid development'
      }));
    } else if (isWarm) {
      return potentialPests.map(pest => ({
        name: pest,
        likelihood: 'Moderate',
        conditions: 'Warm temperatures may accelerate development'
      }));
    } else {
      return potentialPests.map(pest => ({
        name: pest,
        likelihood: 'Low to Moderate',
        conditions: 'Current conditions are less favorable for rapid development'
      }));
    }
  }
  
  // Without weather data, return basic list
  return potentialPests.map(pest => ({
    name: pest,
    likelihood: 'Unknown',
    conditions: 'Insufficient weather data for detailed assessment'
  }));
};

// Function to analyze soil health
const analyzeSoilHealth = async (fieldData, sensorData) => {
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Default values if no data is available
  let healthScore = 50;
  let confidence = 60;
  
  const soilParameters = {
    ph: null,
    nitrogen: null,
    phosphorus: null,
    potassium: null,
    organicMatter: null,
    moisture: null
  };
  
  const factors = [];
  
  // Extract soil test data if available
  if (fieldData.soilTests && fieldData.soilTests.length > 0) {
    const latestSoilTest = fieldData.soilTests.sort((a, b) => 
      new Date(b.date) - new Date(a.date))[0];
    
    if (latestSoilTest.ph) {
      soilParameters.ph = latestSoilTest.ph;
      
      // Evaluate pH
      if (soilParameters.ph >= 6.0 && soilParameters.ph <= 7.0) {
        healthScore += 15;
        factors.push({
          name: 'Soil pH',
          value: soilParameters.ph,
          status: 'Optimal',
          weight: 0.2
        });
      } else if (soilParameters.ph < 5.5 || soilParameters.ph > 7.5) {
        healthScore -= 15;
        factors.push({
          name: 'Soil pH',
          value: soilParameters.ph,
          status: 'Poor',
          weight: 0.2
        });
      } else {
        factors.push({
          name: 'Soil pH',
          value: soilParameters.ph,
          status: 'Acceptable',
          weight: 0.2
        });
      }
    }
    
    // Evaluate NPK levels
    if (latestSoilTest.nitrogen) {
      soilParameters.nitrogen = latestSoilTest.nitrogen;
      if (soilParameters.nitrogen >= 30) {
        healthScore += 10;
        factors.push({
          name: 'Nitrogen (N)',
          value: `${soilParameters.nitrogen} ppm`,
          status: 'Good',
          weight: 0.15
        });
      } else if (soilParameters.nitrogen < 15) {
        healthScore -= 10;
        factors.push({
          name: 'Nitrogen (N)',
          value: `${soilParameters.nitrogen} ppm`,
          status: 'Deficient',
          weight: 0.15
        });
      } else {
        factors.push({
          name: 'Nitrogen (N)',
          value: `${soilParameters.nitrogen} ppm`,
          status: 'Adequate',
          weight: 0.15
        });
      }
    }
    
    if (latestSoilTest.phosphorus) {
      soilParameters.phosphorus = latestSoilTest.phosphorus;
      if (soilParameters.phosphorus >= 25) {
        healthScore += 10;
        factors.push({
          name: 'Phosphorus (P)',
          value: `${soilParameters.phosphorus} ppm`,
          status: 'Good',
          weight: 0.15
        });
      } else if (soilParameters.phosphorus < 10) {
        healthScore -= 10;
        factors.push({
          name: 'Phosphorus (P)',
          value: `${soilParameters.phosphorus} ppm`,
          status: 'Deficient',
          weight: 0.15
        });
      } else {
        factors.push({
          name: 'Phosphorus (P)',
          value: `${soilParameters.phosphorus} ppm`,
          status: 'Adequate',
          weight: 0.15
        });
      }
    }
    
    if (latestSoilTest.potassium) {
      soilParameters.potassium = latestSoilTest.potassium;
      if (soilParameters.potassium >= 200) {
        healthScore += 10;
        factors.push({
          name: 'Potassium (K)',
          value: `${soilParameters.potassium} ppm`,
          status: 'Good',
          weight: 0.15
        });
      } else if (soilParameters.potassium < 100) {
        healthScore -= 10;
        factors.push({
          name: 'Potassium (K)',
          value: `${soilParameters.potassium} ppm`,
          status: 'Deficient',
          weight: 0.15
        });
      } else {
        factors.push({
          name: 'Potassium (K)',
          value: `${soilParameters.potassium} ppm`,
          status: 'Adequate',
          weight: 0.15
        });
      }
    }
    
    if (latestSoilTest.organicMatter) {
      soilParameters.organicMatter = latestSoilTest.organicMatter;
      if (soilParameters.organicMatter >= 3.0) {
        healthScore += 15;
        factors.push({
          name: 'Organic Matter',
          value: `${soilParameters.organicMatter}%`,
          status: 'Good',
          weight: 0.2
        });
      } else if (soilParameters.organicMatter < 1.5) {
        healthScore -= 15;
        factors.push({
          name: 'Organic Matter',
          value: `${soilParameters.organicMatter}%`,
          status: 'Poor',
          weight: 0.2
        });
      } else {
        factors.push({
          name: 'Organic Matter',
          value: `${soilParameters.organicMatter}%`,
          status: 'Adequate',
          weight: 0.2
        });
      }
    }
    
    confidence += 20; // Soil test data increases confidence
  } else {
    factors.push({
      name: 'Soil Test Data',
      value: 'Not available',
      status: 'Unknown',
      weight: 0.3
    });
  }
  
  // Extract soil moisture data from sensors if available
  if (sensorData && sensorData.length > 0) {
    const moistureSensors = sensorData.filter(s => s.type === 'soil_moisture');
    if (moistureSensors.length > 0) {
      // Calculate average moisture
      const totalMoisture = moistureSensors.reduce((sum, sensor) => {
        return sum + (sensor.lastReading?.value || 0);
      }, 0);
      soilParameters.moisture = totalMoisture / moistureSensors.length;
      
      // Evaluate moisture
      if (soilParameters.moisture >= 40 && soilParameters.moisture <= 60) {
        healthScore += 10;
        factors.push({
          name: 'Soil Moisture',
          value: `${Math.round(soilParameters.moisture)}%`,
          status: 'Optimal',
          weight: 0.15
        });
      } else if (soilParameters.moisture < 20 || soilParameters.moisture > 80) {
        healthScore -= 10;
        factors.push({
          name: 'Soil Moisture',
          value: `${Math.round(soilParameters.moisture)}%`,
          status: 'Poor',
          weight: 0.15
        });
      } else {
        factors.push({
          name: 'Soil Moisture',
          value: `${Math.round(soilParameters.moisture)}%`,
          status: 'Acceptable',
          weight: 0.15
        });
      }
      
      confidence += 10; // Sensor data increases confidence
    }
  }
  
  // Evaluate soil type if available
  if (fieldData.soilType) {
    // Different soil types have different agricultural potential
    const highQualitySoils = ['loam', 'silt loam', 'clay loam'];
    const mediumQualitySoils = ['sandy loam', 'silty clay', 'sandy clay loam'];
    const challengingSoils = ['sand', 'clay', 'rocky'];
    
    if (highQualitySoils.some(soil => fieldData.soilType.toLowerCase().includes(soil))) {
      healthScore += 10;
      factors.push({
        name: 'Soil Type',
        value: fieldData.soilType,
        status: 'Excellent',
        weight: 0.1
      });
    } else if (mediumQualitySoils.some(soil => fieldData.soilType.toLowerCase().includes(soil))) {
      factors.push({
        name: 'Soil Type',
        value: fieldData.soilType,
        status: 'Good',
        weight: 0.1
      });
    } else if (challengingSoils.some(soil => fieldData.soilType.toLowerCase().includes(soil))) {
      healthScore -= 10;
      factors.push({
        name: 'Soil Type',
        value: fieldData.soilType,
        status: 'Challenging',
        weight: 0.1
      });
    } else {
      factors.push({
        name: 'Soil Type',
        value: fieldData.soilType,
        status: 'Moderate',
        weight: 0.1
      });
    }
    
    confidence += 5;
  }
  
  // Cap health score between 0-100
  healthScore = Math.max(0, Math.min(100, healthScore));
  
  // Cap confidence at 95%
  confidence = Math.min(confidence, 95);
  
  // Determine health status
  let healthStatus;
  if (healthScore >= 75) {
    healthStatus = 'excellent';
  } else if (healthScore >= 60) {
    healthStatus = 'good';
  } else if (healthScore >= 40) {
    healthStatus = 'fair';
  } else {
    healthStatus = 'poor';
  }
  
  // Generate recommendations
  const recommendations = [];
  
  // pH recommendations
  if (soilParameters.ph !== null) {
    if (soilParameters.ph < 6.0) {
      recommendations.push({
        action: 'Apply lime to raise soil pH',
        priority: 'high',
        timeframe: 'Before next planting',
        details: `Current pH (${soilParameters.ph}) is too acidic for optimal nutrient availability. Apply agricultural lime according to soil test recommendations.`
      });
    } else if (soilParameters.ph > 7.5) {
      recommendations.push({
        action: 'Apply sulfur to lower soil pH',
        priority: 'high',
        timeframe: 'Before next planting',
        details: `Current pH (${soilParameters.ph}) is too alkaline for optimal nutrient availability. Apply agricultural sulfur according to soil test recommendations.`
      });
    }
  }
  
  // NPK recommendations
  if (soilParameters.nitrogen !== null && soilParameters.nitrogen < 20) {
    recommendations.push({
      action: 'Apply nitrogen fertilizer',
      priority: 'high',
      timeframe: 'Within 2 weeks',
      details: 'Nitrogen levels are below optimal range. Apply nitrogen-rich fertilizer based on crop requirements.'
    });
  }
  
  if (soilParameters.phosphorus !== null && soilParameters.phosphorus < 15) {
    recommendations.push({
      action: 'Apply phosphorus fertilizer',
      priority: 'medium',
      timeframe: 'Before next planting',
      details: 'Phosphorus levels are below optimal range. Apply phosphate fertilizer based on crop requirements.'
    });
  }
  
  if (soilParameters.potassium !== null && soilParameters.potassium < 150) {
    recommendations.push({
      action: 'Apply potassium fertilizer',
      priority: 'medium',
      timeframe: 'Before next planting',
      details: 'Potassium levels are below optimal range. Apply potash fertilizer based on crop requirements.'
    });
  }
  
  // Organic matter recommendations
  if (soilParameters.organicMatter !== null && soilParameters.organicMatter < 2.0) {
    recommendations.push({
      action: 'Increase organic matter',
      priority: 'medium',
      timeframe: 'Ongoing',
      details: 'Soil organic matter is low. Consider adding compost, implementing cover crops, or practicing crop rotation to improve soil structure and fertility.'
    });
  }
  
  // Moisture recommendations
  if (soilParameters.moisture !== null) {
    if (soilParameters.moisture < 30) {
      recommendations.push({
        action: 'Improve irrigation',
        priority: 'high',
        timeframe: 'Immediate',
        details: 'Soil moisture is low. Implement irrigation to prevent crop stress.'
      });
    } else if (soilParameters.moisture > 70) {
      recommendations.push({
        action: 'Improve drainage',
        priority: 'high',
        timeframe: 'As soon as possible',
        details: 'Soil moisture is excessively high. Consider improving field drainage to prevent root diseases and nutrient leaching.'
      });
    }
  }
  
  // If no soil test data is available
  if (!fieldData.soilTests || fieldData.soilTests.length === 0) {
    recommendations.push({
      action: 'Conduct comprehensive soil test',
      priority: 'high',
      timeframe: 'Within 1 month',
      details: 'No recent soil test data available. A comprehensive soil analysis will provide essential information for optimal soil management.'
    });
  }
  
  return {
    healthScore,
    healthStatus,
    confidence,
    factors,
    recommendations,
    soilParameters: {
      ph: soilParameters.ph,
      nitrogen: soilParameters.nitrogen,
      phosphorus: soilParameters.phosphorus,
      potassium: soilParameters.potassium,
      organicMatter: soilParameters.organicMatter,
      moisture: soilParameters.moisture
    }
  };
};

// @route   GET api/advanced-analytics/field/:fieldId/yield-prediction
// @desc    Get yield prediction for a field
// @access  Private
router.get('/field/:fieldId/yield-prediction', auth, async (req, res) => {
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
    
    // Get current crop in the field
    const crop = await Crop.findOne({ 
      field: fieldId,
      status: { $in: ['active', 'growing', 'mature'] }
    }).sort({ plantingDate: -1 });
    
    if (!crop) {
      return res.status(404).json({ message: 'No active crop found in this field' });
    }
    
    // Get weather data
    const weatherData = await Weather.find({ field: fieldId })
      .sort({ date: -1 })
      .limit(30);
    
    // Get sensor data
    const sensors = await Sensor.find({ field: fieldId });
    
    // Generate yield prediction
    const predictionData = await predictYield(crop, field, weatherData, sensors);
    
    // Create analytics record
    const analytics = new Analytics({
      field: fieldId,
      crop: crop._id,
      type: 'yield_prediction',
      data: predictionData,
      confidence: predictionData.confidence,
      factors: predictionData.factors,
      recommendations: predictionData.recommendations,
      modelVersion: '1.0',
      source: 'advanced-analytics-api',
      status: 'completed',
      date: Date.now()
    });
    
    await analytics.save();
    
    res.json({
      analytics,
      prediction: predictionData
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/advanced-analytics/field/:fieldId/pest-risk
// @desc    Get pest risk assessment for a field
// @access  Private
router.get('/field/:fieldId/pest-risk', auth, async (req, res) => {
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
    
    // Get current crop in the field
    const crop = await Crop.findOne({ 
      field: fieldId,
      status: { $in: ['active', 'growing', 'mature'] }
    }).sort({ plantingDate: -1 });
    
    if (!crop) {
      return res.status(404).json({ message: 'No active crop found in this field' });
    }
    
    // Get weather data
    const weatherData = await Weather.find({ field: fieldId })
      .sort({ date: -1 })
      .limit(30);
    
    // Generate pest risk assessment
    const riskData = await assessPestRisk(crop, field, weatherData);
    
    // Create analytics record
    const analytics = new Analytics({
      field: fieldId,
      crop: crop._id,
      type: 'pest_risk',
      data: riskData,
      confidence: riskData.confidence,
      factors: riskData.factors,
      recommendations: riskData.recommendations,
      modelVersion: '1.0',
      source: 'advanced-analytics-api',
      status: 'completed',
      date: Date.now()
    });
    
    await analytics.save();
    
    res.json({
      analytics,
      assessment: riskData
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/advanced-analytics/field/:fieldId/soil-health
// @desc    Get soil health analysis for a field
// @access  Private
router.get('/field/:fieldId/soil-health', auth, async (req, res) => {
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
    
    // Get sensor data
    const sensors = await Sensor.find({ 
      field: fieldId,
      type: { $in: ['soil_moisture', 'soil_temperature', 'soil_ph', 'soil_ec'] }
    });
    
    // Generate soil health analysis
    const soilHealthData = await analyzeSoilHealth(field, sensors);
    
    // Create analytics record
    const analytics = new Analytics({
      field: fieldId,
      type: 'soil_health',
      data: soilHealthData,
      confidence: soilHealthData.confidence,
      factors: soilHealthData.factors,
      recommendations: soilHealthData.recommendations,
      modelVersion: '1.0',
      source: 'advanced-analytics-api',
      status: 'completed',
      date: Date.now()
    });
    
    await analytics.save();
    
    res.json({
      analytics,
      soilHealth: soilHealthData
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/advanced-analytics/crop-image-analysis
// @desc    Analyze crop image for health assessment
// @access  Private
router.post(
  '/crop-image-analysis',
  [
    auth,
    [
      body('cropId', 'Crop ID is required').not().isEmpty(),
      body('imageUrl', 'Image URL is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { cropId, imageUrl, imageDate } = req.body;
      
      // Check if crop exists and user has access
      const crop = await Crop.findById(cropId).populate('field', 'owner');
      if (!crop) {
        return res.status(404).json({ message: 'Crop not found' });
      }
      
      if (crop.field.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // In a real implementation, this would call a computer vision API
      // Here we'll simulate an image analysis result
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock image analysis result
      const analysisResult = {
        healthIndex: Math.random() * 100,
        detectedIssues: [],
        coverage: Math.random() * 100,
        growthStage: ['seedling', 'vegetative', 'flowering', 'fruiting', 'mature'][Math.floor(Math.random() * 5)],
        colorAnalysis: {
          greenness: Math.random() * 100,
          yellowness: Math.random() * 30,
          brownness: Math.random() * 20
        }
      };
      
      // Determine health status based on health index
      if (analysisResult.healthIndex < 50) {
        analysisResult.healthStatus = 'poor';
        analysisResult.detectedIssues.push({
          type: 'discoloration',
          severity: 'high',
          coverage: Math.random() * 50 + 30,
          description: 'Significant yellowing detected in leaves'
        });
        analysisResult.detectedIssues.push({
          type: 'pest_damage',
          severity: 'medium',
          coverage: Math.random() * 30 + 10,
          description: 'Possible insect damage on leaf edges'
        });
      } else if (analysisResult.healthIndex < 75) {
        analysisResult.healthStatus = 'fair';
        analysisResult.detectedIssues.push({
          type: 'stress',
          severity: 'medium',
          coverage: Math.random() * 30 + 10,
          description: 'Signs of water stress detected'
        });
      } else {
        analysisResult.healthStatus = 'good';
      }
      
      // Generate recommendations based on analysis
      const recommendations = [];
      
      if (analysisResult.healthStatus === 'poor') {
        recommendations.push({
          action: 'Inspect crop for pest infestation',
          priority: 'high',
          timeframe: 'Within 24 hours',
          details: 'Visual analysis indicates possible pest damage. Conduct field inspection to identify specific pests.'
        });
        recommendations.push({
          action: 'Review nutrient management',
          priority: 'high',
          timeframe: 'Within 3 days',
          details: 'Yellowing indicates possible nutrient deficiency. Consider foliar application of balanced nutrients.'
        });
      } else if (analysisResult.healthStatus === 'fair') {
        recommendations.push({
          action: 'Adjust irrigation schedule',
          priority: 'medium',
          timeframe: 'Within 1 week',
          details: 'Signs of water stress detected. Review soil moisture levels and adjust irrigation accordingly.'
        });
      }
      
      // Create analytics record
      const analytics = new Analytics({
        field: crop.field,
        crop: cropId,
        type: 'image_analysis',
        data: {
          imageUrl,
          imageDate: imageDate || Date.now(),
          analysis: analysisResult
        },
        confidence: 80, // Fixed confidence for mock implementation
        recommendations,
        modelVersion: '1.0',
        source: 'crop-vision-api',
        status: 'completed',
        date: Date.now()
      });
      
      await analytics.save();
      
      res.json({
        analytics,
        analysis: analysisResult,
        recommendations
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/advanced-analytics/field/:fieldId/market-forecast
// @desc    Get market forecast for crops in a field
// @access  Private
router.get('/field/:fieldId/market-forecast', auth, async (req, res) => {
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
    
    // Get current crops in the field
    const crops = await Crop.find({ 
      field: fieldId,
      status: { $in: ['active', 'growing', 'mature'] }
    });
    
    if (crops.length === 0) {
      return res.status(404).json({ message: 'No active crops found in this field' });
    }
    
    // In a real implementation, this would call a market data API
    // Here we'll simulate market forecast data
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const forecasts = [];
    
    for (const crop of crops) {
      // Generate random market data
      const currentPrice = 100 + Math.random() * 200;
      const priceVolatility = Math.random() * 0.2;
      const demandTrend = Math.random() > 0.5 ? 'increasing' : 'decreasing';
      const supplyTrend = Math.random() > 0.5 ? 'increasing' : 'decreasing';
      
      // Calculate price forecast based on trends
      let forecastedPriceChange = 0;
      if (demandTrend === 'increasing' && supplyTrend === 'decreasing') {
        forecastedPriceChange = 0.1 + Math.random() * 0.2; // 10-30% increase
      } else if (demandTrend === 'decreasing' && supplyTrend === 'increasing') {
        forecastedPriceChange = -0.1 - Math.random() * 0.2; // 10-30% decrease
      } else if (demandTrend === 'increasing' && supplyTrend === 'increasing') {
        forecastedPriceChange = -0.05 + Math.random() * 0.1; // -5% to +5%
      } else {
        forecastedPriceChange = -0.1 + Math.random() * 0.1; // -10% to 0%
      }
      
      const forecastedPrice = currentPrice * (1 + forecastedPriceChange);
      
      // Generate market forecast
      const forecast = {
        crop: {
          id: crop._id,
          name: crop.name,
          type: crop.type,
          variety: crop.variety
        },
        currentMarket: {
          price: Math.round(currentPrice * 100) / 100,
          unit: 'USD/ton',
          volatility: Math.round(priceVolatility * 100) / 100,
          demandTrend,
          supplyTrend,
          lastUpdated: new Date()
        },
        forecast: {
          shortTerm: {
            price: Math.round(forecastedPrice * 100) / 100,
            priceChange: Math.round(forecastedPriceChange * 100),
            confidence: 70 + Math.random() * 20,
            period: '1-3 months'
          },
          longTerm: {
            trend: forecastedPriceChange > 0 ? 'upward' : 'downward',
            factors: [
              {
                name: 'Seasonal demand',
                impact: Math.random() > 0.5 ? 'positive' : 'negative',
                weight: Math.random() * 0.5
              },
              {
                name: 'Global supply',
                impact: Math.random() > 0.5 ? 'positive' : 'negative',
                weight: Math.random() * 0.5
              },
              {
                name: 'Weather patterns',
                impact: Math.random() > 0.5 ? 'positive' : 'negative',
                weight: Math.random() * 0.3
              }
            ],
            confidence: 60 + Math.random() * 20,
            period: '6-12 months'
          }
        }
      };
      
      // Generate recommendations based on forecast
      const recommendations = [];
      
      if (forecastedPriceChange > 0.15) {
        recommendations.push({
          action: 'Consider delayed selling',
          priority: 'medium',
          timeframe: 'Harvest time',
          details: 'Market forecast indicates significant price increase in the coming months. Consider storage options to sell when prices peak.'
        });
      } else if (forecastedPriceChange < -0.15) {
        recommendations.push({
          action: 'Consider forward contracts',
          priority: 'high',
          timeframe: 'Within 1 month',
          details: 'Market forecast indicates potential price decrease. Lock in current prices with forward contracts if available.'
        });
      }
      
      if (priceVolatility > 0.15) {
        recommendations.push({
          action: 'Implement price risk management',
          priority: 'medium',
          timeframe: 'Ongoing',
          details: 'High market volatility detected. Consider hedging strategies or diversifying sales timing.'
        });
      }
      
      forecasts.push({
        forecast,
        recommendations
      });
      
      // Create analytics record for this forecast
      const analytics = new Analytics({
        field: fieldId,
        crop: crop._id,
        type: 'market_forecast',
        data: {
          forecast,
          analysisDate: Date.now()
        },
        confidence: forecast.forecast.shortTerm.confidence,
        recommendations,
        modelVersion: '1.0',
        source: 'market-analytics-api',
        status: 'completed',
        date: Date.now()
      });
      
      await analytics.save();
    }
    
    res.json({
      fieldId,
      forecasts
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;