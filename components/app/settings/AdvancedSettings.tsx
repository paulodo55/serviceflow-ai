'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Database, 
  Server, 
  Code, 
  Filter,
  Eye,
  EyeOff,
  Users,
  Shield,
  Zap,
  Download,
  Upload,
  RefreshCw,
  Save,
  AlertTriangle,
  CheckCircle,
  Info,
  HardDrive,
  Cloud
} from 'lucide-react';
import SettingsCard from './SettingsCard';
import ToggleSwitch from './ToggleSwitch';

export default function AdvancedSettings() {
  const [advancedSettings, setAdvancedSettings] = useState({
    system: {
      debugMode: false,
      verboseLogging: false,
      performanceMode: 'balanced',
      cacheEnabled: true,
      compressionEnabled: true,
      maintenanceMode: false
    },
    customFields: {
      customerFields: [
        { id: '1', name: 'Industry', type: 'select', visible: true, required: false },
        { id: '2', name: 'Company Size', type: 'number', visible: true, required: false },
        { id: '3', name: 'Lead Source', type: 'text', visible: true, required: true }
      ],
      appointmentFields: [
        { id: '4', name: 'Service Type', type: 'select', visible: true, required: true },
        { id: '5', name: 'Estimated Duration', type: 'number', visible: true, required: false }
      ]
    },
    userRoles: [
      {
        id: '1',
        name: 'Administrator',
        permissions: ['read', 'write', 'delete', 'admin'],
        userCount: 2,
        description: 'Full system access'
      },
      {
        id: '2',
        name: 'Manager',
        permissions: ['read', 'write'],
        userCount: 5,
        description: 'Can manage customers and appointments'
      },
      {
        id: '3',
        name: 'Technician',
        permissions: ['read'],
        userCount: 12,
        description: 'View-only access to schedules'
      }
    ],
    pipeline: {
      stages: [
        { id: '1', name: 'Lead', color: '#3B82F6', order: 1 },
        { id: '2', name: 'Qualified', color: '#10B981', order: 2 },
        { id: '3', name: 'Proposal', color: '#F59E0B', order: 3 },
        { id: '4', name: 'Negotiation', color: '#EF4444', order: 4 },
        { id: '5', name: 'Closed Won', color: '#818cf8', order: 5 }
      ],
      autoAdvance: true,
      probabilityTracking: true
    },
    backup: {
      autoBackup: true,
      frequency: 'daily',
      retention: '30days',
      includeFiles: true,
      compression: true,
      encryption: true,
      lastBackup: '2024-09-23T02:00:00Z'
    },
    performance: {
      cacheSize: '512MB',
      sessionTimeout: '30min',
      maxFileUpload: '50MB',
      concurrentUsers: '100',
      databaseConnections: '20'
    }
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newCustomField, setNewCustomField] = useState({
    name: '',
    type: 'text',
    entity: 'customer',
    visible: true,
    required: false
  });

  const handleSettingChange = (category: string, field: string, value: any) => {
    setAdvancedSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const addCustomField = () => {
    if (newCustomField.name) {
      const field = {
        id: Date.now().toString(),
        ...newCustomField
      };
      
      const fieldCategory = newCustomField.entity === 'customer' ? 'customerFields' : 'appointmentFields';
      
      setAdvancedSettings(prev => ({
        ...prev,
        customFields: {
          ...prev.customFields,
          [fieldCategory]: [...prev.customFields[fieldCategory], field]
        }
      }));
      
      setNewCustomField({
        name: '',
        type: 'text',
        entity: 'customer',
        visible: true,
        required: false
      });
    }
  };

  const removeCustomField = (fieldId: string, category: 'customerFields' | 'appointmentFields') => {
    setAdvancedSettings(prev => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [category]: prev.customFields[category].filter(field => field.id !== fieldId)
      }
    }));
  };

  const toggleFieldVisibility = (fieldId: string, category: 'customerFields' | 'appointmentFields') => {
    setAdvancedSettings(prev => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [category]: prev.customFields[category].map(field =>
          field.id === fieldId ? { ...field, visible: !field.visible } : field
        )
      }
    }));
  };

  const exportSettings = () => {
    const settingsData = JSON.stringify(advancedSettings, null, 2);
    const blob = new Blob([settingsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'serviceflow-settings.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* System Configuration */}
      <SettingsCard
        title="System Configuration"
        description="Advanced system settings and performance tuning"
        icon={Server}
      >
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Advanced Settings</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  These settings can affect system performance. Change only if you understand the implications.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <ToggleSwitch
              enabled={advancedSettings.system.debugMode}
              onChange={(enabled) => handleSettingChange('system', 'debugMode', enabled)}
              label="Debug Mode"
              description="Enable detailed logging for troubleshooting"
            />

            <ToggleSwitch
              enabled={advancedSettings.system.verboseLogging}
              onChange={(enabled) => handleSettingChange('system', 'verboseLogging', enabled)}
              label="Verbose Logging"
              description="Log all system activities (may impact performance)"
            />

            <ToggleSwitch
              enabled={advancedSettings.system.cacheEnabled}
              onChange={(enabled) => handleSettingChange('system', 'cacheEnabled', enabled)}
              label="Enable Caching"
              description="Cache frequently accessed data for better performance"
            />

            <ToggleSwitch
              enabled={advancedSettings.system.compressionEnabled}
              onChange={(enabled) => handleSettingChange('system', 'compressionEnabled', enabled)}
              label="Enable Compression"
              description="Compress data transfers to reduce bandwidth usage"
            />

            <ToggleSwitch
              enabled={advancedSettings.system.maintenanceMode}
              onChange={(enabled) => handleSettingChange('system', 'maintenanceMode', enabled)}
              label="Maintenance Mode"
              description="Temporarily disable access for system maintenance"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Performance Mode
            </label>
            <select
              value={advancedSettings.system.performanceMode}
              onChange={(e) => handleSettingChange('system', 'performanceMode', e.target.value)}
              className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="eco">Eco (Low resource usage)</option>
              <option value="balanced">Balanced (Recommended)</option>
              <option value="performance">Performance (High speed)</option>
              <option value="maximum">Maximum (All resources)</option>
            </select>
          </div>
        </div>
      </SettingsCard>

      {/* Custom Fields */}
      <SettingsCard
        title="Custom Fields"
        description="Add custom fields to capture additional information"
        icon={Code}
      >
        <div className="space-y-6">
          {/* Add New Field */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Add Custom Field</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newCustomField.name}
                  onChange={(e) => setNewCustomField(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Field name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newCustomField.type}
                  onChange={(e) => setNewCustomField(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="email">Email</option>
                  <option value="date">Date</option>
                  <option value="select">Select</option>
                  <option value="checkbox">Checkbox</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entity</label>
                <select
                  value={newCustomField.entity}
                  onChange={(e) => setNewCustomField(prev => ({ ...prev, entity: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="customer">Customer</option>
                  <option value="appointment">Appointment</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={addCustomField}
                  className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Field
                </button>
              </div>
            </div>
          </div>

          {/* Customer Fields */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Customer Fields</h4>
            <div className="space-y-2">
              {advancedSettings.customFields.customerFields.map((field) => (
                <div key={field.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleFieldVisibility(field.id, 'customerFields')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {field.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <div>
                      <span className="text-sm font-medium text-gray-900">{field.name}</span>
                      <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        {field.type}
                      </span>
                      {field.required && (
                        <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-600 rounded">
                          Required
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeCustomField(field.id, 'customerFields')}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Code className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Appointment Fields */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Appointment Fields</h4>
            <div className="space-y-2">
              {advancedSettings.customFields.appointmentFields.map((field) => (
                <div key={field.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleFieldVisibility(field.id, 'appointmentFields')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {field.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <div>
                      <span className="text-sm font-medium text-gray-900">{field.name}</span>
                      <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        {field.type}
                      </span>
                      {field.required && (
                        <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-600 rounded">
                          Required
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeCustomField(field.id, 'appointmentFields')}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Code className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* User Roles & Permissions */}
      <SettingsCard
        title="User Roles & Permissions"
        description="Manage user roles and their permissions (Read-only)"
        icon={Users}
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">Role Management</h4>
                <p className="text-sm text-blue-700 mt-1">
                  User roles are managed by administrators. Contact your system administrator to modify roles.
                </p>
              </div>
            </div>
          </div>

          {advancedSettings.userRoles.map((role) => (
            <div key={role.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-sm font-medium text-gray-900">{role.name}</h3>
                  <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
                    {role.userCount} users
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{role.description}</p>
                <div className="flex space-x-1">
                  {role.permissions.map((permission) => (
                    <span key={permission} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
              <Shield className="h-5 w-5 text-gray-400" />
            </div>
          ))}
        </div>
      </SettingsCard>

      {/* Performance Settings */}
      <SettingsCard
        title="Performance Settings"
        description="Configure system performance and resource limits"
        icon={Zap}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cache Size
            </label>
            <select
              value={advancedSettings.performance.cacheSize}
              onChange={(e) => handleSettingChange('performance', 'cacheSize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="128MB">128 MB</option>
              <option value="256MB">256 MB</option>
              <option value="512MB">512 MB</option>
              <option value="1GB">1 GB</option>
              <option value="2GB">2 GB</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout
            </label>
            <select
              value={advancedSettings.performance.sessionTimeout}
              onChange={(e) => handleSettingChange('performance', 'sessionTimeout', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="15min">15 minutes</option>
              <option value="30min">30 minutes</option>
              <option value="1hour">1 hour</option>
              <option value="4hours">4 hours</option>
              <option value="8hours">8 hours</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max File Upload Size
            </label>
            <select
              value={advancedSettings.performance.maxFileUpload}
              onChange={(e) => handleSettingChange('performance', 'maxFileUpload', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="10MB">10 MB</option>
              <option value="25MB">25 MB</option>
              <option value="50MB">50 MB</option>
              <option value="100MB">100 MB</option>
              <option value="250MB">250 MB</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Concurrent Users Limit
            </label>
            <select
              value={advancedSettings.performance.concurrentUsers}
              onChange={(e) => handleSettingChange('performance', 'concurrentUsers', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="50">50 users</option>
              <option value="100">100 users</option>
              <option value="250">250 users</option>
              <option value="500">500 users</option>
              <option value="1000">1000 users</option>
            </select>
          </div>
        </div>
      </SettingsCard>

      {/* Backup & Recovery */}
      <SettingsCard
        title="Backup & Recovery"
        description="Configure automatic backups and data recovery options"
        icon={HardDrive}
      >
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Last backup: {formatDate(advancedSettings.backup.lastBackup)}
                </p>
                <p className="text-sm text-green-700">
                  Automatic backups are running successfully
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <ToggleSwitch
              enabled={advancedSettings.backup.autoBackup}
              onChange={(enabled) => handleSettingChange('backup', 'autoBackup', enabled)}
              label="Automatic Backups"
              description="Automatically backup your data at scheduled intervals"
            />

            <ToggleSwitch
              enabled={advancedSettings.backup.includeFiles}
              onChange={(enabled) => handleSettingChange('backup', 'includeFiles', enabled)}
              label="Include File Attachments"
              description="Include uploaded files in backups (increases backup size)"
            />

            <ToggleSwitch
              enabled={advancedSettings.backup.compression}
              onChange={(enabled) => handleSettingChange('backup', 'compression', enabled)}
              label="Backup Compression"
              description="Compress backups to save storage space"
            />

            <ToggleSwitch
              enabled={advancedSettings.backup.encryption}
              onChange={(enabled) => handleSettingChange('backup', 'encryption', enabled)}
              label="Backup Encryption"
              description="Encrypt backups for additional security"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup Frequency
              </label>
              <select
                value={advancedSettings.backup.frequency}
                onChange={(e) => handleSettingChange('backup', 'frequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="hourly">Every Hour</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retention Period
              </label>
              <select
                value={advancedSettings.backup.retention}
                onChange={(e) => handleSettingChange('backup', 'retention', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7days">7 days</option>
                <option value="30days">30 days</option>
                <option value="90days">90 days</option>
                <option value="1year">1 year</option>
                <option value="indefinite">Indefinite</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Cloud className="h-4 w-4" />
              <span>Create Backup Now</span>
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Download Latest Backup</span>
            </button>
          </div>
        </div>
      </SettingsCard>

      {/* Import/Export */}
      <SettingsCard
        title="Import/Export Settings"
        description="Backup and restore your configuration settings"
        icon={Database}
      >
        <div className="space-y-4">
          <div className="flex space-x-3">
            <button
              onClick={exportSettings}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export Settings</span>
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Import Settings</span>
            </button>
            <button className="px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors flex items-center space-x-2">
              <RefreshCw className="h-4 w-4" />
              <span>Reset to Defaults</span>
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Export your settings to create a backup or transfer to another instance. 
            Import settings to restore a previous configuration.
          </p>
        </div>
      </SettingsCard>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-end space-x-3 pt-6 border-t border-gray-200"
      >
        <button className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors">
          Cancel
        </button>
        <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>Save Advanced Settings</span>
        </button>
      </motion.div>
    </div>
  );
}
