import { execSync } from 'child_process';
import dotenv from 'dotenv';
import { prisma } from '../prisma'; // Import from prisma.ts instead of index.ts

dotenv.config({ path: '.env' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'test-session-secret';
process.env.COOKIE_SECRET = process.env.COOKIE_SECRET || 'test-cookie-secret';

// Extend Jest matchers
expect.extend({
  toBeOneOf(received, validOptions) {
    const pass = validOptions.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of [${validOptions.join(', ')}]`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be one of [${validOptions.join(', ')}]`,
        pass: false,
      };
    }
  },
});

// Store cleanup functions to call during teardown
const cleanupFunctions: (() => Promise<void> | void)[] = [];

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
  console.log('Cleaning up test environment...');
  
  // Run all cleanup functions
  for (const cleanup of cleanupFunctions) {
    try {
      await cleanup();
    } catch (error) {
      console.warn('Cleanup function failed:', error);
    }
  }
  
  // Import and run cleanup from index if needed
  try {
    const { cleanup: indexCleanup } = await import('../index');
    if (indexCleanup) {
      await indexCleanup();
    }
  } catch (error) {
    // Index cleanup might not be needed if server didn't start
    if (error instanceof Error) {
      console.log('Index cleanup not needed or failed:', error.message);
    } else {
      console.log('Index cleanup not needed or failed:', error);
    }
  }
  
  // Disconnect from database
  await prisma.$disconnect();
  
  // Give more time for any remaining async operations to complete
  await new Promise(resolve => setTimeout(resolve, 500));
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

// Function to register cleanup callbacks
export const registerCleanup = (cleanupFn: () => Promise<void> | void) => {
  cleanupFunctions.push(cleanupFn);
};

export { prisma };