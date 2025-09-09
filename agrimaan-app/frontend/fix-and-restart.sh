#!/bin/bash

# Navigate to the project directory
cd Agrimaan/agrimaan-app/frontend

# Clear the node_modules cache
echo "Clearing node_modules cache..."
rm -rf node_modules/.cache

# Run the MUI fix script
echo "Running MUI fix script..."
node ../../../mui-fix.js

# Run the icon fix script
echo "Running icon fix script..."
node ../../../fix-icons.js

# Install any missing dependencies
echo "Checking for missing dependencies..."
npm install @mui/material @mui/icons-material @mui/x-date-pickers @emotion/react @emotion/styled

# Restart the frontend application
echo "Restarting the frontend application..."
npm run start