const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  Fields: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fields',
    required: true
  },
  crop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop'
  },
  date: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['yield_prediction', 'pest_risk', 'disease_risk', 'irrigation_recommendation', 'fertilizer_recommendation', 'harvest_timing', 'planting_recommendation', 'other'],
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  confidence: {
    type: Number, // percentage
    min: 0,
    max: 100
  },
  factors: [{
    name: {
      type: String
    },
    value: {
      type: mongoose.Schema.Types.Mixed
    },
    weight: {
      type: Number
    }
  }],
  recommendations: [{
    action: {
      type: String
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    timeframe: {
      type: String
    },
    details: {
      type: String
    }
  }],
  modelVersion: {
    type: String
  },
  source: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
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

module.exports = mongoose.model('Analytics', AnalyticsSchema);