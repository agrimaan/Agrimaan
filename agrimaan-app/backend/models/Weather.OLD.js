const mongoose = require('mongoose');

const WeatherSchema = new mongoose.Schema({
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
  field: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Field'
  },
  date: {
    type: Date,
    required: true
  },
  temperature: {
    current: {
      type: Number
    },
    min: {
      type: Number
    },
    max: {
      type: Number
    },
    unit: {
      type: String,
      enum: ['celsius', 'fahrenheit'],
      default: 'celsius'
    }
  },
  humidity: {
    type: Number, // percentage
    min: 0,
    max: 100
  },
  precipitation: {
    amount: {
      type: Number
    },
    type: {
      type: String,
      enum: ['rain', 'snow', 'sleet', 'hail', 'none'],
      default: 'none'
    },
    unit: {
      type: String,
      enum: ['mm', 'inches'],
      default: 'mm'
    },
    probability: {
      type: Number, // percentage
      min: 0,
      max: 100
    }
  },
  wind: {
    speed: {
      type: Number
    },
    direction: {
      type: Number, // degrees
      min: 0,
      max: 360
    },
    unit: {
      type: String,
      enum: ['km/h', 'mph', 'm/s'],
      default: 'km/h'
    }
  },
  pressure: {
    value: {
      type: Number
    },
    unit: {
      type: String,
      enum: ['hPa', 'inHg'],
      default: 'hPa'
    }
  },
  cloudCover: {
    type: Number, // percentage
    min: 0,
    max: 100
  },
  uvIndex: {
    type: Number,
    min: 0
  },
  visibility: {
    value: {
      type: Number
    },
    unit: {
      type: String,
      enum: ['km', 'miles'],
      default: 'km'
    }
  },
  sunrise: {
    type: Date
  },
  sunset: {
    type: Date
  },
  source: {
    type: String, // e.g., 'OpenWeatherMap', 'WeatherAPI', 'Local Station'
    required: true
  },
  forecast: [{
    date: {
      type: Date
    },
    temperature: {
      min: {
        type: Number
      },
      max: {
        type: Number
      }
    },
    precipitation: {
      amount: {
        type: Number
      },
      probability: {
        type: Number
      }
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

// Create a 2dsphere index for geospatial queries
WeatherSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Weather', WeatherSchema);