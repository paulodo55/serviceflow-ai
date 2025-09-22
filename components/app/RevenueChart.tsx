'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

const data = [
  { name: 'Jan', revenue: 4200, appointments: 45, customers: 38 },
  { name: 'Feb', revenue: 3800, appointments: 42, customers: 35 },
  { name: 'Mar', revenue: 5100, appointments: 58, customers: 48 },
  { name: 'Apr', revenue: 4700, appointments: 52, customers: 44 },
  { name: 'May', revenue: 5800, appointments: 65, customers: 55 },
  { name: 'Jun', revenue: 6200, appointments: 70, customers: 60 },
  { name: 'Jul', revenue: 7100, appointments: 78, customers: 68 },
  { name: 'Aug', revenue: 6800, appointments: 75, customers: 65 },
  { name: 'Sep', revenue: 7500, appointments: 82, customers: 72 },
  { name: 'Oct', revenue: 8200, appointments: 89, customers: 78 },
  { name: 'Nov', revenue: 7800, appointments: 85, customers: 75 },
  { name: 'Dec', revenue: 9100, appointments: 95, customers: 85 }
];

type ChartType = 'revenue' | 'appointments' | 'customers';

export default function RevenueChart() {
  const [activeChart, setActiveChart] = useState<ChartType>('revenue');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('area');

  const getChartData = () => {
    switch (activeChart) {
      case 'revenue':
        return { dataKey: 'revenue', color: '#3B82F6', label: 'Revenue ($)' };
      case 'appointments':
        return { dataKey: 'appointments', color: '#10B981', label: 'Appointments' };
      case 'customers':
        return { dataKey: 'customers', color: '#F59E0B', label: 'New Customers' };
      default:
        return { dataKey: 'revenue', color: '#3B82F6', label: 'Revenue ($)' };
    }
  };

  const chartData = getChartData();

  const formatValue = (value: number) => {
    if (activeChart === 'revenue') {
      return `$${value.toLocaleString()}`;
    }
    return value.toString();
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" tickFormatter={formatValue} />
            <Tooltip 
              formatter={(value: number) => [formatValue(value), chartData.label]}
              labelStyle={{ color: '#374151' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey={chartData.dataKey} fill={chartData.color} radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" tickFormatter={formatValue} />
            <Tooltip 
              formatter={(value: number) => [formatValue(value), chartData.label]}
              labelStyle={{ color: '#374151' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey={chartData.dataKey} 
              stroke={chartData.color} 
              strokeWidth={3}
              dot={{ fill: chartData.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: chartData.color, strokeWidth: 2 }}
            />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" tickFormatter={formatValue} />
            <Tooltip 
              formatter={(value: number) => [formatValue(value), chartData.label]}
              labelStyle={{ color: '#374151' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey={chartData.dataKey} 
              stroke={chartData.color} 
              fill={chartData.color}
              fillOpacity={0.1}
              strokeWidth={3}
            />
          </AreaChart>
        );
      default:
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" tickFormatter={formatValue} />
            <Tooltip 
              formatter={(value: number) => [formatValue(value), chartData.label]}
              labelStyle={{ color: '#374151' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey={chartData.dataKey} 
              stroke={chartData.color} 
              fill={chartData.color}
              fillOpacity={0.1}
              strokeWidth={3}
            />
          </AreaChart>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Analytics Overview</h2>
          <p className="text-sm text-gray-600">Track your business performance</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Chart Type Selector */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {['area', 'line', 'bar'].map((type) => (
              <button
                key={type}
                onClick={() => setChartType(type as any)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  chartType === type
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric Tabs */}
      <div className="flex items-center space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { key: 'revenue', label: 'Revenue', color: 'bg-blue-500' },
          { key: 'appointments', label: 'Appointments', color: 'bg-green-500' },
          { key: 'customers', label: 'New Customers', color: 'bg-yellow-500' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveChart(tab.key as ChartType)}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeChart === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${tab.color} mr-2`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {activeChart === 'revenue' ? '$78.2K' : activeChart === 'appointments' ? '756' : '648'}
          </p>
          <p className="text-sm text-gray-600">Total This Year</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">+23.5%</p>
          <p className="text-sm text-gray-600">Growth Rate</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            {activeChart === 'revenue' ? '$6.5K' : activeChart === 'appointments' ? '63' : '54'}
          </p>
          <p className="text-sm text-gray-600">Monthly Average</p>
        </div>
      </div>
    </motion.div>
  );
}
