import { motion } from 'framer-motion';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
} from 'date-fns';
import { DayCell } from './DayCell';
import { usePeriodDataContext } from '@/contexts/PeriodDataContext';

interface MonthViewProps {
  currentDate: Date;
  onDayClick: (date: Date) => void;
}

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function MonthView({ currentDate, onDayClick }: MonthViewProps) {
  const { getEntry, isInFertileWindow, isPredictedPeriodDay, getCycleStats } = usePeriodDataContext();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <motion.div
      key={format(currentDate, 'yyyy-MM')}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="px-4 py-2 overflow-visible"
    >
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 p-1 -m-1 overflow-visible">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const entry = getEntry(dateStr);
          const stats = getCycleStats();
          const isOvulationDay = stats.predictedOvulation === dateStr;

          return (
            <DayCell
              key={dateStr}
              date={day}
              currentMonth={currentDate}
              entry={entry}
              isInFertileWindow={isInFertileWindow(dateStr)}
              isOvulationDay={isOvulationDay}
              isPredicted={isPredictedPeriodDay(dateStr)}
              onClick={() => onDayClick(day)}
            />
          );
        })}
      </div>
    </motion.div>
  );
}
