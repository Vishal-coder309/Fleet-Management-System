# 🚁 DroneOps - Comprehensive Drone Survey Management System

A modern, scalable drone fleet management and mission planning platform built with Next.js 15, MongoDB, and advanced real-time features.

![DroneOps Dashboard](https://img.shields.io/badge/Status-Production%20Ready-green)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)

## 🌟 Overview

DroneOps is an enterprise-grade drone survey management system designed for organizations operating drone fleets across multiple global sites. The platform provides comprehensive mission planning, real-time monitoring, fleet management, and detailed analytics for autonomous drone operations.

### 🎯 Key Features

- **🗺️ Advanced Mission Planning** - Visual survey area definition, flight path optimization, and comprehensive parameter configuration
- **📡 Real-Time Monitoring** - Live drone tracking, mission progress updates, and interactive control interfaces
- **🛡️ Safety Management** - Weather integration, no-fly zone management, and automated safety checks
- **🌍 Multi-Site Operations** - Global site management with timezone support and distributed fleet coordination
- **📊 Analytics & Reporting** - Comprehensive survey reports, performance metrics, and operational insights
- **⚡ Live Updates** - Real-time data synchronization and automatic progress simulation

## 🏗️ Architecture

### Technology Stack

- **Frontend**: Next.js 15 with App Router, React 18, TypeScript
- **Backend**: Next.js API Routes, Server Actions
- **Database**: MongoDB Atlas with optimized indexing
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **Real-time Updates**: Server-side simulation with automatic refresh
- **Icons**: Lucide React icon library

### Project Structure

\`\`\`
drone-survey-system/
├── app/                          # Next.js App Router pages
│   ├── api/                      # API routes
│   ├── fleet/                    # Fleet management page
│   ├── missions/                 # Mission planning page
│   ├── monitoring/               # Live tracking page
│   ├── reports/                  # Analytics and reports
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Dashboard page
├── components/                   # React components
│   ├── ui/                       # shadcn/ui base components
│   ├── dashboard-stats.tsx       # Dashboard statistics
│   ├── drone-fleet-table.tsx     # Fleet management table
│   ├── active-missions-table.tsx # Mission control interface
│   ├── live-tracking-map.tsx     # Real-time tracking map
│   ├── enhanced-mission-planning.tsx # Advanced mission planner
│   ├── weather-integration.tsx   # Weather monitoring
│   ├── no-fly-zone-manager.tsx   # Safety zone management
│   ├── multi-site-manager.tsx    # Global site operations
│   └── survey-area-selector.tsx  # Visual area definition
├── lib/                          # Utility libraries
│   ├── actions.ts                # Server actions
│   ├── mongodb.ts                # Database connection
│   ├── types.ts                  # TypeScript definitions
│   └── utils.ts                  # Helper functions
├── scripts/                      # Database setup scripts
│   └── setup-database.js         # Initial data seeding
└── README.md                     # Project documentation
\`\`\`

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB instance)
- Git

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/your-org/drone-survey-system.git
   cd drone-survey-system
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment Setup**
   
   Create a `.env.local` file in the root directory:
   \`\`\`env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/drone_survey_system
   \`\`\`

4. **Database Setup**
   
   Run the database setup script to create collections and seed initial data:
   \`\`\`bash
   node scripts/setup-database.js
   \`\`\`

5. **Start Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Access the Application**
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Core Features

### 1. Mission Planning & Configuration

- **Visual Survey Area Definition**
  - Interactive polygon and rectangle drawing tools
  - Real-time area calculation and visualization
  - Survey area integration with flight path generation

- **Advanced Flight Planning**
  - Multiple flight patterns (perimeter, crosshatch, custom)
  - Configurable parameters (altitude, speed, overlap percentage)
  - Sensor configuration and data collection settings

- **Safety Integration**
  - Weather condition monitoring and flight safety assessment
  - No-fly zone management and proximity warnings
  - Automated safety checks and validation

### 2. Fleet Management

- **Comprehensive Drone Inventory**
  - Real-time status tracking (available, in-mission, maintenance, charging)
  - Battery level monitoring and health statistics
  - Capability and sensor management

- **Fleet Operations**
  - Add new drones with detailed specifications
  - Status updates and maintenance scheduling
  - Performance analytics and utilization metrics

### 3. Real-Time Mission Monitoring

- **Live Tracking Interface**
  - Interactive map with real-time drone positions
  - Flight path visualization and progress tracking
  - Mission control actions (start, pause, resume, abort)

- **Mission Management**
  - Progress monitoring with percentage completion
  - Elapsed time vs. estimated duration tracking
  - Battery level monitoring and automatic return triggers

### 4. Analytics & Reporting

- **Survey Reports**
  - Comprehensive mission summaries
  - Flight statistics (duration, distance, coverage area)
  - Image capture counts and data quality metrics

- **Performance Analytics**
  - Mission success rates and efficiency metrics
  - Fleet utilization and health monitoring
  - Operational insights and trend analysis

### 5. Multi-Site Operations

- **Global Site Management**
  - Multiple site coordination with timezone support
  - Site-specific drone assignments and mission tracking
  - World map visualization of operations

- **Distributed Operations**
  - Cross-site mission planning and coordination
  - Regional fleet management and optimization
  - Centralized reporting and analytics

## 🛡️ Safety Features

### Weather Integration
- Real-time weather monitoring with flight safety assessment
- Wind speed, visibility, and condition tracking
- Automatic mission warnings for adverse weather

### No-Fly Zone Management
- Pre-configured restricted areas (airports, military zones)
- Custom zone creation and management
- Proximity warnings and flight path validation

### Automated Safety Checks
- Battery level monitoring with auto-return thresholds
- Weather condition validation before mission start
- No-fly zone clearance verification

## 📊 Database Schema

### Core Collections

- **Organizations** - Multi-tenant organization management
- **Drones** - Fleet inventory with capabilities and status
- **Missions** - Mission planning, execution, and tracking
- **Survey Reports** - Post-mission analytics and summaries
- **Sites** - Global site management and boundaries

### Key Relationships

\`\`\`
Organization (1) → (N) Drones
Organization (1) → (N) Sites
Drone (1) → (N) Missions
Mission (1) → (1) Survey Report
Site (1) → (N) Missions
\`\`\`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `NODE_ENV` | Environment (development/production) | No |

### Database Indexes

The system automatically creates optimized indexes for:
- Drone status and organization queries
- Mission status and date-based queries
- Survey report mission relationships

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**
   - Import project to Vercel
   - Configure environment variables

2. **Database Setup**
   - Ensure MongoDB Atlas is accessible
   - Run database setup script in production

3. **Deploy**
   \`\`\`bash
   vercel --prod
   \`\`\`

### Docker Deployment

\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

## 🧪 Testing

### Running Tests

\`\`\`bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
\`\`\`

### Test Coverage

The system includes comprehensive tests for:
- Database operations and server actions
- Component rendering and user interactions
- API endpoints and data validation
- Real-time update mechanisms

## 📈 Performance

### Optimization Features

- **Database Indexing** - Optimized queries for large datasets
- **Real-time Updates** - Efficient data synchronization
- **Component Optimization** - React Server Components and client-side caching
- **Image Optimization** - Next.js automatic image optimization

### Scalability

- **Horizontal Scaling** - Stateless architecture supports multiple instances
- **Database Sharding** - MongoDB Atlas auto-scaling capabilities
- **CDN Integration** - Static asset optimization and global distribution

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open Pull Request**

### Code Standards

- **TypeScript** - Strict type checking enabled
- **ESLint** - Code quality and consistency
- **Prettier** - Automated code formatting
- **Conventional Commits** - Standardized commit messages

## 📝 API Documentation

### Server Actions

| Action | Description | Parameters |
|--------|-------------|------------|
| `getDrones()` | Fetch all drones | None |
| `addDrone(data)` | Add new drone | Drone object |
| `createMission(data)` | Create new mission | Mission object |
| `updateMissionStatus(id, status)` | Update mission status | Mission ID, Status |
| `getSurveyReports()` | Fetch survey reports | None |

### REST Endpoints

\`\`\`
GET    /api/drones              # List all drones
POST   /api/drones              # Create new drone
GET    /api/missions            # List all missions
POST   /api/missions            # Create new mission
PUT    /api/missions/:id        # Update mission
GET    /api/reports             # List survey reports
POST   /api/simulate-progress   # Trigger progress simulation
\`\`\`

## 🔒 Security

### Authentication & Authorization
- Organization-based multi-tenancy
- Role-based access control (RBAC)
- API key authentication for external integrations

### Data Protection
- MongoDB connection encryption
- Input validation and sanitization
- CORS configuration for API security

## 📞 Support

### Documentation
- [API Reference](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)
- [Troubleshooting](./docs/troubleshooting.md)

### Community
- [GitHub Issues](https://github.com/your-org/drone-survey-system/issues)
- [Discussions](https://github.com/your-org/drone-survey-system/discussions)
- [Discord Community](https://discord.gg/droneops)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FlytBase** - For the comprehensive design challenge and requirements
- **shadcn/ui** - For the beautiful and accessible UI components
- **Vercel** - For the excellent Next.js framework and deployment platform
- **MongoDB** - For the robust and scalable database solution

---

**Built with ❤️ for the future of autonomous drone operations**

For questions, support, or contributions, please reach out to [vishalyadav68948@gmail.com](mailto:vishalyadav68948@gmail.com)
