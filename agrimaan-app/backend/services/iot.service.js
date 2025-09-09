const mongoose = require('mongoose');
const crypto = require('crypto');
const IoT = require('../models/IoT');
const notificationService = require('./notification.service');

/**
 * IoT service to handle device management and data processing
 */
class IoTService {
  /**
   * Register a new IoT device
   * @param {Object} deviceData - Device data
   * @returns {Promise<Object>} Registered device
   */
  async registerDevice(deviceData) {
    try {
      // Generate unique device ID if not provided
      if (!deviceData.deviceId) {
        deviceData.deviceId = `dev-${crypto.randomBytes(8).toString('hex')}`;
      }
      
      // Generate API key for device authentication
      const apiKey = crypto.randomBytes(32).toString('hex');
      
      // Create new device
      const device = new IoT.Device({
        ...deviceData,
        apiKey,
        status: 'registered',
        registrationDate: new Date()
      });
      
      return await device.save();
    } catch (error) {
      console.error('Error registering device:', error);
      throw new Error('Failed to register device');
    }
  }
  
  /**
   * Activate a device
   * @param {string} deviceId - Device ID
   * @returns {Promise<Object>} Activated device
   */
  async activateDevice(deviceId) {
    try {
      const device = await IoT.Device.findOne({ deviceId });
      
      if (!device) {
        throw new Error('Device not found');
      }
      
      device.status = 'active';
      device.activationDate = new Date();
      device.lastConnectionDate = new Date();
      
      return await device.save();
    } catch (error) {
      console.error('Error activating device:', error);
      throw new Error('Failed to activate device');
    }
  }
  
  /**
   * Deactivate a device
   * @param {string} deviceId - Device ID
   * @returns {Promise<Object>} Deactivated device
   */
  async deactivateDevice(deviceId) {
    try {
      const device = await IoT.Device.findOne({ deviceId });
      
      if (!device) {
        throw new Error('Device not found');
      }
      
      device.status = 'inactive';
      
      return await device.save();
    } catch (error) {
      console.error('Error deactivating device:', error);
      throw new Error('Failed to deactivate device');
    }
  }
  
  /**
   * Update device firmware
   * @param {string} deviceId - Device ID
   * @param {string} firmwareVersion - New firmware version
   * @returns {Promise<Object>} Updated device
   */
  async updateFirmware(deviceId, firmwareVersion) {
    try {
      const device = await IoT.Device.findOne({ deviceId });
      
      if (!device) {
        throw new Error('Device not found');
      }
      
      // Create firmware update record
      const firmwareUpdate = new IoT.FirmwareUpdate({
        device: device._id,
        previousVersion: device.firmwareVersion,
        newVersion: firmwareVersion,
        status: 'pending',
        initiatedAt: new Date()
      });
      
      await firmwareUpdate.save();
      
      // Update device with pending firmware update
      device.pendingFirmwareUpdate = firmwareUpdate._id;
      
      return await device.save();
    } catch (error) {
      console.error('Error updating firmware:', error);
      throw new Error('Failed to update firmware');
    }
  }
  
  /**
   * Complete firmware update
   * @param {string} deviceId - Device ID
   * @param {string} firmwareVersion - Installed firmware version
   * @param {boolean} success - Whether update was successful
   * @returns {Promise<Object>} Updated device
   */
  async completeFirmwareUpdate(deviceId, firmwareVersion, success) {
    try {
      const device = await IoT.Device.findOne({ deviceId }).populate('pendingFirmwareUpdate');
      
      if (!device) {
        throw new Error('Device not found');
      }
      
      if (!device.pendingFirmwareUpdate) {
        throw new Error('No pending firmware update');
      }
      
      // Update firmware update record
      const firmwareUpdate = await IoT.FirmwareUpdate.findById(device.pendingFirmwareUpdate._id);
      firmwareUpdate.status = success ? 'completed' : 'failed';
      firmwareUpdate.completedAt = new Date();
      
      if (success) {
        firmwareUpdate.installedVersion = firmwareVersion;
      } else {
        firmwareUpdate.errorMessage = 'Firmware update failed';
      }
      
      await firmwareUpdate.save();
      
      // Update device
      if (success) {
        device.firmwareVersion = firmwareVersion;
      }
      
      device.pendingFirmwareUpdate = null;
      device.lastConnectionDate = new Date();
      
      return await device.save();
    } catch (error) {
      console.error('Error completing firmware update:', error);
      throw new Error('Failed to complete firmware update');
    }
  }
  
  /**
   * Record device health check
   * @param {string} deviceId - Device ID
   * @param {Object} healthData - Health check data
   * @returns {Promise<Object>} Health check record
   */
  async recordHealthCheck(deviceId, healthData) {
    try {
      const device = await IoT.Device.findOne({ deviceId });
      
      if (!device) {
        throw new Error('Device not found');
      }
      
      // Create health check record
      const healthCheck = new IoT.HealthCheck({
        device: device._id,
        batteryLevel: healthData.batteryLevel,
        signalStrength: healthData.signalStrength,
        memoryUsage: healthData.memoryUsage,
        temperature: healthData.temperature,
        errors: healthData.errors || [],
        status: this.determineHealthStatus(healthData)
      });
      
      await healthCheck.save();
      
      // Update device with latest health check
      device.lastHealthCheck = healthCheck._id;
      device.lastConnectionDate = new Date();
      
      // Check if health status requires notification
      if (healthCheck.status === 'critical' || healthCheck.status === 'warning') {
        // Create notification for device owner
        await notificationService.createSensorNotification(
          device.owner,
          `Device Health Alert: ${device.name}`,
          `Your device ${device.name} has reported ${healthCheck.status} health status. Please check device details.`,
          device._id,
          device.Fields,
          {
            type: healthCheck.status === 'critical' ? 'error' : 'warning',
            priority: healthCheck.status === 'critical' ? 'high' : 'medium',
            actionRequired: true,
            actionLink: `/iot/devices/${device._id}`
          }
        );
      }
      
      await device.save();
      
      return healthCheck;
    } catch (error) {
      console.error('Error recording health check:', error);
      throw new Error('Failed to record health check');
    }
  }
  
  /**
   * Determine health status based on health data
   * @param {Object} healthData - Health check data
   * @returns {string} Health status
   */
  determineHealthStatus(healthData) {
    // Check for critical conditions
    if (
      healthData.batteryLevel < 10 ||
      healthData.signalStrength < 10 ||
      healthData.errors?.some(e => e.severity === 'critical') ||
      healthData.temperature > 80
    ) {
      return 'critical';
    }
    
    // Check for warning conditions
    if (
      healthData.batteryLevel < 30 ||
      healthData.signalStrength < 30 ||
      healthData.memoryUsage > 90 ||
      healthData.errors?.length > 0 ||
      healthData.temperature > 70
    ) {
      return 'warning';
    }
    
    // Check for moderate conditions
    if (
      healthData.batteryLevel < 50 ||
      healthData.signalStrength < 50 ||
      healthData.memoryUsage > 70 ||
      healthData.temperature > 60
    ) {
      return 'moderate';
    }
    
    // Otherwise healthy
    return 'healthy';
  }
  
  /**
   * Calibrate a sensor
   * @param {string} sensorId - Sensor ID
   * @param {Object} calibrationData - Calibration data
   * @returns {Promise<Object>} Calibrated sensor
   */
  async calibrateSensor(sensorId, calibrationData) {
    try {
      const sensor = await IoT.Sensor.findById(sensorId);
      
      if (!sensor) {
        throw new Error('Sensor not found');
      }
      
      // Create calibration record
      const calibration = new IoT.Calibration({
        sensor: sensor._id,
        previousOffset: sensor.calibrationOffset,
        previousMultiplier: sensor.calibrationMultiplier,
        newOffset: calibrationData.offset,
        newMultiplier: calibrationData.multiplier,
        calibratedBy: calibrationData.userId,
        referenceValue: calibrationData.referenceValue,
        measuredValue: calibrationData.measuredValue
      });
      
      await calibration.save();
      
      // Update sensor with new calibration values
      sensor.calibrationOffset = calibrationData.offset;
      sensor.calibrationMultiplier = calibrationData.multiplier;
      sensor.lastCalibrationDate = new Date();
      sensor.calibrationHistory.push(calibration._id);
      
      return await sensor.save();
    } catch (error) {
      console.error('Error calibrating sensor:', error);
      throw new Error('Failed to calibrate sensor');
    }
  }
  
  /**
   * Get device health history
   * @param {string} deviceId - Device ID
   * @param {Object} options - Query options
   * @returns {Promise<Array<Object>>} Health check history
   */
  async getDeviceHealthHistory(deviceId, options = {}) {
    try {
      const device = await IoT.Device.findOne({ deviceId });
      
      if (!device) {
        throw new Error('Device not found');
      }
      
      // Set up query
      const query = { device: device._id };
      
      // Set up pagination
      const limit = options.limit || 20;
      const skip = options.skip || 0;
      
      // Get health checks
      const healthChecks = await IoT.HealthCheck.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit);
      
      return healthChecks;
    } catch (error) {
      console.error('Error getting device health history:', error);
      throw new Error('Failed to get device health history');
    }
  }
  
  /**
   * Get devices by Fields
   * @param {string} FieldsId - Fields ID
   * @returns {Promise<Array<Object>>} Devices in Fields
   */
  async getDevicesByFields(FieldsId) {
    try {
      return await IoT.Device.find({ Fields: FieldsId });
    } catch (error) {
      console.error('Error getting devices by Fields:', error);
      throw new Error('Failed to get devices by Fields');
    }
  }
  
  /**
   * Get devices by owner
   * @param {string} ownerId - Owner ID
   * @returns {Promise<Array<Object>>} Devices owned by user
   */
  async getDevicesByOwner(ownerId) {
    try {
      return await IoT.Device.find({ owner: ownerId });
    } catch (error) {
      console.error('Error getting devices by owner:', error);
      throw new Error('Failed to get devices by owner');
    }
  }
  
  /**
   * Process sensor data with edge computing
   * @param {string} deviceId - Device ID
   * @param {Array<Object>} sensorData - Raw sensor data
   * @returns {Promise<Object>} Processed data
   */
  async processSensorData(deviceId, sensorData) {
    try {
      const device = await IoT.Device.findOne({ deviceId });
      
      if (!device) {
        throw new Error('Device not found');
      }
      
      // Update device last connection
      device.lastConnectionDate = new Date();
      await device.save();
      
      // Process each sensor reading
      const processedReadings = [];
      const anomalies = [];
      
      for (const reading of sensorData) {
        // Get sensor
        const sensor = await IoT.Sensor.findById(reading.sensorId);
        
        if (!sensor) {
          continue;
        }
        
        // Apply calibration if available
        let value = reading.value;
        if (sensor.calibrationMultiplier && sensor.calibrationOffset !== undefined) {
          value = value * sensor.calibrationMultiplier + sensor.calibrationOffset;
        }
        
        // Check for anomalies
        let isAnomaly = false;
        if (sensor.minThreshold !== undefined && value < sensor.minThreshold) {
          isAnomaly = true;
          anomalies.push({
            sensorId: sensor._id,
            sensorName: sensor.name,
            type: 'below_threshold',
            value,
            threshold: sensor.minThreshold,
            timestamp: reading.timestamp || new Date()
          });
        } else if (sensor.maxThreshold !== undefined && value > sensor.maxThreshold) {
          isAnomaly = true;
          anomalies.push({
            sensorId: sensor._id,
            sensorName: sensor.name,
            type: 'above_threshold',
            value,
            threshold: sensor.maxThreshold,
            timestamp: reading.timestamp || new Date()
          });
        }
        
        // Create sensor reading
        const sensorReading = new IoT.SensorReading({
          sensor: sensor._id,
          device: device._id,
          rawValue: reading.value,
          processedValue: value,
          timestamp: reading.timestamp || new Date(),
          metadata: reading.metadata || {},
          isAnomaly
        });
        
        await sensorReading.save();
        
        // Update sensor with latest reading
        sensor.lastReading = {
          value,
          timestamp: sensorReading.timestamp
        };
        await sensor.save();
        
        processedReadings.push({
          sensorId: sensor._id,
          sensorName: sensor.name,
          rawValue: reading.value,
          processedValue: value,
          timestamp: sensorReading.timestamp,
          isAnomaly
        });
      }
      
      // Create alerts for anomalies
      for (const anomaly of anomalies) {
        const alert = new IoT.Alert({
          sensor: anomaly.sensorId,
          device: device._id,
          type: anomaly.type,
          value: anomaly.value,
          threshold: anomaly.threshold,
          timestamp: anomaly.timestamp,
          status: 'active'
        });
        
        await alert.save();
        
        // Create notification for device owner
        await notificationService.createSensorNotification(
          device.owner,
          `Sensor Alert: ${anomaly.sensorName}`,
          `${anomaly.sensorName} has reported a value of ${anomaly.value} which is ${anomaly.type === 'above_threshold' ? 'above' : 'below'} the threshold of ${anomaly.threshold}.`,
          anomaly.sensorId,
          device.Fields,
          {
            type: 'warning',
            priority: 'high',
            actionRequired: true,
            actionLink: `/sensors/${anomaly.sensorId}`
          }
        );
      }
      
      return {
        deviceId,
        processedReadings,
        anomalies,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error processing sensor data:', error);
      throw new Error('Failed to process sensor data');
    }
  }
}

module.exports = new IoTService();