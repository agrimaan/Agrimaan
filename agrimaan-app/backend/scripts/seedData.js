const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const faker = require('faker');
const User = require('../models/User');
const Fields = require('../models/Fields');
const Crop = require('../models/Crop');
const Sensor = require('../models/Sensor');
const Order = require('../models/Order');
const Weather = require('../models/Weather');
const Analytics = require('../models/Analytics');
const Notification = require('../models/Notification');
const SupplyChain = require('../models/SupplyChain');
const IoT = require('../models/IoT');
require('dotenv').config();

// Set faker locale to include Indian names and locations
faker.locale = 'en_IND';

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/agrimaan', {
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
    console.log('🌱 Starting comprehensive data seeding...');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Fields.deleteMany({});
    await Crop.deleteMany({});
    await Sensor.deleteMany({});
    await Order.deleteMany({});
    await Weather.deleteMany({});
    await Analytics.deleteMany({});
    await Notification.deleteMany({});
    await SupplyChain.deleteMany({});
    await IoT.deleteMany({});

    console.log('✅ Previous data cleared');

    // Create users with different roles
    const hashedPassword = await bcrypt.hash('password123', 10);
    const users = [];

    // Admin Users
    const adminUsers = [
      {
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
        },
        preferences: {
          language: 'en',
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            sms: true
          }
        }
      }
    ];

    // Farmer Users
    const farmerUsers = [];
    const indianStates = ['Punjab', 'Haryana', 'Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Andhra Pradesh', 'West Bengal', 'Gujarat', 'Rajasthan'];
    const farmerNames = ['Rajesh Kumar', 'Suresh Patel', 'Ramesh Singh', 'Mahesh Yadav', 'Dinesh Sharma', 'Mukesh Gupta', 'Naresh Verma', 'Rakesh Jain', 'Umesh Tiwari', 'Lokesh Agarwal'];
    
    for (let i = 0; i < 50; i++) {
      const state = indianStates[Math.floor(Math.random() * indianStates.length)];
      farmerUsers.push({
        name: farmerNames[i % farmerNames.length] + ` ${i + 1}`,
        email: `farmer${i + 1}@agrimaan.com`,
        password: hashedPassword,
        role: 'farmer',
        phone: `+91 ${faker.phone.phoneNumber('9#########')}`,
        address: {
          street: `${faker.address.streetAddress()}`,
          city: faker.address.city(),
          state: state,
          country: 'India',
          zipCode: faker.address.zipCode()
        },
        preferences: {
          language: ['hi', 'en', 'bn', 'te', 'mr'][Math.floor(Math.random() * 5)],
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            sms: true
          }
        },
        farmingExperience: Math.floor(Math.random() * 30) + 1,
        landSize: Math.floor(Math.random() * 50) + 1,
        primaryCrops: ['wheat', 'rice', 'corn', 'sugarcane', 'cotton'][Math.floor(Math.random() * 5)]
      });
    }

    // Buyer Users
    const buyerUsers = [];
    const buyerCompanies = ['Fresh Foods Ltd', 'Organic Mart', 'Green Grocers', 'Farm Fresh Co', 'Healthy Harvest', 'Pure Produce', 'Natural Foods', 'Eco Mart', 'Bio Bazaar', 'Organic Express'];
    
    for (let i = 0; i < 30; i++) {
      buyerUsers.push({
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        email: `buyer${i + 1}@agrimaan.com`,
        password: hashedPassword,
        role: 'buyer',
        phone: `+91 ${faker.phone.phoneNumber('9#########')}`,
        address: {
          street: faker.address.streetAddress(),
          city: faker.address.city(),
          state: indianStates[Math.floor(Math.random() * indianStates.length)],
          country: 'India',
          zipCode: faker.address.zipCode()
        },
        preferences: {
          language: 'en',
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            sms: false
          }
        },
        companyName: buyerCompanies[i % buyerCompanies.length],
        businessType: ['retailer', 'wholesaler', 'processor', 'exporter'][Math.floor(Math.random() * 4)]
      });
    }

    // Logistics Users
    const logisticsUsers = [];
    const logisticsCompanies = ['Swift Logistics', 'Fast Track Transport', 'Green Delivery', 'Farm Connect Logistics', 'Rural Express', 'Agri Transport', 'Fresh Move', 'Quick Cargo', 'Reliable Logistics', 'Speed Delivery'];
    
    for (let i = 0; i < 20; i++) {
      logisticsUsers.push({
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        email: `logistics${i + 1}@agrimaan.com`,
        password: hashedPassword,
        role: 'logistics',
        phone: `+91 ${faker.phone.phoneNumber('9#########')}`,
        address: {
          street: faker.address.streetAddress(),
          city: faker.address.city(),
          state: indianStates[Math.floor(Math.random() * indianStates.length)],
          country: 'India',
          zipCode: faker.address.zipCode()
        },
        preferences: {
          language: 'en',
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            sms: true
          }
        },
        companyName: logisticsCompanies[i % logisticsCompanies.length],
        vehicleType: ['truck', 'van', 'motorcycle', 'bicycle'][Math.floor(Math.random() * 4)],
        serviceArea: indianStates[Math.floor(Math.random() * indianStates.length)]
      });
    }

    // Agronomist Users
    const agronomistUsers = [];
    for (let i = 0; i < 15; i++) {
      agronomistUsers.push({
        name: `Dr. ${faker.name.firstName()} ${faker.name.lastName()}`,
        email: `agronomist${i + 1}@agrimaan.com`,
        password: hashedPassword,
        role: 'agronomist',
        phone: `+91 ${faker.phone.phoneNumber('9#########')}`,
        address: {
          street: faker.address.streetAddress(),
          city: faker.address.city(),
          state: indianStates[Math.floor(Math.random() * indianStates.length)],
          country: 'India',
          zipCode: faker.address.zipCode()
        },
        preferences: {
          language: 'en',
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            sms: false
          }
        },
        specialization: ['soil science', 'crop protection', 'plant breeding', 'sustainable agriculture', 'precision farming'][Math.floor(Math.random() * 5)],
        experience: Math.floor(Math.random() * 20) + 5,
        certifications: ['PhD Agriculture', 'Certified Crop Advisor', 'Organic Certification']
      });
    }

    // Investor Users
    const investorUsers = [];
    for (let i = 0; i < 10; i++) {
      investorUsers.push({
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        email: `investor${i + 1}@agrimaan.com`,
        password: hashedPassword,
        role: 'investor',
        phone: `+91 ${faker.phone.phoneNumber('9#########')}`,
        address: {
          street: faker.address.streetAddress(),
          city: faker.address.city(),
          state: indianStates[Math.floor(Math.random() * indianStates.length)],
          country: 'India',
          zipCode: faker.address.zipCode()
        },
        preferences: {
          language: 'en',
          theme: 'dark',
          notifications: {
            email: true,
            push: true,
            sms: false
          }
        },
        investmentFocus: ['sustainable agriculture', 'agtech', 'organic farming', 'precision agriculture'][Math.floor(Math.random() * 4)],
        portfolioSize: Math.floor(Math.random() * 10000000) + 1000000
      });
    }

    // Combine all users
    users.push(...adminUsers, ...farmerUsers, ...buyerUsers, ...logisticsUsers, ...agronomistUsers, ...investorUsers);

    console.log('👥 Creating users...');
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Get user references
    const farmers = createdUsers.filter(user => user.role === 'farmer');
    const buyers = createdUsers.filter(user => user.role === 'buyer');
    const logisticsProviders = createdUsers.filter(user => user.role === 'logistics');

    // Create Fields
    console.log('🌾 Creating fields...');
    const fields = [];
    const cropTypes = ['wheat', 'rice', 'corn', 'sugarcane', 'cotton', 'tomato', 'potato', 'onion', 'soybean', 'mustard'];
    const soilTypes = ['loamy', 'clay', 'sandy', 'silt', 'peat', 'chalk'];
    const irrigationTypes = ['drip', 'sprinkler', 'flood', 'furrow', 'center pivot'];

    for (let i = 0; i < 200; i++) {
      const farmer = farmers[Math.floor(Math.random() * farmers.length)];
      fields.push({
        name: `Field ${i + 1} - ${farmer.name.split(' ')[0]}`,
        farmer: farmer._id,
        location: {
          type: 'Point',
          coordinates: [
            parseFloat((77 + Math.random() * 10).toFixed(6)), // Longitude (India range)
            parseFloat((20 + Math.random() * 15).toFixed(6))  // Latitude (India range)
          ]
        },
        address: {
          street: faker.address.streetAddress(),
          city: faker.address.city(),
          state: farmer.address.state,
          country: 'India',
          zipCode: faker.address.zipCode()
        },
        size: parseFloat((Math.random() * 50 + 1).toFixed(2)),
        unit: 'acres',
        soilType: soilTypes[Math.floor(Math.random() * soilTypes.length)],
        cropType: cropTypes[Math.floor(Math.random() * cropTypes.length)],
        irrigationType: irrigationTypes[Math.floor(Math.random() * irrigationTypes.length)],
        plantingDate: faker.date.recent(90),
        harvestDate: faker.date.future(0.5),
        status: ['active', 'preparing', 'planted', 'growing', 'harvesting'][Math.floor(Math.random() * 5)],
        soilHealth: {
          ph: parseFloat((6 + Math.random() * 2).toFixed(1)),
          nitrogen: Math.floor(Math.random() * 100),
          phosphorus: Math.floor(Math.random() * 100),
          potassium: Math.floor(Math.random() * 100),
          organicMatter: parseFloat((Math.random() * 5).toFixed(1))
        },
        weatherConditions: {
          temperature: Math.floor(Math.random() * 20) + 20,
          humidity: Math.floor(Math.random() * 40) + 40,
          rainfall: Math.floor(Math.random() * 100)
        }
      });
    }

    const createdFields = await Fields.insertMany(fields);
    console.log(`✅ Created ${createdFields.length} fields`);

    // Create Crops
    console.log('🌱 Creating crops...');
    const crops = [];
    const varieties = {
      wheat: ['HD-2967', 'PBW-343', 'WH-147', 'DBW-88'],
      rice: ['Basmati-370', 'IR-64', 'Swarna', 'Samba Mahsuri'],
      corn: ['Pioneer-30V92', 'NK-6240', 'DKC-9089', 'P-3394'],
      tomato: ['Pusa Ruby', 'Arka Vikas', 'Himsona', 'Roma'],
      potato: ['Kufri Jyoti', 'Kufri Pukhraj', 'Kufri Badshah', 'Kufri Chipsona']
    };

    for (let i = 0; i < 300; i++) {
      const field = createdFields[Math.floor(Math.random() * createdFields.length)];
      const cropType = field.cropType;
      const variety = varieties[cropType] ? varieties[cropType][Math.floor(Math.random() * varieties[cropType].length)] : 'Standard';
      
      crops.push({
        name: `${cropType.charAt(0).toUpperCase() + cropType.slice(1)} - ${variety}`,
        variety: variety,
        field: field._id,
        farmer: field.farmer,
        plantingDate: field.plantingDate,
        harvestDate: field.harvestDate,
        expectedYield: Math.floor(Math.random() * 5000) + 1000,
        actualYield: Math.random() > 0.5 ? Math.floor(Math.random() * 5000) + 1000 : null,
        season: ['kharif', 'rabi', 'zaid'][Math.floor(Math.random() * 3)],
        status: ['planted', 'growing', 'flowering', 'fruiting', 'harvested'][Math.floor(Math.random() * 5)],
        healthStatus: ['excellent', 'good', 'fair', 'poor'][Math.floor(Math.random() * 4)],
        diseaseResistance: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
        waterRequirement: Math.floor(Math.random() * 1000) + 500,
        fertilizer: {
          nitrogen: Math.floor(Math.random() * 200) + 50,
          phosphorus: Math.floor(Math.random() * 100) + 25,
          potassium: Math.floor(Math.random() * 150) + 30
        },
        pesticides: [
          {
            name: 'Organic Neem Oil',
            quantity: Math.floor(Math.random() * 10) + 1,
            applicationDate: faker.date.recent(30)
          }
        ],
        marketPrice: Math.floor(Math.random() * 5000) + 1000,
        qualityGrade: ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
      });
    }

    const createdCrops = await Crop.insertMany(crops);
    console.log(`✅ Created ${createdCrops.length} crops`);

    // Create Sensors
    console.log('📡 Creating sensors...');
    const sensors = [];
    const sensorTypes = ['temperature', 'humidity', 'soil_moisture', 'ph', 'light', 'pressure', 'wind', 'rain'];

    for (let i = 0; i < 500; i++) {
      const field = createdFields[Math.floor(Math.random() * createdFields.length)];
      const sensorType = sensorTypes[Math.floor(Math.random() * sensorTypes.length)];
      
      sensors.push({
        name: `${sensorType.toUpperCase()}-${i + 1}`,
        type: sensorType,
        field: field._id,
        farmer: field.farmer,
        location: {
          type: 'Point',
          coordinates: [
            field.location.coordinates[0] + (Math.random() - 0.5) * 0.01,
            field.location.coordinates[1] + (Math.random() - 0.5) * 0.01
          ]
        },
        status: ['active', 'inactive', 'maintenance'][Math.floor(Math.random() * 3)],
        batteryLevel: Math.floor(Math.random() * 100),
        lastReading: {
          value: Math.random() * 100,
          timestamp: faker.date.recent(1),
          unit: sensorType === 'temperature' ? '°C' : 
                sensorType === 'humidity' ? '%' : 
                sensorType === 'soil_moisture' ? '%' : 
                sensorType === 'ph' ? 'pH' : 
                sensorType === 'light' ? 'lux' : 
                sensorType === 'pressure' ? 'hPa' : 
                sensorType === 'wind' ? 'm/s' : 'mm'
        },
        calibrationDate: faker.date.recent(30),
        installationDate: faker.date.past(1),
        manufacturer: ['SensorTech', 'AgriSense', 'FarmMonitor', 'CropWatch'][Math.floor(Math.random() * 4)],
        model: `Model-${Math.floor(Math.random() * 1000) + 100}`,
        firmware: `v${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`
      });
    }

    const createdSensors = await Sensor.insertMany(sensors);
    console.log(`✅ Created ${createdSensors.length} sensors`);

    // Create Orders
    console.log('📦 Creating orders...');
    const orders = [];
    const products = ['wheat', 'rice', 'corn', 'tomato', 'potato', 'onion', 'sugarcane', 'cotton'];

    for (let i = 0; i < 200; i++) {
      const buyer = buyers[Math.floor(Math.random() * buyers.length)];
      const farmer = farmers[Math.floor(Math.random() * farmers.length)];
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 1000) + 100;
      const pricePerUnit = Math.floor(Math.random() * 100) + 20;
      
      orders.push({
        orderId: `ORD-${Date.now()}-${i}`,
        buyer: buyer._id,
        farmer: farmer._id,
        products: [{
          name: product,
          quantity: quantity,
          unit: 'kg',
          pricePerUnit: pricePerUnit,
          totalPrice: quantity * pricePerUnit
        }],
        totalAmount: quantity * pricePerUnit,
        status: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'][Math.floor(Math.random() * 6)],
        paymentStatus: ['pending', 'paid', 'failed', 'refunded'][Math.floor(Math.random() * 4)],
        paymentMethod: ['cash', 'bank_transfer', 'upi', 'card'][Math.floor(Math.random() * 4)],
        orderDate: faker.date.recent(30),
        deliveryDate: faker.date.future(0.1),
        shippingAddress: buyer.address,
        logistics: logisticsProviders[Math.floor(Math.random() * logisticsProviders.length)]._id,
        trackingNumber: `TRK-${Math.floor(Math.random() * 1000000)}`,
        notes: faker.lorem.sentence()
      });
    }

    const createdOrders = await Order.insertMany(orders);
    console.log(`✅ Created ${createdOrders.length} orders`);

    // Create Weather Data
    console.log('🌤️ Creating weather data...');
    const weatherData = [];
    const locations = [...new Set(createdFields.map(field => `${field.address.city}, ${field.address.state}`))];

    for (let i = 0; i < 100; i++) {
      const location = locations[Math.floor(Math.random() * locations.length)];
      weatherData.push({
        location: location,
        coordinates: {
          type: 'Point',
          coordinates: [
            parseFloat((77 + Math.random() * 10).toFixed(6)),
            parseFloat((20 + Math.random() * 15).toFixed(6))
          ]
        },
        current: {
          temperature: Math.floor(Math.random() * 20) + 20,
          humidity: Math.floor(Math.random() * 40) + 40,
          windSpeed: Math.floor(Math.random() * 20) + 5,
          windDirection: Math.floor(Math.random() * 360),
          pressure: Math.floor(Math.random() * 50) + 1000,
          visibility: Math.floor(Math.random() * 10) + 5,
          uvIndex: Math.floor(Math.random() * 11),
          cloudCover: Math.floor(Math.random() * 100),
          precipitation: Math.floor(Math.random() * 10),
          condition: ['sunny', 'cloudy', 'rainy', 'stormy', 'foggy'][Math.floor(Math.random() * 5)]
        },
        forecast: Array.from({length: 7}, (_, day) => ({
          date: new Date(Date.now() + day * 24 * 60 * 60 * 1000),
          temperature: {
            min: Math.floor(Math.random() * 15) + 15,
            max: Math.floor(Math.random() * 15) + 25
          },
          humidity: Math.floor(Math.random() * 40) + 40,
          precipitation: Math.floor(Math.random() * 20),
          windSpeed: Math.floor(Math.random() * 15) + 5,
          condition: ['sunny', 'cloudy', 'rainy', 'stormy'][Math.floor(Math.random() * 4)]
        })),
        alerts: Math.random() > 0.8 ? [{
          type: ['heat_wave', 'heavy_rain', 'storm', 'drought'][Math.floor(Math.random() * 4)],
          severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          message: faker.lorem.sentence(),
          validFrom: new Date(),
          validTo: faker.date.future(0.1)
        }] : [],
        lastUpdated: new Date()
      });
    }

    const createdWeather = await Weather.insertMany(weatherData);
    console.log(`✅ Created ${createdWeather.length} weather records`);

    // Create Analytics Data
    console.log('📊 Creating analytics data...');
    const analyticsData = [];

    for (let i = 0; i < 50; i++) {
      const farmer = farmers[Math.floor(Math.random() * farmers.length)];
      analyticsData.push({
        farmer: farmer._id,
        period: {
          start: faker.date.past(1),
          end: new Date()
        },
        metrics: {
          totalYield: Math.floor(Math.random() * 10000) + 5000,
          totalRevenue: Math.floor(Math.random() * 500000) + 100000,
          totalCost: Math.floor(Math.random() * 200000) + 50000,
          profitMargin: Math.floor(Math.random() * 30) + 10,
          yieldPerAcre: Math.floor(Math.random() * 2000) + 1000,
          waterUsage: Math.floor(Math.random() * 10000) + 5000,
          fertilizerUsage: Math.floor(Math.random() * 1000) + 200,
          pesticideUsage: Math.floor(Math.random() * 100) + 20
        },
        insights: [
          faker.lorem.sentence(),
          faker.lorem.sentence(),
          faker.lorem.sentence()
        ],
        recommendations: [
          faker.lorem.sentence(),
          faker.lorem.sentence()
        ],
        generatedAt: new Date()
      });
    }

    const createdAnalytics = await Analytics.insertMany(analyticsData);
    console.log(`✅ Created ${createdAnalytics.length} analytics records`);

    // Create Notifications
    console.log('🔔 Creating notifications...');
    const notifications = [];
    const notificationTypes = ['weather_alert', 'price_update', 'order_status', 'harvest_reminder', 'maintenance_alert', 'system_update'];

    for (let i = 0; i < 300; i++) {
      const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      
      notifications.push({
        user: user._id,
        type: type,
        title: `${type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Notification`,
        message: faker.lorem.sentence(),
        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        read: Math.random() > 0.3,
        actionRequired: Math.random() > 0.7,
        data: {
          relatedId: faker.datatype.uuid(),
          category: type.split('_')[0]
        },
        createdAt: faker.date.recent(7)
      });
    }

    const createdNotifications = await Notification.insertMany(notifications);
    console.log(`✅ Created ${createdNotifications.length} notifications`);

    // Create IoT Data
    console.log('🌐 Creating IoT data...');
    const iotData = [];

    for (let i = 0; i < 1000; i++) {
      const sensor = createdSensors[Math.floor(Math.random() * createdSensors.length)];
      iotData.push({
        deviceId: sensor._id,
        deviceType: sensor.type,
        farmer: sensor.farmer,
        field: sensor.field,
        data: {
          value: Math.random() * 100,
          unit: sensor.lastReading.unit,
          quality: ['excellent', 'good', 'fair', 'poor'][Math.floor(Math.random() * 4)]
        },
        location: sensor.location,
        timestamp: faker.date.recent(7),
        batteryLevel: Math.floor(Math.random() * 100),
        signalStrength: Math.floor(Math.random() * 100),
        status: 'active',
        metadata: {
          firmware: sensor.firmware,
          calibrationDate: sensor.calibrationDate,
          lastMaintenance: faker.date.recent(30)
        }
      });
    }

    const createdIoTData = await IoT.insertMany(iotData);
    console.log(`✅ Created ${createdIoTData.length} IoT data records`);

    // Create Supply Chain Data
    console.log('🔗 Creating supply chain data...');
    const supplyChainData = [];

    for (let i = 0; i < 100; i++) {
      const order = createdOrders[Math.floor(Math.random() * createdOrders.length)];
      const product = order.products[0];
      
      supplyChainData.push({
        productId: `PROD-${Date.now()}-${i}`,
        batchId: `BATCH-${Date.now()}-${i}`,
        farmer: order.farmer,
        buyer: order.buyer,
        product: {
          name: product.name,
          variety: faker.lorem.word(),
          quantity: product.quantity,
          unit: product.unit,
          harvestDate: faker.date.recent(30),
          expiryDate: faker.date.future(0.5)
        },
        origin: {
          farm: faker.company.companyName(),
          location: faker.address.city(),
          coordinates: {
            type: 'Point',
            coordinates: [
              parseFloat((77 + Math.random() * 10).toFixed(6)),
              parseFloat((20 + Math.random() * 15).toFixed(6))
            ]
          },
          certifications: ['organic', 'fair_trade', 'gmp'][Math.floor(Math.random() * 3)]
        },
        processing: [{
          stage: 'harvesting',
          location: faker.address.city(),
          timestamp: faker.date.recent(20),
          operator: faker.name.findName(),
          notes: faker.lorem.sentence()
        }],
        transportation: [{
          vehicle: faker.vehicle.vehicle(),
          driver: faker.name.findName(),
          route: `${faker.address.city()} to ${faker.address.city()}`,
          startTime: faker.date.recent(10),
          endTime: faker.date.recent(5),
          temperature: Math.floor(Math.random() * 10) + 15,
          humidity: Math.floor(Math.random() * 30) + 50
        }],
        quality: {
          grade: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
          tests: [{
            type: 'pesticide_residue',
            result: 'passed',
            date: faker.date.recent(5),
            lab: faker.company.companyName()
          }],
          certifications: ['organic', 'quality_assured']
        },
        blockchain: {
          transactionHash: faker.datatype.hexaDecimal(64),
          blockNumber: Math.floor(Math.random() * 1000000),
          verified: true,
          timestamp: faker.date.recent(1)
        },
        status: ['in_production', 'harvested', 'processed', 'in_transit', 'delivered'][Math.floor(Math.random() * 5)],
        currentLocation: faker.address.city(),
        estimatedDelivery: faker.date.future(0.1)
      });
    }

    const createdSupplyChain = await SupplyChain.insertMany(supplyChainData);
    console.log(`✅ Created ${createdSupplyChain.length} supply chain records`);

    // Summary
    console.log('\n🎉 Data seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`👥 Users: ${createdUsers.length}`);
    console.log(`   - Farmers: ${farmers.length}`);
    console.log(`   - Buyers: ${buyers.length}`);
    console.log(`   - Logistics: ${logisticsProviders.length}`);
    console.log(`   - Agronomists: ${createdUsers.filter(u => u.role === 'agronomist').length}`);
    console.log(`   - Investors: ${createdUsers.filter(u => u.role === 'investor').length}`);
    console.log(`   - Admins: ${createdUsers.filter(u => u.role === 'admin').length}`);
    console.log(`🌾 Fields: ${createdFields.length}`);
    console.log(`🌱 Crops: ${createdCrops.length}`);
    console.log(`📡 Sensors: ${createdSensors.length}`);
    console.log(`📦 Orders: ${createdOrders.length}`);
    console.log(`🌤️ Weather Records: ${createdWeather.length}`);
    console.log(`📊 Analytics: ${createdAnalytics.length}`);
    console.log(`🔔 Notifications: ${createdNotifications.length}`);
    console.log(`🌐 IoT Data: ${createdIoTData.length}`);
    console.log(`🔗 Supply Chain: ${createdSupplyChain.length}`);

    console.log('\n🔑 Default Login Credentials:');
    console.log('Admin: admin@agrimaan.com / password123');
    console.log('Farmer: farmer1@agrimaan.com / password123');
    console.log('Buyer: buyer1@agrimaan.com / password123');
    console.log('Logistics: logistics1@agrimaan.com / password123');
    console.log('Agronomist: agronomist1@agrimaan.com / password123');
    console.log('Investor: investor1@agrimaan.com / password123');

    console.log('\n🌍 Multi-language Support:');
    console.log('Languages: English, Hindi, Bengali, Telugu, Marathi, Tamil, Gujarati, Kannada, Malayalam, Punjabi, Odia, Spanish, French, Portuguese, Arabic, Chinese');

    console.log('\n🔗 Blockchain Integration:');
    console.log('AGM Token contract ready for deployment');
    console.log('Supply chain tracking with blockchain verification');
    console.log('Smart contracts for farmer rewards and staking');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    mongoose.connection.close();
    console.log('📴 Database connection closed');
    process.exit(0);
  }
};