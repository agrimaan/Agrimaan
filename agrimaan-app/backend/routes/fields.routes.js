const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Fields = require('../models/Fields');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET api/fields
// @desc    Get all fields for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // If admin, can get all fields or filter by user
    if (req.user.role === 'admin' && req.query.userId) {
      const fields = await Fields.find({ owner: req.query.userId })
        .populate('owner', ['name', 'email'])
        .populate('crops', ['name', 'status'])
        .populate('sensors', ['name', 'type', 'status']);
      return res.json(fields);
    } 
    // If admin requesting all fields
    else if (req.user.role === 'admin') {
      const fields = await Fields.find()
        .populate('owner', ['name', 'email'])
        .populate('crops', ['name', 'status'])
        .populate('sensors', ['name', 'type', 'status']);
      return res.json(fields);
    }
    // Regular user can only get their own fields
    else {
      const fields = await Fields.find({ owner: req.user.id })
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
// @desc    Get Fields by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const Fields = await Fields.findById(req.params.id)
      .populate('owner', ['name', 'email'])
      .populate('crops', ['name', 'status', 'plantingDate', 'harvestDate'])
      .populate('sensors', ['name', 'type', 'status', 'lastReading']);
    
    if (!Fields) {
      return res.status(404).json({ message: 'Fields not found' });
    }

    // Check if user is the owner or admin
    if (Fields.owner._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(Fields);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Fields not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/fields
// @desc    Create a Fields
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      body('name', 'Name is required').not().isEmpty(),
      body('location.coordinates', 'Location coordinates are required').isArray(),
      body('boundaries.coordinates', 'Fields boundaries are required').isArray(),
      body('area.value', 'Area value is required').isNumeric(),
      body('area.unit', 'Area unit is required').isIn(['hectare', 'acre'])
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
        location,
        boundaries,
        area,
        soilType,
        weather,
        irrigationSystem,
        notes
      } = req.body;

      // Create new Fields
      const newFields = new Fields({
        name,
        owner: req.user.id,
        location,
        boundaries,
        area,
        soilType: soilType || 'other',
        weather,
        irrigationSystem,
        notes
      });

      const Fields = await newFields.save();

      // Add Fields to user's fields array
      await User.findByIdAndUpdate(
        req.user.id,
        { $push: { fields: Fields._id } },
        { new: true }
      );

      res.json(Fields);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/fields/:id
// @desc    Update a Fields
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      body('name', 'Name is required').optional().not().isEmpty(),
      body('location.coordinates', 'Location coordinates must be an array').optional().isArray(),
      body('boundaries.coordinates', 'Fields boundaries must be an array').optional().isArray(),
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
      let Fields = await Fields.findById(req.params.id);
      
      if (!Fields) {
        return res.status(404).json({ message: 'Fields not found' });
      }

      // Check if user is the owner or admin
      if (Fields.owner.toString() !== req.user.id && req.user.role !== 'admin') {
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
      if (name) Fields.name = name;
      if (location) Fields.location = location;
      if (boundaries) Fields.boundaries = boundaries;
      if (area) Fields.area = area;
      if (soilType) Fields.soilType = soilType;
      if (weather) Fields.weather = weather;
      if (irrigationSystem) Fields.irrigationSystem = irrigationSystem;
      if (notes) Fields.notes = notes;

      await Fields.save();
      
      res.json(Fields);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Fields not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   DELETE api/fields/:id
// @desc    Delete a Fields
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const Fields = await Fields.findById(req.params.id);
    
    if (!Fields) {
      return res.status(404).json({ message: 'Fields not found' });
    }

    // Check if user is the owner or admin
    if (Fields.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove Fields from user's fields array
    await User.findByIdAndUpdate(
      Fields.owner,
      { $pull: { fields: Fields._id } }
    );

    await Fields.remove();
    
    res.json({ message: 'Fields removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Fields not found' });
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
    const fields = await Fields.find({
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
    const filteredfields = req.user.role === 'admin' 
      ? fields 
      : fields.filter(Fields => Fields.owner._id.toString() === req.user.id);

    res.json(filteredfields);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;