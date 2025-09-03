const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Field = require('../models/Field');
const Crop = require('../models/Crop');
const Sensor = require('../models/Sensor');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   GET api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private/Admin
router.get('/dashboard', [auth, admin], async (req, res) => {
  try {
    // Get counts for dashboard
    const userCount = await User.countDocuments();
    const fieldCount = await Field.countDocuments();
    const cropCount = await Crop.countDocuments();
    const sensorCount = await Sensor.countDocuments();
    const orderCount = await Order.countDocuments();
    
    // Get user counts by role
    const farmerCount = await User.countDocuments({ role: 'farmer' });
    const buyerCount = await User.countDocuments({ role: 'buyer' });
    const agronomistCount = await User.countDocuments({ role: 'agronomist' });
    const investorCount = await User.countDocuments({ role: 'investor' });
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('buyer', 'name')
      .populate('seller', 'name');
    
    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('-password');
    
    res.json({
      counts: {
        users: userCount,
        fields: fieldCount,
        crops: cropCount,
        sensors: sensorCount,
        orders: orderCount
      },
      usersByRole: {
        farmers: farmerCount,
        buyers: buyerCount,
        agronomists: agronomistCount,
        investors: investorCount,
        admins: adminCount
      },
      recentOrders,
      recentUsers
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/users
// @desc    Get all users with pagination and filtering
// @access  Private/Admin
router.get('/users', [auth, admin], async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    // Build filter
    const filter = {};
    if (role) {
      filter.role = role;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get users with pagination
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    // Get total count
    const total = await User.countDocuments(filter);
    
    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/admin/users
// @desc    Create a new user
// @access  Private/Admin
router.post(
  '/users',
  [
    auth,
    admin,
    [
      body('name', 'Name is required').not().isEmpty(),
      body('email', 'Please include a valid email').isEmail(),
      body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
      body('role', 'Role is required').isIn(['farmer', 'agronomist', 'admin', 'investor', 'buyer'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, phone, address } = req.body;

    try {
      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user
      user = new User({
        name,
        email,
        password,
        role,
        phone,
        address
      });

      await user.save();

      res.json({ message: 'User created successfully', user: { ...user.toObject(), password: undefined } });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/admin/users/:id
// @desc    Update a user
// @access  Private/Admin
router.put(
  '/users/:id',
  [
    auth,
    admin,
    [
      body('name', 'Name is required').optional().not().isEmpty(),
      body('email', 'Please include a valid email').optional().isEmail(),
      body('role', 'Role is required').optional().isIn(['farmer', 'agronomist', 'admin', 'investor', 'buyer'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { name, email, role, phone, address, isSystemAdmin } = req.body;

      // Update fields
      if (name) user.name = name;
      if (email) user.email = email;
      if (role) user.role = role;
      if (phone) user.phone = phone;
      if (address) user.address = address;
      if (isSystemAdmin !== undefined) user.isSystemAdmin = isSystemAdmin;

      await user.save();
      
      // Return user without password
      const updatedUser = await User.findById(req.params.id).select('-password');
      res.json(updatedUser);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   DELETE api/admin/users/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete('/users/:id', [auth, admin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deleting system admin
    if (user.isSystemAdmin) {
      return res.status(403).json({ message: 'Cannot delete system admin user' });
    }

    await user.remove();
    res.json({ message: 'User removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/admin/users/:id/reset-password
// @desc    Reset user password
// @access  Private/Admin
router.put(
  '/users/:id/reset-password',
  [
    auth,
    admin,
    [
      body('newPassword', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { newPassword } = req.body;

      // Update password
      user.password = newPassword;
      await user.save();
      
      res.json({ message: 'Password reset successfully' });
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/admin/fields
// @desc    Get all fields with pagination and filtering
// @access  Private/Admin
router.get('/fields', [auth, admin], async (req, res) => {
  try {
    const { page = 1, limit = 10, userId, search } = req.query;
    
    // Build filter
    const filter = {};
    if (userId) {
      filter.user = userId;
    }
    
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    
    // Get fields with pagination
    const fields = await Field.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    // Get total count
    const total = await Field.countDocuments(filter);
    
    res.json({
      fields,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/crops
// @desc    Get all crops with pagination and filtering
// @access  Private/Admin
router.get('/crops', [auth, admin], async (req, res) => {
  try {
    const { page = 1, limit = 10, userId, fieldId, status, search } = req.query;
    
    // Build filter
    const filter = {};
    if (userId) {
      filter.user = userId;
    }
    
    if (fieldId) {
      filter.field = fieldId;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { variety: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get crops with pagination
    const crops = await Crop.find(filter)
      .populate('user', 'name email')
      .populate('field', 'name location')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    // Get total count
    const total = await Crop.countDocuments(filter);
    
    res.json({
      crops,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/sensors
// @desc    Get all sensors with pagination and filtering
// @access  Private/Admin
router.get('/sensors', [auth, admin], async (req, res) => {
  try {
    const { page = 1, limit = 10, userId, fieldId, status, type, search } = req.query;
    
    // Build filter
    const filter = {};
    if (userId) {
      filter.user = userId;
    }
    
    if (fieldId) {
      filter.field = fieldId;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    
    // Get sensors with pagination
    const sensors = await Sensor.find(filter)
      .populate('user', 'name email')
      .populate('field', 'name location')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    // Get total count
    const total = await Sensor.countDocuments(filter);
    
    res.json({
      sensors,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/orders
// @desc    Get all orders with pagination and filtering
// @access  Private/Admin
router.get('/orders', [auth, admin], async (req, res) => {
  try {
    const { page = 1, limit = 10, buyerId, sellerId, status, paymentStatus, search } = req.query;
    
    // Build filter
    const filter = {};
    if (buyerId) {
      filter.buyer = buyerId;
    }
    
    if (sellerId) {
      filter.seller = sellerId;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }
    
    // Get orders with pagination
    const orders = await Order.find(filter)
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .populate('items.crop', 'name variety')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    // Get total count
    const total = await Order.countDocuments(filter);
    
    res.json({
      orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;