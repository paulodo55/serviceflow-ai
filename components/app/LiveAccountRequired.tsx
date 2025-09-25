'use client';

import { motion } from 'framer-motion';
import { 
  Crown, 
  ArrowRight, 
  CheckCircle, 
  Star,
  Zap,
  Shield,
  Users,
  Calendar,
  BarChart3,
  MessageSquare,
  CreditCard,
  UserPlus,
  Mail,
  XCircle,
  AlertCircle,
  FileText,
  Phone,
  AlertTriangle,
  Settings
} from 'lucide-react';
import Link from 'next/link';

interface LiveAccountRequiredProps {
  title: string;
  description: string;
  iconName: string;
  features?: string[];
  comingSoon?: boolean;
}

export default function LiveAccountRequired({ 
  title, 
  description, 
  iconName, 
  features = [],
  comingSoon = false 
}: LiveAccountRequiredProps) {
  const iconMap = {
    'star': Star,
    'zap': Zap,
    'shield': Shield,
    'users': Users,
    'calendar': Calendar,
    'bar-chart3': BarChart3,
    'message-square': MessageSquare,
    'credit-card': CreditCard,
    'crown': Crown,
    'check-circle': CheckCircle,
    'user-plus': UserPlus,
    'mail': Mail,
    'arrow-right': ArrowRight,
    'x-circle': XCircle,
    'alert-circle': AlertCircle,
    'file-text': FileText,
    'phone': Phone,
    'alert-triangle': AlertTriangle,
    'settings': Settings
  };

  const Icon = iconMap[iconName as keyof typeof iconMap] || Shield;

  const defaultFeatures = [
    'Real-time data synchronization',
    'Advanced analytics and reporting',
    'Multi-user collaboration',
    'Priority customer support',
    'Enterprise-grade security',
    'Custom integrations'
  ];

  const displayFeatures = features.length > 0 ? features : defaultFeatures;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full"
      >
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Icon className="h-10 w-10 text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-4"
            >
              {title}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-blue-100 leading-relaxed"
            >
              {description}
            </motion.p>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            {comingSoon ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Coming Soon</h3>
                <p className="text-gray-600 text-lg mb-6">
                  This feature is currently in development and will be available in a future update.
                </p>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-purple-800">
                    <strong>VervidFlow by VervIdai</strong> - We&apos;re constantly improving our platform 
                    to bring you the most advanced CRM features.
                  </p>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Live Account Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-center mb-8"
                >
                  <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-3 rounded-full flex items-center space-x-2 shadow-lg">
                    <Crown className="h-5 w-5" />
                    <span className="font-semibold">Live Account Required</span>
                  </div>
                </motion.div>

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-center mb-8"
                >
                  <p className="text-gray-600 text-lg leading-relaxed">
                   You&apos;re currently viewing the <strong>VervidFlow demo</strong>. This feature requires
                  an active subscription to access real-time data and full functionality.
                  </p>
                </motion.div>

                {/* Features List */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mb-8"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                    What you&apos;ll get with a live account:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {displayFeatures.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="flex items-center space-x-3"
                      >
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: comingSoon ? 0.6 : 1.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {!comingSoon && (
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg">
                  <Crown className="h-5 w-5" />
                  <span>Upgrade to Live Account</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              )}
              
              <Link href="/app">
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center space-x-2">
                  <span>Back to Dashboard</span>
                </button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Bottom Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: comingSoon ? 0.8 : 1.4 }}
          className="text-center mt-8"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-4 border border-gray-200">
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <Shield className="h-4 w-4" />
              <span className="text-sm">
                 <strong>VervidFlow by VervIdai</strong> - Professional CRM Platform
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
