'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useDemo } from './demo-context';

interface ThemeContextType {
  currentTheme: {
    mode: string;
    highContrast: boolean;
    fontSize: string;
    customColors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    companyName: string;
    logoUrl: string;
  };
  applyTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { isDemoMode, demoSettings } = useDemo();
  const [currentTheme, setCurrentTheme] = useState({
    mode: 'light',
    highContrast: false,
    fontSize: 'medium',
    customColors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#818cf8'
    },
    companyName: 'VervidFlow',
    logoUrl: ''
  });

  // Update theme when demo settings change
  useEffect(() => {
    if (isDemoMode && demoSettings.theme) {
      setCurrentTheme(demoSettings.theme);
      applyThemeToDOM(demoSettings.theme);
    }
  }, [isDemoMode, demoSettings]);

  const applyThemeToDOM = (theme: any) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--primary-color', theme.customColors.primary);
    root.style.setProperty('--secondary-color', theme.customColors.secondary);
    root.style.setProperty('--accent-color', theme.customColors.accent);
    
    // Apply font size
    const fontSizeMap = {
      'small': '14px',
      'medium': '16px',
      'large': '18px',
      'extra-large': '20px'
    };
    root.style.setProperty('--base-font-size', fontSizeMap[theme.fontSize as keyof typeof fontSizeMap] || '16px');
    
    // Apply theme mode
    if (theme.mode === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    
    // Apply high contrast
    if (theme.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  };

  const applyTheme = () => {
    applyThemeToDOM(currentTheme);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
