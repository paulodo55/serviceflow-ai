'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarDays, 
  Users, 
  DollarSign, 
  Clock,
  TrendingUp,
  MessageSquare,
  Bell,
  CheckCircle,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  Star
} from 'lucide-react';
import DashboardCard from '@/components/app/DashboardCard';
import QuickActions from '@/components/app/QuickActions';
import RecentActivities from '@/components/app/RecentActivities';
import UpcomingAppointments from '@/components/app/UpcomingAppointments';
import RevenueChart from '@/components/app/RevenueChart';

export default function AppDashboard() {
  const [metrics, setMetrics] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    activeCustomers: 0,
    avgRating: 0,
    responseTime: 0,
    conversionRate: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading demo data
    const timer = setTimeout(() => {
      setMetrics({
        totalAppointments: 342,
        completedAppointments: 298,
        totalRevenue: 45680,
        pendingPayments: 3240,
        activeCustomers: 156,
        avgRating: 4.8,
        responseTime: 2.3,
        conversionRate: 78.5
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const recentActivities = [
    {
      id: '1',
      type: 'appointment',
      title: 'New appointment scheduled',
      description: 'Sarah Johnson - Oil Change Service',
      time: '2 minutes ago',
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      id: '2',
      type: 'payment',
      title: 'Payment received',
      description: '$89.99 from Mike Chen',
      time: '15 minutes ago',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      id: '3',
      type: 'message',
      title: 'New message received',
      description: 'Customer inquiry about brake service',
      time: '23 minutes ago',
      icon: MessageSquare,
      color: 'text-purple-600'
    },
    {
      id: '4',
      type: 'review',
      title: 'New 5-star review',
      description: 'Excellent service and fast turnaround!',
      time: '1 hour ago',
      icon: Star,
      color: 'text-yellow-600'
    },
    {
      id: '5',
      type: 'appointment',
      title: 'Appointment completed',
      description: 'Jennifer Davis - Brake Inspection',
      time: '2 hours ago',
      icon: CheckCircle,
      color: 'text-green-600'
    }
  ];

  const upcomingAppointments = [
    {
      id: '1',
      customer: 'Alex Rodriguez',
      service: 'Transmission Service',
      time: '10:00 AM',
      date: 'Today',
      phone: '(555) 123-4567',
      status: 'confirmed' as const
    },
    {
      id: '2',
      customer: 'Emma Thompson',
      service: 'Oil Change',
      time: '11:30 AM',
      date: 'Today',
      phone: '(555) 987-6543',
      status: 'confirmed' as const
    },
    {
      id: '3',
      customer: 'David Kim',
      service: 'Brake Repair',
      time: '2:00 PM',
      date: 'Today',
      phone: '(555) 456-7890',
      status: 'pending' as const
    },
    {
      id: '4',
      customer: 'Lisa Wang',
      service: 'Engine Diagnostic',
      time: '9:00 AM',
      date: 'Tomorrow',
      phone: '(555) 321-0987',
      status: 'confirmed' as const
    },
    {
      id: '5',
      customer: 'Robert Johnson',
      service: 'Tire Rotation',
      time: '10:30 AM',
      date: 'Tomorrow',
      phone: '(555) 654-3210',
      status: 'confirmed' as const
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, Paul!</h1>
            <p className="text-blue-100">Here&apos;s what&apos;s happening with your business today.</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{new Date().getDate()}</div>
            <div className="text-blue-100">{new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Appointments"
          value={metrics.totalAppointments.toLocaleString()}
          change="+12%"
          changeType="positive"
          icon={CalendarDays}
          color="blue"
        />
        <DashboardCard
          title="Completed Today"
          value={metrics.completedAppointments.toLocaleString()}
          change="+8%"
          changeType="positive"
          icon={CheckCircle}
          color="green"
        />
        <DashboardCard
          title="Total Revenue"
          value={`$${metrics.totalRevenue.toLocaleString()}`}
          change="+23%"
          changeType="positive"
          icon={DollarSign}
          color="emerald"
        />
        <DashboardCard
          title="Pending Payments"
          value={`$${metrics.pendingPayments.toLocaleString()}`}
          change="-5%"
          changeType="negative"
          icon={Clock}
          color="orange"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Active Customers"
          value={metrics.activeCustomers.toLocaleString()}
          change="+15%"
          changeType="positive"
          icon={Users}
          color="purple"
        />
        <DashboardCard
          title="Average Rating"
          value={metrics.avgRating.toFixed(1)}
          change="+0.2"
          changeType="positive"
          icon={Star}
          color="yellow"
        />
        <DashboardCard
          title="Response Time"
          value={`${metrics.responseTime}m`}
          change="-0.5m"
          changeType="positive"
          icon={MessageSquare}
          color="indigo"
        />
        <DashboardCard
          title="Conversion Rate"
          value={`${metrics.conversionRate}%`}
          change="+3.2%"
          changeType="positive"
          icon={TrendingUp}
          color="pink"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>

        {/* Upcoming Appointments */}
        <div>
          <UpcomingAppointments appointments={upcomingAppointments} />
        </div>
      </div>

      {/* Recent Activities */}
      <RecentActivities activities={recentActivities} />
    </div>
  );
}
