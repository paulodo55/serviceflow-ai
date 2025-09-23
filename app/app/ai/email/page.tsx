import LiveAccountRequired from '@/components/app/LiveAccountRequired';
import { Mail } from 'lucide-react';

export default function AIEmailPage() {
  return (
    <LiveAccountRequired
      title="AI Email Assistant"
      description="Smart email composition and management powered by artificial intelligence to enhance customer communication."
      iconName='mail'
      comingSoon={true}
    />
  );
}
