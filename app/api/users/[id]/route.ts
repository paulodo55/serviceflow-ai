import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'USER']).optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  preferences: z.object({
    notifications: z.object({
      email: z.boolean(),
      sms: z.boolean(),
      push: z.boolean()
    }).optional(),
    communication: z.object({
      defaultChannel: z.enum(['EMAIL', 'SMS', 'PHONE']),
      language: z.string()
    }).optional()
  }).optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = params.id;

    // Users can only view their own profile unless they're admin/manager
    if (userId !== currentUser.id && !['ADMIN', 'MANAGER'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { 
        id: userId,
        organizationId: currentUser.organizationId // Ensure same organization
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        department: true,
        status: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        preferences: true,
        isDemo: true,
        organization: {
          select: {
            id: true,
            name: true,
            plan: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = params.id;
    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    // Check permissions
    const isOwnProfile = userId === currentUser.id;
    const isAdmin = currentUser.role === 'ADMIN';
    const isManager = currentUser.role === 'MANAGER';

    if (!isOwnProfile && !isAdmin && !isManager) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Managers can't modify admins, only admins can modify role/status
    if (!isOwnProfile && !isAdmin) {
      if (validatedData.role || validatedData.status) {
        return NextResponse.json(
          { error: 'Only admins can modify user roles and status' }, 
          { status: 403 }
        );
      }
    }

    // Find the user to update
    const userToUpdate = await prisma.user.findUnique({
      where: { 
        id: userId,
        organizationId: currentUser.organizationId
      }
    });

    if (!userToUpdate) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent non-admins from modifying admin users
    if (userToUpdate.role === 'ADMIN' && !isAdmin) {
      return NextResponse.json(
        { error: 'Cannot modify admin users' }, 
        { status: 403 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.role && { role: validatedData.role }),
        ...(validatedData.phone !== undefined && { phone: validatedData.phone }),
        ...(validatedData.department !== undefined && { department: validatedData.department }),
        ...(validatedData.status && { status: validatedData.status }),
        ...(validatedData.preferences && { 
          preferences: {
            ...userToUpdate.preferences,
            ...validatedData.preferences
          }
        })
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        department: true,
        status: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        preferences: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid user data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only admins can delete users
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can delete users' }, { status: 403 });
    }

    const userId = params.id;

    // Prevent self-deletion
    if (userId === currentUser.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Find the user to delete
    const userToDelete = await prisma.user.findUnique({
      where: { 
        id: userId,
        organizationId: currentUser.organizationId
      }
    });

    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent deletion of demo users
    if (userToDelete.isDemo) {
      return NextResponse.json({ error: 'Cannot delete demo users' }, { status: 400 });
    }

    // Check if this is the last admin
    if (userToDelete.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: {
          organizationId: currentUser.organizationId,
          role: 'ADMIN',
          status: 'ACTIVE'
        }
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last admin user' }, 
          { status: 400 }
        );
      }
    }

    // Soft delete by updating status instead of hard delete
    await prisma.user.update({
      where: { id: userId },
      data: { 
        status: 'INACTIVE',
        email: `deleted_${Date.now()}_${userToDelete.email}` // Prevent email conflicts
      }
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
