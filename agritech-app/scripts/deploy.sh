#!/bin/bash
# AgriTech Application Deployment Script
# This script deploys the AgriTech application on a prepared server

# Exit on error
set -e

# Check if .env file exists
if [ ! -f ../.env ]; then
    echo "Error: .env file not found"
    echo "Please create a .env file with the required environment variables"
    exit 1
fi

# Load environment variables
source ../.env

# Define color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}===== AgriTech Application Deployment =====${NC}"

# Check if SSL certificates exist
if [ ! -d "../nginx/ssl" ]; then
    echo -e "${YELLOW}SSL certificates not found. Generating self-signed certificates...${NC}"
    echo -e "${YELLOW}Note: For production, replace these with certificates from a trusted CA${NC}"
    
    # Run the SSL certificate generation script
    cd ../nginx
    ./generate-ssl-certs.sh
    cd ../scripts
fi

# Build and start the application
echo -e "${GREEN}Building and starting the application...${NC}"
cd ..
docker-compose build
docker-compose up -d

# Wait for services to start
echo -e "${GREEN}Waiting for services to start...${NC}"
sleep 10

# Check if services are running
echo -e "${GREEN}Checking service status...${NC}"
if docker-compose ps | grep -q "Exit"; then
    echo -e "${RED}Error: Some services failed to start${NC}"
    docker-compose logs
    exit 1
fi

# Run database migrations
echo -e "${GREEN}Running database migrations...${NC}"
docker-compose exec backend node scripts/db-migrate.js

# Set up monitoring
echo -e "${GREEN}Setting up monitoring...${NC}"
docker-compose -f docker-compose.monitoring.yml up -d

# Set up backup cron job
echo -e "${GREEN}Setting up backup cron job...${NC}"
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/agritech/scripts/backup.sh") | crontab -

echo -e "${GREEN}===== Deployment Complete =====${NC}"
echo ""
echo -e "${GREEN}Application URLs:${NC}"
echo "Frontend: https://$(hostname -f)"
echo "Backend API: https://$(hostname -f)/api"
echo "Grafana: http://$(hostname -f):3000"
echo "Prometheus: http://$(hostname -f):9090"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "1. Verify the application is working correctly"
echo "2. Set up Grafana dashboards"
echo "3. Configure alerts"
echo ""
echo -e "${YELLOW}For any issues, check the logs with:${NC}"
echo "docker-compose logs"