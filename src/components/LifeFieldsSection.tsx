import React, { useState, useEffect } from 'react';
import { LifeField, FieldLog, FieldCategory } from '../types';
import { getTodayStr, formatDisplayDate } from '../utils/dateUtils';
import { playPingSound, playChimeSound } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Compass,
  Plus,
  Clock,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Trash2,
  Calendar,
  Flame,
  Award,
  Wind,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { AddFieldModal } from './AddFieldModal';

interface LifeFieldsSectionProps {
  fields: LifeField[];
  fieldLogs: FieldLog[];
  onSaveFieldLog: (log: Omit<FieldLog, 'id' | 'timestamp'>) => void;
  onAddField: (field: Omit<LifeField, 'id' | 'createdAt'>) => void;
  onDeleteField: (id: string) => void;
}

export const LifeFieldsSection: React.FC<LifeFieldsSectionProps> = ({
  fields,
  fieldLogs,
  onSaveFieldLog,
  onAddField,
  onDeleteField,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expandedFieldId, setExpandedFieldId] = useState<string | null>(null);
  const [selectedHeatmapFieldId, setSelectedHeatmapFieldId] = useState<string>('');
  const [weeksSpan, setWeeksSpan] = useState<number>(26);

  // Per-field slider state (minutes)
  const [sliderMinutesMap, setSliderMinutesMap] = useState<Record<string, number>>({});
  const [fieldNotesMap, setFieldNotesMap] = useState<Record<string, string>>({});

  // Interactive Breathwork Widget State
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Hold Empty'>('Inhale');
  const [breathSecondsLeft, setBreathSecondsLeft] = useState(4);
  const [breathCycles, setBreathCycles] = useState(0);

  const todayStr = getTodayStr();

  // Breathwork timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isBreathingActive) {
      timer = setInterval(() => {
        setBreathSecondsLeft((prev) => {
          if (prev <= 1) {
            // Cycle phase
            setBreathPhase((curPhase) => {
              if (curPhase === 'Inhale') return 'Hold';
              if (curPhase === 'Hold') return 'Exhale';
              if (curPhase === 'Exhale') return 'Hold Empty';
              setBreathCycles((c) => c + 1);
              return 'Inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isBreathingActive]);

  // Total stats
  const stats = React.useMemo(() => {
    let totalMinutes = 0;
    const dateMap: Record<string, number> = {};

    fieldLogs.forEach((log) => {
      totalMinutes += log.minutes;
      dateMap[log.date] = (dateMap[log.date] || 0) + log.minutes;
    });

    const activeDays = Object.keys(dateMap).length;
    return {
      totalHours: (totalMinutes / 60).toFixed(1),
      totalMinutes,
      activeDays,
    };
  }, [fieldLogs]);

  // Matrix generation for the Life Fields LeetCode Heatmap
  const matrix = React.useMemo(() => {
    const dateMap: Record<string, { minutes: number; fields: string[]; notes: string[] }> = {};
    const fieldMap: Record<string, string> = {};
    fields.forEach((f) => (fieldMap[f.id] = f.name));

    fieldLogs.forEach((log) => {
      if (selectedHeatmapFieldId && log.fieldId !== selectedHeatmapFieldId) return;

      if (!dateMap[log.date]) {
        dateMap[log.date] = { minutes: 0, fields: [], notes: [] };
      }
      dateMap[log.date].minutes += log.minutes;
      const fName = fieldMap[log.fieldId];
      if (fName && !dateMap[log.date].fields.includes(fName)) {
        dateMap[log.date].fields.push(fName);
      }
      if (log.notes && log.notes.trim()) {
        dateMap[log.date].notes.push(log.notes);
      }
    });

    const today = new Date();
    const dayOfWeekToday = today.getDay();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + (6 - dayOfWeekToday));

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - (weeksSpan * 7 - 1));

    const weeks: { days: any[]; monthLabel?: string }[] = [];
    const monthLabels: { label: string; index: number }[] = [];
    let currentMonth = -1;

    let iter = new Date(startDate);

    for (let w = 0; w < weeksSpan; w++) {
      const weekDays: any[] = [];
      let weekMonthName = '';

      for (let d = 0; d < 7; d++) {
        const y = iter.getFullYear();
        const m = String(iter.getMonth() + 1).padStart(2, '0');
        const dt = String(iter.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${dt}`;
        const month = iter.getMonth();

        if (month !== currentMonth && iter.getDate() <= 7) {
          currentMonth = month;
          weekMonthName = iter.toLocaleDateString('en-US', { month: 'short' });
          monthLabels.push({ label: weekMonthName, index: w });
        }

        const data = dateMap[dateStr];
        const mins = data ? data.minutes : 0;
        const isFuture = iter > today;

        let level = 0;
        if (mins > 0 && mins <= 20) level = 1;
        else if (mins > 20 && mins <= 45) level = 2;
        else if (mins > 45 && mins <= 75) level = 3;
        else if (mins > 75) level = 4;

        weekDays.push({
          date: dateStr,
          dayOfWeek: iter.getDay(),
          minutes: isFuture ? 0 : mins,
          level: isFuture ? 0 : level,
          fields: isFuture ? [] : data?.fields || [],
          notes: isFuture ? [] : data?.notes || [],
        });

        iter.setDate(iter.getDate() + 1);
      }

      weeks.push({
        days: weekDays,
        monthLabel: weekMonthName || undefined,
      });
    }

    return { weeks, monthLabels };
  }, [fieldLogs, fields, weeksSpan, selectedHeatmapFieldId]);

  const getHeatmapColor = (level: number) => {
    if (level === 0) {
      return 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60 hover:border-slate-400 dark:hover:border-slate-500';
    }
    if (level === 1) {
      return 'bg-indigo-100 dark:bg-indigo-950 border-indigo-300 dark:border-indigo-800 hover:border-indigo-500 dark:hover:border-indigo-400';
    }
    if (level === 2) {
      return 'bg-indigo-300 dark:bg-indigo-800 border-indigo-400 dark:border-indigo-600 hover:border-indigo-600 dark:hover:border-indigo-300';
    }
    if (level === 3) {
      return 'bg-indigo-500 dark:bg-indigo-600 border-indigo-600 dark:border-indigo-400 hover:border-indigo-700 dark:hover:border-indigo-200';
    }
    return 'bg-indigo-600 dark:bg-indigo-400 border-indigo-700 dark:border-indigo-300 shadow-sm dark:shadow-[0_0_8px_rgba(129,140,248,0.7)] hover:border-white';
  };

  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  const filteredFields = fields.filter((f) => {
    if (selectedCategory === 'all') return true;
    return f.category === selectedCategory;
  });

  const handleMarkExplored = (field: LifeField) => {
    const mins = sliderMinutesMap[field.id] || 30;
    const notes = fieldNotesMap[field.id] || '';

    onSaveFieldLog({
      fieldId: field.id,
      date: todayStr,
      minutes: mins,
      notes: notes.trim() || undefined,
    });

    playPingSound();
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.8 },
      colors: [field.color, '#8b5cf6', '#0284c7', '#f43f5e', '#14b8a6'],
    });
  };

  const formatMinsDisplay = (mins: number) => {
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return m > 0 ? `${h}h ${m}m` : `${h} hr`;
    }
    return `${mins} mins`;
  };

  const getSliderRatingDescription = (mins: number) => {
    switch (mins) {
      case 15:
        return { label: 'Flash Read / Article', emoji: '⚡' };
      case 30:
        return { label: 'Podcast / Explainer Video', emoji: '🎧' };
      case 45:
        return { label: 'Deep Concept Study', emoji: '🔍' };
      case 60:
        return { label: 'Book Chapter & Notes', emoji: '📖' };
      case 90:
        return { label: 'Intensive Deep Dive', emoji: '🚀' };
      case 120:
        return { label: 'Master Exploration Marathon', emoji: '👑' };
      default:
        return { label: 'Exploration Session', emoji: '📚' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-xl backdrop-blur-sm transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
                <Compass className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Life Knowledge & Multidisciplinary Hub
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Broaden your worldview beyond engineering: Neuroscience, Geopolitics, Psychology, Communication, Relationships, Breathwork & Game Theory
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Field</span>
          </button>
        </div>

        {/* Quick Stats Pill Row */}
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
            <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span><strong>{stats.totalHours} hrs</strong> Total Explored</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <BookOpen className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span><strong>{fields.length}</strong> Fields Tracked</span>
          </span>
          <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
            <Flame className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span><strong>{stats.activeDays}</strong> Active Learning Days</span>
          </span>
        </div>
      </div>

      {/* Interactive Breathwork Exercise Widget (Box Breathing Guide) */}
      <div className="bg-gradient-to-r from-teal-900/40 via-slate-900/70 to-indigo-900/40 border border-teal-500/30 dark:border-teal-500/30 rounded-2xl p-5 shadow-lg backdrop-blur-sm relative overflow-hidden text-slate-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 shrink-0">
              <Wind className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                  🫁 Quick Breathwork Reset: Box Breathing (4-4-4-4)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-700 font-semibold">
                  Navy SEAL Calm
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Reset your nervous system between long study sessions. Inhale 4s • Hold 4s • Exhale 4s • Hold Empty 4s. Lowers cortisol in 2 minutes.
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-teal-200">
                <span>Completed Cycles: <strong className="font-mono text-white">{breathCycles}</strong></span>
                <span>•</span>
                <span>Current Phase: <strong className="text-teal-300 font-bold">{isBreathingActive ? breathPhase : 'Ready'}</strong></span>
              </div>
            </div>
          </div>

          {/* Visual Breathing Pacer Circle */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div
                className={`absolute inset-0 rounded-full border-2 border-teal-400/80 transition-all duration-1000 ${
                  isBreathingActive
                    ? breathPhase === 'Inhale'
                      ? 'scale-110 bg-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.6)]'
                      : breathPhase === 'Hold' || breathPhase === 'Hold Empty'
                      ? 'scale-100 bg-teal-500/30'
                      : 'scale-75 bg-teal-500/10'
                    : 'scale-90 bg-slate-800/40'
                }`}
              />
              <div className="relative text-center z-10 font-mono">
                <span className="text-2xl font-bold text-white">
                  {isBreathingActive ? breathSecondsLeft : '4s'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => {
                  if (!isBreathingActive) {
                    playChimeSound();
                    setIsBreathingActive(true);
                  } else {
                    setIsBreathingActive(false);
                  }
                }}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                  isBreathingActive
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-teal-500 hover:bg-teal-400 text-slate-950'
                }`}
              >
                {isBreathingActive ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 ml-0.5" />
                    <span>Start Breathing</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsBreathingActive(false);
                  setBreathPhase('Inhale');
                  setBreathSecondsLeft(4);
                  setBreathCycles(0);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-slate-300 text-xs flex items-center justify-center gap-1 cursor-pointer"
                title="Reset Cycle Counter"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* LeetCode-Style Activity Heatmap for Knowledge Fields */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-xl backdrop-blur-sm transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Curiosity & Broad Learning Matrix
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Visual contribution graph of your reading, podcasts, and deep dives across life fields
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedHeatmapFieldId}
              onChange={(e) => setSelectedHeatmapFieldId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="">✨ All Life Fields Combined</option>
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.icon} {f.name}
                </option>
              ))}
            </select>

            <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
              <button
                onClick={() => setWeeksSpan(16)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  weeksSpan === 16 ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'hover:text-indigo-600 dark:hover:text-white'
                }`}
              >
                3M
              </button>
              <button
                onClick={() => setWeeksSpan(26)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  weeksSpan === 26 ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'hover:text-indigo-600 dark:hover:text-white'
                }`}
              >
                6M
              </button>
              <button
                onClick={() => setWeeksSpan(52)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  weeksSpan === 52 ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'hover:text-indigo-600 dark:hover:text-white'
                }`}
              >
                1Y
              </button>
            </div>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2 scrollbar-thin">
          <div className="inline-block min-w-full">
            <div className="flex text-[11px] text-slate-500 dark:text-slate-400 mb-1.5 pl-7 select-none">
              {matrix.weeks.map((_, wIndex) => {
                const labelObj = matrix.monthLabels.find((m) => m.index === wIndex);
                return (
                  <div key={wIndex} className="w-[15px] sm:w-[17px] mr-[3px] text-left shrink-0">
                    {labelObj ? (
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{labelObj.label}</span>
                    ) : (
                      <span>&nbsp;</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex">
              <div className="flex flex-col justify-between pr-2 text-[10px] text-slate-400 dark:text-slate-500 font-medium select-none py-0.5">
                {dayLabels.map((lbl, idx) => (
                  <div key={idx} className="h-[15px] sm:h-[17px] leading-[15px] sm:leading-[17px] text-right">
                    {lbl}
                  </div>
                ))}
              </div>

              <div className="flex gap-[3px]">
                {matrix.weeks.map((week, wIndex) => (
                  <div key={wIndex} className="flex flex-col gap-[3px] shrink-0">
                    {week.days.map((day, dIndex) => (
                      <div
                        key={dIndex}
                        title={
                          day && day.minutes > 0
                            ? `${day.date}: ${formatMinsDisplay(day.minutes)} (${day.fields.join(', ')})`
                            : undefined
                        }
                        className={`w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] rounded-[3px] border cursor-pointer heatmap-cell transition-all ${getHeatmapColor(
                          day.level
                        )}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <span>Track 15m to 2h sessions of reading, documentaries or podcasts</span>
          <div className="flex items-center gap-1.5 text-[11px] select-none">
            <span>0m</span>
            <div className="w-3 h-3 rounded-[2px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"></div>
            <div className="w-3 h-3 rounded-[2px] bg-indigo-100 dark:bg-indigo-950 border border-indigo-300 dark:border-indigo-800"></div>
            <div className="w-3 h-3 rounded-[2px] bg-indigo-300 dark:bg-indigo-800 border border-indigo-400 dark:border-indigo-600"></div>
            <div className="w-3 h-3 rounded-[2px] bg-indigo-500 dark:bg-indigo-600 border border-indigo-600 dark:border-indigo-400"></div>
            <div className="w-3 h-3 rounded-[2px] bg-indigo-600 dark:bg-indigo-400 border border-indigo-700 dark:border-indigo-300 shadow-sm dark:shadow-[0_0_6px_rgba(129,140,248,0.8)]"></div>
            <span>75m+</span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>Explore Knowledge Fields</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
            {filteredFields.length}
          </span>
        </h3>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {[
            'all',
            'Cognitive & Mind',
            'World & Systems',
            'Human Dynamics',
            'Body & Vitality',
            'Strategic Thinking',
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {cat === 'all' ? 'All Fields' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFields.map((field) => {
          const currentMins = sliderMinutesMap[field.id] || 30;
          const currentNotes = fieldNotesMap[field.id] || '';
          const ratingInfo = getSliderRatingDescription(currentMins);
          const isExpanded = expandedFieldId === field.id;

          const todayLog = fieldLogs.find(
            (l) => l.fieldId === field.id && l.date === todayStr
          );

          const totalFieldLogs = fieldLogs.filter((l) => l.fieldId === field.id);
          const totalFieldMins = totalFieldLogs.reduce((acc, curr) => acc + curr.minutes, 0);

          return (
            <div
              key={field.id}
              className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl mt-0.5">{field.icon}</span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {field.name}
                        </h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {field.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {field.description}
                      </p>
                    </div>
                  </div>

                  {!['field-neuroscience', 'field-geopolitics', 'field-psychology', 'field-communication', 'field-relationships', 'field-breathwork', 'field-gametheory'].includes(field.id) && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ${field.name}?`)) {
                          onDeleteField(field.id);
                        }
                      }}
                      className="text-slate-400 hover:text-red-500 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      title="Delete Field"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Status Badge */}
                <div className="my-3">
                  {todayLog ? (
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-800 dark:text-indigo-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span>
                          Explored Today: <strong className="font-mono">{formatMinsDisplay(todayLog.minutes)}</strong>
                        </span>
                      </div>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">Done ✓</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                      <span>Not explored today yet</span>
                      <span className="font-mono text-[11px]">
                        Total: {formatMinsDisplay(totalFieldMins)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Slider & Action */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1">
                      <span>{ratingInfo.emoji}</span>
                      <span>{ratingInfo.label}</span>
                    </span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {formatMinsDisplay(currentMins)}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="15"
                    max="120"
                    step="15"
                    value={currentMins}
                    onChange={(e) =>
                      setSliderMinutesMap((prev) => ({
                        ...prev,
                        [field.id]: parseInt(e.target.value),
                      }))
                    }
                    className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                    <span>15m</span>
                    <span>30m</span>
                    <span>45m</span>
                    <span>60m</span>
                    <span>90m</span>
                    <span>120m</span>
                  </div>

                  {/* Optional Takeaway Notes */}
                  <input
                    type="text"
                    placeholder="Key takeaway / book / podcast note (optional)..."
                    value={currentNotes}
                    onChange={(e) =>
                      setFieldNotesMap((prev) => ({
                        ...prev,
                        [field.id]: e.target.value,
                      }))
                    }
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />

                  <button
                    onClick={() => handleMarkExplored(field)}
                    className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {todayLog ? 'Update Session' : 'Mark Explored Today'} ({formatMinsDisplay(currentMins)})
                    </span>
                  </button>
                </div>

                {/* Expand Accordion for Topics & Recommended Books */}
                <button
                  onClick={() =>
                    setExpandedFieldId(isExpanded ? null : field.id)
                  }
                  className="w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-medium transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Core Topics & Best Resources</span>
                  </span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {isExpanded && (
                  <div className="pt-2 space-y-3 animate-in fade-in duration-200">
                    {/* Core Topics Checklist */}
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                        Core Concepts to Master:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {field.coreTopics.map((topic, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                          >
                            • {topic}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Recommended Resources */}
                    {field.recommendedResources && field.recommendedResources.length > 0 && (
                      <div className="border-t border-slate-100 dark:border-slate-800 pt-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
                          Recommended Books & Podcasts:
                        </span>
                        <div className="space-y-1">
                          {field.recommendedResources.map((res, idx) => (
                            <div
                              key={idx}
                              className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5"
                            >
                              <span className="text-amber-500">📖</span>
                              <span>{res}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Field Modal */}
      <AddFieldModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddField={onAddField}
      />
    </div>
  );
};
