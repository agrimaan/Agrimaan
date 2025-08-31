// backend/server.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// --- Middleware ---
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// --- Public routes (no auth) ---
app.use('/api', require('./routes/public.weather.routes')); // e.g., /api/public-weather-...

// --- App routes ---
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/crops', require('./routes/crop.routes'));
app.use('/api/fields', require('./routes/field.routes'));
app.use('/api/sensors', require('./routes/sensor.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/advanced-analytics', require('./routes/advanced-analytics.routes'));
app.use('/api/weather', require('./routes/weather.routes'));

// --- NEW: AI routes (OpenAI) ---
app.use('/api/ai', require('./routes/ai.routes'));

// --- Default route ---
app.get('/', (_req, res) => {
  res.send('agrimaan API is running');
});

// --- Error handling (keep LAST) ---
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something went wrong!', error: err.message });
});

app.use('/api', require('./routes/geo.routes'));

// --- Mongo & Server ---
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/agrimaan';

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

start();
