'use client';

import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  color: 'blue' | 'green' | 'emerald' | 'orange' | 'purple' | 'yellow' | 'indigo' | 'pink';
}

const colorClasses = {
  blue: 'bg-blue-500 text-blue-600',
  green: 'bg-green-500 text-green-600',
  emerald: 'bg-emerald-500 text-emerald-600',
  orange: 'bg-orange-500 text-orange-600',
  purple: 'bg-purple-500 text-purple-600',
  yellow: 'bg-yellow-500 text-yellow-600',
  indigo: 'bg-indigo-500 text-indigo-600',
  pink: 'bg-pink-500 text-pink-600',
};

export default function DashboardCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  color
}: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              {changeType === 'positive' ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : changeType === 'negative' ? (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              ) : null}
              <span
                className={`text-sm font-medium ${
                  changeType === 'positive'
                    ? 'text-green-600'
                    : changeType === 'negative'
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
              >
                {change}
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-opacity-10 ${colorClasses[color]}`}>
          <Icon className={`h-6 w-6 ${colorClasses[color].split(' ')[1]}`} />
        </div>
      </div>
    </motion.div>
  );
}
