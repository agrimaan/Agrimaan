#!/bin/bash
# agrimaan Application Backup Script
# This script creates backups of the MongoDB database and application files

# Load environment variables
if [ -f ../.env ]; then
    source ../.env
fi

# Set default values if not provided in .env
MONGO_ROOT_USERNAME=${MONGO_ROOT_USERNAME:-admin}
MONGO_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD:-password}
BACKUP_DIR=${BACKUP_DIR:-/opt/agrimaan/backups}
RETENTION_DAYS=${RETENTION_DAYS:-7}

# Create timestamp for backup files
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Ensure backup directory exists
mkdir -p $BACKUP_DIR

echo "Starting backup process at $(date)"

# Backup MongoDB database
echo "Backing up MongoDB database..."
docker exec agrimaan-mongodb mongodump \
    --username $MONGO_ROOT_USERNAME \
    --password $MONGO_ROOT_PASSWORD \
    --authenticationDatabase admin \
    --out /dump

# Copy the dump from the container
echo "Copying MongoDB dump from container..."
docker cp agrimaan-mongodb:/dump $BACKUP_DIR/mongodb_$TIMESTAMP

# Compress the backup
echo "Compressing MongoDB backup..."
tar -czf $BACKUP_DIR/mongodb_$TIMESTAMP.tar.gz -C $BACKUP_DIR mongodb_$TIMESTAMP
rm -rf $BACKUP_DIR/mongodb_$TIMESTAMP

# Backup application files (excluding node_modules and other large directories)
echo "Backing up application files..."
tar --exclude='./node_modules' \
    --exclude='./frontend/node_modules' \
    --exclude='./backend/node_modules' \
    --exclude='./frontend/build' \
    --exclude='./.git' \
    -czf $BACKUP_DIR/app_files_$TIMESTAMP.tar.gz \
    -C /opt/agrimaan .

# Backup environment files
echo "Backing up environment files..."
cp /opt/agrimaan/.env $BACKUP_DIR/env_$TIMESTAMP.bak

# Clean up old backups
echo "Cleaning up backups older than $RETENTION_DAYS days..."
find $BACKUP_DIR -name "mongodb_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "app_files_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "env_*.bak" -type f -mtime +$RETENTION_DAYS -delete

echo "Backup completed at $(date)"
echo "Backup files stored in $BACKUP_DIR"