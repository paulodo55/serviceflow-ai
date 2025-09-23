import LiveAccountRequired from '@/components/app/LiveAccountRequired';
import { Mail } from 'lucide-react';

export default function EmailCampaignPage() {
  return (
    <LiveAccountRequired
      title="Email Marketing Campaign"
      description="Create and manage professional email marketing campaigns to engage customers and grow your business."
      icon={Mail}
      features={[
        'Professional email templates',
        'Customer segmentation and targeting',
        'A/B testing and optimization',
        'Automated drip campaigns',
        'Open and click tracking',
        'Campaign performance analytics'
      ]}
    />
  );
}
