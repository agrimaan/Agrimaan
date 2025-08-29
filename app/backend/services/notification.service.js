const Notification = require('../models/Notification');

/**
 * Notification service to handle creating and managing notifications
 */
class NotificationService {
  /**
   * Create a new notification
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} Created notification
   */
  async createNotification(notificationData) {
    try {
      const notification = new Notification(notificationData);
      return await notification.save();
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }
  
  /**
   * Create a system notification
   * @param {string} userId - User ID
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Created notification
   */
  async createSystemNotification(userId, title, message, options = {}) {
    const notificationData = {
      user: userId,
      title,
      message,
      type: options.type || 'info',
      priority: options.priority || 'medium',
      category: 'system',
      actionRequired: options.actionRequired || false,
      actionLink: options.actionLink || null,
      expiresAt: options.expiresAt || null
    };
    
    return await this.createNotification(notificationData);
  }
  
  /**
   * Create a weather notification
   * @param {string} userId - User ID
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {string} fieldId - Related field ID
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Created notification
   */
  async createWeatherNotification(userId, title, message, fieldId, options = {}) {
    const notificationData = {
      user: userId,
      title,
      message,
      type: options.type || 'warning',
      priority: options.priority || 'high',
      category: 'weather',
      relatedField: fieldId,
      actionRequired: options.actionRequired || true,
      actionLink: options.actionLink || `/fields/${fieldId}/weather`,
      expiresAt: options.expiresAt || null
    };
    
    return await this.createNotification(notificationData);
  }
  
  /**
   * Create a crop notification
   * @param {string} userId - User ID
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {string} cropId - Related crop ID
   * @param {string} fieldId - Related field ID
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Created notification
   */
  async createCropNotification(userId, title, message, cropId, fieldId, options = {}) {
    const notificationData = {
      user: userId,
      title,
      message,
      type: options.type || 'info',
      priority: options.priority || 'medium',
      category: 'crop',
      relatedCrop: cropId,
      relatedField: fieldId,
      actionRequired: options.actionRequired || false,
      actionLink: options.actionLink || `/crops/${cropId}`,
      expiresAt: options.expiresAt || null
    };
    
    return await this.createNotification(notificationData);
  }
  
  /**
   * Create a sensor notification
   * @param {string} userId - User ID
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {string} sensorId - Related sensor ID
   * @param {string} fieldId - Related field ID
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Created notification
   */
  async createSensorNotification(userId, title, message, sensorId, fieldId, options = {}) {
    const notificationData = {
      user: userId,
      title,
      message,
      type: options.type || 'warning',
      priority: options.priority || 'high',
      category: 'sensor',
      relatedSensor: sensorId,
      relatedField: fieldId,
      actionRequired: options.actionRequired || true,
      actionLink: options.actionLink || `/sensors/${sensorId}`,
      expiresAt: options.expiresAt || null
    };
    
    return await this.createNotification(notificationData);
  }
  
  /**
   * Create an analytics notification
   * @param {string} userId - User ID
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {string} fieldId - Related field ID
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Created notification
   */
  async createAnalyticsNotification(userId, title, message, fieldId, options = {}) {
    const notificationData = {
      user: userId,
      title,
      message,
      type: options.type || 'info',
      priority: options.priority || 'medium',
      category: 'analytics',
      relatedField: fieldId,
      actionRequired: options.actionRequired || false,
      actionLink: options.actionLink || `/fields/${fieldId}/analytics`,
      expiresAt: options.expiresAt || null
    };
    
    return await this.createNotification(notificationData);
  }
  
  /**
   * Create a blockchain notification
   * @param {string} userId - User ID
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Created notification
   */
  async createBlockchainNotification(userId, title, message, options = {}) {
    const notificationData = {
      user: userId,
      title,
      message,
      type: options.type || 'info',
      priority: options.priority || 'medium',
      category: 'blockchain',
      actionRequired: options.actionRequired || false,
      actionLink: options.actionLink || '/blockchain/transactions',
      expiresAt: options.expiresAt || null
    };
    
    return await this.createNotification(notificationData);
  }
  
  /**
   * Create a marketplace notification
   * @param {string} userId - User ID
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Created notification
   */
  async createMarketplaceNotification(userId, title, message, options = {}) {
    const notificationData = {
      user: userId,
      title,
      message,
      type: options.type || 'info',
      priority: options.priority || 'medium',
      category: 'marketplace',
      actionRequired: options.actionRequired || false,
      actionLink: options.actionLink || '/marketplace',
      expiresAt: options.expiresAt || null
    };
    
    return await this.createNotification(notificationData);
  }
  
  /**
   * Get notifications for a user
   * @param {string} userId - User ID
   * @param {Object} filters - Filters to apply
   * @returns {Promise<Array<Object>>} User notifications
   */
  async getUserNotifications(userId, filters = {}) {
    try {
      const query = { user: userId };
      
      // Apply filters
      if (filters.read !== undefined) {
        query.read = filters.read;
      }
      
      if (filters.category) {
        query.category = filters.category;
      }
      
      if (filters.priority) {
        query.priority = filters.priority;
      }
      
      if (filters.type) {
        query.type = filters.type;
      }
      
      if (filters.actionRequired !== undefined) {
        query.actionRequired = filters.actionRequired;
      }
      
      // Only return non-expired notifications or ones without expiration
      query.$or = [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: null }
      ];
      
      // Set up pagination
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;
      
      // Get notifications
      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('relatedField', 'name location')
        .populate('relatedCrop', 'name type status')
        .populate('relatedSensor', 'name type status');
      
      // Get total count for pagination
      const total = await Notification.countDocuments(query);
      
      return {
        notifications,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw new Error('Failed to get user notifications');
    }
  }
  
  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated notification
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        user: userId
      });
      
      if (!notification) {
        throw new Error('Notification not found');
      }
      
      notification.read = true;
      notification.readAt = new Date();
      
      return await notification.save();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }
  
  /**
   * Mark all notifications as read
   * @param {string} userId - User ID
   * @param {Object} filters - Filters to apply
   * @returns {Promise<Object>} Result with count of updated notifications
   */
  async markAllAsRead(userId, filters = {}) {
    try {
      const query = { user: userId, read: false };
      
      // Apply filters
      if (filters.category) {
        query.category = filters.category;
      }
      
      const result = await Notification.updateMany(query, {
        $set: {
          read: true,
          readAt: new Date()
        }
      });
      
      return {
        success: true,
        count: result.nModified
      };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }
  
  /**
   * Delete a notification
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Result
   */
  async deleteNotification(notificationId, userId) {
    try {
      const result = await Notification.deleteOne({
        _id: notificationId,
        user: userId
      });
      
      if (result.deletedCount === 0) {
        throw new Error('Notification not found or already deleted');
      }
      
      return {
        success: true,
        message: 'Notification deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error('Failed to delete notification');
    }
  }
  
  /**
   * Get notification count for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Notification counts
   */
  async getNotificationCount(userId) {
    try {
      // Only count non-expired notifications
      const query = {
        user: userId,
        $or: [
          { expiresAt: { $gt: new Date() } },
          { expiresAt: null }
        ]
      };
      
      // Get total count
      const total = await Notification.countDocuments(query);
      
      // Get unread count
      const unread = await Notification.countDocuments({
        ...query,
        read: false
      });
      
      // Get counts by category
      const categories = await Notification.aggregate([
        { $match: query },
        { $group: {
          _id: '$category',
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] } }
        }}
      ]);
      
      // Format category counts
      const categoryCount = {};
      categories.forEach(category => {
        categoryCount[category._id] = {
          total: category.total,
          unread: category.unread
        };
      });
      
      // Get counts by priority
      const priorities = await Notification.aggregate([
        { $match: query },
        { $group: {
          _id: '$priority',
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] } }
        }}
      ]);
      
      // Format priority counts
      const priorityCount = {};
      priorities.forEach(priority => {
        priorityCount[priority._id] = {
          total: priority.total,
          unread: priority.unread
        };
      });
      
      return {
        total,
        unread,
        categories: categoryCount,
        priorities: priorityCount
      };
    } catch (error) {
      console.error('Error getting notification count:', error);
      throw new Error('Failed to get notification count');
    }
  }
}

module.exports = new NotificationService();