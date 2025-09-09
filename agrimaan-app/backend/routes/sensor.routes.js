const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Sensor = require('../models/Sensor');
const Fields = require('../models/Fields');
const auth = require('../middleware/auth');

// @route   GET api/sensors
// @desc    Get all sensors (filtered by Fields if provided)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // Filter by Fields if provided
    if (req.query.FieldsId) {
      query.Fields = req.query.FieldsId;
      
      // Check if user has access to this Fields
      const Fields = await Fields.findById(req.query.FieldsId);
      if (!Fields) {
        return res.status(404).json({ message: 'Fields not found' });
      }
      
      if (Fields.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (req.user.role !== 'admin') {
      // If no Fields is specified and user is not admin, get all sensors from user's fields
      const userfields = await Fields.find({ owner: req.user.id }).select('_id');
      const FieldsIds = userfields.map(Fields => Fields._id);
      query.Fields = { $in: FieldsIds };
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
      .populate('Fields', ['name', 'location'])
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
      .populate('Fields', ['name', 'location', 'owner']);
    
    if (!sensor) {
      return res.status(404).json({ message: 'Sensor not found' });
    }

    // Check if user has access to this sensor's Fields
    if (sensor.Fields.owner.toString() !== req.user.id && req.user.role !== 'admin') {
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
      body('Fields', 'Fields ID is required').not().isEmpty(),
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
        Fields: FieldsId,
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

      // Check if Fields exists and user has access
      const Fields = await Fields.findById(FieldsId);
      if (!Fields) {
        return res.status(404).json({ message: 'Fields not found' });
      }
      
      if (Fields.owner.toString() !== req.user.id && req.user.role !== 'admin') {
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
        Fields: FieldsId,
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

      // Add sensor to Fields's sensors array
      await Fields.findByIdAndUpdate(
        FieldsId,
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
      let sensor = await Sensor.findById(req.params.id).populate('Fields', 'owner');
      
      if (!sensor) {
        return res.status(404).json({ message: 'Sensor not found' });
      }

      // Check if user has access to this sensor's Fields
      if (sensor.Fields.owner.toString() !== req.user.id && req.user.role !== 'admin') {
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
    const sensor = await Sensor.findById(req.params.id).populate('Fields', 'owner');
    
    if (!sensor) {
      return res.status(404).json({ message: 'Sensor not found' });
    }

    // Check if user has access to this sensor's Fields
    if (sensor.Fields.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove sensor from Fields's sensors array
    await Fields.findByIdAndUpdate(
      sensor.Fields._id,
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
      const sensor = await Sensor.findById(req.params.id).populate('Fields', 'owner');
      
      if (!sensor) {
        return res.status(404).json({ message: 'Sensor not found' });
      }

      // Check if user has access to this sensor's Fields
      if (sensor.Fields.owner.toString() !== req.user.id && req.user.role !== 'admin') {
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
      const sensor = await Sensor.findById(req.params.id).populate('Fields', 'owner');
      
      if (!sensor) {
        return res.status(404).json({ message: 'Sensor not found' });
      }

      // Check if user has access to this sensor's Fields
      if (sensor.Fields.owner.toString() !== req.user.id && req.user.role !== 'admin') {
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
      const sensor = await Sensor.findById(req.params.id).populate('Fields', 'owner');
      
      if (!sensor) {
        return res.status(404).json({ message: 'Sensor not found' });
      }

      // Check if user has access to this sensor's Fields
      if (sensor.Fields.owner.toString() !== req.user.id && req.user.role !== 'admin') {
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
    .populate('Fields', ['name', 'owner']);

    // Filter sensors based on user role
    const filteredSensors = req.user.role === 'admin' 
      ? sensors 
      : sensors.filter(sensor => sensor.Fields.owner.toString() === req.user.id);

    res.json(filteredSensors);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;