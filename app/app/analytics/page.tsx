import LiveAccountRequired from '@/components/app/LiveAccountRequired';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <LiveAccountRequired
      title="Advanced Analytics"
      description="Gain deep insights into your business performance with comprehensive analytics and reporting tools."
      icon={BarChart3}
      features={[
        'Real-time business intelligence dashboards',
        'Customer lifecycle and retention analysis',
        'Revenue forecasting and trends',
        'Service performance metrics',
        'Custom report builder',
        'Data export and API access'
      ]}
    />
  );
}
