'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Mail, Phone, Users, TrendingUp, Clock } from 'lucide-react';
import SMSPanel from '@/components/app/communications/SMSPanel';
import EmailPanel from '@/components/app/communications/EmailPanel';

interface CommunicationStats {
  totalSMS: number;
  totalEmails: number;
  smsDelivered: number;
  emailsOpened: number;
  recentActivity: Array<{
    id: string;
    type: 'sms' | 'email';
    recipient: string;
    subject: string;
    status: string;
    timestamp: string;
  }>;
}

export default function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState<'sms' | 'email' | 'overview'>('overview');
  const [stats, setStats] = useState<CommunicationStats>({
    totalSMS: 0,
    totalEmails: 0,
    smsDelivered: 0,
    emailsOpened: 0,
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCommunicationStats();
  }, []);

  const fetchCommunicationStats = async () => {
    setIsLoading(true);
    try {
      // This would be replaced with actual API calls
      // For now, using mock data
      setTimeout(() => {
        setStats({
          totalSMS: 1247,
          totalEmails: 892,
          smsDelivered: 1201,
          emailsOpened: 674,
          recentActivity: [
            {
              id: '1',
              type: 'sms',
              recipient: '+1 (555) 123-4567',
              subject: 'Appointment reminder',
              status: 'delivered',
              timestamp: '2 minutes ago'
            },
            {
              id: '2',
              type: 'email',
              recipient: 'john@example.com',
              subject: 'Welcome to VervidFlow',
              status: 'opened',
              timestamp: '5 minutes ago'
            },
            {
              id: '3',
              type: 'sms',
              recipient: '+1 (555) 987-6543',
              subject: 'Payment confirmation',
              status: 'delivered',
              timestamp: '12 minutes ago'
            },
            {
              id: '4',
              type: 'email',
              recipient: 'sarah@example.com',
              subject: 'Appointment confirmation',
              status: 'sent',
              timestamp: '18 minutes ago'
            }
          ]
        });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching communication stats:', error);
      setIsLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    color 
  }: { 
    title: string; 
    value: number; 
    subtitle: string; 
    icon: any; 
    color: string; 
  }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {isLoading ? (
              <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
            ) : (
              value.toLocaleString()
            )}
          </p>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Communications Center</h1>
        <p className="mt-2 text-gray-600">
          Manage SMS and email communications with your customers
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <nav className="flex space-x-8" aria-label="Tabs">
          {[
            { id: 'overview', name: 'Overview', icon: TrendingUp },
            { id: 'sms', name: 'SMS', icon: MessageSquare },
            { id: 'email', name: 'Email', icon: Mail }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total SMS Sent"
              value={stats.totalSMS}
              subtitle="This month"
              icon={MessageSquare}
              color="bg-blue-500"
            />
            <StatCard
              title="SMS Delivered"
              value={stats.smsDelivered}
              subtitle={`${((stats.smsDelivered / stats.totalSMS) * 100).toFixed(1)}% delivery rate`}
              icon={Phone}
              color="bg-green-500"
            />
            <StatCard
              title="Emails Sent"
              value={stats.totalEmails}
              subtitle="This month"
              icon={Mail}
              color="bg-purple-500"
            />
            <StatCard
              title="Emails Opened"
              value={stats.emailsOpened}
              subtitle={`${((stats.emailsOpened / stats.totalEmails) * 100).toFixed(1)}% open rate`}
              icon={TrendingUp}
              color="bg-indigo-500"
            />
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {isLoading ? (
                <div className="p-6">
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                        <div className="flex-1 space-y-2">
                          <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                          <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : stats.recentActivity.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent activity</p>
                </div>
              ) : (
                stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className={`flex-shrink-0 p-2 rounded-full ${
                        activity.type === 'sms' ? 'bg-blue-100' : 'bg-purple-100'
                      }`}>
                        {activity.type === 'sms' ? (
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Mail className="h-4 w-4 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.subject}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              activity.status === 'delivered' || activity.status === 'opened'
                                ? 'bg-green-100 text-green-800'
                                : activity.status === 'sent'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {activity.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-gray-500">{activity.recipient}</p>
                          <p className="text-xs text-gray-400">{activity.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sms' && (
        <div>
          <SMSPanel />
        </div>
      )}

      {activeTab === 'email' && (
        <div>
          <EmailPanel businessName="VervidFlow" />
        </div>
      )}
    </div>
  );
}
