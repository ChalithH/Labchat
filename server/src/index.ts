import http from 'http'
import app from './app'
import { Server as SocketIOServer } from 'socket.io'
import { setupSocket } from './socket'
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

const PORT = process.env.PORT;
const origin = process.env.API_URL;
const ENV = process.env.NODE_ENV;

const server = http.createServer(app)
export const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true
  }
})

let serverInstance: http.Server | null = null;

async function main() {
  try {
    await prisma.$connect();
    console.log('Connected to database');
    console.log(`Starting server on Environment: ${ENV}..`);
    
    if (ENV !== 'test') {
      serverInstance = server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        if (ENV === 'production') {
          console.log(`API Documentation: ${origin}/api-docs`);
        } else { 
          console.log(`API Documentation: ${origin}:${PORT}/api-docs`);
        }
      });
      
      setupSocket(io);
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

const gracefulShutdown = async () => {
  console.log('Shutting down gracefully...');
  
  if (serverInstance) {
    await new Promise<void>((resolve, reject) => {
      serverInstance!.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
  
  if (io) {
    io.close();
  }
  
  // Disconnect from database
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Export cleanup function for tests
export const cleanup = async () => {
  if (serverInstance) {
    await new Promise<void>((resolve, reject) => {
      serverInstance!.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    serverInstance = null;
  }
  
  if (io) {
    io.close();
  }
};

if (ENV !== 'test') {
  main();
}