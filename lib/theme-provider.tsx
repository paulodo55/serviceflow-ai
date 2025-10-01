'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
}

interface ThemeSettings {
  mode: 'light' | 'dark' | 'system';
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  customColors: ThemeColors;
  selectedPreset: string;
  companyName: string;
  logoUrl: string;
}

interface ThemeContextType {
  theme: ThemeSettings;
  updateTheme: (settings: Partial<ThemeSettings>) => void;
  resetTheme: () => void;
}

const defaultTheme: ThemeSettings = {
  mode: 'light',
  highContrast: false,
  fontSize: 'medium',
  customColors: {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#818cf8'
  },
  selectedPreset: 'default',
  companyName: 'VervidFlow',
  logoUrl: ''
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem('appTheme');
    const demoSettings = localStorage.getItem('demoSettings');
    
    if (storedTheme) {
      try {
        setTheme(JSON.parse(storedTheme));
      } catch (error) {
        console.error('Failed to parse theme:', error);
      }
    } else if (demoSettings) {
      try {
        const demo = JSON.parse(demoSettings);
        if (demo.theme) {
          setTheme({
            mode: demo.theme.mode || 'light',
            highContrast: demo.theme.highContrast || false,
            fontSize: demo.theme.fontSize || 'medium',
            customColors: demo.theme.customColors || defaultTheme.customColors,
            selectedPreset: demo.theme.selectedPreset || 'default',
            companyName: demo.theme.companyName || 'VervidFlow',
            logoUrl: demo.theme.logoUrl || ''
          });
        }
      } catch (error) {
        console.error('Failed to parse demo settings:', error);
      }
    }
    setMounted(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    // Apply theme mode
    if (theme.mode === 'dark') {
      root.classList.add('dark');
    } else if (theme.mode === 'light') {
      root.classList.remove('dark');
    } else {
      // System preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Apply high contrast
    if (theme.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply font size
    root.setAttribute('data-font-size', theme.fontSize);
    
    // Apply custom colors as CSS variables
    root.style.setProperty('--color-primary', theme.customColors.primary);
    root.style.setProperty('--color-secondary', theme.customColors.secondary);
    root.style.setProperty('--color-accent', theme.customColors.accent);

    // Save to localStorage
    localStorage.setItem('appTheme', JSON.stringify(theme));
  }, [theme, mounted]);

  const updateTheme = (settings: Partial<ThemeSettings>) => {
    setTheme(prev => {
      const newTheme = { ...prev, ...settings };
      
      // Also update demo settings if in demo mode
      const demoSettings = localStorage.getItem('demoSettings');
      if (demoSettings) {
        try {
          const demo = JSON.parse(demoSettings);
          demo.theme = newTheme;
          localStorage.setItem('demoSettings', JSON.stringify(demo));
        } catch (error) {
          console.error('Failed to update demo settings:', error);
        }
      }
      
      return newTheme;
    });
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
    localStorage.removeItem('appTheme');
  };

  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme }}>
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

