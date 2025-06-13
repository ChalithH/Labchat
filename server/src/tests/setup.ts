import { execSync } from 'child_process';

import dotenv from 'dotenv';
import { prisma } from '../prisma';
dotenv.config({ path: '.env' });


beforeAll(async () => {
  console.log('Setting up test database...');

  // Connect to test database
  await prisma.$connect();

  // Run migrations on test database
  try {
    execSync('npm run remigrate', {
      env: {
        ...process.env,
        DATABASE_URL: process.env.TEST_DATABASE_URL,
      },
      stdio: 'inherit',
    });
  } catch (error) {
    console.error('Migration failed:', error);
  }

  // Seed test database with production data
  try {
    execSync('npm run seed', {
      env: {
        ...process.env,
        NODE_ENV: 'production', // Use production seed data
        DATABASE_URL: process.env.TEST_DATABASE_URL
      },
      stdio: 'inherit'
    });
    console.log('Test database seeded successfully');
  } catch (error) {
    console.error('Seeding failed:', error);
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Optional: Reset specific tables between tests
export const resetTestData = async () => {
  // Add tables you want to reset between tests
  const tablesToReset = ['session']; // Example: reset sessions between tests

  for (const table of tablesToReset) {
    try {
      await (prisma as any)[table].deleteMany({});
    } catch (error) {
      console.warn(`Failed to reset ${table}:`, error);
    }
  }
};

export { prisma };
