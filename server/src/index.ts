import app from './app';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
const PORT = process.env.PORT;
const origin = process.env.API_URL;
const ENV = process.env.NODE_ENV;

async function main() {
  try {
    await prisma.$connect();
    console.log('Connected to database');
    console.log(`Starting server on Environment: ${ENV}..`);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API Documentation: ${origin}:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});