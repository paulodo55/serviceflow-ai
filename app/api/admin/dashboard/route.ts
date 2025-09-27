import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Only admins can access admin dashboard
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '30d'; // 7d, 30d, 90d, 1y

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    switch (timeframe) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default: // 30d
        startDate.setDate(now.getDate() - 30);
    }

    // Fetch comprehensive dashboard data
    const [
      // Core metrics
      totalUsers,
      totalCustomers,
      totalAppointments,
      totalInvoices,
      totalRevenue,
      
      // Recent activity
      recentUsers,
      recentCustomers,
      recentAppointments,
      recentInvoices,
      
      // CRM metrics
      totalSubscriptions,
      activeSubscriptions,
      expiringSubscriptions,
      totalContracts,
      signedContracts,
      
      // Communication metrics
      totalMessages,
      socialMessages,
      totalVoicemails,
      unreadVoicemails,
      
      // Training & Support
      totalTrainingSessions,
      activeTrainingSessions,
      
      // Banking & Crypto
      totalBankAccounts,
      activeBankAccounts,
      totalCryptoWallets,
      totalCryptoPayments,
      
      // Privacy & Data
      totalDataExports,
      pendingDataExports,
      totalPrivacySettings,
      
      // System health
      totalLanguages,
      totalTranslations,
      totalIntegrationAccess,
      
    ] = await Promise.all([
      // Core metrics
      prisma.user.count({ where: { organizationId: organization.id } }),
      prisma.customer.count({ where: { organizationId: organization.id } }),
      prisma.appointment.count({ where: { organizationId: organization.id } }),
      prisma.invoice.count({ where: { organizationId: organization.id } }),
      prisma.invoice.aggregate({
        where: { 
          organizationId: organization.id,
          status: 'PAID',
        },
        _sum: { total: true },
      }),
      
      // Recent activity (last 7 days)
      prisma.user.count({
        where: {
          organizationId: organization.id,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.customer.count({
        where: {
          organizationId: organization.id,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.appointment.count({
        where: {
          organizationId: organization.id,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.invoice.count({
        where: {
          organizationId: organization.id,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      
      // CRM metrics
      prisma.subscription.count({ where: { organizationId: organization.id } }),
      prisma.subscription.count({
        where: {
          organizationId: organization.id,
          status: 'ACTIVE',
        },
      }),
      prisma.subscription.count({
        where: {
          organizationId: organization.id,
          status: 'ACTIVE',
          endDate: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
          },
        },
      }),
      prisma.contract.count({ where: { organizationId: organization.id } }),
      prisma.contract.count({
        where: {
          organizationId: organization.id,
          status: 'SIGNED',
        },
      }),
      
      // Communication metrics
      prisma.message.count({ where: { organizationId: organization.id } }),
      prisma.socialMessage.count({ where: { organizationId: organization.id } }),
      prisma.voicemail.count({ where: { organizationId: organization.id } }),
      prisma.voicemail.count({
        where: {
          organizationId: organization.id,
          isRead: false,
        },
      }),
      
      // Training & Support
      prisma.trainingSession.count({ where: { organizationId: organization.id } }),
      prisma.trainingSession.count({
        where: {
          organizationId: organization.id,
          status: 'IN_PROGRESS',
        },
      }),
      
      // Banking & Crypto
      prisma.bankAccount.count({ where: { organizationId: organization.id } }),
      prisma.bankAccount.count({
        where: {
          organizationId: organization.id,
          isActive: true,
        },
      }),
      prisma.cryptoWallet.count({ where: { organizationId: organization.id } }),
      prisma.cryptoPayment.count({ where: { organizationId: organization.id } }),
      
      // Privacy & Data
      prisma.dataExportRequest.count({ where: { organizationId: organization.id } }),
      prisma.dataExportRequest.count({
        where: {
          organizationId: organization.id,
          status: 'PENDING',
        },
      }),
      prisma.privacySetting.count({ where: { organizationId: organization.id } }),
      
      // System health
      prisma.language.count({ where: { isActive: true } }),
      prisma.translation.count(),
      prisma.integrationAccess.count({ where: { organizationId: organization.id } }),
    ]);

    // Calculate growth rates
    const calculateGrowthRate = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    // Get monthly revenue trend
    const revenueByMonth = await prisma.invoice.groupBy({
      by: ['createdAt'],
      where: {
        organizationId: organization.id,
        status: 'PAID',
        createdAt: { gte: startDate },
      },
      _sum: { total: true },
      orderBy: { createdAt: 'asc' },
    });

    // Get appointment status distribution
    const appointmentsByStatus = await prisma.appointment.groupBy({
      by: ['status'],
      where: {
        organizationId: organization.id,
        createdAt: { gte: startDate },
      },
      _count: { status: true },
    });

    // Get top customers by revenue
    const topCustomers = await prisma.customer.findMany({
      where: { organizationId: organization.id },
      select: {
        id: true,
        name: true,
        email: true,
        lifetimeValue: true,
        appointmentCount: true,
      },
      orderBy: { lifetimeValue: 'desc' },
      take: 10,
    });

    // System health metrics
    const systemHealth = {
      activeIntegrations: await prisma.integrationAccess.count({
        where: {
          organizationId: organization.id,
          isActive: true,
        },
      }),
      failedExports: await prisma.dataExportRequest.count({
        where: {
          organizationId: organization.id,
          status: 'FAILED',
        },
      }),
      pendingAlerts: await prisma.subscriptionAlert.count({
        where: {
          subscription: { organizationId: organization.id },
          status: 'PENDING',
        },
      }),
    };

    const dashboardData = {
      overview: {
        totalUsers,
        totalCustomers,
        totalAppointments,
        totalInvoices,
        totalRevenue: totalRevenue._sum.total || 0,
        recentActivity: {
          newUsers: recentUsers,
          newCustomers: recentCustomers,
          newAppointments: recentAppointments,
          newInvoices: recentInvoices,
        },
      },
      
      crm: {
        subscriptions: {
          total: totalSubscriptions,
          active: activeSubscriptions,
          expiring: expiringSubscriptions,
        },
        contracts: {
          total: totalContracts,
          signed: signedContracts,
        },
      },
      
      communications: {
        messages: {
          total: totalMessages,
          social: socialMessages,
        },
        voicemails: {
          total: totalVoicemails,
          unread: unreadVoicemails,
        },
      },
      
      training: {
        sessions: {
          total: totalTrainingSessions,
          active: activeTrainingSessions,
        },
      },
      
      financial: {
        banking: {
          accounts: totalBankAccounts,
          active: activeBankAccounts,
        },
        crypto: {
          wallets: totalCryptoWallets,
          payments: totalCryptoPayments,
        },
      },
      
      privacy: {
        exports: {
          total: totalDataExports,
          pending: pendingDataExports,
        },
        settings: totalPrivacySettings,
      },
      
      system: {
        languages: totalLanguages,
        translations: totalTranslations,
        integrations: totalIntegrationAccess,
        health: systemHealth,
      },
      
      analytics: {
        revenueByMonth,
        appointmentsByStatus,
        topCustomers,
      },
      
      metadata: {
        timeframe,
        generatedAt: new Date().toISOString(),
        organizationId: organization.id,
        organizationName: organization.name,
      },
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
