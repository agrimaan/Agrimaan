const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to check current role and admin status
    const user = await User.findById(decoded.user.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    // Check if user is admin or system admin
    if (user.role !== 'admin' && !user.isSystemAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    // Add user to request
    req.user = {
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
      isSystemAdmin: user.isSystemAdmin
    };

    next();
  } catch (err) {
    console.error('Admin auth middleware error:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};