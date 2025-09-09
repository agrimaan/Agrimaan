const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Setup before all tests
beforeAll(async () => {
  // Start in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Cleanup after each test
afterEach(async () => {
  // Clear all collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Cleanup after all tests
afterAll(async () => {
  // Close database connection
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  
  // Stop the in-memory MongoDB instance
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Global test utilities
global.testUtils = {
  // Helper to create test user
  createTestUser: async (userData = {}) => {
    const User = require('../models/User');
    const bcrypt = require('bcrypt');
    
    const defaultUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'farmer',
      phone: '+91 9876543210',
      address: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        country: 'India',
        zipCode: '123456'
      }
    };
    
    return await User.create({ ...defaultUser, ...userData });
  },
  
  // Helper to create test field
  createTestField: async (fieldData = {}, farmer = null) => {
    const Fields = require('../models/Fields');
    
    if (!farmer) {
      farmer = await global.testUtils.createTestUser();
    }
    
    const defaultField = {
      name: 'Test Field',
      farmer: farmer._id,
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139] // Delhi coordinates
      },
      address: {
        street: '123 Farm Road',
        city: 'Test City',
        state: 'Test State',
        country: 'India',
        zipCode: '123456'
      },
      size: 10.5,
      unit: 'acres',
      soilType: 'loamy',
      cropType: 'wheat',
      irrigationType: 'drip',
      status: 'active'
    };
    
    return await Fields.create({ ...defaultField, ...fieldData });
  },
  
  // Helper to create test crop
  createTestCrop: async (cropData = {}, field = null, farmer = null) => {
    const Crop = require('../models/Crop');
    
    if (!farmer) {
      farmer = await global.testUtils.createTestUser();
    }
    
    if (!field) {
      field = await global.testUtils.createTestField({}, farmer);
    }
    
    const defaultCrop = {
      name: 'Test Wheat',
      variety: 'HD-2967',
      field: field._id,
      farmer: farmer._id,
      plantingDate: new Date(),
      harvestDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      expectedYield: 2000,
      season: 'rabi',
      status: 'planted'
    };
    
    return await Crop.create({ ...defaultCrop, ...cropData });
  },
  
  // Helper to create test sensor
  createTestSensor: async (sensorData = {}, field = null, farmer = null) => {
    const Sensor = require('../models/Sensor');
    
    if (!farmer) {
      farmer = await global.testUtils.createTestUser();
    }
    
    if (!field) {
      field = await global.testUtils.createTestField({}, farmer);
    }
    
    const defaultSensor = {
      name: 'TEST-TEMP-001',
      type: 'temperature',
      field: field._id,
      farmer: farmer._id,
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139]
      },
      status: 'active',
      batteryLevel: 85,
      lastReading: {
        value: 25.5,
        timestamp: new Date(),
        unit: '°C'
      }
    };
    
    return await Sensor.create({ ...defaultSensor, ...sensorData });
  },
  
  // Helper to create test order
  createTestOrder: async (orderData = {}, buyer = null, farmer = null) => {
    const Order = require('../models/Order');
    
    if (!buyer) {
      buyer = await global.testUtils.createTestUser({ role: 'buyer', email: 'buyer@example.com' });
    }
    
    if (!farmer) {
      farmer = await global.testUtils.createTestUser({ role: 'farmer', email: 'farmer@example.com' });
    }
    
    const defaultOrder = {
      orderId: `ORD-${Date.now()}`,
      buyer: buyer._id,
      farmer: farmer._id,
      products: [{
        name: 'wheat',
        quantity: 100,
        unit: 'kg',
        pricePerUnit: 25,
        totalPrice: 2500
      }],
      totalAmount: 2500,
      status: 'pending',
      paymentStatus: 'pending',
      orderDate: new Date()
    };
    
    return await Order.create({ ...defaultOrder, ...orderData });
  },
  
  // Helper to generate JWT token for testing
  generateTestToken: (userId, role = 'farmer') => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { userId, role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  },
  
  // Helper to make authenticated requests
  authenticateRequest: (request, user) => {
    const token = global.testUtils.generateTestToken(user._id, user.role);
    return request.set('x-auth-token', token);
  }
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.USE_REAL_DB = 'false';