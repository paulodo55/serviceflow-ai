'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Plus,
  Search,
  Shield,
  Users,
  Settings,
  Key,
  Lock,
  Unlock,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  Facebook,
  Instagram,
  Twitter,
  Calendar,
  Mail,
  MessageSquare,
  CreditCard,
  Banknote,
  Bitcoin,
  BarChart3,
  Database,
} from 'lucide-react';
import { useDemo } from '@/lib/demo-context';

interface EmployeeGroup {
  id: string;
  name: string;
  description?: string;
  priority: number;
  isActive: boolean;
  permissions: Record<string, any>;
  members: Array<{
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  }>;
  integrations: Array<{
    id: string;
    integrationType: string;
    accessLevel: string;
  }>;
  _count: {
    members: number;
    integrations: number;
  };
}

interface IntegrationAccess {
  id: string;
  integrationType: string;
  accessLevel: string;
  permissions?: Record<string, any>;
  isActive: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  group?: {
    id: string;
    name: string;
    description?: string;
  };
}

export default function IntegrationsPage() {
  const { isDemoMode } = useDemo();
  const [activeTab, setActiveTab] = useState<'overview' | 'groups' | 'access'>('overview');
  const [groups, setGroups] = useState<EmployeeGroup[]>([]);
  const [accessRules, setAccessRules] = useState<IntegrationAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewGroup, setShowNewGroup] = useState(false);

  useEffect(() => {
    if (isDemoMode) {
      // Demo data
      setGroups([
        {
          id: '1',
          name: 'Managers',
          description: 'Management team with elevated access',
          priority: 100,
          isActive: true,
          permissions: { canManageUsers: true, canViewReports: true },
          members: [
            {
              id: '1',
              user: {
                id: '1',
                name: 'John Smith',
                email: 'john@vervidflow.com',
                role: 'MANAGER',
              },
            },
          ],
          integrations: [
            { id: '1', integrationType: 'SOCIAL_MEDIA', accessLevel: 'FULL' },
            { id: '2', integrationType: 'BANKING', accessLevel: 'ADMIN' },
          ],
          _count: { members: 3, integrations: 8 },
        },
        {
          id: '2',
          name: 'Staff',
          description: 'General staff members',
          priority: 50,
          isActive: true,
          permissions: { canViewCustomers: true },
          members: [
            {
              id: '2',
              user: {
                id: '2',
                name: 'Sarah Wilson',
                email: 'sarah@vervidflow.com',
                role: 'STAFF',
              },
            },
          ],
          integrations: [
            { id: '3', integrationType: 'SOCIAL_MEDIA', accessLevel: 'READ' },
            { id: '4', integrationType: 'CALENDAR', accessLevel: 'WRITE' },
          ],
          _count: { members: 5, integrations: 4 },
        },
      ]);

      setAccessRules([
        {
          id: '1',
          integrationType: 'SOCIAL_MEDIA',
          accessLevel: 'FULL',
          isActive: true,
          group: { id: '1', name: 'Managers' },
        },
        {
          id: '2',
          integrationType: 'BANKING',
          accessLevel: 'READ',
          isActive: true,
          user: { id: '3', name: 'Mike Johnson', email: 'mike@vervidflow.com', role: 'STAFF' },
        },
      ]);

      setLoading(false);
    } else {
      fetchData();
    }
  }, [isDemoMode]);

  const fetchData = async () => {
    try {
      const [groupsRes, accessRes] = await Promise.all([
        fetch('/api/employee-groups'),
        fetch('/api/integrations/access'),
      ]);

      if (groupsRes.ok) {
        const groupsData = await groupsRes.json();
        setGroups(groupsData.groups);
      }

      if (accessRes.ok) {
        const accessData = await accessRes.json();
        setAccessRules(accessData.accessRules);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'SOCIAL_MEDIA':
        return <MessageSquare className="h-5 w-5 text-blue-600" />;
      case 'CALENDAR':
        return <Calendar className="h-5 w-5 text-green-600" />;
      case 'EMAIL':
        return <Mail className="h-5 w-5 text-red-600" />;
      case 'PAYMENT':
        return <CreditCard className="h-5 w-5 text-purple-600" />;
      case 'BANKING':
        return <Banknote className="h-5 w-5 text-green-700" />;
      case 'CRYPTO':
        return <Bitcoin className="h-5 w-5 text-orange-500" />;
      case 'ANALYTICS':
        return <BarChart3 className="h-5 w-5 text-indigo-600" />;
      case 'STORAGE':
        return <Database className="h-5 w-5 text-gray-600" />;
      default:
        return <Globe className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'FULL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ADMIN':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'WRITE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'READ':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAccessIcon = (level: string) => {
    switch (level) {
      case 'FULL':
        return <Unlock className="h-3 w-3" />;
      case 'ADMIN':
        return <Key className="h-3 w-3" />;
      case 'WRITE':
        return <Edit className="h-3 w-3" />;
      case 'READ':
        return <Eye className="h-3 w-3" />;
      default:
        return <Lock className="h-3 w-3" />;
    }
  };

  const integrationTypes = [
    { type: 'SOCIAL_MEDIA', name: 'Social Media', icon: MessageSquare, description: 'Facebook, Instagram, Twitter' },
    { type: 'CALENDAR', name: 'Calendar', icon: Calendar, description: 'Google, Apple, Outlook' },
    { type: 'EMAIL', name: 'Email', icon: Mail, description: 'Email marketing and communication' },
    { type: 'PAYMENT', name: 'Payments', icon: CreditCard, description: 'Stripe, PayPal, Square' },
    { type: 'BANKING', name: 'Banking', icon: Banknote, description: 'Bank account integration' },
    { type: 'CRYPTO', name: 'Cryptocurrency', icon: Bitcoin, description: 'Bitcoin, Ethereum, etc.' },
    { type: 'ANALYTICS', name: 'Analytics', icon: BarChart3, description: 'Business intelligence' },
    { type: 'STORAGE', name: 'Storage', icon: Database, description: 'File and data storage' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integration Management</h1>
          <p className="text-gray-600 mt-1">Manage access controls and employee permissions</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowNewGroup(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Group</span>
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Integration Overview
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'groups'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Employee Groups ({groups.length})
          </button>
          <button
            onClick={() => setActiveTab('access')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'access'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Access Rules ({accessRules.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Integration Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {integrationTypes.map((integration) => (
              <motion.div
                key={integration.type}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <integration.icon className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {accessRules.filter(rule => rule.integrationType === integration.type).length} rules
                  </span>
                  <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                    Configure
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Employee Groups</p>
                  <p className="text-2xl font-bold text-gray-900">{groups.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Access Rules</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {accessRules.filter(rule => rule.isActive).length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Members</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {groups.reduce((sum, group) => sum + group._count.members, 0)}
                  </p>
                </div>
                <UserPlus className="h-8 w-8 text-indigo-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'groups' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Groups Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.map((group) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-600">{group.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Priority: {group.priority}</span>
                    <div className={`w-2 h-2 rounded-full ${group.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Members:</span>
                    <span className="font-medium">{group._count.members}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Integrations:</span>
                    <span className="font-medium">{group._count.integrations}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {group.integrations.slice(0, 3).map((integration) => (
                    <span
                      key={integration.id}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getAccessLevelColor(integration.accessLevel)}`}
                    >
                      {getIntegrationIcon(integration.integrationType)}
                      <span className="ml-1">{integration.integrationType}</span>
                    </span>
                  ))}
                  {group.integrations.length > 3 && (
                    <span className="text-xs text-gray-500">+{group.integrations.length - 3} more</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {group.members.slice(0, 3).map((member) => (
                      <div
                        key={member.id}
                        className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white"
                        title={member.user.name}
                      >
                        {member.user.name.charAt(0)}
                      </div>
                    ))}
                    {group.members.length > 3 && (
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-500 border-2 border-white">
                        +{group.members.length - 3}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="text-indigo-600 hover:text-indigo-900">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'access' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Access Rules</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Integration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Access Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accessRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getIntegrationIcon(rule.integrationType)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {rule.integrationType.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getAccessLevelColor(rule.accessLevel)}`}>
                        {getAccessIcon(rule.accessLevel)}
                        <span className="ml-1">{rule.accessLevel}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {rule.user ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">{rule.user.name}</div>
                          <div className="text-sm text-gray-500">{rule.user.email}</div>
                        </div>
                      ) : rule.group ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">{rule.group.name}</div>
                          <div className="text-sm text-gray-500">Group</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rule.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
