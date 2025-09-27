import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import QRCode from 'qrcode';

const createPaymentSchema = z.object({
  walletId: z.string().min(1, 'Wallet ID is required'),
  customerId: z.string().optional(),
  invoiceId: z.string().optional(),
  usdAmount: z.number().min(0.01, 'Amount must be greater than 0'),
  currency: z.enum(['BITCOIN', 'ETHEREUM', 'LITECOIN', 'RIPPLE', 'CARDANO', 'POLKADOT', 'CHAINLINK', 'STELLAR', 'DOGECOIN', 'USDC', 'USDT', 'DAI']),
  expirationHours: z.number().default(24),
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
    const status = searchParams.get('status');
    const currency = searchParams.get('currency');
    const customerId = searchParams.get('customerId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId: user.organization.id,
    };

    if (status) where.status = status;
    if (currency) where.currency = currency;
    if (customerId) where.customerId = customerId;

    const [payments, total] = await Promise.all([
      prisma.cryptoPayment.findMany({
        where,
        include: {
          wallet: {
            select: { id: true, currency: true, address: true, label: true },
          },
          customer: {
            select: { id: true, name: true, email: true, phone: true },
          },
          invoice: {
            select: { id: true, invoiceNumber: true, total: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.cryptoPayment.count({ where }),
    ]);

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching crypto payments:', error);
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
    const validatedData = createPaymentSchema.parse(body);

    // Verify wallet belongs to organization
    const wallet = await prisma.cryptoWallet.findFirst({
      where: {
        id: validatedData.walletId,
        organizationId: user.organization.id,
        isActive: true,
      },
    });

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    // Get current exchange rate
    const exchangeRate = await getCryptoExchangeRate(validatedData.currency);
    if (!exchangeRate) {
      return NextResponse.json({ error: 'Unable to get exchange rate' }, { status: 400 });
    }

    // Calculate crypto amount
    const cryptoAmount = (validatedData.usdAmount / exchangeRate).toFixed(8);

    // Generate payment address (in production, this would be a unique address)
    const paymentAddress = wallet.address;

    // Create payment URI for QR code
    const paymentUri = createPaymentUri(validatedData.currency, paymentAddress, cryptoAmount);
    
    // Generate QR code
    const qrCode = await QRCode.toDataURL(paymentUri);

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + validatedData.expirationHours);

    const payment = await prisma.cryptoPayment.create({
      data: {
        organizationId: user.organization.id,
        walletId: validatedData.walletId,
        customerId: validatedData.customerId,
        invoiceId: validatedData.invoiceId,
        amount: cryptoAmount,
        currency: validatedData.currency,
        usdAmount: validatedData.usdAmount,
        exchangeRate,
        paymentAddress,
        qrCode,
        expiresAt,
      },
      include: {
        wallet: {
          select: { id: true, currency: true, address: true, label: true },
        },
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        invoice: {
          select: { id: true, invoiceNumber: true, total: true },
        },
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Error creating crypto payment:', error);
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

// Webhook endpoint for crypto payment confirmations
export async function PATCH(request: NextRequest) {
  try {
    // This would be called by blockchain monitoring services or payment processors
    const body = await request.json();
    const { paymentId, txHash, confirmations, status } = body;

    // Verify webhook signature (implementation depends on provider)
    // const isValid = verifyWebhookSignature(request);
    // if (!isValid) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    const payment = await prisma.cryptoPayment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Update payment status
    const updatedPayment = await prisma.cryptoPayment.update({
      where: { id: paymentId },
      data: {
        status: status || 'PAID',
        txHash,
        confirmations: confirmations || 1,
        paidAt: status === 'PAID' ? new Date() : payment.paidAt,
      },
    });

    // Create transaction record
    if (txHash && !payment.txHash) {
      await prisma.cryptoTransaction.create({
        data: {
          organizationId: payment.organizationId,
          walletId: payment.walletId,
          txHash,
          amount: payment.amount,
          currency: payment.currency,
          fromAddress: 'unknown', // Would be provided by webhook
          toAddress: payment.paymentAddress,
          status: confirmations >= 1 ? 'CONFIRMED' : 'PENDING',
          confirmations: confirmations || 0,
          usdValue: payment.usdAmount,
          exchangeRate: payment.exchangeRate,
        },
      });
    }

    return NextResponse.json({ 
      success: true, 
      payment: updatedPayment,
    });
  } catch (error) {
    console.error('Error processing crypto payment webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getCryptoExchangeRate(currency: string): Promise<number | null> {
  try {
    // This would integrate with a real crypto price API like CoinGecko or CoinMarketCap
    // For demo purposes, return mock rates
    const mockRates: Record<string, number> = {
      BITCOIN: 45000,
      ETHEREUM: 3000,
      LITECOIN: 100,
      RIPPLE: 0.6,
      CARDANO: 0.5,
      POLKADOT: 8,
      CHAINLINK: 15,
      STELLAR: 0.1,
      DOGECOIN: 0.08,
      USDC: 1,
      USDT: 1,
      DAI: 1,
    };

    return mockRates[currency] || null;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    return null;
  }
}

function createPaymentUri(currency: string, address: string, amount: string): string {
  const currencyMap: Record<string, string> = {
    BITCOIN: 'bitcoin',
    ETHEREUM: 'ethereum',
    LITECOIN: 'litecoin',
    DOGECOIN: 'dogecoin',
  };

  const scheme = currencyMap[currency] || currency.toLowerCase();
  return `${scheme}:${address}?amount=${amount}`;
}
