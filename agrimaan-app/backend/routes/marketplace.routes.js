const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Crop = require('../models/Crop');

// Create a marketplace schema
const marketplaceSchema = new mongoose.Schema({
  cropName: {
    type: String,
    required: true,
    trim: true
  },
  variety: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  pricePerUnit: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerRating: {
    type: Number,
    default: 4.5 // Default rating for now
  },
  location: {
    type: String,
    required: true
  },
  harvestDate: {
    type: Date,
    required: true
  },
  listedDate: {
    type: Date,
    default: Date.now
  },
  quality: {
    type: String,
    enum: ['Premium', 'Organic', 'Grade A', 'Grade B'],
    default: 'Grade A'
  },
  description: {
    type: String
  },
  image: {
    type: String
  },
  status: {
    type: String,
    enum: ['Available', 'Sold', 'Reserved'],
    default: 'Available'
  },
  category: {
    type: String,
    enum: ['Grains', 'Vegetables', 'Fruits', 'Herbs'],
    required: true
  },
  userCropId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop'
  }
}, {
  timestamps: true
});

const MarketplaceItem = mongoose.model('MarketplaceItem', marketplaceSchema);

// @route   GET api/marketplace
// @desc    Get all marketplace items
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, status } = req.query;
    
    // Build query
    const query = {};
    if (category && category !== 'All') query.category = category;
    if (status && status !== 'All') query.status = status;
    
    // Get items
    const items = await MarketplaceItem.find(query)
      .populate('seller', 'name email')
      .sort({ listedDate: -1 });
    
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/marketplace/:id
// @desc    Get marketplace item by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id)
      .populate('seller', 'name email');
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json(item);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/marketplace
// @desc    Create a marketplace item
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      body('cropName', 'Crop name is required').not().isEmpty(),
      body('quantity', 'Quantity is required').isNumeric(),
      body('unit', 'Unit is required').not().isEmpty(),
      body('pricePerUnit', 'Price per unit is required').isNumeric(),
      body('harvestDate', 'Harvest date is required').not().isEmpty(),
      body('quality', 'Quality is required').isIn(['Premium', 'Organic', 'Grade A', 'Grade B']),
      body('category', 'Category is required').isIn(['Grains', 'Vegetables', 'Fruits', 'Herbs'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Calculate total price
      const totalPrice = req.body.quantity * req.body.pricePerUnit;
      
      // Create new marketplace item
      const newItem = new MarketplaceItem({
        cropName: req.body.cropName,
        variety: req.body.variety,
        quantity: req.body.quantity,
        unit: req.body.unit,
        pricePerUnit: req.body.pricePerUnit,
        totalPrice,
        seller: req.user.id,
        location: req.body.location || `${user.address?.city || ''}, ${user.address?.state || ''}`,
        harvestDate: req.body.harvestDate,
        quality: req.body.quality,
        description: req.body.description,
        image: req.body.image,
        category: req.body.category,
        userCropId: req.body.userCropId
      });
      
      const item = await newItem.save();
      
      // Populate seller info
      await item.populate('seller', 'name email');
      
      res.json(item);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/marketplace/:id
// @desc    Update a marketplace item
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      body('quantity', 'Quantity must be a number').optional().isNumeric(),
      body('pricePerUnit', 'Price per unit must be a number').optional().isNumeric(),
      body('quality', 'Quality must be valid').optional().isIn(['Premium', 'Organic', 'Grade A', 'Grade B']),
      body('status', 'Status must be valid').optional().isIn(['Available', 'Sold', 'Reserved']),
      body('category', 'Category must be valid').optional().isIn(['Grains', 'Vegetables', 'Fruits', 'Herbs'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let item = await MarketplaceItem.findById(req.params.id);
      
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }
      
      // Check if user owns the item
      if (item.seller.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Update fields
      const updatefields = {};
      for (const [key, value] of Object.entries(req.body)) {
        if (key !== 'seller' && key !== '_id') { // Don't allow changing seller or _id
          updatefields[key] = value;
        }
      }
      
      // Recalculate total price if quantity or pricePerUnit changed
      if (req.body.quantity || req.body.pricePerUnit) {
        const quantity = req.body.quantity || item.quantity;
        const pricePerUnit = req.body.pricePerUnit || item.pricePerUnit;
        updatefields.totalPrice = quantity * pricePerUnit;
      }
      
      // Update item
      item = await MarketplaceItem.findByIdAndUpdate(
        req.params.id,
        { $set: updatefields },
        { new: true }
      ).populate('seller', 'name email');
      
      res.json(item);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Item not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   DELETE api/marketplace/:id
// @desc    Delete a marketplace item
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Check if user owns the item
    if (item.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await item.remove();
    
    res.json({ message: 'Item removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/marketplace/my-listings
// @desc    Get all marketplace items for the current user
// @access  Private
router.get('/my-listings', auth, async (req, res) => {
  try {
    const items = await MarketplaceItem.find({ seller: req.user.id })
      .populate('seller', 'name email')
      .sort({ listedDate: -1 });
    
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/marketplace/featured
// @desc    Get featured marketplace items
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const items = await MarketplaceItem.find({ status: 'Available' })
      .populate('seller', 'name email')
      .sort({ listedDate: -1 })
      .limit(6);
    
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;