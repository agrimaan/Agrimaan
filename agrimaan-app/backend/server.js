const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/crops', require('./routes/crop.routes'));
app.use('/api/fields', require('./routes/field.routes'));
app.use('/api/sensors', require('./routes/sensor.routes'));
app.use('/api/analytics/recommendations', require('./routes/analytics.recommendations.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/advanced-analytics', require('./routes/advanced-analytics.routes'));
app.use('/api/weather', require('./routes/weather.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/iot-management', require('./routes/iot-management.routes'));

// Default route
app.get('/', (req, res) => {
  res.send('agrimaan API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something went wrong!', error: err.message });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/agrimaan');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 3001;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});