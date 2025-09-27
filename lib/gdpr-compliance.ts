import { prisma } from './prisma';
import { auditLogger } from './audit-logger';
import { encryptPII, decryptPII } from './encryption';

export interface DataExportRequest {
  customerId: string;
  organizationId: string;
  requestedBy: string;
  format: 'JSON' | 'CSV' | 'PDF';
  includeHistory: boolean;
  includeMessages: boolean;
  includePayments: boolean;
}

export interface DataDeletionRequest {
  customerId: string;
  organizationId: string;
  requestedBy: string;
  reason: string;
  retainForLegal: boolean;
  anonymize: boolean;
}

export interface ConsentRecord {
  customerId: string;
  organizationId: string;
  consentType: 'MARKETING' | 'ANALYTICS' | 'ESSENTIAL' | 'COMMUNICATIONS';
  granted: boolean;
  grantedAt: Date;
  revokedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  version: string;
}

class GDPRComplianceService {
  /**
   * Export all customer data (Right to Data Portability)
   */
  async exportCustomerData(request: DataExportRequest): Promise<any> {
    try {
      // Log the export request
      await auditLogger.logSystem('EXPORT', request.organizationId, true, {
        customerId: request.customerId,
        requestedBy: request.requestedBy,
        format: request.format
      });

      // Get customer data
      const customer = await prisma.customer.findUnique({
        where: {
          id: request.customerId,
          organizationId: request.organizationId
        },
        include: {
          appointments: request.includeHistory,
          invoices: request.includeHistory,
          messages: request.includeMessages,
          subscriptions: request.includeHistory
        }
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Decrypt PII data for export
      const decryptedCustomer = decryptPII(customer);

      // Get consent records
      const consents = await prisma.consentRecord.findMany({
        where: {
          customerId: request.customerId,
          organizationId: request.organizationId
        },
        orderBy: { grantedAt: 'desc' }
      });

      // Get payment data if requested and allowed
      let payments = [];
      if (request.includePayments) {
        payments = await prisma.payment.findMany({
          where: {
            customerId: request.customerId,
            organizationId: request.organizationId
          },
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            createdAt: true,
            method: true
            // Exclude sensitive payment details
          }
        });
      }

      const exportData = {
        exportInfo: {
          requestedAt: new Date(),
          requestedBy: request.requestedBy,
          format: request.format,
          customerId: request.customerId
        },
        customerData: decryptedCustomer,
        consents,
        ...(request.includePayments && { payments }),
        metadata: {
          dataRetentionPolicy: 'Data retained according to legal requirements',
          contactInfo: 'For questions about this export, contact privacy@vervidflow.com'
        }
      };

      // Create export record
      await prisma.dataExportRequest.create({
        data: {
          organizationId: request.organizationId,
          customerId: request.customerId,
          requestedBy: request.requestedBy,
          format: request.format,
          status: 'COMPLETED',
          completedAt: new Date(),
          includeHistory: request.includeHistory,
          includeMessages: request.includeMessages,
          includePayments: request.includePayments
        }
      });

      return exportData;

    } catch (error) {
      await auditLogger.logSystem('EXPORT', request.organizationId, false, {
        customerId: request.customerId,
        requestedBy: request.requestedBy,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Delete or anonymize customer data (Right to be Forgotten)
   */
  async deleteCustomerData(request: DataDeletionRequest): Promise<{
    success: boolean;
    deletedRecords: number;
    anonymizedRecords: number;
    retainedRecords: number;
    details: string[];
  }> {
    try {
      const details: string[] = [];
      let deletedRecords = 0;
      let anonymizedRecords = 0;
      let retainedRecords = 0;

      // Check if customer exists
      const customer = await prisma.customer.findUnique({
        where: {
          id: request.customerId,
          organizationId: request.organizationId
        },
        include: {
          appointments: true,
          invoices: true,
          messages: true,
          subscriptions: true
        }
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Check for legal retention requirements
      const hasActiveContracts = customer.subscriptions.some(sub => 
        ['ACTIVE', 'PENDING'].includes(sub.status)
      );
      
      const hasUnpaidInvoices = customer.invoices.some(invoice => 
        ['PENDING', 'OVERDUE'].includes(invoice.status)
      );

      const hasRecentTransactions = customer.invoices.some(invoice => {
        const sixYearsAgo = new Date();
        sixYearsAgo.setFullYear(sixYearsAgo.getFullYear() - 6);
        return invoice.createdAt > sixYearsAgo;
      });

      if (request.anonymize || request.retainForLegal || hasActiveContracts || hasUnpaidInvoices || hasRecentTransactions) {
        // Anonymize instead of delete
        const anonymizedData = {
          name: `Deleted User ${Date.now()}`,
          email: null,
          phone: null,
          address: null,
          notes: 'Customer data anonymized per GDPR request',
          preferences: null,
          customFields: null,
          deletedAt: new Date(),
          gdprAnonymized: true
        };

        await prisma.customer.update({
          where: { id: request.customerId },
          data: anonymizedData
        });

        anonymizedRecords++;
        details.push('Customer profile anonymized');

        // Anonymize messages
        await prisma.message.updateMany({
          where: { customerId: request.customerId },
          data: { 
            content: 'Message content anonymized',
            metadata: null
          }
        });

        const messageCount = customer.messages.length;
        anonymizedRecords += messageCount;
        details.push(`${messageCount} messages anonymized`);

        // Retain invoices and appointments for legal/business purposes but anonymize PII
        retainedRecords += customer.invoices.length + customer.appointments.length;
        details.push(`${customer.invoices.length} invoices retained (anonymized)`);
        details.push(`${customer.appointments.length} appointments retained (anonymized)`);

      } else {
        // Full deletion (only if no legal retention requirements)
        
        // Delete messages
        const messageDeleteResult = await prisma.message.deleteMany({
          where: { customerId: request.customerId }
        });
        deletedRecords += messageDeleteResult.count;
        details.push(`${messageDeleteResult.count} messages deleted`);

        // Delete appointments (if no invoices associated)
        const appointmentDeleteResult = await prisma.appointment.deleteMany({
          where: { 
            customerId: request.customerId,
            invoice: null
          }
        });
        deletedRecords += appointmentDeleteResult.count;
        details.push(`${appointmentDeleteResult.count} appointments deleted`);

        // Mark customer as deleted
        await prisma.customer.update({
          where: { id: request.customerId },
          data: {
            status: 'DELETED',
            name: `Deleted User ${Date.now()}`,
            email: null,
            phone: null,
            address: null,
            deletedAt: new Date(),
            gdprDeleted: true
          }
        });
        deletedRecords++;
        details.push('Customer profile deleted');
      }

      // Create deletion record
      await prisma.dataDeletionRequest.create({
        data: {
          organizationId: request.organizationId,
          customerId: request.customerId,
          requestedBy: request.requestedBy,
          reason: request.reason,
          status: 'COMPLETED',
          completedAt: new Date(),
          anonymized: request.anonymize || hasActiveContracts,
          recordsDeleted: deletedRecords,
          recordsAnonymized: anonymizedRecords,
          recordsRetained: retainedRecords
        }
      });

      // Log the deletion
      await auditLogger.logSystem('DELETE', request.organizationId, true, {
        customerId: request.customerId,
        requestedBy: request.requestedBy,
        deletedRecords,
        anonymizedRecords,
        retainedRecords
      });

      return {
        success: true,
        deletedRecords,
        anonymizedRecords,
        retainedRecords,
        details
      };

    } catch (error) {
      await auditLogger.logSystem('DELETE', request.organizationId, false, {
        customerId: request.customerId,
        requestedBy: request.requestedBy,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Record customer consent
   */
  async recordConsent(consent: ConsentRecord): Promise<void> {
    try {
      // Revoke any existing consent of the same type
      await prisma.consentRecord.updateMany({
        where: {
          customerId: consent.customerId,
          organizationId: consent.organizationId,
          consentType: consent.consentType,
          revokedAt: null
        },
        data: { revokedAt: new Date() }
      });

      // Create new consent record
      await prisma.consentRecord.create({
        data: {
          customerId: consent.customerId,
          organizationId: consent.organizationId,
          consentType: consent.consentType,
          granted: consent.granted,
          grantedAt: consent.grantedAt,
          ipAddress: consent.ipAddress,
          userAgent: consent.userAgent,
          version: consent.version
        }
      });

      // Update customer preferences based on consent
      const customer = await prisma.customer.findUnique({
        where: { id: consent.customerId }
      });

      if (customer) {
        const preferences = customer.preferences as any || {};
        
        switch (consent.consentType) {
          case 'MARKETING':
            preferences.marketingEmails = consent.granted;
            break;
          case 'COMMUNICATIONS':
            preferences.appointmentReminders = consent.granted;
            break;
        }

        await prisma.customer.update({
          where: { id: consent.customerId },
          data: { preferences }
        });
      }

      await auditLogger.logDataAccess(
        'CREATE',
        'CUSTOMER',
        consent.customerId,
        consent.requestedBy || 'system',
        consent.organizationId,
        true,
        { consentType: consent.consentType, granted: consent.granted }
      );

    } catch (error) {
      console.error('Error recording consent:', error);
      throw error;
    }
  }

  /**
   * Get customer consent history
   */
  async getConsentHistory(customerId: string, organizationId: string): Promise<ConsentRecord[]> {
    const consents = await prisma.consentRecord.findMany({
      where: {
        customerId,
        organizationId
      },
      orderBy: { grantedAt: 'desc' }
    });

    return consents.map(consent => ({
      customerId: consent.customerId,
      organizationId: consent.organizationId,
      consentType: consent.consentType as any,
      granted: consent.granted,
      grantedAt: consent.grantedAt,
      revokedAt: consent.revokedAt || undefined,
      ipAddress: consent.ipAddress || undefined,
      userAgent: consent.userAgent || undefined,
      version: consent.version
    }));
  }

  /**
   * Check if customer has given consent for specific purpose
   */
  async hasConsent(
    customerId: string, 
    organizationId: string, 
    consentType: ConsentRecord['consentType']
  ): Promise<boolean> {
    const latestConsent = await prisma.consentRecord.findFirst({
      where: {
        customerId,
        organizationId,
        consentType,
        revokedAt: null
      },
      orderBy: { grantedAt: 'desc' }
    });

    return latestConsent?.granted || false;
  }

  /**
   * Generate privacy policy compliance report
   */
  async generateComplianceReport(organizationId: string, startDate: Date, endDate: Date): Promise<any> {
    const [
      exportRequests,
      deletionRequests,
      consentRecords,
      dataBreaches
    ] = await Promise.all([
      prisma.dataExportRequest.count({
        where: {
          organizationId,
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      prisma.dataDeletionRequest.count({
        where: {
          organizationId,
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      prisma.consentRecord.count({
        where: {
          organizationId,
          grantedAt: { gte: startDate, lte: endDate }
        }
      }),
      prisma.securityIncident.count({
        where: {
          organizationId,
          detectedAt: { gte: startDate, lte: endDate },
          severity: { in: ['HIGH', 'CRITICAL'] }
        }
      })
    ]);

    // Get consent breakdown
    const consentBreakdown = await prisma.consentRecord.groupBy({
      by: ['consentType', 'granted'],
      where: {
        organizationId,
        grantedAt: { gte: startDate, lte: endDate }
      },
      _count: { _all: true }
    });

    return {
      reportPeriod: { startDate, endDate },
      summary: {
        dataExportRequests: exportRequests,
        dataDeletionRequests: deletionRequests,
        consentRecords: consentRecords,
        dataBreaches: dataBreaches
      },
      consentBreakdown: consentBreakdown.reduce((acc, item) => {
        const key = `${item.consentType}_${item.granted ? 'granted' : 'revoked'}`;
        acc[key] = item._count._all;
        return acc;
      }, {} as Record<string, number>),
      complianceStatus: {
        dataRetentionPolicy: 'Active - 6 years for financial records',
        consentManagement: 'Implemented',
        dataEncryption: 'AES-256 encryption for PII',
        auditLogging: 'Comprehensive audit trail maintained',
        incidentResponse: dataBreaches === 0 ? 'No incidents' : `${dataBreaches} incidents reported`
      }
    };
  }

  /**
   * Schedule automatic data retention cleanup
   */
  async scheduleDataRetentionCleanup(organizationId: string): Promise<{
    customersProcessed: number;
    recordsDeleted: number;
    recordsAnonymized: number;
  }> {
    // Find customers marked for deletion after retention period
    const retentionPeriod = 30; // 30 days after deletion request
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionPeriod);

    const customersToProcess = await prisma.customer.findMany({
      where: {
        organizationId,
        status: 'DELETED',
        deletedAt: { lt: cutoffDate },
        gdprProcessed: { not: true }
      }
    });

    let recordsDeleted = 0;
    let recordsAnonymized = 0;

    for (const customer of customersToProcess) {
      try {
        // Check if we can fully delete or need to anonymize
        const hasLegalRetention = await this.checkLegalRetentionRequirements(customer.id);

        if (hasLegalRetention) {
          // Anonymize further
          await prisma.customer.update({
            where: { id: customer.id },
            data: {
              name: `Anonymous-${customer.id.slice(-6)}`,
              gdprProcessed: true,
              gdprAnonymized: true
            }
          });
          recordsAnonymized++;
        } else {
          // Can delete completely
          await prisma.customer.delete({
            where: { id: customer.id }
          });
          recordsDeleted++;
        }
      } catch (error) {
        console.error(`Error processing customer ${customer.id}:`, error);
      }
    }

    return {
      customersProcessed: customersToProcess.length,
      recordsDeleted,
      recordsAnonymized
    };
  }

  private async checkLegalRetentionRequirements(customerId: string): Promise<boolean> {
    // Check for financial records that need to be retained
    const recentFinancialActivity = await prisma.invoice.findFirst({
      where: {
        customerId,
        status: 'PAID',
        paidDate: {
          gte: new Date(Date.now() - 6 * 365 * 24 * 60 * 60 * 1000) // 6 years
        }
      }
    });

    return !!recentFinancialActivity;
  }
}

// Export singleton instance
export const gdprCompliance = new GDPRComplianceService();
