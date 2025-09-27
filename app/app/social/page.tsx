'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  Send,
  Image,
  Video,
  Paperclip,
  Smile,
  MoreHorizontal,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Settings,
} from 'lucide-react';
import { useDemo } from '@/lib/demo-context';

interface SocialAccount {
  id: string;
  platform: string;
  accountId: string;
  accountName: string;
  isActive: boolean;
  lastSyncAt?: string;
  _count: {
    messages: number;
  };
}

interface SocialMessage {
  id: string;
  externalId: string;
  threadId?: string;
  content: string;
  mediaUrls: string[];
  senderName: string;
  senderHandle?: string;
  senderProfileUrl?: string;
  platform: string;
  messageType: string;
  direction: 'INBOUND' | 'OUTBOUND';
  status: string;
  isResponse: boolean;
  platformCreatedAt: string;
  readAt?: string;
  account: {
    id: string;
    platform: string;
    accountName: string;
  };
  customer?: {
    id: string;
    name: string;
    email: string;
  };
}

interface Conversation {
  threadId: string;
  platform: string;
  customerName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: SocialMessage[];
}

export default function SocialInboxPage() {
  const { isDemoMode } = useDemo();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<SocialMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showConnectAccount, setShowConnectAccount] = useState(false);

  useEffect(() => {
    if (isDemoMode) {
      // Demo data
      setAccounts([
        {
          id: '1',
          platform: 'FACEBOOK',
          accountId: 'fb123456',
          accountName: 'VervidFlow Business',
          isActive: true,
          lastSyncAt: '2024-01-15T10:30:00Z',
          _count: { messages: 45 },
        },
        {
          id: '2',
          platform: 'INSTAGRAM',
          accountId: 'ig789012',
          accountName: '@vervidflow',
          isActive: true,
          lastSyncAt: '2024-01-15T10:25:00Z',
          _count: { messages: 23 },
        },
        {
          id: '3',
          platform: 'TWITTER',
          accountId: 'tw345678',
          accountName: '@VervidFlow',
          isActive: false,
          _count: { messages: 12 },
        },
      ]);

      setConversations([
        {
          threadId: 'thread_1',
          platform: 'FACEBOOK',
          customerName: 'John Smith',
          lastMessage: 'Thanks for the quick response!',
          lastMessageAt: '2024-01-15T14:30:00Z',
          unreadCount: 0,
          messages: [],
        },
        {
          threadId: 'thread_2',
          platform: 'INSTAGRAM',
          customerName: 'Sarah Johnson',
          lastMessage: 'When are you open today?',
          lastMessageAt: '2024-01-15T13:45:00Z',
          unreadCount: 1,
          messages: [],
        },
        {
          threadId: 'thread_3',
          platform: 'FACEBOOK',
          customerName: 'Mike Wilson',
          lastMessage: 'I need to reschedule my appointment',
          lastMessageAt: '2024-01-15T12:15:00Z',
          unreadCount: 2,
          messages: [],
        },
      ]);

      setMessages([
        {
          id: '1',
          externalId: 'fb_msg_1',
          threadId: 'thread_1',
          content: 'Hi, I have a question about your membership options.',
          mediaUrls: [],
          senderName: 'John Smith',
          senderHandle: 'john.smith.123',
          platform: 'FACEBOOK',
          messageType: 'TEXT',
          direction: 'INBOUND',
          status: 'DELIVERED',
          isResponse: false,
          platformCreatedAt: '2024-01-15T14:25:00Z',
          readAt: '2024-01-15T14:26:00Z',
          account: {
            id: '1',
            platform: 'FACEBOOK',
            accountName: 'VervidFlow Business',
          },
          customer: {
            id: '1',
            name: 'John Smith',
            email: 'john@example.com',
          },
        },
        {
          id: '2',
          externalId: 'fb_msg_2',
          threadId: 'thread_1',
          content: 'Hi John! I\'d be happy to help you with our membership options. We have several plans available.',
          mediaUrls: [],
          senderName: 'VervidFlow Support',
          platform: 'FACEBOOK',
          messageType: 'TEXT',
          direction: 'OUTBOUND',
          status: 'DELIVERED',
          isResponse: true,
          platformCreatedAt: '2024-01-15T14:28:00Z',
          account: {
            id: '1',
            platform: 'FACEBOOK',
            accountName: 'VervidFlow Business',
          },
        },
      ]);
      setLoading(false);
    } else {
      fetchData();
    }
  }, [isDemoMode]);

  const fetchData = async () => {
    try {
      const [accountsRes, messagesRes] = await Promise.all([
        fetch('/api/social/accounts'),
        fetch('/api/social/messages'),
      ]);

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json();
        setAccounts(accountsData.accounts);
      }

      if (messagesRes.ok) {
        const messagesData = await messagesRes.json();
        setMessages(messagesData.messages);
        
        // Group messages into conversations
        const conversationMap = new Map<string, Conversation>();
        messagesData.messages.forEach((message: SocialMessage) => {
          const threadId = message.threadId || message.senderHandle || message.id;
          if (!conversationMap.has(threadId)) {
            conversationMap.set(threadId, {
              threadId,
              platform: message.platform,
              customerName: message.customer?.name || message.senderName,
              lastMessage: message.content,
              lastMessageAt: message.platformCreatedAt,
              unreadCount: message.direction === 'INBOUND' && !message.readAt ? 1 : 0,
              messages: [message],
            });
          } else {
            const conversation = conversationMap.get(threadId)!;
            conversation.messages.push(message);
            if (new Date(message.platformCreatedAt) > new Date(conversation.lastMessageAt)) {
              conversation.lastMessage = message.content;
              conversation.lastMessageAt = message.platformCreatedAt;
            }
            if (message.direction === 'INBOUND' && !message.readAt) {
              conversation.unreadCount++;
            }
          }
        });
        
        setConversations(Array.from(conversationMap.values()));
      }
    } catch (error) {
      console.error('Error fetching social data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'FACEBOOK':
        return <Facebook className="h-4 w-4 text-blue-600" />;
      case 'INSTAGRAM':
        return <Instagram className="h-4 w-4 text-pink-600" />;
      case 'TWITTER':
        return <Twitter className="h-4 w-4 text-blue-400" />;
      case 'LINKEDIN':
        return <Linkedin className="h-4 w-4 text-blue-700" />;
      case 'YOUTUBE':
        return <Youtube className="h-4 w-4 text-red-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'FACEBOOK':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'INSTAGRAM':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'TWITTER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LINKEDIN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'YOUTUBE':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations.filter((conversation) => {
    const matchesSearch = conversation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conversation.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = !selectedPlatform || conversation.platform === selectedPlatform;
    return matchesSearch && matchesPlatform;
  });

  const selectedConversationData = conversations.find(c => c.threadId === selectedConversation);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    // Implementation for sending message
    console.log('Sending message:', newMessage);
    setNewMessage('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Social Media Inbox</h1>
            <p className="text-gray-600">Unified messaging across all platforms</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowConnectAccount(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Connect Account</span>
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Connected Accounts */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Connected Accounts</h3>
            <div className="space-y-2">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    {getPlatformIcon(account.platform)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{account.accountName}</p>
                      <p className="text-xs text-gray-500">{account._count.messages} messages</p>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${account.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="space-y-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="">All Platforms</option>
                <option value="FACEBOOK">Facebook</option>
                <option value="INSTAGRAM">Instagram</option>
                <option value="TWITTER">Twitter</option>
                <option value="LINKEDIN">LinkedIn</option>
                <option value="YOUTUBE">YouTube</option>
              </select>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <motion.div
                key={conversation.threadId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation === conversation.threadId ? 'bg-indigo-50 border-indigo-200' : ''
                }`}
                onClick={() => setSelectedConversation(conversation.threadId)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getPlatformIcon(conversation.platform)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {conversation.customerName}
                      </p>
                      <p className="text-xs text-gray-500">{formatTime(conversation.lastMessageAt)}</p>
                    </div>
                    <p className="text-sm text-gray-600 truncate mb-2">{conversation.lastMessage}</p>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPlatformColor(conversation.platform)}`}>
                        {conversation.platform}
                      </span>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversationData ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getPlatformIcon(selectedConversationData.platform)}
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {selectedConversationData.customerName}
                      </h2>
                      <p className="text-sm text-gray-500">{selectedConversationData.platform}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {selectedConversationData.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.direction === 'OUTBOUND'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs opacity-75">{formatTime(message.platformCreatedAt)}</p>
                        {message.direction === 'OUTBOUND' && (
                          <CheckCircle className="h-3 w-3 opacity-75" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 px-6 py-4">
                <div className="flex items-end space-x-3">
                  <div className="flex-1">
                    <div className="border border-gray-300 rounded-lg p-3">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        rows={2}
                        className="w-full resize-none border-none focus:ring-0 focus:outline-none text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                            <Paperclip className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                            <Image className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                            <Smile className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          <Send className="h-4 w-4" />
                          <span>Send</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-600">Choose a conversation from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
