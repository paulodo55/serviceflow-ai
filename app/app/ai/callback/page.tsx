import LiveAccountRequired from '@/components/app/LiveAccountRequired';
import { Phone } from 'lucide-react';

export default function AICallbackPage() {
  return (
    <LiveAccountRequired
      title="AI Callback Assistant"
      description="Intelligent automated callback system powered by advanced AI to handle customer inquiries and follow-ups."
      iconName='phone'
      comingSoon={true}
    />
  );
}
