import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  // Only allow this endpoint in development or with a valid API key
  const { searchParams } = new URL(req.url);
  const apiKey = searchParams.get('key');
  
  if (process.env.NODE_ENV === 'production' && apiKey !== process.env.DB_STATUS_API_KEY) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }
  
  try {
    // Check database connection
    const tables: string[] = [];
    
    try {
      await prisma.$queryRaw`SELECT * FROM "User" LIMIT 1`;
      tables.push('User');
    } catch (e) {
      // Silently handle error
    }
    
    try {
      await prisma.$queryRaw`SELECT * FROM "Account" LIMIT 1`;
      tables.push('Account');
    } catch (e) {
      // Silently handle error
    }
    
    try {
      await prisma.$queryRaw`SELECT * FROM "Session" LIMIT 1`;
      tables.push('Session');
    } catch (e) {
      // Silently handle error
    }
    
    try {
      await prisma.$queryRaw`SELECT * FROM "Workout" LIMIT 1`;
      tables.push('Workout');
    } catch (e) {
      // Silently handle error
    }
    
    // Get database URL (redacted for security)
    const dbUrl = process.env.DATABASE_URL || 'not set';
    const redactedDbUrl = dbUrl.replace(/(postgresql:\/\/)([^@]+)@/, '$1****@');
    
    return NextResponse.json({
      status: 'ok',
      message: 'Database connection successful',
      tables: tables,
      databaseUrl: process.env.NODE_ENV === 'production' ? '[REDACTED]' : redactedDbUrl,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'production' ? 'Database error' : error.message,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 