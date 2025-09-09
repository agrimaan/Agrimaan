const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['farmer', 'agronomist', 'admin', 'investor', 'buyer', 'logistics'],
    default: 'farmer'
  },
  phone: {
    number: {
      type: String,
      trim: true
    },
    verified: {
      type: Boolean,
      default: false
    },
    verificationCode: {
      code: String,
      expiresAt: Date
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  profileImage: {
    type: String
  },
  fields: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fields'
  }],
  // New fields for buyer role
  purchaseHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  // New fields for logistics provider role
  logistics: {
    vehicleTypes: [{
      type: String,
      enum: ['truck', 'van', 'pickup', 'refrigerated', 'mini-truck', 'other']
    }],
    serviceAreas: [{
      state: String,
      districts: [String]
    }],
    capacity: {
      maxWeight: Number, // in kg
      maxVolume: Number, // in cubic meters
    },
    services: [{
      type: String,
      enum: ['transportation', 'storage', 'cold-chain', 'packaging', 'distribution']
    }],
    verified: {
      type: Boolean,
      default: false
    },
    rating: {
      average: {
        type: Number,
        default: 0
      },
      count: {
        type: Number,
        default: 0
      }
    }
  },
  // New fields for admin role
  isSystemAdmin: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);