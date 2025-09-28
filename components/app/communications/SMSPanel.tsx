'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Send, Phone, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface SMSMessage {
  id: string;
  phoneNumber: string;
  message: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'RECEIVED';
  purpose: string;
  createdAt: string;
  twilioSid?: string;
  customer?: {
    id: string;
    name: string;
    email: string;
  };
}

interface SMSPanelProps {
  customerId?: string;
  appointmentId?: string;
}

export default function SMSPanel({ customerId, appointmentId }: SMSPanelProps) {
  const [messages, setMessages] = useState<SMSMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [messageType, setMessageType] = useState('notification');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Template messages
  const templates = {
    reminder: "Hi {name}! This is a reminder for your appointment with us on {date}. Reply CONFIRM to confirm or RESCHEDULE to change. Thanks!",
    confirmation: "Hi {name}! Your appointment with us is confirmed for {date}. We'll send you a reminder 24 hours before. See you soon!",
    welcome: "Welcome to our service, {name}! We're excited to serve you. Book appointments and get updates at your convenience. Reply STOP to opt out.",
    followUp: "Hi {name}! Thank you for visiting us. We hope you had a great experience. We'd love to hear your feedback!",
    payment: "Hi {name}! Your payment of ${amount} has been processed successfully. Thank you for your business!"
  };

  useEffect(() => {
    fetchMessages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, appointmentId]);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (customerId) params.append('customerId', customerId);
      if (appointmentId) params.append('appointmentId', appointmentId);
      
      const response = await fetch(`/api/communications/sms?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.smsHistory || []);
      }
    } catch (error) {
      console.error('Error fetching SMS messages:', error);
    }
    setIsLoading(false);
  }, [customerId, appointmentId]);

  const sendSMS = async () => {
    if (!phoneNumber || !newMessage) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/communications/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send',
          to: phoneNumber,
          message: newMessage,
          type: messageType,
          customerId,
          appointmentId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setNewMessage('');
          setPhoneNumber('');
          fetchMessages(); // Refresh messages
          alert('SMS sent successfully!');
        } else {
          alert(`Failed to send SMS: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      alert('Failed to send SMS');
    }
    setIsSending(false);
  };

  const selectTemplate = (template: string) => {
    setNewMessage(templates[template as keyof typeof templates]);
  };

  const formatPhoneNumber = (phone: string) => {
    // Basic phone number formatting
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }
    return phone;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'SENT':
        return <Send className="h-4 w-4 text-blue-500" />;
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'RECEIVED':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SENT':
        return 'bg-blue-100 text-blue-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'RECEIVED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center mb-4">
          <MessageSquare className="h-6 w-6 text-indigo-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">SMS Communications</h3>
        </div>

        {/* Send New SMS */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                placeholder="+1 (555) 123-4567"
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Type
            </label>
            <select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="notification">Notification</option>
              <option value="reminder">Reminder</option>
              <option value="confirmation">Confirmation</option>
              <option value="alert">Alert</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <div className="mb-2 flex flex-wrap gap-2">
              <span className="text-xs text-gray-500">Quick templates:</span>
              {Object.keys(templates).map((template) => (
                <button
                  key={template}
                  onClick={() => selectTemplate(template)}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 capitalize"
                >
                  {template}
                </button>
              ))}
            </div>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={4}
              maxLength={160}
              placeholder="Enter your message (max 160 characters)..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {newMessage.length}/160 characters
            </div>
          </div>

          <button
            onClick={sendSMS}
            disabled={!phoneNumber || !newMessage || isSending}
            className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send SMS
              </>
            )}
          </button>
        </div>
      </div>

      {/* Message History */}
      <div className="p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Message History</h4>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No SMS messages yet</p>
            <p className="text-sm">Send your first message above</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  {getStatusIcon(message.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">
                      {message.customer?.name || message.phoneNumber}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                        {message.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{message.message}</p>
                  {message.purpose && (
                    <p className="text-xs text-gray-500 mt-1 capitalize">
                      {message.purpose.toLowerCase()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
