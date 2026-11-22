import React from 'react';
import { StudyLog, Subject } from '../types';
import { calculateStudyStats, formatHours } from '../utils/dateUtils';
import { Flame, Clock, PieChart, Award } from 'lucide-react';

interface StatsOverviewProps {
  logs: StudyLog[];
  subjects: Subject[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ logs, subjects }) => {
  const stats = React.useMemo(() => calculateStudyStats(logs), [logs]);

  // Breakdown of hours by category
  const categoryHours = React.useMemo(() => {
    const subCatMap: Record<string, string> = {};
    subjects.forEach((s) => (subCatMap[s.id] = s.category));

    const counts: Record<string, number> = {
      GATE: 0,
      Placement: 0,
      'Core CS': 0,
      Aptitude: 0,
      Other: 0,
    };

    logs.forEach((l) => {
      const cat = subCatMap[l.subjectId] || 'Other';
      counts[cat] = (counts[cat] || 0) + l.hours;
    });

    return counts;
  }, [logs, subjects]);

  const totalCatHours =
    (categoryHours.GATE || 0) +
    (categoryHours.Placement || 0) +
    (categoryHours['Core CS'] || 0) +
    (categoryHours.Aptitude || 0) +
    (categoryHours.Other || 0);

  const gatePct = totalCatHours > 0 ? Math.round(((categoryHours.GATE || 0) / totalCatHours) * 100) : 0;
  const placementPct = totalCatHours > 0 ? Math.round(((categoryHours.Placement || 0) / totalCatHours) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Card 1: Today's Hours */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm dark:shadow-lg backdrop-blur-sm relative overflow-hidden transition-colors duration-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Today's Logged
          </span>
          <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            <Clock className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-mono font-extrabold text-slate-900 dark:text-slate-100">
            {formatHours(stats.todayHours)}
          </span>
        </div>
        <div className="mt-2 flex items-center text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
          <span>{stats.todayHours > 0 ? 'Study target active for today' : 'Ready to start your first session'}</span>
        </div>
      </div>

      {/* Card 2: LeetCode Streak */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm dark:shadow-lg backdrop-blur-sm relative overflow-hidden transition-colors duration-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Current Streak
          </span>
          <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
            <Flame className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-mono font-extrabold text-amber-600 dark:text-amber-400">
            {stats.currentStreak}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">days in a row</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
          Max Streak: <strong className="text-slate-800 dark:text-slate-200 font-mono">{stats.maxStreak} days</strong>
        </div>
      </div>

      {/* Card 3: Total Active Days & Hours */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm dark:shadow-lg backdrop-blur-sm relative overflow-hidden transition-colors duration-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Study Hours
          </span>
          <span className="p-2 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20">
            <Award className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-mono font-extrabold text-sky-600 dark:text-sky-300">
            {stats.totalHours}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">hrs</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
          Across <strong className="text-slate-800 dark:text-slate-200 font-mono">{stats.totalActiveDays}</strong> active preparation days
        </div>
      </div>

      {/* Card 4: GATE vs Placement Balance */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm dark:shadow-lg backdrop-blur-sm relative overflow-hidden transition-colors duration-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            GATE vs Placement
          </span>
          <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
            <PieChart className="w-4 h-4" />
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs font-mono">
          <span className="text-blue-600 dark:text-blue-400 font-bold">GATE: {gatePct}%</span>
          <span className="text-rose-600 dark:text-rose-400 font-bold">Placement: {placementPct}%</span>
        </div>

        {/* Dual Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full mt-2.5 flex overflow-hidden">
          <div className="bg-blue-500 h-full transition-all" style={{ width: `${gatePct}%` }} />
          <div className="bg-rose-500 h-full transition-all" style={{ width: `${placementPct}%` }} />
        </div>

        <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
          <span>{Number((categoryHours.GATE || 0).toFixed(1))}h GATE</span>
          <span>{Number((categoryHours.Placement || 0).toFixed(1))}h Placement</span>
        </div>
      </div>
    </div>
  );
};
