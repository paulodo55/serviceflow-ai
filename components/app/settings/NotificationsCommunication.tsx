'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Clock,
  Users,
  Calendar,
  DollarSign,
  AlertTriangle,
  Save,
  Volume2,
  VolumeX
} from 'lucide-react';
import SettingsCard from './SettingsCard';
import ToggleSwitch from './ToggleSwitch';

export default function NotificationsCommunication() {
  const [notifications, setNotifications] = useState({
    // Email Notifications
    email: {
      enabled: true,
      newCustomers: true,
      appointments: true,
      payments: true,
      reminders: true,
      systemUpdates: false,
      marketing: false,
      digest: 'daily'
    },
    // Push Notifications
    push: {
      enabled: true,
      appointments: true,
      messages: true,
      urgentAlerts: true,
      reminders: true,
      marketing: false
    },
    // In-App Notifications
    inApp: {
      enabled: true,
      sound: true,
      desktop: true,
      position: 'top-right',
      duration: 5000
    },
    // SMS Notifications
    sms: {
      enabled: false,
      appointments: false,
      urgentOnly: true,
      phoneNumber: '+1 (555) 123-4567'
    },
    // Communication Preferences
    communication: {
      defaultChannel: 'email',
      businessHours: {
        enabled: true,
        start: '09:00',
        end: '17:00',
        timezone: 'America/New_York'
      },
      autoResponder: {
        enabled: false,
        message: 'Thank you for your message. We will get back to you within 24 hours.'
      }
    }
  });

  const handleNotificationChange = (category: string, field: string, value: any) => {
    setNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleNestedChange = (category: string, subcategory: string, field: string, value: any) => {
    setNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [subcategory]: {
          ...(prev[category as keyof typeof prev] as any)[subcategory],
          [field]: value
        }
      }
    }));
  };

  const notificationTypes = [
    {
      key: 'newCustomers',
      label: 'New Customers',
      description: 'When new customers sign up or are added',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      key: 'appointments',
      label: 'Appointments',
      description: 'Booking confirmations, changes, and reminders',
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      key: 'payments',
      label: 'Payments',
      description: 'Payment confirmations and failed transactions',
      icon: DollarSign,
      color: 'text-yellow-600'
    },
    {
      key: 'messages',
      label: 'Messages',
      description: 'New messages from customers',
      icon: MessageSquare,
      color: 'text-purple-600'
    },
    {
      key: 'reminders',
      label: 'Reminders',
      description: 'Follow-ups and scheduled reminders',
      icon: Clock,
      color: 'text-orange-600'
    },
    {
      key: 'urgentAlerts',
      label: 'Urgent Alerts',
      description: 'System issues and critical notifications',
      icon: AlertTriangle,
      color: 'text-red-600'
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Email Notifications */}
      <SettingsCard
        title="Email Notifications"
        description="Configure when and how you receive email notifications"
        icon={Mail}
      >
        <div className="space-y-6">
          <ToggleSwitch
            enabled={notifications.email.enabled}
            onChange={(enabled) => handleNotificationChange('email', 'enabled', enabled)}
            label="Enable Email Notifications"
            description="Receive notifications via email"
          />

          {notifications.email.enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 pl-4 border-l-2 border-gray-200"
            >
              {notificationTypes.map((type) => (
                <div key={type.key} className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <type.icon className={`h-4 w-4 ${type.color}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{type.label}</h4>
                      <p className="text-xs text-gray-600">{type.description}</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={notifications.email[type.key as keyof typeof notifications.email] as boolean}
                    onChange={(enabled) => handleNotificationChange('email', type.key, enabled)}
                    size="sm"
                  />
                </div>
              ))}

              <div className="pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Digest Frequency
                </label>
                <select
                  value={notifications.email.digest}
                  onChange={(e) => handleNotificationChange('email', 'digest', e.target.value)}
                  className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="realtime">Real-time</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="never">Never</option>
                </select>
              </div>
            </motion.div>
          )}
        </div>
      </SettingsCard>

      {/* Push Notifications */}
      <SettingsCard
        title="Push Notifications"
        description="Browser and mobile push notification settings"
        icon={Smartphone}
      >
        <div className="space-y-6">
          <ToggleSwitch
            enabled={notifications.push.enabled}
            onChange={(enabled) => handleNotificationChange('push', 'enabled', enabled)}
            label="Enable Push Notifications"
            description="Receive notifications on your devices"
          />

          {notifications.push.enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 pl-4 border-l-2 border-gray-200"
            >
              {notificationTypes.slice(1, 5).map((type) => (
                <div key={type.key} className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <type.icon className={`h-4 w-4 ${type.color}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{type.label}</h4>
                      <p className="text-xs text-gray-600">{type.description}</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={notifications.push[type.key as keyof typeof notifications.push] as boolean}
                    onChange={(enabled) => handleNotificationChange('push', type.key, enabled)}
                    size="sm"
                  />
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </SettingsCard>

      {/* In-App Notifications */}
      <SettingsCard
        title="In-App Notifications"
        description="Configure notifications within the application"
        icon={Bell}
      >
        <div className="space-y-6">
          <ToggleSwitch
            enabled={notifications.inApp.enabled}
            onChange={(enabled) => handleNotificationChange('inApp', 'enabled', enabled)}
            label="Enable In-App Notifications"
            description="Show notifications while using the application"
          />

          {notifications.inApp.enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-6 pl-4 border-l-2 border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <ToggleSwitch
                    enabled={notifications.inApp.sound}
                    onChange={(enabled) => handleNotificationChange('inApp', 'sound', enabled)}
                    label="Sound Effects"
                    description="Play sound for notifications"
                  />
                </div>
                <div>
                  <ToggleSwitch
                    enabled={notifications.inApp.desktop}
                    onChange={(enabled) => handleNotificationChange('inApp', 'desktop', enabled)}
                    label="Desktop Notifications"
                    description="Show notifications on desktop"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Position
                  </label>
                  <select
                    value={notifications.inApp.position}
                    onChange={(e) => handleNotificationChange('inApp', 'position', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="top-right">Top Right</option>
                    <option value="top-left">Top Left</option>
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="top-center">Top Center</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Duration (seconds)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={notifications.inApp.duration / 1000}
                    onChange={(e) => handleNotificationChange('inApp', 'duration', parseInt(e.target.value) * 1000)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>1s</span>
                    <span>{notifications.inApp.duration / 1000}s</span>
                    <span>10s</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </SettingsCard>

      {/* SMS Notifications */}
      <SettingsCard
        title="SMS Notifications"
        description="Text message notification preferences"
        icon={MessageSquare}
      >
        <div className="space-y-6">
          <ToggleSwitch
            enabled={notifications.sms.enabled}
            onChange={(enabled) => handleNotificationChange('sms', 'enabled', enabled)}
            label="Enable SMS Notifications"
            description="Receive notifications via text message"
          />

          {notifications.sms.enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 pl-4 border-l-2 border-gray-200"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={notifications.sms.phoneNumber}
                  onChange={(e) => handleNotificationChange('sms', 'phoneNumber', e.target.value)}
                  className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <ToggleSwitch
                enabled={notifications.sms.urgentOnly}
                onChange={(enabled) => handleNotificationChange('sms', 'urgentOnly', enabled)}
                label="Urgent Notifications Only"
                description="Only send SMS for critical alerts"
              />
            </motion.div>
          )}
        </div>
      </SettingsCard>

      {/* Communication Preferences */}
      <SettingsCard
        title="Communication Preferences"
        description="Set your preferred communication methods and business hours"
        icon={Users}
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Communication Channel
            </label>
            <select
              value={notifications.communication.defaultChannel}
              onChange={(e) => handleNotificationChange('communication', 'defaultChannel', e.target.value)}
              className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="phone">Phone Call</option>
              <option value="app">In-App Message</option>
            </select>
          </div>

          <div className="space-y-4">
            <ToggleSwitch
              enabled={notifications.communication.businessHours.enabled}
              onChange={(enabled) => handleNestedChange('communication', 'businessHours', 'enabled', enabled)}
              label="Business Hours Only"
              description="Only send non-urgent notifications during business hours"
            />

            {notifications.communication.businessHours.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-gray-200"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={notifications.communication.businessHours.start}
                    onChange={(e) => handleNestedChange('communication', 'businessHours', 'start', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={notifications.communication.businessHours.end}
                    onChange={(e) => handleNestedChange('communication', 'businessHours', 'end', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </motion.div>
            )}
          </div>

          <div className="space-y-4">
            <ToggleSwitch
              enabled={notifications.communication.autoResponder.enabled}
              onChange={(enabled) => handleNestedChange('communication', 'autoResponder', 'enabled', enabled)}
              label="Auto-Responder"
              description="Send automatic replies to new messages"
            />

            {notifications.communication.autoResponder.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pl-4 border-l-2 border-gray-200"
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auto-Response Message
                </label>
                <textarea
                  value={notifications.communication.autoResponder.message}
                  onChange={(e) => handleNestedChange('communication', 'autoResponder', 'message', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your automatic response message..."
                />
              </motion.div>
            )}
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
          <span>Save Preferences</span>
        </button>
      </motion.div>
    </div>
  );
}
