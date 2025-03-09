import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Log database connection details (without sensitive info)
if (process.env.DATABASE_URL) {
  const dbUrl = process.env.DATABASE_URL;
  const redactedDbUrl = dbUrl.replace(/(postgresql:\/\/)([^@]+)@/, '$1****@');
  console.log(`Initializing Prisma client with database: ${redactedDbUrl}`);
} else {
  console.warn('DATABASE_URL environment variable is not set!');
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

// Test database connection on startup
async function testConnection() {
  try {
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    return true;
  } catch (e) {
    console.error('❌ Database connection failed:', e);
    return false;
  }
}

// Run the test but don't block initialization
testConnection().catch(console.error);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 