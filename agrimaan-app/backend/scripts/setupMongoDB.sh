#!/bin/bash

# Install MongoDB
echo "Installing MongoDB..."
apt-get update
apt-get install -y gnupg curl
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/debian bookworm/mongodb-org/7.0 main" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt-get update
apt-get install -y mongodb-org

# Create data directory
mkdir -p /data/db

# Start MongoDB
echo "Starting MongoDB..."
mongod --fork --logpath /var/log/mongodb.log

# Wait for MongoDB to start
sleep 5

# Check if MongoDB is running
if pgrep -x "mongod" > /dev/null
then
    echo "MongoDB is running."
else
    echo "Failed to start MongoDB."
    exit 1
fi

echo "MongoDB setup complete."