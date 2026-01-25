import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CalendarDays, Calendar } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/AppHeader';
import { cn } from '@/lib/utils';

interface CalendarHeaderProps {
  currentDate: Date;
  view: 'month' | 'week';
  onViewChange: (view: 'month' | 'week') => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  canNavigateForward?: boolean;
}

export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onPreviousMonth,
  onNextMonth,
  onPreviousWeek,
  onNextWeek,
  onToday,
  canNavigateForward = true,
}: CalendarHeaderProps) {
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);

  return (
    <div className="flex flex-col">
      {/* Unified App Header */}
      <AppHeader 
        title="Flow" 
        subtitle="Period Tracker"
        rightElement={
          <Button
            variant="ghost"
            size="sm"
            onClick={onToday}
            className="text-sm text-white/80 hover:text-white hover:bg-white/20"
          >
            Today
          </Button>
        }
      />

      {/* Month Navigation & View Toggle */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPreviousMonth}
            className="h-10 w-10 rounded-xl hover:bg-secondary"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <motion.h2
            key={format(currentDate, 'yyyy-MM')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-semibold min-w-[160px] text-center"
          >
            {format(currentDate, 'MMMM yyyy')}
          </motion.h2>

          <Button
            variant="ghost"
            size="icon"
            onClick={onNextMonth}
            disabled={!canNavigateForward}
            className={cn(
              "h-10 w-10 rounded-xl hover:bg-secondary",
              !canNavigateForward && "opacity-50 cursor-not-allowed"
            )}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* View Toggle */}
        <div className="flex bg-secondary rounded-xl p-1">
          <button
            onClick={() => onViewChange('month')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              view === 'month'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Month</span>
          </button>
          <button
            onClick={() => onViewChange('week')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              view === 'week'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <CalendarDays className="w-4 h-4" />
            <span className="hidden sm:inline">Week</span>
          </button>
        </div>
      </div>

      {/* Week Navigation - Only in Week View */}
      {view === 'week' && (
        <div className="flex items-center justify-center gap-2 px-4 pb-3">
          <Button
            variant="outline"
            size="icon"
            onClick={onPreviousWeek}
            className="h-8 w-8 rounded-lg"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <motion.div
            key={format(weekStart, 'yyyy-ww')}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-4 py-1.5 bg-secondary rounded-lg text-sm font-medium min-w-[180px] text-center"
          >
            {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d')}
          </motion.div>

          <Button
            variant="outline"
            size="icon"
            onClick={onNextWeek}
            disabled={!canNavigateForward}
            className={cn(
              "h-8 w-8 rounded-lg",
              !canNavigateForward && "opacity-50 cursor-not-allowed"
            )}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
