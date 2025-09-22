'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  icon: LucideIcon;
  color: string;
}

interface RecentActivitiesProps {
  activities: Activity[];
}

export default function RecentActivities({ activities }: RecentActivitiesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          View all
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className={`p-2 rounded-lg ${activity.color} bg-opacity-10`}>
              <activity.icon className={`h-4 w-4 ${activity.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {activity.title}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {activity.description}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {activity.time}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center">
          <button className="text-sm text-gray-600 hover:text-gray-900 font-medium">
            Load more activities
          </button>
        </div>
      </div>
    </motion.div>
  );
}
