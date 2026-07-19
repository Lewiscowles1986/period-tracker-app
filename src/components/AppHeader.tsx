import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export function AppHeader({ title, subtitle, showBack, onBack, rightElement }: AppHeaderProps) {
  return (
    <div className="bg-gradient-primary px-4 pt-10 pb-4 safe-top">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          {showBack && onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="rounded-full text-white hover:bg-white/20 mt-6"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="flex items-center gap-3 mt-6">
            <img 
              src="/logo.png" 
              className="w-10 h-10 rounded-xl object-cover bg-white/20 p-0.5 border border-white/20 shadow-sm" 
              alt="Flow Logo" 
            />
            <div>
              <h1 className="text-xl font-bold text-white leading-tight">{title}</h1>
              {subtitle && (
                <p className="text-white/70 text-sm leading-none mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
        {rightElement && (
          <div className="text-white">
            {rightElement}
          </div>
        )}
      </motion.div>
    </div>
  );
}
