import { useState, useCallback, useMemo } from 'react';
import { addMonths, subMonths, format, parseISO, differenceInDays } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Calendar } from 'lucide-react';
import { CalendarHeader } from './calendar/CalendarHeader';
import { MonthView } from './calendar/MonthView';
import { WeekView } from './calendar/WeekView';
import { DayEntryModal } from './entry/DayEntryModal';
import { usePeriodDataContext } from '@/contexts/PeriodDataContext';

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { getCycleStats } = usePeriodDataContext();

  const stats = useMemo(() => getCycleStats(), [getCycleStats]);

  // Calculate days until ovulation
  const ovulationInfo = useMemo(() => {
    if (!stats.predictedOvulation) return null;
    const days = differenceInDays(parseISO(stats.predictedOvulation), new Date());
    if (days < -1) return null; // Past ovulation
    return {
      days,
      date: stats.predictedOvulation,
      isToday: days === 0,
      isPast: days < 0,
    };
  }, [stats.predictedOvulation]);

  // Calculate days until period
  const periodInfo = useMemo(() => {
    if (!stats.predictedNextPeriod) return null;
    const days = differenceInDays(parseISO(stats.predictedNextPeriod), new Date());
    if (days < 0) return null;
    return { days, date: stats.predictedNextPeriod };
  }, [stats.predictedNextPeriod]);

  const handlePreviousMonth = useCallback(() => {
    setCurrentDate((prev) => subMonths(prev, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate((prev) => addMonths(prev, 1));
  }, []);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const handleDayClick = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  return (
    <div className="flex flex-col h-full pb-20">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
      />

      {/* Prominent Ovulation/Period Prediction Cards */}
      <div className="px-4 py-2 space-y-2">
        {ovulationInfo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 bg-phase-ovulation/20 rounded-2xl border border-phase-ovulation/30"
          >
            <div className="w-10 h-10 rounded-xl bg-phase-ovulation/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-phase-ovulation" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-phase-ovulation">
                {ovulationInfo.isToday
                  ? '🌟 Ovulation Day!'
                  : ovulationInfo.isPast
                  ? 'Ovulation was yesterday'
                  : `Ovulation in ${ovulationInfo.days} day${ovulationInfo.days !== 1 ? 's' : ''}`}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(parseISO(ovulationInfo.date), 'EEEE, MMM d')} • Peak fertility
              </p>
            </div>
          </motion.div>
        )}

        {periodInfo && !ovulationInfo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 bg-phase-menstrual/20 rounded-2xl border border-phase-menstrual/30"
          >
            <div className="w-10 h-10 rounded-xl bg-phase-menstrual/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-phase-menstrual" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">
                Period in {periodInfo.days} day{periodInfo.days !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-muted-foreground">
                Expected around {format(parseISO(periodInfo.date), 'EEEE, MMM d')}
              </p>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-visible scrollbar-hide">
        {view === 'month' ? (
          <MonthView currentDate={currentDate} onDayClick={handleDayClick} />
        ) : (
          <WeekView currentDate={currentDate} onDayClick={handleDayClick} />
        )}
      </div>

      {/* Day Entry Modal */}
      <AnimatePresence>
        {selectedDate && (
          <DayEntryModal
            date={selectedDate}
            onClose={() => setSelectedDate(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
