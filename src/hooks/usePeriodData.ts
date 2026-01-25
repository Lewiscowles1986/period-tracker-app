import { useState, useEffect, useCallback } from 'react';
import {
  PeriodData,
  DayEntry,
  SavedMood,
  CycleInfo,
  CycleStats,
  DEFAULT_PERIOD_DATA,
  FlowIntensity,
} from '@/types/period';
import { format, parseISO, differenceInDays, addDays, isAfter, isBefore } from 'date-fns';

const STORAGE_KEY = 'flow-period-tracker-data';

export function usePeriodData() {
  const [data, setData] = useState<PeriodData>(() => {
    // Initialize from localStorage synchronously to avoid race conditions
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PeriodData;
        return { ...DEFAULT_PERIOD_DATA, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load period data:', error);
    }
    return DEFAULT_PERIOD_DATA;
  });
  const [isLoaded, setIsLoaded] = useState(true); // Already loaded synchronously

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('Period data saved:', Object.keys(data.entries).length, 'entries');
    } catch (error) {
      console.error('Failed to save period data:', error);
    }
  }, [data]);

  // Get entry for a specific date
  const getEntry = useCallback(
    (date: string): DayEntry | undefined => {
      return data.entries[date];
    },
    [data.entries]
  );

  // Update or create entry for a date
  const updateEntry = useCallback((date: string, entry: Partial<DayEntry>) => {
    setData((prev) => {
      const existingEntry = prev.entries[date];
      const updatedEntry: DayEntry = {
        date,
        flow: 'none',
        symptoms: [],
        ...existingEntry,
        ...entry,
        updatedAt: new Date().toISOString(),
      };

      return {
        ...prev,
        entries: {
          ...prev.entries,
          [date]: updatedEntry,
        },
      };
    });
  }, []);

  // Delete entry for a date
  const deleteEntry = useCallback((date: string) => {
    setData((prev) => {
      const { [date]: _, ...rest } = prev.entries;
      return {
        ...prev,
        entries: rest,
      };
    });
  }, []);

  // Add emoji to recent list
  const addRecentEmoji = useCallback((emoji: string) => {
    setData((prev) => {
      const filtered = prev.recentEmojis.filter((e) => e !== emoji);
      return {
        ...prev,
        recentEmojis: [emoji, ...filtered].slice(0, 20),
      };
    });
  }, []);

  // Save a custom mood
  const saveMood = useCallback((emoji: string, text: string) => {
    setData((prev) => {
      const existingIndex = prev.savedMoods.findIndex(
        (m) => m.emoji === emoji && m.text === text
      );

      if (existingIndex >= 0) {
        // Update existing mood
        const updated = [...prev.savedMoods];
        updated[existingIndex] = {
          ...updated[existingIndex],
          usageCount: updated[existingIndex].usageCount + 1,
          lastUsed: new Date().toISOString(),
        };
        return { ...prev, savedMoods: updated };
      }

      // Add new mood
      const newMood: SavedMood = {
        id: crypto.randomUUID(),
        emoji,
        text,
        usageCount: 1,
        lastUsed: new Date().toISOString(),
      };
      return {
        ...prev,
        savedMoods: [...prev.savedMoods, newMood],
      };
    });
  }, []);

  // Delete a saved mood
  const deleteSavedMood = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      savedMoods: prev.savedMoods.filter((m) => m.id !== id),
    }));
  }, []);

  // Calculate cycles from entries
  const calculateCycles = useCallback((): CycleInfo[] => {
    const entries = Object.values(data.entries)
      .filter((e) => e.flow !== 'none')
      .sort((a, b) => a.date.localeCompare(b.date));

    if (entries.length === 0) return [];

    const cycles: CycleInfo[] = [];
    let currentCycle: CycleInfo | null = null;

    entries.forEach((entry, index) => {
      const entryDate = parseISO(entry.date);
      const prevEntry = index > 0 ? entries[index - 1] : null;

      if (!currentCycle) {
        // Start first cycle
        currentCycle = { startDate: entry.date };
      } else if (prevEntry) {
        const daysSincePrev = differenceInDays(entryDate, parseISO(prevEntry.date));

        if (daysSincePrev > 5) {
          // Gap detected - end previous cycle and start new one
          currentCycle.endDate = prevEntry.date;
          currentCycle.length = differenceInDays(
            entryDate,
            parseISO(currentCycle.startDate)
          );
          cycles.push(currentCycle);
          currentCycle = { startDate: entry.date };
        }
      }
    });

    // Handle current/last cycle
    if (currentCycle) {
      const lastEntry = entries[entries.length - 1];
      const daysSinceLast = differenceInDays(new Date(), parseISO(lastEntry.date));

      if (daysSinceLast <= 5) {
        // Still in period
        cycles.push(currentCycle);
      } else {
        // Period ended
        currentCycle.endDate = lastEntry.date;
        cycles.push(currentCycle);
      }
    }

    return cycles;
  }, [data.entries]);

  // Calculate cycle statistics
  const getCycleStats = useCallback((): CycleStats => {
    const cycles = calculateCycles();
    const completedCycles = cycles.filter((c) => c.length !== undefined);

    if (completedCycles.length === 0) {
      return {
        averageCycleLength: data.settings.cycleLength,
        shortestCycle: data.settings.cycleLength,
        longestCycle: data.settings.cycleLength,
        averagePeriodLength: data.settings.periodLength,
        totalCyclesTracked: 0,
      };
    }

    const lengths = completedCycles.map((c) => c.length!);
    const avgLength = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);

    // Calculate average period length
    const periodLengths = cycles.map((c) => {
      if (!c.endDate) return data.settings.periodLength;
      return differenceInDays(parseISO(c.endDate), parseISO(c.startDate)) + 1;
    });
    const avgPeriodLength = Math.round(
      periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length
    );

    // Predict next period based on last cycle start
    const lastCycle = cycles[cycles.length - 1];
    let predictedNextPeriod: string | undefined;
    let predictedOvulation: string | undefined;
    let fertileWindowStart: string | undefined;
    let fertileWindowEnd: string | undefined;

    if (lastCycle) {
      const lastStart = parseISO(lastCycle.startDate);
      const nextPeriodDate = addDays(lastStart, avgLength);

      if (isAfter(nextPeriodDate, new Date())) {
        predictedNextPeriod = format(nextPeriodDate, 'yyyy-MM-dd');

        // Ovulation typically occurs 14 days before next period
        const ovulationDate = addDays(nextPeriodDate, -14);
        if (isAfter(ovulationDate, new Date())) {
          predictedOvulation = format(ovulationDate, 'yyyy-MM-dd');
          fertileWindowStart = format(addDays(ovulationDate, -5), 'yyyy-MM-dd');
          fertileWindowEnd = format(addDays(ovulationDate, 1), 'yyyy-MM-dd');
        }
      }
    }

    return {
      averageCycleLength: avgLength,
      shortestCycle: Math.min(...lengths),
      longestCycle: Math.max(...lengths),
      averagePeriodLength: avgPeriodLength,
      totalCyclesTracked: completedCycles.length,
      predictedNextPeriod,
      predictedOvulation,
      fertileWindowStart,
      fertileWindowEnd,
    };
  }, [calculateCycles, data.settings]);

  // Check if a date is in the fertile window
  const isInFertileWindow = useCallback(
    (date: string): boolean => {
      const stats = getCycleStats();
      if (!stats.fertileWindowStart || !stats.fertileWindowEnd) return false;

      const checkDate = parseISO(date);
      const start = parseISO(stats.fertileWindowStart);
      const end = parseISO(stats.fertileWindowEnd);

      return (
        (isAfter(checkDate, start) || date === stats.fertileWindowStart) &&
        (isBefore(checkDate, end) || date === stats.fertileWindowEnd)
      );
    },
    [getCycleStats]
  );

  // Check if a date is predicted period day
  const isPredictedPeriodDay = useCallback(
    (date: string): boolean => {
      const stats = getCycleStats();
      if (!stats.predictedNextPeriod) return false;

      const checkDate = parseISO(date);
      const periodStart = parseISO(stats.predictedNextPeriod);
      const periodEnd = addDays(periodStart, stats.averagePeriodLength - 1);

      return (
        (isAfter(checkDate, periodStart) || date === stats.predictedNextPeriod) &&
        (isBefore(checkDate, periodEnd) || date === format(periodEnd, 'yyyy-MM-dd'))
      );
    },
    [getCycleStats]
  );

  // Export data as JSON
  const exportData = useCallback((): string => {
    const exportPayload = {
      ...data,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
    return JSON.stringify(exportPayload, null, 2);
  }, [data]);

  // Import data from JSON
  const importData = useCallback(
    (jsonString: string, merge: boolean = false): boolean => {
      try {
        const imported = JSON.parse(jsonString) as PeriodData;

        if (merge) {
          setData((prev) => ({
            ...prev,
            entries: { ...prev.entries, ...imported.entries },
            savedMoods: [
              ...prev.savedMoods,
              ...imported.savedMoods.filter(
                (m) => !prev.savedMoods.some((pm) => pm.id === m.id)
              ),
            ],
            recentEmojis: [
              ...new Set([...prev.recentEmojis, ...imported.recentEmojis]),
            ].slice(0, 20),
            cycles: imported.cycles,
            settings: { ...prev.settings, ...imported.settings },
          }));
        } else {
          setData({ ...DEFAULT_PERIOD_DATA, ...imported });
        }
        return true;
      } catch (error) {
        console.error('Failed to import data:', error);
        return false;
      }
    },
    []
  );

  // Clear all data
  const clearAllData = useCallback(() => {
    setData(DEFAULT_PERIOD_DATA);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Update settings
  const updateSettings = useCallback(
    (settings: Partial<PeriodData['settings']>) => {
      setData((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...settings },
      }));
    },
    []
  );

  // Get entries for a date range
  const getEntriesInRange = useCallback(
    (startDate: string, endDate: string): DayEntry[] => {
      return Object.values(data.entries)
        .filter((e) => e.date >= startDate && e.date <= endDate)
        .sort((a, b) => a.date.localeCompare(b.date));
    },
    [data.entries]
  );

  return {
    data,
    isLoaded,
    getEntry,
    updateEntry,
    deleteEntry,
    addRecentEmoji,
    saveMood,
    deleteSavedMood,
    getCycleStats,
    isInFertileWindow,
    isPredictedPeriodDay,
    exportData,
    importData,
    clearAllData,
    updateSettings,
    getEntriesInRange,
  };
}
