const User = require('../models/User');

/**
 * Middleware to check if the user has buyer role
 */
module.exports = async function(req, res, next) {
  try {
    // User ID is set by the auth middleware
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'buyer' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Buyer privileges required.' });
    }
    
    // If user is buyer or admin, proceed
    next();
  } catch (err) {
    console.error('Buyer middleware error:', err.message);
    res.status(500).send('Server error');
  }
};