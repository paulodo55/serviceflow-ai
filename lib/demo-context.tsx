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

interface DemoSettings {
  theme: {
    mode: string;
    highContrast: boolean;
    fontSize: string;
    customColors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    selectedPreset: string;
    companyName: string;
    logoUrl: string;
  };
  personal: {
    displayName: string;
    email: string;
    firstName: string;
    lastName: string;
    jobTitle: string;
    phoneNumber: string;
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: string;
    currency: string;
    recordsPerPage: number;
    defaultLandingPage: string;
  };
  notifications: any;
  privacy: any;
  integrations: any;
  advanced: any;
}

interface DemoContextType {
  isDemoMode: boolean;
  demoUser: DemoUser | null;
  demoSettings: DemoSettings;
  setDemoMode: (enabled: boolean) => void;
  updateDemoSettings: (category: keyof DemoSettings, settings: any) => void;
  exitDemo: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null);
  const [demoSettings, setDemoSettings] = useState<DemoSettings>({
    theme: {
      mode: 'light',
      highContrast: false,
      fontSize: 'medium',
      customColors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#F59E0B'
      },
      selectedPreset: 'default',
      companyName: 'VervidFlow',
      logoUrl: ''
    },
    personal: {
      displayName: 'Paul Odo',
      email: 'demo@vervidai.com',
      firstName: 'Paul',
      lastName: 'Odo',
      jobTitle: 'CRM Administrator',
      phoneNumber: '+1 (555) 123-4567',
      language: 'en',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12',
      currency: 'USD',
      recordsPerPage: 50,
      defaultLandingPage: '/app'
    },
    notifications: {},
    privacy: {},
    integrations: {},
    advanced: {}
  });

  const updateDemoSettings = (category: keyof DemoSettings, settings: any) => {
    setDemoSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], ...settings }
    }));
    
    // Persist settings to localStorage
    if (isDemoMode) {
      const updatedSettings = {
        ...demoSettings,
        [category]: { ...demoSettings[category], ...settings }
      };
      localStorage.setItem('demoSettings', JSON.stringify(updatedSettings));
    }
  };

  const exitDemo = () => {
    setIsDemoMode(false);
    setDemoUser(null);
    setDemoSettings({
      theme: {
        mode: 'light',
        highContrast: false,
        fontSize: 'medium',
        customColors: {
          primary: '#3B82F6',
          secondary: '#10B981',
          accent: '#F59E0B'
        },
        selectedPreset: 'default',
        companyName: 'VervidFlow',
        logoUrl: ''
      },
      personal: {
        displayName: 'Paul Odo',
        email: 'demo@vervidai.com',
        firstName: 'Paul',
        lastName: 'Odo',
        jobTitle: 'CRM Administrator',
        phoneNumber: '+1 (555) 123-4567',
        language: 'en',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12',
        currency: 'USD',
        recordsPerPage: 50,
        defaultLandingPage: '/app'
      },
      notifications: {},
      privacy: {},
      integrations: {},
      advanced: {}
    });
    localStorage.removeItem('demoMode');
    localStorage.removeItem('demoUser');
    localStorage.removeItem('demoSettings');
  };

  useEffect(() => {
    // Check if demo mode is enabled on mount
    const demoModeEnabled = localStorage.getItem('demoMode') === 'true';
    const storedDemoUser = localStorage.getItem('demoUser');
    const storedDemoSettings = localStorage.getItem('demoSettings');
    
    if (demoModeEnabled && storedDemoUser) {
      try {
        const user = JSON.parse(storedDemoUser);
        setIsDemoMode(true);
        setDemoUser(user);
        
        // Load saved settings if they exist
        if (storedDemoSettings) {
          const settings = JSON.parse(storedDemoSettings);
          setDemoSettings(settings);
        }
      } catch (error) {
        console.error('Failed to parse demo user or settings:', error);
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
    <DemoContext.Provider value={{ isDemoMode, demoUser, demoSettings, setDemoMode, updateDemoSettings, exitDemo }}>
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
