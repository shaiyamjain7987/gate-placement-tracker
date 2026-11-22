import React, { useState } from 'react';
import { Subject, StudyLog } from '../types';
import { formatHours, generateContributionMatrix } from '../utils/dateUtils';
import { CheckCircle2, Clock, Calendar, ChevronDown, ChevronUp, Flame, BookOpen, Trash2 } from 'lucide-react';

interface SubjectCardProps {
  subject: Subject;
  logs: StudyLog[];
  todayLog?: StudyLog;
  onOpenLogModal: (subject: Subject) => void;
  onQuickMark: (subject: Subject, hours: number) => void;
  onDeleteSubject: (subjectId: string) => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  logs,
  todayLog,
  onOpenLogModal,
  onQuickMark,
  onDeleteSubject,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [quickSliderHours, setQuickSliderHours] = useState<number>(todayLog?.hours || 1.5);

  const subjectLogs = logs.filter((l) => l.subjectId === subject.id);
  const totalHours = Number(
    subjectLogs.reduce((acc, curr) => acc + curr.hours, 0).toFixed(1)
  );
  const totalSessions = subjectLogs.length;

  // Mini LeetCode heatmap for this specific subject (last 16 weeks)
  const miniMatrix = React.useMemo(() => {
    const subjectsMap = { [subject.id]: { name: subject.name, color: subject.color } };
    return generateContributionMatrix(subjectLogs, 16, subjectsMap, subject.id);
  }, [subjectLogs, subject]);

  const getCellColor = (level: number, hours: number) => {
    if (hours === 0 || level === 0) return 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60';
    if (level === 1) return 'bg-emerald-100 dark:bg-emerald-900 border-emerald-300 dark:border-emerald-700';
    if (level === 2) return 'bg-emerald-300 dark:bg-emerald-700 border-emerald-400 dark:border-emerald-500';
    if (level === 3) return 'bg-emerald-500 dark:bg-emerald-500 border-emerald-600 dark:border-emerald-400';
    return 'bg-emerald-600 dark:bg-emerald-400 border-emerald-700 dark:border-emerald-300 shadow-sm dark:shadow-[0_0_6px_rgba(52,211,153,0.7)]';
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'GATE':
        return 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Placement':
        return 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'Core CS':
        return 'bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
      case 'Aptitude':
        return 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between group">
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            <span
              className="w-3.5 h-3.5 rounded-full mt-1 shrink-0 ring-4 ring-slate-100 dark:ring-slate-800 shadow-sm"
              style={{ backgroundColor: subject.color }}
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {subject.name}
                </h3>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryBadge(
                    subject.category
                  )}`}
                >
                  {subject.category}
                </span>
              </div>
              {subject.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {subject.description}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              if (window.confirm(`Delete "${subject.name}" and its logs?`)) {
                onDeleteSubject(subject.id);
              }
            }}
            title="Delete subject"
            className="text-slate-400 hover:text-red-500 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Total Studied</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {totalHours} hrs
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Total Sessions</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              {totalSessions} days
            </span>
          </div>
        </div>

        {/* Today's status alert */}
        <div className="mb-4">
          {todayLog ? (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  Done Today: <strong className="font-mono">{formatHours(todayLog.hours)}</strong>
                </span>
              </div>
              <button
                onClick={() => onOpenLogModal(subject)}
                className="text-[11px] underline hover:text-emerald-950 dark:hover:text-emerald-200 font-medium cursor-pointer"
              >
                Edit
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/90 text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Not studied today yet
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Target: {subject.targetDailyHours}h
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card Actions */}
      <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800/80">
        {/* Quick Slider & Button */}
        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Rating Slider (0.5 - 3h):</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {formatHours(quickSliderHours)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.5"
              value={quickSliderHours}
              onChange={(e) => setQuickSliderHours(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <button
              onClick={() => onQuickMark(subject, quickSliderHours)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white dark:text-slate-950 font-bold text-xs active:scale-95 transition-all cursor-pointer shadow-sm shrink-0"
            >
              {todayLog ? 'Update' : 'Mark Done'}
            </button>
          </div>
        </div>

        {/* Action Buttons: Full Dialog & Heatmap Toggle */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => onOpenLogModal(subject)}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Full Log Modal</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="py-2 px-3 rounded-xl bg-slate-100/70 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
            title="Toggle LeetCode Heatmap for this subject"
          >
            <span>Heatmap</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Collapsible Subject-Specific LeetCode Heatmap */}
        {isExpanded && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 animate-in fade-in duration-200">
            <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                LeetCode Matrix (Past 16 Weeks):
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">{subjectLogs.length} sessions</span>
            </div>

            <div className="overflow-x-auto pb-1 scrollbar-thin">
              <div className="flex gap-[3px] py-1">
                {miniMatrix.weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-[3px]">
                    {week.days.map((day, dIdx) => (
                      <div
                        key={dIdx}
                        title={
                          day && day.hours > 0
                            ? `${day.date}: ${formatHours(day.hours)}`
                            : undefined
                        }
                        className={`w-3 h-3 rounded-[2px] border ${
                          day
                            ? getCellColor(day.level, day.hours)
                            : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800/40'
                        }`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Syllabus tags if any */}
            {subject.syllabus && subject.syllabus.length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/60">
                <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-sky-600 dark:text-sky-400" /> Key Topics:
                </div>
                <div className="flex flex-wrap gap-1">
                  {subject.syllabus.slice(0, 4).map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
