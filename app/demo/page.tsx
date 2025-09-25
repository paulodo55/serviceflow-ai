'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Play, 
  ArrowRight, 
  Calendar, 
  Users, 
  DollarSign, 
  BarChart3,
  Settings,
  MessageSquare,
  CheckCircle,
  Star,
  Shield,
  Zap
} from 'lucide-react';

export default function DemoPage() {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

  const handleStartDemo = async () => {
    setIsStarting(true);
    
    // Set demo mode in localStorage
    localStorage.setItem('demoMode', 'true');
    localStorage.setItem('demoUser', JSON.stringify({
      id: 'demo-user',
      name: 'Demo User',
      email: 'demo@vervidai.com',
      organizationId: 'demo-org',
      organization: 'Demo Company',
      plan: 'trial',
      role: 'ADMIN'
    }));
    
    // Simulate loading
    setTimeout(() => {
      router.push('/app');
    }, 1500);
  };

  const demoFeatures = [
    {
      icon: Calendar,
      title: 'Calendar Management',
      description: 'View and manage appointments, schedule new meetings, and track availability.',
      color: 'blue'
    },
    {
      icon: Users,
      title: 'Customer Database',
      description: 'Complete customer profiles, service history, and communication tracking.',
      color: 'green'
    },
    {
      icon: DollarSign,
      title: 'Invoice System',
      description: 'Create, send, and track invoices with automated payment reminders.',
      color: 'purple'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Real-time insights, performance metrics, and business intelligence.',
      color: 'orange'
    },
    {
      icon: Settings,
      title: 'Full Customization',
      description: 'Theme customization, notification settings, and workflow automation.',
      color: 'indigo'
    },
    {
      icon: MessageSquare,
      title: 'Communication Hub',
      description: 'Centralized messaging, email templates, and customer communications.',
      color: 'pink'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      pink: 'bg-pink-100 text-pink-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="container mx-auto px-6 py-8">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8">
          <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
          Back to Home
        </Link>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8"
            >
              <Play className="h-10 w-10 text-white ml-1" />
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Experience VervidFlow
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Take a full tour of our CRM platform. No signup required - explore all features, 
              customize settings, and see how VervidFlow can transform your business operations.
            </p>

            <motion.button
              onClick={handleStartDemo}
              disabled={isStarting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-3 mx-auto"
            >
              {isStarting ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Starting Demo...</span>
                </>
              ) : (
                <>
                  <Play className="h-6 w-6" />
                  <span>Start Interactive Demo</span>
                  <ArrowRight className="h-6 w-6" />
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              What You&apos;ll Experience
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {demoFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-lg ${getColorClasses(feature.color)} flex items-center justify-center mb-4`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200"
          >
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Why Choose VervidFlow?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Commitment</h3>
                <p className="text-gray-600">
                  Explore every feature without signing up or providing payment information.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Full Access</h3>
                <p className="text-gray-600">
                  Experience the complete platform with all premium features unlocked.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Enterprise Grade</h3>
                <p className="text-gray-600">
                  See why businesses trust VervidFlow for their mission-critical operations.
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="text-center mt-16"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">
                Ready to Transform Your Business?
              </h2>
              <p className="text-blue-100 mb-6">
                After the demo, you can sign up for a free trial or speak with our team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="/contact"
                  className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}