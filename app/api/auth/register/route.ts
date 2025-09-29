import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { generateJWT, generateEmailVerificationToken } from '@/lib/jwt';
import emailService from '@/lib/email-service-enhanced';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
  plan: z.enum(['trial', 'starter', 'professional', 'enterprise']).default('trial'),
  phone: z.string().optional(),
  industry: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

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

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create organization first
    const organization = await prisma.organization.create({
      data: {
        name: validatedData.organizationName,
        plan: validatedData.plan,
        status: validatedData.plan === 'trial' ? 'trial' : 'active',
        trialEndsAt: validatedData.plan === 'trial' ? 
          new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null, // 14 days trial
        settings: {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          businessHours: {
            monday: { start: "09:00", end: "17:00" },
            tuesday: { start: "09:00", end: "17:00" },
            wednesday: { start: "09:00", end: "17:00" },
            thursday: { start: "09:00", end: "17:00" },
            friday: { start: "09:00", end: "17:00" },
            saturday: { closed: true },
            sunday: { closed: true }
          },
          theme: {
            primaryColor: "#3B82F6",
            secondaryColor: "#1E40AF",
            accentColor: "#F59E0B"
          }
        }
      }
    });

    // Generate email verification token
    const verificationToken = generateEmailVerificationToken(validatedData.email);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        hashedPassword,
        organizationId: organization.id,
        role: 'ADMIN', // First user is always admin
        phone: validatedData.phone,
        emailVerificationToken: verificationToken,
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
      }
    });

    // Generate JWT token
    const token = generateJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: organization.id
    });

    // Send verification email
    try {
      const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
      
      await emailService.sendEmail({
        to: user.email,
        subject: 'Welcome to VervidFlow - Verify Your Email',
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #3B82F6; margin: 0;">Welcome to VervidFlow!</h1>
            </div>
            
            <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
              <h2 style="color: #1e293b; margin-top: 0;">Hi ${user.name}!</h2>
              <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
                Thank you for joining VervidFlow! We're excited to help you streamline your service business operations.
              </p>
              <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
                To get started, please verify your email address by clicking the button below:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Verify Email Address
                </a>
              </div>
              
              <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #3B82F6; word-break: break-all;">${verificationUrl}</a>
              </p>
            </div>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #0369a1; margin-top: 0;">Your ${validatedData.plan} Plan Details:</h3>
              <ul style="color: #64748b; margin: 0; padding-left: 20px;">
                <li>Organization: ${organization.name}</li>
                <li>Plan: ${validatedData.plan.charAt(0).toUpperCase() + validatedData.plan.slice(1)}</li>
                ${validatedData.plan === 'trial' ? 
                  '<li>Trial Period: 14 days (expires ' + new Date(organization.trialEndsAt!).toLocaleDateString() + ')</li>' : 
                  '<li>Status: Active</li>'
                }
              </ul>
            </div>
            
            <div style="text-align: center; color: #64748b; font-size: 14px;">
              <p>Need help? Contact our support team at hello@vervidflow.com</p>
              <p style="margin: 0;">© 2024 VervidFlow. All rights reserved.</p>
            </div>
          </div>
        `,
        text: `
Welcome to VervidFlow!

Hi ${user.name}!

Thank you for joining VervidFlow! To get started, please verify your email address by visiting: ${verificationUrl}

Your ${validatedData.plan} plan details:
- Organization: ${organization.name}
- Plan: ${validatedData.plan.charAt(0).toUpperCase() + validatedData.plan.slice(1)}
${validatedData.plan === 'trial' ? 
  '- Trial Period: 14 days (expires ' + new Date(organization.trialEndsAt!).toLocaleDateString() + ')' : 
  '- Status: Active'
}

Need help? Contact hello@vervidflow.com

© 2024 VervidFlow. All rights reserved.
        `
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: organization.id,
        organizationName: organization.name,
        plan: organization.plan,
        emailVerified: false
      },
      token,
      requiresEmailVerification: true
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid registration data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
