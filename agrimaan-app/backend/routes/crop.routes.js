const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Crop = require('../models/Crop');
const Fields = require('../models/Fields');
const auth = require('../middleware/auth');

// @route   GET api/crops
// @desc    Get all crops (filtered by Fields if provided)
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
      // If no Fields is specified and user is not admin, get all crops from user's fields
      const userfields = await Fields.find({ owner: req.user.id }).select('_id');
      const FieldsIds = userfields.map(Fields => Fields._id);
      query.Fields = { $in: FieldsIds };
    }
    
    const crops = await Crop.find(query)
      .populate('Fields', ['name', 'location', 'area'])
      .sort({ plantingDate: -1 });
      
    res.json(crops);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/crops/:id
// @desc    Get crop by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id)
      .populate('Fields', ['name', 'location', 'area', 'soilType', 'owner']);
    
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    // Check if user has access to this crop's Fields
    if (crop.Fields.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(crop);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Crop not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/crops
// @desc    Create a crop
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      body('name', 'Name is required').not().isEmpty(),
      body('Fields', 'Fields ID is required').not().isEmpty(),
      body('plantingDate', 'Planting date is required').isISO8601().toDate(),
      body('status', 'Status must be valid').optional().isIn(['planned', 'planted', 'growing', 'harvested', 'failed']),
      body('growthStage', 'Growth stage must be valid').optional().isIn(['germination', 'vegetative', 'flowering', 'ripening', 'mature'])
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
        Fields: FieldsId,
        variety,
        plantingDate,
        harvestDate,
        status,
        growthStage,
        expectedYield,
        healthStatus,
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

      // Create new crop
      const newCrop = new Crop({
        name,
        Fields: FieldsId,
        variety,
        plantingDate,
        harvestDate,
        status: status || 'planned',
        growthStage: growthStage || 'germination',
        expectedYield,
        healthStatus: healthStatus || 'good',
        notes
      });

      const crop = await newCrop.save();

      // Add crop to Fields's crops array
      await Fields.findByIdAndUpdate(
        FieldsId,
        { $push: { crops: crop._id } },
        { new: true }
      );

      res.json(crop);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/crops/:id
// @desc    Update a crop
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      body('name', 'Name is required').optional().not().isEmpty(),
      body('plantingDate', 'Planting date must be valid').optional().isISO8601().toDate(),
      body('harvestDate', 'Harvest date must be valid').optional().isISO8601().toDate(),
      body('status', 'Status must be valid').optional().isIn(['planned', 'planted', 'growing', 'harvested', 'failed']),
      body('growthStage', 'Growth stage must be valid').optional().isIn(['germination', 'vegetative', 'flowering', 'ripening', 'mature']),
      body('healthStatus', 'Health status must be valid').optional().isIn(['excellent', 'good', 'fair', 'poor', 'critical'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let crop = await Crop.findById(req.params.id).populate('Fields', 'owner');
      
      if (!crop) {
        return res.status(404).json({ message: 'Crop not found' });
      }

      // Check if user has access to this crop's Fields
      if (crop.Fields.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const {
        name,
        variety,
        plantingDate,
        harvestDate,
        status,
        growthStage,
        expectedYield,
        actualYield,
        healthStatus,
        pestIssues,
        diseaseIssues,
        fertilizers,
        irrigationEvents,
        notes,
        images
      } = req.body;

      // Update fields
      if (name) crop.name = name;
      if (variety) crop.variety = variety;
      if (plantingDate) crop.plantingDate = plantingDate;
      if (harvestDate) crop.harvestDate = harvestDate;
      if (status) crop.status = status;
      if (growthStage) crop.growthStage = growthStage;
      if (expectedYield) crop.expectedYield = expectedYield;
      if (actualYield) crop.actualYield = actualYield;
      if (healthStatus) crop.healthStatus = healthStatus;
      if (pestIssues) crop.pestIssues = pestIssues;
      if (diseaseIssues) crop.diseaseIssues = diseaseIssues;
      if (fertilizers) crop.fertilizers = fertilizers;
      if (irrigationEvents) crop.irrigationEvents = irrigationEvents;
      if (notes) crop.notes = notes;
      if (images) crop.images = images;

      await crop.save();
      
      res.json(crop);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Crop not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   DELETE api/crops/:id
// @desc    Delete a crop
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id).populate('Fields', 'owner');
    
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    // Check if user has access to this crop's Fields
    if (crop.Fields.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove crop from Fields's crops array
    await Fields.findByIdAndUpdate(
      crop.Fields._id,
      { $pull: { crops: crop._id } }
    );

    await crop.remove();
    
    res.json({ message: 'Crop removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Crop not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/crops/:id/pest-issue
// @desc    Add a pest issue to a crop
// @access  Private
router.post(
  '/:id/pest-issue',
  [
    auth,
    [
      body('type', 'Pest type is required').not().isEmpty(),
      body('severity', 'Severity must be valid').isIn(['low', 'medium', 'high']),
      body('detectedDate', 'Detection date must be valid').optional().isISO8601().toDate()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const crop = await Crop.findById(req.params.id).populate('Fields', 'owner');
      
      if (!crop) {
        return res.status(404).json({ message: 'Crop not found' });
      }

      // Check if user has access to this crop's Fields
      if (crop.Fields.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const { type, severity, detectedDate, treatment } = req.body;

      const newPestIssue = {
        type,
        severity,
        detectedDate: detectedDate || Date.now(),
        treatment
      };

      crop.pestIssues.unshift(newPestIssue);
      await crop.save();
      
      res.json(crop.pestIssues);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Crop not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/crops/:id/disease-issue
// @desc    Add a disease issue to a crop
// @access  Private
router.post(
  '/:id/disease-issue',
  [
    auth,
    [
      body('type', 'Disease type is required').not().isEmpty(),
      body('severity', 'Severity must be valid').isIn(['low', 'medium', 'high']),
      body('detectedDate', 'Detection date must be valid').optional().isISO8601().toDate()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const crop = await Crop.findById(req.params.id).populate('Fields', 'owner');
      
      if (!crop) {
        return res.status(404).json({ message: 'Crop not found' });
      }

      // Check if user has access to this crop's Fields
      if (crop.Fields.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const { type, severity, detectedDate, treatment } = req.body;

      const newDiseaseIssue = {
        type,
        severity,
        detectedDate: detectedDate || Date.now(),
        treatment
      };

      crop.diseaseIssues.unshift(newDiseaseIssue);
      await crop.save();
      
      res.json(crop.diseaseIssues);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Crop not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/crops/:id/fertilizer
// @desc    Add a fertilizer application to a crop
// @access  Private
router.post(
  '/:id/fertilizer',
  [
    auth,
    [
      body('name', 'Fertilizer name is required').not().isEmpty(),
      body('applicationDate', 'Application date must be valid').optional().isISO8601().toDate(),
      body('amount.value', 'Amount value must be a number').isNumeric(),
      body('amount.unit', 'Amount unit must be valid').isIn(['kg/ha', 'lb/acre'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const crop = await Crop.findById(req.params.id).populate('Fields', 'owner');
      
      if (!crop) {
        return res.status(404).json({ message: 'Crop not found' });
      }

      // Check if user has access to this crop's Fields
      if (crop.Fields.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const { name, applicationDate, amount, nutrientContent } = req.body;

      const newFertilizer = {
        name,
        applicationDate: applicationDate || Date.now(),
        amount,
        nutrientContent
      };

      crop.fertilizers.unshift(newFertilizer);
      await crop.save();
      
      res.json(crop.fertilizers);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Crop not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/crops/:id/irrigation
// @desc    Add an irrigation event to a crop
// @access  Private
router.post(
  '/:id/irrigation',
  [
    auth,
    [
      body('amount.value', 'Amount value must be a number').isNumeric(),
      body('amount.unit', 'Amount unit must be valid').isIn(['mm', 'inches']),
      body('method', 'Method must be valid').isIn(['drip', 'sprinkler', 'flood', 'center pivot', 'manual']),
      body('date', 'Date must be valid').optional().isISO8601().toDate()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const crop = await Crop.findById(req.params.id).populate('Fields', 'owner');
      
      if (!crop) {
        return res.status(404).json({ message: 'Crop not found' });
      }

      // Check if user has access to this crop's Fields
      if (crop.Fields.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const { amount, method, date, duration } = req.body;

      const newIrrigation = {
        amount,
        method,
        date: date || Date.now(),
        duration
      };

      crop.irrigationEvents.unshift(newIrrigation);
      await crop.save();
      
      res.json(crop.irrigationEvents);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Crop not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;