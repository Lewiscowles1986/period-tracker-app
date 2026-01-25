import React, { createContext, useContext, ReactNode } from 'react';
import { usePeriodData } from '@/hooks/usePeriodData';

type PeriodDataContextType = ReturnType<typeof usePeriodData>;

const PeriodDataContext = createContext<PeriodDataContextType | null>(null);

interface PeriodDataProviderProps {
  children: ReactNode;
}

export function PeriodDataProvider({ children }: PeriodDataProviderProps) {
  const periodData = usePeriodData();

  return (
    <PeriodDataContext.Provider value={periodData}>
      {children}
    </PeriodDataContext.Provider>
  );
}

export function usePeriodDataContext() {
  const context = useContext(PeriodDataContext);
  if (!context) {
    throw new Error('usePeriodDataContext must be used within a PeriodDataProvider');
  }
  return context;
}
