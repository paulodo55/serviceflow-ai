import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

const connectBankAccountSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required'),
  accountName: z.string().min(1, 'Account name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  routingNumber: z.string().optional(),
  accountType: z.enum(['CHECKING', 'SAVINGS', 'BUSINESS', 'CREDIT']),
  plaidAccountId: z.string().optional(),
  plaidAccessToken: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

const ENCRYPTION_KEY = process.env.BANK_ENCRYPTION_KEY || 'your-32-char-encryption-key-here';

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = textParts.join(':');
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

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

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const accountType = searchParams.get('accountType');

    const where: any = {
      organizationId: user.organization.id,
    };

    if (isActive !== null) where.isActive = isActive === 'true';
    if (accountType) where.accountType = accountType;

    const accounts = await prisma.bankAccount.findMany({
      where,
      include: {
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Don't expose sensitive data
    const safeAccounts = accounts.map(account => ({
      ...account,
      accountNumber: account.accountNumber ? `****${account.accountNumber.slice(-4)}` : null,
      routingNumber: account.routingNumber ? '[HIDDEN]' : null,
      plaidAccessToken: account.plaidAccessToken ? '[HIDDEN]' : null,
    }));

    return NextResponse.json({ accounts: safeAccounts });
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
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

    const body = await request.json();
    const validatedData = connectBankAccountSchema.parse(body);

    // If setting as primary, unset other primary accounts
    if (validatedData.isPrimary) {
      await prisma.bankAccount.updateMany({
        where: {
          organizationId: user.organization.id,
          isPrimary: true,
        },
        data: { isPrimary: false },
      });
    }

    // Encrypt sensitive data
    const encryptedAccountNumber = encrypt(validatedData.accountNumber);
    const encryptedRoutingNumber = validatedData.routingNumber ? encrypt(validatedData.routingNumber) : null;

    const account = await prisma.bankAccount.create({
      data: {
        ...validatedData,
        organizationId: user.organization.id,
        accountNumber: encryptedAccountNumber,
        routingNumber: encryptedRoutingNumber,
      },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    });

    // Don't expose sensitive data
    const safeAccount = {
      ...account,
      accountNumber: `****${validatedData.accountNumber.slice(-4)}`,
      routingNumber: validatedData.routingNumber ? '[HIDDEN]' : null,
      plaidAccessToken: account.plaidAccessToken ? '[HIDDEN]' : null,
    };

    return NextResponse.json(safeAccount, { status: 201 });
  } catch (error) {
    console.error('Error connecting bank account:', error);
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

// Endpoint for Plaid Link integration
export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { publicToken, metadata } = body;

    // Exchange public token for access token with Plaid
    // This is a simplified example - you'd use the actual Plaid API
    const plaidResponse = await exchangePlaidToken(publicToken);
    
    if (!plaidResponse.success) {
      return NextResponse.json({ error: 'Failed to connect with Plaid' }, { status: 400 });
    }

    // Create bank accounts from Plaid data
    const createdAccounts = [];
    for (const accountData of plaidResponse.accounts) {
      const account = await prisma.bankAccount.create({
        data: {
          organizationId: user.organization.id,
          bankName: metadata.institution?.name || 'Unknown Bank',
          accountName: accountData.name,
          accountNumber: encrypt(accountData.mask || ''),
          accountType: mapPlaidAccountType(accountData.subtype),
          plaidAccountId: accountData.account_id,
          plaidAccessToken: encrypt(plaidResponse.access_token),
          isActive: true,
          isPrimary: createdAccounts.length === 0, // First account is primary
        },
        include: {
          _count: {
            select: { transactions: true },
          },
        },
      });

      createdAccounts.push({
        ...account,
        accountNumber: `****${accountData.mask}`,
        plaidAccessToken: '[HIDDEN]',
      });
    }

    return NextResponse.json({ 
      message: 'Bank accounts connected successfully',
      accounts: createdAccounts,
    });
  } catch (error) {
    console.error('Error connecting Plaid accounts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function exchangePlaidToken(publicToken: string) {
  // This would integrate with the actual Plaid API
  // For demo purposes, return mock data
  return {
    success: true,
    access_token: 'access-sandbox-' + Math.random().toString(36).substr(2, 9),
    accounts: [
      {
        account_id: 'acc_' + Math.random().toString(36).substr(2, 9),
        name: 'Checking Account',
        mask: '1234',
        subtype: 'checking',
      },
    ],
  };
}

function mapPlaidAccountType(plaidType: string): 'CHECKING' | 'SAVINGS' | 'BUSINESS' | 'CREDIT' {
  switch (plaidType) {
    case 'checking':
      return 'CHECKING';
    case 'savings':
      return 'SAVINGS';
    case 'credit card':
      return 'CREDIT';
    default:
      return 'CHECKING';
  }
}
