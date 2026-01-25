import { motion } from 'framer-motion';
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isToday,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { usePeriodDataContext } from '@/contexts/PeriodDataContext';
import {
  FLOW_LABELS,
  FlowIntensity,
  SYMPTOM_LABELS,
  SYMPTOM_EMOJIS,
} from '@/types/period';

interface WeekViewProps {
  currentDate: Date;
  onDayClick: (date: Date) => void;
}

const flowColors: Record<FlowIntensity, string> = {
  none: 'bg-secondary',
  spotting: 'bg-flow-spotting',
  light: 'bg-flow-light',
  medium: 'bg-flow-medium',
  heavy: 'bg-flow-heavy',
};

export function WeekView({ currentDate, onDayClick }: WeekViewProps) {
  const { getEntry, isInFertileWindow, isPredictedPeriodDay, getCycleStats } = usePeriodDataContext();

  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return (
    <motion.div
      key={format(weekStart, 'yyyy-ww')}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="px-4 py-2 space-y-3 overflow-visible"
    >
      {days.map((day, index) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const entry = getEntry(dateStr);
        const today = isToday(day);
        const inFertileWindow = isInFertileWindow(dateStr);
        const isPredicted = isPredictedPeriodDay(dateStr);
        const stats = getCycleStats();
        const isOvulationDay = stats.predictedOvulation === dateStr;
        const hasFlow = entry?.flow && entry.flow !== 'none';
        const hasConfirmedOvulation = entry?.confirmedOvulation;

        return (
          <motion.button
            key={dateStr}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onDayClick(day)}
            className={cn(
              'w-full p-4 rounded-2xl text-left transition-all',
              'bg-card border border-border hover:border-primary/30 hover:shadow-soft',
              today && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
            )}
          >
            {/* Date Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex flex-col items-center justify-center',
                    today ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                  )}
                >
                  <span className="text-xs font-medium opacity-80">
                    {format(day, 'EEE')}
                  </span>
                  <span className="text-lg font-bold">{format(day, 'd')}</span>
                </div>
                <div>
                  <p className="font-medium">{format(day, 'EEEE')}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(day, 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="flex items-center gap-2">
                {hasFlow && (
                  <span
                    className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium text-white',
                      entry!.flow === 'spotting' && 'bg-rose-400',
                      entry!.flow === 'light' && 'bg-rose-500',
                      entry!.flow === 'medium' && 'bg-red-600',
                      entry!.flow === 'heavy' && 'bg-red-700'
                    )}
                  >
                    {entry!.flow === 'spotting' && '🩸'}
                    {entry!.flow === 'light' && '🩸🩸'}
                    {entry!.flow === 'medium' && '🩸🩸🩸'}
                    {entry!.flow === 'heavy' && '🩸🩸🩸🩸'}
                    {' '}{FLOW_LABELS[entry!.flow]}
                  </span>
                )}
                {/* Confirmed Ovulation - shows even with flow */}
                {hasConfirmedOvulation && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-phase-ovulation text-white ring-2 ring-phase-ovulation ring-offset-1">
                    🥚 Ovulation
                  </span>
                )}
                {/* Predicted Ovulation - only when not confirmed */}
                {isOvulationDay && !hasConfirmedOvulation && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-phase-ovulation/60 text-white">
                    🥚 Ovulation
                  </span>
                )}
                {inFertileWindow && !isOvulationDay && !hasConfirmedOvulation && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-phase-ovulation/30">
                    🌷 Fertile
                  </span>
                )}
                {isPredicted && !hasFlow && !inFertileWindow && !isOvulationDay && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-dashed border-rose-400">
                    🩸 Predicted
                  </span>
                )}
              </div>
            </div>

            {/* Entry Details */}
            {entry && (
              <div className="space-y-2">
                {/* Mood */}
                {entry.mood && (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{entry.mood.emoji}</span>
                    {entry.mood.text && (
                      <span className="text-sm text-muted-foreground">
                        {entry.mood.text}
                      </span>
                    )}
                  </div>
                )}

                {/* Symptoms */}
                {entry.symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {entry.symptoms.map((symptom) => (
                      <span
                        key={symptom}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary text-sm"
                      >
                        <span>{SYMPTOM_EMOJIS[symptom]}</span>
                        <span>{SYMPTOM_LABELS[symptom]}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Energy & Sleep */}
                {(entry.energyLevel || entry.sleepQuality) && (
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {entry.energyLevel && (
                      <span>
                        ⚡ Energy: {entry.energyLevel}/5
                      </span>
                    )}
                    {entry.sleepQuality && (
                      <span>
                        😴 Sleep: {entry.sleepQuality}
                      </span>
                    )}
                  </div>
                )}

                {/* Sexual Activity */}
                {entry.sexualActivity && entry.sexualActivity.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-1 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
                      ❤️ {entry.sexualActivity.length} {entry.sexualActivity.length === 1 ? 'activity' : 'activities'}
                    </span>
                  </div>
                )}

                {/* Notes */}
                {entry.notes && (
                  <p className="text-sm text-muted-foreground italic line-clamp-2">
                    "{entry.notes}"
                  </p>
                )}
              </div>
            )}

            {/* Empty State */}
            {!entry && !hasFlow && (
              <p className="text-sm text-muted-foreground">
                Tap to log your day
              </p>
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
}
