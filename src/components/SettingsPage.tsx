import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  Upload,
  Trash2,
  Info,
  ChevronRight,
  Bookmark,
  X,
  Check,
  AlertTriangle,
  Shield,
  Calendar,
  Eye,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { AppHeader } from '@/components/AppHeader';
import { usePeriodDataContext } from '@/contexts/PeriodDataContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { DEFAULT_PREDICTION_SETTINGS } from '@/types/period';
import { generateSeedData } from '@/lib/seedData';


interface SettingsPageProps {
  onOpenPrivacy?: () => void;
}

export function SettingsPage({ onOpenPrivacy }: SettingsPageProps) {
  const {
    data,
    exportData,
    importData,
    clearAllData,
    deleteSavedMood,
    updateSettings,
  } = usePeriodDataContext();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [pendingImport, setPendingImport] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const predictionSettings = data.settings.predictions || DEFAULT_PREDICTION_SETTINGS;

  const handleExport = useCallback(() => {
    try {
      const jsonData = exportData();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flow-period-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    }
  }, [exportData]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        try {
          JSON.parse(content); // Validate JSON
          setPendingImport(content);
          setShowMergeDialog(true);
        } catch {
          toast.error('Invalid file format');
        }
      };
      reader.readAsText(file);

      // Reset input
      e.target.value = '';
    },
    []
  );

  const handleImport = useCallback(
    (merge: boolean) => {
      if (!pendingImport) return;

      const success = importData(pendingImport, merge);
      if (success) {
        toast.success(
          merge ? 'Data merged successfully!' : 'Data imported successfully!'
        );
      } else {
        toast.error('Failed to import data');
      }

      setPendingImport(null);
      setShowMergeDialog(false);
    },
    [pendingImport, importData]
  );

  const handleClearData = useCallback(() => {
    clearAllData();
    setShowDeleteConfirm(false);
    toast.success('All data cleared');
  }, [clearAllData]);

  const handleSeedData = useCallback(() => {
    try {
      const seed = generateSeedData();
      const success = importData(JSON.stringify(seed), false);
      if (success) {
        toast.success('Demo data seeded successfully!');
      } else {
        toast.error('Failed to seed demo data');
      }
    } catch (error) {
      toast.error('Failed to generate seed data');
    }
  }, [importData]);


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Unified Header */}
      <AppHeader title="Settings" subtitle="Manage your data and preferences" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 p-4 pb-24 space-y-6"
      >
        {/* Predictions Section */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Predictions
          </h3>

          <div className="bg-card rounded-2xl border border-border divide-y divide-border overflow-hidden">
            {/* Master toggle */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Enable Predictions</p>
                  <p className="text-sm text-muted-foreground">
                    Show predicted cycles on calendar
                  </p>
                </div>
              </div>
              <Switch
                checked={predictionSettings.enabled}
                onCheckedChange={(checked) =>
                  updateSettings({
                    predictions: { ...predictionSettings, enabled: checked },
                  })
                }
              />
            </div>

            {/* Show future periods */}
            <div className={cn(
              "flex items-center justify-between p-4 transition-opacity",
              !predictionSettings.enabled && "opacity-50 pointer-events-none"
            )}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                  <span className="text-lg">🩸</span>
                </div>
                <div>
                  <p className="font-medium">Future Periods</p>
                  <p className="text-sm text-muted-foreground">
                    Show predicted period days
                  </p>
                </div>
              </div>
              <Switch
                checked={predictionSettings.showFuturePeriods}
                onCheckedChange={(checked) =>
                  updateSettings({
                    predictions: { ...predictionSettings, showFuturePeriods: checked },
                  })
                }
              />
            </div>

            {/* Show fertile windows */}
            <div className={cn(
              "flex items-center justify-between p-4 transition-opacity",
              !predictionSettings.enabled && "opacity-50 pointer-events-none"
            )}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <span className="text-lg">🥚</span>
                </div>
                <div>
                  <p className="font-medium">Fertile Windows</p>
                  <p className="text-sm text-muted-foreground">
                    Show ovulation & fertile days
                  </p>
                </div>
              </div>
              <Switch
                checked={predictionSettings.showFertileWindows}
                onCheckedChange={(checked) =>
                  updateSettings({
                    predictions: { ...predictionSettings, showFertileWindows: checked },
                  })
                }
              />
            </div>

            {/* Months ahead selector */}
            <div className={cn(
              "p-4 transition-opacity",
              !predictionSettings.enabled && "opacity-50 pointer-events-none"
            )}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Eye className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Prediction Range</p>
                  <p className="text-sm text-muted-foreground">
                    How far ahead to predict
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap mt-3">
                {[1, 3, 6, 12, 24].map((months) => (
                  <button
                    key={months}
                    onClick={() =>
                      updateSettings({
                        predictions: { ...predictionSettings, monthsAhead: months },
                      })
                    }
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                      predictionSettings.monthsAhead === months
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                  >
                    {months} {months === 1 ? 'month' : 'months'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

      {/* Data Management */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Data Management
        </h3>

        <button
          onClick={handleExport}
          className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
            <Download className="w-6 h-6 text-accent" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Export Data</p>
            <p className="text-sm text-muted-foreground">
              Download your data as a JSON file
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        <button
          onClick={handleImportClick}
          className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Import Data</p>
            <p className="text-sm text-muted-foreground">
              Restore from a previously exported file
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
        <button
          onClick={handleSeedData}
          className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-purple-500" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-purple-600 dark:text-purple-400">Seed Demo Data</p>
            <p className="text-sm text-muted-foreground">
              Populate app with realistic sample cycle logs
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />


        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:border-destructive/30 transition-all text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-destructive" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-destructive">Clear All Data</p>
            <p className="text-sm text-muted-foreground">
              Permanently delete all entries
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </motion.div>

      {/* Saved Moods */}
      {data.savedMoods.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Bookmark className="w-4 h-4" />
            Saved Moods
          </h3>
          <div className="bg-card rounded-2xl border border-border divide-y divide-border overflow-hidden">
            {data.savedMoods.map((mood) => (
              <div
                key={mood.id}
                className="flex items-center gap-3 p-4"
              >
                <span className="text-2xl">{mood.emoji}</span>
                <div className="flex-1">
                  <p className="font-medium">{mood.text}</p>
                  <p className="text-xs text-muted-foreground">
                    Used {mood.usageCount} times
                  </p>
                </div>
                <button
                  onClick={() => {
                    deleteSavedMood(mood.id);
                    toast.success('Mood deleted');
                  }}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* About */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">About</h3>
        <div className="bg-card p-4 rounded-2xl border border-border">
          <div className="flex items-center gap-3 mb-3">
            <Info className="w-5 h-5 text-primary" />
            <span className="font-semibold">Flow Period Tracker</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Your data is stored locally on your device and never sent to any
            server. Use the export feature to back up your data regularly.
          </p>
          <p className="text-xs text-muted-foreground mt-3">Version 1.0.0</p>
        </div>

        {/* Privacy Policy Link */}
        {onOpenPrivacy && (
          <button
            onClick={onOpenPrivacy}
            className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Privacy Policy</p>
              <p className="text-sm text-muted-foreground">
                Learn how we protect your data
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
      </motion.div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card p-6 rounded-3xl max-w-sm w-full shadow-xl border border-border"
          >
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Clear All Data?</h3>
            <p className="text-center text-muted-foreground mb-6">
              This will permanently delete all your entries, cycles, and saved
              moods. This action cannot be undone.
            </p>

              {/* Backup action inside confirmation */}
              <Button
                variant="outline"
                className="w-full mb-3"
                onClick={handleExport}
              >
                <Download className="w-4 h-4 mr-2" />
                Download backup first
              </Button>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleClearData}
                >
                  Delete All
                </Button>
              </div>
          </motion.div>
        </motion.div>
      )}

      {/* Merge Dialog */}
      {showMergeDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowMergeDialog(false);
            setPendingImport(null);
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card p-6 rounded-3xl max-w-sm w-full shadow-xl border border-border"
          >
            <h3 className="text-xl font-bold text-center mb-2">Import Options</h3>
            <p className="text-center text-muted-foreground mb-6">
              How would you like to handle existing data?
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleImport(true)}
                className="w-full flex items-center gap-4 p-4 bg-secondary rounded-xl hover:bg-secondary/80 transition-all text-left"
              >
                <Check className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Merge</p>
                  <p className="text-sm text-muted-foreground">
                    Combine with existing data
                  </p>
                </div>
              </button>
              <button
                onClick={() => handleImport(false)}
                className="w-full flex items-center gap-4 p-4 bg-secondary rounded-xl hover:bg-secondary/80 transition-all text-left"
              >
                <Upload className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Replace</p>
                  <p className="text-sm text-muted-foreground">
                    Overwrite all existing data
                  </p>
                </div>
              </button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setShowMergeDialog(false);
                  setPendingImport(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </motion.div>
    </div>
  );
}
