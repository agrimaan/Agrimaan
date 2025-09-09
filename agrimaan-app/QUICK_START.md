# Agrimaan Quick Start Guide

This guide provides step-by-step instructions to quickly set up and test the Agrimaan application with MongoDB integration.

## Prerequisites
- Node.js (v14+)
- MongoDB (v4+)
- npm or yarn

## Step 1: Install MongoDB

If you don't have MongoDB installed, run the setup script:

```bash
cd Agrimaan/agrimaan-app/backend/scripts
chmod +x setupMongoDB.sh
sudo ./setupMongoDB.sh
```

## Step 2: Set Environment Variables

Create or update the `.env` file in the backend directory:

```bash
cd Agrimaan/agrimaan-app/backend
echo "PORT=3001
MONGO_URI=mongodb://localhost:27017/agrimaan
JWT_SECRET=agrimaan-secret-key-for-development
USE_REAL_DB=true" > .env
```

## Step 3: Seed the Database

Populate the database with initial data:

```bash
cd Agrimaan/agrimaan-app/backend
node scripts/seedData.js
```

## Step 4: Start the Application

Use the start script to run both the backend and frontend:

```bash
cd Agrimaan/agrimaan-app
chmod +x start.sh
./start.sh
```

Alternatively, you can start the servers separately:

**Backend:**
```bash
cd Agrimaan/agrimaan-app/backend
npm start
```

**Frontend:**
```bash
cd Agrimaan/agrimaan-app/frontend
npm start
```

## Step 5: Access the Application

Open your browser and navigate to:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Step 6: Log In

Use one of the following accounts to log in:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@agrimaan.com | password123 |
| Farmer | farmer@agrimaan.com | password123 |
| Buyer | buyer@agrimaan.com | password123 |
| Logistics | logistics@agrimaan.com | password123 |
| Agronomist | agronomist@agrimaan.com | password123 |

## Testing Different User Roles

### Farmer Role
1. Log in as farmer@agrimaan.com
2. Explore Fields management, crop monitoring, and sensor data
3. List crops for sale in the marketplace

### Buyer Role
1. Log in as buyer@agrimaan.com
2. Browse the marketplace for available crops
3. Place orders and track their status

### Logistics Role
1. Log in as logistics@agrimaan.com
2. View available delivery requests
3. Manage ongoing deliveries

### Admin Role
1. Log in as admin@agrimaan.com
2. Access the admin dashboard
3. Manage users, fields, crops, and orders

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `sudo systemctl status mongod`
- Check MongoDB logs: `cat /var/log/mongodb/mongod.log`
- Verify connection string in `.env` file

### Application Startup Issues
- Check backend logs for errors
- Ensure all dependencies are installed: `npm install` in both frontend and backend directories
- Verify ports 3000 and 3001 are available

### Authentication Issues
- Clear browser cache and cookies
- Check that the JWT_SECRET in the `.env` file matches the one used to generate tokens
- Verify user credentials in the database

## Next Steps

After successfully setting up and testing the application, you can:

1. Explore the API documentation at http://localhost:3001/api-docs
2. Review the code structure to understand the implementation
3. Add your own features or customizations
4. Deploy the application to a production environment