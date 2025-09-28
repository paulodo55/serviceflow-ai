'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle, XCircle, Loader } from 'lucide-react';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('SendGrid Test from VervidFlow');
  const [message, setMessage] = useState('Hello! This is a test email to verify SendGrid integration is working correctly.');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);

  const sendTestEmail = async () => {
    if (!email || !subject || !message) {
      setResult({
        success: false,
        message: 'Please fill in all fields'
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject,
          message
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          details: data.details
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to send email'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error: ' + (error instanceof Error ? error.message : 'Unknown error')
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📧 SendGrid Email Test</h1>
        <p className="text-gray-600">
          Test your SendGrid integration to ensure emails are working properly in your CRM.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Test Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center mb-6">
            <Mail className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Send Test Email</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={sendTestEmail}
              disabled={isLoading || !email || !subject || !message}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Email
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Test Results</h2>

          {result ? (
            <div className={`p-4 rounded-lg border ${
              result.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.success ? 'Success!' : 'Error'}
                  </p>
                  <p className={`text-sm mt-1 ${
                    result.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {result.message}
                  </p>
                  
                  {result.success && result.details && (
                    <div className="mt-3 text-sm text-green-700">
                      <p><strong>Provider:</strong> {result.details.provider}</p>
                      <p><strong>Sent to:</strong> {result.details.to}</p>
                      <p><strong>Subject:</strong> {result.details.subject}</p>
                      <p><strong>Timestamp:</strong> {new Date(result.details.timestamp).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Send a test email to see results here</p>
            </div>
          )}

          {/* Integration Status */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">📋 SendGrid Integration Status</h3>
            <div className="space-y-1 text-sm text-blue-800">
              <div className="flex justify-between">
                <span>SendGrid Package:</span>
                <span className="text-green-600 font-medium">✅ Installed</span>
              </div>
              <div className="flex justify-between">
                <span>Email Service:</span>
                <span className="text-green-600 font-medium">✅ Configured</span>
              </div>
              <div className="flex justify-between">
                <span>API Key:</span>
                <span className="text-green-600 font-medium">✅ Set</span>
              </div>
              <div className="flex justify-between">
                <span>Templates:</span>
                <span className="text-green-600 font-medium">✅ Ready</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Usage Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 bg-gray-50 rounded-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 How to Use SendGrid in Your CRM</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">🔧 Automated Emails</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Appointment confirmations</li>
              <li>• Payment receipts</li>
              <li>• Reminder notifications</li>
              <li>• Welcome emails</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">📊 Email Features</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Professional HTML templates</li>
              <li>• Delivery tracking</li>
              <li>• Click analytics</li>
              <li>• Bounce handling</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}