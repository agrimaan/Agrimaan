const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Analytics = require('../models/Analytics');
const Field = require('../models/Field');
const Crop = require('../models/Crop');
const Sensor = require('../models/Sensor');
const Weather = require('../models/Weather');
const auth = require('../middleware/auth');

// @route   GET api/analytics
// @desc    Get all analytics (filtered by field and/or type if provided)
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
      // If no field is specified and user is not admin, get all analytics from user's fields
      const userFields = await Field.find({ owner: req.user.id }).select('_id');
      const fieldIds = userFields.map(field => field._id);
      query.field = { $in: fieldIds };
    }
    
    // Filter by crop if provided
    if (req.query.cropId) {
      query.crop = req.query.cropId;
    }
    
    // Filter by type if provided
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    // Filter by date range if provided
    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.startDate) {
      query.date = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      query.date = { $lte: new Date(req.query.endDate) };
    }
    
    const analytics = await Analytics.find(query)
      .populate('field', ['name', 'location'])
      .populate('crop', ['name', 'status'])
      .sort({ date: -1 });
      
    res.json(analytics);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/analytics/:id
// @desc    Get analytics by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const analytics = await Analytics.findById(req.params.id)
      .populate('field', ['name', 'location', 'owner'])
      .populate('crop', ['name', 'status', 'plantingDate', 'harvestDate']);
    
    if (!analytics) {
      return res.status(404).json({ message: 'Analytics not found' });
    }

    // Check if user has access to this analytics' field
    if (analytics.field.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(analytics);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Analytics not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/analytics
// @desc    Create analytics
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      body('field', 'Field ID is required').not().isEmpty(),
      body('type', 'Type is required').isIn(['yield_prediction', 'pest_risk', 'disease_risk', 'irrigation_recommendation', 'fertilizer_recommendation', 'harvest_timing', 'planting_recommendation', 'other']),
      body('data', 'Data is required').not().isEmpty(),
      body('confidence', 'Confidence must be a number between 0 and 100').optional().isFloat({ min: 0, max: 100 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        field: fieldId,
        crop: cropId,
        type,
        data,
        confidence,
        factors,
        recommendations,
        modelVersion,
        source,
        status,
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

      // Check if crop exists and belongs to the field if provided
      if (cropId) {
        const crop = await Crop.findById(cropId);
        if (!crop) {
          return res.status(404).json({ message: 'Crop not found' });
        }
        
        if (crop.field.toString() !== fieldId) {
          return res.status(400).json({ message: 'Crop does not belong to the specified field' });
        }
      }

      // Create new analytics
      const newAnalytics = new Analytics({
        field: fieldId,
        crop: cropId,
        type,
        data,
        confidence,
        factors,
        recommendations,
        modelVersion,
        source,
        status: status || 'completed',
        notes,
        date: Date.now()
      });

      const analytics = await newAnalytics.save();
      
      res.json(analytics);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/analytics/:id
// @desc    Update analytics
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      body('data', 'Data is required').optional().not().isEmpty(),
      body('confidence', 'Confidence must be a number between 0 and 100').optional().isFloat({ min: 0, max: 100 }),
      body('status', 'Status must be valid').optional().isIn(['pending', 'processing', 'completed', 'failed'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let analytics = await Analytics.findById(req.params.id).populate('field', 'owner');
      
      if (!analytics) {
        return res.status(404).json({ message: 'Analytics not found' });
      }

      // Check if user has access to this analytics' field
      if (analytics.field.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const {
        data,
        confidence,
        factors,
        recommendations,
        modelVersion,
        source,
        status,
        notes
      } = req.body;

      // Update fields
      if (data) analytics.data = data;
      if (confidence !== undefined) analytics.confidence = confidence;
      if (factors) analytics.factors = factors;
      if (recommendations) analytics.recommendations = recommendations;
      if (modelVersion) analytics.modelVersion = modelVersion;
      if (source) analytics.source = source;
      if (status) analytics.status = status;
      if (notes) analytics.notes = notes;

      await analytics.save();
      
      res.json(analytics);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Analytics not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   DELETE api/analytics/:id
// @desc    Delete analytics
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const analytics = await Analytics.findById(req.params.id).populate('field', 'owner');
    
    if (!analytics) {
      return res.status(404).json({ message: 'Analytics not found' });
    }

    // Check if user has access to this analytics' field
    if (analytics.field.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await analytics.remove();
    
    res.json({ message: 'Analytics removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Analytics not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/analytics/field/:fieldId/summary
// @desc    Get analytics summary for a field
// @access  Private
router.get('/field/:fieldId/summary', auth, async (req, res) => {
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
    
    // Get latest analytics for each type
    const latestAnalytics = await Analytics.aggregate([
      { $match: { field: field._id } },
      { $sort: { date: -1 } },
      { $group: { 
        _id: '$type', 
        latestAnalytics: { $first: '$$ROOT' } 
      }},
      { $replaceRoot: { newRoot: '$latestAnalytics' } }
    ]);
    
    // Get sensor data summary
    const sensors = await Sensor.find({ field: fieldId });
    const sensorSummary = {
      count: sensors.length,
      types: {},
      status: {}
    };
    
    sensors.forEach(sensor => {
      // Count by type
      if (!sensorSummary.types[sensor.type]) {
        sensorSummary.types[sensor.type] = 0;
      }
      sensorSummary.types[sensor.type]++;
      
      // Count by status
      if (!sensorSummary.status[sensor.status]) {
        sensorSummary.status[sensor.status] = 0;
      }
      sensorSummary.status[sensor.status]++;
    });
    
    // Get crop data summary
    const crops = await Crop.find({ field: fieldId });
    const cropSummary = {
      count: crops.length,
      status: {},
      healthStatus: {}
    };
    
    crops.forEach(crop => {
      // Count by status
      if (!cropSummary.status[crop.status]) {
        cropSummary.status[crop.status] = 0;
      }
      cropSummary.status[crop.status]++;
      
      // Count by health status
      if (!cropSummary.healthStatus[crop.healthStatus]) {
        cropSummary.healthStatus[crop.healthStatus] = 0;
      }
      cropSummary.healthStatus[crop.healthStatus]++;
    });
    
    // Get latest weather data
    const latestWeather = await Weather.findOne({ field: fieldId }).sort({ date: -1 });
    
    // Compile summary
    const summary = {
      field: {
        id: field._id,
        name: field.name,
        area: field.area,
        soilType: field.soilType
      },
      analytics: latestAnalytics,
      sensors: sensorSummary,
      crops: cropSummary,
      weather: latestWeather
    };
    
    res.json(summary);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/analytics/crop/:cropId/predictions
// @desc    Get yield predictions for a crop
// @access  Private
router.get('/crop/:cropId/predictions', auth, async (req, res) => {
  try {
    const cropId = req.params.cropId;
    
    // Check if crop exists
    const crop = await Crop.findById(cropId).populate('field', 'owner');
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }
    
    // Check if user has access to this crop's field
    if (crop.field.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get yield predictions for the crop
    const predictions = await Analytics.find({
      crop: cropId,
      type: 'yield_prediction'
    }).sort({ date: -1 });
    
    res.json(predictions);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Crop not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/analytics/recommendations
// @desc    Get all recommendations for user's fields
// @access  Private
router.get('/recommendations', auth, async (req, res) => {
  try {
    // Get user's fields
    const userFields = await Field.find({ owner: req.user.id }).select('_id');
    const fieldIds = userFields.map(field => field._id);
    
    // Get analytics with recommendations
    const analyticsWithRecommendations = await Analytics.find({
      field: { $in: fieldIds },
      'recommendations.0': { $exists: true } // Has at least one recommendation
    })
    .populate('field', ['name', 'location'])
    .populate('crop', ['name', 'status'])
    .sort({ date: -1 });
    
    // Extract and format recommendations
    const recommendations = [];
    
    analyticsWithRecommendations.forEach(analytics => {
      analytics.recommendations.forEach(rec => {
        recommendations.push({
          id: rec._id,
          analyticsId: analytics._id,
          field: analytics.field,
          crop: analytics.crop,
          type: analytics.type,
          action: rec.action,
          priority: rec.priority,
          timeframe: rec.timeframe,
          details: rec.details,
          date: analytics.date
        });
      });
    });
    
    // Sort by priority
    const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
    recommendations.sort((a, b) => {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    res.json(recommendations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;