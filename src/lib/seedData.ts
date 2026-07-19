import { DayEntry, PeriodData, FlowIntensity, Symptom, PRESET_MOODS } from '@/types/period';
import { format, subDays, addDays } from 'date-fns';

export function generateSeedData(): PeriodData {
  const today = new Date();
  const entries: Record<string, DayEntry> = {};

  // We want to generate 4 cycles of 28 days each.
  // Cycle 1: starts 110 days ago (D-110 to D-83)
  // Cycle 2: starts 82 days ago (D-82 to D-55)
  // Cycle 3: starts 54 days ago (D-54 to D-27)
  // Cycle 4: starts 26 days ago (D-26 to D-1)
  // Today is D (Day 27 of Cycle 4). A new period is expected tomorrow.

  const cycleStarts = [
    subDays(today, 110),
    subDays(today, 82),
    subDays(today, 54),
    subDays(today, 26),
  ];

  cycleStarts.forEach((cycleStart, cycleIndex) => {
    // 1. Period days (Days 1 to 5)
    const periodDays = [
      { flow: 'medium' as FlowIntensity, symptoms: ['cramps', 'fatigue'] as Symptom[], mood: 'tired', energy: 2, sleep: 'fair' },
      { flow: 'heavy' as FlowIntensity, symptoms: ['cramps', 'bloating', 'back_pain'] as Symptom[], mood: 'irritable', energy: 1, sleep: 'poor' },
      { flow: 'heavy' as FlowIntensity, symptoms: ['cramps', 'headache'] as Symptom[], mood: 'sad', energy: 2, sleep: 'fair' },
      { flow: 'light' as FlowIntensity, symptoms: ['fatigue'] as Symptom[], mood: 'calm', energy: 3, sleep: 'good' },
      { flow: 'spotting' as FlowIntensity, symptoms: [] as Symptom[], mood: 'happy', energy: 4, sleep: 'good' },
    ];

    periodDays.forEach((dayData, idx) => {
      const dateStr = format(addDays(cycleStart, idx), 'yyyy-MM-dd');
      entries[dateStr] = {
        date: dateStr,
        flow: dayData.flow,
        symptoms: dayData.symptoms,
        mood: { emoji: PRESET_MOODS[dayData.mood as keyof typeof PRESET_MOODS] || '😐', text: dayData.mood },
        energyLevel: dayData.energy as any,
        sleepQuality: dayData.sleep as any,
        temperature: 36.2 + (idx * 0.1),
        weight: 60.5 + (idx * 0.1),
        updatedAt: new Date().toISOString(),
      };
    });

    // 2. Follicular phase (Days 6 to 11)
    for (let i = 5; i < 11; i++) {
      const dateStr = format(addDays(cycleStart, i), 'yyyy-MM-dd');
      // Occasional random mood / sleep
      const moods = ['happy', 'energetic', 'calm'];
      const randomMood = moods[Math.floor(Math.random() * moods.length)];
      entries[dateStr] = {
        date: dateStr,
        flow: 'none',
        symptoms: [],
        mood: { emoji: PRESET_MOODS[randomMood as keyof typeof PRESET_MOODS] || '😊', text: randomMood },
        energyLevel: 4,
        sleepQuality: 'good',
        temperature: 36.4 + (i * 0.02),
        weight: 60.2,
        updatedAt: new Date().toISOString(),
      };
    }

    // 3. Ovulatory phase / Fertile window (Days 12 to 16)
    // Ovulation on Day 14
    for (let i = 11; i < 16; i++) {
      const dateStr = format(addDays(cycleStart, i), 'yyyy-MM-dd');
      const isOvulationDay = i === 13;
      const daySymptoms: Symptom[] = [];
      if (isOvulationDay) {
        daySymptoms.push('discharge');
      }

      entries[dateStr] = {
        date: dateStr,
        flow: 'none',
        symptoms: daySymptoms,
        mood: { emoji: PRESET_MOODS.loving, text: 'loving' },
        energyLevel: 5,
        sleepQuality: 'excellent',
        temperature: isOvulationDay ? 36.1 : 36.6, // temp dip then spike
        weight: 60.0,
        confirmedOvulation: isOvulationDay,
        sexualActivity: i === 12 || i === 14 ? [
          {
            id: `seed-sex-${cycleIndex}-${i}`,
            rating: 5,
            protection: 'condom',
            partner: 'Alex',
          }
        ] : undefined,
        updatedAt: new Date().toISOString(),
      };
    }

    // 4. Luteal phase (Days 17 to 28)
    for (let i = 16; i < 28; i++) {
      // Don't add entries beyond yesterday for the current cycle (Cycle 4)
      if (cycleIndex === 3 && i >= 26) {
        // Today is i = 26 (Day 27). We don't seed today/tomorrow's data yet to let the user log it
        break;
      }

      const dateStr = format(addDays(cycleStart, i), 'yyyy-MM-dd');
      const isPMS = i >= 23; // Last 5 days of cycle
      
      entries[dateStr] = {
        date: dateStr,
        flow: 'none',
        symptoms: isPMS ? ['bloating', 'acne', 'cravings'] : [],
        mood: isPMS 
          ? { emoji: PRESET_MOODS.irritable, text: 'irritable' }
          : { emoji: PRESET_MOODS.calm, text: 'calm' },
        energyLevel: isPMS ? 3 : 4,
        sleepQuality: isPMS ? 'fair' : 'good',
        temperature: 36.7,
        weight: isPMS ? 61.2 : 60.5,
        updatedAt: new Date().toISOString(),
      };
    }
  });

  return {
    entries,
    savedMoods: [
      { id: '1', emoji: '🥰', text: 'loving', usageCount: 4, lastUsed: new Date().toISOString() },
      { id: '2', emoji: '😊', text: 'happy', usageCount: 15, lastUsed: new Date().toISOString() },
      { id: '3', emoji: '😴', text: 'tired', usageCount: 6, lastUsed: new Date().toISOString() },
    ],
    savedSymptoms: [
      { id: 's1', emoji: '🎈', text: 'bloating', usageCount: 8, lastUsed: new Date().toISOString() },
      { id: 's2', emoji: '🔥', text: 'cramps', usageCount: 12, lastUsed: new Date().toISOString() },
    ],
    recentEmojis: ['😊', '😢', '😰', '😴', '⚡', '😤', '😌', '🥰'],
    cycles: [], // Will be computed dynamically by usePeriodData
    settings: {
      cycleLength: 28,
      periodLength: 5,
      notifications: false,
      predictions: {
        enabled: true,
        monthsAhead: 12,
        showFuturePeriods: true,
        showFertileWindows: true,
      },
    },
  };
}
