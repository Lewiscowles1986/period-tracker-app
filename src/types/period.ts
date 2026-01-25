// Core data types for period tracking

export type FlowIntensity = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export type PresetMood = 'happy' | 'sad' | 'anxious' | 'tired' | 'energetic' | 'irritable' | 'calm' | 'loving';

export interface CustomMood {
  emoji: string;
  text: string;
}

export interface SavedMood {
  id: string;
  emoji: string;
  text: string;
  usageCount: number;
  lastUsed: string;
}

export type Symptom = 
  | 'cramps'
  | 'headache'
  | 'bloating'
  | 'breast_tenderness'
  | 'back_pain'
  | 'nausea'
  | 'acne'
  | 'fatigue'
  | 'insomnia'
  | 'cravings'
  | 'mood_swings'
  | 'hot_flashes'
  // Additional symptoms
  | 'dizziness'
  | 'constipation'
  | 'diarrhea'
  | 'joint_pain'
  | 'muscle_aches'
  | 'anxiety'
  | 'depression'
  | 'brain_fog'
  | 'spotting'
  | 'heavy_bleeding'
  | 'light_bleeding'
  | 'discharge'
  | 'dry_skin'
  | 'oily_skin'
  | 'hair_loss'
  | 'water_retention'
  | 'increased_appetite'
  | 'loss_of_appetite'
  | 'sensitive_smell'
  | 'tender_abdomen';

// Custom symptom with emoji and text (like custom moods)
export interface CustomSymptom {
  emoji: string;
  text: string;
}

export interface SavedSymptom {
  id: string;
  emoji: string;
  text: string;
  usageCount: number;
  lastUsed: string;
}

// Combined symptom entry - can be preset or custom
export type SymptomEntry = Symptom | { custom: CustomSymptom };

export type SleepQuality = 'poor' | 'fair' | 'good' | 'excellent';

export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

export type IntimacyRating = 1 | 2 | 3 | 4 | 5;

export type ProtectionType = 'none' | 'condom' | 'pill' | 'iud' | 'other';

export interface SexualActivity {
  id: string;
  partner?: string; // Optional partner name
  time?: string; // Time of day (HH:mm)
  duration?: number; // Duration in minutes
  rating?: IntimacyRating;
  protection?: ProtectionType;
  notes?: string;
}

export interface DayEntry {
  date: string; // ISO date string YYYY-MM-DD
  flow: FlowIntensity;
  mood?: CustomMood;
  symptoms: Symptom[]; // Preset symptoms
  customSymptoms?: CustomSymptom[]; // User-created custom symptoms
  energyLevel?: EnergyLevel;
  sleepQuality?: SleepQuality;
  temperature?: number; // Basal body temperature in Celsius or Fahrenheit
  weight?: number; // Weight in kg or lbs
  confirmedOvulation?: boolean; // User-confirmed ovulation
  sexualActivity?: SexualActivity[];
  masturbation?: boolean; // Optional masturbation tracking
  kissing?: boolean; // Optional kissing/intimacy tracking
  notes?: string;
  updatedAt: string; // ISO timestamp
}

export interface CycleInfo {
  startDate: string;
  endDate?: string;
  length?: number;
}

export interface PeriodData {
  entries: Record<string, DayEntry>; // keyed by date string
  savedMoods: SavedMood[];
  savedSymptoms: SavedSymptom[]; // User's custom saved symptoms
  recentEmojis: string[];
  cycles: CycleInfo[];
  settings: AppSettings;
}

export interface PredictionSettings {
  enabled: boolean; // Master toggle for predictions
  monthsAhead: number; // How many months to predict (1-24)
  showFuturePeriods: boolean; // Show predicted period days
  showFertileWindows: boolean; // Show fertile/ovulation predictions
}

export interface AppSettings {
  cycleLength: number; // default 28
  periodLength: number; // default 5
  notifications: boolean;
  lastExportDate?: string;
  predictions: PredictionSettings;
}

export interface FutureCyclePrediction {
  cycleNumber: number; // 1, 2, 3...
  periodStart: string;
  periodEnd: string;
  ovulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
}

export interface CycleStats {
  averageCycleLength: number;
  shortestCycle: number;
  longestCycle: number;
  averagePeriodLength: number;
  totalCyclesTracked: number;
  predictedNextPeriod?: string;
  predictedOvulation?: string;
  fertileWindowStart?: string;
  fertileWindowEnd?: string;
  futurePredictions: FutureCyclePrediction[];
}

export interface MoodStats {
  moodCounts: Record<string, number>;
  topMoods: Array<{ emoji: string; text: string; count: number }>;
  moodsByPhase: Record<string, Record<string, number>>;
}

export interface SymptomStats {
  symptomCounts: Record<Symptom, number>;
  symptomsByPhase: Record<string, Record<Symptom, number>>;
  correlations: Array<{ symptoms: Symptom[]; frequency: number }>;
}

// Preset moods with their emojis
export const PRESET_MOODS: Record<PresetMood, string> = {
  happy: '😊',
  sad: '😢',
  anxious: '😰',
  tired: '😴',
  energetic: '⚡',
  irritable: '😤',
  calm: '😌',
  loving: '🥰',
};

export const SYMPTOM_LABELS: Record<Symptom, string> = {
  cramps: 'Cramps',
  headache: 'Headache',
  bloating: 'Bloating',
  breast_tenderness: 'Breast Tenderness',
  back_pain: 'Back Pain',
  nausea: 'Nausea',
  acne: 'Acne',
  fatigue: 'Fatigue',
  insomnia: 'Insomnia',
  cravings: 'Cravings',
  mood_swings: 'Mood Swings',
  hot_flashes: 'Hot Flashes',
  dizziness: 'Dizziness',
  constipation: 'Constipation',
  diarrhea: 'Diarrhea',
  joint_pain: 'Joint Pain',
  muscle_aches: 'Muscle Aches',
  anxiety: 'Anxiety',
  depression: 'Depression',
  brain_fog: 'Brain Fog',
  spotting: 'Spotting',
  heavy_bleeding: 'Heavy Bleeding',
  light_bleeding: 'Light Bleeding',
  discharge: 'Discharge',
  dry_skin: 'Dry Skin',
  oily_skin: 'Oily Skin',
  hair_loss: 'Hair Loss',
  water_retention: 'Water Retention',
  increased_appetite: 'Increased Appetite',
  loss_of_appetite: 'Loss of Appetite',
  sensitive_smell: 'Sensitive Smell',
  tender_abdomen: 'Tender Abdomen',
};

export const SYMPTOM_EMOJIS: Record<Symptom, string> = {
  cramps: '🔥',
  headache: '🤕',
  bloating: '🎈',
  breast_tenderness: '💔',
  back_pain: '😣',
  nausea: '🤢',
  acne: '😖',
  fatigue: '😩',
  insomnia: '🌙',
  cravings: '🍫',
  mood_swings: '🎭',
  hot_flashes: '🌡️',
  dizziness: '💫',
  constipation: '🚫',
  diarrhea: '💨',
  joint_pain: '🦴',
  muscle_aches: '💪',
  anxiety: '😰',
  depression: '😔',
  brain_fog: '🌫️',
  spotting: '🩸',
  heavy_bleeding: '🩸',
  light_bleeding: '💧',
  discharge: '💦',
  dry_skin: '🏜️',
  oily_skin: '✨',
  hair_loss: '💇',
  water_retention: '💧',
  increased_appetite: '🍽️',
  loss_of_appetite: '🚫',
  sensitive_smell: '👃',
  tender_abdomen: '😣',
};

export const FLOW_LABELS: Record<FlowIntensity, string> = {
  none: 'None',
  spotting: 'Spotting',
  light: 'Light',
  medium: 'Medium',
  heavy: 'Heavy',
};

export const SLEEP_LABELS: Record<SleepQuality, string> = {
  poor: 'Poor',
  fair: 'Fair',
  good: 'Good',
  excellent: 'Excellent',
};

export const SLEEP_EMOJIS: Record<SleepQuality, string> = {
  poor: '😫',
  fair: '😐',
  good: '😊',
  excellent: '😴',
};

export const PROTECTION_LABELS: Record<ProtectionType, string> = {
  none: 'None',
  condom: 'Condom',
  pill: 'Pill',
  iud: 'IUD',
  other: 'Other',
};

export const INTIMACY_EMOJIS: Record<IntimacyRating, string> = {
  1: '😐',
  2: '🙂',
  3: '😊',
  4: '😍',
  5: '🔥',
};

export const DEFAULT_PREDICTION_SETTINGS: PredictionSettings = {
  enabled: true,
  monthsAhead: 12,
  showFuturePeriods: true,
  showFertileWindows: true,
};

// Default app data structure
export const DEFAULT_PERIOD_DATA: PeriodData = {
  entries: {},
  savedMoods: [],
  savedSymptoms: [],
  recentEmojis: ['😊', '😢', '😰', '😴', '⚡', '😤', '😌', '🥰'],
  cycles: [],
  settings: {
    cycleLength: 28,
    periodLength: 5,
    notifications: false,
    predictions: DEFAULT_PREDICTION_SETTINGS,
  },
};
