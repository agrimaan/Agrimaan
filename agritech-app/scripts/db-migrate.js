/**
 * Database Migration Script for AgriTech Application
 * 
 * This script handles database schema migrations for the AgriTech application.
 * It uses MongoDB's native commands to apply migrations in a controlled manner.
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// MongoDB connection string
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/agritech';

// Migration model schema
const migrationSchema = new mongoose.Schema({
  name: String,
  appliedAt: { type: Date, default: Date.now }
});

async function runMigrations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Create migration model
    const Migration = mongoose.model('Migration', migrationSchema);

    // Get all migration files
    const migrationsDir = path.join(__dirname, '../migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('No migrations directory found. Creating one...');
      fs.mkdirSync(migrationsDir);
    }

    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort(); // Sort to ensure migrations run in order

    if (migrationFiles.length === 0) {
      console.log('No migration files found.');
      await mongoose.disconnect();
      return;
    }

    // Get applied migrations
    const appliedMigrations = await Migration.find().select('name').lean();
    const appliedMigrationNames = appliedMigrations.map(m => m.name);

    // Filter out migrations that have already been applied
    const pendingMigrations = migrationFiles.filter(file => !appliedMigrationNames.includes(file));

    if (pendingMigrations.length === 0) {
      console.log('No pending migrations.');
      await mongoose.disconnect();
      return;
    }

    console.log(`Found ${pendingMigrations.length} pending migrations`);

    // Apply each pending migration
    for (const migrationFile of pendingMigrations) {
      try {
        console.log(`Applying migration: ${migrationFile}`);
        
        // Import and run the migration
        const migration = require(path.join(migrationsDir, migrationFile));
        
        if (typeof migration.up !== 'function') {
          throw new Error(`Migration ${migrationFile} does not export an 'up' function`);
        }
        
        await migration.up(mongoose);
        
        // Record the migration
        await Migration.create({ name: migrationFile });
        
        console.log(`Successfully applied migration: ${migrationFile}`);
      } catch (error) {
        console.error(`Error applying migration ${migrationFile}:`, error);
        process.exit(1);
      }
    }

    console.log('All migrations applied successfully');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

// Run migrations
runMigrations();