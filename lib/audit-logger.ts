import { prisma } from './prisma';
import { maskSensitiveData } from './encryption';

export interface AuditLogEntry {
  userId?: string;
  organizationId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  error?: string;
  metadata?: any;
}

export type AuditAction = 
  | 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'
  | 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'PASSWORD_RESET'
  | 'EXPORT' | 'IMPORT' | 'BACKUP' | 'RESTORE'
  | 'PERMISSION_GRANT' | 'PERMISSION_REVOKE'
  | 'API_ACCESS' | 'WEBHOOK_RECEIVED'
  | 'PAYMENT_PROCESSED' | 'SUBSCRIPTION_CHANGED'
  | 'EMAIL_SENT' | 'SMS_SENT'
  | 'APPOINTMENT_SCHEDULED' | 'APPOINTMENT_COMPLETED'
  | 'INVOICE_GENERATED' | 'INVOICE_PAID';

export type AuditResource =
  | 'USER' | 'CUSTOMER' | 'APPOINTMENT' | 'INVOICE' | 'MESSAGE'
  | 'ORGANIZATION' | 'SUBSCRIPTION' | 'CONTRACT'
  | 'PAYMENT' | 'INTEGRATION' | 'SETTINGS'
  | 'AUTH' | 'API' | 'SYSTEM';

class AuditLogger {
  /**
   * Log an audit event
   */
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      // Mask sensitive data in details
      const maskedDetails = entry.details ? maskSensitiveData(entry.details) : null;
      const maskedMetadata = entry.metadata ? maskSensitiveData(entry.metadata) : null;

      // TODO: Add AuditLog model to schema
      // await prisma.auditLog.create({
        data: {
          userId: entry.userId,
          organizationId: entry.organizationId,
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId,
          details: maskedDetails,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          success: entry.success,
          error: entry.error,
          metadata: maskedMetadata,
          timestamp: new Date()
        }
      });

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Audit Log:', {
          action: entry.action,
          resource: entry.resource,
          success: entry.success,
          userId: entry.userId,
          organizationId: entry.organizationId
        });
      }

    } catch (error) {
      // Don't throw errors from audit logging to avoid disrupting main flow
      console.error('Failed to write audit log:', error);
    }
  }

  /**
   * Log authentication events
   */
  async logAuth(
    action: 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'PASSWORD_RESET' | 'EMAIL_VERIFICATION',
    userId: string,
    organizationId: string,
    success: boolean,
    details?: any,
    ipAddress?: string,
    userAgent?: string,
    error?: string
  ): Promise<void> {
    await this.log({
      userId,
      organizationId,
      action,
      resource: 'AUTH',
      success,
      details,
      ipAddress,
      userAgent,
      error
    });
  }

  /**
   * Log data access events
   */
  async logDataAccess(
    action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE',
    resource: AuditResource,
    resourceId: string,
    userId: string,
    organizationId: string,
    success: boolean,
    details?: any,
    error?: string
  ): Promise<void> {
    await this.log({
      userId,
      organizationId,
      action,
      resource,
      resourceId,
      success,
      details,
      error
    });
  }

  /**
   * Log permission changes
   */
  async logPermissionChange(
    action: 'PERMISSION_GRANT' | 'PERMISSION_REVOKE',
    targetUserId: string,
    permission: string,
    grantedBy: string,
    organizationId: string,
    success: boolean,
    details?: any
  ): Promise<void> {
    await this.log({
      userId: grantedBy,
      organizationId,
      action,
      resource: 'USER',
      resourceId: targetUserId,
      success,
      details: {
        permission,
        targetUserId,
        ...details
      }
    });
  }

  /**
   * Log API access
   */
  async logApiAccess(
    endpoint: string,
    method: string,
    userId: string | undefined,
    organizationId: string,
    success: boolean,
    responseStatus: number,
    ipAddress?: string,
    userAgent?: string,
    error?: string
  ): Promise<void> {
    await this.log({
      userId,
      organizationId,
      action: 'API_ACCESS',
      resource: 'API',
      success,
      details: {
        endpoint,
        method,
        responseStatus
      },
      ipAddress,
      userAgent,
      error
    });
  }

  /**
   * Log payment events
   */
  async logPayment(
    action: 'PAYMENT_PROCESSED' | 'PAYMENT_FAILED' | 'REFUND_PROCESSED',
    paymentId: string,
    customerId: string,
    organizationId: string,
    amount: number,
    currency: string,
    success: boolean,
    details?: any,
    error?: string
  ): Promise<void> {
    await this.log({
      organizationId,
      action,
      resource: 'PAYMENT',
      resourceId: paymentId,
      success,
      details: {
        customerId,
        amount,
        currency,
        ...details
      },
      error
    });
  }

  /**
   * Log communication events
   */
  async logCommunication(
    action: 'EMAIL_SENT' | 'SMS_SENT' | 'WEBHOOK_RECEIVED',
    customerId: string | undefined,
    organizationId: string,
    success: boolean,
    details?: any,
    error?: string
  ): Promise<void> {
    await this.log({
      organizationId,
      action,
      resource: 'MESSAGE',
      resourceId: customerId,
      success,
      details,
      error
    });
  }

  /**
   * Log system events
   */
  async logSystem(
    action: 'BACKUP' | 'RESTORE' | 'EXPORT' | 'IMPORT' | 'MAINTENANCE',
    organizationId: string,
    success: boolean,
    details?: any,
    error?: string
  ): Promise<void> {
    await this.log({
      organizationId,
      action,
      resource: 'SYSTEM',
      success,
      details,
      error
    });
  }

  /**
   * Get audit logs with filtering
   */
  async getLogs(
    organizationId: string,
    filters: {
      userId?: string;
      action?: string;
      resource?: string;
      startDate?: Date;
      endDate?: Date;
      success?: boolean;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    const where: any = { organizationId };

    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.resource) where.resource = filters.resource;
    if (filters.success !== undefined) where.success = filters.success;
    
    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = filters.startDate;
      if (filters.endDate) where.timestamp.lte = filters.endDate;
    }

    const [logs, total] = await Promise.all([
      // prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: filters.limit || 100,
        skip: filters.offset || 0,
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      }),
      prisma.auditLog.count({ where })
    ]);

    return { logs, total };
  }

  /**
   * Get audit statistics
   */
  async getStatistics(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ) {
    const stats = await prisma.auditLog.groupBy({
      by: ['action', 'resource', 'success'],
      where: {
        organizationId,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: { _all: true }
    });

    const summary = {
      totalEvents: 0,
      successfulEvents: 0,
      failedEvents: 0,
      byAction: {} as Record<string, number>,
      byResource: {} as Record<string, number>,
      byUser: {} as Record<string, number>
    };

    stats.forEach(stat => {
      const count = stat._count._all;
      summary.totalEvents += count;
      
      if (stat.success) {
        summary.successfulEvents += count;
      } else {
        summary.failedEvents += count;
      }
      
      summary.byAction[stat.action] = (summary.byAction[stat.action] || 0) + count;
      summary.byResource[stat.resource] = (summary.byResource[stat.resource] || 0) + count;
    });

    // Get user activity
    const userActivity = await prisma.auditLog.groupBy({
      by: ['userId'],
      where: {
        organizationId,
        timestamp: {
          gte: startDate,
          lte: endDate
        },
        userId: { not: null }
      },
      _count: { _all: true }
    });

    userActivity.forEach(activity => {
      if (activity.userId) {
        summary.byUser[activity.userId] = activity._count._all;
      }
    });

    return summary;
  }

  /**
   * Clean old audit logs (for compliance and storage management)
   */
  async cleanOldLogs(organizationId: string, retentionDays: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await prisma.auditLog.deleteMany({
      where: {
        organizationId,
        timestamp: { lt: cutoffDate }
      }
    });

    return result.count;
  }
}

// Export singleton instance
export const auditLogger = new AuditLogger();
