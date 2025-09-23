import LiveAccountRequired from '@/components/app/LiveAccountRequired';
import { FileText } from 'lucide-react';

export default function NewInvoicePage() {
  return (
    <LiveAccountRequired
      title="Create New Invoice"
      description="Generate professional invoices with automated payment processing and comprehensive financial tracking."
      icon={FileText}
      features={[
        'Professional invoice templates',
        'Automated payment processing',
        'Recurring billing management',
        'Tax calculation and compliance',
        'Payment status tracking',
        'Financial reporting and analytics'
      ]}
    />
  );
}
