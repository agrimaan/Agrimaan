#!/bin/bash

# Create directory for SSL certificates
mkdir -p ssl

# Generate a private key
openssl genrsa -out ssl/server.key 2048

# Generate a CSR (Certificate Signing Request)
openssl req -new -key ssl/server.key -out ssl/server.csr -subj "/C=US/ST=State/L=City/O=Organization/CN=agrimaan.example.com"

# Generate a self-signed certificate (valid for 365 days)
openssl x509 -req -days 365 -in ssl/server.csr -signkey ssl/server.key -out ssl/server.crt

# Set appropriate permissions
chmod 600 ssl/server.key
chmod 644 ssl/server.crt

echo "Self-signed SSL certificates generated successfully."
echo "For production, replace these with certificates from a trusted CA."