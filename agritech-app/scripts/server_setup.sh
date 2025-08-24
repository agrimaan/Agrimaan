#!/bin/bash
# AgriTech Application Server Setup Script
# This script prepares a fresh Ubuntu server for hosting the AgriTech application

# Exit on error
set -e

# Check if script is run as root
if [ "$(id -u)" -ne 0 ]; then
    echo "This script must be run as root" 
    exit 1
fi

echo "===== AgriTech Server Setup Script ====="
echo "This script will prepare your server for the AgriTech application deployment."
echo "It will install Docker, Docker Compose, and other required dependencies."
echo ""

# Update system packages
echo "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install essential packages
echo "Installing essential packages..."
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw \
    fail2ban \
    unzip \
    htop \
    vim \
    tmux

# Install Docker
echo "Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
echo "Installing Docker Compose..."
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d&quot; -f4)
curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Configure UFW
echo "Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

# Configure Fail2ban
echo "Configuring Fail2ban..."
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
systemctl enable fail2ban
systemctl start fail2ban

# Create application directory
echo "Creating application directory..."
mkdir -p /opt/agritech
chmod 755 /opt/agritech

# Create backup directory
echo "Creating backup directory..."
mkdir -p /opt/agritech/backups
chmod 755 /opt/agritech/backups

# Create non-root user for application management
echo "Creating application user..."
useradd -m -s /bin/bash agritech
usermod -aG docker agritech
echo "Please set a password for the agritech user:"
passwd agritech

# Add user to sudoers
echo "agritech ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/agritech
chmod 0440 /etc/sudoers.d/agritech

# Set ownership of application directory
chown -R agritech:agritech /opt/agritech

echo ""
echo "===== Server Setup Complete ====="
echo ""
echo "Next steps:"
echo "1. Clone the AgriTech repository to /opt/agritech"
echo "2. Configure environment variables in .env file"
echo "3. Run the deployment script"
echo ""
echo "You can now log in as the agritech user to continue the deployment process."