import { prisma } from '@/lib/prisma';

/**
 * Checks if a user has exceeded their daily API request limit
 * @param userId The user's ID
 * @returns An object indicating if the limit is exceeded and the current count
 */
export async function checkApiUsageLimit(userId: string): Promise<{ 
  limitExceeded: boolean; 
  currentCount: number;
  limit: number;
}> {
  const limit = parseInt(process.env.DAILY_API_REQUEST_LIMIT || '10', 10);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get or create today's usage record
  const usage = await prisma.apiUsage.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
  });
  
  const currentCount = usage?.count || 0;
  const limitExceeded = currentCount >= limit;
  
  return {
    limitExceeded,
    currentCount,
    limit,
  };
}

/**
 * Increments a user's API usage count for the current day
 * @param userId The user's ID
 * @returns The updated usage record
 */
export async function incrementApiUsage(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Upsert the usage record (create if it doesn't exist, update if it does)
  return prisma.apiUsage.upsert({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
    update: {
      count: {
        increment: 1,
      },
    },
    create: {
      userId,
      date: today,
      count: 1,
    },
  });
} 