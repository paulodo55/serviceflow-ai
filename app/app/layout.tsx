import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import AppLayoutClient from './AppLayoutClient';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  return (
    <AppLayoutClient session={session}>
      {children}
    </AppLayoutClient>
  );
}
