import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if on iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (isIOSDevice && !isStandalone) {
      // Check if we've shown the iOS prompt before
      const hasShownIOSPrompt = localStorage.getItem('flow-ios-prompt-shown');
      if (!hasShownIOSPrompt) {
        setIsIOS(true);
        setTimeout(() => setShowPrompt(true), 3000);
      }
    }

    // Listen for beforeinstallprompt event (Chrome/Edge/Android)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Check if we've dismissed the prompt recently
      const lastDismissed = localStorage.getItem('flow-install-prompt-dismissed');
      if (lastDismissed) {
        const daysSinceDismissed =
          (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissed < 7) return;
      }

      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;

      if (result.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('flow-install-prompt-dismissed', Date.now().toString());

    if (isIOS) {
      localStorage.setItem('flow-ios-prompt-shown', 'true');
    }
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-20 left-4 right-4 z-50"
      >
        <div className="bg-card rounded-3xl p-5 shadow-xl border border-border">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🌸</span>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg">Install Flow</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {isIOS
                  ? 'Add to your home screen for the best experience'
                  : 'Install the app for quick access and offline use'}
              </p>

              {isIOS ? (
                <div className="mt-3 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <span>1. Tap</span>
                    <Share className="w-4 h-4" />
                    <span>Share</span>
                  </p>
                  <p className="flex items-center gap-2 mt-1">
                    <span>2. Select "Add to Home Screen"</span>
                  </p>
                </div>
              ) : (
                <div className="flex gap-2 mt-3">
                  <Button
                    onClick={handleInstall}
                    className="bg-gradient-primary hover:opacity-90"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Install
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleDismiss}>
                    Not now
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
