'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard,
  Search,
  Filter,
  Plus,
  Download,
  Send,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  DollarSign,
  Calendar,
  User,
  FileText,
  TrendingUp,
  Mail,
  Phone
} from 'lucide-react';

// Types
interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
  services: InvoiceService[];
  notes: string;
  paymentMethod?: string;
  paidDate?: string;
}

interface InvoiceService {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: 'cash' | 'check' | 'card' | 'bank_transfer' | 'online';
  date: string;
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  notes?: string;
}

const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    customerId: '1',
    customerName: 'John Smith',
    customerEmail: 'john@example.com',
    customerPhone: '(555) 123-4567',
    issueDate: '2024-01-10',
    dueDate: '2024-01-25',
    status: 'paid',
    subtotal: 150.00,
    tax: 12.00,
    total: 162.00,
    paidAmount: 162.00,
    services: [
      {
        id: 's1',
        description: 'AC Repair - Refrigerant leak fix',
        quantity: 1,
        rate: 150.00,
        amount: 150.00
      }
    ],
    notes: 'Emergency repair service',
    paymentMethod: 'card',
    paidDate: '2024-01-15'
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    customerId: '2',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah@example.com',
    customerPhone: '(555) 987-6543',
    issueDate: '2024-01-12',
    dueDate: '2024-01-27',
    status: 'sent',
    subtotal: 120.00,
    tax: 9.60,
    total: 129.60,
    paidAmount: 0,
    services: [
      {
        id: 's2',
        description: 'Drain Cleaning Service',
        quantity: 1,
        rate: 120.00,
        amount: 120.00
      }
    ],
    notes: 'Kitchen sink backup resolved'
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    customerId: '3',
    customerName: 'Mike Davis',
    customerEmail: 'mike@example.com',
    customerPhone: '(555) 456-7890',
    issueDate: '2024-01-08',
    dueDate: '2024-01-23',
    status: 'overdue',
    subtotal: 200.00,
    tax: 16.00,
    total: 216.00,
    paidAmount: 0,
    services: [
      {
        id: 's3',
        description: 'Electrical Inspection - Full home',
        quantity: 1,
        rate: 200.00,
        amount: 200.00
      }
    ],
    notes: 'Annual safety inspection'
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-004',
    customerId: '4',
    customerName: 'Emily Chen',
    customerEmail: 'emily@example.com',
    customerPhone: '(555) 321-0987',
    issueDate: '2024-01-14',
    dueDate: '2024-01-29',
    status: 'draft',
    subtotal: 85.00,
    tax: 6.80,
    total: 91.80,
    paidAmount: 0,
    services: [
      {
        id: 's4',
        description: 'Faucet Replacement',
        quantity: 1,
        rate: 85.00,
        amount: 85.00
      }
    ],
    notes: 'Kitchen faucet upgrade'
  }
];

const mockPayments: Payment[] = [
  {
    id: 'p1',
    invoiceId: '1',
    amount: 162.00,
    method: 'card',
    date: '2024-01-15',
    status: 'completed',
    transactionId: 'txn_1234567890',
    notes: 'Visa ending in 4242'
  }
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'customer' | 'status'>('date');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments'>('invoices');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'sent':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'draft':
        return <Edit className="h-4 w-4 text-gray-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
      case 'amount':
        return b.total - a.total;
      case 'customer':
        return a.customerName.localeCompare(b.customerName);
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  // Calculate summary stats
  const totalInvoices = invoices.length;
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalOutstanding = totalRevenue - totalPaid;
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices & Payments</h1>
          <p className="text-gray-600">Manage billing and payment processing</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowNewInvoice(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Create Invoice</span>
        </motion.button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{totalInvoices}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Paid Amount</p>
              <p className="text-2xl font-bold text-gray-900">${totalPaid.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Outstanding</p>
              <p className="text-2xl font-bold text-gray-900">${totalOutstanding.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'invoices'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Invoices ({totalInvoices})
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Payments ({payments.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'invoices' ? (
            <>
              {/* Filters and Search */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search invoices..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="amount">Sort by Amount</option>
                    <option value="customer">Sort by Customer</option>
                    <option value="status">Sort by Status</option>
                  </select>
                </div>
              </div>

              {/* Invoice List */}
              <div className="space-y-4">
                {sortedInvoices.map((invoice, index) => (
                  <motion.div
                    key={invoice.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(invoice.status)}
                          <h3 className="text-lg font-medium text-gray-900">
                            {invoice.invoiceNumber}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full uppercase ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            {invoice.customerName}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            Due: {new Date(invoice.dueDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                            Total: ${invoice.total.toLocaleString()}
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-gray-400" />
                            Paid: ${invoice.paidAmount.toLocaleString()}
                          </div>
                        </div>

                        <div className="text-sm text-gray-500">
                          {invoice.services.map(service => service.description).join(', ')}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-6">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                          <Download className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                          <Send className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-orange-600 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            /* Payments Tab */
            <div className="space-y-4">
              <div className="text-center py-12">
                <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Payment Processing
                </h3>
                <p className="text-gray-500 mb-4">
                  Stripe integration and payment tracking will be available here
                </p>
                <div className="flex justify-center space-x-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Stripe Integration
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Payment Links
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    Auto Reminders
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Invoice Modal Placeholder */}
      {showNewInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Create New Invoice
              </h3>
              <button
                onClick={() => setShowNewInvoice(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Plus className="h-6 w-6 rotate-45" />
              </button>
            </div>
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                Invoice creation form will be implemented here
              </p>
              <button
                onClick={() => setShowNewInvoice(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Coming Soon
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
