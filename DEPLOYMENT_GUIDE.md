# Agrimaan Deployment Guide

## 🚀 Production Deployment Guide

This guide provides step-by-step instructions for deploying the Agrimaan platform to production environments.

## 📋 Prerequisites

### System Requirements
- **Server**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: Minimum 50GB SSD
- **CPU**: 2+ cores
- **Network**: Static IP address and domain name

### Software Requirements
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Node.js**: 18+ (for local development)
- **Git**: Latest version
- **SSL Certificate**: Let's Encrypt or commercial

## 🔧 Server Setup

### 1. Initial Server Configuration

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git unzip software-properties-common

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login to apply Docker group changes
```

### 2. Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp  # Frontend (if needed)
sudo ufw allow 3001/tcp  # Backend API (if needed)
```

### 3. Domain and DNS Setup

```bash
# Point your domain to server IP
# A record: yourdomain.com -> YOUR_SERVER_IP
# A record: api.yourdomain.com -> YOUR_SERVER_IP
# A record: www.yourdomain.com -> YOUR_SERVER_IP
```

## 📦 Application Deployment

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/agrimaan/Agrimaan.git
cd Agrimaan/agrimaan-app

# Create production branch (if needed)
git checkout -b production
```

### 2. Environment Configuration

```bash
# Create production environment files
cp backend/.env.example backend/.env.production
cp frontend/.env.example frontend/.env.production

# Edit backend environment
nano backend/.env.production
```

**Backend Environment Variables (.env.production):**
```env
# Server Configuration
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Database Configuration
MONGO_URI=mongodb://mongodb:27017/agrimaan_production
USE_REAL_DB=true

# Security
JWT_SECRET=your-super-secure-jwt-secret-key-here
BCRYPT_ROUNDS=12

# Redis Configuration
REDIS_URL=redis://redis:6379

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/app/uploads

# API Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Blockchain Configuration
POLYGON_RPC_URL=https://polygon-rpc.com/
BSC_RPC_URL=https://bsc-dataseed1.binance.org/
PRIVATE_KEY=your-deployment-private-key
POLYGONSCAN_API_KEY=your-polygonscan-api-key
BSCSCAN_API_KEY=your-bscscan-api-key

# External APIs
OPENAI_API_KEY=your-openai-api-key
WEATHER_API_KEY=your-weather-api-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

**Frontend Environment Variables (.env.production):**
```env
# API Configuration
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_WS_URL=wss://api.yourdomain.com

# Blockchain Configuration
REACT_APP_POLYGON_RPC_URL=https://polygon-rpc.com/
REACT_APP_BSC_RPC_URL=https://bsc-dataseed1.binance.org/
REACT_APP_AGM_TOKEN_ADDRESS_POLYGON=0x...
REACT_APP_AGM_TOKEN_ADDRESS_BSC=0x...

# External Services
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
REACT_APP_SENTRY_DSN=your-sentry-dsn

# Feature Flags
REACT_APP_ENABLE_BLOCKCHAIN=true
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_NOTIFICATIONS=true

# Build Configuration
GENERATE_SOURCEMAP=false
```

### 3. SSL Certificate Setup

```bash
# Install Certbot
sudo apt install -y certbot

# Generate SSL certificates
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Verify certificates
sudo certbot certificates
```

### 4. Nginx Configuration

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/agrimaan
```

**Nginx Configuration:**
```nginx
# Frontend
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    listen [::]:80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site and restart Nginx
sudo ln -s /etc/nginx/sites-available/agrimaan /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Docker Compose Production Setup

```bash
# Create production docker-compose file
nano docker-compose.prod.yml
```

**Docker Compose Production Configuration:**
```yaml
version: '3.8'

services:
  # MongoDB Database
  mongodb:
    image: mongo:6.0
    container_name: agrimaan-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USER:-admin}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD:-secure-password}
      MONGO_INITDB_DATABASE: agrimaan_production
    volumes:
      - mongodb_data:/data/db
      - ./mongodb/init:/docker-entrypoint-initdb.d
    networks:
      - agrimaan-network
    command: mongod --auth

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: agrimaan-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD:-secure-redis-password}
    volumes:
      - redis_data:/data
    networks:
      - agrimaan-network

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: agrimaan-backend
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    env_file:
      - ./backend/.env.production
    volumes:
      - ./backend/uploads:/app/uploads
      - ./backend/logs:/app/logs
    depends_on:
      - mongodb
      - redis
    networks:
      - agrimaan-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: agrimaan-frontend
    restart: unless-stopped
    ports:
      - "3000:80"
    env_file:
      - ./frontend/.env.production
    depends_on:
      - backend
    networks:
      - agrimaan-network

  # Nginx Reverse Proxy (optional if using external Nginx)
  nginx:
    image: nginx:alpine
    container_name: agrimaan-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/sites:/etc/nginx/conf.d
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - frontend
      - backend
    networks:
      - agrimaan-network

  # Monitoring - Prometheus
  prometheus:
    image: prom/prometheus:latest
    container_name: agrimaan-prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    networks:
      - agrimaan-network

  # Monitoring - Grafana
  grafana:
    image: grafana/grafana:latest
    container_name: agrimaan-grafana
    restart: unless-stopped
    ports:
      - "3030:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD:-admin}
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - agrimaan-network

volumes:
  mongodb_data:
  redis_data:
  prometheus_data:
  grafana_data:

networks:
  agrimaan-network:
    driver: bridge
```

### 6. Production Dockerfiles

**Backend Dockerfile (Dockerfile.prod):**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine

RUN addgroup -g 1001 -S nodejs
RUN adduser -S agrimaan -u 1001

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --chown=agrimaan:nodejs . .

USER agrimaan

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["npm", "start"]
```

**Frontend Dockerfile (Dockerfile.prod):**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## 🚀 Deployment Process

### 1. Build and Deploy

```bash
# Pull latest code
git pull origin main

# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 2. Database Initialization

```bash
# Seed production database
docker-compose -f docker-compose.prod.yml exec backend npm run seed

# Create admin user
docker-compose -f docker-compose.prod.yml exec backend npm run create-admin
```

### 3. Blockchain Deployment

```bash
# Deploy AGM token contract
cd blockchain
npm install
npm run deploy:polygon  # or npm run deploy:bsc

# Update frontend with contract addresses
# Edit frontend/.env.production with deployed contract addresses
```

### 4. SSL Certificate Renewal

```bash
# Setup automatic renewal
sudo crontab -e

# Add this line for automatic renewal
0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx
```

## 📊 Monitoring and Maintenance

### 1. Health Checks

```bash
# Check application health
curl -f https://api.yourdomain.com/health
curl -f https://yourdomain.com

# Check service status
docker-compose -f docker-compose.prod.yml ps
```

### 2. Log Management

```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend

# Setup log rotation
sudo nano /etc/logrotate.d/agrimaan
```

**Log Rotation Configuration:**
```
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=1M
    missingok
    delaycompress
    copytruncate
}
```

### 3. Backup Strategy

```bash
# Create backup script
nano backup.sh
```

**Backup Script:**
```bash
#!/bin/bash

BACKUP_DIR="/backups/agrimaan"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup MongoDB
docker-compose -f docker-compose.prod.yml exec -T mongodb mongodump --archive --gzip > $BACKUP_DIR/mongodb_$DATE.gz

# Backup uploaded files
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz backend/uploads/

# Backup configuration
tar -czf $BACKUP_DIR/config_$DATE.tar.gz backend/.env.production frontend/.env.production

# Remove old backups (keep 30 days)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

```bash
# Make script executable and schedule
chmod +x backup.sh
sudo crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```

### 4. Performance Monitoring

```bash
# Access Grafana dashboard
https://yourdomain.com:3030
# Login: admin / your-grafana-password

# Access Prometheus metrics
https://yourdomain.com:9090
```

## 🔄 Updates and Maintenance

### 1. Application Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart services
docker-compose -f docker-compose.prod.yml up -d --build

# Run database migrations (if any)
docker-compose -f docker-compose.prod.yml exec backend npm run migrate
```

### 2. Security Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Clean up old images
docker system prune -a
```

### 3. Scaling

```bash
# Scale backend services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Use load balancer for multiple instances
# Configure Nginx upstream for load balancing
```

## 🚨 Troubleshooting

### Common Issues

1. **Service Won't Start**
   ```bash
   # Check logs
   docker-compose -f docker-compose.prod.yml logs service-name
   
   # Check resource usage
   docker stats
   ```

2. **Database Connection Issues**
   ```bash
   # Check MongoDB status
   docker-compose -f docker-compose.prod.yml exec mongodb mongo --eval "db.adminCommand('ismaster')"
   ```

3. **SSL Certificate Issues**
   ```bash
   # Renew certificates
   sudo certbot renew
   sudo systemctl reload nginx
   ```

4. **High Memory Usage**
   ```bash
   # Monitor resource usage
   htop
   docker stats
   
   # Restart services if needed
   docker-compose -f docker-compose.prod.yml restart
   ```

## 📞 Support

For deployment support and troubleshooting:
- **Documentation**: Check project documentation
- **GitHub Issues**: Report deployment issues
- **Community**: Join developer community discussions

## ✅ Deployment Checklist

- [ ] Server setup and configuration
- [ ] Domain and DNS configuration
- [ ] SSL certificates installed
- [ ] Environment variables configured
- [ ] Docker services running
- [ ] Database seeded
- [ ] Blockchain contracts deployed
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Health checks passing
- [ ] Performance testing completed
- [ ] Security scanning completed

**Congratulations! Your Agrimaan platform is now deployed and ready for production use!** 🎉