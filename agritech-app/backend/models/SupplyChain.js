const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['grain', 'fruit', 'vegetable', 'dairy', 'meat', 'processed', 'other'],
    required: true
  },
  producer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  origin: {
    field: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Field'
    },
    farm: {
      name: String,
      address: String,
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: {
          type: [Number] // [longitude, latitude]
        }
      }
    },
    country: String,
    region: String
  },
  crop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop'
  },
  harvestDate: {
    type: Date
  },
  expiryDate: {
    type: Date
  },
  quantity: {
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true
    },
    remainingValue: {
      type: Number
    }
  },
  price: {
    value: {
      type: Number
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  certifications: [{
    type: {
      type: String,
      enum: ['organic', 'fair_trade', 'non_gmo', 'sustainable', 'biodynamic', 'other']
    },
    issuer: String,
    issueDate: Date,
    expiryDate: Date,
    certificateId: String,
    verificationUrl: String
  }],
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbohydrates: Number,
    fat: Number,
    fiber: Number,
    vitamins: mongoose.Schema.Types.Mixed,
    minerals: mongoose.Schema.Types.Mixed
  },
  images: [{
    url: String,
    caption: String,
    isPrimary: Boolean
  }],
  batchNumber: {
    type: String
  },
  lotNumber: {
    type: String
  },
  status: {
    type: String,
    enum: ['harvested', 'processing', 'packaged', 'in_transit', 'delivered', 'sold', 'recalled'],
    default: 'harvested'
  },
  blockchainInfo: {
    isTracked: {
      type: Boolean,
      default: false
    },
    transactionHash: String,
    contractAddress: String,
    tokenId: String
  },
  qrCode: {
    url: String,
    generatedAt: Date
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

// Create a 2dsphere index for geospatial queries
ProductSchema.index({ 'origin.farm.location': '2dsphere' });

const SupplyChainEventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    unique: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  eventType: {
    type: String,
    enum: [
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
    ],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number] // [longitude, latitude]
    },
    name: String,
    address: String
  },
  actor: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    role: String,
    organization: String
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  conditions: {
    temperature: Number,
    humidity: Number,
    other: mongoose.Schema.Types.Mixed
  },
  documents: [{
    type: {
      type: String,
      enum: ['invoice', 'bill_of_lading', 'certificate', 'inspection_report', 'other']
    },
    documentId: String,
    url: String,
    issueDate: Date,
    issuer: String
  }],
  notes: {
    type: String
  },
  images: [{
    url: String,
    caption: String
  }],
  previousEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SupplyChainEvent'
  },
  nextEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SupplyChainEvent'
  },
  blockchainInfo: {
    isRecorded: {
      type: Boolean,
      default: false
    },
    transactionHash: String,
    blockNumber: Number,
    timestamp: Date
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'disputed', 'resolved'],
    default: 'pending'
  },
  verifiedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: Date,
    signature: String
  }]
}, {
  timestamps: true
});

// Create indexes for efficient queries
SupplyChainEventSchema.index({ product: 1, timestamp: -1 });
SupplyChainEventSchema.index({ eventType: 1 });
SupplyChainEventSchema.index({ 'actor.user': 1 });
SupplyChainEventSchema.index({ location: '2dsphere' });

const ShipmentSchema = new mongoose.Schema({
  shipmentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      value: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        required: true
      }
    }
  }],
  sender: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    organization: String,
    address: String,
    contact: String
  },
  receiver: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    organization: String,
    address: String,
    contact: String
  },
  carrier: {
    name: String,
    trackingNumber: String,
    vehicleId: String,
    driverName: String,
    driverContact: String
  },
  origin: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number] // [longitude, latitude]
    },
    name: String,
    address: String
  },
  destination: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number] // [longitude, latitude]
    },
    name: String,
    address: String
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number] // [longitude, latitude]
    },
    updatedAt: Date
  },
  status: {
    type: String,
    enum: ['preparing', 'in_transit', 'delivered', 'cancelled', 'delayed'],
    default: 'preparing'
  },
  departureTime: {
    scheduled: Date,
    actual: Date
  },
  arrivalTime: {
    scheduled: Date,
    actual: Date
  },
  conditions: {
    temperature: [{
      value: Number,
      timestamp: Date
    }],
    humidity: [{
      value: Number,
      timestamp: Date
    }],
    other: mongoose.Schema.Types.Mixed
  },
  documents: [{
    type: {
      type: String,
      enum: ['invoice', 'bill_of_lading', 'packing_list', 'customs_declaration', 'other']
    },
    documentId: String,
    url: String,
    issueDate: Date,
    issuer: String
  }],
  events: [{
    type: {
      type: String,
      enum: ['departure', 'checkpoint', 'delay', 'issue', 'arrival', 'other']
    },
    timestamp: Date,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number] // [longitude, latitude]
      },
      name: String
    },
    description: String
  }],
  blockchainInfo: {
    isRecorded: {
      type: Boolean,
      default: false
    },
    transactionHash: String,
    contractAddress: String
  },
  notes: {
    type: String
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

// Create indexes for efficient queries
ShipmentSchema.index({ 'products.product': 1 });
ShipmentSchema.index({ 'sender.user': 1 });
ShipmentSchema.index({ 'receiver.user': 1 });
ShipmentSchema.index({ status: 1 });
ShipmentSchema.index({ origin: '2dsphere' });
ShipmentSchema.index({ destination: '2dsphere' });
ShipmentSchema.index({ currentLocation: '2dsphere' });

const MarketplaceListingSchema = new mongoose.Schema({
  listingId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['grain', 'fruit', 'vegetable', 'dairy', 'meat', 'processed', 'other'],
    required: true
  },
  quantity: {
    available: {
      value: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        required: true
      }
    },
    minimum: {
      value: {
        type: Number
      },
      unit: {
        type: String
      }
    },
    maximum: {
      value: {
        type: Number
      },
      unit: {
        type: String
      }
    }
  },
  price: {
    value: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    isNegotiable: {
      type: Boolean,
      default: false
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number] // [longitude, latitude]
    },
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  images: [{
    url: String,
    caption: String,
    isPrimary: Boolean
  }],
  certifications: [{
    type: {
      type: String,
      enum: ['organic', 'fair_trade', 'non_gmo', 'sustainable', 'biodynamic', 'other']
    },
    issuer: String,
    verificationUrl: String
  }],
  harvestDate: {
    type: Date
  },
  expiryDate: {
    type: Date
  },
  deliveryOptions: [{
    type: {
      type: String,
      enum: ['pickup', 'delivery', 'shipping']
    },
    cost: {
      value: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    },
    estimatedTime: String
  }],
  paymentOptions: [{
    type: {
      type: String,
      enum: ['cash', 'bank_transfer', 'credit_card', 'agm_token', 'other']
    },
    details: String
  }],
  status: {
    type: String,
    enum: ['active', 'pending', 'sold', 'cancelled', 'expired'],
    default: 'active'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'network_only'],
    default: 'public'
  },
  views: {
    type: Number,
    default: 0
  },
  favorites: {
    type: Number,
    default: 0
  },
  favoriteUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  blockchainInfo: {
    isListed: {
      type: Boolean,
      default: false
    },
    transactionHash: String,
    contractAddress: String,
    listingId: String
  },
  expiresAt: {
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

// Create indexes for efficient queries
MarketplaceListingSchema.index({ seller: 1 });
MarketplaceListingSchema.index({ category: 1 });
MarketplaceListingSchema.index({ status: 1 });
MarketplaceListingSchema.index({ location: '2dsphere' });
MarketplaceListingSchema.index({ 'certifications.type': 1 });

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MarketplaceListing'
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: {
      value: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        required: true
      }
    },
    price: {
      value: {
        type: Number,
        required: true
      },
      currency: {
        type: String,
        default: 'USD'
      }
    }
  }],
  totalAmount: {
    subtotal: {
      value: {
        type: Number,
        required: true
      },
      currency: {
        type: String,
        default: 'USD'
      }
    },
    tax: {
      value: {
        type: Number,
        default: 0
      },
      currency: {
        type: String,
        default: 'USD'
      }
    },
    shipping: {
      value: {
        type: Number,
        default: 0
      },
      currency: {
        type: String,
        default: 'USD'
      }
    },
    discount: {
      value: {
        type: Number,
        default: 0
      },
      currency: {
        type: String,
        default: 'USD'
      }
    },
    total: {
      value: {
        type: Number,
        required: true
      },
      currency: {
        type: String,
        default: 'USD'
      }
    }
  },
  paymentMethod: {
    type: {
      type: String,
      enum: ['cash', 'bank_transfer', 'credit_card', 'agm_token', 'other'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    receiptUrl: String,
    paidAt: Date
  },
  delivery: {
    method: {
      type: String,
      enum: ['pickup', 'delivery', 'shipping'],
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    contact: {
      name: String,
      phone: String,
      email: String
    },
    trackingNumber: String,
    carrier: String,
    estimatedDelivery: Date,
    actualDelivery: Date,
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded', 'disputed'],
    default: 'pending'
  },
  notes: {
    buyer: String,
    seller: String,
    internal: String
  },
  events: [{
    type: {
      type: String,
      enum: ['order_placed', 'payment_received', 'processing_started', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded', 'other']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    description: String,
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  blockchainInfo: {
    isRecorded: {
      type: Boolean,
      default: false
    },
    transactionHash: String,
    contractAddress: String,
    smartContractId: String
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

// Create indexes for efficient queries
OrderSchema.index({ buyer: 1 });
OrderSchema.index({ seller: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ 'products.product': 1 });
OrderSchema.index({ createdAt: -1 });

const Product = mongoose.model('Product', ProductSchema);
const SupplyChainEvent = mongoose.model('SupplyChainEvent', SupplyChainEventSchema);
const Shipment = mongoose.model('Shipment', ShipmentSchema);
const MarketplaceListing = mongoose.model('MarketplaceListing', MarketplaceListingSchema);
const Order = mongoose.model('Order', OrderSchema);

module.exports = {
  Product,
  SupplyChainEvent,
  Shipment,
  MarketplaceListing,
  Order
};