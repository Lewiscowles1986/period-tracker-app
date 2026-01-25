import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Star, Search } from 'lucide-react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePeriodDataContext } from '@/contexts/PeriodDataContext';
import {
  Symptom,
  CustomSymptom,
  SYMPTOM_LABELS,
  SYMPTOM_EMOJIS,
} from '@/types/period';
import { cn } from '@/lib/utils';

interface SymptomSelectorProps {
  selectedSymptoms: Symptom[];
  selectedCustomSymptoms: CustomSymptom[];
  onToggleSymptom: (symptom: Symptom) => void;
  onAddCustomSymptom: (symptom: CustomSymptom) => void;
  onRemoveCustomSymptom: (emoji: string, text: string) => void;
  onClose: () => void;
}

// Categorized symptoms for better organization
const SYMPTOM_CATEGORIES: Record<string, Symptom[]> = {
  'Pain & Discomfort': ['cramps', 'headache', 'back_pain', 'joint_pain', 'muscle_aches', 'tender_abdomen'],
  'Digestive': ['bloating', 'nausea', 'constipation', 'diarrhea', 'cravings', 'increased_appetite', 'loss_of_appetite'],
  'Energy & Sleep': ['fatigue', 'insomnia', 'dizziness', 'brain_fog'],
  'Emotional': ['mood_swings', 'anxiety', 'depression'],
  'Skin & Body': ['acne', 'dry_skin', 'oily_skin', 'hair_loss', 'hot_flashes', 'water_retention'],
  'Cycle Related': ['breast_tenderness', 'spotting', 'heavy_bleeding', 'light_bleeding', 'discharge', 'sensitive_smell'],
};

export function SymptomSelector({
  selectedSymptoms,
  selectedCustomSymptoms,
  onToggleSymptom,
  onAddCustomSymptom,
  onRemoveCustomSymptom,
  onClose,
}: SymptomSelectorProps) {
  const { data, saveSymptom, deleteSavedSymptom } = usePeriodDataContext();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [customEmoji, setCustomEmoji] = useState('');
  const [customText, setCustomText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const sortedSavedSymptoms = useMemo(() => {
    return [...data.savedSymptoms].sort((a, b) => {
      // Sort by usage count, then by last used
      if (b.usageCount !== a.usageCount) {
        return b.usageCount - a.usageCount;
      }
      return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
    });
  }, [data.savedSymptoms]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setCustomEmoji(emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleAddCustom = () => {
    if (customEmoji && customText.trim()) {
      const symptom: CustomSymptom = {
        emoji: customEmoji,
        text: customText.trim(),
      };
      onAddCustomSymptom(symptom);
      saveSymptom(customEmoji, customText.trim());
      setCustomEmoji('');
      setCustomText('');
    }
  };

  const handleSelectSaved = (emoji: string, text: string) => {
    const symptom: CustomSymptom = { emoji, text };
    // Check if already selected
    const isSelected = selectedCustomSymptoms.some(
      (s) => s.emoji === emoji && s.text === text
    );
    if (isSelected) {
      onRemoveCustomSymptom(emoji, text);
    } else {
      onAddCustomSymptom(symptom);
      saveSymptom(emoji, text); // Increment usage
    }
  };

  const isCustomSelected = (emoji: string, text: string) => {
    return selectedCustomSymptoms.some(
      (s) => s.emoji === emoji && s.text === text
    );
  };

  // Filter symptoms based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return SYMPTOM_CATEGORIES;
    
    const query = searchQuery.toLowerCase();
    const filtered: Record<string, Symptom[]> = {};
    
    Object.entries(SYMPTOM_CATEGORIES).forEach(([category, symptoms]) => {
      const matchingSymptoms = symptoms.filter((s) =>
        SYMPTOM_LABELS[s].toLowerCase().includes(query)
      );
      if (matchingSymptoms.length > 0) {
        filtered[category] = matchingSymptoms;
      }
    });
    
    return filtered;
  }, [searchQuery]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[70]"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="fixed inset-x-0 bottom-0 z-[70] bg-card rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-lg font-bold">Select Symptoms</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search symptoms..."
              className="pl-10"
            />
          </div>

          {/* Selected Count */}
          {(selectedSymptoms.length > 0 || selectedCustomSymptoms.length > 0) && (
            <div className="text-sm text-muted-foreground">
              {selectedSymptoms.length + selectedCustomSymptoms.length} symptom(s) selected
            </div>
          )}

          {/* Saved Custom Symptoms */}
          {sortedSavedSymptoms.length > 0 && !searchQuery && (
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Your Custom Symptoms
              </h3>
              <div className="flex flex-wrap gap-2">
                {sortedSavedSymptoms.map((saved) => (
                  <motion.button
                    key={saved.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectSaved(saved.emoji, saved.text)}
                    className={cn(
                      'group relative px-3 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5',
                      isCustomSelected(saved.emoji, saved.text)
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary'
                        : 'bg-secondary hover:bg-secondary/80'
                    )}
                  >
                    <span>{saved.emoji}</span>
                    <span>{saved.text}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSavedSymptom(saved.id);
                      }}
                      className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </button>
                  </motion.button>
                ))}
              </div>
            </section>
          )}

          {/* Add Custom Symptom */}
          {!searchQuery && (
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Custom Symptom
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEmojiPicker(true)}
                  className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl hover:bg-secondary/80 transition-colors shrink-0"
                >
                  {customEmoji || '➕'}
                </button>
                <Input
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value.slice(0, 30))}
                  placeholder="Describe symptom (max 30 chars)"
                  maxLength={30}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddCustom}
                  disabled={!customEmoji || !customText.trim()}
                  size="icon"
                  className="shrink-0"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {customText.length}/30 characters
              </p>
            </section>
          )}

          {/* Preset Symptoms by Category */}
          {Object.entries(filteredCategories).map(([category, symptoms]) => (
            <section key={category}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                {category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {symptoms.map((symptom) => (
                  <motion.button
                    key={symptom}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onToggleSymptom(symptom)}
                    className={cn(
                      'px-3 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5',
                      selectedSymptoms.includes(symptom)
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
          ))}
        </div>

        {/* Done Button */}
        <div className="p-4 border-t border-border bg-card">
          <Button onClick={onClose} className="w-full h-12 text-base font-semibold">
            Done
          </Button>
        </div>
      </motion.div>

      {/* Emoji Picker Modal */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-background/80 backdrop-blur-sm"
            onClick={() => setShowEmojiPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                width={320}
                height={400}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}