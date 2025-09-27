import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { generateEmailVerificationToken } from '@/lib/jwt';
import emailService from '@/lib/email-service-enhanced';

export const dynamic = 'force-dynamic';

const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['ADMIN', 'MANAGER', 'USER']),
  phone: z.string().optional(),
  department: z.string().optional(),
  sendWelcomeEmail: z.boolean().default(true)
});

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

export async function GET(request: NextRequest) {
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

    // Only admins and managers can view all users
    if (!['ADMIN', 'MANAGER'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      organizationId: currentUser.organizationId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(role && { role }),
      ...(status && { status })
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
          isDemo: true
        }
      }),
      prisma.user.count({ where })
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
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

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only admins can create users
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can create users' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-12);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Generate email verification token
    const verificationToken = generateEmailVerificationToken(validatedData.email);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        hashedPassword,
        role: validatedData.role,
        phone: validatedData.phone,
        department: validatedData.department,
        organizationId: currentUser.organizationId,
        emailVerificationToken: verificationToken,
        status: 'ACTIVE',
        preferences: {
          notifications: {
            email: true,
            sms: validatedData.phone ? true : false,
            push: true
          },
          communication: {
            defaultChannel: 'EMAIL',
            language: 'en'
          }
        }
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
        createdAt: true,
        preferences: true
      }
    });

    // Send welcome email with setup instructions
    if (validatedData.sendWelcomeEmail) {
      try {
        const setupUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/setup-account?token=${verificationToken}`;
        
        await emailService.sendEmail({
          to: user.email,
          subject: 'Welcome to VervidFlow - Complete Your Account Setup',
          html: `
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #3B82F6; margin: 0;">Welcome to VervidFlow!</h1>
              </div>
              
              <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
                <h2 style="color: #1e293b; margin-top: 0;">Hi ${user.name}!</h2>
                <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
                  You've been invited to join VervidFlow as a ${validatedData.role.toLowerCase()}. 
                  Please complete your account setup to get started.
                </p>
                
                <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #0277bd; margin-top: 0;">Account Details:</h3>
                  <p style="color: #64748b; margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
                  <p style="color: #64748b; margin: 5px 0;"><strong>Role:</strong> ${validatedData.role}</p>
                  <p style="color: #64748b; margin: 5px 0;"><strong>Temporary Password:</strong> ${tempPassword}</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${setupUrl}" 
                     style="background: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    Complete Account Setup
                  </a>
                </div>
                
                <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <a href="${setupUrl}" style="color: #3B82F6; word-break: break-all;">${setupUrl}</a>
                </p>
              </div>
              
              <div style="text-align: center; color: #64748b; font-size: 14px;">
                <p>Need help? Contact your administrator or support@vervidflow.com</p>
                <p style="margin: 0;">© 2024 VervidFlow. All rights reserved.</p>
              </div>
            </div>
          `,
          text: `
Welcome to VervidFlow!

Hi ${user.name}!

You've been invited to join VervidFlow as a ${validatedData.role.toLowerCase()}. 

Account Details:
- Email: ${user.email}
- Role: ${validatedData.role}
- Temporary Password: ${tempPassword}

Complete your account setup: ${setupUrl}

Need help? Contact your administrator or support@vervidflow.com

© 2024 VervidFlow. All rights reserved.
          `
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user,
      temporaryPassword: tempPassword // Only return this for admin who created the user
    }, { status: 201 });

  } catch (error) {
    console.error('Create user error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid user data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
