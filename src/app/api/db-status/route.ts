import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check database connection
    const tables: string[] = [];
    
    try {
      await prisma.$queryRaw`SELECT * FROM "User" LIMIT 1`;
      tables.push('User');
    } catch (e) {
      console.error('User table check error:', e);
    }
    
    try {
      await prisma.$queryRaw`SELECT * FROM "Account" LIMIT 1`;
      tables.push('Account');
    } catch (e) {
      console.error('Account table check error:', e);
    }
    
    try {
      await prisma.$queryRaw`SELECT * FROM "Session" LIMIT 1`;
      tables.push('Session');
    } catch (e) {
      console.error('Session table check error:', e);
    }
    
    try {
      await prisma.$queryRaw`SELECT * FROM "Workout" LIMIT 1`;
      tables.push('Workout');
    } catch (e) {
      console.error('Workout table check error:', e);
    }
    
    // Get database URL (redacted for security)
    const dbUrl = process.env.DATABASE_URL || 'not set';
    const redactedDbUrl = dbUrl.replace(/(postgresql:\/\/)([^@]+)@/, '$1****@');
    
    return NextResponse.json({
      status: 'ok',
      message: 'Database connection successful',
      tables: tables,
      databaseUrl: redactedDbUrl,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Database status check error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 