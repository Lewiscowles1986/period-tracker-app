import { motion } from 'framer-motion';
import { format, isToday, isSameMonth, isFuture, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { DayEntry, FlowIntensity } from '@/types/period';

interface DayCellProps {
  date: Date;
  currentMonth: Date;
  entry?: DayEntry;
  isInFertileWindow: boolean;
  isOvulationDay: boolean;
  isPredicted: boolean;
  onClick: () => void;
}

// Compact flow indicators (single emoji with visual weight)
const flowEmoji: Record<FlowIntensity, string> = {
  none: '',
  spotting: '💧',
  light: '🩸',
  medium: '🩸',
  heavy: '🩸',
};

const flowIntensityDots: Record<FlowIntensity, number> = {
  none: 0,
  spotting: 1,
  light: 1,
  medium: 2,
  heavy: 3,
};

export function DayCell({
  date,
  currentMonth,
  entry,
  isInFertileWindow,
  isOvulationDay,
  isPredicted,
  onClick,
}: DayCellProps) {
  const isCurrentMonth = isSameMonth(date, currentMonth);
  const today = isToday(date);
  const isFutureDate = isFuture(startOfDay(date)) && !today;
  const hasFlow = entry?.flow && entry.flow !== 'none';
  const hasMood = entry?.mood?.emoji;
  const hasSymptoms = entry?.symptoms && entry.symptoms.length > 0;
  const hasSexualActivity = entry?.sexualActivity && entry.sexualActivity.length > 0;
  const hasConfirmedOvulation = entry?.confirmedOvulation;
  const hasIntimacy = entry?.masturbation || entry?.kissing;
  
  // Count how many indicators we have
  const indicatorCount = [
    hasFlow,
    hasConfirmedOvulation || isOvulationDay,
    isInFertileWindow && !isOvulationDay && !hasConfirmedOvulation,
    isPredicted && !hasFlow && !isInFertileWindow && !isOvulationDay,
    hasMood,
    hasSexualActivity || hasIntimacy,
    hasSymptoms,
  ].filter(Boolean).length;

  // Use smaller icons when there are many indicators
  const isCompact = indicatorCount > 2;
  const iconSize = isCompact ? 'text-[10px]' : 'text-xs';

  const handleClick = () => {
    // Don't allow recording entries for future dates
    if (isFutureDate) return;
    onClick();
  };

  return (
    <motion.button
      whileTap={isFutureDate ? undefined : { scale: 0.95 }}
      onClick={handleClick}
      disabled={isFutureDate}
      className={cn(
        'relative flex flex-col items-center justify-start p-1 min-h-[72px] rounded-xl transition-all',
        'focus:outline-none focus:ring-2 focus:ring-primary/50',
        !isCurrentMonth && 'opacity-40',
        today && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        isFutureDate 
          ? 'cursor-default' 
          : 'hover:bg-secondary/50 cursor-pointer'
      )}
    >
      {/* Date Number */}
      <span
        className={cn(
          'text-sm font-medium mb-0.5',
          today && 'text-primary font-bold',
          !isCurrentMonth && 'text-muted-foreground'
        )}
      >
        {format(date, 'd')}
      </span>

      {/* Indicators Container - Flex wrap for compact display */}
      <div className="flex flex-wrap items-center justify-center gap-0.5 max-w-full">
        {/* Flow Indicator - Primary, always prominent */}
        {hasFlow && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              'flex items-center justify-center rounded-full',
              entry!.flow === 'spotting' && 'bg-rose-200 dark:bg-rose-800/50',
              entry!.flow === 'light' && 'bg-rose-300 dark:bg-rose-700/50',
              entry!.flow === 'medium' && 'bg-rose-400 dark:bg-rose-600/50',
              entry!.flow === 'heavy' && 'bg-rose-500 dark:bg-rose-500/50',
              isCompact ? 'w-5 h-5' : 'w-6 h-6'
            )}
          >
            <span className={iconSize}>{flowEmoji[entry!.flow]}</span>
            {/* Intensity dots for medium/heavy */}
            {entry!.flow === 'heavy' && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-red-600 rounded-full border border-background" />
            )}
          </motion.div>
        )}

        {/* Confirmed Ovulation */}
        {hasConfirmedOvulation && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              'rounded-full bg-phase-ovulation flex items-center justify-center shadow-sm ring-1 ring-phase-ovulation ring-offset-1 ring-offset-background',
              isCompact ? 'w-5 h-5' : 'w-6 h-6'
            )}
          >
            <span className={iconSize}>🥚</span>
          </motion.div>
        )}

        {/* Predicted Ovulation */}
        {isOvulationDay && !hasConfirmedOvulation && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              'rounded-full bg-phase-ovulation/60 flex items-center justify-center',
              isCompact ? 'w-5 h-5' : 'w-6 h-6'
            )}
          >
            <span className={iconSize}>🥚</span>
          </motion.div>
        )}

        {/* Fertile Window */}
        {isInFertileWindow && !hasFlow && !isOvulationDay && !hasConfirmedOvulation && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              'rounded-full bg-phase-ovulation/30 flex items-center justify-center',
              isCompact ? 'w-5 h-5' : 'w-6 h-6'
            )}
          >
            <span className={iconSize}>🌷</span>
          </motion.div>
        )}

        {/* Predicted Period */}
        {isPredicted && !hasFlow && !isInFertileWindow && !isOvulationDay && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              'rounded-full bg-rose-100 dark:bg-rose-900/40 border border-dashed border-rose-400 flex items-center justify-center',
              isCompact ? 'w-5 h-5' : 'w-6 h-6'
            )}
          >
            <span className={cn(isCompact ? 'text-[8px]' : 'text-[10px]')}>🩸</span>
          </motion.div>
        )}

        {/* Mood - inline with others when compact */}
        {hasMood && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(isCompact ? 'text-sm' : 'text-base')}
          >
            {entry!.mood!.emoji}
          </motion.span>
        )}

        {/* Intimacy indicators - grouped */}
        {(hasSexualActivity || hasIntimacy) && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={iconSize}
          >
            {hasSexualActivity ? '❤️' : entry?.masturbation ? '💜' : '💋'}
          </motion.span>
        )}
      </div>

      {/* Symptoms as subtle dots below - only show when not too compact */}
      {hasSymptoms && (
        <div className="flex gap-0.5 mt-0.5">
          {entry!.symptoms.slice(0, 3).map((symptom, i) => (
            <motion.div
              key={symptom}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="w-1 h-1 rounded-full bg-accent"
            />
          ))}
          {entry!.symptoms.length > 3 && (
            <span className="text-[6px] text-muted-foreground leading-none">
              +{entry!.symptoms.length - 3}
            </span>
          )}
        </div>
      )}
    </motion.button>
  );
}
