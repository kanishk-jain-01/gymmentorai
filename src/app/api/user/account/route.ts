import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function DELETE(req: NextRequest) {
  try {
    // Get user ID from session
    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as any)?.id : null;
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Delete all user data
    // This will cascade delete all related data due to the onDelete: Cascade in the schema
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ 
      error: 'Failed to delete account',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 