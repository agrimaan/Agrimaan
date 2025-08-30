const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Product, SupplyChainEvent, Shipment, MarketplaceListing, Order } = require('../models/SupplyChain');
const Field = require('../models/Field');
const Crop = require('../models/Crop');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

// Helper function to generate QR code
async function generateQRCode(data) {
  try {
    return await QRCode.toDataURL(JSON.stringify(data));
  } catch (err) {
    console.error('Error generating QR code:', err);
    return null;
  }
}

// @route   GET api/supplychain/products
// @desc    Get all products
// @access  Private
router.get('/products', auth, async (req, res) => {
  try {
    let query = {};
    
    // If user is not admin, only show their products
    if (req.user.role !== 'admin') {
      query.producer = req.user.id;
    }
    
    // Filter by category if provided
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by field if provided
    if (req.query.fieldId) {
      query['origin.field'] = req.query.fieldId;
    }
    
    // Filter by crop if provided
    if (req.query.cropId) {
      query.crop = req.query.cropId;
    }
    
    // Filter by certification if provided
    if (req.query.certification) {
      query['certifications.type'] = req.query.certification;
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const products = await Product.find(query)
      .populate('producer', ['name', 'email'])
      .populate('origin.field', ['name', 'location'])
      .populate('crop', ['name', 'variety'])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Product.countDocuments(query);
    
    res.json({
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/supplychain/products/:id
// @desc    Get product by ID
// @access  Private
router.get('/products/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('producer', ['name', 'email'])
      .populate('origin.field', ['name', 'location'])
      .populate('crop', ['name', 'variety', 'plantingDate', 'harvestDate']);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/supplychain/products
// @desc    Create a new product
// @access  Private
router.post(
  '/products',
  [
    auth,
    [
      body('name', 'Name is required').not().isEmpty(),
      body('category', 'Category is required').isIn(['grain', 'fruit', 'vegetable', 'dairy', 'meat', 'processed', 'other']),
      body('quantity.value', 'Quantity value is required').isNumeric(),
      body('quantity.unit', 'Quantity unit is required').not().isEmpty()
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
        description,
        category,
        origin,
        cropId,
        harvestDate,
        expiryDate,
        quantity,
        price,
        certifications,
        nutritionalInfo,
        images,
        batchNumber,
        lotNumber
      } = req.body;
      
      // Check if crop exists and user has access
      let crop = null;
      if (cropId) {
        crop = await Crop.findById(cropId).populate('field', 'owner');
        if (!crop) {
          return res.status(404).json({ message: 'Crop not found' });
        }
        
        if (crop.field.owner.toString() !== req.user.id && req.user.role !== 'admin') {
          return res.status(403).json({ message: 'Access denied to this crop' });
        }
      }
      
      // Check if field exists and user has access
      let field = null;
      if (origin && origin.field) {
        field = await Field.findById(origin.field);
        if (!field) {
          return res.status(404).json({ message: 'Field not found' });
        }
        
        if (field.owner.toString() !== req.user.id && req.user.role !== 'admin') {
          return res.status(403).json({ message: 'Access denied to this field' });
        }
      }
      
      // Generate unique product ID
      const productId = `PROD-${uuidv4().substring(0, 8).toUpperCase()}`;
      
      // Create new product
      const newProduct = new Product({
        productId,
        name,
        description,
        category,
        producer: req.user.id,
        origin: {
          field: field ? field._id : null,
          farm: origin ? origin.farm : null,
          country: origin ? origin.country : null,
          region: origin ? origin.region : null
        },
        crop: crop ? crop._id : null,
        harvestDate,
        expiryDate,
        quantity: {
          ...quantity,
          remainingValue: quantity.value
        },
        price,
        certifications,
        nutritionalInfo,
        images,
        batchNumber: batchNumber || `BATCH-${Date.now().toString(36).toUpperCase()}`,
        lotNumber: lotNumber || `LOT-${Date.now().toString(36).toUpperCase()}`,
        status: 'harvested'
      });
      
      const product = await newProduct.save();
      
      // Generate QR code for the product
      const qrData = {
        productId: product.productId,
        name: product.name,
        producer: req.user.name,
        category: product.category,
        harvestDate: product.harvestDate,
        verificationUrl: `${req.protocol}://${req.get('host')}/verify/${product.productId}`
      };
      
      const qrCodeUrl = await generateQRCode(qrData);
      
      if (qrCodeUrl) {
        product.qrCode = {
          url: qrCodeUrl,
          generatedAt: new Date()
        };
        
        await product.save();
      }
      
      // Create initial supply chain event (harvest)
      const eventId = `EVENT-${uuidv4().substring(0, 8).toUpperCase()}`;
      
      const newEvent = new SupplyChainEvent({
        eventId,
        product: product._id,
        eventType: 'harvest',
        location: field ? {
          type: 'Point',
          coordinates: field.location.coordinates,
          name: field.name
        } : null,
        actor: {
          user: req.user.id,
          name: req.user.name,
          role: req.user.role
        },
        data: {
          harvestDate,
          quantity: quantity.value,
          unit: quantity.unit
        }
      });
      
      await newEvent.save();
      
      res.json(product);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/supplychain/products/:id
// @desc    Update a product
// @access  Private
router.put(
  '/products/:id',
  [
    auth,
    [
      body('name', 'Name is required').optional().not().isEmpty(),
      body('category', 'Category must be valid').optional().isIn(['grain', 'fruit', 'vegetable', 'dairy', 'meat', 'processed', 'other']),
      body('status', 'Status must be valid').optional().isIn(['harvested', 'processing', 'packaged', 'in_transit', 'delivered', 'sold', 'recalled'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const product = await Product.findById(req.params.id);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Check if user is the producer or admin
      if (product.producer.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const {
        name,
        description,
        category,
        harvestDate,
        expiryDate,
        quantity,
        price,
        certifications,
        nutritionalInfo,
        images,
        status
      } = req.body;
      
      // Update fields if provided
      if (name) product.name = name;
      if (description) product.description = description;
      if (category) product.category = category;
      if (harvestDate) product.harvestDate = harvestDate;
      if (expiryDate) product.expiryDate = expiryDate;
      if (quantity) {
        product.quantity.value = quantity.value;
        product.quantity.unit = quantity.unit;
        product.quantity.remainingValue = quantity.remainingValue || quantity.value;
      }
      if (price) product.price = price;
      if (certifications) product.certifications = certifications;
      if (nutritionalInfo) product.nutritionalInfo = nutritionalInfo;
      if (images) product.images = images;
      if (status) product.status = status;
      
      product.updatedAt = new Date();
      
      await product.save();
      
      res.json(product);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   DELETE api/supplychain/products/:id
// @desc    Delete a product
// @access  Private
router.delete('/products/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if user is the producer or admin
    if (product.producer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Check if product can be deleted (only if no events except harvest)
    const eventsCount = await SupplyChainEvent.countDocuments({ 
      product: product._id,
      eventType: { $ne: 'harvest' }
    });
    
    if (eventsCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete product with supply chain events. Consider marking it as recalled instead.' 
      });
    }
    
    // Delete associated harvest event
    await SupplyChainEvent.deleteMany({ product: product._id });
    
    // Delete product
    await product.remove();
    
    res.json({ message: 'Product removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/supplychain/products/:id/blockchain
// @desc    Record product on blockchain
// @access  Private
router.post('/products/:id/blockchain', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if user is the producer or admin
    if (product.producer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Check if product is already on blockchain
    if (product.blockchainInfo.isTracked) {
      return res.status(400).json({ message: 'Product is already recorded on blockchain' });
    }
    
    // In a real implementation, we would interact with the blockchain here
    // For now, we'll simulate blockchain recording
    
    product.blockchainInfo = {
      isTracked: true,
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`, // Simulated hash
      contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`, // Simulated address
      tokenId: `${Math.floor(Math.random() * 1000000)}` // Simulated token ID
    };
    
    await product.save();
    
    res.json(product);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/supplychain/events
// @desc    Get supply chain events
// @access  Private
router.get('/events', auth, async (req, res) => {
  try {
    let query = {};
    
    // Filter by product if provided
    if (req.query.productId) {
      query.product = req.query.productId;
    }
    
    // Filter by event type if provided
    if (req.query.eventType) {
      query.eventType = req.query.eventType;
    }
    
    // Filter by actor if provided
    if (req.query.actorId) {
      query['actor.user'] = req.query.actorId;
    }
    
    // Filter by verification status if provided
    if (req.query.verificationStatus) {
      query.verificationStatus = req.query.verificationStatus;
    }
    
    // Filter by date range if provided
    if (req.query.startDate && req.query.endDate) {
      query.timestamp = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.startDate) {
      query.timestamp = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      query.timestamp = { $lte: new Date(req.query.endDate) };
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const events = await SupplyChainEvent.find(query)
      .populate('product', ['productId', 'name', 'category'])
      .populate('actor.user', ['name', 'email'])
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await SupplyChainEvent.countDocuments(query);
    
    res.json({
      events,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/supplychain/events/:id
// @desc    Get supply chain event by ID
// @access  Private
router.get('/events/:id', auth, async (req, res) => {
  try {
    const event = await SupplyChainEvent.findById(req.params.id)
      .populate('product', ['productId', 'name', 'category', 'producer'])
      .populate('actor.user', ['name', 'email'])
      .populate('previousEvent')
      .populate('nextEvent');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/supplychain/events
// @desc    Create a supply chain event
// @access  Private
router.post(
  '/events',
  [
    auth,
    [
      body('productId', 'Product ID is required').not().isEmpty(),
      body('eventType', 'Event type is required').isIn([
        'harvest',
        'processing',
        'packaging',
        'quality_check',
        'storage',
        'shipping',
        'receiving',
        'distribution',
        'retail_arrival',
        'sale',
        'recall',
        'other'
      ])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        productId,
        eventType,
        location,
        data,
        conditions,
        documents,
        notes,
        images
      } = req.body;
      
      // Find product
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Generate unique event ID
      const eventId = `EVENT-${uuidv4().substring(0, 8).toUpperCase()}`;
      
      // Find latest event for this product to set as previous event
      const latestEvent = await SupplyChainEvent.findOne({ product: productId })
        .sort({ timestamp: -1 });
      
      // Create new event
      const newEvent = new SupplyChainEvent({
        eventId,
        product: productId,
        eventType,
        location,
        actor: {
          user: req.user.id,
          name: req.user.name,
          role: req.user.role,
          organization: req.body.organization
        },
        data,
        conditions,
        documents,
        notes,
        images,
        previousEvent: latestEvent ? latestEvent._id : null
      });
      
      const event = await newEvent.save();
      
      // Update previous event's nextEvent reference
      if (latestEvent) {
        latestEvent.nextEvent = event._id;
        await latestEvent.save();
      }
      
      // Update product status based on event type
      let newStatus;
      switch (eventType) {
        case 'processing':
          newStatus = 'processing';
          break;
        case 'packaging':
          newStatus = 'packaged';
          break;
        case 'shipping':
          newStatus = 'in_transit';
          break;
        case 'receiving':
        case 'distribution':
        case 'retail_arrival':
          newStatus = 'delivered';
          break;
        case 'sale':
          newStatus = 'sold';
          break;
        case 'recall':
          newStatus = 'recalled';
          break;
      }
      
      if (newStatus) {
        product.status = newStatus;
        await product.save();
      }
      
      res.json(event);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/supplychain/events/:id/verify
// @desc    Verify a supply chain event
// @access  Private
router.post('/events/:id/verify', auth, async (req, res) => {
  try {
    const event = await SupplyChainEvent.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user has already verified this event
    const alreadyVerified = event.verifiedBy.some(
      verification => verification.user.toString() === req.user.id
    );
    
    if (alreadyVerified) {
      return res.status(400).json({ message: 'You have already verified this event' });
    }
    
    // Add verification
    event.verifiedBy.push({
      user: req.user.id,
      timestamp: new Date(),
      signature: `SIG-${uuidv4().substring(0, 16)}` // Simulated signature
    });
    
    // Update verification status if this is the first verification
    if (event.verificationStatus === 'pending' && event.verifiedBy.length === 1) {
      event.verificationStatus = 'verified';
    }
    
    await event.save();
    
    res.json(event);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/supplychain/events/:id/dispute
// @desc    Dispute a supply chain event
// @access  Private
router.post(
  '/events/:id/dispute',
  [
    auth,
    [
      body('reason', 'Reason for dispute is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const event = await SupplyChainEvent.findById(req.params.id);
      
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      const { reason } = req.body;
      
      // Update verification status
      event.verificationStatus = 'disputed';
      
      // Add dispute information to data
      if (!event.data) {
        event.data = {};
      }
      
      if (!event.data.disputes) {
        event.data.disputes = [];
      }
      
      event.data.disputes.push({
        user: req.user.id,
        reason,
        timestamp: new Date()
      });
      
      await event.save();
      
      res.json(event);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/supplychain/events/:id/blockchain
// @desc    Record event on blockchain
// @access  Private
router.post('/events/:id/blockchain', auth, async (req, res) => {
  try {
    const event = await SupplyChainEvent.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if event is already on blockchain
    if (event.blockchainInfo.isRecorded) {
      return res.status(400).json({ message: 'Event is already recorded on blockchain' });
    }
    
    // In a real implementation, we would interact with the blockchain here
    // For now, we'll simulate blockchain recording
    
    event.blockchainInfo = {
      isRecorded: true,
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`, // Simulated hash
      blockNumber: Math.floor(Math.random() * 10000000), // Simulated block number
      timestamp: new Date()
    };
    
    await event.save();
    
    res.json(event);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/supplychain/shipments
// @desc    Get shipments
// @access  Private
router.get('/shipments', auth, async (req, res) => {
  try {
    let query = {};
    
    // If user is not admin, only show shipments they're involved in
    if (req.user.role !== 'admin') {
      query.$or = [
        { 'sender.user': req.user.id },
        { 'receiver.user': req.user.id }
      ];
    }
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by product if provided
    if (req.query.productId) {
      query['products.product'] = req.query.productId;
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const shipments = await Shipment.find(query)
      .populate('products.product', ['productId', 'name', 'category'])
      .populate('sender.user', ['name', 'email'])
      .populate('receiver.user', ['name', 'email'])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Shipment.countDocuments(query);
    
    res.json({
      shipments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/supplychain/shipments/:id
// @desc    Get shipment by ID
// @access  Private
router.get('/shipments/:id', auth, async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id)
      .populate('products.product', ['productId', 'name', 'category'])
      .populate('sender.user', ['name', 'email'])
      .populate('receiver.user', ['name', 'email']);
    
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    // Check if user is involved in the shipment or is admin
    const isInvolved = 
      (shipment.sender.user && shipment.sender.user.toString() === req.user.id) ||
      (shipment.receiver.user && shipment.receiver.user.toString() === req.user.id);
    
    if (!isInvolved && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(shipment);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/supplychain/shipments
// @desc    Create a shipment
// @access  Private
router.post(
  '/shipments',
  [
    auth,
    [
      body('products', 'Products are required').isArray(),
      body('products.*.product', 'Product ID is required').not().isEmpty(),
      body('products.*.quantity.value', 'Quantity value is required').isNumeric(),
      body('products.*.quantity.unit', 'Quantity unit is required').not().isEmpty(),
      body('receiver', 'Receiver information is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        products,
        receiver,
        carrier,
        origin,
        destination,
        departureTime,
        arrivalTime,
        documents
      } = req.body;
      
      // Validate products and check ownership
      for (const item of products) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({ message: `Product ${item.product} not found` });
        }
        
        // Check if user owns the product
        if (product.producer.toString() !== req.user.id && req.user.role !== 'admin') {
          return res.status(403).json({ message: `Access denied to product ${item.product}` });
        }
        
        // Check if there's enough quantity available
        if (product.quantity.remainingValue < item.quantity.value) {
          return res.status(400).json({ 
            message: `Insufficient quantity for product ${product.name}. Available: ${product.quantity.remainingValue} ${product.quantity.unit}` 
          });
        }
      }
      
      // Generate unique shipment ID
      const shipmentId = `SHIP-${uuidv4().substring(0, 8).toUpperCase()}`;
      
      // Create new shipment
      const newShipment = new Shipment({
        shipmentId,
        products,
        sender: {
          user: req.user.id,
          name: req.user.name,
          organization: req.body.senderOrganization,
          address: req.body.senderAddress,
          contact: req.body.senderContact
        },
        receiver,
        carrier,
        origin,
        destination,
        currentLocation: origin,
        departureTime,
        arrivalTime,
        documents,
        status: 'preparing'
      });
      
      const shipment = await newShipment.save();
      
      // Update product quantities
      for (const item of products) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { 'quantity.remainingValue': -item.quantity.value },
          status: 'in_transit'
        });
        
        // Create supply chain event for shipping
        const eventId = `EVENT-${uuidv4().substring(0, 8).toUpperCase()}`;
        
        const newEvent = new SupplyChainEvent({
          eventId,
          product: item.product,
          eventType: 'shipping',
          timestamp: new Date(),
          location: origin,
          actor: {
            user: req.user.id,
            name: req.user.name,
            role: req.user.role
          },
          data: {
            shipmentId: shipment.shipmentId,
            quantity: item.quantity.value,
            unit: item.quantity.unit,
            destination: destination ? destination.name : null
          }
        });
        
        await newEvent.save();
      }
      
      res.json(shipment);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/supplychain/shipments/:id
// @desc    Update a shipment
// @access  Private
router.put(
  '/shipments/:id',
  [
    auth,
    [
      body('status', 'Status must be valid').optional().isIn(['preparing', 'in_transit', 'delivered', 'cancelled', 'delayed'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const shipment = await Shipment.findById(req.params.id);
      
      if (!shipment) {
        return res.status(404).json({ message: 'Shipment not found' });
      }
      
      // Check if user is involved in the shipment or is admin
      const isInvolved = 
        (shipment.sender.user && shipment.sender.user.toString() === req.user.id) ||
        (shipment.receiver.user && shipment.receiver.user.toString() === req.user.id);
      
      if (!isInvolved && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const {
        status,
        currentLocation,
        departureTime,
        arrivalTime,
        carrier,
        events
      } = req.body;
      
      // Update fields if provided
      if (status) {
        shipment.status = status;
        
        // If status is delivered, update product status
        if (status === 'delivered') {
          for (const item of shipment.products) {
            await Product.findByIdAndUpdate(item.product, {
              status: 'delivered'
            });
            
            // Create supply chain event for receiving
            const eventId = `EVENT-${uuidv4().substring(0, 8).toUpperCase()}`;
            
            const newEvent = new SupplyChainEvent({
              eventId,
              product: item.product,
              eventType: 'receiving',
              timestamp: new Date(),
              location: shipment.destination,
              actor: {
                user: req.user.id,
                name: req.user.name,
                role: req.user.role
              },
              data: {
                shipmentId: shipment.shipmentId,
                quantity: item.quantity.value,
                unit: item.quantity.unit
              }
            });
            
            await newEvent.save();
          }
        }
      }
      
      if (currentLocation) {
        shipment.currentLocation = {
          ...currentLocation,
          updatedAt: new Date()
        };
      }
      
      if (departureTime) shipment.departureTime = departureTime;
      if (arrivalTime) shipment.arrivalTime = arrivalTime;
      if (carrier) shipment.carrier = carrier;
      
      // Add new events if provided
      if (events && Array.isArray(events)) {
        events.forEach(event => {
          shipment.events.push({
            ...event,
            timestamp: event.timestamp || new Date()
          });
        });
      }
      
      shipment.updatedAt = new Date();
      
      await shipment.save();
      
      res.json(shipment);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Shipment not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/supplychain/marketplace
// @desc    Get marketplace listings
// @access  Private
router.get('/marketplace', auth, async (req, res) => {
  try {
    let query = { status: 'active' };
    
    // Filter by seller if provided
    if (req.query.sellerId) {
      query.seller = req.query.sellerId;
    }
    
    // Filter by category if provided
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Filter by certification if provided
    if (req.query.certification) {
      query['certifications.type'] = req.query.certification;
    }
    
    // Filter by price range if provided
    if (req.query.minPrice && req.query.maxPrice) {
      query['price.value'] = {
        $gte: parseFloat(req.query.minPrice),
        $lte: parseFloat(req.query.maxPrice)
      };
    } else if (req.query.minPrice) {
      query['price.value'] = { $gte: parseFloat(req.query.minPrice) };
    } else if (req.query.maxPrice) {
      query['price.value'] = { $lte: parseFloat(req.query.maxPrice) };
    }
    
    // Filter by location if provided
    if (req.query.lng && req.query.lat && req.query.distance) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(req.query.lng), parseFloat(req.query.lat)]
          },
          $maxDistance: parseInt(req.query.distance) * 1000 // Convert km to meters
        }
      };
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const listings = await MarketplaceListing.find(query)
      .populate('seller', ['name', 'email'])
      .populate('product', ['productId', 'name', 'category'])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await MarketplaceListing.countDocuments(query);
    
    res.json({
      listings,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/supplychain/marketplace/:id
// @desc    Get marketplace listing by ID
// @access  Private
router.get('/marketplace/:id', auth, async (req, res) => {
  try {
    const listing = await MarketplaceListing.findById(req.params.id)
      .populate('seller', ['name', 'email'])
      .populate('product', ['productId', 'name', 'category', 'description', 'images']);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Increment view count
    listing.views += 1;
    await listing.save();
    
    res.json(listing);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/supplychain/marketplace
// @desc    Create a marketplace listing
// @access  Private
router.post(
  '/marketplace',
  [
    auth,
    [
      body('title', 'Title is required').not().isEmpty(),
      body('category', 'Category is required').isIn(['grain', 'fruit', 'vegetable', 'dairy', 'meat', 'processed', 'other']),
      body('quantity.available.value', 'Quantity value is required').isNumeric(),
      body('quantity.available.unit', 'Quantity unit is required').not().isEmpty(),
      body('price.value', 'Price value is required').isNumeric(),
      body('price.currency', 'Price currency is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        title,
        description,
        category,
        productId,
        quantity,
        price,
        location,
        images,
        certifications,
        harvestDate,
        expiryDate,
        deliveryOptions,
        paymentOptions,
        visibility,
        expiresAt
      } = req.body;
      
      // Check if product exists and user has access
      let product = null;
      if (productId) {
        product = await Product.findById(productId);
        if (!product) {
          return res.status(404).json({ message: 'Product not found' });
        }
        
        if (product.producer.toString() !== req.user.id && req.user.role !== 'admin') {
          return res.status(403).json({ message: 'Access denied to this product' });
        }
        
        // Check if there's enough quantity available
        if (product.quantity.remainingValue < quantity.available.value) {
          return res.status(400).json({ 
            message: `Insufficient quantity for product ${product.name}. Available: ${product.quantity.remainingValue} ${product.quantity.unit}` 
          });
        }
      }
      
      // Generate unique listing ID
      const listingId = `LIST-${uuidv4().substring(0, 8).toUpperCase()}`;
      
      // Create new listing
      const newListing = new MarketplaceListing({
        listingId,
        seller: req.user.id,
        product: productId,
        title,
        description,
        category,
        quantity,
        price,
        location,
        images: images || (product ? product.images : []),
        certifications: certifications || (product ? product.certifications : []),
        harvestDate: harvestDate || (product ? product.harvestDate : null),
        expiryDate: expiryDate || (product ? product.expiryDate : null),
        deliveryOptions: deliveryOptions || [{ type: 'pickup', cost: { value: 0 } }],
        paymentOptions: paymentOptions || [{ type: 'cash' }, { type: 'agm_token' }],
        visibility: visibility || 'public',
        expiresAt: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days
      });
      
      const listing = await newListing.save();
      
      res.json(listing);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/supplychain/marketplace/:id
// @desc    Update a marketplace listing
// @access  Private
router.put(
  '/marketplace/:id',
  [
    auth,
    [
      body('title', 'Title is required').optional().not().isEmpty(),
      body('status', 'Status must be valid').optional().isIn(['active', 'pending', 'sold', 'cancelled', 'expired'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const listing = await MarketplaceListing.findById(req.params.id);
      
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
      
      // Check if user is the seller or admin
      if (listing.seller.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const {
        title,
        description,
        quantity,
        price,
        images,
        deliveryOptions,
        paymentOptions,
        status,
        visibility,
        expiresAt
      } = req.body;
      
      // Update fields if provided
      if (title) listing.title = title;
      if (description) listing.description = description;
      if (quantity) listing.quantity = quantity;
      if (price) listing.price = price;
      if (images) listing.images = images;
      if (deliveryOptions) listing.deliveryOptions = deliveryOptions;
      if (paymentOptions) listing.paymentOptions = paymentOptions;
      if (status) listing.status = status;
      if (visibility) listing.visibility = visibility;
      if (expiresAt) listing.expiresAt = expiresAt;
      
      listing.updatedAt = new Date();
      
      await listing.save();
      
      res.json(listing);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Listing not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   DELETE api/supplychain/marketplace/:id
// @desc    Delete a marketplace listing
// @access  Private
router.delete('/marketplace/:id', auth, async (req, res) => {
  try {
    const listing = await MarketplaceListing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Check if user is the seller or admin
    if (listing.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await listing.remove();
    
    res.json({ message: 'Listing removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/supplychain/marketplace/:id/favorite
// @desc    Add/remove listing from favorites
// @access  Private
router.post('/marketplace/:id/favorite', auth, async (req, res) => {
  try {
    const listing = await MarketplaceListing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Check if user has already favorited this listing
    const alreadyFavorited = listing.favoriteUsers.some(
      userId => userId.toString() === req.user.id
    );
    
    if (alreadyFavorited) {
      // Remove from favorites
      listing.favoriteUsers = listing.favoriteUsers.filter(
        userId => userId.toString() !== req.user.id
      );
      listing.favorites -= 1;
    } else {
      // Add to favorites
      listing.favoriteUsers.push(req.user.id);
      listing.favorites += 1;
    }
    
    await listing.save();
    
    res.json({
      favorites: listing.favorites,
      isFavorited: !alreadyFavorited
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/supplychain/orders
// @desc    Create an order
// @access  Private
router.post(
  '/orders',
  [
    auth,
    [
      body('listingId', 'Listing ID is required').not().isEmpty(),
      body('quantity.value', 'Quantity value is required').isNumeric(),
      body('quantity.unit', 'Quantity unit is required').not().isEmpty(),
      body('paymentMethod.type', 'Payment method is required').isIn(['cash', 'bank_transfer', 'credit_card', 'agm_token', 'other']),
      body('delivery.method', 'Delivery method is required').isIn(['pickup', 'delivery', 'shipping'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        listingId,
        quantity,
        paymentMethod,
        delivery,
        notes
      } = req.body;
      
      // Find listing
      const listing = await MarketplaceListing.findById(listingId);
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
      
      // Check if listing is active
      if (listing.status !== 'active') {
        return res.status(400).json({ message: 'Listing is not active' });
      }
      
      // Check if there's enough quantity available
      if (listing.quantity.available.value < quantity.value) {
        return res.status(400).json({ 
          message: `Insufficient quantity available. Available: ${listing.quantity.available.value} ${listing.quantity.available.unit}` 
        });
      }
      
      // Check if buyer is not the seller
      if (listing.seller.toString() === req.user.id) {
        return res.status(400).json({ message: 'You cannot buy your own listing' });
      }
      
      // Calculate total amount
      const subtotal = listing.price.value * quantity.value;
      
      // Calculate shipping cost
      let shippingCost = 0;
      if (delivery.method !== 'pickup') {
        const deliveryOption = listing.deliveryOptions.find(option => option.type === delivery.method);
        if (deliveryOption && deliveryOption.cost) {
          shippingCost = deliveryOption.cost.value;
        }
      }
      
      // Generate unique order ID
      const orderId = `ORD-${uuidv4().substring(0, 8).toUpperCase()}`;
      
      // Create new order
      const newOrder = new Order({
        orderId,
        buyer: req.user.id,
        seller: listing.seller,
        listing: listingId,
        products: [{
          product: listing.product,
          quantity: {
            value: quantity.value,
            unit: quantity.unit
          },
          price: {
            value: listing.price.value,
            currency: listing.price.currency
          }
        }],
        totalAmount: {
          subtotal: {
            value: subtotal,
            currency: listing.price.currency
          },
          shipping: {
            value: shippingCost,
            currency: listing.price.currency
          },
          total: {
            value: subtotal + shippingCost,
            currency: listing.price.currency
          }
        },
        paymentMethod: {
          type: paymentMethod.type,
          status: 'pending'
        },
        delivery: {
          method: delivery.method,
          address: delivery.address,
          contact: delivery.contact,
          status: 'pending'
        },
        notes: {
          buyer: notes ? notes.buyer : null
        },
        events: [{
          type: 'order_placed',
          timestamp: new Date(),
          description: 'Order placed by buyer',
          actor: req.user.id
        }]
      });
      
      const order = await newOrder.save();
      
      // Update listing quantity
      listing.quantity.available.value -= quantity.value;
      
      // If quantity is now 0, mark listing as sold
      if (listing.quantity.available.value <= 0) {
        listing.status = 'sold';
      }
      
      await listing.save();
      
      res.json(order);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/supplychain/orders
// @desc    Get orders
// @access  Private
router.get('/orders', auth, async (req, res) => {
  try {
    let query = {};
    
    // If user is not admin, only show orders they're involved in
    if (req.user.role !== 'admin') {
      query.$or = [
        { buyer: req.user.id },
        { seller: req.user.id }
      ];
    }
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by role (buyer/seller)
    if (req.query.role === 'buyer') {
      query.buyer = req.user.id;
    } else if (req.query.role === 'seller') {
      query.seller = req.user.id;
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const orders = await Order.find(query)
      .populate('buyer', ['name', 'email'])
      .populate('seller', ['name', 'email'])
      .populate('listing', ['title', 'images'])
      .populate('products.product', ['productId', 'name', 'category'])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Order.countDocuments(query);
    
    res.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/supplychain/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/orders/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', ['name', 'email'])
      .populate('seller', ['name', 'email'])
      .populate('listing', ['title', 'images', 'description'])
      .populate('products.product', ['productId', 'name', 'category', 'description', 'images']);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is involved in the order or is admin
    const isInvolved = 
      order.buyer.toString() === req.user.id ||
      order.seller.toString() === req.user.id;
    
    if (!isInvolved && req.user.role !== 'admin') {
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

// @route   PUT api/supplychain/orders/:id
// @desc    Update order status
// @access  Private
router.put(
  '/orders/:id',
  [
    auth,
    [
      body('status', 'Status is required').isIn([
        'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded', 'disputed'
      ])
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
      
      // Check if user is involved in the order or is admin
      const isInvolved = 
        order.buyer.toString() === req.user.id ||
        order.seller.toString() === req.user.id;
      
      if (!isInvolved && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const { status, notes, paymentMethod, delivery } = req.body;
      
      // Check if status transition is valid
      const validTransitions = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['processing', 'cancelled'],
        processing: ['shipped', 'cancelled'],
        shipped: ['delivered', 'disputed'],
        delivered: ['completed', 'disputed'],
        completed: ['disputed'],
        cancelled: [],
        refunded: [],
        disputed: ['refunded', 'completed']
      };
      
      if (!validTransitions[order.status].includes(status)) {
        return res.status(400).json({ 
          message: `Invalid status transition from ${order.status} to ${status}` 
        });
      }
      
      // Check if user has permission for this status change
      const sellerOnlyStatuses = ['confirmed', 'processing', 'shipped'];
      const buyerOnlyStatuses = ['disputed'];
      
      if (sellerOnlyStatuses.includes(status) && order.seller.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only the seller can update to this status' });
      }
      
      if (buyerOnlyStatuses.includes(status) && order.buyer.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only the buyer can update to this status' });
      }
      
      // Update order
      order.status = status;
      
      // Add event
      order.events.push({
        type: status === 'cancelled' ? 'cancelled' : 
              status === 'refunded' ? 'refunded' : 
              status === 'shipped' ? 'shipped' : 
              status === 'delivered' ? 'delivered' : 
              status === 'completed' ? 'completed' : 
              'other',
        timestamp: new Date(),
        description: `Order ${status} by ${req.user.role}`,
        actor: req.user.id
      });
      
      // Update notes if provided
      if (notes) {
        if (order.buyer.toString() === req.user.id) {
          order.notes.buyer = notes;
        } else if (order.seller.toString() === req.user.id) {
          order.notes.seller = notes;
        } else if (req.user.role === 'admin') {
          order.notes.internal = notes;
        }
      }
      
      // Update payment method if provided
      if (paymentMethod) {
        order.paymentMethod = {
          ...order.paymentMethod,
          ...paymentMethod
        };
        
        // If payment is completed, add event
        if (paymentMethod.status === 'completed' && order.paymentMethod.status !== 'completed') {
          order.events.push({
            type: 'payment_received',
            timestamp: new Date(),
            description: 'Payment received',
            actor: req.user.id
          });
        }
      }
      
      // Update delivery if provided
      if (delivery) {
        order.delivery = {
          ...order.delivery,
          ...delivery
        };
      }
      
      await order.save();
      
      res.json(order);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/supplychain/trace/:productId
// @desc    Trace product journey
// @access  Public
router.get('/trace/:productId', async (req, res) => {
  try {
    // Find product by productId (not MongoDB _id)
    const product = await Product.findOne({ productId: req.params.productId })
      .populate('producer', ['name', 'email'])
      .populate('origin.field', ['name', 'location'])
      .populate('crop', ['name', 'variety', 'plantingDate', 'harvestDate']);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Get all events for this product
    const events = await SupplyChainEvent.find({ product: product._id })
      .populate('actor.user', ['name', 'role'])
      .sort({ timestamp: 1 });
    
    // Get shipments for this product
    const shipments = await Shipment.find({ 'products.product': product._id })
      .populate('sender.user', ['name'])
      .populate('receiver.user', ['name']);
    
    // Compile trace data
    const traceData = {
      product: {
        id: product.productId,
        name: product.name,
        category: product.category,
        description: product.description,
        producer: product.producer ? {
          name: product.producer.name
        } : null,
        origin: product.origin,
        harvestDate: product.harvestDate,
        certifications: product.certifications,
        status: product.status,
        blockchainVerified: product.blockchainInfo.isTracked
      },
      journey: events.map(event => ({
        type: event.eventType,
        timestamp: event.timestamp,
        location: event.location,
        actor: event.actor ? {
          name: event.actor.name,
          role: event.actor.role
        } : null,
        verified: event.verificationStatus === 'verified',
        blockchainVerified: event.blockchainInfo.isRecorded,
        data: event.data
      })),
      shipments: shipments.map(shipment => ({
        id: shipment.shipmentId,
        sender: shipment.sender.name,
        receiver: shipment.receiver.name,
        origin: shipment.origin,
        destination: shipment.destination,
        departureTime: shipment.departureTime,
        arrivalTime: shipment.arrivalTime,
        status: shipment.status
      }))
    };
    
    res.json(traceData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;