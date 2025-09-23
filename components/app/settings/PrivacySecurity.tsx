'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Key, 
  Smartphone, 
  Eye, 
  Download, 
  Trash2,
  Lock,
  Unlock,
  Monitor,
  Globe,
  Clock,
  Save,
  AlertTriangle,
  CheckCircle,
  Copy,
  RefreshCw
} from 'lucide-react';
import SettingsCard from './SettingsCard';
import ToggleSwitch from './ToggleSwitch';

export default function PrivacySecurity() {
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: {
      enabled: false,
      method: 'app',
      backupCodes: [],
      phoneNumber: '+1 (555) 123-4567'
    },
    passwordSettings: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      lastChanged: '2024-09-15',
      requireChange: 90
    },
    privacy: {
      profileVisibility: 'team',
      activityTracking: true,
      dataCollection: true,
      thirdPartySharing: false,
      marketingEmails: false
    },
    sessions: [
      {
        id: '1',
        device: 'MacBook Pro',
        browser: 'Chrome 118',
        location: 'New York, NY',
        lastActive: '2024-09-23T14:30:00Z',
        current: true
      },
      {
        id: '2',
        device: 'iPhone 15',
        browser: 'Safari Mobile',
        location: 'New York, NY',
        lastActive: '2024-09-23T12:15:00Z',
        current: false
      },
      {
        id: '3',
        device: 'Windows PC',
        browser: 'Edge 117',
        location: 'Brooklyn, NY',
        lastActive: '2024-09-22T18:45:00Z',
        current: false
      }
    ],
    apiKeys: [
      {
        id: '1',
        name: 'Mobile App Integration',
        key: 'sk_live_51H7...',
        created: '2024-09-01',
        lastUsed: '2024-09-23',
        permissions: ['read', 'write']
      },
      {
        id: '2',
        name: 'Webhook Endpoint',
        key: 'sk_live_51H8...',
        created: '2024-08-15',
        lastUsed: '2024-09-20',
        permissions: ['read']
      }
    ],
    dataRetention: {
      customerData: '7years',
      activityLogs: '2years',
      backups: '1year',
      autoDelete: true
    }
  });

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showApiKey, setShowApiKey] = useState<string | null>(null);

  const handleSettingChange = (category: string, field: string, value: any) => {
    setSecuritySettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setSecuritySettings(prev => ({
      ...prev,
      passwordSettings: {
        ...prev.passwordSettings,
        [field]: value
      }
    }));

    if (field === 'newPassword') {
      // Calculate password strength
      let strength = 0;
      if (value.length >= 8) strength++;
      if (/[A-Z]/.test(value)) strength++;
      if (/[a-z]/.test(value)) strength++;
      if (/[0-9]/.test(value)) strength++;
      if (/[^A-Za-z0-9]/.test(value)) strength++;
      setPasswordStrength(strength);
    }
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 2) return 'bg-red-500';
    if (strength < 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength < 2) return 'Weak';
    if (strength < 4) return 'Medium';
    return 'Strong';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generateBackupCodes = () => {
    const codes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substr(2, 8).toUpperCase()
    );
    handleSettingChange('twoFactorAuth', 'backupCodes', codes);
  };

  const revokeSession = (sessionId: string) => {
    setSecuritySettings(prev => ({
      ...prev,
      sessions: prev.sessions.filter(session => session.id !== sessionId)
    }));
  };

  const generateApiKey = () => {
    const newKey = {
      id: Date.now().toString(),
      name: 'New API Key',
      key: 'sk_live_' + Math.random().toString(36).substr(2, 24),
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      permissions: ['read']
    };
    
    setSecuritySettings(prev => ({
      ...prev,
      apiKeys: [...prev.apiKeys, newKey]
    }));
  };

  const revokeApiKey = (keyId: string) => {
    setSecuritySettings(prev => ({
      ...prev,
      apiKeys: prev.apiKeys.filter(key => key.id !== keyId)
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Two-Factor Authentication */}
      <SettingsCard
        title="Two-Factor Authentication"
        description="Add an extra layer of security to your account"
        icon={Shield}
      >
        <div className="space-y-6">
          <ToggleSwitch
            enabled={securitySettings.twoFactorAuth.enabled}
            onChange={(enabled) => {
              handleSettingChange('twoFactorAuth', 'enabled', enabled);
              if (enabled && securitySettings.twoFactorAuth.backupCodes.length === 0) {
                generateBackupCodes();
              }
            }}
            label="Enable Two-Factor Authentication"
            description="Require a second form of authentication when signing in"
          />

          {securitySettings.twoFactorAuth.enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-6 pl-4 border-l-2 border-gray-200"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Authentication Method
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="app"
                      checked={securitySettings.twoFactorAuth.method === 'app'}
                      onChange={(e) => handleSettingChange('twoFactorAuth', 'method', e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4 text-gray-600" />
                      <span>Authenticator App (Recommended)</span>
                    </div>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="sms"
                      checked={securitySettings.twoFactorAuth.method === 'sms'}
                      onChange={(e) => handleSettingChange('twoFactorAuth', 'method', e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex items-center space-x-2">
                      <span>SMS Text Message</span>
                    </div>
                  </label>
                </div>
              </div>

              {securitySettings.twoFactorAuth.method === 'sms' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={securitySettings.twoFactorAuth.phoneNumber}
                    onChange={(e) => handleSettingChange('twoFactorAuth', 'phoneNumber', e.target.value)}
                    className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {securitySettings.twoFactorAuth.backupCodes.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-yellow-800 mb-2">
                        Backup Recovery Codes
                      </h4>
                      <p className="text-sm text-yellow-700 mb-3">
                        Save these codes in a safe place. Each code can only be used once.
                      </p>
                      <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                        {securitySettings.twoFactorAuth.backupCodes.map((code, index) => (
                          <div key={index} className="bg-white p-2 rounded border">
                            {code}
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={generateBackupCodes}
                        className="mt-3 text-sm text-yellow-700 hover:text-yellow-900 font-medium"
                      >
                        Generate New Codes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </SettingsCard>

      {/* Password Settings */}
      <SettingsCard
        title="Password Settings"
        description="Update your password and security preferences"
        icon={Key}
      >
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Password last changed: {formatDate(securitySettings.passwordSettings.lastChanged)}
                </p>
                <p className="text-sm text-blue-700">
                  We recommend changing your password every 90 days
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={securitySettings.passwordSettings.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={securitySettings.passwordSettings.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {securitySettings.passwordSettings.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{getPasswordStrengthText(passwordStrength)}</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={securitySettings.passwordSettings.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p className="mb-1">Password requirements:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>At least 8 characters long</li>
              <li>Include uppercase and lowercase letters</li>
              <li>Include at least one number</li>
              <li>Include at least one special character</li>
            </ul>
          </div>
        </div>
      </SettingsCard>

      {/* Active Sessions */}
      <SettingsCard
        title="Active Sessions"
        description="Manage your active login sessions across devices"
        icon={Monitor}
      >
        <div className="space-y-4">
          {securitySettings.sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Monitor className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-gray-900">{session.device}</h4>
                    {session.current && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{session.browser}</p>
                  <p className="text-xs text-gray-500">
                    {session.location} • Last active: {formatDate(session.lastActive)}
                  </p>
                </div>
              </div>
              {!session.current && (
                <button
                  onClick={() => revokeSession(session.id)}
                  className="px-3 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 rounded-lg transition-colors"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </SettingsCard>

      {/* API Keys */}
      <SettingsCard
        title="API Keys"
        description="Manage API keys for third-party integrations"
        icon={Key}
        actions={
          <button
            onClick={generateApiKey}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Generate New Key
          </button>
        }
      >
        <div className="space-y-4">
          {securitySettings.apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{apiKey.name}</h4>
                  <div className="flex space-x-1">
                    {apiKey.permissions.map((perm) => (
                      <span key={perm} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono">
                      {showApiKey === apiKey.id ? apiKey.key : '••••••••••••••••••••••••'}
                    </span>
                    <button
                      onClick={() => setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showApiKey === apiKey.id ? <Eye className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Created: {apiKey.created} • Last used: {apiKey.lastUsed}
                </p>
              </div>
              <button
                onClick={() => revokeApiKey(apiKey.id)}
                className="px-3 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 rounded-lg transition-colors"
              >
                Revoke
              </button>
            </div>
          ))}
        </div>
      </SettingsCard>

      {/* Privacy Settings */}
      <SettingsCard
        title="Privacy Settings"
        description="Control your data and privacy preferences"
        icon={Eye}
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Visibility
            </label>
            <select
              value={securitySettings.privacy.profileVisibility}
              onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
              className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="public">Public</option>
              <option value="team">Team Only</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="space-y-4">
            <ToggleSwitch
              enabled={securitySettings.privacy.activityTracking}
              onChange={(enabled) => handleSettingChange('privacy', 'activityTracking', enabled)}
              label="Activity Tracking"
              description="Allow tracking of your activity for analytics"
            />

            <ToggleSwitch
              enabled={securitySettings.privacy.dataCollection}
              onChange={(enabled) => handleSettingChange('privacy', 'dataCollection', enabled)}
              label="Usage Data Collection"
              description="Help improve our service by sharing usage data"
            />

            <ToggleSwitch
              enabled={securitySettings.privacy.thirdPartySharing}
              onChange={(enabled) => handleSettingChange('privacy', 'thirdPartySharing', enabled)}
              label="Third-Party Data Sharing"
              description="Allow sharing data with trusted partners"
            />

            <ToggleSwitch
              enabled={securitySettings.privacy.marketingEmails}
              onChange={(enabled) => handleSettingChange('privacy', 'marketingEmails', enabled)}
              label="Marketing Communications"
              description="Receive marketing emails and product updates"
            />
          </div>
        </div>
      </SettingsCard>

      {/* Data Export & Deletion */}
      <SettingsCard
        title="Data Management"
        description="Export or delete your data"
        icon={Download}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Export Your Data</h4>
              <p className="text-sm text-gray-600">
                Download a copy of all your data in JSON format
              </p>
              <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export Data</span>
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Delete Account</h4>
              <p className="text-sm text-gray-600">
                Permanently delete your account and all associated data
              </p>
              <button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
                <Trash2 className="h-4 w-4" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Data Retention Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Customer Data</label>
                <select
                  value={securitySettings.dataRetention.customerData}
                  onChange={(e) => handleSettingChange('dataRetention', 'customerData', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="1year">1 Year</option>
                  <option value="3years">3 Years</option>
                  <option value="5years">5 Years</option>
                  <option value="7years">7 Years</option>
                  <option value="indefinite">Indefinite</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Activity Logs</label>
                <select
                  value={securitySettings.dataRetention.activityLogs}
                  onChange={(e) => handleSettingChange('dataRetention', 'activityLogs', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="6months">6 Months</option>
                  <option value="1year">1 Year</option>
                  <option value="2years">2 Years</option>
                  <option value="5years">5 Years</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Backups</label>
                <select
                  value={securitySettings.dataRetention.backups}
                  onChange={(e) => handleSettingChange('dataRetention', 'backups', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="3months">3 Months</option>
                  <option value="6months">6 Months</option>
                  <option value="1year">1 Year</option>
                  <option value="2years">2 Years</option>
                </select>
              </div>
            </div>
          </div>
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
          <span>Save Security Settings</span>
        </button>
      </motion.div>
    </div>
  );
}
