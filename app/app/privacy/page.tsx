'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Download,
  Upload,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Settings,
  FileText,
  Database,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Globe,
  Mail,
  MessageSquare,
  Bell,
  Cookie,
} from 'lucide-react';
import { useDemo } from '@/lib/demo-context';

interface PrivacySetting {
  id: string;
  settingKey: string;
  settingValue: any;
  description?: string;
  isGDPRRelated: boolean;
  requiresConsent: boolean;
  consentGivenAt?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface DataExport {
  id: string;
  exportType: string;
  format: string;
  status: string;
  downloadUrl?: string;
  expiresAt?: string;
  recordCount?: number;
  fileSize?: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function PrivacyPage() {
  const { isDemoMode } = useDemo();
  const [activeTab, setActiveTab] = useState<'settings' | 'data' | 'exports'>('settings');
  const [privacySettings, setPrivacySettings] = useState<PrivacySetting[]>([]);
  const [dataExports, setDataExports] = useState<DataExport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemoMode) {
      // Demo data
      setPrivacySettings([
        {
          id: '1',
          settingKey: 'data_processing_consent',
          settingValue: { consent: true, timestamp: '2024-01-15T10:00:00Z' },
          description: 'Consent for processing personal data',
          isGDPRRelated: true,
          requiresConsent: true,
          consentGivenAt: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          settingKey: 'marketing_communications',
          settingValue: { email: true, sms: false, phone: false },
          description: 'Marketing communication preferences',
          isGDPRRelated: true,
          requiresConsent: true,
          consentGivenAt: '2024-01-15T10:00:00Z',
        },
        {
          id: '3',
          settingKey: 'profile_visibility',
          settingValue: { public: false, employees: true, managers: true },
          description: 'Profile visibility settings',
          isGDPRRelated: false,
          requiresConsent: false,
        },
        {
          id: '4',
          settingKey: 'cookie_preferences',
          settingValue: { necessary: true, functional: true, analytics: false, marketing: false },
          description: 'Cookie usage preferences',
          isGDPRRelated: true,
          requiresConsent: true,
          consentGivenAt: '2024-01-15T10:00:00Z',
        },
      ]);

      setDataExports([
        {
          id: '1',
          exportType: 'CUSTOMERS',
          format: 'CSV',
          status: 'COMPLETED',
          downloadUrl: '/api/data/download/1',
          expiresAt: '2024-01-22T10:00:00Z',
          recordCount: 150,
          fileSize: 25600,
          createdAt: '2024-01-15T10:00:00Z',
          user: { id: '1', name: 'John Smith', email: 'john@vervidflow.com' },
        },
        {
          id: '2',
          exportType: 'FULL_BACKUP',
          format: 'JSON',
          status: 'PROCESSING',
          recordCount: 1000,
          createdAt: '2024-01-15T14:30:00Z',
          user: { id: '1', name: 'John Smith', email: 'john@vervidflow.com' },
        },
      ]);

      setLoading(false);
    } else {
      fetchData();
    }
  }, [isDemoMode, activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'settings') {
        const response = await fetch('/api/privacy/settings');
        if (response.ok) {
          const data = await response.json();
          setPrivacySettings(data.settings);
        }
      } else if (activeTab === 'exports') {
        const response = await fetch('/api/data/export');
        if (response.ok) {
          const data = await response.json();
          setDataExports(data.exports);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultSettings = async () => {
    try {
      const response = await fetch('/api/privacy/settings', {
        method: 'PUT',
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error initializing settings:', error);
    }
  };

  const updatePrivacySetting = async (settingKey: string, settingValue: any) => {
    try {
      const response = await fetch('/api/privacy/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settingKey,
          settingValue,
          requiresConsent: true,
        }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error updating privacy setting:', error);
    }
  };

  const requestDataExport = async (exportType: string, format: string) => {
    try {
      const response = await fetch('/api/data/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exportType,
          format,
        }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error requesting data export:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PROCESSING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'FAILED':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getSettingIcon = (settingKey: string) => {
    switch (settingKey) {
      case 'marketing_communications':
        return <Mail className="h-5 w-5 text-blue-600" />;
      case 'profile_visibility':
        return <User className="h-5 w-5 text-green-600" />;
      case 'data_sharing_third_parties':
        return <Globe className="h-5 w-5 text-purple-600" />;
      case 'notification_preferences':
        return <Bell className="h-5 w-5 text-yellow-600" />;
      case 'cookie_preferences':
        return <Cookie className="h-5 w-5 text-orange-600" />;
      case 'activity_tracking':
        return <Eye className="h-5 w-5 text-indigo-600" />;
      default:
        return <Shield className="h-5 w-5 text-gray-600" />;
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Privacy & Data Management</h1>
          <p className="text-gray-600 mt-1">Manage your privacy settings and data exports</p>
        </div>
        <div className="flex items-center space-x-3">
          {activeTab === 'settings' && privacySettings.length === 0 && (
            <button
              onClick={initializeDefaultSettings}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Initialize Settings
            </button>
          )}
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Shield className="h-4 w-4 inline mr-2" />
            Privacy Settings
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'data'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Database className="h-4 w-4 inline mr-2" />
            Data Management
          </button>
          <button
            onClick={() => setActiveTab('exports')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'exports'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Download className="h-4 w-4 inline mr-2" />
            Data Exports ({dataExports.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {privacySettings.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Privacy Settings</h3>
              <p className="text-gray-600 mb-4">Initialize default privacy settings to get started.</p>
              <button
                onClick={initializeDefaultSettings}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Initialize Default Settings
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {privacySettings.map((setting) => (
                <motion.div
                  key={setting.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getSettingIcon(setting.settingKey)}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {setting.settingKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h3>
                        <p className="text-sm text-gray-600">{setting.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {setting.isGDPRRelated && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          GDPR
                        </span>
                      )}
                      {setting.requiresConsent && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                          Consent
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {setting.settingKey === 'marketing_communications' && (
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={setting.settingValue?.email || false}
                            onChange={(e) => updatePrivacySetting(setting.settingKey, {
                              ...setting.settingValue,
                              email: e.target.checked,
                            })}
                            className="mr-2 h-4 w-4 text-indigo-600 rounded border-gray-300"
                          />
                          <span className="text-sm">Email marketing</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={setting.settingValue?.sms || false}
                            onChange={(e) => updatePrivacySetting(setting.settingKey, {
                              ...setting.settingValue,
                              sms: e.target.checked,
                            })}
                            className="mr-2 h-4 w-4 text-indigo-600 rounded border-gray-300"
                          />
                          <span className="text-sm">SMS marketing</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={setting.settingValue?.phone || false}
                            onChange={(e) => updatePrivacySetting(setting.settingKey, {
                              ...setting.settingValue,
                              phone: e.target.checked,
                            })}
                            className="mr-2 h-4 w-4 text-indigo-600 rounded border-gray-300"
                          />
                          <span className="text-sm">Phone marketing</span>
                        </label>
                      </div>
                    )}

                    {setting.settingKey === 'profile_visibility' && (
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={setting.settingValue?.public || false}
                            onChange={(e) => updatePrivacySetting(setting.settingKey, {
                              ...setting.settingValue,
                              public: e.target.checked,
                            })}
                            className="mr-2 h-4 w-4 text-indigo-600 rounded border-gray-300"
                          />
                          <span className="text-sm">Public visibility</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={setting.settingValue?.employees || false}
                            onChange={(e) => updatePrivacySetting(setting.settingKey, {
                              ...setting.settingValue,
                              employees: e.target.checked,
                            })}
                            className="mr-2 h-4 w-4 text-indigo-600 rounded border-gray-300"
                          />
                          <span className="text-sm">Visible to employees</span>
                        </label>
                      </div>
                    )}

                    {setting.settingKey === 'cookie_preferences' && (
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={setting.settingValue?.necessary || false}
                            disabled
                            className="mr-2 h-4 w-4 text-indigo-600 rounded border-gray-300"
                          />
                          <span className="text-sm">Necessary cookies (required)</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={setting.settingValue?.functional || false}
                            onChange={(e) => updatePrivacySetting(setting.settingKey, {
                              ...setting.settingValue,
                              functional: e.target.checked,
                            })}
                            className="mr-2 h-4 w-4 text-indigo-600 rounded border-gray-300"
                          />
                          <span className="text-sm">Functional cookies</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={setting.settingValue?.analytics || false}
                            onChange={(e) => updatePrivacySetting(setting.settingKey, {
                              ...setting.settingValue,
                              analytics: e.target.checked,
                            })}
                            className="mr-2 h-4 w-4 text-indigo-600 rounded border-gray-300"
                          />
                          <span className="text-sm">Analytics cookies</span>
                        </label>
                      </div>
                    )}

                    {setting.settingKey === 'data_processing_consent' && (
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={setting.settingValue?.consent || false}
                          onChange={(e) => updatePrivacySetting(setting.settingKey, {
                            consent: e.target.checked,
                            timestamp: new Date().toISOString(),
                          })}
                          className="mr-2 h-4 w-4 text-indigo-600 rounded border-gray-300"
                        />
                        <span className="text-sm">I consent to data processing</span>
                      </label>
                    )}
                  </div>

                  {setting.consentGivenAt && (
                    <div className="mt-4 text-xs text-gray-500">
                      Consent given: {formatDate(setting.consentGivenAt)}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'data' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <Download className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Your Data</h3>
              <p className="text-gray-600 mb-4">Download a copy of your personal data in various formats.</p>
              <button
                onClick={() => requestDataExport('FULL_BACKUP', 'JSON')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Request Export
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <Upload className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Data</h3>
              <p className="text-gray-600 mb-4">Import your data from other platforms or backup files.</p>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Import Data
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Account</h3>
              <p className="text-gray-600 mb-4">Permanently delete your account and all associated data.</p>
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                Delete Account
              </button>
            </div>
          </div>

          {/* Quick Export Options */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Export Options</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { type: 'CUSTOMERS', label: 'Customers', icon: User },
                { type: 'APPOINTMENTS', label: 'Appointments', icon: Clock },
                { type: 'INVOICES', label: 'Invoices', icon: FileText },
                { type: 'MESSAGES', label: 'Messages', icon: MessageSquare },
              ].map((option) => (
                <button
                  key={option.type}
                  onClick={() => requestDataExport(option.type, 'CSV')}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <option.icon className="h-8 w-8 text-gray-600 mb-2" />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'exports' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Data Export History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Export Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Format
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Records
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dataExports.map((exportItem) => (
                  <tr key={exportItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {exportItem.exportType.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {exportItem.format}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(exportItem.status)}`}>
                        {getStatusIcon(exportItem.status)}
                        <span className="ml-1">{exportItem.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {exportItem.recordCount?.toLocaleString() || 'N/A'}
                      </div>
                      {exportItem.fileSize && (
                        <div className="text-sm text-gray-500">
                          {formatFileSize(exportItem.fileSize)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(exportItem.createdAt)}
                      {exportItem.expiresAt && (
                        <div className="text-xs text-gray-500">
                          Expires: {formatDate(exportItem.expiresAt)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {exportItem.status === 'COMPLETED' && exportItem.downloadUrl && (
                        <a
                          href={exportItem.downloadUrl}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </a>
                      )}
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
