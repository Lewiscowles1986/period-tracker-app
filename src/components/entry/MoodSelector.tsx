import { useState, useCallback } from 'react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Clock, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePeriodDataContext } from '@/contexts/PeriodDataContext';
import { PRESET_MOODS, PresetMood } from '@/types/period';
import { cn } from '@/lib/utils';

interface MoodSelectorProps {
  selectedEmoji?: string;
  selectedText?: string;
  onSelect: (emoji: string, text: string) => void;
  onClose: () => void;
}

export function MoodSelector({
  selectedEmoji,
  selectedText = '',
  onSelect,
  onClose,
}: MoodSelectorProps) {
  const { data, addRecentEmoji, saveMood } = usePeriodDataContext();
  const [emoji, setEmoji] = useState(selectedEmoji || '');
  const [text, setText] = useState(selectedText);
  const [showPicker, setShowPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<'preset' | 'custom' | 'saved'>('preset');

  const handleEmojiClick = useCallback((emojiData: EmojiClickData) => {
    setEmoji(emojiData.emoji);
    addRecentEmoji(emojiData.emoji);
    setShowPicker(false);
  }, [addRecentEmoji]);

  const handlePresetClick = useCallback((mood: PresetMood) => {
    const moodEmoji = PRESET_MOODS[mood];
    setEmoji(moodEmoji);
    setText(mood.charAt(0).toUpperCase() + mood.slice(1));
  }, []);

  const handleSavedMoodClick = useCallback((savedEmoji: string, savedText: string) => {
    setEmoji(savedEmoji);
    setText(savedText);
  }, []);

  const handleSave = useCallback(() => {
    if (emoji) {
      if (text) {
        saveMood(emoji, text);
      }
      onSelect(emoji, text);
    }
    onClose();
  }, [emoji, text, saveMood, onSelect, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[70] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl p-6 max-h-[85vh] overflow-y-auto shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">How are you feeling?</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Selected Mood Preview */}
        <div className="flex items-center gap-4 p-4 bg-secondary rounded-2xl mb-6">
          <button
            onClick={() => setShowPicker(true)}
            className={cn(
              'w-16 h-16 rounded-2xl flex items-center justify-center text-4xl transition-all',
              'bg-background border-2 border-dashed border-border hover:border-primary',
              emoji && 'border-solid border-primary'
            )}
          >
            {emoji || '😊'}
          </button>
          <div className="flex-1">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 50))}
              placeholder="What's on your mind?"
              className="bg-background border-0 text-base"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {text.length}/50 characters
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-secondary rounded-xl p-1 mb-4">
          <button
            onClick={() => setActiveTab('preset')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === 'preset'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground'
            )}
          >
            Quick Pick
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === 'custom'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground'
            )}
          >
            <Search className="w-4 h-4" />
            Browse
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === 'saved'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground'
            )}
          >
            <Bookmark className="w-4 h-4" />
            Saved
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'preset' && (
            <motion.div
              key="preset"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Preset Moods */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  Common moods
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {(Object.keys(PRESET_MOODS) as PresetMood[]).map((mood) => (
                    <button
                      key={mood}
                      onClick={() => handlePresetClick(mood)}
                      className={cn(
                        'flex flex-col items-center gap-1 p-3 rounded-xl transition-all',
                        'hover:bg-secondary active:scale-95',
                        emoji === PRESET_MOODS[mood] && 'bg-primary/10 ring-2 ring-primary'
                      )}
                    >
                      <span className="text-2xl">{PRESET_MOODS[mood]}</span>
                      <span className="text-xs capitalize">{mood}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Emojis */}
              {data.recentEmojis.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Recently used
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {data.recentEmojis.slice(0, 12).map((recentEmoji, i) => (
                      <button
                        key={`${recentEmoji}-${i}`}
                        onClick={() => setEmoji(recentEmoji)}
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all',
                          'hover:bg-secondary active:scale-95',
                          emoji === recentEmoji && 'bg-primary/10 ring-2 ring-primary'
                        )}
                      >
                        {recentEmoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'custom' && (
            <motion.div
              key="custom"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme={Theme.AUTO}
                width="100%"
                height={300}
                searchPlaceholder="Search any emoji..."
                previewConfig={{ showPreview: false }}
              />
            </motion.div>
          )}

          {activeTab === 'saved' && (
            <motion.div
              key="saved"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {data.savedMoods.length > 0 ? (
                <div className="space-y-2">
                  {data.savedMoods
                    .sort((a, b) => b.usageCount - a.usageCount)
                    .map((savedMood) => (
                      <button
                        key={savedMood.id}
                        onClick={() => handleSavedMoodClick(savedMood.emoji, savedMood.text)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left',
                          'hover:bg-secondary active:scale-[0.99]',
                          emoji === savedMood.emoji &&
                            text === savedMood.text &&
                            'bg-primary/10 ring-2 ring-primary'
                        )}
                      >
                        <span className="text-2xl">{savedMood.emoji}</span>
                        <div className="flex-1">
                          <p className="font-medium">{savedMood.text}</p>
                          <p className="text-xs text-muted-foreground">
                            Used {savedMood.usageCount} times
                          </p>
                        </div>
                      </button>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No saved moods yet</p>
                  <p className="text-sm">
                    Custom moods with text will be saved automatically
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emoji Picker Modal */}
        <AnimatePresence>
          {showPicker && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-card rounded-3xl p-4 z-10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Pick an emoji</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowPicker(false)}>
                  Done
                </Button>
              </div>
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme={Theme.AUTO}
                width="100%"
                height={350}
                searchPlaceholder="Search emojis..."
                previewConfig={{ showPreview: false }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save Button */}
        <div className="mt-6 pt-4 border-t border-border">
          <Button
            onClick={handleSave}
            className="w-full h-12 text-base font-semibold bg-gradient-primary hover:opacity-90"
            disabled={!emoji}
          >
            {emoji ? `Save ${emoji} ${text || ''}`.trim() : 'Select a mood'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
