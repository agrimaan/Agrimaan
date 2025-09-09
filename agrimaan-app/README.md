# Agrimaan Application

A comprehensive agrimaan platform inspired by Agrimaan.io, integrating IoT, AI, and blockchain technologies to provide farmers and agribusinesses with tools for improved agricultural productivity, sustainability, and profitability.

## Features

### Crop Management System (CMS)
- Real-time monitoring of soil conditions, weather, and crop health
- IoT sensor integration for data collection
- Irrigation and nutrient management recommendations

### Precision Agriculture Management (PAM)
- Soil sample analysis and monitoring
- Pest pressure tracking and management
- Fertilization optimization using AI-driven insights

### Decision Support System (DSS)
- AI-powered predictive analytics for crop yields and market trends
- Automated data analysis for customized reports
- Variable-rate seeding and resource application guidance

### Data Sharing Platform (DSP)
- Blockchain-based data sharing across the agricultural value chain
- Standardization and synchronization of agricultural data
- Enhanced traceability and transparency

### Marketplace and Order Management
- Direct buying and selling of agricultural products
- Order tracking from placement to delivery
- Quality and rating system for products and sellers

## Technology Stack

### Frontend
- React.js with TypeScript
- Material-UI for UI components
- Redux Toolkit for state management
- Chart.js for data visualization
- Leaflet.js for Fields mapping

### Backend
- Node.js with Express
- MongoDB for database
- JWT for authentication
- RESTful API design

### IoT Integration
- MQTT protocol for sensor communication
- Edge computing for IoT data processing
- APIs for various sensor types

### AI/ML Components
- TensorFlow.js for client-side inference
- Python backend for complex ML models
- Data processing and analysis

### Blockchain Integration
- Hyperledger Fabric for permissioned blockchain
- Smart contracts for automated transactions
- Distributed storage

### Deployment & DevOps
- Docker and Docker Compose for containerization
- Nginx for web server and reverse proxy
- Prometheus and Grafana for monitoring
- Automated backup and restore scripts
- CI/CD with GitHub Actions

## Project Structure

```
agrimaan-app/
├── frontend/           # React frontend application
│   ├── public/         # Static files
│   └── src/            # Source code
│       ├── components/ # Reusable components
│       ├── features/   # Redux slices and logic
│       ├── pages/      # Page components
│       └── utils/      # Utility functions
├── backend/            # Node.js backend application
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── config/         # Configuration files
│   ├── scripts/        # Database scripts
│   └── utils/          # Utility functions
├── docs/               # Documentation
├── nginx/              # Nginx configuration
├── monitoring/         # Prometheus and Grafana configs
├── migrations/         # Database migration scripts
└── scripts/            # Utility scripts
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4 or higher)
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/agrimaan-app.git
cd agrimaan-app
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Create a `.env` file in the backend directory with the following variables:
```
PORT=3001
MONGO_URI=mongodb://localhost:27017/agrimaan
JWT_SECRET=your_jwt_secret_key_here
USE_REAL_DB=true
```

### Setting up MongoDB

1. Install MongoDB:
```bash
cd backend/scripts
chmod +x setupMongoDB.sh
sudo ./setupMongoDB.sh
```

2. Seed the database with initial data:
```bash
cd backend
node scripts/seedData.js
```

### Running the Application

#### Option 1: Using the start script
```bash
chmod +x start.sh
./start.sh
```

#### Option 2: Running servers separately

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## Default Users

After seeding the database, you can log in with the following credentials:

- **Admin**:
  - Email: admin@agrimaan.com
  - Password: password123

- **Farmer**:
  - Email: farmer@agrimaan.com
  - Password: password123

- **Buyer**:
  - Email: buyer@agrimaan.com
  - Password: password123

- **Logistics Provider**:
  - Email: logistics@agrimaan.com
  - Password: password123

- **Agronomist**:
  - Email: agronomist@agrimaan.com
  - Password: password123

## Deployment

### Prerequisites

- Linux server with Docker and Docker Compose installed
- Domain name configured with DNS records
- SSL certificates (or use the provided script to generate self-signed certificates)

### Quick Start Deployment

1. **Server Setup**:
   ```bash
   cd scripts
   ./server_setup.sh
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Deploy the application**:
   ```bash
   cd scripts
   ./deploy.sh
   ```

4. **Access the application**:
   - Frontend: https://your-domain.com
   - Backend API: https://your-domain.com/api
   - Grafana: http://your-domain.com:3000
   - Prometheus: http://your-domain.com:9090

### Deployment Documentation

For detailed deployment instructions, refer to the following documentation:

- [Deployment Guide](docs/deployment_guide.md): Step-by-step deployment instructions
- [Deployment Checklist](docs/deployment_checklist.md): Pre-deployment and deployment checklist
- [Operations Training](docs/operations_training.md): Guide for operations team
- [Communication Plan](docs/communication_plan.md): Stakeholder communication plan
- [Deployment Summary](docs/deployment_summary.md): Summary of deployment preparation

### Maintenance

#### Backups

Automated backups are configured to run daily. To manually trigger a backup:

```bash
cd scripts
./backup.sh
```

#### Scaling

To scale the application for higher load:

```bash
cd scripts
./scale.sh --backend 3 --frontend 2
```

## API Documentation

The API documentation is available at `/api/docs` when the server is running.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Agrimaan.io platform
- Built with modern web technologies
- Designed for scalability and extensibility