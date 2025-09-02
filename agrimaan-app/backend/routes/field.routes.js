const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Field = require('../models/Field');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET api/fields
// @desc    Get all fields for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // If admin, can get all fields or filter by user
    if (req.user.role === 'admin' && req.query.userId) {
      const fields = await Field.find({ owner: req.query.userId })
        .populate('owner', ['name', 'email'])
        .populate('crops', ['name', 'status'])
        .populate('sensors', ['name', 'type', 'status']);
      return res.json(fields);
    } 
    // If admin requesting all fields
    else if (req.user.role === 'admin') {
      const fields = await Field.find()
        .populate('owner', ['name', 'email'])
        .populate('crops', ['name', 'status'])
        .populate('sensors', ['name', 'type', 'status']);
      return res.json(fields);
    }
    // Regular user can only get their own fields
    else {
      const fields = await Field.find({ owner: req.user.id })
        .populate('crops', ['name', 'status'])
        .populate('sensors', ['name', 'type', 'status']);
      return res.json(fields);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/fields/:id
// @desc    Get field by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const field = await Field.findById(req.params.id)
      .populate('owner', ['name', 'email'])
      .populate('crops', ['name', 'status', 'plantingDate', 'harvestDate'])
      .populate('sensors', ['name', 'type', 'status', 'lastReading']);
    
    if (!field) {
      return res.status(404).json({ message: 'Field not found' });
    }

    // Check if user is the owner or admin
    if (field.owner._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(field);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Field not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/fields
// @desc    Create a field
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      body('name', 'Name is required').not().isEmpty(),
      body('location.coordinates', 'Location coordinates are required').isArray(),
      body('area.value', 'Area value is required').isNumeric(),
      body('area.unit', 'Area unit is required').isIn(['hectare', 'acre']),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        name,
        location,
        area,
        soilType,
        irrigationSystem,
        notes,
      } = req.body;

      const newField = new Field({
        name,
        owner: req.user.id,
        location,
        area,
        soilType: soilType || 'other',
        irrigationSystem,
        notes,
      });
      const field = await newField.save();

      await User.findByIdAndUpdate(
        req.user.id,
        { $push: { fields: field._id } },
        { new: true }
      );

      res.json(field);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/fields/:id
// @desc    Update a field
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      body('name', 'Name is required').optional().not().isEmpty(),
      body('location.coordinates', 'Location coordinates must be an array').optional().isArray(),
      body('boundaries.coordinates', 'Field boundaries must be an array').optional().isArray(),
      body('area.value', 'Area value must be a number').optional().isNumeric(),
      body('area.unit', 'Area unit must be valid').optional().isIn(['hectare', 'acre']),
      body('soilType', 'Soil type must be valid').optional().isIn(['clay', 'sandy', 'loamy', 'silty', 'peaty', 'chalky', 'other'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let field = await Field.findById(req.params.id);
      
      if (!field) {
        return res.status(404).json({ message: 'Field not found' });
      }

      // Check if user is the owner or admin
      if (field.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const {
        name,
        location,
        boundaries,
        area,
        soilType,
        weather,
        irrigationSystem,
        notes
      } = req.body;

      // Update fields
      if (name) field.name = name;
      if (location) field.location = location;
      if (boundaries) field.boundaries = boundaries;
      if (area) field.area = area;
      if (soilType) field.soilType = soilType;
      if (weather) field.weather = weather;
      if (irrigationSystem) field.irrigationSystem = irrigationSystem;
      if (notes) field.notes = notes;

      await field.save();
      
      res.json(field);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Field not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   DELETE api/fields/:id
// @desc    Delete a field
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const field = await Field.findById(req.params.id);
    
    if (!field) {
      return res.status(404).json({ message: 'Field not found' });
    }

    // Check if user is the owner or admin
    if (field.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove field from user's fields array
    await User.findByIdAndUpdate(
      field.owner,
      { $pull: { fields: field._id } }
    );

    await field.remove();
    
    res.json({ message: 'Field removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Field not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/fields/nearby
// @desc    Get fields near a location
// @access  Private
router.get('/nearby/:distance', auth, async (req, res) => {
  try {
    const { lng, lat } = req.query;
    const distance = parseInt(req.params.distance) || 10000; // distance in meters, default 10km

    if (!lng || !lat) {
      return res.status(400).json({ message: 'Longitude and latitude are required' });
    }

    // Find fields near the given location
    const fields = await Field.find({
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
    .populate('owner', ['name', 'email'])
    .populate('crops', ['name', 'status']);

    // Filter fields based on user role
    const filteredFields = req.user.role === 'admin' 
      ? fields 
      : fields.filter(field => field.owner._id.toString() === req.user.id);

    res.json(filteredFields);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;