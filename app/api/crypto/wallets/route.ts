import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createWalletSchema = z.object({
  currency: z.enum(['BITCOIN', 'ETHEREUM', 'LITECOIN', 'RIPPLE', 'CARDANO', 'POLKADOT', 'CHAINLINK', 'STELLAR', 'DOGECOIN', 'USDC', 'USDT', 'DAI']),
  address: z.string().min(1, 'Wallet address is required'),
  label: z.string().optional(),
  provider: z.enum(['COINBASE', 'BINANCE', 'KRAKEN', 'BITPAY', 'BLOCKCHAIN', 'CUSTOM']).default('CUSTOM'),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
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

    const { searchParams } = new URL(request.url);
    const currency = searchParams.get('currency');
    const provider = searchParams.get('provider');
    const isActive = searchParams.get('isActive');

    const where: any = {
      organizationId: user.organization.id,
    };

    if (currency) where.currency = currency;
    if (provider) where.provider = provider;
    if (isActive !== null) where.isActive = isActive === 'true';

    const wallets = await prisma.cryptoWallet.findMany({
      where,
      include: {
        _count: {
          select: { 
            transactions: true,
            payments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Don't expose sensitive API credentials
    const safeWallets = wallets.map(wallet => ({
      ...wallet,
      apiKey: wallet.apiKey ? '[HIDDEN]' : null,
      apiSecret: wallet.apiSecret ? '[HIDDEN]' : null,
    }));

    return NextResponse.json({ wallets: safeWallets });
  } catch (error) {
    console.error('Error fetching crypto wallets:', error);
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
    const validatedData = createWalletSchema.parse(body);

    // Check if wallet already exists
    const existingWallet = await prisma.cryptoWallet.findFirst({
      where: {
        organizationId: user.organization.id,
        currency: validatedData.currency,
        address: validatedData.address,
      },
    });

    if (existingWallet) {
      return NextResponse.json(
        { error: 'Wallet already exists for this currency and address' },
        { status: 409 }
      );
    }

    // Validate wallet address format (simplified validation)
    if (!isValidWalletAddress(validatedData.currency, validatedData.address)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    const wallet = await prisma.cryptoWallet.create({
      data: {
        ...validatedData,
        organizationId: user.organization.id,
      },
      include: {
        _count: {
          select: { 
            transactions: true,
            payments: true,
          },
        },
      },
    });

    // Don't expose sensitive data
    const safeWallet = {
      ...wallet,
      apiKey: wallet.apiKey ? '[HIDDEN]' : null,
      apiSecret: wallet.apiSecret ? '[HIDDEN]' : null,
    };

    return NextResponse.json(safeWallet, { status: 201 });
  } catch (error) {
    console.error('Error creating crypto wallet:', error);
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

function isValidWalletAddress(currency: string, address: string): boolean {
  // Simplified address validation - in production, use proper crypto libraries
  switch (currency) {
    case 'BITCOIN':
      return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/.test(address);
    case 'ETHEREUM':
    case 'USDC':
    case 'USDT':
    case 'DAI':
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    case 'LITECOIN':
      return /^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/.test(address);
    case 'RIPPLE':
      return /^r[0-9a-zA-Z]{24,34}$/.test(address);
    case 'DOGECOIN':
      return /^D{1}[5-9A-HJ-NP-U]{1}[1-9A-HJ-NP-Za-km-z]{32}$/.test(address);
    default:
      return address.length > 20; // Basic length check for other currencies
  }
}
