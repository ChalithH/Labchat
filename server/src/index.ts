import { PrismaClient } from '@prisma/client';
import http from 'http'
import app from './app'
import { Server as SocketIOServer } from 'socket.io'
import { setupSocket } from './socket'

export const prisma = new PrismaClient();
const PORT = process.env.PORT;
const origin = process.env.API_URL;
const ENV = process.env.NODE_ENV;

// Create SocketIO server
const server = http.createServer(app)
export const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true
  }
})


async function main() {
  try {
    await prisma.$connect();
    console.log('Connected to database');
    console.log(`Starting server on Environment: ${ENV}..`);
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      if (ENV === 'production') {
        console.log(`API Documentation: ${origin}/api-docs`);
      } else { 
        console.log(`API Documentation: ${origin}:${PORT}/api-docs`);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

main();
setupSocket(io)

