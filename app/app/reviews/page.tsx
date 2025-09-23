import LiveAccountRequired from '@/components/app/LiveAccountRequired';
import { Star } from 'lucide-react';

export default function ReviewsPage() {
  return (
    <LiveAccountRequired
      title="Reviews Management"
      description="Monitor and manage customer reviews across all platforms to build your reputation and grow your business."
      iconName='star'
      features={[
        'Multi-platform review monitoring',
        'Automated review request campaigns',
        'Response templates and management',
        'Sentiment analysis and insights',
        'Review performance analytics',
        'Integration with Google, Yelp, Facebook'
      ]}
    />
  );
}
