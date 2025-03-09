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
      console.error('Invalid or missing secret key');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('Running Prisma migrations...');
    
    // Run Prisma migrations
    const { stdout, stderr } = await execAsync('npx prisma migrate deploy');
    
    console.log('Migration stdout:', stdout);
    if (stderr) console.error('Migration stderr:', stderr);
    
    return NextResponse.json({
      success: true,
      message: 'Migrations completed successfully',
      output: stdout,
      errors: stderr || null
    });
  } catch (error: any) {
    console.error('Error running migrations:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to run migrations',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 