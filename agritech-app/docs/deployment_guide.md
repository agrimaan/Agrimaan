# AgriTech Application Deployment Guide

This guide provides step-by-step instructions for deploying the AgriTech application in a production environment.

## Prerequisites

- Docker and Docker Compose installed on the server
- Domain name configured with DNS records pointing to your server
- SSL certificates (for production use)
- Server with at least 2GB RAM and 2 CPU cores

## Deployment Steps

### 1. Clone the Repository

```bash
git clone https://github.com/your-organization/agritech-app.git
cd agritech-app
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# MongoDB Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_secure_password_here

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_here

# Other Configuration
NODE_ENV=production
```

### 3. SSL Certificates

For production deployment, you should use SSL certificates from a trusted Certificate Authority (CA) like Let's Encrypt.

#### Option 1: Using Let's Encrypt (Recommended for Production)

1. Install Certbot:
   ```bash
   sudo apt-get update
   sudo apt-get install certbot
   ```

2. Generate certificates:
   ```bash
   sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
   ```

3. Copy certificates to the nginx/ssl directory:
   ```bash
   mkdir -p nginx/ssl
   sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/server.crt
   sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/server.key
   ```

#### Option 2: Using Self-Signed Certificates (For Testing Only)

Run the provided script to generate self-signed certificates:
```bash
cd nginx
./generate-ssl-certs.sh
```

### 4. Build and Start the Services

```bash
docker-compose build
docker-compose up -d
```

### 5. Verify Deployment

1. Check if all containers are running:
   ```bash
   docker-compose ps
   ```

2. Check logs for any errors:
   ```bash
   docker-compose logs
   ```

3. Access the application:
   - Frontend: https://yourdomain.com
   - Backend API: https://yourdomain.com/api

### 6. Database Backup Configuration

Set up a cron job to backup the MongoDB database regularly:

```bash
# Create a backup script
cat > /opt/agritech/backup.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/opt/agritech/backups"
mkdir -p $BACKUP_DIR

# Backup MongoDB
docker exec agritech-mongodb mongodump --username $MONGO_ROOT_USERNAME --password $MONGO_ROOT_PASSWORD --authenticationDatabase admin --out /dump

# Copy the dump from the container
docker cp agritech-mongodb:/dump $BACKUP_DIR/mongodb_$TIMESTAMP

# Compress the backup
tar -czf $BACKUP_DIR/mongodb_$TIMESTAMP.tar.gz -C $BACKUP_DIR mongodb_$TIMESTAMP
rm -rf $BACKUP_DIR/mongodb_$TIMESTAMP

# Keep only the last 7 backups
ls -tp $BACKUP_DIR/mongodb_*.tar.gz | grep -v '/$' | tail -n +8 | xargs -I {} rm -- {}
EOF

# Make the script executable
chmod +x /opt/agritech/backup.sh

# Add to crontab to run daily at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/agritech/backup.sh") | crontab -
```

## Monitoring Setup

### 1. Install Prometheus and Grafana

```bash
# Create a docker-compose.monitoring.yml file
cat > docker-compose.monitoring.yml << 'EOF'
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    container_name: prometheus
    volumes:
      - ./prometheus:/etc/prometheus
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'
    ports:
      - "9090:9090"
    networks:
      - monitoring-network
    restart: always

  grafana:
    image: grafana/grafana
    container_name: grafana
    volumes:
      - grafana_data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=secure_password_here
      - GF_USERS_ALLOW_SIGN_UP=false
    ports:
      - "3000:3000"
    networks:
      - monitoring-network
    restart: always

networks:
  monitoring-network:
    driver: bridge

volumes:
  prometheus_data:
  grafana_data:
EOF

# Start monitoring services
docker-compose -f docker-compose.monitoring.yml up -d
```

### 2. Configure Prometheus

```bash
mkdir -p prometheus
cat > prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
EOF
```

## Troubleshooting

### Common Issues and Solutions

1. **Container fails to start**
   - Check logs: `docker-compose logs [service_name]`
   - Verify environment variables are set correctly
   - Ensure ports are not already in use

2. **Database connection issues**
   - Verify MongoDB credentials in .env file
   - Check if MongoDB container is running: `docker ps | grep mongodb`
   - Inspect MongoDB logs: `docker-compose logs mongodb`

3. **SSL/TLS certificate issues**
   - Verify certificate paths in nginx.conf
   - Check certificate validity: `openssl x509 -in nginx/ssl/server.crt -text -noout`

4. **Application not accessible**
   - Check if nginx is running: `docker ps | grep nginx`
   - Verify DNS settings point to your server
   - Check firewall settings to ensure ports 80 and 443 are open

## Rollback Procedure

If you need to rollback to a previous version:

1. Pull the specific version tag:
   ```bash
   docker-compose pull --no-parallel
   docker-compose up -d --no-deps backend frontend
   ```

2. If database rollback is needed, restore from backup:
   ```bash
   # Stop the MongoDB container
   docker-compose stop mongodb
   
   # Start MongoDB without the application
   docker-compose up -d mongodb
   
   # Restore from backup
   docker exec -i agritech-mongodb mongorestore --username $MONGO_ROOT_USERNAME --password $MONGO_ROOT_PASSWORD --authenticationDatabase admin /path/to/backup
   
   # Start the application
   docker-compose up -d
   ```

## Security Considerations

1. **Regular Updates**
   - Update all containers regularly: `docker-compose pull && docker-compose up -d`
   - Apply system updates: `apt update && apt upgrade`

2. **Firewall Configuration**
   - Only expose necessary ports (80, 443)
   - Use UFW or iptables to restrict access

3. **Secrets Management**
   - Store sensitive information in environment variables
   - Never commit secrets to version control
   - Consider using a secrets management solution like HashiCorp Vault

4. **Regular Security Audits**
   - Perform regular security scans
   - Monitor logs for suspicious activity