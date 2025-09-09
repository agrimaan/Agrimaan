const mongoose = require('mongoose');

const CropSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  Fields: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fields',
    required: true
  },
  variety: {
    type: String,
    trim: true
  },
  plantingDate: {
    type: Date,
    required: true
  },
  harvestDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['planned', 'planted', 'growing', 'harvested', 'failed'],
    default: 'planned'
  },
  growthStage: {
    type: String,
    enum: ['germination', 'vegetative', 'flowering', 'ripening', 'mature'],
    default: 'germination'
  },
  expectedYield: {
    value: {
      type: Number
    },
    unit: {
      type: String,
      enum: ['kg/ha', 'ton/ha', 'lb/acre', 'bushel/acre'],
      default: 'kg/ha'
    }
  },
  actualYield: {
    value: {
      type: Number
    },
    unit: {
      type: String,
      enum: ['kg/ha', 'ton/ha', 'lb/acre', 'bushel/acre'],
      default: 'kg/ha'
    }
  },
  healthStatus: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'critical'],
    default: 'good'
  },
  pestIssues: [{
    type: {
      type: String
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    },
    detectedDate: {
      type: Date,
      default: Date.now
    },
    treatedDate: {
      type: Date
    },
    treatment: {
      type: String
    }
  }],
  diseaseIssues: [{
    type: {
      type: String
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    },
    detectedDate: {
      type: Date,
      default: Date.now
    },
    treatedDate: {
      type: Date
    },
    treatment: {
      type: String
    }
  }],
  fertilizers: [{
    name: {
      type: String
    },
    applicationDate: {
      type: Date
    },
    amount: {
      value: {
        type: Number
      },
      unit: {
        type: String,
        enum: ['kg/ha', 'lb/acre'],
        default: 'kg/ha'
      }
    },
    nutrientContent: {
      nitrogen: Number,
      phosphorus: Number,
      potassium: Number
    }
  }],
  irrigationEvents: [{
    date: {
      type: Date,
      default: Date.now
    },
    amount: {
      value: {
        type: Number
      },
      unit: {
        type: String,
        enum: ['mm', 'inches'],
        default: 'mm'
      }
    },
    method: {
      type: String,
      enum: ['drip', 'sprinkler', 'flood', 'center pivot', 'manual'],
      default: 'manual'
    },
    duration: {
      type: Number, // in minutes
    }
  }],
  notes: {
    type: String
  },
  images: [{
    url: {
      type: String
    },
    date: {
      type: Date,
      default: Date.now
    },
    description: {
      type: String
    }
  }],
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

module.exports = mongoose.model('Crop', CropSchema);