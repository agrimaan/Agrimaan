const mongoose = require('mongoose');

const BulkUploadSchema = new mongoose.Schema({
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  uploadType: {
    type: String,
    enum: ['farmer', 'buyer', 'logistics', 'agronomist', 'investor'],
    required: true
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed', 'partially_completed'],
    default: 'processing'
  },
  totalRecords: {
    type: Number,
    default: 0
  },
  processedRecords: {
    type: Number,
    default: 0
  },
  successfulRecords: {
    type: Number,
    default: 0
  },
  failedRecords: {
    type: Number,
    default: 0
  },
  errors: [{
    row: Number,
    field: String,
    message: String,
    data: mongoose.Schema.Types.Mixed
  }],
  warnings: [{
    row: Number,
    field: String,
    message: String,
    data: mongoose.Schema.Types.Mixed
  }],
  processedData: [{
    row: Number,
    status: {
      type: String,
      enum: ['success', 'failed', 'warning']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    data: mongoose.Schema.Types.Mixed,
    error: String
  }],
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  processingTime: Number, // in milliseconds
  notes: String
}, {
  timestamps: true
});

// Index for efficient querying
BulkUploadSchema.index({ uploadedBy: 1, createdAt: -1 });
BulkUploadSchema.index({ status: 1 });
BulkUploadSchema.index({ uploadType: 1 });

module.exports = mongoose.model('BulkUpload', BulkUploadSchema);