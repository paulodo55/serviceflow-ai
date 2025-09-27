'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Send, User, Calendar, DollarSign, FileText } from 'lucide-react';

interface EmailTemplate {
  subject: string;
  html: string;
  variables: string[];
}

interface EmailPanelProps {
  customerId?: string;
  appointmentId?: string;
  customerData?: {
    name: string;
    email: string;
  };
  appointmentData?: {
    date: string;
    service: string;
  };
  businessName?: string;
}

export default function EmailPanel({ 
  customerId, 
  appointmentId, 
  customerData, 
  appointmentData,
  businessName = "Your Business"
}: EmailPanelProps) {
  const [templates, setTemplates] = useState<Record<string, EmailTemplate>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [emailData, setEmailData] = useState({
    to: customerData?.email || '',
    subject: '',
    html: '',
    text: ''
  });
  const [variables, setVariables] = useState<Record<string, string>>({
    customerName: customerData?.name || '',
    businessName: businessName,
    appointmentDate: appointmentData?.date || '',
    serviceName: appointmentData?.service || '',
    amount: '',
    paymentDate: '',
    paymentMethod: '',
    transactionId: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    // Update variables when props change
    setVariables(prev => ({
      ...prev,
      customerName: customerData?.name || prev.customerName,
      appointmentDate: appointmentData?.date || prev.appointmentDate,
      serviceName: appointmentData?.service || prev.serviceName,
    }));
    setEmailData(prev => ({
      ...prev,
      to: customerData?.email || prev.to
    }));
  }, [customerData, appointmentData]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/communications/email');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || {});
      }
    } catch (error) {
      console.error('Error fetching email templates:', error);
    }
    setIsLoadingTemplates(false);
  };

  const selectTemplate = (templateKey: string) => {
    const template = templates[templateKey];
    if (template) {
      setSelectedTemplate(templateKey);
      setEmailData(prev => ({
        ...prev,
        subject: replaceVariables(template.subject),
        html: replaceVariables(template.html),
        text: '' // Will be auto-generated from HTML
      }));
    }
  };

  const replaceVariables = (content: string) => {
    let result = content;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      result = result.replace(regex, value || `{${key}}`);
    });
    return result;
  };

  const updateVariable = (key: string, value: string) => {
    setVariables(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Update email content with new variables
    if (selectedTemplate && templates[selectedTemplate]) {
      const template = templates[selectedTemplate];
      const newVariables = { ...variables, [key]: value };
      
      let updatedSubject = template.subject;
      let updatedHtml = template.html;
      
      Object.entries(newVariables).forEach(([varKey, varValue]) => {
        const regex = new RegExp(`{${varKey}}`, 'g');
        updatedSubject = updatedSubject.replace(regex, varValue || `{${varKey}}`);
        updatedHtml = updatedHtml.replace(regex, varValue || `{${varKey}}`);
      });
      
      setEmailData(prev => ({
        ...prev,
        subject: updatedSubject,
        html: updatedHtml
      }));
    }
  };

  const sendEmail = async () => {
    if (!emailData.to || !emailData.subject || !emailData.html) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/communications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send',
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
          customerId,
          appointmentId,
          type: selectedTemplate || 'custom'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('Email sent successfully!');
          // Reset form
          setEmailData({
            to: customerData?.email || '',
            subject: '',
            html: '',
            text: ''
          });
          setSelectedTemplate('');
        } else {
          alert('Failed to send email');
        }
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    }
    setIsSending(false);
  };

  const sendAppointmentReminder = async () => {
    if (!customerData?.name || !customerData?.email || !appointmentData?.date) {
      alert('Missing customer or appointment data');
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/communications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sendReminder',
          appointmentId,
          customerId,
          customerName: customerData.name,
          customerEmail: customerData.email,
          appointmentDate: appointmentData.date,
          businessName
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('Appointment reminder sent successfully!');
        } else {
          alert('Failed to send reminder');
        }
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Failed to send reminder');
    }
    setIsSending(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Mail className="h-6 w-6 text-indigo-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Email Communications</h3>
          </div>
          
          {appointmentData && (
            <button
              onClick={sendAppointmentReminder}
              disabled={isSending}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Send Reminder
            </button>
          )}
        </div>

        {/* Email Templates */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Templates
          </label>
          {isLoadingTemplates ? (
            <div className="animate-pulse bg-gray-200 h-10 rounded-md"></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(templates).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => selectTemplate(key)}
                  className={`p-3 text-left rounded-lg border transition-colors ${
                    selectedTemplate === key
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center mb-1">
                    {key === 'welcome' && <User className="h-4 w-4 mr-2" />}
                    {key === 'appointmentConfirmation' && <Calendar className="h-4 w-4 mr-2" />}
                    {key === 'appointmentReminder' && <Calendar className="h-4 w-4 mr-2" />}
                    {key === 'paymentReceipt' && <DollarSign className="h-4 w-4 mr-2" />}
                    <span className="text-sm font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Template Variables */}
        {selectedTemplate && templates[selectedTemplate] && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Variables
            </label>
            <div className="grid grid-cols-2 gap-4">
              {templates[selectedTemplate].variables.map((variable) => (
                <div key={variable}>
                  <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">
                    {variable.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <input
                    type="text"
                    value={variables[variable] || ''}
                    onChange={(e) => updateVariable(variable, e.target.value)}
                    placeholder={`Enter ${variable}`}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Email
            </label>
            <input
              type="email"
              value={emailData.to}
              onChange={(e) => setEmailData(prev => ({ ...prev, to: e.target.value }))}
              placeholder="customer@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Line
            </label>
            <input
              type="text"
              value={emailData.subject}
              onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Enter email subject"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Content (HTML)
            </label>
            <textarea
              value={emailData.html}
              onChange={(e) => setEmailData(prev => ({ ...prev, html: e.target.value }))}
              rows={10}
              placeholder="Enter your email content (HTML supported)..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono text-sm"
            />
          </div>

          <button
            onClick={sendEmail}
            disabled={!emailData.to || !emailData.subject || !emailData.html || isSending}
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
                Send Email
              </>
            )}
          </button>
        </div>
      </div>

      {/* Email Preview */}
      {emailData.html && (
        <div className="p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Email Preview</h4>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>To:</strong> {emailData.to}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Subject:</strong> {emailData.subject}
              </p>
            </div>
            <div 
              className="p-4 bg-white max-h-96 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: emailData.html }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
