'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Send,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  File,
  User,
  Calendar,
} from 'lucide-react';
import { useDemo } from '@/lib/demo-context';

interface Contract {
  id: string;
  title: string;
  status: string;
  version: number;
  effectiveDate?: string;
  expirationDate?: string;
  signedAt?: string;
  signedBy?: string;
  requiresSignature: boolean;
  customer?: {
    id: string;
    name: string;
    email: string;
  };
  subscription?: {
    id: string;
    name: string;
    type: string;
  };
  template?: {
    id: string;
    name: string;
    category: string;
  };
  _count: {
    versions: number;
  };
  createdAt: string;
}

interface ContractTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  isActive: boolean;
  isDefault: boolean;
  _count: {
    contracts: number;
  };
  createdAt: string;
}

export default function ContractsPage() {
  const { isDemoMode } = useDemo();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'contracts' | 'templates'>('contracts');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showNewContract, setShowNewContract] = useState(false);
  const [showNewTemplate, setShowNewTemplate] = useState(false);

  useEffect(() => {
    if (isDemoMode) {
      // Demo data
      setContracts([
        {
          id: '1',
          title: 'Premium Gym Membership Agreement',
          status: 'SIGNED',
          version: 1,
          effectiveDate: '2024-01-01T00:00:00Z',
          expirationDate: '2024-12-31T23:59:59Z',
          signedAt: '2024-01-01T10:30:00Z',
          signedBy: 'John Smith',
          requiresSignature: true,
          customer: {
            id: '1',
            name: 'John Smith',
            email: 'john@example.com',
          },
          subscription: {
            id: '1',
            name: 'Premium Membership',
            type: 'MEMBERSHIP',
          },
          template: {
            id: '1',
            name: 'Membership Agreement',
            category: 'MEMBERSHIP',
          },
          _count: { versions: 1 },
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          title: 'Business Software License',
          status: 'SENT',
          version: 2,
          effectiveDate: '2024-03-15T00:00:00Z',
          expirationDate: '2025-03-15T00:00:00Z',
          requiresSignature: true,
          customer: {
            id: '2',
            name: 'Tech Corp Inc',
            email: 'admin@techcorp.com',
          },
          template: {
            id: '2',
            name: 'Software License Agreement',
            category: 'SOFTWARE',
          },
          _count: { versions: 2 },
          createdAt: '2024-03-15T00:00:00Z',
        },
      ]);

      setTemplates([
        {
          id: '1',
          name: 'Membership Agreement',
          description: 'Standard gym membership contract',
          category: 'MEMBERSHIP',
          isActive: true,
          isDefault: true,
          _count: { contracts: 5 },
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'Software License Agreement',
          description: 'Software licensing and usage terms',
          category: 'SOFTWARE',
          isActive: true,
          isDefault: false,
          _count: { contracts: 3 },
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '3',
          name: 'Service Agreement',
          description: 'General service contract template',
          category: 'SERVICE',
          isActive: true,
          isDefault: false,
          _count: { contracts: 8 },
          createdAt: '2024-01-01T00:00:00Z',
        },
      ]);
      setLoading(false);
    } else {
      fetchData();
    }
  }, [isDemoMode, activeTab, fetchData]);

  const fetchData = useCallback(async () => {
    try {
      if (activeTab === 'contracts') {
        const params = new URLSearchParams();
        if (statusFilter) params.append('status', statusFilter);

        const response = await fetch(`/api/contracts?${params}`);
        if (response.ok) {
          const data = await response.json();
          setContracts(data.contracts);
        }
      } else {
        const response = await fetch('/api/contracts/templates');
        if (response.ok) {
          const data = await response.json();
          setTemplates(data.templates);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, statusFilter]);

  const createDefaultTemplates = async () => {
    try {
      const response = await fetch('/api/contracts/templates', {
        method: 'PATCH',
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error creating default templates:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SIGNED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'SENT':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'EXPIRED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SIGNED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'SENT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredContracts = contracts.filter((contract) =>
    contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contract Management</h1>
          <p className="text-gray-600 mt-1">Manage contracts, templates, and e-signatures</p>
        </div>
        <div className="flex space-x-3">
          {activeTab === 'templates' && templates.length === 0 && (
            <button
              onClick={createDefaultTemplates}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <File className="h-4 w-4" />
              <span>Create Default Templates</span>
            </button>
          )}
          <button
            onClick={() => activeTab === 'contracts' ? setShowNewContract(true) : setShowNewTemplate(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>{activeTab === 'contracts' ? 'New Contract' : 'New Template'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('contracts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'contracts'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Contracts ({contracts.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Templates ({templates.length})
          </button>
        </nav>
      </div>

      {/* Stats Cards */}
      {activeTab === 'contracts' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Contracts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {contracts.filter(c => c.status === 'SIGNED').length}
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
                <p className="text-sm text-gray-600">Pending Signatures</p>
                <p className="text-2xl font-bold text-gray-900">
                  {contracts.filter(c => c.status === 'SENT').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
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
                  {contracts.filter(c => {
                    if (!c.expirationDate) return false;
                    const daysUntilExpiry = Math.ceil(
                      (new Date(c.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    );
                    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
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
                <p className="text-sm text-gray-600">Total Templates</p>
                <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
              </div>
              <File className="h-8 w-8 text-indigo-500" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          {activeTab === 'contracts' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="SIGNED">Signed</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          )}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'contracts' ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contract
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Effective Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiration
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContracts.map((contract) => (
                  <motion.tr
                    key={contract.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {contract.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          Version {contract.version} • {contract.template?.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900">
                            {contract.customer?.name || 'No customer'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {contract.customer?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(contract.status)}`}>
                        {getStatusIcon(contract.status)}
                        <span className="ml-1">{contract.status}</span>
                      </span>
                      {contract.signedAt && (
                        <div className="text-xs text-gray-500 mt-1">
                          Signed {formatDate(contract.signedAt)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contract.effectiveDate ? formatDate(contract.effectiveDate) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contract.expirationDate ? formatDate(contract.expirationDate) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-blue-600">
                          <Send className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-green-600">
                          <Download className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <FileText className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    {template.category && (
                      <span className="text-sm text-gray-500">{template.category}</span>
                    )}
                  </div>
                </div>
                {template.isDefault && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Default
                  </span>
                )}
              </div>
              
              {template.description && (
                <p className="text-gray-600 text-sm mb-4">{template.description}</p>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{template._count.contracts} contracts</span>
                <span>Created {formatDate(template.createdAt)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${template.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm text-gray-600">
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="text-indigo-600 hover:text-indigo-900">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
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
      )}

      {/* Empty States */}
      {((activeTab === 'contracts' && filteredContracts.length === 0) || 
        (activeTab === 'templates' && filteredTemplates.length === 0)) && (
        <div className="text-center py-12">
          {activeTab === 'contracts' ? (
            <>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first contract.</p>
              <button
                onClick={() => setShowNewContract(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Create Contract
              </button>
            </>
          ) : (
            <>
              <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600 mb-4">Create templates to streamline contract creation.</p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={createDefaultTemplates}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  Create Default Templates
                </button>
                <button
                  onClick={() => setShowNewTemplate(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Create Template
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
