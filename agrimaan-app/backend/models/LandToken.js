const mongoose = require('mongoose');

const LandTokenSchema = new mongoose.Schema({
  // Basic land information
  landId: {
    type: String,
    required: true,
    unique: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Land details
  landDetails: {
    area: {
      value: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        enum: ['acres', 'hectares', 'square_meters', 'square_feet'],
        default: 'acres'
      }
    },
    location: {
      address: String,
      city: String,
      state: String,
      country: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      },
      boundaries: [{
        latitude: Number,
        longitude: Number
      }]
    },
    soilType: String,
    landUse: {
      type: String,
      enum: ['agricultural', 'residential', 'commercial', 'industrial', 'mixed'],
      default: 'agricultural'
    },
    waterSource: String,
    irrigation: {
      type: String,
      enum: ['rain-fed', 'irrigated', 'drip', 'sprinkler', 'flood'],
      default: 'rain-fed'
    }
  },
  
  // Legal documentation
  legalDocuments: {
    surveyNumber: String,
    registrationNumber: String,
    titleDeedNumber: String,
    documents: [{
      type: {
        type: String,
        enum: ['title_deed', 'survey_document', 'tax_receipt', 'no_objection_certificate', 'other']
      },
      fileName: String,
      fileUrl: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Tokenization details
  tokenization: {
    totalTokens: {
      type: Number,
      required: true
    },
    tokenPrice: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    availableTokens: {
      type: Number,
      required: true
    },
    soldTokens: {
      type: Number,
      default: 0
    },
    minimumPurchase: {
      type: Number,
      default: 1
    },
    maximumPurchase: Number
  },
  
  // Blockchain integration
  blockchain: {
    contractAddress: String,
    tokenStandard: {
      type: String,
      enum: ['ERC-20', 'ERC-721', 'ERC-1155'],
      default: 'ERC-20'
    },
    networkId: String,
    transactionHash: String,
    blockNumber: Number,
    gasUsed: Number
  },
  
  // Verification and approval
  verification: {
    status: {
      type: String,
      enum: ['pending', 'under_review', 'verified', 'rejected'],
      default: 'pending'
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    verificationNotes: String,
    rejectionReason: String,
    documents: [{
      type: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected']
      },
      notes: String
    }]
  },
  
  // Investment tracking
  investors: [{
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    tokensOwned: Number,
    purchasePrice: Number,
    purchaseDate: Date,
    transactionHash: String
  }],
  
  // Revenue sharing
  revenueSharing: {
    enabled: {
      type: Boolean,
      default: false
    },
    percentage: Number, // Percentage of revenue to be shared with token holders
    frequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'annually', 'harvest'],
      default: 'harvest'
    },
    lastDistribution: Date,
    totalDistributed: {
      type: Number,
      default: 0
    }
  },
  
  // Status and metadata
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'active', 'sold_out', 'suspended', 'expired'],
    default: 'draft'
  },
  
  // Crop and yield information
  cropInformation: {
    currentCrop: String,
    expectedYield: Number,
    yieldUnit: String,
    harvestDate: Date,
    cropHistory: [{
      crop: String,
      yield: Number,
      yieldUnit: String,
      harvestDate: Date,
      revenue: Number
    }]
  },
  
  // Market information
  marketData: {
    valuation: Number,
    lastValuationDate: Date,
    marketTrends: String,
    comparableProperties: [{
      location: String,
      area: Number,
      price: Number,
      date: Date
    }]
  },
  
  // Expiry and terms
  terms: {
    duration: Number, // in months
    startDate: Date,
    endDate: Date,
    autoRenewal: {
      type: Boolean,
      default: false
    },
    exitClause: String
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
LandTokenSchema.index({ owner: 1 });
LandTokenSchema.index({ 'verification.status': 1 });
LandTokenSchema.index({ status: 1 });
LandTokenSchema.index({ 'landDetails.location.state': 1 });
LandTokenSchema.index({ 'landDetails.location.city': 1 });
LandTokenSchema.index({ 'tokenization.tokenPrice': 1 });

// Virtual for calculating token utilization percentage
LandTokenSchema.virtual('tokenUtilization').get(function() {
  return (this.tokenization.soldTokens / this.tokenization.totalTokens) * 100;
});

// Method to calculate total investment
LandTokenSchema.methods.getTotalInvestment = function() {
  return this.tokenization.soldTokens * this.tokenization.tokenPrice;
};

// Method to check if land is fully tokenized
LandTokenSchema.methods.isFullyTokenized = function() {
  return this.tokenization.soldTokens >= this.tokenization.totalTokens;
};

module.exports = mongoose.model('LandToken', LandTokenSchema);