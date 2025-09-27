'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Banknote,
  Plus,
  Search,
  Filter,
  CreditCard,
  Building2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Bitcoin,
  Wallet,
  QrCode,
  Copy,
  ExternalLink,
  Settings,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
} from 'lucide-react';
import { useDemo } from '@/lib/demo-context';

interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  accountType: string;
  isActive: boolean;
  isPrimary: boolean;
  lastSyncAt?: string;
  _count: {
    transactions: number;
  };
}

interface CryptoWallet {
  id: string;
  currency: string;
  address: string;
  label?: string;
  provider: string;
  isActive: boolean;
  _count: {
    transactions: number;
    payments: number;
  };
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  description: string;
  type: 'DEBIT' | 'CREDIT';
  status: string;
  transactionDate: string;
  category?: string;
  isReconciled: boolean;
}

interface CryptoPayment {
  id: string;
  amount: string;
  currency: string;
  usdAmount: number;
  status: string;
  paymentAddress: string;
  qrCode?: string;
  txHash?: string;
  confirmations: number;
  expiresAt: string;
  paidAt?: string;
  customer?: {
    name: string;
    email: string;
  };
}

export default function BankingPage() {
  const { isDemoMode } = useDemo();
  const [activeTab, setActiveTab] = useState<'banking' | 'crypto'>('banking');
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [cryptoWallets, setCryptoWallets] = useState<CryptoWallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cryptoPayments, setCryptoPayments] = useState<CryptoPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (isDemoMode) {
      // Demo data
      setBankAccounts([
        {
          id: '1',
          bankName: 'Chase Bank',
          accountName: 'Business Checking',
          accountNumber: '****1234',
          accountType: 'CHECKING',
          isActive: true,
          isPrimary: true,
          lastSyncAt: '2024-01-15T10:30:00Z',
          _count: { transactions: 145 },
        },
        {
          id: '2',
          bankName: 'Bank of America',
          accountName: 'Business Savings',
          accountNumber: '****5678',
          accountType: 'SAVINGS',
          isActive: true,
          isPrimary: false,
          lastSyncAt: '2024-01-15T09:45:00Z',
          _count: { transactions: 23 },
        },
      ]);

      setCryptoWallets([
        {
          id: '1',
          currency: 'BITCOIN',
          address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          label: 'Main Bitcoin Wallet',
          provider: 'COINBASE',
          isActive: true,
          _count: { transactions: 12, payments: 8 },
        },
        {
          id: '2',
          currency: 'ETHEREUM',
          address: '0x742d35Cc6634C0532925a3b8D1F1B2101B1c1234',
          label: 'Ethereum Payments',
          provider: 'CUSTOM',
          isActive: true,
          _count: { transactions: 5, payments: 15 },
        },
        {
          id: '3',
          currency: 'USDC',
          address: '0x742d35Cc6634C0532925a3b8D1F1B2101B1c5678',
          label: 'Stablecoin Wallet',
          provider: 'COINBASE',
          isActive: true,
          _count: { transactions: 28, payments: 45 },
        },
      ]);

      setTransactions([
        {
          id: '1',
          amount: 1250.00,
          currency: 'USD',
          description: 'Customer Payment - John Smith',
          type: 'CREDIT',
          status: 'COMPLETED',
          transactionDate: '2024-01-15T14:30:00Z',
          category: 'Revenue',
          isReconciled: true,
        },
        {
          id: '2',
          amount: 450.00,
          currency: 'USD',
          description: 'Office Supplies - Staples',
          type: 'DEBIT',
          status: 'COMPLETED',
          transactionDate: '2024-01-15T11:15:00Z',
          category: 'Business Expenses',
          isReconciled: false,
        },
        {
          id: '3',
          amount: 2800.00,
          currency: 'USD',
          description: 'Monthly Membership Fees',
          type: 'CREDIT',
          status: 'COMPLETED',
          transactionDate: '2024-01-14T16:45:00Z',
          category: 'Revenue',
          isReconciled: true,
        },
      ]);

      setCryptoPayments([
        {
          id: '1',
          amount: '0.00125000',
          currency: 'BITCOIN',
          usdAmount: 56.25,
          status: 'PAID',
          paymentAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          txHash: '1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z',
          confirmations: 6,
          expiresAt: '2024-01-16T14:30:00Z',
          paidAt: '2024-01-15T15:22:00Z',
          customer: {
            name: 'Alice Johnson',
            email: 'alice@example.com',
          },
        },
        {
          id: '2',
          amount: '25.000000',
          currency: 'USDC',
          usdAmount: 25.00,
          status: 'PENDING',
          paymentAddress: '0x742d35Cc6634C0532925a3b8D1F1B2101B1c5678',
          confirmations: 0,
          expiresAt: '2024-01-16T18:00:00Z',
          customer: {
            name: 'Bob Wilson',
            email: 'bob@example.com',
          },
        },
      ]);

      setLoading(false);
    } else {
      fetchData();
    }
  }, [isDemoMode, activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'banking') {
        const accountsRes = await fetch('/api/banking/accounts');
        if (accountsRes.ok) {
          const data = await accountsRes.json();
          setBankAccounts(data.accounts);
        }
      } else {
        const walletsRes = await fetch('/api/crypto/wallets');
        const paymentsRes = await fetch('/api/crypto/payments');
        
        if (walletsRes.ok) {
          const walletsData = await walletsRes.json();
          setCryptoWallets(walletsData.wallets);
        }
        
        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json();
          setCryptoPayments(paymentsData.payments);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCryptoIcon = (currency: string) => {
    switch (currency) {
      case 'BITCOIN':
        return <Bitcoin className="h-5 w-5 text-orange-500" />;
      case 'ETHEREUM':
        return <div className="h-5 w-5 bg-gray-800 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">Ξ</span>
        </div>;
      case 'USDC':
      case 'USDT':
      case 'DAI':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      default:
        return <Wallet className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'FAILED':
      case 'CANCELLED':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'FAILED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    }
    return `${amount} ${currency}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Banking & Payments</h1>
          <p className="text-gray-600 mt-1">Manage bank accounts and cryptocurrency payments</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add {activeTab === 'banking' ? 'Bank Account' : 'Crypto Wallet'}</span>
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
            onClick={() => setActiveTab('banking')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'banking'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Building2 className="h-4 w-4 inline mr-2" />
            Traditional Banking
          </button>
          <button
            onClick={() => setActiveTab('crypto')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'crypto'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Bitcoin className="h-4 w-4 inline mr-2" />
            Cryptocurrency
          </button>
        </nav>
      </div>

      {activeTab === 'banking' ? (
        <>
          {/* Banking Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Balance</p>
                  <p className="text-2xl font-bold text-gray-900">$45,230.50</p>
                </div>
                <Banknote className="h-8 w-8 text-green-500" />
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
                  <p className="text-sm text-gray-600">Monthly Income</p>
                  <p className="text-2xl font-bold text-gray-900">$12,450.00</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
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
                  <p className="text-sm text-gray-600">Monthly Expenses</p>
                  <p className="text-2xl font-bold text-gray-900">$8,320.25</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500" />
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
                  <p className="text-sm text-gray-600">Connected Accounts</p>
                  <p className="text-2xl font-bold text-gray-900">{bankAccounts.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-indigo-500" />
              </div>
            </motion.div>
          </div>

          {/* Bank Accounts */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Bank Accounts</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bankAccounts.map((account) => (
                  <motion.div
                    key={account.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{account.accountName}</h3>
                          <p className="text-sm text-gray-500">{account.bankName}</p>
                        </div>
                      </div>
                      {account.isPrimary && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Account Number:</span>
                        <span className="font-mono">{account.accountNumber}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Type:</span>
                        <span>{account.accountType}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Transactions:</span>
                        <span>{account._count.transactions}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${account.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-sm text-gray-600">
                          {account.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-900 text-sm">
                          View Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {transaction.type === 'CREDIT' ? (
                            <ArrowDownLeft className="h-4 w-4 text-green-500 mr-3" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-red-500 mr-3" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.description}
                            </div>
                            <div className="text-sm text-gray-500">
                              {transaction.type}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'CREDIT' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.category || 'Uncategorized'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.transactionDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1">{transaction.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Crypto Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Crypto Value</p>
                  <p className="text-2xl font-bold text-gray-900">$8,450.75</p>
                </div>
                <Bitcoin className="h-8 w-8 text-orange-500" />
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
                  <p className="text-sm text-gray-600">Active Wallets</p>
                  <p className="text-2xl font-bold text-gray-900">{cryptoWallets.length}</p>
                </div>
                <Wallet className="h-8 w-8 text-indigo-500" />
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
                  <p className="text-sm text-gray-600">Pending Payments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {cryptoPayments.filter(p => p.status === 'PENDING').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
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
                  <p className="text-sm text-gray-600">Completed Payments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {cryptoPayments.filter(p => p.status === 'PAID').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </motion.div>
          </div>

          {/* Crypto Wallets */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Cryptocurrency Wallets</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cryptoWallets.map((wallet) => (
                  <motion.div
                    key={wallet.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getCryptoIcon(wallet.currency)}
                        <div>
                          <h3 className="font-semibold text-gray-900">{wallet.currency}</h3>
                          <p className="text-sm text-gray-500">{wallet.label || 'No label'}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{wallet.provider}</span>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-xs text-gray-600 mb-1">Wallet Address:</p>
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono truncate flex-1">
                          {wallet.address.slice(0, 20)}...
                        </code>
                        <button
                          onClick={() => copyToClipboard(wallet.address)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Transactions:</span>
                        <span>{wallet._count.transactions}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Payments:</span>
                        <span>{wallet._count.payments}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${wallet.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-sm text-gray-600">
                          {wallet.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-900 text-sm">
                          Manage
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Crypto Payments */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Crypto Payments</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cryptoPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getCryptoIcon(payment.currency)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {payment.amount} {payment.currency}
                            </div>
                            <div className="text-sm text-gray-500">
                              {payment.txHash ? `TX: ${payment.txHash.slice(0, 10)}...` : 'Pending'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(payment.usdAmount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.confirmations} confirmations
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payment.customer?.name || 'Anonymous'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.customer?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          <span className="ml-1">{payment.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.paidAt ? formatTime(payment.paidAt) : formatTime(payment.expiresAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {payment.qrCode && (
                            <button className="text-indigo-600 hover:text-indigo-900">
                              <QrCode className="h-4 w-4" />
                            </button>
                          )}
                          {payment.txHash && (
                            <button className="text-gray-400 hover:text-gray-600">
                              <ExternalLink className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
