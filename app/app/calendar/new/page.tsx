import LiveAccountRequired from '@/components/app/LiveAccountRequired';
import { Calendar } from 'lucide-react';

export default function NewAppointmentPage() {
  return (
    <LiveAccountRequired
      title="Schedule New Appointment"
      description="Create and manage appointments with advanced scheduling features and automated customer notifications."
      icon={Calendar}
      features={[
        'Intelligent time slot recommendations',
        'Automated customer confirmations',
        'Calendar conflict detection',
        'Recurring appointment setup',
        'Service duration optimization',
        'Real-time availability updates'
      ]}
    />
  );
}
