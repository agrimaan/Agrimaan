const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const notificationService = require('../services/notification.service');

// @route   GET api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const filters = {
      read: req.query.read === 'true' ? true : (req.query.read === 'false' ? false : undefined),
      category: req.query.category,
      priority: req.query.priority,
      type: req.query.type,
      actionRequired: req.query.actionRequired === 'true' ? true : (req.query.actionRequired === 'false' ? false : undefined),
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };
    
    const result = await notificationService.getUserNotifications(req.user.id, filters);
    
    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/notifications/count
// @desc    Get notification count for user
// @access  Private
router.get('/count', auth, async (req, res) => {
  try {
    const counts = await notificationService.getNotificationCount(req.user.id);
    
    res.json(counts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user.id);
    
    res.json(notification);
  } catch (err) {
    console.error(err.message);
    if (err.message === 'Notification not found') {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', auth, async (req, res) => {
  try {
    const filters = {
      category: req.query.category
    };
    
    const result = await notificationService.markAllAsRead(req.user.id, filters);
    
    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await notificationService.deleteNotification(req.params.id, req.user.id);
    
    res.json(result);
  } catch (err) {
    console.error(err.message);
    if (err.message === 'Notification not found or already deleted') {
      return res.status(404).json({ message: 'Notification not found or already deleted' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/notifications/test
// @desc    Create a test notification (for development only)
// @access  Private
router.post('/test', [
  auth,
  [
    body('type', 'Type is required').isIn(['alert', 'info', 'success', 'warning', 'error']),
    body('category', 'Category is required').isIn(['system', 'weather', 'crop', 'field', 'sensor', 'analytics', 'blockchain', 'marketplace', 'other']),
    body('title', 'Title is required').not().isEmpty(),
    body('message', 'Message is required').not().isEmpty()
  ]
], async (req, res) => {
  // This route should be disabled in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'This route is only available in development' });
  }
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { type, category, title, message, priority, actionRequired, actionLink, fieldId, cropId, sensorId } = req.body;
    
    let notification;
    
    switch (category) {
      case 'weather':
        notification = await notificationService.createWeatherNotification(
          req.user.id,
          title,
          message,
          fieldId,
          { type, priority, actionRequired, actionLink }
        );
        break;
        
      case 'crop':
        notification = await notificationService.createCropNotification(
          req.user.id,
          title,
          message,
          cropId,
          fieldId,
          { type, priority, actionRequired, actionLink }
        );
        break;
        
      case 'sensor':
        notification = await notificationService.createSensorNotification(
          req.user.id,
          title,
          message,
          sensorId,
          fieldId,
          { type, priority, actionRequired, actionLink }
        );
        break;
        
      case 'analytics':
        notification = await notificationService.createAnalyticsNotification(
          req.user.id,
          title,
          message,
          fieldId,
          { type, priority, actionRequired, actionLink }
        );
        break;
        
      case 'blockchain':
        notification = await notificationService.createBlockchainNotification(
          req.user.id,
          title,
          message,
          { type, priority, actionRequired, actionLink }
        );
        break;
        
      case 'marketplace':
        notification = await notificationService.createMarketplaceNotification(
          req.user.id,
          title,
          message,
          { type, priority, actionRequired, actionLink }
        );
        break;
        
      default:
        notification = await notificationService.createSystemNotification(
          req.user.id,
          title,
          message,
          { type, priority, actionRequired, actionLink }
        );
    }
    
    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;