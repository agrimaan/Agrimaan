// backend/server.js
require('dotenv').config();

const fs = require('fs');
const http = require('http');
const https = require('https');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

// routes/dev.seed.routes.js (dev only)
const router = require('express').Router();
//const bcrypt = require('bcryptjs');
//const User = require('../models/User');

const app = express();

/* -------------------- Config -------------------- */
const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.HOST || 'localhost';

// DB toggle: if USE_REAL_DB is unset/falsey -> use mock
const useMockDb = !process.env.USE_REAL_DB;

const FRONTEND_ORIGIN =
  process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

const USE_HTTPS = String(process.env.HTTPS || '').toLowerCase() === 'true';
const HTTPS_KEY_PATH = process.env.HTTPS_KEY || './key.pem';
const HTTPS_CERT_PATH = process.env.HTTPS_CERT || './cert.pem';

/* -------------------- Middleware -------------------- */
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

/* -------------------- Routes -------------------- */
// Public
app.use('/api', require('./routes/public.weather.routes')); // e.g., /api/public-weather-...

// App routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/crops', require('./routes/crop.routes'));
app.use('/api/fields', require('./routes/fields.routes'));
app.use('/api/sensors', require('./routes/sensor.routes'));
app.use('/api/analytics/recommendations', require('./routes/analytics.recommendations.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/advanced-analytics', require('./routes/advanced-analytics.routes'));
app.use('/api/weather', require('./routes/weather.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/marketplace', require('./routes/marketplace.routes'));

// NEW: AI routes (OpenAI)
app.use('/api/ai', require('./routes/ai.routes'));

// Geo (after others is fine)
app.use('/api', require('./routes/geo.routes'));

// Default route
app.get('/', (_req, res) => {
  res.send('agrimaan API is running');
});

// Error handler (keep last)
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something went wrong!', error: err.message });
});

/* -------------------- Server factory -------------------- */
function buildServer() {
  if (!USE_HTTPS) return http.createServer(app);

  try {
    const key = fs.readFileSync(HTTPS_KEY_PATH);
    const cert = fs.readFileSync(HTTPS_CERT_PATH);
    return https.createServer({ key, cert }, app);
  } catch (e) {
    console.warn(
      `⚠️  HTTPS=true but key/cert not readable:
  key:  ${HTTPS_KEY_PATH}
  cert: ${HTTPS_CERT_PATH}
Falling back to HTTP.`
    );
    return http.createServer(app);
  }
}

/* -------------------- Start -------------------- */
async function start() {
  try {
    if (!useMockDb) {
      await connectDB(); // your existing DB connector
      console.log('✅ MongoDB connected');
    } else {
      console.log('🧪 Using mock database for testing');
      // Mark as "connected" for any code that checks readyState
      mongoose.connection.readyState = 1;
    }

    const server = buildServer();
    server.listen(PORT, HOST, () => {
      const protocol = server instanceof https.Server ? 'https' : 'http';
      console.log(`🚀 Server running on ${protocol}://${HOST}:${PORT}`);
      console.log(`   CORS origin: ${FRONTEND_ORIGIN}`);
      console.log(`   DB: ${useMockDb ? 'mock' : 'real'}`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down...`);
      try {
        if (!useMockDb) await mongoose.connection.close();
      } catch {}
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 5000).unref();
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('❌ Startup error:', error);
    if (!useMockDb) process.exit(1);
    // If mock db is allowed, still boot the server
    const server = buildServer();
    server.listen(PORT, HOST, () => {
      const protocol = server instanceof https.Server ? 'https' : 'http';
      console.log(
        `🚀 Server running on ${protocol}://${HOST}:${PORT} with mock database (startup error tolerated)`
      );
    });
  }
}

start();
