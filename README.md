<div align="center">
  <img src="client/public/FrankIcon.svg" alt="Labchat Logo" width="120" />

  # Labchat



  <em>Streamlining labs to empower research</em><br>
  <em>Project by Binary Bandits, Team 13</em>
</div>



### About

Labchat is a comprehensive laboratory management platform designed specifically for the [University of Auckland's](https://www.auckland.ac.nz) research community. Built to address the chaos that often disrupts lab operations, Labchat provides an all-in-one solution for small to medium-sized research labs, combining usability, coverage, and affordability without compromise.

**The Problem:** Lab chaos hurts research through wasted time, duplicated work, and inconsistent practices.

**Our Solution:** A tailored, user-friendly platform that actually fits how UoA researchers work.

### What Makes Labchat Different?

- **Tailored for UoA Researchers**
Built specifically for the University of Auckland research community with deep understanding of local workflows and requirements.

- **All-in-One Platform**
Unlike existing solutions that excel in one area, Labchat provides comprehensive coverage across all lab management needs.

- **Built for Small Labs**
Designed for small to medium-sized research labs, avoiding the complexity and cost of enterprise solutions.

- **Usability + Coverage + Affordability**
The perfect balance of features, ease of use, and cost-effectiveness that existing solutions fail to achieve.


## Key Features

### **Smart Admission System**
- Streamlined user registration and lab joining process
- Role-based access control (Guest, Member, Admin)
- Lab-specific permissions (Student, Staff, Lab Manager)

### **Member Management**
- Comprehensive member directory with status indicators
- Real-time availability tracking
- Contact management and organizational hierarchy

### **Integrated Calendar**
- Lab & equipment booking 
- Task scheduling management and deadlines
- Supports event CRUD operations
- Multi-view support (day, week, month, adgenda)

### **Discussion Forum**
- Threaded conversations with category support
- Real-time updates via WebSocket
- Post reactions and moderation tools
- Searchable knowledge base

### **Inventory Tracking**
- Real-time stock management
- Item categorization and filtering
- Usage logging and history
- Low-stock alerts

### **Admin Dashboard**
- Global system administration
- Multi-lab management capabilities
- User permission control
- Analytics and reporting

### **Profile Management**
- Customizable user profiles
- Status configuration
- Contact information management
- Activity tracking


## Getting Started

### Prerequisites

You'll need to have `Node.js` and a package manager installed.

**Node.js Installation:**
- Use [NVM](https://github.com/nvm-sh/nvm) (Unix) or [NVM for Windows](https://github.com/coreybutler/nvm-windows)

For local development, we also reccomend using docker to host the DB. 


### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/uoa-compsci399-2025-s1/capstone-project-2025-s1-team-13.git
   cd capstone-project-2025-s1-team-13
   ```

2. **Install Node.js (if using NVM)**
   ```bash
   nvm install
   nvm use 22.14.0

   # Test installation using
   node -v
   npm -v
   ```

3. **Install all dependencies**
   ```bash
   npm run install:all
   ```

4. **Set up environment variables**
   Create a `.env` file in the `server` directory with your database credentials:
   ```env
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=your_database_name
   ```





The application will be available at `http://localhost:3000`



## Architecture

### **Frontend Stack**
- **Next.js** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **ShadCN/UI** - Reusable component library
- **Axios** - HTTP client for API communication

### **Backend Stack**
- **Express.js** - Node.js web framework
- **Prisma** - Database ORM and query builder
- **PostgreSQL** - Production database
- **Socket.IO** - Real-time communication
- **Jest** - Testing framework

### **Infrastructure**
- **AWS** - Cloud hosting and services
- **Nginx** - Reverse proxy and load balancing
- **Docker** - Containerization
- **GitHub Actions** - CI/CD pipeline


## Testing

We use comprehensive testing to ensure code quality and reliability.




## Project Structure

```
labchat/
├── client/                    # Next.js frontend application
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
└── server/                   # Express.js backend API
    ├── prisma/               # Database schema, seed data & migrations
    └── src/
        ├── config/           # Server configuration
        ├── controllers/      # Route controllers
        ├── middleware/       # Express middleware
        ├── models/           # Data models
        ├── routes/           # API route definitions
        ├── services/         # Business logic services
        ├── utils/            # Utility functions
        ├── app.ts            # Express app setup
        ├── index.ts          # Server entry point
        └── socket.ts         # WebSocket configuration
```



## Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for detailed information on how to get involved.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Team Binary Bandits

| Role | Name | GitHub |
|------|------|---------|
| **Backend Developer** | Caleb Wharton | [@CalebWharton](https://github.com/CalebWharton) |
| **Full-Stack Developer** | Chalith Hewage | [@ChalithHewage](https://github.com/ChalithHewage) |
| **Frontend Developer** | Cole Howard | [@ColeHoward](https://github.com/ColeHoward) |
| **Project Manager** | Mark McNaught | [@MarkMcNaught](https://github.com/MarkMcNaught) |
| **DevOps Engineer** | Parin Kasabia | [@ParinKasabia](https://github.com/ParinKasabia) |

---

## License

This project is licensed under the MIT License – see the [LICENSE](./LICENSE) file for details.



## Acknowledgements

Special thanks to the [University of Auckland Computer Science Department](https://www.auckland.ac.nz/en/study/study-options/find-a-study-option/computer-science.html) and our clients [Rebecca](https://profiles.auckland.ac.nz/rebecca-jelley) and [Jen](https://profiles.auckland.ac.nz/jennifer-muhl)  who provided invaluable feedback during development.

For support or questions, please visit our [GitHub Issues](https://github.com/uoa-compsci399-2025-s1/capstone-project-2025-s1-team-13/issues) or contact the team directly.

