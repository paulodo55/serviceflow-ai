'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  DollarSign,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Bell,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import { useDemo } from '@/lib/demo-context';

interface Subscription {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  amount: number;
  billingCycle: string;
  currency: string;
  startDate: string;
  endDate?: string;
  nextBillingDate?: string;
  autoRenew: boolean;
  customer?: {
    id: string;
    name: string;
    email: string;
  };
  alerts: Alert[];
  _count: {
    alerts: number;
    contracts: number;
  };
}

interface Alert {
  id: string;
  type: string;
  status: string;
  scheduledFor: string;
  subject: string;
}

export default function SubscriptionsPage() {
  const { isDemoMode } = useDemo();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showNewSubscription, setShowNewSubscription] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    if (isDemoMode) {
      // Demo data
      setSubscriptions([
        {
          id: '1',
          name: 'Premium Gym Membership',
          description: 'Full access to all facilities and classes',
          type: 'MEMBERSHIP',
          status: 'ACTIVE',
          amount: 99.99,
          billingCycle: 'MONTHLY',
          currency: 'USD',
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-12-31T23:59:59Z',
          nextBillingDate: '2024-11-01T00:00:00Z',
          autoRenew: true,
          customer: {
            id: '1',
            name: 'John Smith',
            email: 'john@example.com',
          },
          alerts: [
            {
              id: '1',
              type: 'EXPIRATION',
              status: 'PENDING',
              scheduledFor: '2024-12-01T00:00:00Z',
              subject: 'Membership Expiring Soon',
            },
          ],
          _count: { alerts: 1, contracts: 1 },
        },
        {
          id: '2',
          name: 'Business Software License',
          description: 'Annual CRM software subscription',
          type: 'SOFTWARE',
          status: 'ACTIVE',
          amount: 1200.00,
          billingCycle: 'YEARLY',
          currency: 'USD',
          startDate: '2024-03-15T00:00:00Z',
          endDate: '2025-03-15T00:00:00Z',
          nextBillingDate: '2025-03-15T00:00:00Z',
          autoRenew: false,
          customer: {
            id: '2',
            name: 'Tech Corp Inc',
            email: 'admin@techcorp.com',
          },
          alerts: [
            {
              id: '2',
              type: 'RENEWAL',
              status: 'PENDING',
              scheduledFor: '2025-02-15T00:00:00Z',
              subject: 'Renewal Decision Required',
            },
          ],
          _count: { alerts: 2, contracts: 0 },
        },
      ]);
      setLoading(false);
    } else {
      fetchSubscriptions();
    }
  }, [isDemoMode]);

  const fetchSubscriptions = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);

      const response = await fetch(`/api/subscriptions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter((subscription) =>
    subscription.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subscription.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'EXPIRED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'SUSPENDED':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'SUSPENDED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysUntilExpiration = (endDate?: string) => {
    if (!endDate) return null;
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600 mt-1">Track and manage customer subscriptions</p>
        </div>
        <button
          onClick={() => setShowNewSubscription(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Subscription</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900">
                {subscriptions.filter(s => s.status === 'ACTIVE').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
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
              <p className="text-sm text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  subscriptions
                    .filter(s => s.status === 'ACTIVE' && s.billingCycle === 'MONTHLY')
                    .reduce((sum, s) => sum + s.amount, 0),
                  'USD'
                )}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
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
              <p className="text-sm text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-gray-900">
                {subscriptions.filter(s => {
                  const days = getDaysUntilExpiration(s.endDate);
                  return days !== null && days <= 30 && days > 0;
                }).length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
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
              <p className="text-sm text-gray-600">Pending Alerts</p>
              <p className="text-2xl font-bold text-gray-900">
                {subscriptions.reduce((sum, s) => sum + s.alerts.filter(a => a.status === 'PENDING').length, 0)}
              </p>
            </div>
            <Bell className="h-8 w-8 text-indigo-500" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search subscriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Types</option>
            <option value="SERVICE">Service</option>
            <option value="PRODUCT">Product</option>
            <option value="SOFTWARE">Software</option>
            <option value="MEMBERSHIP">Membership</option>
          </select>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Billing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alerts
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubscriptions.map((subscription) => {
                const daysUntilExpiration = getDaysUntilExpiration(subscription.endDate);
                return (
                  <motion.tr
                    key={subscription.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {subscription.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {subscription.type} • {subscription.billingCycle}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {subscription.customer?.name || 'No customer'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {subscription.customer?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(subscription.amount, subscription.currency)}
                      </div>
                      <div className="text-sm text-gray-500">
                        per {subscription.billingCycle.toLowerCase()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(subscription.status)}`}>
                        {getStatusIcon(subscription.status)}
                        <span className="ml-1">{subscription.status}</span>
                      </span>
                      {daysUntilExpiration !== null && daysUntilExpiration <= 30 && daysUntilExpiration > 0 && (
                        <div className="text-xs text-yellow-600 mt-1">
                          Expires in {daysUntilExpiration} days
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subscription.nextBillingDate ? formatDate(subscription.nextBillingDate) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {subscription._count.alerts > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Bell className="h-3 w-3 mr-1" />
                            {subscription._count.alerts}
                          </span>
                        )}
                        {subscription._count.contracts > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Calendar className="h-3 w-3 mr-1" />
                            {subscription._count.contracts}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedSubscription(subscription)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredSubscriptions.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first subscription.</p>
          <button
            onClick={() => setShowNewSubscription(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Create Subscription
          </button>
        </div>
      )}
    </div>
  );
}
