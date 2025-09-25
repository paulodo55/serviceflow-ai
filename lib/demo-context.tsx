'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface DemoUser {
  id: string;
  name: string;
  email: string;
  organizationId: string;
  organization: string;
  plan: string;
  role: string;
}

interface DemoContextType {
  isDemoMode: boolean;
  demoUser: DemoUser | null;
  setDemoMode: (enabled: boolean) => void;
  exitDemo: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null);

  const exitDemo = () => {
    setIsDemoMode(false);
    setDemoUser(null);
    localStorage.removeItem('demoMode');
    localStorage.removeItem('demoUser');
  };

  useEffect(() => {
    // Check if demo mode is enabled on mount
    const demoModeEnabled = localStorage.getItem('demoMode') === 'true';
    const storedDemoUser = localStorage.getItem('demoUser');
    
    if (demoModeEnabled && storedDemoUser) {
      try {
        const user = JSON.parse(storedDemoUser);
        setIsDemoMode(true);
        setDemoUser(user);
      } catch (error) {
        console.error('Failed to parse demo user:', error);
        exitDemo();
      }
    }
  }, []);

  const setDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled);
    if (enabled) {
      localStorage.setItem('demoMode', 'true');
    } else {
      localStorage.removeItem('demoMode');
      localStorage.removeItem('demoUser');
      setDemoUser(null);
    }
  };

  return (
    <DemoContext.Provider value={{ isDemoMode, demoUser, setDemoMode, exitDemo }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}

// Hook to check if user should have access to features
export function useFeatureAccess() {
  const { isDemoMode } = useDemo();
  
  // In demo mode, all features are accessible
  // In production, you'd check actual user permissions
  return {
    hasAccess: isDemoMode, // For now, only demo users have full access
    isDemo: isDemoMode
  };
}
