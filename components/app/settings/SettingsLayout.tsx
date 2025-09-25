'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Palette, 
  Bell, 
  Shield, 
  Zap, 
  Settings as SettingsIcon,
  ChevronLeft,
  Search,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { SettingsTab } from '@/app/app/settings/page';

interface SettingsLayoutProps {
  children: ReactNode;
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

const settingsNavigation = [
  {
    id: 'personal' as SettingsTab,
    name: 'Personal Preferences',
    description: 'Profile, language, and display settings',
    icon: User,
    color: 'text-blue-600'
  },
  {
    id: 'appearance' as SettingsTab,
    name: 'Appearance & Theme',
    description: 'Colors, themes, and branding',
    icon: Palette,
    color: 'text-purple-600'
  },
  {
    id: 'notifications' as SettingsTab,
    name: 'Notifications',
    description: 'Email, push, and communication preferences',
    icon: Bell,
    color: 'text-green-600'
  },
  {
    id: 'privacy' as SettingsTab,
    name: 'Privacy & Security',
    description: 'Authentication, data, and privacy controls',
    icon: Shield,
    color: 'text-red-600'
  },
  {
    id: 'integrations' as SettingsTab,
    name: 'Integrations',
    description: 'Connected apps and workflow automation',
    icon: Zap,
    color: 'text-yellow-600'
  },
  {
    id: 'advanced' as SettingsTab,
    name: 'Advanced Settings',
    description: 'System preferences and customizations',
    icon: SettingsIcon,
    color: 'text-gray-600'
  }
];

export default function SettingsLayout({ children, activeTab, onTabChange }: SettingsLayoutProps) {
  const activeNavItem = settingsNavigation.find(item => item.id === activeTab);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center mb-4">
            <Link 
              href="/app" 
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </Link>
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-600 mt-1">Customize your VervidFlow experience</p>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search settings..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-4">
            {settingsNavigation.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 border border-blue-200 shadow-sm'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                  whileHover={{ scale: isActive ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      isActive ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <item.icon className={`h-5 w-5 ${
                        isActive ? 'text-blue-600' : item.color
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-sm font-medium ${
                        isActive ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {item.name}
                      </h3>
                      <p className={`text-xs mt-1 ${
                        isActive ? 'text-blue-700' : 'text-gray-600'
                      }`}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Help Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <HelpCircle className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Need help?</p>
              <p className="text-xs text-gray-600">Check our documentation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Content Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <span>Settings</span>
                <span>/</span>
                <span className="text-gray-900">{activeNavItem?.name}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{activeNavItem?.name}</h1>
              <p className="text-gray-600 mt-1">{activeNavItem?.description}</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium">
                Reset to Defaults
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
