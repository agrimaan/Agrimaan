#!/bin/bash

# Start MongoDB
echo "Starting MongoDB..."
if pgrep -x "mongod" > /dev/null
then
    echo "MongoDB is already running."
else
    mkdir -p /data/db
    mongod --fork --logpath /var/log/mongodb.log
    echo "MongoDB started."
fi

# Wait for MongoDB to start
sleep 3

# Seed the database
echo "Seeding the database..."
cd backend
node scripts/seedData.js

# Start the backend server
echo "Starting backend server..."
cd backend
NODE_ENV=development npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start the frontend server
echo "Starting frontend server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID