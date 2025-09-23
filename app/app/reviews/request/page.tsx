import LiveAccountRequired from '@/components/app/LiveAccountRequired';
import { Star } from 'lucide-react';

export default function ReviewRequestPage() {
  return (
    <LiveAccountRequired
      title="Request Customer Review"
      description="Automate review requests to build your online reputation and attract more customers through positive feedback."
      icon={Star}
      features={[
        'Automated review request campaigns',
        'Multi-platform review collection',
        'Customizable request templates',
        'Timing optimization for best results',
        'Review response management',
        'Reputation monitoring and alerts'
      ]}
    />
  );
}
