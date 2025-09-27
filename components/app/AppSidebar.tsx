'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard,
  Calendar,
  Users,
  MessageSquare,
  CreditCard,
  Star,
  Settings,
  BarChart3,
  Phone,
  Mail,
  Zap,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FileText,
  Globe,
  Banknote,
  Shield
} from 'lucide-react';
import { useDemo } from '@/lib/demo-context';
import { useTheme } from '@/lib/theme-context';

const navigation = [
  { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
  { name: 'Calendar', href: '/app/calendar', icon: Calendar },
  { name: 'Customers', href: '/app/customers', icon: Users },
  { name: 'Messages', href: '/app/messages', icon: MessageSquare },
  { name: 'Communications', href: '/app/communications', icon: Phone },
  { name: 'Invoices', href: '/app/invoices', icon: CreditCard },
  { name: 'Reviews', href: '/app/reviews', icon: Star },
  { name: 'Analytics', href: '/app/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/app/settings', icon: Settings },
];

const crmFeatures = [
  { name: 'Subscriptions', href: '/app/subscriptions', icon: RefreshCw },
  { name: 'Contracts', href: '/app/contracts', icon: FileText },
  { name: 'Social Inbox', href: '/app/social', icon: MessageSquare },
  { name: 'Integrations', href: '/app/integrations', icon: Globe },
  { name: 'Banking', href: '/app/banking', icon: Banknote },
  { name: 'Privacy & Data', href: '/app/privacy', icon: Shield },
];

const aiFeatures = [
  { 
    name: 'AI Callback Assistant', 
    href: '/app/ai/callback', 
    icon: Phone, 
    status: 'coming-soon',
    description: 'Automated customer callbacks'
  },
  { 
    name: 'AI Email Assistant', 
    href: '/app/ai/email', 
    icon: Mail, 
    status: 'coming-soon',
    description: 'Smart email suggestions'
  },
];

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { isDemoMode } = useDemo();
  const { currentTheme } = useTheme();

  const companyName = isDemoMode ? currentTheme.companyName : 'VervidFlow';

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              <h1 className="text-xl font-bold text-gray-900">{companyName}</h1>
              {!isDemoMode && <p className="text-xs text-gray-500">by Vervid</p>}
              {isDemoMode && <p className="text-xs text-blue-500">Demo Mode</p>}
            </motion.div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`${collapsed ? 'mr-0' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {item.name}
                  </motion.span>
                )}
              </Link>
            );
          })}

          {/* CRM Features Section */}
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="pt-6"
            >
              <div className="flex items-center mb-3">
                <RefreshCw className="h-4 w-4 text-indigo-600 mr-2" />
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Enterprise CRM
                </h3>
              </div>
              <div className="space-y-1">
                {crmFeatures.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* AI Features Section */}
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="pt-6"
            >
              <div className="flex items-center mb-3">
                <Zap className="h-4 w-4 text-indigo-600 mr-2" />
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  AI Features
                </h3>
              </div>
              <div className="space-y-2">
                {aiFeatures.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center px-3 py-2 rounded-md text-sm text-gray-400 cursor-not-allowed"
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="text-xs">{item.name}</span>
                        <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded-full">
                          Soon
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <p className="text-xs text-gray-500">
                VervidFlow by VervIdai
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Professional CRM Platform
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
