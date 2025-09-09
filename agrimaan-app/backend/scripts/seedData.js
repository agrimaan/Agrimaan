const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Fields = require('../models/Fields');
const Crop = require('../models/Crop');
const Sensor = require('../models/Sensor');
const Order = require('../models/Order');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected for seeding data');
  seedData();
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Fields.deleteMany({});
    await Crop.deleteMany({});
    await Sensor.deleteMany({});
    await Order.deleteMany({});

    console.log('Previous data cleared');

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const adminUser = await User.create({
      name: 'Admin Sharma',
      email: 'admin@agrimaan.com',
      password: hashedPassword,
      role: 'admin',
      phone: '+91 9876543210',
      address: {
        street: '123 Admin Street',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        zipCode: '110001'
      }
    });

    const farmerUser = await User.create({
      name: 'Farmer Singh',
      email: 'farmer@agrimaan.com',
      password: hashedPassword,
      role: 'farmer',
      phone: '+91 9876543211',
      address: {
        street: '456 Farm Road',
        city: 'Amritsar',
        state: 'Punjab',
        country: 'India',
        zipCode: '143001'
      }
    });

    const buyerUser = await User.create({
      name: 'Buyer Kumar',
      email: 'buyer@agrimaan.com',
      password: hashedPassword,
      role: 'buyer',
      phone: '+91 9876543212',
      address: {
        street: '789 Market Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        zipCode: '400001'
      }
    });

    const logisticsUser = await User.create({
      name: 'Logistics Patel',
      email: 'logistics@agrimaan.com',
      password: hashedPassword,
      role: 'logistics',
      phone: '+91 9876543213',
      address: {
        street: '101 Transport Lane',
        city: 'Ahmedabad',
        state: 'Gujarat',
        country: 'India',
        zipCode: '380001'
      }
    });

    const agronomistUser = await User.create({
      name: 'Dr. Agronomist Kumar',
      email: 'agronomist@agrimaan.com',
      password: hashedPassword,
      role: 'agronomist',
      phone: '+91 9876543214',
      address: {
        street: '202 Science Park',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        zipCode: '560001'
      }
    });

    console.log('Users created');

    // Create fields for the farmer
    const northFields = await Fields.create({
      name: 'North Fields',
      owner: farmerUser._id,
      location: {
        type: 'Point',
        coordinates: [75.8577, 30.9010] // Longitude, Latitude
      },
      boundaries: {
        type: 'Polygon',
        coordinates: [[[75.8577, 30.9010], [75.8677, 30.9010], [75.8677, 30.9110], [75.8577, 30.9110], [75.8577, 30.9010]]]
      },
      area: {
        value: 12.5,
        unit: 'acre'
      },
      soilType: 'loamy',
      irrigationSystem: {
        type: 'drip',
        isAutomated: true
      },
      notes: 'Prime agricultural Fields with good irrigation'
    });

    const southFields = await Fields.create({
      name: 'South Fields',
      owner: farmerUser._id,
      location: {
        type: 'Point',
        coordinates: [75.8677, 30.8910]
      },
      boundaries: {
        type: 'Polygon',
        coordinates: [[[75.8677, 30.8910], [75.8777, 30.8910], [75.8777, 30.9010], [75.8677, 30.9010], [75.8677, 30.8910]]]
      },
      area: {
        value: 8.3,
        unit: 'acre'
      },
      soilType: 'clay',
      irrigationSystem: {
        type: 'sprinkler',
        isAutomated: false
      },
      notes: 'Clay soil, good for certain crops'
    });

    console.log('fields created');

    // Update farmer with fields
    await User.findByIdAndUpdate(farmerUser._id, {
      fields: [northFields._id, southFields._id]
    });

    // Create crops
    const wheatCrop = await Crop.create({
      name: 'Wheat',
      Fields: northFields._id,
      variety: 'Hard Red Winter',
      plantingDate: new Date('2024-03-15'),
      harvestDate: new Date('2024-08-10'),
      status: 'harvested',
      growthStage: 'mature',
      expectedYield: {
        value: 4.5,
        unit: 'ton/ha'
      },
      actualYield: {
        value: 4.2,
        unit: 'ton/ha'
      },
      healthStatus: 'good',
      notes: 'Good yield this season'
    });

    const cornCrop = await Crop.create({
      name: 'Corn',
      Fields: southFields._id,
      variety: 'Sweet Corn',
      plantingDate: new Date('2024-04-10'),
      harvestDate: new Date('2024-09-15'),
      status: 'growing',
      growthStage: 'flowering',
      expectedYield: {
        value: 9.0,
        unit: 'ton/ha'
      },
      healthStatus: 'excellent',
      notes: 'Growing well, expecting good yield'
    });

    const soybeanCrop = await Crop.create({
      name: 'Soybeans',
      Fields: northFields._id,
      variety: 'Round-Up Ready',
      plantingDate: new Date('2024-05-01'),
      harvestDate: new Date('2024-10-20'),
      status: 'growing',
      growthStage: 'vegetative',
      expectedYield: {
        value: 3.2,
        unit: 'ton/ha'
      },
      healthStatus: 'fair',
      notes: 'Some pest issues, monitoring closely'
    });

    const riceCrop = await Crop.create({
      name: 'Rice',
      Fields: southFields._id,
      variety: 'Long Grain',
      plantingDate: new Date('2024-04-15'),
      harvestDate: new Date('2024-09-30'),
      status: 'harvested',
      growthStage: 'mature',
      expectedYield: {
        value: 5.5,
        unit: 'ton/ha'
      },
      actualYield: {
        value: 5.8,
        unit: 'ton/ha'
      },
      healthStatus: 'good',
      notes: 'Excellent harvest this season'
    });

    console.log('Crops created');

    // Update fields with crops
    await Fields.findByIdAndUpdate(northFields._id, {
      crops: [wheatCrop._id, soybeanCrop._id]
    });

    await Fields.findByIdAndUpdate(southFields._id, {
      crops: [cornCrop._id, riceCrop._id]
    });

    // Create sensors
    const soilMoistureSensor1 = await Sensor.create({
      name: 'Soil Moisture Sensor 1',
      type: 'soil_moisture',
      Fields: northFields._id,
      location: {
        type: 'Point',
        coordinates: [75.8590, 30.9020]
      },
      manufacturer: 'SensorTech',
      model: 'SM-100',
      serialNumber: 'SM100-001',
      installationDate: new Date('2024-01-15'),
      batteryLevel: 85,
      status: 'active',
      measurementUnit: '%',
      measurementRange: {
        min: 0,
        max: 100
      },
      accuracy: 2.0,
      dataTransmissionInterval: 30,
      lastReading: {
        value: 28,
        timestamp: new Date()
      }
    });

    const temperatureSensor1 = await Sensor.create({
      name: 'Temperature Sensor 1',
      type: 'temperature',
      Fields: northFields._id,
      location: {
        type: 'Point',
        coordinates: [75.8600, 30.9030]
      },
      manufacturer: 'SensorTech',
      model: 'TS-200',
      serialNumber: 'TS200-001',
      installationDate: new Date('2024-01-15'),
      batteryLevel: 72,
      status: 'active',
      measurementUnit: '°C',
      measurementRange: {
        min: -20,
        max: 60
      },
      accuracy: 0.5,
      dataTransmissionInterval: 30,
      lastReading: {
        value: 22,
        timestamp: new Date()
      }
    });

    const soilMoistureSensor2 = await Sensor.create({
      name: 'Soil Moisture Sensor 2',
      type: 'soil_moisture',
      Fields: southFields._id,
      location: {
        type: 'Point',
        coordinates: [75.8690, 30.8920]
      },
      manufacturer: 'SensorTech',
      model: 'SM-100',
      serialNumber: 'SM100-002',
      installationDate: new Date('2024-01-20'),
      batteryLevel: 65,
      status: 'active',
      measurementUnit: '%',
      measurementRange: {
        min: 0,
        max: 100
      },
      accuracy: 2.0,
      dataTransmissionInterval: 30,
      lastReading: {
        value: 32,
        timestamp: new Date()
      }
    });

    console.log('Sensors created');

    // Update fields with sensors
    await Fields.findByIdAndUpdate(northFields._id, {
      sensors: [soilMoistureSensor1._id, temperatureSensor1._id]
    });

    await Fields.findByIdAndUpdate(southFields._id, {
      sensors: [soilMoistureSensor2._id]
    });

    // Create orders
    const order1 = await Order.create({
      buyer: buyerUser._id,
      seller: farmerUser._id,
      items: [
        {
          crop: wheatCrop._id,
          quantity: 10,
          pricePerUnit: 250,
          totalPrice: 2500
        }
      ],
      totalAmount: 2500,
      status: 'delivered',
      paymentStatus: 'completed',
      paymentMethod: 'bank_transfer',
      shippingAddress: {
        street: '789 Market Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        zipCode: '400001'
      },
      trackingNumber: 'TRK123456',
      estimatedDeliveryDate: new Date('2024-08-20'),
      notes: 'First order'
    });

    const order2 = await Order.create({
      buyer: buyerUser._id,
      seller: farmerUser._id,
      items: [
        {
          crop: riceCrop._id,
          quantity: 5,
          pricePerUnit: 400,
          totalPrice: 2000
        }
      ],
      totalAmount: 2000,
      status: 'shipped',
      paymentStatus: 'completed',
      paymentMethod: 'credit_card',
      shippingAddress: {
        street: '789 Market Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        zipCode: '400001'
      },
      trackingNumber: 'TRK123457',
      estimatedDeliveryDate: new Date('2024-10-15'),
      notes: 'Second order'
    });

    console.log('Orders created');

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};