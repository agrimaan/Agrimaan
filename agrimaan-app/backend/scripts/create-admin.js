/**
 * Script to create the default admin user
 * 
 * Usage:
 * node create-admin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('MongoDB connected');
  
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'agmadmin@agrimaan.io' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      mongoose.disconnect();
      return;
    }
    
    // Create admin user
    const adminUser = new User({
      name: 'Agrimaan Admin',
      email: 'agmadmin@agrimaan.io',
      password: 'agmadmin', // Will be hashed by the pre-save hook
      role: 'admin',
      isSystemAdmin: true,
      address: {
        street: 'Admin Office',
        city: 'Rohini',
        state: 'New Delhi',
        country: 'India',
        zipCode: '110085'
      }
    });
    
    await adminUser.save();
    console.log('Admin user created successfully');
    
    mongoose.disconnect();
  } catch (err) {
    console.error('Error creating admin user:', err);
    mongoose.disconnect();
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});