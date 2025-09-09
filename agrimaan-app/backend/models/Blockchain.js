const mongoose = require('mongoose');

const BlockchainTransactionSchema = new mongoose.Schema({
  transactionHash: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  fromAddress: {
    type: String,
    required: true,
    trim: true
  },
  toAddress: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true
  },
  tokenType: {
    type: String,
    enum: ['AGM', 'Fields', 'FARMHOUSE', 'OTHER'],
    default: 'AGM'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  blockNumber: {
    type: Number
  },
  gasUsed: {
    type: Number
  },
  networkFee: {
    type: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['user', 'Fields', 'crop', 'sensor', 'product', 'contract']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    }
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

const SmartContractSchema = new mongoose.Schema({
  contractAddress: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  contractName: {
    type: String,
    required: true,
    trim: true
  },
  contractType: {
    type: String,
    enum: ['token', 'marketplace', 'supply_chain', 'yield_sharing', 'Fields_ownership', 'other'],
    required: true
  },
  abi: {
    type: String,
    required: true
  },
  bytecode: {
    type: String
  },
  deploymentTransaction: {
    type: String,
    trim: true
  },
  network: {
    type: String,
    enum: ['mainnet', 'testnet', 'polygon', 'polygon_testnet', 'private'],
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'deprecated'],
    default: 'active'
  },
  version: {
    type: String,
    default: '1.0.0'
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

const WalletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  publicKey: {
    type: String,
    trim: true
  },
  encryptedPrivateKey: {
    type: String
  },
  walletType: {
    type: String,
    enum: ['custodial', 'non_custodial'],
    default: 'custodial'
  },
  balances: [{
    tokenType: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'locked'],
    default: 'active'
  },
  recoveryPhrase: {
    hint: String,
    encryptedPhrase: String
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

const TokenSchema = new mongoose.Schema({
  tokenId: {
    type: String,
    required: true,
    unique: true
  },
  tokenType: {
    type: String,
    enum: ['ERC20', 'ERC721', 'ERC1155'],
    required: true
  },
  contractAddress: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  previousOwners: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    transferDate: {
      type: Date
    },
    transactionHash: {
      type: String
    }
  }],
  metadata: {
    name: String,
    description: String,
    image: String,
    attributes: mongoose.Schema.Types.Mixed
  },
  assetType: {
    type: String,
    enum: ['Fields', 'farmhouse', 'equipment', 'crop_yield', 'other'],
    required: true
  },
  assetDetails: {
    // For Fields
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number] // [longitude, latitude]
      }
    },
    boundaries: {
      type: {
        type: String,
        enum: ['Polygon'],
        default: 'Polygon'
      },
      coordinates: {
        type: [[[Number]]] // Array of arrays of coordinates forming polygons
      }
    },
    area: {
      value: Number,
      unit: {
        type: String,
        enum: ['hectare', 'acre'],
        default: 'hectare'
      }
    },
    // For farmhouse
    buildingDetails: {
      size: Number,
      rooms: Number,
      yearBuilt: Number,
      facilities: [String]
    },
    // For equipment
    equipmentDetails: {
      type: String,
      manufacturer: String,
      model: String,
      yearManufactured: Number,
      condition: String
    },
    // For crop yield
    cropYieldDetails: {
      crop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Crop'
      },
      harvestDate: Date,
      quantity: Number,
      quality: String
    }
  },
  value: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    lastValuation: Date
  },
  fractionalOwnership: {
    isEnabled: {
      type: Boolean,
      default: false
    },
    totalShares: {
      type: Number,
      default: 100
    },
    availableShares: {
      type: Number,
      default: 100
    },
    shareholders: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      shares: Number,
      purchaseDate: Date,
      purchasePrice: Number
    }]
  },
  yieldSharing: {
    isEnabled: {
      type: Boolean,
      default: false
    },
    yieldPercentage: {
      type: Number,
      default: 0
    },
    distributionFrequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'biannually', 'annually'],
      default: 'quarterly'
    },
    nextDistributionDate: Date,
    distributions: [{
      date: Date,
      amount: Number,
      transactionHash: String
    }]
  },
  status: {
    type: String,
    enum: ['active', 'locked', 'transferred', 'burned'],
    default: 'active'
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

// Create geospatial indexes for Fields tokens
TokenSchema.index({ 'assetDetails.location': '2dsphere' });

const BlockchainTransaction = mongoose.model('BlockchainTransaction', BlockchainTransactionSchema);
const SmartContract = mongoose.model('SmartContract', SmartContractSchema);
const Wallet = mongoose.model('Wallet', WalletSchema);
const Token = mongoose.model('Token', TokenSchema);

module.exports = {
  BlockchainTransaction,
  SmartContract,
  Wallet,
  Token
};