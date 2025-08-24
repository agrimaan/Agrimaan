# AgriTech Application Operations Training Guide

## 1. Introduction

This training guide is designed for the operations team responsible for maintaining and supporting the AgriTech application. It covers all aspects of the application's infrastructure, monitoring, troubleshooting, and maintenance procedures.

## 2. System Architecture Overview

### 2.1 Application Components

The AgriTech application consists of the following components:

1. **Frontend**: React-based web application
   - Technology: React 18, TypeScript, Material UI
   - Deployment: Nginx container
   - Purpose: Provides the user interface for farmers, investors, and administrators

2. **Backend API**: Express.js REST API
   - Technology: Node.js, Express, MongoDB
   - Deployment: Node.js container
   - Purpose: Handles business logic, data processing, and external integrations

3. **Database**: MongoDB
   - Technology: MongoDB 6.0
   - Deployment: MongoDB container
   - Purpose: Stores all application data including user information, crop data, field data, and analytics

4. **Nginx**: Web server and reverse proxy
   - Technology: Nginx Alpine
   - Deployment: Nginx container
   - Purpose: Handles SSL termination, load balancing, and static content serving

5. **Monitoring Stack**: Prometheus and Grafana
   - Technology: Prometheus, Grafana, Node Exporter, MongoDB Exporter
   - Deployment: Separate containers
   - Purpose: Monitors system health, performance, and alerts on issues

### 2.2 Infrastructure Diagram

```
                                   ┌─────────────┐
                                   │   Internet  │
                                   └──────┬──────┘
                                          │
                                          ▼
                                   ┌─────────────┐
                                   │    Nginx    │
                                   │ (SSL/Proxy) │
                                   └──────┬──────┘
                                          │
                     ┌────────────────────┴───────────────────┐
                     │                                        │
               ┌─────▼─────┐                           ┌──────▼─────┐
               │  Frontend │                           │  Backend   │
               │ Container │                           │ Container  │
               └───────────┘                           └──────┬─────┘
                                                              │
                     ┌────────────────────┬───────────────────┘
                     │                    │
               ┌─────▼─────┐       ┌──────▼─────┐
               │  MongoDB  │       │ Monitoring │
               │ Container │       │ Containers │
               └───────────┘       └────────────┘
```

## 3. Deployment and Configuration

### 3.1 Environment Setup

The application is deployed using Docker and Docker Compose. The main configuration files are:

- `docker-compose.yml`: Main application services
- `docker-compose.monitoring.yml`: Monitoring services
- `.env`: Environment variables for configuration

#### Key Environment Variables

| Variable | Purpose | Default | Notes |
|----------|---------|---------|-------|
| MONGO_ROOT_USERNAME | MongoDB admin username | admin | Change for production |
| MONGO_ROOT_PASSWORD | MongoDB admin password | password | Change for production |
| JWT_SECRET | Secret for JWT tokens | your_jwt_secret_key_here | Change for production |
| NODE_ENV | Environment mode | development | Set to 'production' for production |
| PORT | Backend API port | 5000 | |
| GRAFANA_ADMIN_USER | Grafana admin username | admin | Change for production |
| GRAFANA_ADMIN_PASSWORD | Grafana admin password | admin | Change for production |

### 3.2 Deployment Process

The deployment process is automated using the `deploy.sh` script in the `scripts` directory. The script performs the following steps:

1. Checks for environment configuration
2. Ensures SSL certificates are available
3. Builds and starts the application containers
4. Runs database migrations
5. Sets up monitoring
6. Configures backup cron jobs

To deploy the application:

```bash
cd /opt/agritech/scripts
./deploy.sh
```

### 3.3 Scaling the Application

The application can be scaled using the `scale.sh` script in the `scripts` directory. This script creates a Docker Compose override file to increase the number of backend and frontend containers.

To scale the application:

```bash
cd /opt/agritech/scripts
./scale.sh --backend 3 --frontend 2
```

## 4. Monitoring and Alerting

### 4.1 Monitoring Stack

The monitoring stack consists of:

- **Prometheus**: Collects and stores metrics
- **Grafana**: Visualizes metrics and provides dashboards
- **Node Exporter**: Collects system metrics
- **MongoDB Exporter**: Collects MongoDB metrics

### 4.2 Accessing Monitoring Tools

- **Grafana**: http://[server-ip]:3000 (default credentials: admin/admin)
- **Prometheus**: http://[server-ip]:9090

### 4.3 Key Dashboards

1. **System Overview**: General system health and resource usage
   - CPU, memory, disk usage
   - Network traffic
   - System load

2. **Application Performance**: Backend and frontend performance metrics
   - API response times
   - Request rates
   - Error rates
   - Endpoint usage

3. **Database Performance**: MongoDB performance metrics
   - Query performance
   - Connection count
   - Operation counts
   - Index usage

4. **User Activity**: User engagement metrics
   - Active users
   - Session duration
   - Feature usage
   - Geographic distribution

### 4.4 Alert Configuration

Alerts are configured in Prometheus and sent via various channels including email, Slack, and PagerDuty. Key alerts include:

1. **High CPU Usage**: Triggers when CPU usage exceeds 80% for 5 minutes
2. **High Memory Usage**: Triggers when memory usage exceeds 85% for 5 minutes
3. **Disk Space Low**: Triggers when disk space is below 10% free
4. **High API Error Rate**: Triggers when API error rate exceeds 5% for 5 minutes
5. **Database Connection Issues**: Triggers when database connections fail
6. **Slow Queries**: Triggers when query execution time exceeds thresholds

## 5. Backup and Recovery

### 5.1 Backup Strategy

The application uses an automated backup strategy:

1. **Database Backups**: Daily MongoDB dumps at 2:00 AM UTC
2. **Application Files**: Weekly backups of application files
3. **Environment Configuration**: Backup of .env files with each database backup

Backups are stored in `/opt/agritech/backups` with a retention period of 7 days by default.

### 5.2 Backup Execution

Backups are executed automatically via a cron job. To manually trigger a backup:

```bash
cd /opt/agritech/scripts
./backup.sh
```

### 5.3 Restore Process

To restore from a backup:

```bash
cd /opt/agritech/scripts
./restore.sh /opt/agritech/backups/mongodb_20250824_120000.tar.gz
```

## 6. Common Operational Tasks

### 6.1 Viewing Application Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# Follow logs in real-time
docker-compose logs -f backend
```

### 6.2 Restarting Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

### 6.3 Updating the Application

```bash
# Pull latest code
git pull

# Rebuild and restart containers
docker-compose build
docker-compose up -d
```

### 6.4 Database Operations

```bash
# Access MongoDB shell
docker exec -it agritech-mongodb mongosh -u $MONGO_ROOT_USERNAME -p $MONGO_ROOT_PASSWORD --authenticationDatabase admin

# Common MongoDB commands
show dbs
use agritech
show collections
db.users.find().limit(5)
db.crops.count()
```

## 7. Troubleshooting Guide

### 7.1 Common Issues and Solutions

#### Application Not Accessible

1. Check if containers are running: `docker-compose ps`
2. Verify Nginx configuration: `docker exec agritech-nginx nginx -t`
3. Check for errors in logs: `docker-compose logs nginx`
4. Verify firewall settings: `ufw status`

#### High CPU or Memory Usage

1. Identify resource-intensive containers: `docker stats`
2. Check application logs for errors or infinite loops
3. Consider scaling the application: `./scripts/scale.sh`
4. Restart the affected service: `docker-compose restart [service]`

#### Database Connection Issues

1. Verify MongoDB is running: `docker-compose ps mongodb`
2. Check MongoDB logs: `docker-compose logs mongodb`
3. Verify connection string in .env file
4. Check network connectivity between containers

#### Slow API Response

1. Check backend logs for slow queries: `docker-compose logs backend`
2. Monitor database performance in Grafana
3. Check system resources for bottlenecks
4. Consider optimizing database queries or adding indexes

### 7.2 Incident Response Procedure

1. **Identify**: Determine the affected component and impact
2. **Contain**: Limit the impact by isolating affected components
3. **Resolve**: Apply fixes or workarounds to restore service
4. **Communicate**: Update stakeholders on status and resolution
5. **Document**: Record the incident, resolution, and prevention measures
6. **Review**: Conduct a post-incident review to prevent recurrence

## 8. Security Procedures

### 8.1 Access Management

- SSH access is restricted to key-based authentication
- Application access is managed through the user management interface
- Database access is restricted to application containers and authorized personnel

### 8.2 Security Updates

- System updates should be applied monthly during maintenance windows
- Docker images should be updated bi-weekly
- Security vulnerabilities should be addressed immediately

### 8.3 Security Monitoring

- Failed login attempts are monitored via Fail2ban
- Suspicious activities are logged and alerted
- Regular security scans are performed using automated tools

## 9. Maintenance Schedule

| Maintenance Task | Frequency | Duration | Impact | Procedure |
|------------------|-----------|----------|--------|-----------|
| System Updates | Monthly | 1-2 hours | Potential downtime | Apply during off-peak hours |
| Database Optimization | Quarterly | 2-3 hours | Performance impact | Schedule during maintenance window |
| SSL Certificate Renewal | Every 90 days | 30 minutes | None | Automated via Let's Encrypt |
| Backup Verification | Monthly | 1 hour | None | Test restore process |
| Security Audit | Quarterly | 1 day | None | Review logs and configurations |

## 10. Contact Information

### 10.1 Support Team

- **Primary Support**: support@agritech.example.com, (555) 123-4567
- **Technical Support**: tech-support@agritech.example.com, (555) 123-4568
- **Emergency Support**: emergency@agritech.example.com, (555) 123-4569

### 10.2 Vendor Contacts

- **Cloud Provider**: cloud-support@provider.com, (555) 987-6543
- **Database Support**: mongodb-support@mongodb.com, (555) 987-6544
- **SSL Certificate Provider**: support@letsencrypt.org

### 10.3 Escalation Path

1. **Level 1**: Operations Team (Response time: 15 minutes)
2. **Level 2**: DevOps Lead (Response time: 30 minutes)
3. **Level 3**: CTO (Response time: 1 hour)