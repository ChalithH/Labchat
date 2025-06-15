<div align="center">
  <img src="client/public/FrankIcon.svg" alt="Labchat Logo" width="120" />

  # Labchat



  <em>Streamlining labs to empower research</em><br>
  <em>Project by Binary Bandits, Team 13</em>
 
  
  <h3>Links</h3>
  <a href="https://www.labchatuoa.com/">Website</a> | <a href="https://api.labchatuoa.com/api-docs/">Api Documentation</a> | <a href="https://github.com/orgs/uoa-compsci399-2025-s1/projects/36/views/2">Github Projects </a>
   
</div>




## About

Labchat is a comprehensive laboratory management platform designed specifically for the [University of Auckland's](https://www.auckland.ac.nz) research community. Built to address the chaos that often disrupts lab operations, Labchat provides an all-in-one solution for small to medium-sized research labs, combining usability, coverage, and affordability without compromise.

**The Problem:** Lab chaos hurts research through wasted time, duplicated work, and inconsistent practices.

**Our Solution:** A tailored, user-friendly platform that actually fits how our researchers work.

### What Makes Labchat Different?

- **Tailored for Researchers**
Built specifically for the University of Auckland research community with deep understanding of lab workflows and requirements.

- **All-in-One Platform**
Unlike existing solutions that excel in one area, Labchat provides comprehensive coverage across all lab management needs.

- **Built for Small Labs**
Designed for small to medium-sized research labs, avoiding the complexity and cost of enterprise solutions.

- **Usability + Coverage + Affordability**
The perfect balance of features, ease of use, and cost-effectiveness that existing solutions fail to achieve.


## Technologies used 

### **Frontend Stack**
- **Next.js** `15.2.4` - React framework with App Router
- **React** `19.0.0` - JavaScript library for building user interfaces
- **TypeScript** `5.8.3` - Enhanced JavaScript with static typing
- **Tailwind CSS** `4.0` - Utility-first CSS framework
- **ShadCN/UI** - Reusable component library built on Radix UI primitives
  - **Radix UI Components** `1.1.x - 2.1.x` - Accessible React primitives (accordion, dialog, dropdown, etc.)
- **Axios** `1.8.4` - HTTP client for API communication
- **React Hook Form** `7.56.0` - Form state management with validation
- **Zod** `3.24.3` - TypeScript-first schema validation
- **Socket.IO Client** `4.8.1` - Real-time communication
- **Lucide React** `0.485.0` - Icon library
- **React Markdown** `10.1.0` - Markdown rendering with GitHub Flavored Markdown
- **Date-fns** `4.1.0` - Modern JavaScript date utility library

### **Backend Stack**
- **Node.js** `22.14.0` - JavaScript runtime environment
- **Express.js** `5.1.0` - Node.js web framework
- **TypeScript** `5.8.3` - Enhanced JavaScript with static typing
- **Prisma** `6.5.0` - Database ORM and query builder
- **PostgreSQL** - Production relational database
- **Socket.IO** `4.8.1` - Real-time bidirectional communication
- **Passport.js** `0.7.0` - Authentication middleware
- **bcrypt** `5.1.1` - Password hashing library
- **JSON Web Tokens** `9.0.2` - Token-based authentication
- **Jest** - Testing framework for unit tests
- **Swagger** `6.2.8` - API documentation generation

### **Infrastructure & Deployment**
- **AWS** - Cloud hosting and services
  - **AWS Amplify** - Frontend hosting and deployment
  - **AWS EC2** - Backend server hosting
  - **AWS RDS** - PostgreSQL database hosting
  - **AWS S3** - Static asset storage
  - **AWS Route 53** - DNS management
  - **AWS VPC** - Virtual Private Cloud for security
- **Nginx** - Reverse proxy and load balancing
- **PM2** - Process manager for Node.js applications
- **Docker** - Containerization for local development
- **GitHub Actions** - CI/CD pipeline

### **Development Tools**
- **GitHub** - Version control and collaboration
- **Figma** - UI/UX design and prototyping
- **ESLint** `9.0` - Code linting and quality
- **Nodemon** `3.1.9` - Development server auto-restart

## Project Structure

```
labchat/
├── client/                   # Next.js frontend application
│   ├── public/               # Static assets
│   └── src/
│       ├── app/              # App Router pages
│       │   ├── (auth)/       # Authentication routes
│       │   ├── (header_footer)/
│       │   ├── (admin)/      # Admin panel routes
│       │   ├── (admission)/  # Lab admission pages
│       │   ├── (calendar)/   # Calendar functionality
│       │   ├── (discussion)/ # Discussion forum
│       │   ├── (inventory)/  # Inventory management
│       │   ├── (members)/    # Member directory
│       │   ├── (profile)/    # User profiles
│       │   ├── dashboard/    # Main dashboard
│       │   └── home/         # Landing page
│       ├── api/upload/       # API upload endpoints
│       ├── components/       # Reusable UI components
│       ├── config/           # Configuration files
│       ├── contexts/         # React contexts
│       ├── hooks/            # Custom React hooks
│       ├── lib/              # Utility functions
│       └── types/            # TypeScript type definitions
│
└── server/                   # Express.js backend API
    ├── prisma/               # Database schema, seed data & migrations
    ├── src/
    │    ├── config/           # Server configuration
    │    ├── controllers/      # Route controllers
    │    ├── middleware/       # Express middleware
    │    ├── models/           # Data models
    │    ├── routes/           # API route definitions
    │    ├── services/         # Business logic services
    │    ├── Tests/            # Jest unit tests on controllers, middleware and services. 
    │    ├── utils/            # Utility functions
    │    ├── app.ts            # Express app setup
    │    ├── index.ts          # Server entry point
    │    └── socket.ts         # WebSocket configuration
    ├── docker-compose.yml     # Docker  container for hosting test and development DB 
    ├── ecosystem.config.js    # PM2 script to start up server rapidly 
    └── jest.config.ts         # Jest test configuration file 
```

## Getting Started

### Prerequisites

Before you can run Labchat locally, ensure you have the following tools installed on your system:

#### **Required Software**

**1. Node.js [22.14.0] (via NVM)**
- **NVM (Node Version Manager)** is recommended for managing Node.js versions
- **Unix/Linux/macOS**: Install [NVM](https://github.com/nvm-sh/nvm)
  ```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
  ```
- **Windows**: Install [NVM for Windows](https://github.com/coreybutler/nvm-windows)
- **Required Node.js version**: `22.14.0` (specified in the project)

**2. Git**
- Required for cloning the repository and version control
- **Download**: [Git Official Website](https://git-scm.com/downloads)
- **Verify installation**: 
  ```bash
  git --version
  ```

**3. Docker**
- Required for running PostgreSQL database locally during development
- **Download**: [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Verify installation**:
  ```bash
  docker --version
  docker-compose --version

  Once docker is installed its reccomended that you set up the database container
  ```

**4. Package Manager**
- **npm** (comes with Node.js) 
- npm is included with Node.js installation

#### **Development Environment Setup**

For the best development experience:

1. **Install Node.js with NVM**:
   ```bash
   # Install and use the required Node.js version
   nvm install 22.14.0
   nvm use 22.14.0
   nvm alias default 22.14.0
   ```

2. **Configure Git** (if first time):
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

3. **Start Docker** (ensure Docker Desktop is running)

Once all prerequisites are installed, you're ready to proceed with the [Installation](#installation) steps.

#### **Verification Steps**

After installing the prerequisites, verify everything is working:

```bash
# Check Node.js and npm versions
node --version  # Should show v22.14.0
npm --version   # Should show npm version

# Check Git
git --version

# Check Docker
docker --version
docker-compose --version
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/uoa-compsci399-2025-s1/capstone-project-2025-s1-team-13.git
   cd capstone-project-2025-s1-team-13
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   Create a `.env` file in the `server` directory and a `.env.local` file in the client directory by running the following commands :
   ```bash 
   cd client
   cp .env.example .env.development
   cp .env.example .env.production
   cd ../server 
   cp .env.example .env
   ```

4. **Stop existing PostgreSQL services (Important!)**
   
   Docker requires exclusive access to port 5432. If you have PostgreSQL installed locally, you must stop it first:

   **Windows:**
   - Open **Task Manager** (Ctrl + Shift + Esc)
   - Go to the **Services** tab
   - Find services starting with "postgresql" (e.g., `postgresql-x64-13`, `postgresql-x64-14`)
   - Right-click each PostgreSQL service and select **Stop**
   
   **macOS:**
   ```bash
   # Stop PostgreSQL if installed via Homebrew
   brew services stop postgresql
   
   # Or if installed via PostgreSQL.app
   # Simply quit the PostgreSQL.app from the menu bar
   ```
   
   **Linux:**
   ```bash
   # Stop PostgreSQL service
   sudo systemctl stop postgresql
   # or
   sudo service postgresql stop
   ```

6. **Start the database and initialize the project**
   ```bash
   # From the root directory
   npm run setup
   ```
   
   This command will:
   - Start the PostgreSQL Docker container (`docker-compose up -d`)
   - Reset and apply database migrations (`npm run remigrate`)
   - Seed the database with initial data (`npm run seed`)
  
7. **Start the development servers**
   ```bash
   # Start both frontend and backend concurrently
   npm run dev
   ```

The application will be available at:
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **API Documentation**: `http://localhost:8000/api-docs` (Swagger UI)

Intended starting flow 
 - lab admin creates a lab on admin dashboard
 - user registers, logs in and requests admission to the lab
 - Admin accepts admission request (the role sould be lab manager to allow them to configure the lab aswell)
 - User beings using labhcat platform

**Account info for admin user**
prod: admin@labchatuoa.com
dev: admin@labchat.com

pass: admin

### Alternative Installation Commands

If you prefer to run commands individually:

```bash
# Start only the database
cd server && docker-compose up -d

# Install dependencies separately
npm install                    # Root dependencies
cd client && npm install      # Frontend dependencies
cd ../server && npm install   # Backend dependencies

# Run database migrations and seeding separately
cd server
npm run remigrate             # Reset and apply migrations
npm run seed                  # Seed with initial data

# Start services individually
npm run client               # Frontend only (localhost:3000)
npm run server               # Backend only (localhost:8000)

# Or start both together
npm run dev                  # Both frontend and backend
```
### Troubleshooting

**Database Connection Issues:**
- Ensure Docker is running and the PostgreSQL container is started
- Verify no other PostgreSQL services are running on port 5432
- Check that the `.env` file has the correct database credentials

**Port Conflicts:**
- Frontend (3000): Make sure no other applications are using this port
- Backend (8000): Check if another service is running on this port
- Database (5432): Ensure PostgreSQL services are stopped as mentioned above

**Docker Issues:**
```bash
# Check if containers are running
docker ps

# Restart the database container if needed
cd server
docker-compose down
docker-compose up -d

# View container logs
docker-compose logs postgres
```


## Testing

We use comprehensive testing to ensure code quality and reliability across our backend components.

### Running Tests

Our backend uses **Jest** and **SuperTest** for unit testing and API endpoint testing.

**Run all backend tests:**
```bash
# Automated test setup (recommended)
npm run test
```

This command automatically:
1. Resets and applies database migrations (`remigrate`)
2. Seeds the database with test data (`seed`)
3. Runs the complete test suite

Our testing suites covers 293 unit tests across our various different controllers, middleware and services to ensure logic in the application layer is correct and meets our clients requirements. 

![image](client/public//Screenshot%202025-06-15%20190131.png)



### **Important: Environment Switching**

When switching between **development** and **testing** environments, always remigrate and reseed the database to ensure data consistency:

```bash
# When switching TO testing environment
npm run test              # Automatically handles remigration and seeding

# When switching BACK TO development environment
npm run regenerate        # Remigrate and reseed for development
npm run dev               # Start development servers
```

**Why remigration is necessary:**
- Tests may modify database state
- Different environments require different seed data
- Ensures clean, predictable state for both development and testing
- Prevents data conflicts between environments


## Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for detailed information on how to get involved.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Work

### System Enhancements

* University tools integration - SSO, student directories, and academic database connections for streamlined onboarding
* Performance optimizations - Database schema improvements, query optimization, and faster API response times
* Desktop responsiveness improvements - Better layout scaling and spacing for larger screen devices
* Comprehensive testing suite - Automated frontend testing with * Storybook and expanded Jest backend coverage
* CI/CD pipeline integration - Automated testing and deployment using GitHub Actions or Jenkins
* Enhanced calendar automation - Advanced scheduling algorithms and conflict resolution
* Advanced analytics dashboard - Detailed usage metrics, trends, and lab performance insights


## Acknowledgements 
Special thanks to the [University of Auckland Computer Science Department](https://www.auckland.ac.nz/en/study/study-options/find-a-study-option/computer-science.html), our capstone facilitator [Asma](https://profiles.auckland.ac.nz/asma-shakil) for supporting our team and our clients [Rebecca](https://profiles.auckland.ac.nz/rebecca-jelley) and [Jen](https://profiles.auckland.ac.nz/jennifer-muhl) who provided invaluable feedback during development of Labchat.

For support or questions, please visit our [GitHub Issues](https://github.com/uoa-compsci399-2025-s1/capstone-project-2025-s1-team-13/issues) or contact the team directly.

Finally, we wish to acknowledge the resoruces we used to support development of our application. 
### Frontend learning resources
* https://www.youtube.com/watch?v=Zq5fmkH0T78&t=27s (Next JS tutorial)
* https://github.com/charlietlamb/calendar (Calendar inspiration)


### Backend learning resources  
* https://www.youtube.com/watch?v=9BD9eK9VqXA&t=15643s (Express.JS with prisma setup)
* https://www.youtube.com/watch?v=nH9E25nkk3I&t=3371s (Passport JS with session cookies)
* https://www.youtube.com/watch?v=J2dB96MUL8s&t=1090s (Dockerising PostgreSQL DB)


### AWS deployment learning resources
* https://www.youtube.com/watch?v=X1zCAPLvMtw (VPC setup) 
* https://www.youtube.com/watch?v=H93Vhy6pmow&t=636s (RDS setup)
* https://www.youtube.com/watch?v=yhiuV6cqkNs (SSL setup with Nginx)

## Binary Bandits 
Congratulations to Team 13 for completing their Capstone Project!
* Proposal document: https://docs.google.com/document/d/1FedvVdMy9A9ripl-qBNBzSZkBCglH6ROw6JOKhI_yU0/edit?tab=t.0
* Final Report: https://docs.google.com/document/d/1geD4MXczun_YtjJPhw80a-Jp18ZzUCmr/edit?rtpof=true&tab=t.0
* Deployed website: https://www.labchatuoa.com/
* Api documentation: https://api.labchatuoa.com/api-docs/
* Project timeline: https://github.com/orgs/uoa-compsci399-2025-s1/projects/36/views/2
* Demo video: https://www.youtube.com/watch?v=SF7oTjKIhbg&t=3s


| Role | Name | GitHub |
|------|------|---------|
| **Backend Developer** | Caleb Wharton | [@calebwharton](https://github.com/calebwharton) |
| **Full-Stack Developer** | Chalith Hewage | [@ChalithHewage](https://github.com/ChalithH) |
| **Full-Stack Developer** | Cole Howard | [@cole-howard-nz](https://github.com/cole-howard-nz) |
| **Project Manager** | Mark McNaught | [@Mark-McNaught](https://github.com/Mark-McNaught) |
| **DevOps Engineer** | Parin Kasabia | [@MateUrDreaming](https://github.com/MateUrDreaming) |


## License

This project is licensed under the MIT License – see the [LICENSE](./LICENSE) file for details.
