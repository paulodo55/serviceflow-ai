'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

export default function GoogleCalendarConnectButton() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Get Google Calendar auth URL
      const response = await fetch('/api/google-calendar/auth');
      const data = await response.json();

      if (data.authUrl) {
        // Open Google OAuth in new window
        window.open(data.authUrl, 'google-calendar-auth', 'width=500,height=600');
        
        // Listen for auth completion (you'd implement this based on your flow)
        // For now, we'll simulate success after a delay
        setTimeout(() => {
          setIsConnected(true);
          setIsConnecting(false);
        }, 3000);
      } else {
        throw new Error('Failed to get auth URL');
      }
    } catch (err) {
      console.error('Google Calendar connection error:', err);
      setError('Failed to connect to Google Calendar');
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    // TODO: Implement disconnect logic
    setIsConnected(false);
    setError(null);
  };

  if (isConnected) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Connected</span>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="flex items-center space-x-1 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleConnect}
        disabled={isConnecting}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
      >
        {isConnecting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <Calendar className="h-4 w-4" />
            <span>Connect Google Calendar</span>
            <ExternalLink className="h-3 w-3" />
          </>
        )}
      </motion.button>
      
      <p className="text-xs text-gray-500 max-w-xs">
        Sync appointments with your Google Calendar for seamless scheduling
      </p>
    </div>
  );
}
