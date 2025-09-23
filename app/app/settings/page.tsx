'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import SettingsLayout from '@/components/app/settings/SettingsLayout';
import PersonalPreferences from '@/components/app/settings/PersonalPreferences';
import AppearanceTheme from '@/components/app/settings/AppearanceTheme';
import NotificationsCommunication from '@/components/app/settings/NotificationsCommunication';
import PrivacySecurity from '@/components/app/settings/PrivacySecurity';
import IntegrationWorkflow from '@/components/app/settings/IntegrationWorkflow';
import AdvancedSettings from '@/components/app/settings/AdvancedSettings';

export type SettingsTab = 
  | 'personal'
  | 'appearance'
  | 'notifications'
  | 'privacy'
  | 'integrations'
  | 'advanced';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('personal');

  const renderContent = () => {
    switch (activeTab) {
      case 'personal':
        return <PersonalPreferences />;
      case 'appearance':
        return <AppearanceTheme />;
      case 'notifications':
        return <NotificationsCommunication />;
      case 'privacy':
        return <PrivacySecurity />;
      case 'integrations':
        return <IntegrationWorkflow />;
      case 'advanced':
        return <AdvancedSettings />;
      default:
        return <PersonalPreferences />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SettingsLayout activeTab={activeTab} onTabChange={setActiveTab}>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1"
        >
          {renderContent()}
        </motion.div>
      </SettingsLayout>
    </div>
  );
}
