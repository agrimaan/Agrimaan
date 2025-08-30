const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Sensor = require('../models/Sensor');
const Field = require('../models/Field');
const auth = require('../middleware/auth');

// @route   GET api/sensors
// @desc    Get all sensors (filtered by field if provided)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // Filter by field if provided
    if (req.query.fieldId) {
      query.field = req.query.fieldId;
      
      // Check if user has access to this field
      const field = await Field.findById(req.query.fieldId);
      if (!field) {
        return res.status(404).json({ message: 'Field not found' });
      }
      
      if (field.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (req.user.role !== 'admin') {
      // If no field is specified and user is not admin, get all sensors from user's fields
      const userFields = await Field.find({ owner: req.user.id }).select('_id');
      const fieldIds = userFields.map(field => field._id);
      query.field = { $in: fieldIds };
    }
    
    // Filter by type if provided
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    const sensors = await Sensor.find(query)
      .populate('field', ['name', 'location'])
      .sort({ installationDate: -1 });
      
    res.json(sensors);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/sensors/:id
// @desc    Get sensor by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const sensor = await Sensor.findById(req.params.id)
      .populate('field', ['name', 'location', 'owner']);
    
    if (!sensor) {
      return res.status(404).json({ message: 'Sensor not found' });
    }

    // Check if user has access to this sensor's field
    if (sensor.field.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(sensor);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Sensor not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/sensors
// @desc    Create a sensor
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      body('name', 'Name is required').not().isEmpty(),
      body('type', 'Type is required').isIn(['soil_moisture', 'temperature', 'humidity', 'rainfall', 'light', 'wind', 'soil_nutrient', 'water_level', 'other']),
      body('field', 'Field ID is required').not().isEmpty(),
      body('location.coordinates', 'Location coordinates are required').isArray(),
      body('serialNumber', 'Serial number is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        name,
        type,
        field: fieldId,
        location,
        manufacturer,
        model,
        serialNumber,
        installationDate,
        batteryLevel,
        status,
        firmwareVersion,
        measurementUnit,
        measurementRange,
        accuracy,
        calibrationDate,
        dataTransmissionInterval,
        notes
      } = req.body;

      // Check if field exists and user has access
      const field = await Field.findById(fieldId);
      if (!field) {
        return res.status(404).json({ message: 'Field not found' });
      }
      
      if (field.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Check if sensor with same serial number already exists
      const existingSensor = await Sensor.findOne({ serialNumber });
      if (existingSensor) {
        return res.status(400).json({ message: 'Sensor with this serial number already exists' });
      }

      // Create new sensor
      const newSensor = new Sensor({
        name,
        type,
        field: fieldId,
        location,
        manufacturer,
        model,
        serialNumber,
        installationDate: installationDate || Date.now(),
        batteryLevel,
        status: status || 'active',
        firmwareVersion,
        measurementUnit,
        measurementRange,
        accuracy,
        calibrationDate,
        dataTransmissionInterval,
        notes
      });

      const sensor = await newSensor.save();

      // Add sensor to field's sensors array
      await Field.findByIdAndUpdate(
        fieldId,
        { $push: { sensors: sensor._id } },
        { new: true }
      );

      res.json(sensor);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/sensors/:id
// @desc    Update a sensor
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      body('name', 'Name is required').optional().not().isEmpty(),
      body('type', 'Type must be valid').optional().isIn(['soil_moisture', 'temperature', 'humidity', 'rainfall', 'light', 'wind', 'soil_nutrient', 'water_level', 'other']),
      body('location.coordinates', 'Location coordinates must be an array').optional().isArray(),
      body('status', 'Status must be valid').optional().isIn(['active', 'inactive', 'maintenance', 'error'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let sensor = await Sensor.findById(req.params.id).populate('field', 'owner');
      
      if (!sensor) {
        return res.status(404).json({ message: 'Sensor not found' });
      }

      // Check if user has access to this sensor's field
      if (sensor.field.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const {
        name,
        type,
        location,
        manufacturer,
        model,
        batteryLevel,
        status,
        lastMaintenance,
        nextMaintenance,
        firmwareVersion,
        measurementUnit,
        measurementRange,
        accuracy,
        calibrationDate,
        dataTransmissionInterval,
        notes
      } = req.body;

      // Update fields
      if (name) sensor.name = name;
      if (type) sensor.type = type;
      if (location) sensor.location = location;
      if (manufacturer) sensor.manufacturer = manufacturer;
      if (model) sensor.model = model;
      if (batteryLevel !== undefined) sensor.batteryLevel = batteryLevel;
      if (status) sensor.status = status;
      if (lastMaintenance) sensor.lastMaintenance = lastMaintenance;
      if (nextMaintenance) sensor.nextMaintenance = nextMaintenance;
      if (firmwareVersion) sensor.firmwareVersion = firmwareVersion;
      if (measurementUnit) sensor.measurementUnit = measurementUnit;
      if (measurementRange) sensor.measurementRange = measurementRange;
      if (accuracy !== undefined) sensor.accuracy = accuracy;
      if (calibrationDate) sensor.calibrationDate = calibrationDate;
      if (dataTransmissionInterval !== undefined) sensor.dataTransmissionInterval = dataTransmissionInterval;
      if (notes) sensor.notes = notes;

      await sensor.save();
      
      res.json(sensor);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Sensor not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   DELETE api/sensors/:id
// @desc    Delete a sensor
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const sensor = await Sensor.findById(req.params.id).populate('field', 'owner');
    
    if (!sensor) {
      return res.status(404).json({ message: 'Sensor not found' });
    }

    // Check if user has access to this sensor's field
    if (sensor.field.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove sensor from field's sensors array
    await Field.findByIdAndUpdate(
      sensor.field._id,
      { $pull: { sensors: sensor._id } }
    );

    await sensor.remove();
    
    res.json({ message: 'Sensor removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Sensor not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/sensors/:id/reading
// @desc    Add a reading to a sensor
// @access  Private
router.post(
  '/:id/reading',
  [
    auth,
    [
      body('value', 'Reading value is required').not().isEmpty(),
      body('timestamp', 'Timestamp must be valid').optional().isISO8601().toDate()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const sensor = await Sensor.findById(req.params.id).populate('field', 'owner');
      
      if (!sensor) {
        return res.status(404).json({ message: 'Sensor not found' });
      }

      // Check if user has access to this sensor's field
      if (sensor.field.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const { value, timestamp } = req.body;

      const newReading = {
        value,
        timestamp: timestamp || Date.now()
      };

      // Add to readings array
      sensor.readings.unshift(newReading);
      
      // Update last reading
      sensor.lastReading = {
        value,
        timestamp: timestamp || Date.now()
      };

      await sensor.save();
      
      res.json(sensor.readings);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Sensor not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/sensors/:id/alert
// @desc    Add an alert to a sensor
// @access  Private
router.post(
  '/:id/alert',
  [
    auth,
    [
      body('type', 'Alert type is required').isIn(['low_battery', 'out_of_range', 'connection_lost', 'malfunction', 'other']),
      body('message', 'Alert message is required').not().isEmpty(),
      body('timestamp', 'Timestamp must be valid').optional().isISO8601().toDate()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const sensor = await Sensor.findById(req.params.id).populate('field', 'owner');
      
      if (!sensor) {
        return res.status(404).json({ message: 'Sensor not found' });
      }

      // Check if user has access to this sensor's field
      if (sensor.field.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const { type, message, timestamp } = req.body;

      const newAlert = {
        type,
        message,
        timestamp: timestamp || Date.now(),
        resolved: false
      };

      sensor.alerts.unshift(newAlert);
      await sensor.save();
      
      res.json(sensor.alerts);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Sensor not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/sensors/:id/alert/:alertId
// @desc    Update an alert (mark as resolved)
// @access  Private
router.put(
  '/:id/alert/:alertId',
  auth,
  async (req, res) => {
    try {
      const sensor = await Sensor.findById(req.params.id).populate('field', 'owner');
      
      if (!sensor) {
        return res.status(404).json({ message: 'Sensor not found' });
      }

      // Check if user has access to this sensor's field
      if (sensor.field.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Find the alert
      const alert = sensor.alerts.id(req.params.alertId);
      if (!alert) {
        return res.status(404).json({ message: 'Alert not found' });
      }

      // Update alert
      alert.resolved = true;
      alert.resolvedAt = Date.now();

      await sensor.save();
      
      res.json(sensor.alerts);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Sensor or alert not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/sensors/nearby/:distance
// @desc    Get sensors near a location
// @access  Private
router.get('/nearby/:distance', auth, async (req, res) => {
  try {
    const { lng, lat } = req.query;
    const distance = parseInt(req.params.distance) || 1000; // distance in meters, default 1km

    if (!lng || !lat) {
      return res.status(400).json({ message: 'Longitude and latitude are required' });
    }

    // Find sensors near the given location
    const sensors = await Sensor.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: distance
        }
      }
    })
    .populate('field', ['name', 'owner']);

    // Filter sensors based on user role
    const filteredSensors = req.user.role === 'admin' 
      ? sensors 
      : sensors.filter(sensor => sensor.field.owner.toString() === req.user.id);

    res.json(filteredSensors);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;