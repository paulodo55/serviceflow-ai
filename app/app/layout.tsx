import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import AppLayoutClient from './AppLayoutClient';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;
  
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error('Session check failed:', error);
    // Continue with null session - let client handle demo mode
  }
  
  return (
    <AppLayoutClient session={session}>
      {children}
    </AppLayoutClient>
  );
}
