import LiveAccountRequired from '@/components/app/LiveAccountRequired';
import { MessageSquare } from 'lucide-react';

export default function NewMessagePage() {
  return (
    <LiveAccountRequired
      title="Send New Message"
      description="Communicate with customers through multiple channels with advanced messaging and automation features."
      icon={MessageSquare}
      features={[
        'Multi-channel messaging (SMS, Email, Chat)',
        'Message templates and automation',
        'Conversation history tracking',
        'Bulk messaging campaigns',
        'Response time analytics',
        'Integration with communication platforms'
      ]}
    />
  );
}
