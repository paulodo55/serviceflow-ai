import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createGroupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  permissions: z.record(z.string(), z.any()).default({}),
  priority: z.number().default(0),
  memberIds: z.array(z.string()).default([]),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    });

    if (!user?.organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const groups = await prisma.employeeGroup.findMany({
      where: {
        organizationId: user.organization.id,
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
        integrations: {
          select: { id: true, integrationType: true, accessLevel: true },
        },
        _count: {
          select: { members: true, integrations: true },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Error fetching employee groups:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    });

    if (!user?.organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Only admins can create groups
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createGroupSchema.parse(body);

    const group = await prisma.employeeGroup.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        permissions: validatedData.permissions,
        priority: validatedData.priority,
        organizationId: user.organization.id,
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
        integrations: true,
        _count: {
          select: { members: true, integrations: true },
        },
      },
    });

    // Add members to the group
    if (validatedData.memberIds.length > 0) {
      await Promise.all(
        validatedData.memberIds.map(userId =>
          prisma.employeeGroupMember.create({
            data: {
              groupId: group.id,
              userId,
              addedBy: user.id,
            },
          })
        )
      );
    }

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error('Error creating employee group:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues || [] },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
