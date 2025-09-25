'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Session } from 'next-auth';
import AppSidebar from '@/components/app/AppSidebar';
import AppHeader from '@/components/app/AppHeader';

interface AppLayoutClientProps {
  session: Session | null;
  children: React.ReactNode;
}

interface DemoUser {
  id: string;
  name: string;
  email: string;
  organizationId: string;
  organization: string;
  plan: string;
  role: string;
}

export default function AppLayoutClient({ session, children }: AppLayoutClientProps) {
  const router = useRouter();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for demo mode in localStorage (client-side only)
    const demoModeEnabled = localStorage.getItem('demoMode') === 'true';
    const storedDemoUser = localStorage.getItem('demoUser');
    
    if (demoModeEnabled && storedDemoUser) {
      try {
        const user = JSON.parse(storedDemoUser);
        setIsDemoMode(true);
        setDemoUser(user);
      } catch (error) {
        console.error('Failed to parse demo user:', error);
        localStorage.removeItem('demoMode');
        localStorage.removeItem('demoUser');
      }
    }

    // Check authentication on client side
    if (!session && !demoModeEnabled) {
      router.push('/login');
      return;
    }
    setIsLoading(false);
  }, [session, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Determine user data (session user or demo user)
  const user = session?.user || {
    name: demoUser?.name || 'Demo User',
    email: demoUser?.email || 'demo@vervidai.com',
    image: null
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Mode Indicator - only show in demo mode */}
      {isDemoMode && (
        <div className="bg-blue-600 text-white text-center py-1 px-4 text-sm">
          🚀 Demo Mode - Showcasing VervidFlow&apos;s Advanced Features
        </div>
      )}
      
      <div className="flex h-screen">
        {/* Sidebar */}
        <AppSidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <AppHeader user={user} />
          
          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
