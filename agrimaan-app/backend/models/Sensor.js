const mongoose = require('mongoose');

const SensorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['soil_moisture', 'temperature', 'humidity', 'rainfall', 'light', 'wind', 'soil_nutrient', 'water_level', 'other'],
    required: true
  },
  field: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Field',
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
  manufacturer: {
    type: String
  },
  model: {
    type: String
  },
  serialNumber: {
    type: String,
    unique: true
  },
  installationDate: {
    type: Date,
    default: Date.now
  },
  batteryLevel: {
    type: Number, // percentage
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'error'],
    default: 'active'
  },
  lastMaintenance: {
    type: Date
  },
  nextMaintenance: {
    type: Date
  },
  firmwareVersion: {
    type: String
  },
  measurementUnit: {
    type: String
  },
  measurementRange: {
    min: {
      type: Number
    },
    max: {
      type: Number
    }
  },
  accuracy: {
    type: Number
  },
  calibrationDate: {
    type: Date
  },
  dataTransmissionInterval: {
    type: Number, // in minutes
    default: 60
  },
  lastReading: {
    value: {
      type: mongoose.Schema.Types.Mixed
    },
    timestamp: {
      type: Date
    }
  },
  readings: [{
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  alerts: [{
    type: {
      type: String,
      enum: ['low_battery', 'out_of_range', 'connection_lost', 'malfunction', 'other']
    },
    message: {
      type: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    resolved: {
      type: Boolean,
      default: false
    },
    resolvedAt: {
      type: Date
    }
  }],
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
SensorSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Sensor', SensorSchema);