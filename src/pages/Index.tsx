import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { PeriodDataProvider } from '@/contexts/PeriodDataContext';
import { BottomNav } from '@/components/BottomNav';
import { CalendarPage } from '@/components/CalendarPage';
import { InsightsPage } from '@/components/InsightsPage';
import { SettingsPage } from '@/components/SettingsPage';
import { PrivacyPolicyPage } from '@/components/PrivacyPolicyPage';
import { InstallPrompt } from '@/components/InstallPrompt';

type TabType = 'calendar' | 'insights' | 'settings';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('calendar');
  const [showPrivacy, setShowPrivacy] = useState(false);

  const renderContent = () => {
    if (showPrivacy) {
      return <PrivacyPolicyPage onBack={() => setShowPrivacy(false)} />;
    }

    switch (activeTab) {
      case 'calendar':
        return <CalendarPage />;
      case 'insights':
        return <InsightsPage />;
      case 'settings':
        return <SettingsPage onOpenPrivacy={() => setShowPrivacy(true)} />;
      default:
        return <CalendarPage />;
    }
  };

  return (
    <PeriodDataProvider>
      <div className="min-h-screen bg-background pb-20" style={{ paddingLeft: 'var(--page-padding-x)', paddingRight: 'var(--page-padding-x)' }}>
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
        {!showPrivacy && (
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        )}
        <InstallPrompt />
      </div>
    </PeriodDataProvider>
  );
};

export default Index;
