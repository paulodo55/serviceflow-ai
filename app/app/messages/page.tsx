'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare,
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Star,
  Archive,
  Trash2,
  Clock,
  CheckCircle,
  User,
  Smartphone
} from 'lucide-react';

// Types
interface Message {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  type: 'sms' | 'email' | 'chat';
  direction: 'inbound' | 'outbound';
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  isStarred: boolean;
  isArchived: boolean;
}

interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  type: 'sms' | 'email' | 'chat';
  status: 'active' | 'archived';
  isStarred: boolean;
  messages: Message[];
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    customerId: '1',
    customerName: 'John Smith',
    customerPhone: '(555) 123-4567',
    lastMessage: 'Thank you for the quick service! The AC is working perfectly now.',
    lastMessageTime: '2024-01-15T10:30:00Z',
    unreadCount: 0,
    type: 'sms',
    status: 'active',
    isStarred: true,
    messages: [
      {
        id: 'm1',
        customerId: '1',
        customerName: 'John Smith',
        customerPhone: '(555) 123-4567',
        customerEmail: 'john@example.com',
        type: 'sms',
        direction: 'outbound',
        content: 'Hi John! We\'re scheduled to arrive at 9 AM for your AC repair. Is this still a good time?',
        timestamp: '2024-01-15T08:00:00Z',
        status: 'read',
        isStarred: false,
        isArchived: false
      },
      {
        id: 'm2',
        customerId: '1',
        customerName: 'John Smith',
        customerPhone: '(555) 123-4567',
        customerEmail: 'john@example.com',
        type: 'sms',
        direction: 'inbound',
        content: 'Yes, that works perfect. I\'ll be here waiting.',
        timestamp: '2024-01-15T08:15:00Z',
        status: 'read',
        isStarred: false,
        isArchived: false
      },
      {
        id: 'm3',
        customerId: '1',
        customerName: 'John Smith',
        customerPhone: '(555) 123-4567',
        customerEmail: 'john@example.com',
        type: 'sms',
        direction: 'inbound',
        content: 'Thank you for the quick service! The AC is working perfectly now.',
        timestamp: '2024-01-15T10:30:00Z',
        status: 'read',
        isStarred: false,
        isArchived: false
      }
    ]
  },
  {
    id: '2',
    customerId: '2',
    customerName: 'Sarah Johnson',
    customerPhone: '(555) 987-6543',
    lastMessage: 'What time should I expect you tomorrow for the plumbing work?',
    lastMessageTime: '2024-01-14T16:45:00Z',
    unreadCount: 2,
    type: 'sms',
    status: 'active',
    isStarred: false,
    messages: [
      {
        id: 'm4',
        customerId: '2',
        customerName: 'Sarah Johnson',
        customerPhone: '(555) 987-6543',
        customerEmail: 'sarah@example.com',
        type: 'sms',
        direction: 'inbound',
        content: 'What time should I expect you tomorrow for the plumbing work?',
        timestamp: '2024-01-14T16:45:00Z',
        status: 'delivered',
        isStarred: false,
        isArchived: false
      }
    ]
  },
  {
    id: '3',
    customerId: '3',
    customerName: 'Mike Davis',
    customerPhone: '(555) 456-7890',
    lastMessage: 'Invoice received. Payment will be processed today.',
    lastMessageTime: '2024-01-14T14:20:00Z',
    unreadCount: 0,
    type: 'email',
    status: 'active',
    isStarred: false,
    messages: [
      {
        id: 'm5',
        customerId: '3',
        customerName: 'Mike Davis',
        customerPhone: '(555) 456-7890',
        customerEmail: 'mike@example.com',
        type: 'email',
        direction: 'inbound',
        content: 'Invoice received. Payment will be processed today.',
        timestamp: '2024-01-14T14:20:00Z',
        status: 'read',
        isStarred: false,
        isArchived: false
      }
    ]
  }
];

const messageTemplates = [
  {
    id: '1',
    name: 'Appointment Confirmation',
    content: 'Hi {customer_name}! This confirms your appointment on {date} at {time}. We\'ll see you then!',
    category: 'appointment'
  },
  {
    id: '2',
    name: 'On My Way',
    content: 'Hi {customer_name}! I\'m on my way to your location and should arrive in about {eta} minutes.',
    category: 'service'
  },
  {
    id: '3',
    name: 'Service Complete',
    content: 'Your service has been completed! Thank you for choosing us. Please let us know if you have any questions.',
    category: 'service'
  },
  {
    id: '4',
    name: 'Follow Up',
    content: 'Hi {customer_name}! How is everything working after our recent service? We\'d love to hear your feedback!',
    category: 'followup'
  },
  {
    id: '5',
    name: 'Payment Reminder',
    content: 'Hi {customer_name}! This is a friendly reminder that your invoice #{invoice_number} is due on {due_date}.',
    category: 'billing'
  }
];

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'sms':
        return <Smartphone className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'chat':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Clock className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCircle className="h-3 w-3 text-blue-400" />;
      case 'read':
        return <CheckCircle className="h-3 w-3 text-green-400" />;
      case 'failed':
        return <Trash2 className="h-3 w-3 text-red-400" />;
      default:
        return <Clock className="h-3 w-3 text-gray-400" />;
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.customerPhone.includes(searchTerm) ||
                         conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || conv.type === filterType;
    return matchesSearch && matchesType && conv.status === 'active';
  });

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: `m${Date.now()}`,
      customerId: selectedConversation.customerId,
      customerName: selectedConversation.customerName,
      customerPhone: selectedConversation.customerPhone,
      customerEmail: '',
      type: selectedConversation.type,
      direction: 'outbound',
      content: newMessage,
      timestamp: new Date().toISOString(),
      status: 'sent',
      isStarred: false,
      isArchived: false
    };

    // Update conversation
    const updatedConversations = conversations.map(conv => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, message],
          lastMessage: newMessage,
          lastMessageTime: message.timestamp
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setSelectedConversation({
      ...selectedConversation,
      messages: [...selectedConversation.messages, message],
      lastMessage: newMessage,
      lastMessageTime: message.timestamp
    });
    setNewMessage('');
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-gray-900">Messages</h1>
            <div className="flex items-center space-x-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                {totalUnread} unread
              </span>
              <button
                onClick={() => setShowNewConversation(true)}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Search and Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Types</option>
              <option value="sms">SMS</option>
              <option value="email">Email</option>
              <option value="chat">Chat</option>
            </select>
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation, index) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedConversation(conversation)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                selectedConversation?.id === conversation.id
                  ? 'bg-blue-50 border-blue-200'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-gray-900 text-sm">
                    {conversation.customerName}
                  </h3>
                  {getMessageTypeIcon(conversation.type)}
                  {conversation.isStarred && (
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  {conversation.unreadCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                      {conversation.unreadCount}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {new Date(conversation.lastMessageTime).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 truncate">
                {conversation.lastMessage}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {conversation.customerPhone}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Message View */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-medium text-gray-900">
                      {selectedConversation.customerName}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {selectedConversation.customerPhone}
                    </p>
                  </div>
                  {getMessageTypeIcon(selectedConversation.type)}
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <Phone className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-yellow-600 transition-colors">
                    <Star className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Archive className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConversation.messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.direction === 'outbound'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className={`flex items-center justify-end space-x-1 mt-1 ${
                      message.direction === 'outbound' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <span className="text-xs">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {message.direction === 'outbound' && getStatusIcon(message.status)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-2 mb-2">
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Templates
                </button>
              </div>
              
              {showTemplates && (
                <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Templates</h4>
                  <div className="grid grid-cols-1 gap-1">
                    {messageTemplates.slice(0, 3).map((template) => (
                      <button
                        key={template.id}
                        onClick={() => {
                          setNewMessage(template.content);
                          setShowTemplates(false);
                        }}
                        className="text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-end space-x-2">
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Smile className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal Placeholder */}
      {showNewConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                New Conversation
              </h3>
              <button
                onClick={() => setShowNewConversation(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Plus className="h-6 w-6 rotate-45" />
              </button>
            </div>
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                New conversation form will be implemented here
              </p>
              <button
                onClick={() => setShowNewConversation(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Coming Soon
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
