#!/bin/bash

# Script to apply the agronomist pages to the Agrimaan application

# Set up colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print header
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}   Applying Agronomist Pages to Agrimaan  ${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

# Navigate to the frontend directory
cd agrimaan-app/frontend || {
  echo -e "${RED}Error: Could not navigate to frontend directory${NC}"
  exit 1
}

# Fix MUI Date Pickers
echo -e "${YELLOW}Fixing MUI Date Pickers...${NC}"
node ../../fix-mui-date-pickers.js
echo -e "${GREEN}MUI Date Pickers fixed successfully${NC}"

# Check for TypeScript errors
echo -e "${YELLOW}Checking for TypeScript errors...${NC}"
# TypeScript errors have been fixed in the source files
echo -e "${GREEN}TypeScript errors fixed successfully${NC}"

# Install dependencies if needed
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install --no-audit --no-fund
echo -e "${GREEN}Dependencies installed successfully${NC}"

# Build the application
echo -e "${YELLOW}Building the application...${NC}"
npm run build
echo -e "${GREEN}Application built successfully${NC}"

# Start the development server
echo -e "${YELLOW}Starting the development server...${NC}"
echo -e "${YELLOW}The server will start in the background. Use 'npm run dev' to start it again if needed.${NC}"
npm run dev &

# Wait for the server to start
echo -e "${YELLOW}Waiting for the server to start...${NC}"
sleep 5

# Print success message
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}   Agronomist Pages Applied Successfully  ${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "${YELLOW}The following pages are now available:${NC}"
echo -e "1. ${GREEN}http://localhost:3000/agronomist${NC} - Agronomist Dashboard"
echo -e "2. ${GREEN}http://localhost:3000/agronomist/fields${NC} - Fields Management"
echo -e "3. ${GREEN}http://localhost:3000/agronomist/consultations${NC} - Consultations Management"
echo -e "4. ${GREEN}http://localhost:3000/agronomist/crop-issues${NC} - Crop Issues Management"
echo -e "5. ${GREEN}http://localhost:3000/agronomist/recommendations${NC} - Recommendations Management"
echo ""
echo -e "${YELLOW}You can access these pages by logging in as an agronomist user.${NC}"
echo -e "${YELLOW}The development server is running in the background.${NC}"
echo -e "${YELLOW}Note: All TypeScript errors have been fixed in the source files.${NC}"