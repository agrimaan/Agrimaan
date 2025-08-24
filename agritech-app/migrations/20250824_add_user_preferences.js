/**
 * Migration: Add user preferences fields
 * Date: 2025-08-24
 * 
 * This migration adds user preferences fields to the User model
 */

module.exports = {
  async up(mongoose) {
    const db = mongoose.connection;
    
    // Update User schema to add preferences
    await db.collection('users').updateMany(
      { preferences: { $exists: false } },
      { 
        $set: { 
          preferences: {
            theme: 'light',
            language: 'en',
            notifications: {
              email: true,
              push: true,
              sms: false,
              inApp: true
            },
            dashboardLayout: 'default',
            measurementUnits: 'metric'
          }
        }
      }
    );
    
    console.log('Added default preferences to all users');
    
    // Create index for faster queries
    await db.collection('users').createIndex({ 'preferences.language': 1 });
    
    console.log('Created index on preferences.language');
  },
  
  async down(mongoose) {
    const db = mongoose.connection;
    
    // Remove preferences field from all users
    await db.collection('users').updateMany(
      {},
      { $unset: { preferences: "" } }
    );
    
    // Drop the index
    await db.collection('users').dropIndex({ 'preferences.language': 1 });
    
    console.log('Removed preferences field and index');
  }
};