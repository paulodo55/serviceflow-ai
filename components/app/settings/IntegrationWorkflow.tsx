'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { 
  Zap, 
  Calendar, 
  Mail, 
  MessageSquare, 
  CreditCard,
  Database,
  Globe,
  Webhook,
  Settings as SettingsIcon,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Edit3,
  Save,
  RefreshCw
} from 'lucide-react';
import SettingsCard from './SettingsCard';
import ToggleSwitch from './ToggleSwitch';

export default function IntegrationWorkflow() {
  type IntegrationSettings = {
    syncDirection?: 'bidirectional' | 'one-way' | string;
    autoCreate?: boolean;
    notifications?: boolean;
    autoReply?: boolean;
    templates?: boolean;
    tracking?: boolean;
    autoInvoice?: boolean;
    webhooks?: boolean;
    refunds?: boolean;
    autoSync?: boolean;
  };

  type ConnectedIntegration = {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    status: 'connected';
    lastSync: string;
    settings: IntegrationSettings;
  };

  type AvailableIntegration = {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    category: string;
  };

  type IntegrationState = {
    connected: ConnectedIntegration[];
    available: AvailableIntegration[];
  };

  const initialIntegrations: IntegrationState = {
    connected: [
      {
        id: '1',
        name: 'Google Calendar',
        description: 'Sync appointments and events',
        icon: Calendar,
        status: 'connected',
        lastSync: '2024-09-23T14:30:00Z',
        settings: {
          syncDirection: 'bidirectional',
          autoCreate: true,
          notifications: true
        }
      },
      {
        id: '2',
        name: 'Gmail',
        description: 'Email integration and automation',
        icon: Mail,
        status: 'connected',
        lastSync: '2024-09-23T14:25:00Z',
        settings: {
          autoReply: false,
          templates: true,
          tracking: true
        }
      },
      {
        id: '3',
        name: 'Stripe',
        description: 'Payment processing',
        icon: CreditCard,
        status: 'connected',
        lastSync: '2024-09-23T14:20:00Z',
        settings: {
          autoInvoice: true,
          webhooks: true,
          refunds: true
        }
      }
    ],
    available: [
      {
        id: '4',
        name: 'QuickBooks',
        description: 'Accounting and bookkeeping',
        icon: Database,
        category: 'Accounting'
      },
      {
        id: '5',
        name: 'Mailchimp',
        description: 'Email marketing automation',
        icon: Mail,
        category: 'Marketing'
      },
      {
        id: '6',
        name: 'Slack',
        description: 'Team communication',
        icon: MessageSquare,
        category: 'Communication'
      },
      {
        id: '7',
        name: 'Zapier',
        description: 'Workflow automation',
        icon: Zap,
        category: 'Automation'
      },
      {
        id: '8',
        name: 'Microsoft Outlook',
        description: 'Email and calendar sync',
        icon: Mail,
        category: 'Productivity'
      }
    ]
  };

  const [integrations, setIntegrations] = useState<IntegrationState>(initialIntegrations);

  const [webhooks, setWebhooks] = useState([
    {
      id: '1',
      name: 'Customer Created',
      url: 'https://api.example.com/webhooks/customer-created',
      events: ['customer.created', 'customer.updated'],
      status: 'active',
      lastTriggered: '2024-09-23T12:00:00Z',
      successRate: 98.5
    },
    {
      id: '2',
      name: 'Payment Webhook',
      url: 'https://api.example.com/webhooks/payment',
      events: ['payment.succeeded', 'payment.failed'],
      status: 'active',
      lastTriggered: '2024-09-23T10:30:00Z',
      successRate: 99.2
    },
    {
      id: '3',
      name: 'Appointment Notifications',
      url: 'https://api.example.com/webhooks/appointments',
      events: ['appointment.created', 'appointment.cancelled'],
      status: 'inactive',
      lastTriggered: '2024-09-22T15:45:00Z',
      successRate: 95.8
    }
  ]);

  const [workflows, setWorkflows] = useState([
    {
      id: '1',
      name: 'New Customer Welcome',
      description: 'Send welcome email and schedule follow-up',
      trigger: 'customer.created',
      actions: ['send_email', 'create_task', 'add_to_list'],
      status: 'active',
      executions: 145
    },
    {
      id: '2',
      name: 'Payment Reminder',
      description: 'Automated payment reminders for overdue invoices',
      trigger: 'invoice.overdue',
      actions: ['send_email', 'create_task'],
      status: 'active',
      executions: 67
    },
    {
      id: '3',
      name: 'Appointment Confirmation',
      description: 'Send confirmation and reminder emails',
      trigger: 'appointment.created',
      actions: ['send_email', 'send_sms', 'create_calendar_event'],
      status: 'active',
      executions: 234
    }
  ]);

  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [] as string[],
    secret: ''
  });

  const [showNewWebhook, setShowNewWebhook] = useState(false);

  const availableEvents = [
    'customer.created',
    'customer.updated',
    'customer.deleted',
    'appointment.created',
    'appointment.updated',
    'appointment.cancelled',
    'payment.succeeded',
    'payment.failed',
    'invoice.created',
    'invoice.sent',
    'message.received'
  ];

  const connectIntegration = (integrationId: string) => {
    const integration = integrations.available.find(i => i.id === integrationId);
    if (integration) {
      const connectedIntegration: ConnectedIntegration = {
        ...integration,
        status: 'connected',
        lastSync: new Date().toISOString(),
        settings: {}
      };
      
      setIntegrations((prev): IntegrationState => ({
        connected: [...prev.connected, connectedIntegration],
        available: prev.available.filter(i => i.id !== integrationId)
      }));
    }
  };

  const disconnectIntegration = (integrationId: string) => {
    const integration = integrations.connected.find(i => i.id === integrationId);
    if (integration) {
      const availableIntegration: AvailableIntegration = {
        id: integration.id,
        name: integration.name,
        description: integration.description,
        icon: integration.icon,
        category: 'Connected'
      };
      setIntegrations((prev): IntegrationState => ({
        connected: prev.connected.filter(i => i.id !== integrationId),
        available: [...prev.available, availableIntegration]
      }));
    }
  };

  const toggleWebhook = (webhookId: string) => {
    setWebhooks(prev => prev.map(webhook => 
      webhook.id === webhookId 
        ? { ...webhook, status: webhook.status === 'active' ? 'inactive' : 'active' }
        : webhook
    ));
  };

  const addWebhook = () => {
    if (newWebhook.name && newWebhook.url && newWebhook.events.length > 0) {
      const webhook = {
        id: Date.now().toString(),
        ...newWebhook,
        status: 'active' as const,
        lastTriggered: null,
        successRate: 100
      };
      
      setWebhooks(prev => [...prev, webhook]);
      setNewWebhook({ name: '', url: '', events: [], secret: '' });
      setShowNewWebhook(false);
    }
  };

  const deleteWebhook = (webhookId: string) => {
    setWebhooks(prev => prev.filter(w => w.id !== webhookId));
  };

  const toggleWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.map(workflow => 
      workflow.id === workflowId 
        ? { ...workflow, status: workflow.status === 'active' ? 'inactive' : 'active' }
        : workflow
    ));
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Connected Integrations */}
      <SettingsCard
        title="Connected Integrations"
        description="Manage your active integrations and their settings"
        icon={CheckCircle}
      >
        <div className="space-y-4">
          {integrations.connected.map((integration) => (
            <div key={integration.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <integration.icon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-medium text-gray-900">{integration.name}</h3>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Connected
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{integration.description}</p>
                  <p className="text-xs text-gray-500">
                    Last sync: {formatDate(integration.lastSync)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <SettingsIcon className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => disconnectIntegration(integration.id)}
                  className="px-3 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ))}
        </div>
      </SettingsCard>

      {/* Available Integrations */}
      <SettingsCard
        title="Available Integrations"
        description="Connect with popular services to enhance your workflow"
        icon={Plus}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.available.map((integration) => (
            <motion.div
              key={integration.id}
              whileHover={{ scale: 1.02 }}
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <integration.icon className="h-5 w-5 text-gray-600" />
                </div>
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                  {integration.category}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">{integration.name}</h3>
              <p className="text-xs text-gray-600 mb-3">{integration.description}</p>
              <button
                onClick={() => connectIntegration(integration.id)}
                className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Connect
              </button>
            </motion.div>
          ))}
        </div>
      </SettingsCard>

      {/* Webhooks */}
      <SettingsCard
        title="Webhooks"
        description="Configure HTTP endpoints to receive real-time notifications"
        icon={Webhook}
        actions={
          <button
            onClick={() => setShowNewWebhook(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Webhook</span>
          </button>
        }
      >
        <div className="space-y-4">
          {showNewWebhook && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4"
            >
              <h4 className="text-sm font-medium text-blue-900">Add New Webhook</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newWebhook.name}
                    onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="My Webhook"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                  <input
                    type="url"
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://api.example.com/webhook"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Events</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableEvents.map((event) => (
                    <label key={event} className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={newWebhook.events.includes(event)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewWebhook(prev => ({ ...prev, events: [...prev.events, event] }));
                          } else {
                            setNewWebhook(prev => ({ ...prev, events: prev.events.filter(e => e !== event) }));
                          }
                        }}
                        className="mr-2"
                      />
                      {event}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowNewWebhook(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addWebhook}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Webhook
                </button>
              </div>
            </motion.div>
          )}

          {webhooks.map((webhook) => (
            <div key={webhook.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-sm font-medium text-gray-900">{webhook.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    webhook.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {webhook.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 font-mono">{webhook.url}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>Events: {webhook.events.join(', ')}</span>
                  <span>Success Rate: {webhook.successRate}%</span>
                  <span>Last Triggered: {formatDate(webhook.lastTriggered)}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <ToggleSwitch
                  enabled={webhook.status === 'active'}
                  onChange={() => toggleWebhook(webhook.id)}
                  size="sm"
                />
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteWebhook(webhook.id)}
                  className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </SettingsCard>

      {/* Workflow Automation */}
      <SettingsCard
        title="Workflow Automation"
        description="Automate repetitive tasks with custom workflows"
        icon={Zap}
        actions={
          <button className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Create Workflow</span>
          </button>
        }
      >
        <div className="space-y-4">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-sm font-medium text-gray-900">{workflow.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    workflow.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {workflow.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{workflow.description}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>Trigger: {workflow.trigger}</span>
                  <span>Actions: {workflow.actions.length}</span>
                  <span>Executions: {workflow.executions}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <ToggleSwitch
                  enabled={workflow.status === 'active'}
                  onChange={() => toggleWorkflow(workflow.id)}
                  size="sm"
                />
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </SettingsCard>

      {/* API Configuration */}
      <SettingsCard
        title="API Configuration"
        description="Configure API settings and rate limits"
        icon={Globe}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Rate Limit (requests/minute)
              </label>
              <input
                type="number"
                defaultValue="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook Timeout (seconds)
              </label>
              <input
                type="number"
                defaultValue="30"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-4">
            <ToggleSwitch
              enabled={true}
              onChange={() => {}}
              label="Enable API Logging"
              description="Log API requests for debugging and monitoring"
            />
            
            <ToggleSwitch
              enabled={true}
              onChange={() => {}}
              label="Webhook Retry on Failure"
              description="Automatically retry failed webhook deliveries"
            />
            
            <ToggleSwitch
              enabled={false}
              onChange={() => {}}
              label="CORS Allow All Origins"
              description="Allow cross-origin requests from any domain (not recommended for production)"
            />
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
          <span>Save Integration Settings</span>
        </button>
      </motion.div>
    </div>
  );
}
