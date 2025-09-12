const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const LandToken = require('../models/LandToken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/land-documents/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and documents are allowed'));
    }
  }
});

// @route   POST api/land-tokens
// @desc    Create a new land token
// @access  Private
router.post(
  '/',
  [
    auth,
    upload.array('documents', 10),
    [
      body('landDetails.area.value', 'Land area is required').isNumeric(),
      body('landDetails.area.unit', 'Area unit is required').isIn(['acres', 'hectares', 'square_meters', 'square_feet']),
      body('landDetails.location.address', 'Address is required').not().isEmpty(),
      body('landDetails.location.city', 'City is required').not().isEmpty(),
      body('landDetails.location.state', 'State is required').not().isEmpty(),
      body('tokenization.totalTokens', 'Total tokens must be a positive number').isInt({ min: 1 }),
      body('tokenization.tokenPrice', 'Token price must be a positive number').isFloat({ min: 0.01 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        landDetails,
        legalDocuments,
        tokenization,
        cropInformation,
        revenueSharing,
        terms
      } = req.body;

      // Generate unique land ID
      const landId = 'LAND-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();

      // Process uploaded documents
      const documents = [];
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          documents.push({
            type: file.fieldname.includes('title') ? 'title_deed' : 'other',
            fileName: file.filename,
            fileUrl: `/uploads/land-documents/${file.filename}`,
            uploadedAt: new Date()
          });
        });
      }

      // Create land token
      const landToken = new LandToken({
        landId,
        owner: req.user.id,
        landDetails: {
          ...landDetails,
          location: {
            ...landDetails.location,
            coordinates: landDetails.location.coordinates || {}
          }
        },
        legalDocuments: {
          ...legalDocuments,
          documents
        },
        tokenization: {
          ...tokenization,
          availableTokens: tokenization.totalTokens,
          soldTokens: 0,
          currency: tokenization.currency || 'INR'
        },
        cropInformation: cropInformation || {},
        revenueSharing: revenueSharing || { enabled: false },
        terms: terms || {},
        verification: {
          status: 'pending'
        },
        status: 'draft'
      });

      await landToken.save();

      // Populate owner information
      await landToken.populate('owner', 'name email role');

      res.status(201).json({
        message: 'Land token created successfully',
        landToken
      });

    } catch (error) {
      console.error('Create land token failed:', error);
      res.status(500).json({ message: 'Failed to create land token' });
    }
  }
);

// @route   GET api/land-tokens
// @desc    Get all land tokens with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      state,
      city,
      minPrice,
      maxPrice,
      landUse,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (state) filter['landDetails.location.state'] = new RegExp(state, 'i');
    if (city) filter['landDetails.location.city'] = new RegExp(city, 'i');
    if (landUse) filter['landDetails.landUse'] = landUse;
    
    if (minPrice || maxPrice) {
      filter['tokenization.tokenPrice'] = {};
      if (minPrice) filter['tokenization.tokenPrice'].$gte = parseFloat(minPrice);
      if (maxPrice) filter['tokenization.tokenPrice'].$lte = parseFloat(maxPrice);
    }

    // Only show active tokens for public view
    if (!req.user || req.user.role !== 'admin') {
      filter.status = 'active';
      filter['verification.status'] = 'verified';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const landTokens = await LandToken.find(filter)
      .populate('owner', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await LandToken.countDocuments(filter);

    res.json({
      landTokens,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get land tokens failed:', error);
    res.status(500).json({ message: 'Failed to get land tokens' });
  }
});

// @route   GET api/land-tokens/my
// @desc    Get current user's land tokens
// @access  Private
router.get('/my', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter = { owner: req.user.id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const landTokens = await LandToken.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await LandToken.countDocuments(filter);

    res.json({
      landTokens,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get my land tokens failed:', error);
    res.status(500).json({ message: 'Failed to get land tokens' });
  }
});

// @route   GET api/land-tokens/:id
// @desc    Get land token by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const landToken = await LandToken.findById(req.params.id)
      .populate('owner', 'name email role profileImage')
      .populate('investors.investor', 'name email role')
      .populate('verification.verifiedBy', 'name email');

    if (!landToken) {
      return res.status(404).json({ message: 'Land token not found' });
    }

    // Check if user can view this token
    if (landToken.status === 'draft' && (!req.user || req.user.id !== landToken.owner._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(landToken);

  } catch (error) {
    console.error('Get land token failed:', error);
    res.status(500).json({ message: 'Failed to get land token' });
  }
});

// @route   PUT api/land-tokens/:id
// @desc    Update land token
// @access  Private (Owner only)
router.put(
  '/:id',
  [
    auth,
    upload.array('documents', 10)
  ],
  async (req, res) => {
    try {
      const landToken = await LandToken.findById(req.params.id);

      if (!landToken) {
        return res.status(404).json({ message: 'Land token not found' });
      }

      // Check ownership
      if (landToken.owner.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Don't allow updates if token is active and has investors
      if (landToken.status === 'active' && landToken.investors.length > 0) {
        return res.status(400).json({ message: 'Cannot update active token with investors' });
      }

      const updates = req.body;

      // Process new uploaded documents
      if (req.files && req.files.length > 0) {
        const newDocuments = req.files.map(file => ({
          type: file.fieldname.includes('title') ? 'title_deed' : 'other',
          fileName: file.filename,
          fileUrl: `/uploads/land-documents/${file.filename}`,
          uploadedAt: new Date()
        }));

        if (updates.legalDocuments) {
          updates.legalDocuments.documents = [
            ...(landToken.legalDocuments.documents || []),
            ...newDocuments
          ];
        }
      }

      // Update available tokens if total tokens changed
      if (updates.tokenization?.totalTokens) {
        const soldTokens = landToken.tokenization.soldTokens || 0;
        updates.tokenization.availableTokens = updates.tokenization.totalTokens - soldTokens;
      }

      // Reset verification status if significant changes made
      const significantFields = ['landDetails', 'legalDocuments', 'tokenization'];
      const hasSignificantChanges = significantFields.some(field => updates[field]);
      
      if (hasSignificantChanges && landToken.verification.status === 'verified') {
        updates.verification = {
          status: 'pending',
          verifiedBy: undefined,
          verifiedAt: undefined,
          verificationNotes: undefined
        };
        updates.status = 'pending_approval';
      }

      const updatedLandToken = await LandToken.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
      ).populate('owner', 'name email role');

      res.json({
        message: 'Land token updated successfully',
        landToken: updatedLandToken
      });

    } catch (error) {
      console.error('Update land token failed:', error);
      res.status(500).json({ message: 'Failed to update land token' });
    }
  }
);

// @route   POST api/land-tokens/:id/invest
// @desc    Invest in land token
// @access  Private
router.post(
  '/:id/invest',
  [
    auth,
    [
      body('tokensToBuy', 'Number of tokens must be a positive integer').isInt({ min: 1 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { tokensToBuy } = req.body;
      const landToken = await LandToken.findById(req.params.id);

      if (!landToken) {
        return res.status(404).json({ message: 'Land token not found' });
      }

      // Check if token is available for investment
      if (landToken.status !== 'active') {
        return res.status(400).json({ message: 'Land token is not available for investment' });
      }

      if (landToken.verification.status !== 'verified') {
        return res.status(400).json({ message: 'Land token is not verified' });
      }

      // Check if enough tokens available
      if (tokensToBuy > landToken.tokenization.availableTokens) {
        return res.status(400).json({ 
          message: 'Not enough tokens available',
          availableTokens: landToken.tokenization.availableTokens
        });
      }

      // Check minimum/maximum purchase limits
      if (tokensToBuy < landToken.tokenization.minimumPurchase) {
        return res.status(400).json({ 
          message: `Minimum purchase is ${landToken.tokenization.minimumPurchase} tokens`
        });
      }

      if (landToken.tokenization.maximumPurchase && tokensToBuy > landToken.tokenization.maximumPurchase) {
        return res.status(400).json({ 
          message: `Maximum purchase is ${landToken.tokenization.maximumPurchase} tokens`
        });
      }

      // Check if user is not the owner
      if (landToken.owner.toString() === req.user.id) {
        return res.status(400).json({ message: 'Cannot invest in your own land token' });
      }

      const totalPrice = tokensToBuy * landToken.tokenization.tokenPrice;

      // Check if user already invested
      const existingInvestment = landToken.investors.find(
        inv => inv.investor.toString() === req.user.id
      );

      if (existingInvestment) {
        // Update existing investment
        existingInvestment.tokensOwned += tokensToBuy;
        existingInvestment.purchasePrice += totalPrice;
      } else {
        // Add new investment
        landToken.investors.push({
          investor: req.user.id,
          tokensOwned: tokensToBuy,
          purchasePrice: totalPrice,
          purchaseDate: new Date(),
          transactionHash: 'TXN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
        });
      }

      // Update token counts
      landToken.tokenization.soldTokens += tokensToBuy;
      landToken.tokenization.availableTokens -= tokensToBuy;

      // Check if fully sold
      if (landToken.tokenization.availableTokens === 0) {
        landToken.status = 'sold_out';
      }

      await landToken.save();

      // Update user's purchase history
      await User.findByIdAndUpdate(req.user.id, {
        $push: {
          purchaseHistory: {
            landTokenId: landToken._id,
            tokensOwned: tokensToBuy,
            purchasePrice: totalPrice,
            purchaseDate: new Date()
          }
        }
      });

      res.json({
        message: 'Investment successful',
        investment: {
          tokensOwned: tokensToBuy,
          totalPrice,
          remainingTokens: landToken.tokenization.availableTokens
        }
      });

    } catch (error) {
      console.error('Investment failed:', error);
      res.status(500).json({ message: 'Investment failed' });
    }
  }
);

// @route   POST api/land-tokens/:id/submit-for-approval
// @desc    Submit land token for admin approval
// @access  Private (Owner only)
router.post('/:id/submit-for-approval', auth, async (req, res) => {
  try {
    const landToken = await LandToken.findById(req.params.id);

    if (!landToken) {
      return res.status(404).json({ message: 'Land token not found' });
    }

    // Check ownership
    if (landToken.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if token is in draft status
    if (landToken.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft tokens can be submitted for approval' });
    }

    // Validate required fields
    const requiredFields = [
      'landDetails.area.value',
      'landDetails.location.address',
      'landDetails.location.city',
      'landDetails.location.state',
      'tokenization.totalTokens',
      'tokenization.tokenPrice'
    ];

    const missingFields = [];
    requiredFields.forEach(field => {
      const fieldValue = field.split('.').reduce((obj, key) => obj?.[key], landToken);
      if (!fieldValue) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        missingFields
      });
    }

    // Update status
    landToken.status = 'pending_approval';
    landToken.verification.status = 'under_review';
    await landToken.save();

    res.json({
      message: 'Land token submitted for approval successfully',
      status: landToken.status
    });

  } catch (error) {
    console.error('Submit for approval failed:', error);
    res.status(500).json({ message: 'Failed to submit for approval' });
  }
});

// @route   DELETE api/land-tokens/:id
// @desc    Delete land token
// @access  Private (Owner only, draft status only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const landToken = await LandToken.findById(req.params.id);

    if (!landToken) {
      return res.status(404).json({ message: 'Land token not found' });
    }

    // Check ownership
    if (landToken.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow deletion of draft tokens
    if (landToken.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft tokens can be deleted' });
    }

    await LandToken.findByIdAndDelete(req.params.id);

    res.json({ message: 'Land token deleted successfully' });

  } catch (error) {
    console.error('Delete land token failed:', error);
    res.status(500).json({ message: 'Failed to delete land token' });
  }
});

// @route   GET api/land-tokens/stats/overview
// @desc    Get land tokenization statistics
// @access  Public
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await LandToken.aggregate([
      {
        $group: {
          _id: null,
          totalTokens: { $sum: '$tokenization.totalTokens' },
          totalSoldTokens: { $sum: '$tokenization.soldTokens' },
          totalValue: { 
            $sum: { 
              $multiply: ['$tokenization.soldTokens', '$tokenization.tokenPrice'] 
            } 
          },
          totalLands: { $sum: 1 },
          activeLands: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          soldOutLands: {
            $sum: { $cond: [{ $eq: ['$status', 'sold_out'] }, 1, 0] }
          }
        }
      }
    ]);

    const stateStats = await LandToken.aggregate([
      { $match: { status: { $in: ['active', 'sold_out'] } } },
      {
        $group: {
          _id: '$landDetails.location.state',
          count: { $sum: 1 },
          totalArea: { $sum: '$landDetails.area.value' },
          totalValue: { 
            $sum: { 
              $multiply: ['$tokenization.soldTokens', '$tokenization.tokenPrice'] 
            } 
          }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      overview: stats[0] || {
        totalTokens: 0,
        totalSoldTokens: 0,
        totalValue: 0,
        totalLands: 0,
        activeLands: 0,
        soldOutLands: 0
      },
      stateStats
    });

  } catch (error) {
    console.error('Get stats failed:', error);
    res.status(500).json({ message: 'Failed to get statistics' });
  }
});

module.exports = router;