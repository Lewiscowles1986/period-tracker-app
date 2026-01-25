import { useState, useEffect, useCallback } from 'react';
import {
  PeriodData,
  DayEntry,
  SavedMood,
  SavedSymptom,
  CycleInfo,
  CycleStats,
  FutureCyclePrediction,
  DEFAULT_PERIOD_DATA,
  DEFAULT_PREDICTION_SETTINGS,
  FlowIntensity,
} from '@/types/period';
import { format, parseISO, differenceInDays, addDays, addMonths, isAfter, isBefore } from 'date-fns';

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

  // Save a custom symptom
  const saveSymptom = useCallback((emoji: string, text: string) => {
    setData((prev) => {
      const existingIndex = prev.savedSymptoms.findIndex(
        (s) => s.emoji === emoji && s.text === text
      );

      if (existingIndex >= 0) {
        // Update existing symptom
        const updated = [...prev.savedSymptoms];
        updated[existingIndex] = {
          ...updated[existingIndex],
          usageCount: updated[existingIndex].usageCount + 1,
          lastUsed: new Date().toISOString(),
        };
        return { ...prev, savedSymptoms: updated };
      }

      // Add new symptom
      const newSymptom: SavedSymptom = {
        id: crypto.randomUUID(),
        emoji,
        text,
        usageCount: 1,
        lastUsed: new Date().toISOString(),
      };
      return {
        ...prev,
        savedSymptoms: [...prev.savedSymptoms, newSymptom],
      };
    });
  }, []);

  // Delete a saved symptom
  const deleteSavedSymptom = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      savedSymptoms: prev.savedSymptoms.filter((s) => s.id !== id),
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
    const predictionSettings = data.settings.predictions || DEFAULT_PREDICTION_SETTINGS;

    if (completedCycles.length === 0) {
      return {
        averageCycleLength: data.settings.cycleLength,
        shortestCycle: data.settings.cycleLength,
        longestCycle: data.settings.cycleLength,
        averagePeriodLength: data.settings.periodLength,
        totalCyclesTracked: 0,
        futurePredictions: [],
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

    // Generate future predictions
    const futurePredictions: FutureCyclePrediction[] = [];
    let predictedNextPeriod: string | undefined;
    let predictedOvulation: string | undefined;
    let fertileWindowStart: string | undefined;
    let fertileWindowEnd: string | undefined;

    if (predictionSettings.enabled) {
      const lastCycle = cycles[cycles.length - 1];
      
      if (lastCycle) {
        const today = new Date();
        const maxPredictionDate = addMonths(today, predictionSettings.monthsAhead);
        let currentCycleStart = parseISO(lastCycle.startDate);
        let cycleNumber = 0;

        // Generate predictions up to the specified months ahead
        while (cycleNumber < 50) { // Safety limit
          const nextPeriodStart = addDays(currentCycleStart, avgLength);
          
          if (isAfter(nextPeriodStart, maxPredictionDate)) {
            break;
          }

          cycleNumber++;
          const periodEnd = addDays(nextPeriodStart, avgPeriodLength - 1);
          const ovulationDate = addDays(nextPeriodStart, avgLength - 14);
          const fertileStart = addDays(ovulationDate, -5);
          const fertileEnd = addDays(ovulationDate, 1);

          // Only add future predictions
          if (isAfter(nextPeriodStart, today)) {
            const prediction: FutureCyclePrediction = {
              cycleNumber,
              periodStart: format(nextPeriodStart, 'yyyy-MM-dd'),
              periodEnd: format(periodEnd, 'yyyy-MM-dd'),
              ovulationDate: format(ovulationDate, 'yyyy-MM-dd'),
              fertileWindowStart: format(fertileStart, 'yyyy-MM-dd'),
              fertileWindowEnd: format(fertileEnd, 'yyyy-MM-dd'),
            };
            futurePredictions.push(prediction);

            // Set first future prediction as "next" for backward compatibility
            if (cycleNumber === 1 || !predictedNextPeriod) {
              if (isAfter(nextPeriodStart, today)) {
                predictedNextPeriod = prediction.periodStart;
                if (isAfter(ovulationDate, today)) {
                  predictedOvulation = prediction.ovulationDate;
                  fertileWindowStart = prediction.fertileWindowStart;
                  fertileWindowEnd = prediction.fertileWindowEnd;
                }
              }
            }
          }

          currentCycleStart = nextPeriodStart;
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
      futurePredictions,
    };
  }, [calculateCycles, data.settings]);

  // Check if a date is in the fertile window (checks all future predictions)
  const isInFertileWindow = useCallback(
    (date: string): boolean => {
      const stats = getCycleStats();
      const predictionSettings = data.settings.predictions || DEFAULT_PREDICTION_SETTINGS;
      
      if (!predictionSettings.enabled || !predictionSettings.showFertileWindows) return false;
      
      const checkDate = parseISO(date);

      // Check all future predictions
      for (const prediction of stats.futurePredictions) {
        const start = parseISO(prediction.fertileWindowStart);
        const end = parseISO(prediction.fertileWindowEnd);
        
        if (
          (isAfter(checkDate, start) || date === prediction.fertileWindowStart) &&
          (isBefore(checkDate, end) || date === prediction.fertileWindowEnd)
        ) {
          return true;
        }
      }

      return false;
    },
    [getCycleStats, data.settings.predictions]
  );

  // Check if a date is predicted period day (checks all future predictions)
  const isPredictedPeriodDay = useCallback(
    (date: string): boolean => {
      const stats = getCycleStats();
      const predictionSettings = data.settings.predictions || DEFAULT_PREDICTION_SETTINGS;
      
      if (!predictionSettings.enabled || !predictionSettings.showFuturePeriods) return false;

      const checkDate = parseISO(date);

      // Check all future predictions
      for (const prediction of stats.futurePredictions) {
        const periodStart = parseISO(prediction.periodStart);
        const periodEnd = parseISO(prediction.periodEnd);
        
        if (
          (isAfter(checkDate, periodStart) || date === prediction.periodStart) &&
          (isBefore(checkDate, periodEnd) || date === prediction.periodEnd)
        ) {
          return true;
        }
      }

      return false;
    },
    [getCycleStats, data.settings.predictions]
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
            savedSymptoms: [
              ...prev.savedSymptoms,
              ...(imported.savedSymptoms || []).filter(
                (s) => !prev.savedSymptoms.some((ps) => ps.id === s.id)
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
    saveSymptom,
    deleteSavedSymptom,
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
