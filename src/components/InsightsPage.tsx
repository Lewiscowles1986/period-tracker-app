import { motion } from 'framer-motion';
import { useMemo } from 'react';
import {
  TrendingUp,
  Calendar,
  Droplet,
  Heart,
  Moon,
  Activity,
  Sparkles,
  Users,
} from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { usePeriodDataContext } from '@/contexts/PeriodDataContext';
import { SYMPTOM_LABELS, SYMPTOM_EMOJIS, Symptom, PROTECTION_LABELS, INTIMACY_EMOJIS, IntimacyRating } from '@/types/period';
import { format, parseISO, differenceInDays, subDays } from 'date-fns';
import { cn } from '@/lib/utils';

export function InsightsPage() {
  const { data, getCycleStats } = usePeriodDataContext();
  const stats = useMemo(() => getCycleStats(), [getCycleStats]);

  // Calculate mood statistics
  const moodStats = useMemo(() => {
    const entries = Object.values(data.entries).filter((e) => e.mood);
    const emojiCounts: Record<string, number> = {};

    entries.forEach((entry) => {
      if (entry.mood) {
        const key = entry.mood.emoji;
        emojiCounts[key] = (emojiCounts[key] || 0) + 1;
      }
    });

    const sorted = Object.entries(emojiCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return sorted;
  }, [data.entries]);

  // Calculate symptom statistics
  const symptomStats = useMemo(() => {
    const counts: Record<Symptom, number> = {} as Record<Symptom, number>;

    Object.values(data.entries).forEach((entry) => {
      entry.symptoms.forEach((symptom) => {
        counts[symptom] = (counts[symptom] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6) as [Symptom, number][];
  }, [data.entries]);

  // Calculate intimacy statistics
  const intimacyStats = useMemo(() => {
    const allActivities = Object.values(data.entries)
      .flatMap((entry) => entry.sexualActivity || []);
    
    if (allActivities.length === 0) return null;

    // Total activities
    const totalActivities = allActivities.length;

    // Activities in last 30 days
    const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
    const recentActivities = Object.values(data.entries)
      .filter((entry) => entry.date >= thirtyDaysAgo)
      .flatMap((entry) => entry.sexualActivity || []);

    // Average rating (if ratings exist)
    const ratedActivities = allActivities.filter((a) => a.rating);
    const avgRating = ratedActivities.length > 0
      ? ratedActivities.reduce((sum, a) => sum + (a.rating || 0), 0) / ratedActivities.length
      : null;

    // Protection usage
    const protectionCounts: Record<string, number> = {};
    allActivities.forEach((a) => {
      if (a.protection) {
        protectionCounts[a.protection] = (protectionCounts[a.protection] || 0) + 1;
      }
    });
    const topProtection = Object.entries(protectionCounts)
      .sort(([, a], [, b]) => b - a)[0];

    // Partner frequency
    const partnerCounts: Record<string, number> = {};
    allActivities.forEach((a) => {
      if (a.partner) {
        partnerCounts[a.partner] = (partnerCounts[a.partner] || 0) + 1;
      }
    });
    const topPartners = Object.entries(partnerCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    // Average duration
    const durationsWithData = allActivities.filter((a) => a.duration);
    const avgDuration = durationsWithData.length > 0
      ? Math.round(durationsWithData.reduce((sum, a) => sum + (a.duration || 0), 0) / durationsWithData.length)
      : null;

    return {
      totalActivities,
      recentActivities: recentActivities.length,
      avgRating,
      topProtection,
      topPartners,
      avgDuration,
    };
  }, [data.entries]);

  // Days until next period
  const daysUntilPeriod = useMemo(() => {
    if (!stats.predictedNextPeriod) return null;
    const days = differenceInDays(
      parseISO(stats.predictedNextPeriod),
      new Date()
    );
    return days > 0 ? days : null;
  }, [stats.predictedNextPeriod]);

  // Days until ovulation
  const daysUntilOvulation = useMemo(() => {
    if (!stats.predictedOvulation) return null;
    const days = differenceInDays(
      parseISO(stats.predictedOvulation),
      new Date()
    );
    return days >= 0 ? days : null;
  }, [stats.predictedOvulation]);

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
    <div className="flex flex-col h-full overflow-hidden">
      {/* Unified Header */}
      <AppHeader title="Insights" subtitle="Your cycle patterns and trends" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 overflow-y-auto px-4 pt-6 pb-24 space-y-6 scrollbar-hide"
      >

      {/* Ovulation Prediction Card */}
      {daysUntilOvulation !== null && (
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-phase-ovulation to-phase-ovulation/80 p-6 rounded-3xl text-white shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Ovulation in</p>
              <p className="text-4xl font-bold">
                {daysUntilOvulation === 0 ? 'Today!' : `${daysUntilOvulation} days`}
              </p>
              {stats.predictedOvulation && (
                <p className="text-white/80 text-sm">
                  {format(parseISO(stats.predictedOvulation), 'EEEE, MMM d')}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Period Prediction Card */}
      {daysUntilPeriod && !daysUntilOvulation && (
        <motion.div
          variants={itemVariants}
          className="bg-gradient-primary p-6 rounded-3xl text-white shadow-glow"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Next period in</p>
              <p className="text-4xl font-bold">{daysUntilPeriod} days</p>
              {stats.predictedNextPeriod && (
                <p className="text-white/80 text-sm">
                  Around {format(parseISO(stats.predictedNextPeriod), 'MMM d')}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Cycle Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Avg. Cycle"
          value={`${stats.averageCycleLength} days`}
          color="bg-phase-follicular/20 text-phase-follicular"
          isDefault={stats.totalCyclesTracked === 0}
          defaultHint="Default estimate"
        />
        <StatCard
          icon={<Droplet className="w-5 h-5" />}
          label="Avg. Period"
          value={`${stats.averagePeriodLength} days`}
          color="bg-phase-menstrual/20 text-phase-menstrual"
          isDefault={stats.totalCyclesTracked === 0}
          defaultHint="Default estimate"
        />
        <StatCard
          icon={<Activity className="w-5 h-5" />}
          label="Cycles Tracked"
          value={`${stats.totalCyclesTracked}`}
          color="bg-accent/20 text-accent"
          hint={stats.totalCyclesTracked === 0 ? "Log 2+ periods" : undefined}
        />
        <StatCard
          icon={<Calendar className="w-5 h-5" />}
          label="Cycle Range"
          value={
            stats.totalCyclesTracked > 0
              ? `${stats.shortestCycle}-${stats.longestCycle}`
              : '-'
          }
          color="bg-primary/20 text-primary"
          hint={stats.totalCyclesTracked === 0 ? "Needs data" : undefined}
        />
      </motion.div>

      {/* Explanation when no cycles tracked */}
      {stats.totalCyclesTracked === 0 && (
        <motion.div
          variants={itemVariants}
          className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800"
        >
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>📊 How insights work:</strong> The averages above are default estimates. 
            To see your personal stats, log at least <strong>2 separate periods</strong> (with a gap between them). 
            This creates one complete cycle to analyze.
          </p>
        </motion.div>
      )}

      {/* Fertile Window Info */}
      {stats.fertileWindowStart && (
        <motion.div
          variants={itemVariants}
          className="bg-phase-ovulation/10 p-4 rounded-2xl border border-phase-ovulation/30"
        >
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-5 h-5 text-phase-ovulation" />
            <h3 className="font-semibold">Fertile Window</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Estimated:{' '}
            <span className="font-medium text-foreground">
              {format(parseISO(stats.fertileWindowStart), 'MMM d')} -{' '}
              {format(parseISO(stats.fertileWindowEnd!), 'MMM d')}
            </span>
          </p>
          {stats.predictedOvulation && (
            <p className="text-sm text-muted-foreground">
              Ovulation:{' '}
              <span className="font-medium text-foreground">
                {format(parseISO(stats.predictedOvulation), 'MMM d')}
              </span>
            </p>
          )}
        </motion.div>
      )}

      {/* Mood Overview */}
      {moodStats.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Moon className="w-5 h-5 text-primary" />
            Top Moods
          </h3>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {moodStats.map(([emoji, count], index) => (
              <motion.div
                key={emoji}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center p-4 bg-card rounded-2xl border border-border min-w-[80px]"
              >
                <span className="text-3xl mb-2">{emoji}</span>
                <span className="text-sm font-medium">{count}×</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Symptom Overview */}
      {symptomStats.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-3">
          <h3 className="font-semibold">Common Symptoms</h3>
          <div className="grid grid-cols-2 gap-2">
            {symptomStats.map(([symptom, count]) => (
              <div
                key={symptom}
                className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border"
              >
                <span className="text-xl">{SYMPTOM_EMOJIS[symptom]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {SYMPTOM_LABELS[symptom]}
                  </p>
                  <p className="text-xs text-muted-foreground">{count} times</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Intimacy Insights */}
      {intimacyStats && (
        <motion.div variants={itemVariants} className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            Intimacy Insights
          </h3>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-card rounded-2xl border border-border">
              <p className="text-2xl font-bold">{intimacyStats.totalActivities}</p>
              <p className="text-xs text-muted-foreground">Total activities</p>
            </div>
            <div className="p-4 bg-card rounded-2xl border border-border">
              <p className="text-2xl font-bold">{intimacyStats.recentActivities}</p>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </div>
            {intimacyStats.avgRating && (
              <div className="p-4 bg-card rounded-2xl border border-border">
                <p className="text-2xl font-bold flex items-center gap-1">
                  {intimacyStats.avgRating.toFixed(1)}
                  <span className="text-lg">{INTIMACY_EMOJIS[Math.round(intimacyStats.avgRating) as IntimacyRating]}</span>
                </p>
                <p className="text-xs text-muted-foreground">Avg. rating</p>
              </div>
            )}
            {intimacyStats.avgDuration && (
              <div className="p-4 bg-card rounded-2xl border border-border">
                <p className="text-2xl font-bold">{intimacyStats.avgDuration}m</p>
                <p className="text-xs text-muted-foreground">Avg. duration</p>
              </div>
            )}
          </div>

          {/* Top Partners */}
          {intimacyStats.topPartners.length > 0 && (
            <div className="p-4 bg-card rounded-2xl border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium">Partners</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {intimacyStats.topPartners.map(([partner, count]) => (
                  <span
                    key={partner}
                    className="px-3 py-1.5 bg-secondary rounded-full text-sm"
                  >
                    {partner} <span className="text-muted-foreground">({count})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Protection Usage */}
          {intimacyStats.topProtection && (
            <div className="p-3 bg-secondary/50 rounded-xl">
              <p className="text-sm text-muted-foreground">
                Most used protection:{' '}
                <span className="font-medium text-foreground">
                  {PROTECTION_LABELS[intimacyStats.topProtection[0] as keyof typeof PROTECTION_LABELS]}
                </span>
                <span className="text-muted-foreground"> ({intimacyStats.topProtection[1]} times)</span>
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Empty State */}
      {stats.totalCyclesTracked === 0 && !intimacyStats && (
        <motion.div
          variants={itemVariants}
          className="text-center py-12 text-muted-foreground"
        >
          <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Start Tracking
          </h3>
          <p className="max-w-xs mx-auto">
            Log your period days to see cycle predictions, mood patterns, and
            health insights here.
          </p>
        </motion.div>
      )}
      </motion.div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  isDefault?: boolean;
  defaultHint?: string;
  hint?: string;
}

function StatCard({ icon, label, value, color, isDefault, defaultHint, hint }: StatCardProps) {
  return (
    <div className={cn(
      "bg-card p-4 rounded-2xl border",
      isDefault ? "border-dashed border-muted-foreground/30" : "border-border"
    )}>
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', color)}>
        {icon}
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={cn("text-xl font-bold", isDefault && "text-muted-foreground")}>{value}</p>
      {(isDefault && defaultHint) && (
        <p className="text-xs text-muted-foreground/70 mt-1">{defaultHint}</p>
      )}
      {hint && (
        <p className="text-xs text-muted-foreground/70 mt-1">{hint}</p>
      )}
    </div>
  );
}
