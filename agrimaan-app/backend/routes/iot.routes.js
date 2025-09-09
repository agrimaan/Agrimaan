const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { IoTDevice, SensorReading, IoTAlert, MaintenanceLog, EdgeDevice } = require('../models/IoT');
const Fields = require('../models/Fields');
const auth = require('../middleware/auth');
const mqtt = require('mqtt');

// MQTT client setup (would be configured from environment variables in production)
// const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883');

// mqttClient.on('connect', () => {
//   console.log('Connected to MQTT broker');
//   mqttClient.subscribe('agrimaan/+/+/data'); // Subscribe to all device data topics
//   mqttClient.subscribe('agrimaan/+/+/status'); // Subscribe to all device status topics
// });

// mqttClient.on('message', async (topic, message) => {
//   try {
//     const topicParts = topic.split('/');
//     if (topicParts.length !== 4) return;
    
//     const FieldsId = topicParts[1];
//     const deviceId = topicParts[2];
//     const messageType = topicParts[3];
    
//     const messageData = JSON.parse(message.toString());
    
//     if (messageType === 'data') {
//       // Process sensor reading
//       await processSensorReading(deviceId, messageData);
//     } else if (messageType === 'status') {
//       // Process device status update
//       await processDeviceStatus(deviceId, messageData);
//     }
//   } catch (err) {
//     console.error('Error processing MQTT message:', err);
//   }
// });

// async function processSensorReading(deviceId, data) {
//   try {
//     const device = await IoTDevice.findOne({ deviceId });
//     if (!device) return;
    
//     const newReading = new SensorReading({
//       device: device._id,
//       readingType: data.type,
//       value: data.value,
//       unit: data.unit,
//       timestamp: data.timestamp || new Date(),
//       Fields: device.Fields,
//       metadata: data.metadata
//     });
    
//     await newReading.save();
    
//     // Check for threshold alerts
//     await checkThresholds(device, newReading);
//   } catch (err) {
//     console.error('Error processing sensor reading:', err);
//   }
// }

// async function processDeviceStatus(deviceId, data) {
//   try {
//     await IoTDevice.findOneAndUpdate(
//       { deviceId },
//       { 
//         status: data.status,
//         batteryLevel: data.batteryLevel,
//         lastConnected: new Date(),
//         metadata: { ...data.metadata }
//       }
//     );
    
//     // Check for battery alerts
//     if (data.batteryLevel < 20) {
//       const device = await IoTDevice.findOne({ deviceId });
//       if (!device) return;
      
//       const newAlert = new IoTAlert({
//         device: device._id,
//         Fields: device.Fields,
//         alertType: 'low_battery',
//         severity: data.batteryLevel < 10 ? 'high' : 'medium',
//         message: `Low battery (${data.batteryLevel}%) on device ${device.name}`,
//         value: data.batteryLevel
//       });
      
//       await newAlert.save();
//     }
//   } catch (err) {
//     console.error('Error processing device status:', err);
//   }
// }

// async function checkThresholds(device, reading) {
//   // This would contain logic to check reading values against thresholds
//   // and create alerts if thresholds are exceeded
// }

// @route   GET api/iot/devices
// @desc    Get all IoT devices for a user
// @access  Private
router.get('/devices', auth, async (req, res) => {
  try {
    let query = {};
    
    // If user is not admin, only show their devices
    if (req.user.role !== 'admin') {
      query.owner = req.user.id;
    }
    
    // Filter by Fields if provided
    if (req.query.FieldsId) {
      query.Fields = req.query.FieldsId;
    }
    
    // Filter by device type if provided
    if (req.query.deviceType) {
      query.deviceType = req.query.deviceType;
    }
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    const devices = await IoTDevice.find(query)
      .populate('Fields', ['name', 'location'])
      .sort({ createdAt: -1 });
    
    res.json(devices);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/iot/devices/:id
// @desc    Get IoT device by ID
// @access  Private
router.get('/devices/:id', auth, async (req, res) => {
  try {
    const device = await IoTDevice.findById(req.params.id)
      .populate('Fields', ['name', 'location', 'owner'])
      .populate('owner', ['name', 'email']);
    
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    
    // Check if user has access to this device
    if (device.owner._id.toString() !== req.user.id && req.user.role !== 'admin') {
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

// @route   POST api/iot/devices
// @desc    Register a new IoT device
// @access  Private
router.post(
  '/devices',
  [
    auth,
    [
      body('deviceId', 'Device ID is required').not().isEmpty(),
      body('name', 'Name is required').not().isEmpty(),
      body('deviceType', 'Device type is required').isIn([
        'soil_moisture_sensor',
        'temperature_sensor',
        'humidity_sensor',
        'rainfall_sensor',
        'light_sensor',
        'wind_sensor',
        'soil_nutrient_sensor',
        'water_level_sensor',
        'camera',
        'drone',
        'weather_station',
        'irrigation_controller',
        'other'
      ]),
      body('location.coordinates', 'Location coordinates are required').isArray().isLength({ min: 2, max: 2 }),
      body('Fields', 'Fields ID is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        deviceId,
        name,
        deviceType,
        manufacturer,
        model,
        firmwareVersion,
        location,
        Fields: FieldsId,
        installationDate,
        powerSource,
        connectionType,
        ipAddress,
        macAddress,
        configuration,
        metadata
      } = req.body;
      
      // Check if device ID already exists
      const existingDevice = await IoTDevice.findOne({ deviceId });
      if (existingDevice) {
        return res.status(400).json({ message: 'Device ID already exists' });
      }
      
      // Check if Fields exists and user has access
      const Fields = await Fields.findById(FieldsId);
      if (!Fields) {
        return res.status(404).json({ message: 'Fields not found' });
      }
      
      if (Fields.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied to this Fields' });
      }
      
      // Create new device
      const newDevice = new IoTDevice({
        deviceId,
        name,
        deviceType,
        manufacturer,
        model,
        firmwareVersion,
        owner: req.user.id,
        Fields: FieldsId,
        location,
        installationDate: installationDate || new Date(),
        powerSource: powerSource || 'battery',
        connectionType: connectionType || 'wifi',
        ipAddress,
        macAddress,
        status: 'active',
        lastConnected: new Date(),
        configuration,
        metadata
      });
      
      const device = await newDevice.save();
      
      res.json(device);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/iot/devices/:id
// @desc    Update an IoT device
// @access  Private
router.put(
  '/devices/:id',
  [
    auth,
    [
      body('name', 'Name is required').optional().not().isEmpty(),
      body('status', 'Status must be valid').optional().isIn(['active', 'inactive', 'maintenance', 'error', 'offline']),
      body('location.coordinates', 'Location coordinates must be an array').optional().isArray()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const device = await IoTDevice.findById(req.params.id);
      
      if (!device) {
        return res.status(404).json({ message: 'Device not found' });
      }
      
      // Check if user has access to this device
      if (device.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const {
        name,
        deviceType,
        manufacturer,
        model,
        firmwareVersion,
        location,
        Fields,
        status,
        batteryLevel,
        powerSource,
        connectionType,
        ipAddress,
        macAddress,
        configuration,
        metadata
      } = req.body;
      
      // Update fields if provided
      if (name) device.name = name;
      if (deviceType) device.deviceType = deviceType;
      if (manufacturer) device.manufacturer = manufacturer;
      if (model) device.model = model;
      if (firmwareVersion) device.firmwareVersion = firmwareVersion;
      if (location) device.location = location;
      if (Fields) {
        // Check if Fields exists and user has access
        const FieldsObj = await Fields.findById(Fields);
        if (!FieldsObj) {
          return res.status(404).json({ message: 'Fields not found' });
        }
        
        if (FieldsObj.owner.toString() !== req.user.id && req.user.role !== 'admin') {
          return res.status(403).json({ message: 'Access denied to this Fields' });
        }
        
        device.Fields = Fields;
      }
      if (status) device.status = status;
      if (batteryLevel !== undefined) device.batteryLevel = batteryLevel;
      if (powerSource) device.powerSource = powerSource;
      if (connectionType) device.connectionType = connectionType;
      if (ipAddress) device.ipAddress = ipAddress;
      if (macAddress) device.macAddress = macAddress;
      if (configuration) device.configuration = configuration;
      if (metadata) device.metadata = metadata;
      
      device.updatedAt = new Date();
      
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

// @route   DELETE api/iot/devices/:id
// @desc    Delete an IoT device
// @access  Private
router.delete('/devices/:id', auth, async (req, res) => {
  try {
    const device = await IoTDevice.findById(req.params.id);
    
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

// @route   GET api/iot/readings
// @desc    Get sensor readings
// @access  Private
router.get('/readings', auth, async (req, res) => {
  try {
    let query = {};
    
    // Filter by device if provided
    if (req.query.deviceId) {
      const device = await IoTDevice.findById(req.query.deviceId);
      if (!device) {
        return res.status(404).json({ message: 'Device not found' });
      }
      
      // Check if user has access to this device
      if (device.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      query.device = req.query.deviceId;
    } else if (req.query.FieldsId) {
      // Filter by Fields if provided
      const Fields = await Fields.findById(req.query.FieldsId);
      if (!Fields) {
        return res.status(404).json({ message: 'Fields not found' });
      }
      
      // Check if user has access to this Fields
      if (Fields.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      query.Fields = req.query.FieldsId;
    } else {
      // If no device or Fields specified, get readings from all devices owned by user
      if (req.user.role !== 'admin') {
        const userDevices = await IoTDevice.find({ owner: req.user.id }).select('_id');
        query.device = { $in: userDevices.map(device => device._id) };
      }
    }
    
    // Filter by reading type if provided
    if (req.query.readingType) {
      query.readingType = req.query.readingType;
    }
    
    // Filter by date range if provided
    if (req.query.startDate && req.query.endDate) {
      query.timestamp = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.startDate) {
      query.timestamp = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      query.timestamp = { $lte: new Date(req.query.endDate) };
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;
    
    const readings = await SensorReading.find(query)
      .populate('device', ['name', 'deviceType'])
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await SensorReading.countDocuments(query);
    
    res.json({
      readings,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/iot/readings
// @desc    Add a sensor reading
// @access  Private
router.post(
  '/readings',
  [
    auth,
    [
      body('deviceId', 'Device ID is required').not().isEmpty(),
      body('readingType', 'Reading type is required').isIn([
        'soil_moisture',
        'temperature',
        'humidity',
        'rainfall',
        'light',
        'wind_speed',
        'wind_direction',
        'soil_ph',
        'soil_nitrogen',
        'soil_phosphorus',
        'soil_potassium',
        'water_level',
        'image',
        'video',
        'other'
      ]),
      body('value', 'Value is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        deviceId,
        readingType,
        value,
        unit,
        timestamp,
        quality,
        location,
        metadata
      } = req.body;
      
      // Find device
      const device = await IoTDevice.findById(deviceId);
      if (!device) {
        return res.status(404).json({ message: 'Device not found' });
      }
      
      // Check if user has access to this device
      if (device.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Create new reading
      const newReading = new SensorReading({
        device: deviceId,
        readingType,
        value,
        unit,
        timestamp: timestamp || new Date(),
        quality: quality || 'good',
        location: location || device.location,
        Fields: device.Fields,
        metadata
      });
      
      const reading = await newReading.save();
      
      // Update device's last reading and connection time
      await IoTDevice.findByIdAndUpdate(deviceId, {
        lastConnected: new Date()
      });
      
      res.json(reading);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/iot/alerts
// @desc    Get IoT alerts
// @access  Private
router.get('/alerts', auth, async (req, res) => {
  try {
    let query = {};
    
    // If user is not admin, only show alerts for their devices/fields
    if (req.user.role !== 'admin') {
      const userDevices = await IoTDevice.find({ owner: req.user.id }).select('_id');
      const userfields = await Fields.find({ owner: req.user.id }).select('_id');
      
      query.$or = [
        { device: { $in: userDevices.map(device => device._id) } },
        { Fields: { $in: userfields.map(Fields => Fields._id) } }
      ];
    }
    
    // Filter by device if provided
    if (req.query.deviceId) {
      query.device = req.query.deviceId;
    }
    
    // Filter by Fields if provided
    if (req.query.FieldsId) {
      query.Fields = req.query.FieldsId;
    }
    
    // Filter by alert type if provided
    if (req.query.alertType) {
      query.alertType = req.query.alertType;
    }
    
    // Filter by severity if provided
    if (req.query.severity) {
      query.severity = req.query.severity;
    }
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by date range if provided
    if (req.query.startDate && req.query.endDate) {
      query.timestamp = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.startDate) {
      query.timestamp = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      query.timestamp = { $lte: new Date(req.query.endDate) };
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const alerts = await IoTAlert.find(query)
      .populate('device', ['name', 'deviceType'])
      .populate('Fields', ['name'])
      .populate('acknowledgedBy', ['name'])
      .populate('resolvedBy', ['name'])
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await IoTAlert.countDocuments(query);
    
    res.json({
      alerts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/iot/alerts
// @desc    Create an IoT alert
// @access  Private
router.post(
  '/alerts',
  [
    auth,
    [
      body('alertType', 'Alert type is required').isIn([
        'low_battery',
        'device_offline',
        'sensor_malfunction',
        'calibration_needed',
        'threshold_exceeded',
        'threshold_below',
        'connection_lost',
        'firmware_update',
        'security_alert',
        'other'
      ]),
      body('severity', 'Severity is required').isIn(['low', 'medium', 'high', 'critical']),
      body('message', 'Message is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        deviceId,
        FieldsId,
        alertType,
        severity,
        message,
        value,
        threshold,
        metadata,
        notificationChannels
      } = req.body;
      
      // Check if device exists and user has access
      let device = null;
      if (deviceId) {
        device = await IoTDevice.findById(deviceId);
        if (!device) {
          return res.status(404).json({ message: 'Device not found' });
        }
        
        if (device.owner.toString() !== req.user.id && req.user.role !== 'admin') {
          return res.status(403).json({ message: 'Access denied to this device' });
        }
      }
      
      // Check if Fields exists and user has access
      let Fields = null;
      if (FieldsId) {
        Fields = await Fields.findById(FieldsId);
        if (!Fields) {
          return res.status(404).json({ message: 'Fields not found' });
        }
        
        if (Fields.owner.toString() !== req.user.id && req.user.role !== 'admin') {
          return res.status(403).json({ message: 'Access denied to this Fields' });
        }
      }
      
      // Create new alert
      const newAlert = new IoTAlert({
        device: deviceId,
        Fields: FieldsId,
        alertType,
        severity,
        message,
        value,
        threshold,
        metadata,
        notificationChannels: notificationChannels || ['in_app']
      });
      
      const alert = await newAlert.save();
      
      // In a real implementation, we would send notifications here
      // based on the notificationChannels
      
      res.json(alert);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/iot/alerts/:id/acknowledge
// @desc    Acknowledge an alert
// @access  Private
router.put('/alerts/:id/acknowledge', auth, async (req, res) => {
  try {
    const alert = await IoTAlert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    // Check if alert is already acknowledged
    if (alert.status === 'acknowledged' || alert.status === 'resolved') {
      return res.status(400).json({ message: 'Alert is already acknowledged or resolved' });
    }
    
    // Check if user has access to this alert
    if (alert.device) {
      const device = await IoTDevice.findById(alert.device);
      if (device && device.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (alert.Fields) {
      const Fields = await Fields.findById(alert.Fields);
      if (Fields && Fields.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    // Update alert
    alert.status = 'acknowledged';
    alert.acknowledgedBy = req.user.id;
    alert.acknowledgedAt = new Date();
    
    await alert.save();
    
    res.json(alert);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Alert not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/iot/alerts/:id/resolve
// @desc    Resolve an alert
// @access  Private
router.put(
  '/alerts/:id/resolve',
  [
    auth,
    [
      body('resolutionNotes', 'Resolution notes are required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const alert = await IoTAlert.findById(req.params.id);
      
      if (!alert) {
        return res.status(404).json({ message: 'Alert not found' });
      }
      
      // Check if alert is already resolved
      if (alert.status === 'resolved') {
        return res.status(400).json({ message: 'Alert is already resolved' });
      }
      
      // Check if user has access to this alert
      if (alert.device) {
        const device = await IoTDevice.findById(alert.device);
        if (device && device.owner.toString() !== req.user.id && req.user.role !== 'admin') {
          return res.status(403).json({ message: 'Access denied' });
        }
      } else if (alert.Fields) {
        const Fields = await Fields.findById(alert.Fields);
        if (Fields && Fields.owner.toString() !== req.user.id && req.user.role !== 'admin') {
          return res.status(403).json({ message: 'Access denied' });
        }
      }
      
      const { resolutionNotes } = req.body;
      
      // Update alert
      alert.status = 'resolved';
      alert.resolvedBy = req.user.id;
      alert.resolvedAt = new Date();
      alert.resolutionNotes = resolutionNotes;
      
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

// @route   POST api/iot/maintenance
// @desc    Log device maintenance
// @access  Private
router.post(
  '/maintenance',
  [
    auth,
    [
      body('deviceId', 'Device ID is required').not().isEmpty(),
      body('maintenanceType', 'Maintenance type is required').isIn(['routine', 'repair', 'calibration', 'battery_replacement', 'firmware_update', 'other']),
      body('description', 'Description is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        deviceId,
        maintenanceType,
        description,
        actions,
        partsReplaced,
        beforeStatus,
        afterStatus,
        nextMaintenanceDue,
        cost,
        attachments,
        notes
      } = req.body;
      
      // Check if device exists and user has access
      const device = await IoTDevice.findById(deviceId);
      if (!device) {
        return res.status(404).json({ message: 'Device not found' });
      }
      
      if (device.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied to this device' });
      }
      
      // Create maintenance log
      const newMaintenanceLog = new MaintenanceLog({
        device: deviceId,
        maintenanceType,
        performedBy: req.user.id,
        description,
        actions,
        partsReplaced,
        beforeStatus: beforeStatus || device.status,
        afterStatus,
        nextMaintenanceDue,
        cost,
        attachments,
        notes
      });
      
      const maintenanceLog = await newMaintenanceLog.save();
      
      // Update device status and maintenance dates
      const updates = {
        lastMaintenance: new Date()
      };
      
      if (afterStatus) {
        updates.status = afterStatus;
      }
      
      if (nextMaintenanceDue) {
        updates.nextMaintenance = nextMaintenanceDue;
      }
      
      await IoTDevice.findByIdAndUpdate(deviceId, updates);
      
      res.json(maintenanceLog);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/iot/maintenance
// @desc    Get maintenance logs
// @access  Private
router.get('/maintenance', auth, async (req, res) => {
  try {
    let query = {};
    
    // Filter by device if provided
    if (req.query.deviceId) {
      query.device = req.query.deviceId;
      
      // Check if user has access to this device
      const device = await IoTDevice.findById(req.query.deviceId);
      if (device && device.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else {
      // If no device specified, get logs for all devices owned by user
      if (req.user.role !== 'admin') {
        const userDevices = await IoTDevice.find({ owner: req.user.id }).select('_id');
        query.device = { $in: userDevices.map(device => device._id) };
      }
    }
    
    // Filter by maintenance type if provided
    if (req.query.maintenanceType) {
      query.maintenanceType = req.query.maintenanceType;
    }
    
    // Filter by performed by if provided
    if (req.query.performedBy) {
      query.performedBy = req.query.performedBy;
    }
    
    // Filter by date range if provided
    if (req.query.startDate && req.query.endDate) {
      query.performedAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.startDate) {
      query.performedAt = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      query.performedAt = { $lte: new Date(req.query.endDate) };
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const maintenanceLogs = await MaintenanceLog.find(query)
      .populate('device', ['name', 'deviceType'])
      .populate('performedBy', ['name'])
      .sort({ performedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await MaintenanceLog.countDocuments(query);
    
    res.json({
      maintenanceLogs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/iot/analytics/Fields/:FieldsId
// @desc    Get analytics for a Fields
// @access  Private
router.get('/analytics/Fields/:FieldsId', auth, async (req, res) => {
  try {
    const FieldsId = req.params.FieldsId;
    
    // Check if Fields exists and user has access
    const Fields = await Fields.findById(FieldsId);
    if (!Fields) {
      return res.status(404).json({ message: 'Fields not found' });
    }
    
    if (Fields.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get all devices in the Fields
    const devices = await IoTDevice.find({ Fields: FieldsId });
    
    // Get readings for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const deviceIds = devices.map(device => device._id);
    
    // Get soil moisture readings
    const soilMoistureReadings = await SensorReading.find({
      device: { $in: deviceIds },
      readingType: 'soil_moisture',
      timestamp: { $gte: thirtyDaysAgo }
    }).sort({ timestamp: 1 });
    
    // Get temperature readings
    const temperatureReadings = await SensorReading.find({
      device: { $in: deviceIds },
      readingType: 'temperature',
      timestamp: { $gte: thirtyDaysAgo }
    }).sort({ timestamp: 1 });
    
    // Get rainfall readings
    const rainfallReadings = await SensorReading.find({
      device: { $in: deviceIds },
      readingType: 'rainfall',
      timestamp: { $gte: thirtyDaysAgo }
    }).sort({ timestamp: 1 });
    
    // Process readings for charts
    const soilMoistureData = processReadingsForChart(soilMoistureReadings);
    const temperatureData = processReadingsForChart(temperatureReadings);
    const rainfallData = processReadingsForChart(rainfallReadings);
    
    // Get active alerts
    const activeAlerts = await IoTAlert.find({
      Fields: FieldsId,
      status: { $in: ['active', 'acknowledged'] }
    }).sort({ timestamp: -1 });
    
    res.json({
      FieldsId,
      FieldsName: Fields.name,
      deviceCount: devices.length,
      soilMoistureData,
      temperatureData,
      rainfallData,
      activeAlerts
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Helper function to process readings for charts
function processReadingsForChart(readings) {
  // Group readings by day
  const readingsByDay = {};
  
  readings.forEach(reading => {
    const date = new Date(reading.timestamp);
    const day = date.toISOString().split('T')[0];
    
    if (!readingsByDay[day]) {
      readingsByDay[day] = [];
    }
    
    readingsByDay[day].push(reading.value);
  });
  
  // Calculate average for each day
  const chartData = {
    labels: [],
    values: []
  };
  
  Object.keys(readingsByDay).sort().forEach(day => {
    const values = readingsByDay[day];
    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = sum / values.length;
    
    chartData.labels.push(day);
    chartData.values.push(avg);
  });
  
  return chartData;
}

module.exports = router;