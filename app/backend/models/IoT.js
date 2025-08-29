const mongoose = require('mongoose');

const IoTDeviceSchema = new mongoose.Schema({
  deviceId: {
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
  deviceType: {
    type: String,
    enum: [
      'soil_moisture_sensor',
      'temperature_sensor',
      'humidity_sensor',
      'rainfall_sensor',
      'light_sensor',
      'wind_sensor',
      'soil_nutrient_sensor',
      'water_level_sensor',
      'camera',
      'drone',
      'weather_station',
      'irrigation_controller',
      'other'
    ],
    required: true
  },
  manufacturer: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  firmwareVersion: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  field: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Field'
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
    },
    altitude: {
      type: Number // in meters
    },
    accuracy: {
      type: Number // in meters
    }
  },
  installationDate: {
    type: Date,
    default: Date.now
  },
  lastMaintenance: {
    type: Date
  },
  nextMaintenance: {
    type: Date
  },
  batteryLevel: {
    type: Number, // percentage
    min: 0,
    max: 100
  },
  powerSource: {
    type: String,
    enum: ['battery', 'solar', 'wired', 'hybrid'],
    default: 'battery'
  },
  connectionType: {
    type: String,
    enum: ['wifi', 'cellular', 'lora', 'bluetooth', 'zigbee', 'satellite', 'other'],
    default: 'wifi'
  },
  ipAddress: {
    type: String,
    trim: true
  },
  macAddress: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'error', 'offline'],
    default: 'active'
  },
  lastConnected: {
    type: Date
  },
  configuration: {
    type: mongoose.Schema.Types.Mixed
  },
  calibrationData: {
    lastCalibration: Date,
    calibrationValues: mongoose.Schema.Types.Mixed,
    calibrationBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
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
IoTDeviceSchema.index({ location: '2dsphere' });

const SensorReadingSchema = new mongoose.Schema({
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IoTDevice',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  readingType: {
    type: String,
    enum: [
      'soil_moisture',
      'temperature',
      'humidity',
      'rainfall',
      'light',
      'wind_speed',
      'wind_direction',
      'soil_ph',
      'soil_nitrogen',
      'soil_phosphorus',
      'soil_potassium',
      'water_level',
      'image',
      'video',
      'other'
    ],
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  unit: {
    type: String
  },
  quality: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'invalid'],
    default: 'good'
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
    altitude: {
      type: Number // in meters
    }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  field: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Field'
  },
  crop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop'
  },
  alerts: [{
    type: {
      type: String,
      enum: ['warning', 'critical', 'information']
    },
    message: {
      type: String
    },
    threshold: {
      type: mongoose.Schema.Types.Mixed
    },
    status: {
      type: String,
      enum: ['active', 'acknowledged', 'resolved'],
      default: 'active'
    }
  }]
}, {
  timestamps: true
});

// Create a compound index for efficient queries by device and timestamp
SensorReadingSchema.index({ device: 1, timestamp: -1 });
// Create a compound index for field and timestamp
SensorReadingSchema.index({ field: 1, timestamp: -1 });
// Create a compound index for readingType and timestamp
SensorReadingSchema.index({ readingType: 1, timestamp: -1 });

const IoTAlertSchema = new mongoose.Schema({
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IoTDevice'
  },
  field: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Field'
  },
  crop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop'
  },
  alertType: {
    type: String,
    enum: [
      'low_battery',
      'device_offline',
      'sensor_malfunction',
      'calibration_needed',
      'threshold_exceeded',
      'threshold_below',
      'connection_lost',
      'firmware_update',
      'security_alert',
      'other'
    ],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  value: {
    type: mongoose.Schema.Types.Mixed
  },
  threshold: {
    type: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved', 'false_alarm'],
    default: 'active'
  },
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  acknowledgedAt: {
    type: Date
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  resolutionNotes: {
    type: String
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  notificationChannels: [{
    type: String,
    enum: ['email', 'sms', 'push', 'in_app']
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Create indexes for efficient queries
IoTAlertSchema.index({ device: 1, timestamp: -1 });
IoTAlertSchema.index({ field: 1, timestamp: -1 });
IoTAlertSchema.index({ status: 1, severity: 1 });

const MaintenanceLogSchema = new mongoose.Schema({
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IoTDevice',
    required: true
  },
  maintenanceType: {
    type: String,
    enum: ['routine', 'repair', 'calibration', 'battery_replacement', 'firmware_update', 'other'],
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  performedAt: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    required: true
  },
  actions: [{
    action: {
      type: String
    },
    result: {
      type: String
    }
  }],
  partsReplaced: [{
    part: {
      type: String
    },
    serialNumber: {
      type: String
    }
  }],
  beforeStatus: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'error', 'offline']
  },
  afterStatus: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'error', 'offline']
  },
  nextMaintenanceDue: {
    type: Date
  },
  cost: {
    amount: {
      type: Number
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  attachments: [{
    name: {
      type: String
    },
    fileUrl: {
      type: String
    },
    fileType: {
      type: String
    }
  }],
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Create indexes for efficient queries
MaintenanceLogSchema.index({ device: 1, performedAt: -1 });
MaintenanceLogSchema.index({ performedBy: 1 });

const EdgeDeviceSchema = new mongoose.Schema({
  deviceId: {
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
  deviceType: {
    type: String,
    enum: ['gateway', 'edge_server', 'fog_node', 'other'],
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  field: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Field'
  },
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
  connectedDevices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IoTDevice'
  }],
  processingCapabilities: {
    cpu: {
      type: String
    },
    memory: {
      type: String
    },
    storage: {
      type: String
    }
  },
  operatingSystem: {
    type: String
  },
  firmwareVersion: {
    type: String
  },
  ipAddress: {
    type: String
  },
  macAddress: {
    type: String
  },
  connectionType: {
    type: String,
    enum: ['ethernet', 'wifi', 'cellular', 'satellite', 'other']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'error'],
    default: 'active'
  },
  lastConnected: {
    type: Date
  },
  deployedModels: [{
    modelName: {
      type: String
    },
    version: {
      type: String
    },
    purpose: {
      type: String
    },
    lastUpdated: {
      type: Date
    }
  }],
  configuration: {
    type: mongoose.Schema.Types.Mixed
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Create a 2dsphere index for geospatial queries
EdgeDeviceSchema.index({ location: '2dsphere' });

const IoTDevice = mongoose.model('IoTDevice', IoTDeviceSchema);
const SensorReading = mongoose.model('SensorReading', SensorReadingSchema);
const IoTAlert = mongoose.model('IoTAlert', IoTAlertSchema);
const MaintenanceLog = mongoose.model('MaintenanceLog', MaintenanceLogSchema);
const EdgeDevice = mongoose.model('EdgeDevice', EdgeDeviceSchema);

module.exports = {
  IoTDevice,
  SensorReading,
  IoTAlert,
  MaintenanceLog,
  EdgeDevice
};