import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// This is a protected endpoint to manually run migrations
// It should only be accessible with a valid secret key
export async function POST(req: NextRequest) {
  try {
    // Check for secret key
    const { searchParams } = new URL(req.url);
    const secretKey = searchParams.get('key');
    
    // Verify the secret key matches the environment variable
    // This is a simple security measure to prevent unauthorized access
    if (!secretKey || secretKey !== process.env.MIGRATION_SECRET_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Run Prisma migrations
    const { stdout, stderr } = await execAsync('npx prisma migrate deploy');
    
    return NextResponse.json({
      success: true,
      message: 'Migrations completed successfully',
      output: process.env.NODE_ENV === 'production' ? '[REDACTED]' : stdout,
      errors: stderr ? (process.env.NODE_ENV === 'production' ? 'Errors occurred' : stderr) : null
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Failed to run migrations',
      error: process.env.NODE_ENV === 'production' ? 'Migration error' : error.message,
    }, { status: 500 });
  }
} 