import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import AppSidebar from '@/components/app/AppSidebar';
import AppHeader from '@/components/app/AppHeader';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Mode Indicator */}
      <div className="bg-blue-600 text-white text-center py-1 px-4 text-sm">
        🚀 Demo Mode - Showcasing ServiceFlow&apos;s Advanced Features
      </div>
      
      <div className="flex h-screen">
        {/* Sidebar */}
        <AppSidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <AppHeader user={session.user || { name: null, email: null, image: null }} />
          
          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
