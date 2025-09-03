const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const User = require('../models/User');
const Crop = require('../models/Crop');
const auth = require('../middleware/auth');

// Middleware to check if user is a buyer
const isBuyer = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'buyer' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Buyer role required.' });
    }
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Middleware to check if user is a seller (farmer)
const isSeller = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'farmer' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Seller role required.' });
    }
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   POST api/orders
// @desc    Create a new order
// @access  Private/Buyer
router.post(
  '/',
  [
    auth,
    isBuyer,
    [
      body('seller', 'Seller is required').not().isEmpty(),
      body('items', 'Items are required').isArray({ min: 1 }),
      body('items.*.crop', 'Crop ID is required for each item').not().isEmpty(),
      body('items.*.quantity', 'Quantity is required for each item').isNumeric(),
      body('items.*.pricePerUnit', 'Price per unit is required for each item').isNumeric(),
      body('paymentMethod', 'Payment method is required').not().isEmpty(),
      body('shippingAddress', 'Shipping address is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { seller, items, paymentMethod, shippingAddress, notes } = req.body;

      // Calculate total amount
      let totalAmount = 0;
      for (const item of items) {
        totalAmount += item.quantity * item.pricePerUnit;
        
        // Verify crop exists and belongs to seller
        const crop = await Crop.findById(item.crop);
        if (!crop) {
          return res.status(404).json({ message: `Crop with ID ${item.crop} not found` });
        }
        
        // Check if crop is available for sale
        if (crop.status !== 'harvested') {
          return res.status(400).json({ message: `Crop ${crop.name} is not available for sale` });
        }
      }

      // Create new order
      const newOrder = new Order({
        buyer: req.user.id,
        seller,
        items,
        totalAmount,
        paymentMethod,
        shippingAddress,
        notes
      });

      const order = await newOrder.save();

      // Add order to buyer's purchase history
      await User.findByIdAndUpdate(
        req.user.id,
        { $push: { purchaseHistory: order._id } }
      );

      res.json(order);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/orders
// @desc    Get all orders for the current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    let orders;
    if (user.role === 'buyer') {
      // Buyers see their purchase orders
      orders = await Order.find({ buyer: req.user.id })
        .populate('seller', 'name email')
        .populate('items.crop', 'name variety');
    } else if (user.role === 'farmer') {
      // Farmers see orders for their crops
      orders = await Order.find({ seller: req.user.id })
        .populate('buyer', 'name email')
        .populate('items.crop', 'name variety');
    } else if (user.role === 'admin') {
      // Admins see all orders
      orders = await Order.find()
        .populate('buyer', 'name email')
        .populate('seller', 'name email')
        .populate('items.crop', 'name variety');
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .populate('items.crop', 'name variety');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is authorized to view this order
    if (
      order.buyer.toString() !== req.user.id && 
      order.seller.toString() !== req.user.id && 
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(order);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/orders/:id
// @desc    Update order status
// @access  Private/Seller or Admin
router.put(
  '/:id',
  [
    auth,
    [
      body('status', 'Status is required').isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const order = await Order.findById(req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Check if user is authorized to update this order
      if (order.seller.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const { status, trackingNumber, estimatedDeliveryDate } = req.body;
      
      // Update order fields
      order.status = status;
      if (trackingNumber) order.trackingNumber = trackingNumber;
      if (estimatedDeliveryDate) order.estimatedDeliveryDate = estimatedDeliveryDate;
      
      const updatedOrder = await order.save();
      
      res.json(updatedOrder);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/orders/:id/payment
// @desc    Update payment status
// @access  Private/Admin
router.put(
  '/:id/payment',
  [
    auth,
    [
      body('paymentStatus', 'Payment status is required').isIn(['pending', 'completed', 'failed', 'refunded']),
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Only admin can update payment status
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin role required.' });
      }
      
      const order = await Order.findById(req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      const { paymentStatus } = req.body;
      
      // Update payment status
      order.paymentStatus = paymentStatus;
      
      const updatedOrder = await order.save();
      
      res.json(updatedOrder);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;