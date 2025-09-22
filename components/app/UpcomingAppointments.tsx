'use client';

import { motion } from 'framer-motion';
import { Phone, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Appointment {
  id: string;
  customer: string;
  service: string;
  time: string;
  date: string;
  phone: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
}

export default function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
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
        <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          View calendar
        </button>
      </div>

      <div className="space-y-4">
        {appointments.map((appointment, index) => (
          <motion.div
            key={appointment.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900">
                  {appointment.customer}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                {appointment.service}
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {appointment.date} at {appointment.time}
                </span>
                <span className="flex items-center">
                  <Phone className="h-3 w-3 mr-1" />
                  {appointment.phone}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              {getStatusIcon(appointment.status)}
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <Phone className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <button className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 font-medium hover:bg-blue-50 rounded-lg transition-colors">
          Schedule new appointment
        </button>
      </div>
    </motion.div>
  );
}
