import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { X, Trash2, Plus, Heart, Sparkles, ChevronDown, Thermometer, Scale } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { usePeriodDataContext } from '@/contexts/PeriodDataContext';
import { MoodSelector } from './MoodSelector';
import {
  FlowIntensity,
  Symptom,
  SleepQuality,
  EnergyLevel,
  IntimacyRating,
  ProtectionType,
  SexualActivity,
  FLOW_LABELS,
  SYMPTOM_LABELS,
  SYMPTOM_EMOJIS,
  SLEEP_LABELS,
  SLEEP_EMOJIS,
  PROTECTION_LABELS,
  INTIMACY_EMOJIS,
} from '@/types/period';
import { cn } from '@/lib/utils';

interface DayEntryModalProps {
  date: Date;
  onClose: () => void;
}

const flowOptions: FlowIntensity[] = ['none', 'spotting', 'light', 'medium', 'heavy'];
const symptomOptions: Symptom[] = [
  'cramps',
  'headache',
  'bloating',
  'breast_tenderness',
  'back_pain',
  'nausea',
  'acne',
  'fatigue',
  'insomnia',
  'cravings',
  'mood_swings',
  'hot_flashes',
];
const sleepOptions: SleepQuality[] = ['poor', 'fair', 'good', 'excellent'];
const energyLevels: EnergyLevel[] = [1, 2, 3, 4, 5];
const intimacyRatings: IntimacyRating[] = [1, 2, 3, 4, 5];
const protectionTypes: ProtectionType[] = ['none', 'condom', 'pill', 'iud', 'other'];

const flowColors: Record<FlowIntensity, string> = {
  none: 'bg-secondary hover:bg-secondary/80',
  spotting: 'bg-flow-spotting hover:bg-flow-spotting/80',
  light: 'bg-flow-light hover:bg-flow-light/80',
  medium: 'bg-flow-medium hover:bg-flow-medium/80',
  heavy: 'bg-flow-heavy hover:bg-flow-heavy/80',
};

export function DayEntryModal({ date, onClose }: DayEntryModalProps) {
  const { getEntry, updateEntry, deleteEntry, getCycleStats, isInFertileWindow, isPredictedPeriodDay } = usePeriodDataContext();
  const dateStr = format(date, 'yyyy-MM-dd');
  const existingEntry = getEntry(dateStr);
  const cycleStats = getCycleStats();

  // Fertility info for this date
  const isFertile = isInFertileWindow(dateStr);
  const isOvulationDay = cycleStats.predictedOvulation === dateStr;
  const isPredictedPeriod = isPredictedPeriodDay(dateStr);

  const [flow, setFlow] = useState<FlowIntensity>(existingEntry?.flow || 'none');
  const [moodEmoji, setMoodEmoji] = useState(existingEntry?.mood?.emoji || '');
  const [moodText, setMoodText] = useState(existingEntry?.mood?.text || '');
  const [symptoms, setSymptoms] = useState<Symptom[]>(existingEntry?.symptoms || []);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | undefined>(
    existingEntry?.energyLevel
  );
  const [sleepQuality, setSleepQuality] = useState<SleepQuality | undefined>(
    existingEntry?.sleepQuality
  );
  const [sexualActivities, setSexualActivities] = useState<SexualActivity[]>(
    existingEntry?.sexualActivity || []
  );
  const [temperature, setTemperature] = useState<string>(
    existingEntry?.temperature?.toString() || ''
  );
  const [weight, setWeight] = useState<string>(
    existingEntry?.weight?.toString() || ''
  );
  const [confirmedOvulation, setConfirmedOvulation] = useState<boolean>(
    existingEntry?.confirmedOvulation || false
  );
  const [masturbation, setMasturbation] = useState<boolean>(
    existingEntry?.masturbation || false
  );
  const [kissing, setKissing] = useState<boolean>(
    existingEntry?.kissing || false
  );
  const [notes, setNotes] = useState(existingEntry?.notes || '');
  const [showMoodSelector, setShowMoodSelector] = useState(false);

  const toggleSymptom = (symptom: Symptom) => {
    setSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const addSexualActivity = () => {
    setSexualActivities((prev) => [
      ...prev,
      { id: crypto.randomUUID() },
    ]);
  };

  const updateSexualActivity = (id: string, updates: Partial<SexualActivity>) => {
    setSexualActivities((prev) =>
      prev.map((activity) =>
        activity.id === id ? { ...activity, ...updates } : activity
      )
    );
  };

  const removeSexualActivity = (id: string) => {
    setSexualActivities((prev) => prev.filter((activity) => activity.id !== id));
  };

  const handleSave = () => {
    updateEntry(dateStr, {
      flow,
      mood: moodEmoji ? { emoji: moodEmoji, text: moodText } : undefined,
      symptoms,
      energyLevel,
      sleepQuality,
      temperature: temperature ? parseFloat(temperature) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      confirmedOvulation: confirmedOvulation || undefined,
      sexualActivity: sexualActivities.length > 0 ? sexualActivities : undefined,
      masturbation: masturbation || undefined,
      kissing: kissing || undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  const handleDelete = () => {
    deleteEntry(dateStr);
    onClose();
  };

  const handleMoodSelect = (emoji: string, text: string) => {
    setMoodEmoji(emoji);
    setMoodText(text);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-[60] bg-card rounded-t-3xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-lg font-bold">{format(date, 'EEEE')}</h2>
            <p className="text-sm text-muted-foreground">
              {format(date, 'MMMM d, yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {existingEntry && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
          {/* Ovulation & Fertility Info */}
          {(isOvulationDay || isFertile || isPredictedPeriod) && (
            <section className="space-y-2">
              {isOvulationDay && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-4 bg-phase-ovulation/20 rounded-2xl border border-phase-ovulation/30"
                >
                  <div className="w-12 h-12 rounded-xl bg-phase-ovulation/30 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-phase-ovulation" />
                  </div>
                  <div>
                    <p className="font-semibold text-phase-ovulation">Predicted Ovulation Day</p>
                    <p className="text-sm text-muted-foreground">
                      Peak fertility - highest chance of conception
                    </p>
                  </div>
                </motion.div>
              )}
              {isFertile && !isOvulationDay && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-4 bg-phase-ovulation/10 rounded-2xl border border-phase-ovulation/20"
                >
                  <div className="w-12 h-12 rounded-xl bg-phase-ovulation/20 flex items-center justify-center">
                    <span className="text-2xl">🌸</span>
                  </div>
                  <div>
                    <p className="font-semibold">Fertile Window</p>
                    <p className="text-sm text-muted-foreground">
                      You may be more likely to conceive during this time
                    </p>
                  </div>
                </motion.div>
              )}
              {isPredictedPeriod && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-4 bg-phase-menstrual/10 rounded-2xl border border-phase-menstrual/20"
                >
                  <div className="w-12 h-12 rounded-xl bg-phase-menstrual/20 flex items-center justify-center">
                    <span className="text-2xl">💧</span>
                  </div>
                  <div>
                    <p className="font-semibold">Predicted Period</p>
                    <p className="text-sm text-muted-foreground">
                      Your period may start around this date
                    </p>
                  </div>
                </motion.div>
              )}
            </section>
          )}

          {/* Flow Intensity */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              Period Flow
            </h3>
            <div className="flex flex-wrap gap-2">
              {flowOptions.map((option) => (
                <motion.button
                  key={option}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFlow(option)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all',
                    flow === option
                      ? `${flowColors[option]} ring-2 ring-primary ring-offset-2 ring-offset-card`
                      : flowColors[option]
                  )}
                >
                  {option !== 'none' && '💧 '}
                  {FLOW_LABELS[option]}
                </motion.button>
              ))}
            </div>
          </section>

          {/* Ovulation Confirmation */}
          <section>
            <div className="flex items-center justify-between p-4 bg-phase-ovulation/10 rounded-2xl border border-phase-ovulation/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-phase-ovulation/20 flex items-center justify-center">
                  <span className="text-xl">🥚</span>
                </div>
                <div>
                  <p className="font-medium">Confirm Ovulation</p>
                  <p className="text-xs text-muted-foreground">Mark if you're ovulating today</p>
                </div>
              </div>
              <Switch
                checked={confirmedOvulation}
                onCheckedChange={setConfirmedOvulation}
              />
            </div>
          </section>

          {/* Temperature & Weight */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              Body Metrics
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-secondary rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer className="w-4 h-4 text-muted-foreground" />
                  <label className="text-xs text-muted-foreground">Temperature</label>
                </div>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 36.5°"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="bg-card border-0"
                />
              </div>
              <div className="p-3 bg-secondary rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="w-4 h-4 text-muted-foreground" />
                  <label className="text-xs text-muted-foreground">Weight</label>
                </div>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 65"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="bg-card border-0"
                />
              </div>
            </div>
          </section>

          {/* Intimacy Quick Toggles */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Intimacy
            </h3>
            <div className="space-y-2">
              {/* Masturbation Toggle */}
              <div className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-lg">💜</span>
                  <span className="text-sm font-medium">Solo activity</span>
                </div>
                <Switch
                  checked={masturbation}
                  onCheckedChange={setMasturbation}
                />
              </div>
              
              {/* Kissing Toggle */}
              <div className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-lg">💋</span>
                  <span className="text-sm font-medium">Kissing</span>
                </div>
                <Switch
                  checked={kissing}
                  onCheckedChange={setKissing}
                />
              </div>
            </div>
          </section>

          {/* Sexual Activity */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Sexual Activity
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={addSexualActivity}
                className="h-8"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            {sexualActivities.length === 0 ? (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={addSexualActivity}
                className="w-full p-4 rounded-2xl border-2 border-dashed border-border hover:border-primary/30 transition-all text-center text-muted-foreground"
              >
                <Heart className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Tap to log intimate activity</p>
              </motion.button>
            ) : (
              <div className="space-y-3">
                {sexualActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-secondary rounded-2xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Activity {index + 1}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSexualActivity(activity.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Partner (optional) */}
                    <div>
                      <label className="text-xs text-muted-foreground">Partner (optional)</label>
                      <Input
                        value={activity.partner || ''}
                        onChange={(e) => updateSexualActivity(activity.id, { partner: e.target.value || undefined })}
                        placeholder="Who with..."
                        className="mt-1 bg-card"
                      />
                    </div>

                    {/* Protection - main visible field */}
                    <div>
                      <label className="text-xs text-muted-foreground">Protection (optional)</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {protectionTypes.map((type) => (
                          <motion.button
                            key={type}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateSexualActivity(activity.id, { 
                              protection: activity.protection === type ? undefined : type 
                            })}
                            className={cn(
                              'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                              activity.protection === type
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-card hover:bg-card/80'
                            )}
                          >
                            {PROTECTION_LABELS[type]}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Notes (optional) */}
                    <div>
                      <label className="text-xs text-muted-foreground">Notes (optional)</label>
                      <Textarea
                        value={activity.notes || ''}
                        onChange={(e) => updateSexualActivity(activity.id, { notes: e.target.value || undefined })}
                        placeholder="Any notes..."
                        className="mt-1 min-h-[60px] resize-none bg-card border-0"
                      />
                    </div>

                    {/* More details - collapsible */}
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full py-1">
                        <ChevronDown className="w-3 h-3 transition-transform [[data-state=open]>&]:rotate-180" />
                        More details (optional)
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-3 pt-2">
                        {/* Time of day */}
                        <div>
                          <label className="text-xs text-muted-foreground">Time of day</label>
                          <Input
                            type="time"
                            value={activity.time || ''}
                            onChange={(e) => updateSexualActivity(activity.id, { time: e.target.value || undefined })}
                            className="mt-1 bg-card"
                          />
                        </div>

                        {/* Duration */}
                        <div>
                          <label className="text-xs text-muted-foreground">Duration (minutes)</label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="e.g. 30"
                            value={activity.duration || ''}
                            onChange={(e) => updateSexualActivity(activity.id, { 
                              duration: e.target.value ? parseInt(e.target.value, 10) : undefined 
                            })}
                            className="mt-1 bg-card"
                          />
                        </div>

                        {/* Rating */}
                        <div>
                          <label className="text-xs text-muted-foreground">How was it?</label>
                          <div className="flex gap-2 mt-1">
                            {intimacyRatings.map((rating) => (
                              <motion.button
                                key={rating}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => updateSexualActivity(activity.id, { 
                                  rating: activity.rating === rating ? undefined : rating 
                                })}
                                className={cn(
                                  'flex-1 py-2 rounded-lg text-center transition-all',
                                  activity.rating === rating
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-card hover:bg-card/80'
                                )}
                              >
                                <div className="text-lg">{INTIMACY_EMOJIS[rating]}</div>
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Mood */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              Mood
            </h3>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowMoodSelector(true)}
              className={cn(
                'w-full p-4 rounded-2xl text-left transition-all flex items-center gap-4',
                'bg-secondary hover:bg-secondary/80',
                moodEmoji && 'ring-2 ring-primary'
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-card flex items-center justify-center text-2xl">
                {moodEmoji || '😊'}
              </div>
              <div className="flex-1">
                {moodEmoji ? (
                  <>
                    <p className="font-medium">
                      {moodText || 'Tap to add a description'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Tap to change
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">How are you feeling?</p>
                    <p className="text-sm text-muted-foreground">
                      Tap to select mood
                    </p>
                  </>
                )}
              </div>
            </motion.button>
          </section>

          {/* Symptoms */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              Symptoms
            </h3>
            <div className="flex flex-wrap gap-2">
              {symptomOptions.map((symptom) => (
                <motion.button
                  key={symptom}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleSymptom(symptom)}
                  className={cn(
                    'px-3 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5',
                    symptoms.includes(symptom)
                      ? 'bg-accent text-accent-foreground ring-2 ring-accent'
                      : 'bg-secondary hover:bg-secondary/80'
                  )}
                >
                  <span>{SYMPTOM_EMOJIS[symptom]}</span>
                  <span>{SYMPTOM_LABELS[symptom]}</span>
                </motion.button>
              ))}
            </div>
          </section>

          {/* Energy Level */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              Energy Level
            </h3>
            <div className="flex gap-2">
              {energyLevels.map((level) => (
                <motion.button
                  key={level}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEnergyLevel(level === energyLevel ? undefined : level)}
                  className={cn(
                    'flex-1 py-3 rounded-xl text-center transition-all',
                    energyLevel === level
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  )}
                >
                  <div className="text-lg">{'⚡'.repeat(level)}</div>
                  <div className="text-xs mt-1">{level}/5</div>
                </motion.button>
              ))}
            </div>
          </section>

          {/* Sleep Quality */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              Sleep Quality
            </h3>
            <div className="flex gap-2">
              {sleepOptions.map((quality) => (
                <motion.button
                  key={quality}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setSleepQuality(quality === sleepQuality ? undefined : quality)
                  }
                  className={cn(
                    'flex-1 py-3 rounded-xl text-center transition-all',
                    sleepQuality === quality
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  )}
                >
                  <div className="text-lg">{SLEEP_EMOJIS[quality]}</div>
                  <div className="text-xs mt-1 capitalize">{SLEEP_LABELS[quality]}</div>
                </motion.button>
              ))}
            </div>
          </section>

          {/* Notes */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              Notes
            </h3>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional thoughts or observations..."
              className="min-h-[100px] resize-none bg-secondary border-0"
            />
          </section>
        </div>

        {/* Save Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-card via-card to-transparent pt-8">
          <Button
            onClick={handleSave}
            className="w-full h-12 text-base font-semibold bg-gradient-primary hover:opacity-90"
          >
            Save Entry
          </Button>
        </div>
      </motion.div>

      {/* Mood Selector */}
      <AnimatePresence>
        {showMoodSelector && (
          <MoodSelector
            selectedEmoji={moodEmoji}
            selectedText={moodText}
            onSelect={handleMoodSelect}
            onClose={() => setShowMoodSelector(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
