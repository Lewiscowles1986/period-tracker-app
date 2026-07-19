import { useState, useCallback, useMemo } from 'react';
import { addMonths, subMonths, addWeeks, subWeeks, addYears, format, parseISO, differenceInDays, isAfter, startOfMonth, startOfWeek } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Calendar } from 'lucide-react';
import { CalendarHeader } from './calendar/CalendarHeader';
import { MonthView } from './calendar/MonthView';
import { WeekView } from './calendar/WeekView';
import { DayEntryModal } from './entry/DayEntryModal';
import { usePeriodDataContext } from '@/contexts/PeriodDataContext';

const MAX_YEARS_FORWARD = 2;

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { getCycleStats } = usePeriodDataContext();

  const stats = useMemo(() => getCycleStats(), [getCycleStats]);

  // Calculate max forward date (2 years from now)
  const maxForwardDate = useMemo(() => addYears(new Date(), MAX_YEARS_FORWARD), []);

  // Check if navigation would exceed forward limit
  const canNavigateForward = useMemo(() => {
    if (view === 'month') {
      return isAfter(maxForwardDate, startOfMonth(addMonths(currentDate, 1)));
    } else {
      return isAfter(maxForwardDate, startOfWeek(addWeeks(currentDate, 1)));
    }
  }, [currentDate, view, maxForwardDate]);

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
    if (canNavigateForward) {
      setCurrentDate((prev) => addMonths(prev, 1));
    }
  }, [canNavigateForward]);

  const handlePreviousWeek = useCallback(() => {
    setCurrentDate((prev) => subWeeks(prev, 1));
  }, []);

  const handleNextWeek = useCallback(() => {
    if (canNavigateForward) {
      setCurrentDate((prev) => addWeeks(prev, 1));
    }
  }, [canNavigateForward]);

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
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
        onToday={handleToday}
        canNavigateForward={canNavigateForward}
      />

      {/* Prominent Ovulation/Period Prediction Cards */}
      <div style={{ paddingLeft: 'var(--page-padding-x)', paddingRight: 'var(--page-padding-x)', paddingTop: '1.5rem', gap: 'var(--card-gap)' }} className="flex flex-col">
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

      <div className="flex-1 overflow-y-auto overflow-x-visible scrollbar-hide" style={{ padding: '1rem var(--page-padding-x)' }}>
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
