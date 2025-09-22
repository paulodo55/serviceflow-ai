'use client';

import { motion } from 'framer-motion';
import { 
  Calendar,
  UserPlus,
  FileText,
  MessageSquare,
  CreditCard,
  Phone,
  Mail,
  Star
} from 'lucide-react';

const actions = [
  {
    name: 'Schedule Appointment',
    description: 'Book a new appointment',
    icon: Calendar,
    color: 'bg-blue-500 hover:bg-blue-600',
    href: '/app/calendar/new'
  },
  {
    name: 'Add Customer',
    description: 'Create new customer profile',
    icon: UserPlus,
    color: 'bg-green-500 hover:bg-green-600',
    href: '/app/customers/new'
  },
  {
    name: 'Create Invoice',
    description: 'Generate new invoice',
    icon: FileText,
    color: 'bg-purple-500 hover:bg-purple-600',
    href: '/app/invoices/new'
  },
  {
    name: 'Send Message',
    description: 'Message a customer',
    icon: MessageSquare,
    color: 'bg-indigo-500 hover:bg-indigo-600',
    href: '/app/messages/new'
  },
  {
    name: 'Process Payment',
    description: 'Record or collect payment',
    icon: CreditCard,
    color: 'bg-emerald-500 hover:bg-emerald-600',
    href: '/app/invoices?tab=payments'
  },
  {
    name: 'Make Call',
    description: 'Call a customer',
    icon: Phone,
    color: 'bg-orange-500 hover:bg-orange-600',
    href: '/app/customers?action=call'
  },
  {
    name: 'Send Email',
    description: 'Email marketing campaign',
    icon: Mail,
    color: 'bg-pink-500 hover:bg-pink-600',
    href: '/app/messages/email'
  },
  {
    name: 'Request Review',
    description: 'Ask for customer review',
    icon: Star,
    color: 'bg-yellow-500 hover:bg-yellow-600',
    href: '/app/reviews/request'
  }
];

export default function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        <span className="text-sm text-gray-500">Streamline your workflow</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {actions.map((action, index) => (
          <motion.button
            key={action.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 group"
          >
            <div className={`p-3 rounded-lg ${action.color} transition-colors mb-3`}>
              <action.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 text-center mb-1">
              {action.name}
            </h3>
            <p className="text-xs text-gray-500 text-center">
              {action.description}
            </p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
