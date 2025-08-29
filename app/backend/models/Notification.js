const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['alert', 'info', 'success', 'warning', 'error'],
    default: 'info'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['system', 'weather', 'crop', 'field', 'sensor', 'analytics', 'blockchain', 'marketplace', 'other'],
    default: 'system'
  },
  relatedField: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Field'
  },
  relatedCrop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop'
  },
  relatedSensor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sensor'
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionLink: {
    type: String
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, category: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);