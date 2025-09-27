import { prisma } from './prisma';
import { realtimeEvents } from './websocket';

export interface AnalyticsData {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  appointments: {
    total: number;
    thisMonth: number;
    completed: number;
    cancelled: number;
    completionRate: number;
  };
  customers: {
    total: number;
    active: number;
    new: number;
    retention: number;
  };
  performance: {
    averageJobValue: number;
    averageResponseTime: number;
    customerSatisfaction: number;
    efficiency: number;
  };
  trends: {
    revenueByMonth: Array<{ month: string; revenue: number }>;
    appointmentsByMonth: Array<{ month: string; appointments: number }>;
    customersBySource: Array<{ source: string; count: number }>;
    servicesByType: Array<{ type: string; count: number; revenue: number }>;
  };
}

export async function calculateAnalytics(organizationId: string): Promise<AnalyticsData> {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  // Revenue calculations
  const [totalRevenue, thisMonthRevenue, lastMonthRevenue] = await Promise.all([
    prisma.invoice.aggregate({
      where: {
        organizationId,
        status: 'PAID'
      },
      _sum: { total: true }
    }),
    prisma.invoice.aggregate({
      where: {
        organizationId,
        status: 'PAID',
        paidDate: { gte: thisMonthStart }
      },
      _sum: { total: true }
    }),
    prisma.invoice.aggregate({
      where: {
        organizationId,
        status: 'PAID',
        paidDate: {
          gte: lastMonthStart,
          lt: thisMonthStart
        }
      },
      _sum: { total: true }
    })
  ]);

  const totalRev = totalRevenue._sum.total || 0;
  const thisMonthRev = thisMonthRevenue._sum.total || 0;
  const lastMonthRev = lastMonthRevenue._sum.total || 0;
  const revenueGrowth = lastMonthRev > 0 ? ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100 : 0;

  // Appointment calculations
  const [totalAppointments, thisMonthAppointments, completedAppointments, cancelledAppointments] = await Promise.all([
    prisma.appointment.count({
      where: { organizationId }
    }),
    prisma.appointment.count({
      where: {
        organizationId,
        createdAt: { gte: thisMonthStart }
      }
    }),
    prisma.appointment.count({
      where: {
        organizationId,
        status: 'COMPLETED'
      }
    }),
    prisma.appointment.count({
      where: {
        organizationId,
        status: 'CANCELLED'
      }
    })
  ]);

  const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;

  // Customer calculations
  const [totalCustomers, activeCustomers, newCustomers] = await Promise.all([
    prisma.customer.count({
      where: { organizationId }
    }),
    prisma.customer.count({
      where: {
        organizationId,
        status: 'ACTIVE'
      }
    }),
    prisma.customer.count({
      where: {
        organizationId,
        createdAt: { gte: thisMonthStart }
      }
    })
  ]);

  // Calculate customer retention (customers with repeat appointments)
  const customersWithMultipleAppointments = await prisma.customer.count({
    where: {
      organizationId,
      appointments: {
        some: {}
      }
    }
  });

  const retention = totalCustomers > 0 ? (customersWithMultipleAppointments / totalCustomers) * 100 : 0;

  // Performance metrics
  const averageJobValue = totalAppointments > 0 ? totalRev / totalAppointments : 0;

  // Get revenue by month for the last 12 months
  const revenueByMonth = await prisma.$queryRaw`
    SELECT 
      TO_CHAR(paid_date, 'YYYY-MM') as month,
      SUM(total) as revenue
    FROM invoices 
    WHERE organization_id = ${organizationId}
      AND status = 'PAID'
      AND paid_date >= ${new Date(now.getFullYear() - 1, now.getMonth(), 1)}
    GROUP BY TO_CHAR(paid_date, 'YYYY-MM')
    ORDER BY month
  ` as Array<{ month: string; revenue: number }>;

  // Get appointments by month
  const appointmentsByMonth = await prisma.$queryRaw`
    SELECT 
      TO_CHAR(created_at, 'YYYY-MM') as month,
      COUNT(*) as appointments
    FROM appointments 
    WHERE organization_id = ${organizationId}
      AND created_at >= ${new Date(now.getFullYear() - 1, now.getMonth(), 1)}
    GROUP BY TO_CHAR(created_at, 'YYYY-MM')
    ORDER BY month
  ` as Array<{ month: string; appointments: number }>;

  // Get customers by source
  const customersBySource = await prisma.customer.groupBy({
    by: ['source'],
    where: { organizationId },
    _count: { _all: true }
  });

  // Get services by type
  const servicesByType = await prisma.appointment.groupBy({
    by: ['type'],
    where: { organizationId },
    _count: { _all: true },
    _sum: { price: true }
  });

  return {
    revenue: {
      total: totalRev,
      thisMonth: thisMonthRev,
      lastMonth: lastMonthRev,
      growth: revenueGrowth
    },
    appointments: {
      total: totalAppointments,
      thisMonth: thisMonthAppointments,
      completed: completedAppointments,
      cancelled: cancelledAppointments,
      completionRate
    },
    customers: {
      total: totalCustomers,
      active: activeCustomers,
      new: newCustomers,
      retention
    },
    performance: {
      averageJobValue,
      averageResponseTime: 2.5, // Mock data - would calculate from actual response times
      customerSatisfaction: 4.8, // Mock data - would calculate from reviews
      efficiency: 85 // Mock data - would calculate from completion times vs estimates
    },
    trends: {
      revenueByMonth: revenueByMonth.map(r => ({
        month: r.month,
        revenue: Number(r.revenue)
      })),
      appointmentsByMonth: appointmentsByMonth.map(a => ({
        month: a.month,
        appointments: Number(a.appointments)
      })),
      customersBySource: customersBySource.map(c => ({
        source: c.source || 'Unknown',
        count: c._count._all
      })),
      servicesByType: servicesByType.map(s => ({
        type: s.type || 'General',
        count: s._count._all,
        revenue: Number(s._sum.price || 0)
      }))
    }
  };
}

export async function trackEvent(
  organizationId: string,
  event: string,
  properties: Record<string, any> = {}
) {
  try {
    // Store analytics event
    await prisma.analyticsEvent.create({
      data: {
        organizationId,
        event,
        properties,
        timestamp: new Date()
      }
    });

    // Emit real-time update if significant event
    if (['appointment_completed', 'invoice_paid', 'customer_created'].includes(event)) {
      const analytics = await calculateAnalytics(organizationId);
      realtimeEvents.analyticsUpdate(organizationId, analytics);
    }
  } catch (error) {
    console.error('Failed to track analytics event:', error);
  }
}

export async function generateReport(
  organizationId: string,
  type: 'revenue' | 'appointments' | 'customers' | 'performance',
  startDate: Date,
  endDate: Date
) {
  const where = {
    organizationId,
    createdAt: {
      gte: startDate,
      lte: endDate
    }
  };

  switch (type) {
    case 'revenue':
      return await prisma.invoice.findMany({
        where: {
          ...where,
          status: 'PAID',
          paidDate: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          customer: true,
          appointment: true
        },
        orderBy: { paidDate: 'desc' }
      });

    case 'appointments':
      return await prisma.appointment.findMany({
        where,
        include: {
          customer: true,
          assignedUser: true,
          invoice: true
        },
        orderBy: { startTime: 'desc' }
      });

    case 'customers':
      return await prisma.customer.findMany({
        where,
        include: {
          appointments: true,
          invoices: true,
          messages: true
        },
        orderBy: { createdAt: 'desc' }
      });

    case 'performance':
      const appointments = await prisma.appointment.findMany({
        where: {
          ...where,
          status: 'COMPLETED'
        },
        include: {
          customer: true,
          assignedUser: true,
          invoice: true
        }
      });

      return {
        totalJobs: appointments.length,
        averageJobValue: appointments.reduce((sum, apt) => sum + (apt.price || 0), 0) / appointments.length,
        completionRate: appointments.length / await prisma.appointment.count({ where }) * 100,
        appointments
      };

    default:
      throw new Error('Invalid report type');
  }
}
