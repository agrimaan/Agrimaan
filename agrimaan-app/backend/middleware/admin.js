const User = require('../models/User');

/**
 * Middleware to check if the user has admin role
 */
module.exports = async function(req, res, next) {
  try {
    // User ID is set by the auth middleware
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    // If user is admin, proceed
    next();
  } catch (err) {
    console.error('Admin middleware error:', err.message);
    res.status(500).send('Server error');
  }
};