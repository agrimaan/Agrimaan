#!/bin/bash
# agrimaan Application Restore Script
# This script restores backups of the MongoDB database and application files

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <mongodb_backup_file>"
    echo "Example: $0 /opt/agrimaan/backups/mongodb_20250824_120000.tar.gz"
    exit 1
fi

# Load environment variables
if [ -f ../.env ]; then
    source ../.env
fi

# Set default values if not provided in .env
MONGO_ROOT_USERNAME=${MONGO_ROOT_USERNAME:-admin}
MONGO_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD:-password}
BACKUP_DIR=${BACKUP_DIR:-/opt/agrimaan/backups}
TEMP_DIR="/tmp/agrimaan_restore_$(date +%s)"

# Check if backup file exists
BACKUP_FILE=$1
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file $BACKUP_FILE not found"
    exit 1
fi

echo "Starting restore process at $(date)"
echo "Using backup file: $BACKUP_FILE"

# Create temporary directory
mkdir -p $TEMP_DIR
echo "Created temporary directory: $TEMP_DIR"

# Extract backup
echo "Extracting backup file..."
tar -xzf $BACKUP_FILE -C $TEMP_DIR

# Stop the application containers
echo "Stopping application containers..."
cd /opt/agrimaan
docker-compose stop backend frontend

# Restore MongoDB database
echo "Restoring MongoDB database..."
docker exec -i agrimaan-mongodb mongorestore \
    --username $MONGO_ROOT_USERNAME \
    --password $MONGO_ROOT_PASSWORD \
    --authenticationDatabase admin \
    --drop \
    $TEMP_DIR/dump

# Start the application containers
echo "Starting application containers..."
docker-compose start backend frontend

# Clean up
echo "Cleaning up temporary files..."
rm -rf $TEMP_DIR

echo "Restore completed at $(date)"
echo "The application should now be running with the restored data"