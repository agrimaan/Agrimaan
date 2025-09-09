const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const IoT = require('../models/IoT');
const auth = require('../middleware/auth');
const iotService = require('../services/iot.service');

// @route   POST api/iot-management/devices
// @desc    Register a new IoT device
// @access  Private
router.post(
  '/devices',
  [
    auth,
    [
      body('name', 'Name is required').not().isEmpty(),
      body('type', 'Type is required').not().isEmpty(),
      body('Fields', 'Fields ID is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, type, Fields, description, manufacturer, model, firmwareVersion } = req.body;
      
      // Create device data
      const deviceData = {
        name,
        type,
        Fields,
        description,
        manufacturer,
        model,
        firmwareVersion,
        owner: req.user.id
      };
      
      // Register device
      const device = await iotService.registerDevice(deviceData);
      
      res.json(device);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/iot-management/devices
// @desc    Get all devices for user
// @access  Private
router.get('/devices', auth, async (req, res) => {
  try {
    const devices = await iotService.getDevicesByOwner(req.user.id);
    res.json(devices);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/iot-management/devices/:id
// @desc    Get device by ID
// @access  Private
router.get('/devices/:id', auth, async (req, res) => {
  try {
    const device = await IoT.Device.findById(req.params.id);
    
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    
    // Check if user has access to this device
    if (device.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(device);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Device not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/iot-management/devices/:id
// @desc    Update device
// @access  Private
router.put(
  '/devices/:id',
  [
    auth,
    [
      body('name', 'Name is required').optional().not().isEmpty(),
      body('status', 'Status must be valid').optional().isIn(['registered', 'active', 'inactive', 'maintenance', 'decommissioned'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const device = await IoT.Device.findById(req.params.id);
      
      if (!device) {
        return res.status(404).json({ message: 'Device not found' });
      }
      
      // Check if user has access to this device
      if (device.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Update fields
      const { name, description, status, location } = req.body;
      
      if (name) device.name = name;
      if (description) device.description = description;
      if (status) device.status = status;
      if (location) device.location = location;
      
      await device.save();
      
      res.json(device);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Device not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   DELETE api/iot-management/devices/:id
// @desc    Delete device
// @access  Private
router.delete('/devices/:id', auth, async (req, res) => {
  try {
    const device = await IoT.Device.findById(req.params.id);
    
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    
    // Check if user has access to this device
    if (device.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await device.remove();
    
    res.json({ message: 'Device removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Device not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/iot-management/devices/:id/activate
// @desc    Activate device
// @access  Private
router.post('/devices/:id/activate', auth, async (req, res) => {
  try {
    const device = await IoT.Device.findById(req.params.id);
    
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    
    // Check if user has access to this device
    if (device.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Activate device
    await iotService.activateDevice(device.deviceId);
    
    res.json({ message: 'Device activated successfully' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Device not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/iot-management/devices/:id/deactivate
// @desc    Deactivate device
// @access  Private
router.post('/devices/:id/deactivate', auth, async (req, res) => {
  try {
    const device = await IoT.Device.findById(req.params.id);
    
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    
    // Check if user has access to this device
    if (device.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Deactivate device
    await iotService.deactivateDevice(device.deviceId);
    
    res.json({ message: 'Device deactivated successfully' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Device not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/iot-management/devices/:id/firmware
// @desc    Update device firmware
// @access  Private
router.post(
  '/devices/:id/firmware',
  [
    auth,
    [
      body('firmwareVersion', 'Firmware version is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const device = await IoT.Device.findById(req.params.id);
      
      if (!device) {
        return res.status(404).json({ message: 'Device not found' });
      }
      
      // Check if user has access to this device
      if (device.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Update firmware
      await iotService.updateFirmware(device.deviceId, req.body.firmwareVersion);
      
      res.json({ message: 'Firmware update initiated' });
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Device not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/iot-management/devices/:id/health
// @desc    Get device health history
// @access  Private
router.get('/devices/:id/health', auth, async (req, res) => {
  try {
    const device = await IoT.Device.findById(req.params.id);
    
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    
    // Check if user has access to this device
    if (device.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get health history
    const options = {
      limit: parseInt(req.query.limit) || 20,
      skip: parseInt(req.query.skip) || 0
    };
    
    const healthHistory = await iotService.getDeviceHealthHistory(device.deviceId, options);
    
    res.json(healthHistory);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Device not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/iot-management/sensors/:id/calibrate
// @desc    Calibrate a sensor
// @access  Private
router.post(
  '/sensors/:id/calibrate',
  [
    auth,
    [
      body('offset', 'Offset must be a number').isNumeric(),
      body('multiplier', 'Multiplier must be a number').isNumeric(),
      body('referenceValue', 'Reference value must be a number').isNumeric(),
      body('measuredValue', 'Measured value must be a number').isNumeric()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const sensor = await IoT.Sensor.findById(req.params.id);
      
      if (!sensor) {
        return res.status(404).json({ message: 'Sensor not found' });
      }
      
      // Check if user has access to this sensor
      const device = await IoT.Device.findById(sensor.device);
      
      if (!device || (device.owner.toString() !== req.user.id && req.user.role !== 'admin')) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Calibrate sensor
      const calibrationData = {
        offset: req.body.offset,
        multiplier: req.body.multiplier,
        referenceValue: req.body.referenceValue,
        measuredValue: req.body.measuredValue,
        userId: req.user.id
      };
      
      const calibratedSensor = await iotService.calibrateSensor(req.params.id, calibrationData);
      
      res.json(calibratedSensor);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Sensor not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/iot-management/Fields/:FieldsId/devices
// @desc    Get all devices for a Fields
// @access  Private
router.get('/Fields/:FieldsId/devices', auth, async (req, res) => {
  try {
    // Check if Fields exists and user has access
    const Fields = await mongoose.model('Fields').findById(req.params.FieldsId);
    
    if (!Fields) {
      return res.status(404).json({ message: 'Fields not found' });
    }
    
    if (Fields.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get devices for Fields
    const devices = await iotService.getDevicesByFields(req.params.FieldsId);
    
    res.json(devices);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Fields not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/iot-management/data
// @desc    Process sensor data (edge computing)
// @access  Private (API key auth)
router.post(
  '/data',
  async (req, res) => {
    try {
      // In a real implementation, this would use API key authentication
      // For now, we'll just check if the device ID exists
      const { deviceId, sensorData } = req.body;
      
      if (!deviceId || !sensorData || !Array.isArray(sensorData)) {
        return res.status(400).json({ message: 'Invalid request data' });
      }
      
      // Process sensor data
      const processedData = await iotService.processSensorData(deviceId, sensorData);
      
      res.json(processedData);
    } catch (err) {
      console.error(err.message);
      if (err.message === 'Device not found') {
        return res.status(404).json({ message: 'Device not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/iot-management/alerts
// @desc    Get all active alerts for user's devices
// @access  Private
router.get('/alerts', auth, async (req, res) => {
  try {
    // Get user's devices
    const devices = await iotService.getDevicesByOwner(req.user.id);
    const deviceIds = devices.map(device => device._id);
    
    // Get active alerts for these devices
    const alerts = await IoT.Alert.find({
      device: { $in: deviceIds },
      status: 'active'
    })
      .populate('sensor', 'name type')
      .populate('device', 'name type')
      .sort({ timestamp: -1 });
    
    res.json(alerts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/iot-management/alerts/:id
// @desc    Update alert status
// @access  Private
router.put(
  '/alerts/:id',
  [
    auth,
    [
      body('status', 'Status must be valid').isIn(['active', 'acknowledged', 'resolved'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const alert = await IoT.Alert.findById(req.params.id).populate('device', 'owner');
      
      if (!alert) {
        return res.status(404).json({ message: 'Alert not found' });
      }
      
      // Check if user has access to this alert's device
      if (alert.device.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Update alert status
      alert.status = req.body.status;
      
      if (req.body.status === 'acknowledged' || req.body.status === 'resolved') {
        alert.resolvedBy = req.user.id;
        alert.resolvedAt = new Date();
      }
      
      await alert.save();
      
      res.json(alert);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Alert not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;