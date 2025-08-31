#!/bin/bash

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if MongoDB is installed
if command_exists mongod; then
    echo "MongoDB is already installed."
else
    echo "MongoDB not found. Installing MongoDB..."

    # Import the public key used by the package management system
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb.gpg

    # Create the list file for MongoDB
    echo "deb [signed-by=/usr/share/keyrings/mongodb.gpg] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

    # Update packages
    sudo apt-get update

    # Install MongoDB
    sudo apt-get install -y mongodb-org

    # Start and enable MongoDB service
    sudo systemctl start mongod
    sudo systemctl enable mongod

    echo "MongoDB installation completed."
fi

# Optional: Check MongoDB status
sudo systemctl status mongod --no-pager
