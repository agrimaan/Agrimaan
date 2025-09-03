const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  boundaries: {
    type: {
      type: String,
      enum: ['Polygon'],
      default: 'Polygon'
    },
    coordinates: {
      type: [[[Number]]], // Array of arrays of coordinates forming polygons
      required: true
    }
  },
  area: {
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['hectare', 'acre'],
      default: 'hectare'
    }
  },
  soilType: {
    type: String,
    enum: ['clay', 'sandy', 'loamy', 'silty', 'peaty', 'chalky', 'other'],
    default: 'other'
  },
  crops: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop'
  }],
  sensors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sensor'
  }],
  weather: {
    station: {
      type: String
    },
    lastUpdated: {
      type: Date
    }
  },
  irrigationSystem: {
    type: {
      type: String,
      enum: ['drip', 'sprinkler', 'flood', 'center pivot', 'none'],
      default: 'none'
    },
    isAutomated: {
      type: Boolean,
      default: false
    }
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

// Create a 2dsphere index for geospatial queries
FieldSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Field', FieldSchema);