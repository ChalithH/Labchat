# Express TypeScript API with PostgreSQL and Swagger

A RESTful API built with Express, TypeScript, Prisma ORM, PostgreSQL (in Docker), and Swagger documentation.

## Features

- TypeScript for type safety
- PostgreSQL in Docker for easy database setup
- Prisma ORM for database operations
- Express for API endpoints
- Swagger for API documentation
- Middleware architecture

## Prerequisites

- Node.js (v16+)
- Docker and Docker Compose
- npm or yarn

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/uoa-compsci399-2025-s1/capstone-project-2025-s1-team-13.git
cd server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file:

```bash
TODO
cp .env.example .env
```

Edit the `.env` file with your preferred database credentials.

### 4. Start the PostgreSQL database

```bash
docker-compose up -d
```

### 5. Run database migrations

```bash
npm run migrate
```

### 6. Generate Prisma client

```bash
npm run generate
```

### 7. Start the development server

```bash
npm run dev
```

Your API will be available at http://localhost:3000/api

API documentation is available at http://localhost:3000/api-docs

## API Endpoints

| Method | Endpoint        | Description         |
|--------|-----------------|---------------------|
| GET    | /api            | API information     |
| GET    | /api/users      | Get all users       |
| GET    | /api/users/:id  | Get user by ID      |
| POST   | /api/users      | Create a new user   |
| PUT    | /api/users/:id  | Update a user       |
| DELETE | /api/users/:id  | Delete a user       |

## Project Structure

```
src/
├── config/              # Configuration files
├── controllers/         # Route controllers
├── middleware/          # Express middleware
├── models/              # Data models (Swagger schemas)
├── routes/              # API routes
├── app.ts               # Express application setup
└── index.ts             # Application entry point
```

## Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm run migrate`: Run Prisma migrations
- `npm run generate`: Generate Prisma client

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request