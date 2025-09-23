import LiveAccountRequired from '@/components/app/LiveAccountRequired';
import { UserPlus } from 'lucide-react';

export default function NewCustomerPage() {
  return (
    <LiveAccountRequired
      title="Add New Customer"
      description="Create comprehensive customer profiles with advanced data management and relationship tracking capabilities."
      iconName='user-plus'
      features={[
        'Complete customer profile management',
        'Service history and preferences',
        'Automated communication workflows',
        'Customer segmentation and tagging',
        'Lifetime value calculations',
        'Integration with marketing tools'
      ]}
    />
  );
}
