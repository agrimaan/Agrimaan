#!/bin/bash
# agrimaan Application Scaling Script
# This script helps scale the agrimaan application for higher load

# Exit on error
set -e

# Define color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default values
BACKEND_REPLICAS=2
FRONTEND_REPLICAS=2

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        --backend)
            BACKEND_REPLICAS="$2"
            shift
            shift
            ;;
        --frontend)
            FRONTEND_REPLICAS="$2"
            shift
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --backend N    Scale backend to N replicas (default: 2)"
            echo "  --frontend N   Scale frontend to N replicas (default: 2)"
            echo "  --help         Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo -e "${GREEN}===== agrimaan Application Scaling =====${NC}"
echo -e "${GREEN}Scaling backend to ${BACKEND_REPLICAS} replicas${NC}"
echo -e "${GREEN}Scaling frontend to ${FRONTEND_REPLICAS} replicas${NC}"

# Create a docker-compose.override.yml file for scaling
cat > ../docker-compose.override.yml << EOF
version: '3.8'

services:
  backend:
    deploy:
      replicas: ${BACKEND_REPLICAS}
    environment:
      - INSTANCE_NAME={{.Task.Name}}

  frontend:
    deploy:
      replicas: ${FRONTEND_REPLICAS}

  # Add a load balancer for backend instances
  backend-lb:
    image: nginx:alpine
    container_name: agrimaan-backend-lb
    restart: always
    ports:
      - "5000:80"
    volumes:
      - ./nginx/backend-lb.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - backend
    networks:
      - agrimaan-network
EOF

# Create nginx configuration for backend load balancing
mkdir -p ../nginx
cat > ../nginx/backend-lb.conf << EOF
upstream backend {
    server backend:5000;
}

server {
    listen 80;
    
    location / {
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Apply the scaling configuration
cd ..
echo -e "${GREEN}Applying scaling configuration...${NC}"
docker-compose up -d

echo -e "${GREEN}===== Scaling Complete =====${NC}"
echo ""
echo -e "${GREEN}Current scaling:${NC}"
echo "Backend replicas: ${BACKEND_REPLICAS}"
echo "Frontend replicas: ${FRONTEND_REPLICAS}"
echo ""
echo -e "${YELLOW}Note: For production environments, consider using Kubernetes or Docker Swarm for more advanced scaling options.${NC}"