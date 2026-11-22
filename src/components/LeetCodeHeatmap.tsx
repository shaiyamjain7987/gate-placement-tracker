import React, { useState } from 'react';
import { generateContributionMatrix, formatHours, formatDisplayDate } from '../utils/dateUtils';
import { StudyLog, Subject } from '../types';
import { Flame, Clock, Calendar } from 'lucide-react';

interface LeetCodeHeatmapProps {
  logs: StudyLog[];
  subjects: Subject[];
  selectedSubjectId?: string;
  onSelectSubject?: (id: string) => void;
  title?: string;
}

export const LeetCodeHeatmap: React.FC<LeetCodeHeatmapProps> = ({
  logs,
  subjects,
  selectedSubjectId,
  onSelectSubject,
  title = 'Study Activity Heatmap',
}) => {
  const [weeksSpan, setWeeksSpan] = useState<number>(26); // 16, 26, 52 weeks
  const [hoveredCell, setHoveredCell] = useState<{
    date: string;
    hours: number;
    count: number;
    subjects: { name: string; hours: number; color: string }[];
    notes: string[];
    x: number;
    y: number;
  } | null>(null);

  const subjectsMap = React.useMemo(() => {
    const map: Record<string, { name: string; color: string }> = {};
    subjects.forEach((s) => {
      map[s.id] = { name: s.name, color: s.color };
    });
    return map;
  }, [subjects]);

  const { weeks, monthLabels } = React.useMemo(() => {
    return generateContributionMatrix(logs, weeksSpan, subjectsMap, selectedSubjectId);
  }, [logs, weeksSpan, subjectsMap, selectedSubjectId]);

  // Total hours in current view
  const currentTotalHours = React.useMemo(() => {
    let sum = 0;
    weeks.forEach((w) => {
      w.days.forEach((d) => {
        if (d) sum += d.hours;
      });
    });
    return Number(sum.toFixed(1));
  }, [weeks]);

  // Color mapping based on intensity for both light & dark themes
  const getCellColor = (level: number, hours: number) => {
    if (hours === 0 || level === 0) {
      return 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/50 hover:border-slate-400 dark:hover:border-slate-500';
    }
    if (level === 1) {
      return 'bg-emerald-100 dark:bg-emerald-900/90 border-emerald-300 dark:border-emerald-700/60 hover:border-emerald-500 dark:hover:border-emerald-400';
    }
    if (level === 2) {
      return 'bg-emerald-300 dark:bg-emerald-700 border-emerald-400 dark:border-emerald-500/80 hover:border-emerald-600 dark:hover:border-emerald-300';
    }
    if (level === 3) {
      return 'bg-emerald-500 dark:bg-emerald-500 border-emerald-600 dark:border-emerald-400 hover:border-emerald-700 dark:hover:border-white';
    }
    return 'bg-emerald-600 dark:bg-emerald-400 border-emerald-700 dark:border-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)] dark:shadow-[0_0_8px_rgba(52,211,153,0.6)] hover:border-emerald-800 dark:hover:border-white';
  };

  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  return (
    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-xl relative backdrop-blur-sm transition-colors duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              {title}
            </h2>
            {selectedSubjectId && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
                {subjectsMap[selectedSubjectId]?.name || 'Filtered'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {currentTotalHours} hours logged across the selected period
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onSelectSubject && (
            <select
              value={selectedSubjectId || 'all'}
              onChange={(e) => onSelectSubject(e.target.value === 'all' ? '' : e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
            >
              <option value="all">⚡ All Subjects Combined</option>
              <optgroup label="GATE Subjects">
                {subjects
                  .filter((s) => s.category === 'GATE')
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Placement Subjects">
                {subjects
                  .filter((s) => s.category === 'Placement')
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Other Subjects">
                {subjects
                  .filter((s) => s.category !== 'GATE' && s.category !== 'Placement')
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </optgroup>
            </select>
          )}

          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
            <button
              onClick={() => setWeeksSpan(16)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                weeksSpan === 16 ? 'bg-emerald-600 text-white font-medium shadow-sm' : 'hover:text-emerald-600 dark:hover:text-white'
              }`}
            >
              3M
            </button>
            <button
              onClick={() => setWeeksSpan(26)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                weeksSpan === 26 ? 'bg-emerald-600 text-white font-medium shadow-sm' : 'hover:text-emerald-600 dark:hover:text-white'
              }`}
            >
              6M
            </button>
            <button
              onClick={() => setWeeksSpan(52)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                weeksSpan === 52 ? 'bg-emerald-600 text-white font-medium shadow-sm' : 'hover:text-emerald-600 dark:hover:text-white'
              }`}
            >
              1Y
            </button>
          </div>
        </div>
      </div>

      {/* Heatmap Matrix Container */}
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="inline-block min-w-full">
          {/* Month Labels Header */}
          <div className="flex text-[11px] text-slate-500 dark:text-slate-400 mb-1.5 pl-7 select-none">
            {weeks.map((_, wIndex) => {
              const labelObj = monthLabels.find((m) => m.index === wIndex);
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

          {/* Grid: 7 Rows (Sun to Sat) */}
          <div className="flex">
            {/* Day Labels on left */}
            <div className="flex flex-col justify-between pr-2 text-[10px] text-slate-400 dark:text-slate-500 font-medium select-none py-0.5">
              {dayLabels.map((lbl, idx) => (
                <div key={idx} className="h-[15px] sm:h-[17px] leading-[15px] sm:leading-[17px] text-right">
                  {lbl}
                </div>
              ))}
            </div>

            {/* Weeks Columns */}
            <div className="flex gap-[3px]">
              {weeks.map((week, wIndex) => (
                <div key={wIndex} className="flex flex-col gap-[3px] shrink-0">
                  {week.days.map((day, dIndex) => {
                    if (!day) {
                      return (
                        <div
                          key={dIndex}
                          className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] rounded-[3px] opacity-0"
                        />
                      );
                    }

                    const isToday = day.date === formatDisplayDate(new Date().toISOString());

                    return (
                      <div
                        key={dIndex}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredCell({
                            date: day.date,
                            hours: day.hours,
                            count: day.count,
                            subjects: day.subjects,
                            notes: day.notes || [],
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          });
                        }}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] rounded-[3px] border cursor-pointer heatmap-cell transition-all ${getCellColor(
                          day.level,
                          day.hours
                        )} ${isToday ? 'ring-2 ring-emerald-500 ring-offset-1 ring-offset-white dark:ring-offset-slate-900' : ''}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Legend & Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 gap-3">
        <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>0.5h - 3.0h slider ratings</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Daily LeetCode style streak</span>
          </span>
        </div>

        {/* Intensity Legend */}
        <div className="flex items-center gap-1.5 text-[11px] select-none">
          <span>Less</span>
          <div className="w-3 h-3 rounded-[2px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"></div>
          <div className="w-3 h-3 rounded-[2px] bg-emerald-100 dark:bg-emerald-900 border border-emerald-300 dark:border-emerald-800"></div>
          <div className="w-3 h-3 rounded-[2px] bg-emerald-300 dark:bg-emerald-700 border border-emerald-400 dark:border-emerald-600"></div>
          <div className="w-3 h-3 rounded-[2px] bg-emerald-500 dark:bg-emerald-500 border border-emerald-600 dark:border-emerald-400"></div>
          <div className="w-3 h-3 rounded-[2px] bg-emerald-600 dark:bg-emerald-400 border border-emerald-700 dark:border-emerald-300 shadow-sm dark:shadow-[0_0_6px_rgba(52,211,153,0.8)]"></div>
          <span>More (3h+)</span>
        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-xl p-3 w-64 text-left transition-all backdrop-blur-md"
          style={{
            left: `${hoveredCell.x}px`,
            top: `${hoveredCell.y - 8}px`,
          }}
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {formatDisplayDate(hoveredCell.date)}
            </span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                hoveredCell.hours > 0
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {hoveredCell.hours > 0 ? formatHours(hoveredCell.hours) : 'No study logged'}
            </span>
          </div>

          {hoveredCell.subjects.length > 0 ? (
            <div className="space-y-1 mb-2">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                Subjects Studied:
              </div>
              {hoveredCell.subjects.map((sub, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: sub.color }}
                    />
                    <span className="text-slate-700 dark:text-slate-300 truncate">{sub.name}</span>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px] shrink-0 ml-2 font-bold">
                    {formatHours(sub.hours)}
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          {hoveredCell.notes.length > 0 && (
            <div className="text-[11px] text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-1.5 space-y-1 bg-slate-50 dark:bg-slate-900/50 -mx-1 px-1.5 py-1 rounded">
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Session notes:</div>
              {hoveredCell.notes.slice(0, 2).map((n, idx) => (
                <p key={idx} className="line-clamp-2 italic text-slate-600 dark:text-slate-300 text-[10px]">
                  "{n}"
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
