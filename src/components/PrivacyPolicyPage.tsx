import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, Trash2 } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export function PrivacyPolicyPage({ onBack }: PrivacyPolicyPageProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Unified Header */}
      <AppHeader 
        title="Privacy Policy" 
        subtitle="Last updated: January 2026"
        showBack
        onBack={onBack}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 p-4 pb-24 space-y-6"
      >
        {/* Hero Section */}
        <motion.div
          variants={itemVariants}
          className="bg-card p-6 rounded-3xl border border-border"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold">Your Privacy Matters</p>
              <p className="text-muted-foreground">
                We do not collect, share, or sell any of your data. Period.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Key Points */}
        <motion.div variants={itemVariants} className="space-y-4">
          <PrivacyCard
            icon={<Database className="w-6 h-6" />}
            title="100% Local Storage"
            description="All your data is stored exclusively on your device. Nothing is ever sent to external servers, cloud services, or third parties."
          />

          <PrivacyCard
            icon={<Lock className="w-6 h-6" />}
            title="No Account Required"
            description="Flow works completely offline without any registration, login, or account creation. Your identity remains completely anonymous."
          />

          <PrivacyCard
            icon={<Eye className="w-6 h-6" />}
            title="No Tracking or Analytics"
            description="We don't use cookies, analytics services, or any tracking mechanisms. We have no idea who uses this app or how they use it."
          />

          <PrivacyCard
            icon={<Trash2 className="w-6 h-6" />}
            title="You Control Your Data"
            description="Export your data anytime as a JSON file for backup. Clear all data instantly from the Settings page. It's your data—you're in complete control."
          />
        </motion.div>

        {/* Detailed Policy */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="bg-card p-5 rounded-2xl border border-border space-y-4">
            <h2 className="text-lg font-semibold">Why We Built It This Way</h2>
            <p className="text-muted-foreground leading-relaxed">
              We understand that period tracking involves deeply personal and sensitive health information. In a world where data breaches are common and companies monetize personal data, we believe you deserve better.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Flow was designed from the ground up with privacy as the core principle. By keeping all data on your device, we've made it technically impossible for anyone—including us—to access your information.
            </p>
          </div>

          <div className="bg-card p-5 rounded-2xl border border-border space-y-4">
            <h2 className="text-lg font-semibold">What Data Is Stored</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Period dates and flow intensity</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Mood entries and custom moods you create</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Symptoms, energy levels, and sleep quality</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Personal notes you add to entries</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>App preferences and settings</span>
              </li>
            </ul>
            <p className="text-sm text-muted-foreground italic">
              All of this stays on your device in your browser's local storage.
            </p>
          </div>

          <div className="bg-card p-5 rounded-2xl border border-border space-y-4">
            <h2 className="text-lg font-semibold">Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              Flow does not integrate with any third-party services, APIs, or analytics platforms. The app functions entirely offline once loaded, and no network requests are made to transmit your data.
            </p>
          </div>

          <div className="bg-card p-5 rounded-2xl border border-border space-y-4">
            <h2 className="text-lg font-semibold">Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this privacy policy or how Flow handles your data, please reach out to us. We're committed to transparency and are happy to address any concerns.
            </p>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          variants={itemVariants}
          className="text-center text-sm text-muted-foreground pt-4"
        >
          <p>🌸 Flow Period Tracker</p>
          <p>Built with privacy in mind, by design.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}

interface PrivacyCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function PrivacyCard({ icon, title, description }: PrivacyCardProps) {
  return (
    <div className="flex items-start gap-4 p-4 bg-card rounded-2xl border border-border">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
