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
    required: function() {
      return !this.oauth || !this.oauth.googleId; // Password not required for OAuth users
    }
  },
  role: {
    type: String,
    enum: ['farmer', 'agronomist', 'admin', 'investor', 'buyer', 'logistics'],
    default: 'farmer'
  },
  
  // Enhanced verification system
  verificationStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified'],
    default: 'unverified'
  },
  
  // Email verification
  emailVerification: {
    verified: {
      type: Boolean,
      default: false
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    verificationSentAt: Date
  },
  
  // Phone verification with OTP
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
      expiresAt: Date,
      attempts: {
        type: Number,
        default: 0
      }
    }
  },
  
  // OAuth integration
  oauth: {
    googleId: String,
    googleEmail: String,
    provider: {
      type: String,
      enum: ['google', 'local'],
      default: 'local'
    }
  },
  
  // Terms and conditions acceptance
  termsAcceptance: {
    accepted: {
      type: Boolean,
      default: false
    },
    acceptedAt: Date,
    version: String,
    ipAddress: String
  },
  
  // Communication preferences
  communicationPreferences: {
    email: {
      marketing: {
        type: Boolean,
        default: false
      },
      notifications: {
        type: Boolean,
        default: true
      },
      updates: {
        type: Boolean,
        default: true
      }
    },
    sms: {
      marketing: {
        type: Boolean,
        default: false
      },
      notifications: {
        type: Boolean,
        default: true
      },
      updates: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // Admin verification tracking
  adminVerification: {
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    verificationNotes: String,
    rejectionReason: String
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

// Method to generate OTP
UserSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.phone.verificationCode = {
    code: otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    attempts: 0
  };
  return otp;
};

// Method to verify OTP
UserSchema.methods.verifyOTP = function(otp) {
  if (!this.phone.verificationCode) return false;
  if (this.phone.verificationCode.expiresAt < new Date()) return false;
  if (this.phone.verificationCode.attempts >= 3) return false;
  
  this.phone.verificationCode.attempts += 1;
  
  if (this.phone.verificationCode.code === otp) {
    this.phone.verified = true;
    this.phone.verificationCode = undefined;
    return true;
  }
  
  return false;
};

// Method to generate email verification token
UserSchema.methods.generateEmailVerificationToken = function() {
  const token = require('crypto').randomBytes(32).toString('hex');
  this.emailVerification.verificationToken = token;
  this.emailVerification.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  this.emailVerification.verificationSentAt = new Date();
  return token;
};

module.exports = mongoose.model('User', UserSchema);