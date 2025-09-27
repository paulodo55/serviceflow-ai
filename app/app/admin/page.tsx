'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  Calendar,
  CreditCard,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  FileText,
  Banknote,
  Bitcoin,
  Shield,
  Globe,
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Database,
  Server,
  Zap,
} from 'lucide-react';
import { useDemo } from '@/lib/demo-context';

interface DashboardData {
  overview: {
    totalUsers: number;
    totalCustomers: number;
    totalAppointments: number;
    totalInvoices: number;
    totalRevenue: number;
    recentActivity: {
      newUsers: number;
      newCustomers: number;
      newAppointments: number;
      newInvoices: number;
    };
  };
  crm: {
    subscriptions: {
      total: number;
      active: number;
      expiring: number;
    };
    contracts: {
      total: number;
      signed: number;
    };
  };
  communications: {
    messages: {
      total: number;
      social: number;
    };
    voicemails: {
      total: number;
      unread: number;
    };
  };
  training: {
    sessions: {
      total: number;
      active: number;
    };
  };
  financial: {
    banking: {
      accounts: number;
      active: number;
    };
    crypto: {
      wallets: number;
      payments: number;
    };
  };
  privacy: {
    exports: {
      total: number;
      pending: number;
    };
    settings: number;
  };
  system: {
    languages: number;
    translations: number;
    integrations: number;
    health: {
      activeIntegrations: number;
      failedExports: number;
      pendingAlerts: number;
    };
  };
  analytics: {
    topCustomers: Array<{
      id: string;
      name: string;
      email: string;
      lifetimeValue: number;
      appointmentCount: number;
    }>;
  };
  metadata: {
    timeframe: string;
    generatedAt: string;
    organizationName: string;
  };
}

export default function AdminDashboard() {
  const { isDemoMode } = useDemo();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/dashboard?timeframe=${timeframe}`);
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    if (isDemoMode) {
      // Demo data
      setDashboardData({
        overview: {
          totalUsers: 25,
          totalCustomers: 342,
          totalAppointments: 1567,
          totalInvoices: 892,
          totalRevenue: 145670.50,
          recentActivity: {
            newUsers: 3,
            newCustomers: 18,
            newAppointments: 47,
            newInvoices: 23,
          },
        },
        crm: {
          subscriptions: {
            total: 89,
            active: 76,
            expiring: 8,
          },
          contracts: {
            total: 45,
            signed: 38,
          },
        },
        communications: {
          messages: {
            total: 2341,
            social: 567,
          },
          voicemails: {
            total: 134,
            unread: 7,
          },
        },
        training: {
          sessions: {
            total: 28,
            active: 3,
          },
        },
        financial: {
          banking: {
            accounts: 4,
            active: 3,
          },
          crypto: {
            wallets: 6,
            payments: 23,
          },
        },
        privacy: {
          exports: {
            total: 12,
            pending: 2,
          },
          settings: 156,
        },
        system: {
          languages: 20,
          translations: 1250,
          integrations: 15,
          health: {
            activeIntegrations: 12,
            failedExports: 1,
            pendingAlerts: 5,
          },
        },
        analytics: {
          topCustomers: [
            { id: '1', name: 'John Smith', email: 'john@example.com', lifetimeValue: 5670.50, appointmentCount: 23 },
            { id: '2', name: 'Sarah Wilson', email: 'sarah@example.com', lifetimeValue: 4320.75, appointmentCount: 18 },
            { id: '3', name: 'Mike Johnson', email: 'mike@example.com', lifetimeValue: 3890.25, appointmentCount: 15 },
          ],
        },
        metadata: {
          timeframe: '30d',
          generatedAt: new Date().toISOString(),
          organizationName: 'VervidFlow Demo',
        },
      });
      setLoading(false);
    } else {
      fetchDashboardData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getHealthStatus = (health: any) => {
    const issues = health.failedExports + health.pendingAlerts;
    if (issues === 0) return { status: 'Excellent', color: 'text-green-600', icon: CheckCircle };
    if (issues <= 3) return { status: 'Good', color: 'text-yellow-600', icon: AlertTriangle };
    return { status: 'Needs Attention', color: 'text-red-600', icon: AlertTriangle };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don&apos;t have permission to view the admin dashboard.</p>
        </div>
      </div>
    );
  }

  const healthStatus = getHealthStatus(dashboardData.system.health);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            System overview for {dashboardData.metadata.organizationName}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={fetchDashboardData}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
          <div className="flex items-center space-x-2">
            <healthStatus.icon className={`h-5 w-5 ${healthStatus.color}`} />
            <span className={`font-medium ${healthStatus.color}`}>{healthStatus.status}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{dashboardData.system.health.activeIntegrations}</div>
            <div className="text-sm text-gray-600">Active Integrations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{dashboardData.system.health.failedExports}</div>
            <div className="text-sm text-gray-600">Failed Exports</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{dashboardData.system.health.pendingAlerts}</div>
            <div className="text-sm text-gray-600">Pending Alerts</div>
          </div>
        </div>
      </div>

      {/* Core Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.totalUsers}</p>
              <p className="text-sm text-green-600">+{dashboardData.overview.recentActivity.newUsers} this week</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.totalCustomers}</p>
              <p className="text-sm text-green-600">+{dashboardData.overview.recentActivity.newCustomers} this week</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.overview.totalRevenue)}</p>
              <p className="text-sm text-green-600">+{dashboardData.overview.recentActivity.newInvoices} invoices this week</p>
            </div>
            <CreditCard className="h-8 w-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.totalAppointments}</p>
              <p className="text-sm text-green-600">+{dashboardData.overview.recentActivity.newAppointments} this week</p>
            </div>
            <Calendar className="h-8 w-8 text-indigo-500" />
          </div>
        </motion.div>
      </div>

      {/* Feature Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* CRM Module */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">CRM</h3>
            <RefreshCw className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Subscriptions</span>
              <div className="text-right">
                <div className="text-sm font-medium">{dashboardData.crm.subscriptions.active}/{dashboardData.crm.subscriptions.total}</div>
                <div className="text-xs text-yellow-600">{dashboardData.crm.subscriptions.expiring} expiring</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Contracts</span>
              <div className="text-right">
                <div className="text-sm font-medium">{dashboardData.crm.contracts.signed}/{dashboardData.crm.contracts.total}</div>
                <div className="text-xs text-green-600">signed</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Communications Module */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Communications</h3>
            <MessageSquare className="h-5 w-5 text-blue-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Messages</span>
              <div className="text-right">
                <div className="text-sm font-medium">{dashboardData.communications.messages.total}</div>
                <div className="text-xs text-blue-600">{dashboardData.communications.messages.social} social</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Voicemails</span>
              <div className="text-right">
                <div className="text-sm font-medium">{dashboardData.communications.voicemails.total}</div>
                <div className="text-xs text-red-600">{dashboardData.communications.voicemails.unread} unread</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Financial Module */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Financial</h3>
            <Banknote className="h-5 w-5 text-green-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Bank Accounts</span>
              <div className="text-right">
                <div className="text-sm font-medium">{dashboardData.financial.banking.active}/{dashboardData.financial.banking.accounts}</div>
                <div className="text-xs text-green-600">active</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Crypto</span>
              <div className="text-right">
                <div className="text-sm font-medium">{dashboardData.financial.crypto.wallets} wallets</div>
                <div className="text-xs text-orange-600">{dashboardData.financial.crypto.payments} payments</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Training Module */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Training</h3>
            <Activity className="h-5 w-5 text-purple-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Sessions</span>
              <div className="text-right">
                <div className="text-sm font-medium">{dashboardData.training.sessions.total}</div>
                <div className="text-xs text-green-600">{dashboardData.training.sessions.active} active</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Privacy Module */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Privacy & Data</h3>
            <Shield className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Data Exports</span>
              <div className="text-right">
                <div className="text-sm font-medium">{dashboardData.privacy.exports.total}</div>
                <div className="text-xs text-yellow-600">{dashboardData.privacy.exports.pending} pending</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Privacy Settings</span>
              <div className="text-right">
                <div className="text-sm font-medium">{dashboardData.privacy.settings}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* System Module */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">System</h3>
            <Server className="h-5 w-5 text-gray-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Languages</span>
              <div className="text-right">
                <div className="text-sm font-medium">{dashboardData.system.languages}</div>
                <div className="text-xs text-blue-600">{dashboardData.system.translations} translations</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Integrations</span>
              <div className="text-right">
                <div className="text-sm font-medium">{dashboardData.system.integrations}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Customers */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Top Customers by Lifetime Value</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lifetime Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Appointments
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData.analytics.topCustomers.map((customer, index) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(customer.lifetimeValue)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.appointmentCount}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {new Date(dashboardData.metadata.generatedAt).toLocaleString()}
      </div>
    </div>
  );
}
